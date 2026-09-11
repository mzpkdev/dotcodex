import { createHash } from 'node:crypto';
import { marked } from 'marked';

export interface Section {
  id: string;
  title: string;
  level: number;
  parentId?: string;
  content: string;
}

export interface DocLink {
  id: string;
  title: string;
  url: string;
  parentId?: string;
}

export interface ParsedDocument {
  url: string;
  sections: Section[];
  links: DocLink[];
}

export interface SearchResult {
  id: string;
  title: string;
  kind: 'section' | 'link';
  score: number;
  snippet: string;
  url?: string;
}

type TokenLike = {
  type?: unknown;
  raw?: unknown;
  text?: unknown;
  depth?: unknown;
  href?: unknown;
  tokens?: unknown;
  [key: string]: unknown;
};

type MutableSection = Section & { contentParts: string[] };

const IGNORED_LINK_TOKENS = new Set(['code', 'codespan', 'image']);
const MAX_SNIPPET_LENGTH = 180;
const MAX_SECTION_ID_LENGTH = 80;

/** Parse Markdown into direct section content and resolved Markdown links. */
export function parseDocument(markdown: string, url: string): ParsedDocument {
  const root: MutableSection = {
    id: 'root',
    title: 'Overview',
    level: 0,
    content: '',
    contentParts: [],
  };
  const sections: MutableSection[] = [root];
  const links: DocLink[] = [];
  const usedSectionIds = new Set([root.id]);
  const seenLinkUrls = new Set<string>();
  const stack: MutableSection[] = [root];

  const tokens = marked.lexer(markdown) as unknown as TokenLike[];
  for (const token of tokens) {
    if (token.type === 'heading' && typeof token.depth === 'number') {
      while (stack.length > 1 && stack.at(-1)!.level >= token.depth) {
        stack.pop();
      }

      const title = inlineText(token).trim() || 'Untitled section';
      const section: MutableSection = {
        id: uniqueSectionId(title, usedSectionIds),
        title,
        level: token.depth,
        parentId: stack.at(-1)!.id,
        content: '',
        contentParts: [],
      };
      sections.push(section);
      stack.push(section);
      collectLinks(token, url, section.id, links, seenLinkUrls);
      continue;
    }

    const current = stack.at(-1)!;
    const raw = typeof token.raw === 'string' ? token.raw.trim() : '';
    if (raw) current.contentParts.push(raw);
    collectLinks(token, url, current.id, links, seenLinkUrls);
  }

  return {
    url,
    sections: sections.map(({ contentParts, ...section }) => ({
      ...section,
      content: contentParts.join('\n\n'),
    })),
    links,
  };
}

/** Rank literal keyword matches without requiring an embedding index. */
export function searchDocument(doc: ParsedDocument, query: string, limit = 10): SearchResult[] {
  const terms = words(query);
  if (terms.length === 0) throw new Error('Search query must not be empty.');

  const sectionsById = new Map(doc.sections.map((section) => [section.id, section]));
  const results: SearchResult[] = [];
  for (const section of doc.sections) {
    const title = sectionTitleContext(section, sectionsById);
    const score = matchScore(words(title), words(section.content), terms);
    if (score > 0) {
      results.push({
        id: section.id,
        title,
        kind: 'section',
        score,
        snippet: snippet(section.content || title, terms),
      });
    }
  }

  for (const link of doc.links) {
    const score = matchScore(words(link.title), words(link.url), terms);
    if (score > 0) {
      results.push({
        id: link.id,
        title: link.title,
        kind: 'link',
        score,
        snippet: snippet(`${link.title} — ${link.url}`, terms),
        url: link.url,
      });
    }
  }

  const maximum = Number.isFinite(limit) ? Math.max(0, Math.floor(limit)) : 10;
  return results
    .sort((left, right) => right.score - left.score || left.id.localeCompare(right.id))
    .slice(0, maximum);
}

function uniqueSectionId(title: string, used: Set<string>): string {
  const base = slug(title);
  let candidate = base;
  let suffix = 2;
  while (used.has(candidate)) {
    const ending = `-${suffix}`;
    candidate = `${base.slice(0, MAX_SECTION_ID_LENGTH - ending.length)}${ending}`;
    suffix += 1;
  }
  used.add(candidate);
  return candidate;
}

function slug(value: string): string {
  return (
    value
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/<[^>]*>/g, '')
      .replace(/[^\p{L}\p{N}\s-]/gu, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, MAX_SECTION_ID_LENGTH) || 'section'
  );
}

function inlineText(token: TokenLike): string {
  if (Array.isArray(token.tokens)) {
    const text = token.tokens
      .filter(isToken)
      .map((child) => inlineText(child))
      .join('');
    if (text) return text;
  }
  return typeof token.text === 'string' ? token.text : '';
}

function collectLinks(
  value: unknown,
  baseUrl: string,
  parentId: string,
  links: DocLink[],
  seenUrls: Set<string>,
): void {
  if (Array.isArray(value)) {
    for (const item of value) collectLinks(item, baseUrl, parentId, links, seenUrls);
    return;
  }
  if (!isToken(value) || IGNORED_LINK_TOKENS.has(String(value.type))) return;

  if (value.type === 'link' && typeof value.href === 'string') {
    const resolved = resolveHttpUrl(value.href, baseUrl);
    if (resolved && !seenUrls.has(resolved)) {
      seenUrls.add(resolved);
      links.push({
        id: `link-${hash(resolved)}`,
        title: inlineText(value).trim() || resolved,
        url: resolved,
        parentId,
      });
    }
  }

  for (const [key, child] of Object.entries(value)) {
    if (key !== 'raw' && key !== 'text' && key !== 'href') {
      collectLinks(child, baseUrl, parentId, links, seenUrls);
    }
  }
}

function resolveHttpUrl(href: string, baseUrl: string): string | undefined {
  try {
    const resolved = new URL(href, baseUrl);
    const page = new URL(resolved);
    page.hash = '';
    const base = new URL(baseUrl);
    base.hash = '';
    if (resolved.hash && page.href === base.href) return undefined;
    return resolved.protocol === 'http:' || resolved.protocol === 'https:'
      ? resolved.href
      : undefined;
  } catch {
    return undefined;
  }
}

function hash(value: string): string {
  return createHash('sha256').update(value).digest('hex').slice(0, 16);
}

function sectionTitleContext(section: Section, sectionsById: ReadonlyMap<string, Section>): string {
  const titles = [section.title];
  let parentId = section.parentId;
  while (parentId && parentId !== 'root') {
    const parent = sectionsById.get(parentId);
    if (!parent) break;
    titles.push(parent.title);
    parentId = parent.parentId;
  }
  return titles.reverse().join(' › ');
}

function matchScore(title: string[], content: string[], terms: string[]): number {
  let score = 0;
  let matchedTerms = 0;
  for (const term of terms) {
    const titleMatches = countMatches(title, term);
    const contentMatches = countMatches(content, term);
    if (titleMatches + contentMatches > 0) matchedTerms += 1;
    if (titleMatches > 0) score += 50 + Math.min(titleMatches, 2) * 5;
    if (contentMatches > 0) score += 6 + Math.min(contentMatches, 3) * 2;
  }
  return score + matchedTerms * 6;
}

function countMatches(tokens: string[], term: string): number {
  const stemmedTerm = stem(term);
  return tokens.filter((token) => stem(token) === stemmedTerm).length;
}

function snippet(value: string, terms: string[]): string {
  const compact = stripHtml(value).replace(/\s+/g, ' ').trim();
  if (compact.length <= MAX_SNIPPET_LENGTH) return compact;

  const lower = compact.toLocaleLowerCase();
  const index =
    terms
      .map((term) => lower.indexOf(term))
      .filter((position) => position >= 0)
      .sort((left, right) => left - right)[0] ?? 0;
  const start = Math.max(0, index - Math.floor((MAX_SNIPPET_LENGTH - 2) / 3));
  const end = Math.min(compact.length, start + MAX_SNIPPET_LENGTH - 2);
  return `${start > 0 ? '…' : ''}${compact.slice(start, end)}${end < compact.length ? '…' : ''}`;
}

function words(value: string): string[] {
  return (
    stripHtml(value)
      .toLocaleLowerCase()
      .match(/\$?[\p{L}\p{N}]+/gu) ?? []
  );
}

function stem(word: string): string {
  const value = word.startsWith('$') ? word.slice(1) : word;
  if (value.length > 4 && value.endsWith('ies')) return `${value.slice(0, -3)}y`;
  if (/(?:sses|xes|zes|ches|shes)$/.test(value)) return value.slice(0, -2);
  if (value.length > 3 && value.endsWith('s') && !value.endsWith('ss')) return value.slice(0, -1);
  return value;
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, ' ');
}

function isToken(value: unknown): value is TokenLike {
  return typeof value === 'object' && value !== null;
}
