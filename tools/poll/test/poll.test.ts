import { access, mkdtemp } from 'node:fs/promises';
import { constants } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFile as execFileCallback, spawn } from 'node:child_process';
import { promisify } from 'node:util';
import { describe, expect, it } from 'webanvil/test';

const execFile = promisify(execFileCallback);
const poll = join(import.meta.dirname, '..', 'poll');
type Run = { code: number; data: Record<string, unknown> };

const run = async (...args: string[]): Promise<Run> => {
  try {
    const result = await execFile(poll, args, { encoding: 'utf8' });
    return { code: 0, data: JSON.parse(result.stdout) };
  } catch (error) {
    const result = error as { code: number; stdout: string };
    return { code: result.code, data: JSON.parse(result.stdout) };
  }
};

const nodeProbe = (source: string, ...args: string[]): string[] => [
  '--',
  process.execPath,
  '-e',
  source,
  ...args,
];
const stdout = (data: Record<string, unknown>): string =>
  ((data.lastProbe as { stdout: string }).stdout ?? '').trim();

describe('poll CLI', () => {
  it('succeeds after a pending observation', async () => {
    const state = join(await mkdtemp(join(tmpdir(), 'poll-test-')), 'state');
    const source =
      'const fs=require("fs");const p=process.argv[1];if(fs.existsSync(p))process.exit(0);fs.writeFileSync(p,"x");process.exit(1)';
    const result = await run('--timeout', '2s', '--interval', '20ms', ...nodeProbe(source, state));
    expect(result.code).toBe(0);
    expect(result.data.attempts).toBe(2);
  });

  it('retries explicitly selected exit codes', async () => {
    const state = join(await mkdtemp(join(tmpdir(), 'poll-test-')), 'state');
    const source =
      'const fs=require("fs");const p=process.argv[1];if(fs.existsSync(p))process.exit(0);fs.writeFileSync(p,"x");process.exit(7)';
    const result = await run(
      '--timeout',
      '2s',
      '--interval',
      '20ms',
      '--retry-exit',
      '7',
      ...nodeProbe(source, state),
    );
    expect(result.code).toBe(0);
    expect(result.data.attempts).toBe(2);
  });

  it('stops on an unexpected exit', async () => {
    const result = await run('--timeout', '2s', ...nodeProbe('process.exit(9)'));
    expect(result.code).toBe(2);
    expect(result.data.reason).toBe('unexpected_exit');
  });

  it('uses the deadline while sleeping', async () => {
    const result = await run(
      '--timeout',
      '500ms',
      '--interval',
      '1s',
      ...nodeProbe('process.exit(1)'),
    );
    expect(result.code).toBe(124);
    expect(result.data.attempts).toBe(1);
  });

  it('makes a hung attempt terminal', async () => {
    const result = await run(
      '--timeout',
      '2s',
      '--attempt-timeout',
      '80ms',
      ...nodeProbe('setTimeout(()=>{},5000)'),
    );
    expect(result.code).toBe(2);
    expect(result.data.reason).toBe('attempt_timeout');
  });

  it('reports a missing executable', async () => {
    const result = await run('--timeout', '2s', '--', 'definitely-not-a-real-executable');
    expect(result.code).toBe(2);
    expect(result.data.reason).toBe('spawn_error');
  });

  it('captures and bounds output without blocking the probe', async () => {
    const result = await run(
      ...nodeProbe('process.stdout.write("x".repeat(100000));process.stderr.write("error")'),
    );
    expect(result.code).toBe(0);
    expect(result.data.lastProbe).toMatchObject({
      stdout: 'x'.repeat(8192),
      stdoutTruncated: true,
      stderr: 'error',
    });
  });

  it('rejects invalid durations and retry codes', async () => {
    for (const args of [
      ['--timeout', '0s'],
      ['--timeout', '999999999h'],
      ['--retry-exit', '0'],
      ['--retry-exit', '256'],
    ]) {
      const result = await run(...args, ...nodeProbe('process.exit(0)'));
      expect(result.code).toBe(2);
      expect(result.data.reason).toBe('invalid_arguments');
    }
  });

  it('cleans up inherited output pipes after the command exits', async () => {
    const source =
      'require("child_process").spawn(process.execPath,["-e","setInterval(()=>{},1000)"],{stdio:["ignore",1,2]}).unref()';
    const result = await run('--timeout', '2s', ...nodeProbe(source));
    expect(result.code).toBe(0);
    expect(result.data.status).toBe('success');
  });

  it('passes literal arguments without a shell', async () => {
    const literal = '$HOME; echo should-not-run';
    const result = await run(
      '--timeout',
      '2s',
      ...nodeProbe('console.log(process.argv[1])', literal),
    );
    expect(result.code).toBe(0);
    expect(stdout(result.data)).toBe(literal);
  });

  it('requires -- before the command', async () => {
    const marker = join(await mkdtemp(join(tmpdir(), 'poll-test-')), 'marker');
    const result = await run('--dry-run', 'touch', '--', marker);
    expect(result.code).toBe(2);
    expect(result.data.reason).toBe('invalid_arguments');
    await expect(access(marker, constants.F_OK)).rejects.toThrow();
  });

  it('keeps command flags after -- literal', async () => {
    const result = await run(
      '--timeout',
      '2s',
      '--',
      process.execPath,
      '-e',
      'console.log(process.argv.slice(1).join("|"))',
      '--',
      '--help',
      '--dry-run',
    );
    expect(result.code).toBe(0);
    expect(stdout(result.data)).toBe('--help|--dry-run');
  });

  it('does not run the probe in cmdore dry-run mode', async () => {
    const marker = join(await mkdtemp(join(tmpdir(), 'poll-test-')), 'marker');
    const result = await run(
      '--dry-run',
      ...nodeProbe(`require('fs').writeFileSync(${JSON.stringify(marker)},'x')`),
    );
    expect(result.code).toBe(0);
    expect(result.data.status).toBe('dry-run');
    await expect(access(marker, constants.F_OK)).rejects.toThrow();
  });

  it('prioritizes the overall deadline when an attempt is still running', async () => {
    const result = await run(
      '--timeout',
      '80ms',
      '--attempt-timeout',
      '2s',
      ...nodeProbe('setTimeout(()=>{},5000)'),
    );
    expect(result.code).toBe(124);
    expect(result.data.status).toBe('timeout');
  });

  it('kills a SIGTERM-ignoring descendant before returning', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'poll-test-'));
    const marker = join(directory, 'survived');
    const ready = join(directory, 'ready');
    const grandchild = `process.on('SIGTERM',()=>{});require('fs').writeFileSync(${JSON.stringify(ready)},'started');setTimeout(()=>require('fs').writeFileSync(${JSON.stringify(marker)},'x'),500)`;
    const source = `const{spawn}=require('child_process');spawn(process.execPath,['-e',${JSON.stringify(grandchild)}],{stdio:'ignore'});setInterval(()=>{},1000)`;
    const child = spawn(
      poll,
      [
        '--timeout',
        '5s',
        '--attempt-timeout',
        '5s',
        '--',
        process.execPath,
        '-e',
        source,
        marker,
        ready,
      ],
      { stdio: ['ignore', 'pipe', 'pipe'] },
    );
    const deadline = Date.now() + 3_000;
    while (true) {
      try {
        await access(ready, constants.F_OK);
        break;
      } catch {
        if (Date.now() >= deadline) throw new Error('probe did not start');
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
    }
    const exited = new Promise<number | null>((resolve) => child.once('exit', resolve));
    child.kill('SIGINT');
    const output = await new Promise<string>((resolve) => {
      let value = '';
      child.stdout.on('data', (chunk: Buffer) => (value += chunk));
      child.stdout.on('end', () => resolve(value));
    });
    const code = await exited;
    expect(code).toBe(130);
    expect(JSON.parse(output).status).toBe('cancelled');
    await new Promise((resolve) => setTimeout(resolve, 600));
    await expect(access(marker, constants.F_OK)).rejects.toThrow();
  });
});
