'use strict';

const assert = require('node:assert/strict');
const { mkdtemp, access } = require('node:fs/promises');
const { constants } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const { spawn, spawnSync } = require('node:child_process');
const test = require('node:test');

const poll = join(__dirname, '..', 'poll');

function run(args, options = {}) {
  const result = spawnSync(process.execPath, [poll, ...args], { encoding: 'utf8', timeout: 5000, ...options });
  assert.equal(result.error, undefined, result.error?.message);
  return { ...result, json: JSON.parse(result.stdout) };
}

function nodeProbe(source, ...args) {
  return ['--', process.execPath, '-e', source, ...args];
}

test('succeeds after a pending observation', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'poll-test-'));
  const state = join(dir, 'state');
  const source = 'const fs=require("fs"); const p=process.argv[1]; if(fs.existsSync(p)) process.exit(0); fs.writeFileSync(p,"x"); process.exit(1)';
  const result = run(['--timeout', '2s', '--interval', '20ms', ...nodeProbe(source, state)]);
  assert.equal(result.status, 0);
  assert.equal(result.json.status, 'success');
  assert.equal(result.json.attempts, 2);
  assert.equal(result.json.lastProbe.exitCode, 0);
});

test('retries explicitly selected exit codes', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'poll-test-'));
  const state = join(dir, 'state');
  const source = 'const fs=require("fs"); const p=process.argv[1]; if(fs.existsSync(p)) process.exit(0); fs.writeFileSync(p,"x"); process.exit(7)';
  const result = run(['--timeout', '2s', '--interval', '20ms', '--retry-exit', '7', ...nodeProbe(source, state)]);
  assert.equal(result.status, 0);
  assert.equal(result.json.attempts, 2);
});

test('stops on a non-retryable exit', () => {
  const result = run(['--timeout', '2s', ...nodeProbe('process.exit(9)')]);
  assert.equal(result.status, 2);
  assert.equal(result.json.reason, 'unexpected_exit');
  assert.equal(result.json.attempts, 1);
});

test('uses its deadline while waiting between attempts', () => {
  const result = run(['--timeout', '500ms', '--interval', '1s', ...nodeProbe('process.exit(1)')]);
  assert.equal(result.status, 124);
  assert.equal(result.json.status, 'timeout');
  assert.equal(result.json.attempts, 1);
});

test('treats a hung attempt as a terminal error', () => {
  const result = run(['--timeout', '2s', '--attempt-timeout', '80ms', ...nodeProbe('setTimeout(()=>{}, 5000)')]);
  assert.equal(result.status, 2);
  assert.equal(result.json.reason, 'attempt_timeout');
});

test('reports a missing executable', () => {
  const result = run(['--timeout', '2s', '--', 'definitely-not-a-real-executable']);
  assert.equal(result.status, 2);
  assert.equal(result.json.reason, 'spawn_error');
});

test('overall deadline wins when the attempt timeout is longer', () => {
  const result = run(['--timeout', '100ms', '--attempt-timeout', '1s', ...nodeProbe('setInterval(()=>{},1000)')]);
  assert.equal(result.status, 124);
  assert.equal(result.json.status, 'timeout');
  assert.equal(result.json.attempts, 1);
});

test('captures and bounds output without blocking the probe', () => {
  const result = run(nodeProbe('process.stdout.write("x".repeat(100000)); process.stderr.write("error")'));
  assert.equal(result.status, 0);
  assert.equal(result.json.lastProbe.stdout.length, 8192);
  assert.equal(result.json.lastProbe.stdoutTruncated, true);
  assert.equal(result.json.lastProbe.stderr, 'error');
});

test('rejects invalid durations and retry codes', () => {
  for (const args of [['--timeout', '0s'], ['--timeout', '999999999h'], ['--retry-exit', '0'], ['--retry-exit', '256']]) {
    const result = run([...args, ...nodeProbe('process.exit(0)')]);
    assert.equal(result.status, 2);
    assert.equal(result.json.reason, 'invalid_arguments');
  }
});

test('cleans up inherited output pipes after the command exits', () => {
  const source = 'require("child_process").spawn(process.execPath,["-e","setInterval(()=>{},1000)"],{stdio:["ignore",1,2]}).unref()';
  const result = run(['--timeout', '2s', ...nodeProbe(source)]);
  assert.equal(result.status, 0);
  assert.equal(result.json.status, 'success');
});

test('passes literal arguments without a shell', () => {
  const literal = '$HOME; echo should-not-run';
  const result = run(['--timeout', '2s', ...nodeProbe('console.log(process.argv[1]); process.exit(0)', literal)]);
  assert.equal(result.status, 0);
  assert.equal(result.json.lastProbe.stdout.trim(), literal);
});

test('cancellation terminates descendants in the attempt process group', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'poll-test-'));
  const marker = join(dir, 'survived');
  const ready = join(dir, 'ready');
  const grandchild = `process.on('SIGTERM', () => {}); require('fs').writeFileSync(${JSON.stringify(ready)}, 'started'); setTimeout(() => require('fs').writeFileSync(${JSON.stringify(marker)}, 'x'), 500)`;
  const source = `const {spawn}=require('child_process'); spawn(process.execPath,['-e',${JSON.stringify(grandchild)}],{stdio:'ignore'}); setInterval(()=>{},1000)`;
  const child = spawn(process.execPath, [poll, '--timeout', '5s', '--attempt-timeout', '5s', '--', process.execPath, '-e', source, marker, ready], { stdio: ['ignore', 'pipe', 'pipe'] });
  const waitDeadline = Date.now() + 3000;
  while (true) {
    try { await access(ready, constants.F_OK); break; } catch { await new Promise((resolve) => setTimeout(resolve, 10)); }
    if (Date.now() >= waitDeadline) throw new Error('probe did not start');
  }
  child.kill('SIGINT');
  const [code, stdout] = await Promise.all([
    new Promise((resolve) => child.once('exit', resolve)),
    new Promise((resolve) => { let data = ''; child.stdout.on('data', (chunk) => { data += chunk; }); child.stdout.on('end', () => resolve(data)); }),
  ]);
  assert.equal(code, 130);
  assert.equal(JSON.parse(stdout).status, 'cancelled');
  await new Promise((resolve) => setTimeout(resolve, 600));
  await assert.rejects(access(marker, constants.F_OK));
});
