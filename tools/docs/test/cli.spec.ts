import { execFile } from 'node:child_process';
import { createServer, type Server } from 'node:http';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
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

const exec = promisify(execFile);
let server: Server;
let cacheDir: string;
let url: string;
let requests = 0;
const cliPath = fileURLToPath(new URL('../src/index.ts', import.meta.url));

async function run(...args: string[]) {
  try {
    const result = await exec(process.execPath, [cliPath, ...args, '--json'], {
      env: { ...process.env, DOCS_CACHE_DIR: cacheDir },
    });
    return { code: 0, ...result, data: JSON.parse(result.stdout) };
  } catch (error) {
    const result = error as { code: number; stdout: string; stderr: string };
    return { ...result, data: result.stdout ? JSON.parse(result.stdout) : undefined };
  }
}

beforeAll(async () => {
  server = createServer((request, response) => {
    requests++;
    response.setHeader('Content-Type', 'text/markdown');
    response.end(
      request.url === '/child.md'
        ? '# Child\nChild text\n## Details\nMore content'
        : '# Manual\nIntro\n## Classes\nReactive class state\n### Private\nPrivate details\n## Links\n[Child](child.md)\n## Large\n' +
            'abcd '.repeat(100),
    );
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('No test server');
  url = `http://127.0.0.1:${address.port}/llms.txt`;
});
beforeEach(async () => {
  cacheDir = await mkdtemp(join(tmpdir(), 'docs-cli-test-'));
  requests = 0;
});
afterEach(async () => {
  await rm(cacheDir, { recursive: true, force: true });
});
afterAll(async () => {
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
});

describe('CLI', () => {
  context('when listing a document tree', () => {
    it('returns a bounded page with a continuation offset', async () => {
      const result = await run('tree', url, '--limit', '2');
      expect(result.code).toBe(0);
      expect(result.data.page.nextOffset).toBe(2);
    });

    it('exposes a linked page as a readable tree target', async () => {
      const tree = await run('tree', url);
      const match = tree.stdout.match(/link-[a-f0-9]+/);
      expect(match).not.toBeNull();

      const result = await run('read', url, match![0]);
      expect(result.code).toBe(0);
      expect(result.data.target).toBeDefined();
      expect(result.stdout).toContain('child');
      expect(result.stdout).not.toContain('Child text');
    });

    context('in dry-run mode', () => {
      it('reports its effect without fetching the document', async () => {
        const result = await run('tree', url, '--refresh', '--dry-run');
        expect(result.code).toBe(0);
        expect(requests).toBe(0);
        expect(result.data.dryRun).toBe(true);
      });
    });
  });

  context('when reading a section', () => {
    it('returns only the selected section content', async () => {
      const result = await run('read', url, 'classes');
      expect(result.data.content).toBe('Reactive class state');
      expect(result.data.content).not.toContain('Private details');
    });

    it('returns continuation metadata for a bounded page', async () => {
      const first = await run('read', url, 'large', '--limit', '20');
      expect(first.data.content).toHaveLength(20);
      expect(first.data.page.nextOffset).toBe(20);

      const next = await run('read', url, 'large', '--limit', '20', '--offset', '20');
      expect(next.data.page.offset).toBe(20);
    });

    it('fails for an unknown section ID', async () => {
      expect((await run('read', url, 'missing')).code).not.toBe(0);
    });

    it('fails when the section ID is omitted', async () => {
      expect((await run('read', url)).code).not.toBe(0);
    });
  });

  context('when searching a document', () => {
    it('returns matching IDs without dumping the manual', async () => {
      const result = await run('search', url, 'reactive class', '--limit', '1');
      expect(result.code).toBe(0);
      expect(result.stdout).toContain('classes');
      expect(result.stdout).not.toContain('abcd abcd');
    });
  });

  context('with an invalid page limit', () => {
    it('returns a nonzero exit code', async () => {
      expect((await run('tree', url, '--limit', '-1')).code).not.toBe(0);
    });
  });
});
