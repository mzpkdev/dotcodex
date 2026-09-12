import TurndownService from 'turndown';
import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { parseDocument, type ParsedDocument } from './document.ts';
import { warning } from './output.ts';

const MAX_BYTES = 10 * 1024 * 1024;
const MAX_AGE = 60 * 60 * 1000;
const DEFAULT_CACHE = fileURLToPath(new URL('../.cache/', import.meta.url));

type CacheEntry = {
  url: string;
  fetchedAt: number;
  markdown: string;
  etag?: string;
  modified?: string;
};

export function documentUrl(input: string): string {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    throw new Error('Provide an absolute HTTP(S) documentation URL.');
  }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
    throw new Error('Use an HTTP(S) URL without embedded credentials.');
  }
  url.hash = '';
  return url.href;
}

async function readCache(path: string): Promise<CacheEntry | undefined> {
  try {
    const data: unknown = JSON.parse(await readFile(path, 'utf8'));
    if (
      typeof data === 'object' &&
      data !== null &&
      'url' in data &&
      typeof data.url === 'string' &&
      'markdown' in data &&
      typeof data.markdown === 'string' &&
      'fetchedAt' in data &&
      typeof data.fetchedAt === 'number'
    ) {
      return data as CacheEntry;
    }
  } catch {
    // A missing or corrupt cache is a cache miss.
  }
  return undefined;
}

async function saveCache(path: string, entry: CacheEntry): Promise<void> {
  const temporary = `${path}.${randomUUID()}.tmp`;
  try {
    await writeFile(temporary, JSON.stringify(entry), { mode: 0o600 });
    await rename(temporary, path);
  } finally {
    await rm(temporary, { force: true });
  }
}

async function readBody(response: Response): Promise<string> {
  if (Number(response.headers.get('content-length')) > MAX_BYTES) {
    await response.body?.cancel();
    throw new Error('Document exceeds the 10 MiB download limit.');
  }
  const reader = response.body?.getReader();
  if (!reader) throw new Error('Documentation response has no body.');
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BYTES) throw new Error('Document exceeds the 10 MiB download limit.');
      chunks.push(value);
    }
  } finally {
    await reader.cancel();
  }
  return Buffer.concat(chunks).toString('utf8');
}

export async function loadDocument(
  input: string,
  options: { refresh?: boolean; cacheDir?: string } = {},
): Promise<ParsedDocument> {
  const url = documentUrl(input);
  const directory = options.cacheDir ?? process.env.DOCS_CACHE_DIR ?? DEFAULT_CACHE;
  const path = join(directory, `${createHash('sha256').update(url).digest('hex')}.json`);
  const cached = await readCache(path);
  if (cached && !options.refresh && Date.now() - cached.fetchedAt < MAX_AGE) {
    return parseDocument(cached.markdown, cached.url);
  }

  const headers: Record<string, string> = {
    Accept: 'text/markdown, text/plain;q=0.9, text/html;q=0.5',
    'User-Agent': 'docs-cli/0.1',
  };
  if (typeof cached?.etag === 'string') headers['If-None-Match'] = cached.etag;
  if (typeof cached?.modified === 'string') headers['If-Modified-Since'] = cached.modified;
  let response: Response;
  try {
    response = await fetch(url, { headers, signal: AbortSignal.timeout(30_000) });
  } catch (error) {
    throw new Error(
      `Could not fetch ${url}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  let entry: CacheEntry;
  if (response.status === 304 && cached) {
    entry = { ...cached, fetchedAt: Date.now() };
  } else {
    if (!response.ok) {
      await response.body?.cancel();
      throw new Error(`HTTP ${response.status} fetching ${url}`);
    }
    const type = response.headers.get('content-type') ?? '';
    if (
      type &&
      !/text\/(plain|markdown|x-markdown)|application\/(octet-stream|markdown)|text\/html/i.test(
        type,
      )
    ) {
      await response.body?.cancel();
      throw new Error(
        `Expected Markdown or plain text, received ${type}. Use the site's Markdown documentation URL.`,
      );
    }
    const body = await readBody(response);
    const html = /text\/html/i.test(type) || /^\s*(?:<!doctype html|<html\b)/i.test(body);
    const converter = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });
    converter.remove(['script', 'style', 'nav', 'footer', 'aside']);
    converter.addRule('links', {
      filter: (node) => node.nodeName === 'A' && node.hasAttribute('href'),
      replacement: (content, node) => {
        const label = content.replace(/\s+/g, ' ').trim();
        if (!label) return '';
        const href = (node as HTMLElement)
          .getAttribute('href')!
          .replace(/</g, '%3C')
          .replace(/>/g, '%3E')
          .replace(/\s/g, '%20');
        // Block children inside anchors must not create blank lines in link labels.
        return ` [${label}](<${href}>) `;
      },
    });
    const markdown = html ? converter.turndown(body) : body;
    entry = {
      url: documentUrl(response.url),
      markdown,
      fetchedAt: Date.now(),
      etag: response.headers.get('etag') ?? undefined,
      modified: response.headers.get('last-modified') ?? undefined,
    };
  }
  try {
    await mkdir(directory, { recursive: true });
    await saveCache(path, entry);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException)?.code;
    if (!code || !['EACCES', 'EPERM', 'EROFS'].includes(code)) throw error;
    warning(
      `Warning: docs cache is not writable (${code}); returning fetched content without saving. ` +
        'Set DOCS_CACHE_DIR to a writable directory to enable caching.',
    );
  }
  return parseDocument(entry.markdown, entry.url);
}
