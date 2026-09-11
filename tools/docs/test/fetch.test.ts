import { mkdtemp, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'webanvil/test';
import { loadDocument } from '../src/fetch.ts';

const directories: string[] = [];
async function cache() {
  const directory = await mkdtemp(join(tmpdir(), 'docs-test-'));
  directories.push(directory);
  return directory;
}
function response(body: string, url = 'https://example.com/docs/llms.txt', headers = {}) {
  const result = new Response(body, { headers: { 'content-type': 'text/markdown', ...headers } });
  Object.defineProperty(result, 'url', { value: url });
  return result;
}
afterEach(async () => {
  vi.unstubAllGlobals();
  await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true })));
});

describe('document loading', () => {
  it('reuses fresh cached text, then conditionally refreshes', async () => {
    const cacheDir = await cache();
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(response('# Guide\nBody', undefined, { etag: 'v1' }))
      .mockResolvedValueOnce(new Response(null, { status: 304 }));
    vi.stubGlobal('fetch', fetcher);
    const first = await loadDocument('https://example.com/docs/llms.txt', { cacheDir });
    expect(await loadDocument('https://example.com/docs/llms.txt', { cacheDir })).toEqual(first);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(
      await loadDocument('https://example.com/docs/llms.txt', { cacheDir, refresh: true }),
    ).toEqual(first);
    expect(fetcher.mock.calls[1]?.[1].headers['If-None-Match']).toBe('v1');
    expect(await readdir(cacheDir)).toHaveLength(1);
  });

  it('resolves relative links against the final redirect URL', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(response('[Child](child.md)', 'https://example.com/new/index.md')),
    );
    const doc = await loadDocument('https://example.com/old', { cacheDir: await cache() });
    expect(doc.url).toBe('https://example.com/new/index.md');
    expect(doc.links[0]?.url).toBe('https://example.com/new/child.md');
  });

  it('rejects unsupported content, HTTP failures, and oversized responses without caching them', async () => {
    const cacheDir = await cache();
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(
        new Response('{}', { headers: { 'content-type': 'application/json' } }),
      )
      .mockResolvedValueOnce(new Response('Missing', { status: 404 }))
      .mockResolvedValueOnce(response('large', undefined, { 'content-length': '10485761' }));
    vi.stubGlobal('fetch', fetcher);
    await expect(loadDocument('https://example.com/html', { cacheDir })).rejects.toThrow(
      'Expected Markdown',
    );
    await expect(loadDocument('https://example.com/missing', { cacheDir })).rejects.toThrow(
      'HTTP 404',
    );
    await expect(loadDocument('https://example.com/large', { cacheDir })).rejects.toThrow('10 MiB');
    expect(await readdir(cacheDir)).toHaveLength(0);
  });

  it('converts linked HTML pages without executing scripts or retaining navigation', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          response(
            '<html><body><nav>Menu</nav><h1>Dialog</h1><p>Usage</p><h2><a href="#anatomy"></a>Anatomy</h2><script>throw 1</script></body></html>',
          ),
        ),
    );
    const doc = await loadDocument('https://example.com/dialog', { cacheDir: await cache() });
    expect(doc.sections.some((section) => section.title === 'Dialog')).toBe(true);
    expect(doc.sections.find((section) => section.id === 'anatomy')?.title).toBe('Anatomy');
    expect(doc.links).toEqual([]);
    expect(doc.sections.map((section) => section.content).join('')).not.toContain('throw 1');
    expect(doc.sections.map((section) => section.content).join('')).not.toContain('Menu');
  });

  it('rejects unsupported or credential-bearing URLs before fetching', async () => {
    const fetcher = vi.fn();
    vi.stubGlobal('fetch', fetcher);
    for (const url of ['file:///etc/passwd', 'https://user:pass@example.com', 'relative.md']) {
      await expect(loadDocument(url)).rejects.toThrow();
    }
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('preserves adjacent HTML links with block children', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          response(
            '<html><h1>Dialog</h1><a href="./dialog.mdx?framework=svelte"><div>Markdown</div><p>View page</p></a><a href="./examples"><div>Examples</div></a></html>',
          ),
        ),
    );
    const doc = await loadDocument('https://example.com/docs/llms.txt', {
      cacheDir: await cache(),
    });
    expect(doc.links.map(({ title, url }) => ({ title, url }))).toEqual([
      { title: 'Markdown View page', url: 'https://example.com/docs/dialog.mdx?framework=svelte' },
      { title: 'Examples', url: 'https://example.com/docs/examples' },
    ]);
  });

  it('reports refresh failure rather than silently returning stale content', async () => {
    const cacheDir = await cache();
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(response('# Original'))
        .mockRejectedValueOnce(new Error('offline')),
    );
    await loadDocument('https://example.com/docs/llms.txt', { cacheDir });
    await expect(
      loadDocument('https://example.com/docs/llms.txt', { cacheDir, refresh: true }),
    ).rejects.toThrow('offline');
  });
});
