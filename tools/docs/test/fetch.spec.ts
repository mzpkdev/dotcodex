import { mkdir, mkdtemp, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  describe as context,
  expect,
  it,
} from 'webanvil/test';
import { vi } from 'vitest';
import { loadDocument } from '../src/fetch.ts';

vi.mock('node:fs/promises', async (importOriginal) => {
  const fs = await importOriginal<typeof import('node:fs/promises')>();
  return { ...fs, mkdir: vi.fn(fs.mkdir), writeFile: vi.fn(fs.writeFile) };
});

const url = 'https://example.com/docs/llms.txt';
const server = setupServer();
let cacheDir: string;
let requests: Request[];

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
  server.events.on('request:start', ({ request }) => requests.push(request));
  // Drain MSW's response clone so cancelling the application stream can settle.
  server.events.on('response:mocked', async ({ response }) => {
    await response.arrayBuffer();
  });
});
beforeEach(async () => {
  requests = [];
  cacheDir = await mkdtemp(join(tmpdir(), 'docs-spec-'));
});
afterEach(async () => {
  server.resetHandlers();
  vi.restoreAllMocks();
  await rm(cacheDir, { recursive: true });
});
afterAll(() => server.close());

const load = (refresh = false) => loadDocument(url, { cacheDir, refresh });
const markdown = (body: string, headers = {}) =>
  HttpResponse.text(body, { headers: { 'Content-Type': 'text/markdown', ...headers } });

describe('loadDocument', () => {
  context.each(['EACCES', 'EPERM', 'EROFS'])('with cache permission error %s', (code) => {
    it.each([
      ['creating the directory', mkdir],
      ['writing the entry', writeFile],
    ] as const)('returns fetched content when %s fails', async (_operation, persist) => {
      server.use(http.get(url, () => markdown('# Guide\nBody')));
      vi.mocked(persist).mockRejectedValueOnce(Object.assign(new Error('Cache denied'), { code }));
      const warning = vi.spyOn(process.stderr, 'write').mockReturnValue(true);

      const doc = await load();

      expect(doc.sections[1]).toMatchObject({ title: 'Guide', content: 'Body' });
      expect(requests).toHaveLength(1);
      expect(await readdir(cacheDir)).toHaveLength(0);
      expect(warning).toHaveBeenCalledOnce();
      expect(warning.mock.calls[0][0]).toContain('DOCS_CACHE_DIR');
    });
  });

  it('preserves unexpected cache failures', async () => {
    server.use(http.get(url, () => markdown('# Guide')));
    const error = Object.assign(new Error('Cache I/O error'), { code: 'EIO' });
    vi.mocked(writeFile).mockRejectedValueOnce(error);
    await expect(load()).rejects.toBe(error);
  });

  context('with a fresh cached document', () => {
    beforeEach(async () => {
      server.use(
        http.get(url, () =>
          markdown('# Guide\nBody', {
            ETag: '"v1"',
            'Last-Modified': 'Wed, 01 Jan 2025 00:00:00 GMT',
          }),
        ),
      );
      await load();
      requests = [];
    });

    it('returns the cached content without a request', async () => {
      const doc = await load();
      expect(doc.sections[1]).toMatchObject({ title: 'Guide', content: 'Body' });
      expect(requests).toHaveLength(0);
      expect(await readdir(cacheDir)).toHaveLength(1);
    });

    context('when refresh is requested', () => {
      it('returns revalidated content when the cache becomes read-only', async () => {
        server.use(http.get(url, () => new HttpResponse(null, { status: 304 })));
        vi.mocked(writeFile).mockRejectedValueOnce(
          Object.assign(new Error('Cache is read-only'), { code: 'EROFS' }),
        );
        const warning = vi.spyOn(process.stderr, 'write').mockReturnValue(true);

        expect((await load(true)).sections[1]).toMatchObject({ title: 'Guide', content: 'Body' });
        expect(requests[0].headers.get('if-none-match')).toBe('"v1"');
        expect(warning).toHaveBeenCalledOnce();
        expect(await readdir(cacheDir)).toHaveLength(1);
      });

      it('revalidates with the cached validators and retains unchanged content', async () => {
        server.use(http.get(url, () => new HttpResponse(null, { status: 304 })));
        const doc = await load(true);
        expect(doc.sections[1]).toMatchObject({ title: 'Guide', content: 'Body' });
        expect(requests).toHaveLength(1);
        expect(requests[0].headers.get('if-none-match')).toBe('"v1"');
        expect(requests[0].headers.get('if-modified-since')).toBe('Wed, 01 Jan 2025 00:00:00 GMT');
        expect(await load()).toEqual(doc);
        expect(requests).toHaveLength(1);
        expect(await readdir(cacheDir)).toHaveLength(1);
      });

      it('replaces the cached content when the server returns a new version', async () => {
        server.use(http.get(url, () => markdown('# Updated')));
        const doc = await load(true);
        expect(doc.sections[1].title).toBe('Updated');
        expect(await load()).toEqual(doc);
        expect(requests).toHaveLength(1);
      });

      it('reports network failure instead of returning stale content', async () => {
        server.use(http.get(url, () => HttpResponse.error()));
        await expect(load(true)).rejects.toThrow('Could not fetch');
        expect((await load()).sections[1].title).toBe('Guide');
      });
    });
  });

  context('when the server redirects', () => {
    it('resolves relative links against the final URL', async () => {
      server.use(
        http.get(url, () => HttpResponse.redirect('https://example.com/new/index.md')),
        http.get('https://example.com/new/index.md', () => markdown('[Child](child.md)')),
      );
      const doc = await load();
      expect(doc.url).toBe('https://example.com/new/index.md');
      expect(doc.links[0]?.url).toBe('https://example.com/new/child.md');
      expect((await load()).url).toBe(doc.url);
    });
  });

  context('with an unusable response', () => {
    context.each([
      ['unsupported content', () => HttpResponse.json({}), 'Expected Markdown'],
      ['a missing page', () => HttpResponse.text('Missing', { status: 404 }), 'HTTP 404'],
      [
        'an oversized Content-Length',
        () => markdown('large', { 'Content-Length': '10485761' }),
        '10 MiB',
      ],
      ['an oversized body without Content-Length', () => markdown('x'.repeat(10485761)), '10 MiB'],
    ] as const)('%s', (_name, respond, message) => {
      it('reports the failure without caching it', async () => {
        server.use(http.get(url, respond));
        await expect(load()).rejects.toThrow(message);
        expect(await readdir(cacheDir)).toHaveLength(0);
      });
    });
  });

  context('with an HTML page', () => {
    it('converts headings and content while dropping scripts and navigation', async () => {
      server.use(
        http.get(url, () =>
          HttpResponse.html(
            '<html><body><nav>Menu</nav><h1>Dialog</h1><p>Usage</p><h2><a href="#anatomy"></a>Anatomy</h2><script>throw 1</script></body></html>',
          ),
        ),
      );
      const doc = await load();
      expect(doc.sections.find((section) => section.id === 'dialog')).toMatchObject({
        title: 'Dialog',
        content: 'Usage',
      });
      expect(doc.sections.find((section) => section.id === 'anatomy')?.title).toBe('Anatomy');
      expect(doc.links).toEqual([]);
      expect(doc.sections.map((section) => section.content).join('')).not.toMatch(/throw 1|Menu/);
    });

    it('preserves adjacent links containing block elements', async () => {
      server.use(
        http.get(url, () =>
          HttpResponse.html(
            '<html><h1>Dialog</h1><a href="./dialog.mdx?framework=svelte"><div>Markdown</div><p>View page</p></a><a href="./examples"><div>Examples</div></a></html>',
          ),
        ),
      );
      const doc = await load();
      expect(doc.links.map(({ title, url }) => ({ title, url }))).toEqual([
        {
          title: 'Markdown View page',
          url: 'https://example.com/docs/dialog.mdx?framework=svelte',
        },
        { title: 'Examples', url: 'https://example.com/docs/examples' },
      ]);
    });
  });

  context.each([
    ['a non-HTTP URL', 'file:///etc/passwd', 'Use an HTTP(S) URL'],
    ['embedded credentials', 'https://user:pass@example.com', 'without embedded credentials'],
    ['a relative URL', 'relative.md', 'Provide an absolute HTTP(S)'],
  ])('with %s', (_name, input, message) => {
    it('rejects the URL before making a request', async () => {
      await expect(loadDocument(input, { cacheDir })).rejects.toThrow(message);
      expect(requests).toHaveLength(0);
      expect(await readdir(cacheDir)).toHaveLength(0);
    });
  });
});
