import { defineCommand, effect } from 'cmdore';

import { url } from '../arguments/index.ts';
import type { ParsedDocument } from '../document.ts';
import { loadDocument } from '../fetch.ts';
import { MAX_TITLE_LENGTH, MAX_URL_LENGTH, output, page, truncate, type Page } from '../output.ts';
import { offset, refresh, treeLimit } from '../options/index.ts';

type TreeEntry = {
  id: string;
  kind: 'section' | 'link';
  title: string;
  level: number;
  parentId?: string;
  url?: string;
  truncated?: true;
};

export type TreeResult = {
  command: 'tree';
  url: string;
  root: { title: string };
  entries: TreeEntry[];
  page: Page;
};

const treeEntries = (document: ParsedDocument): TreeEntry[] => {
  const sectionLevels = new Map(document.sections.map((section) => [section.id, section.level]));
  const linksByParent = new Map<string | undefined, ParsedDocument['links']>();

  for (const link of document.links) {
    const links = linksByParent.get(link.parentId) ?? [];
    links.push(link);
    linksByParent.set(link.parentId, links);
  }

  const asLink = (link: ParsedDocument['links'][number]): TreeEntry => {
    const title = truncate(link.title, MAX_TITLE_LENGTH);
    const url = truncate(link.url, MAX_URL_LENGTH);

    return {
      id: link.id,
      kind: 'link',
      title: title.value,
      level: (link.parentId === undefined ? 0 : (sectionLevels.get(link.parentId) ?? 0)) + 1,
      url: url.value,
      ...(link.parentId === undefined ? {} : { parentId: link.parentId }),
      ...(title.truncated || url.truncated ? { truncated: true as const } : {}),
    };
  };

  const entries: TreeEntry[] = [];
  const seen = new Set<string>();

  for (const section of document.sections) {
    const title = truncate(section.title, MAX_TITLE_LENGTH);
    entries.push({
      id: section.id,
      kind: 'section',
      title: title.value,
      level: section.level,
      ...(section.parentId === undefined ? {} : { parentId: section.parentId }),
      ...(title.truncated ? { truncated: true as const } : {}),
    });

    for (const link of linksByParent.get(section.id) ?? []) {
      entries.push(asLink(link));
      seen.add(link.id);
    }
  }

  for (const link of document.links) {
    if (!seen.has(link.id)) entries.push(asLink(link));
  }

  return entries;
};

export const treeResult = (
  document: ParsedDocument,
  sourceUrl: string,
  entryOffset: number,
  limit: number,
): TreeResult => {
  const entries = treeEntries(document);
  const resultPage = page(entryOffset, limit, entries.length);
  const title = truncate(sourceUrl, MAX_URL_LENGTH);

  return {
    command: 'tree',
    url: title.value,
    root: { title: title.value },
    entries: entries.slice(entryOffset, entryOffset + limit),
    page: resultPage,
  };
};

export const formatTree = (result: TreeResult, prefix?: string): string => {
  const lines = [prefix, result.root.title].filter((line): line is string => line !== undefined);

  for (const entry of result.entries) {
    const indent = '  '.repeat(Math.max(0, entry.level));
    const target = entry.kind === 'link' ? ` → ${entry.url}` : '';
    lines.push(`${indent}${entry.id}  ${entry.title}${target}`);
  }

  if (result.entries.length === 0) lines.push('  (no entries)');
  if (result.page.nextOffset !== null) {
    lines.push(`\nMore entries: --offset ${result.page.nextOffset} --limit ${result.page.limit}`);
  }

  return lines.join('\n');
};

export const tree = async (
  sourceUrl: string,
  options: { refresh: boolean; offset: number; limit: number },
): Promise<void> => {
  if (!effect.enabled) {
    output(
      { command: 'tree', dryRun: true, url: sourceUrl, ...options },
      `Would load ${sourceUrl} and show its documentation tree.`,
    );
    return;
  }

  const document = await loadDocument(sourceUrl, { refresh: options.refresh });
  const result = treeResult(document, sourceUrl, options.offset, options.limit);
  output(result, formatTree(result));
};

export default defineCommand({
  name: 'tree',
  description: 'Show documentation headings and linked pages.',
  arguments: [url],
  options: [refresh, offset, treeLimit],
  run: ({ url: sourceUrl, refresh: shouldRefresh, offset: entryOffset, limit }) =>
    tree(sourceUrl, { refresh: shouldRefresh, offset: entryOffset, limit }),
});
