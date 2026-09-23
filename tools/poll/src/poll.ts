import { spawn } from 'node:child_process';
import { performance } from 'node:perf_hooks';

export const DEFAULT_TIMEOUT_MS = 5 * 60 * 1000;
export const DEFAULT_INTERVAL_MS = 3 * 60 * 1000;
export const DEFAULT_INITIAL_DELAY_MS = 0;
export const DEFAULT_ATTEMPT_TIMEOUT_MS = 10 * 1000;

const TERM_GRACE_MS = 200;
const NORMAL_DRAIN_GRACE_MS = 200;
const OUTPUT_LIMIT_BYTES = 8 * 1024;
const MAX_TIMER_MS = 2_147_483_647;

export type PollOptions = {
  timeout: number;
  interval: number;
  initialDelay: number;
  attemptTimeout: number;
  retryExit: Set<number>;
  command: string[];
  onProgress?: (progress: PollProgress) => void;
};

type BoundedOutput = { text: string; truncated: boolean };
type Attempt = {
  kind: 'exit' | 'deadline' | 'attempt_timeout' | 'cancelled' | 'spawn_error';
  exitCode?: number | null;
  signal?: NodeJS.Signals | null;
  cancelSignal?: NodeJS.Signals;
  stdout?: BoundedOutput;
  stderr?: BoundedOutput;
  error?: Error & { code?: string };
};

export type Probe = {
  exitCode: number | null;
  signal: NodeJS.Signals | null;
  stdout: string;
  stderr: string;
  stdoutTruncated: boolean;
  stderrTruncated: boolean;
};

export type PollResult = {
  status: 'success' | 'timeout' | 'error' | 'cancelled';
  attempts: number;
  elapsedMs: number;
  lastProbe: Probe | null;
  reason?: 'attempt_timeout' | 'spawn_error' | 'unexpected_exit';
  message?: string;
  signal?: NodeJS.Signals;
};

export type PollOutcome = { code: 0 | 2 | 124 | 130 | 143; result: PollResult };

type PollAttemptProgress = {
  event: 'attempt';
  attempt: number;
  elapsedMs: number;
  remainingMs: number;
};

type PollWaitingProgress = {
  event: 'waiting';
  phase: 'initial' | 'retry';
  nextAttempt: number;
  delayMs: number;
  elapsedMs: number;
  lastOutcome?: Pick<Probe, 'exitCode' | 'signal'>;
};

export type PollProgress = PollAttemptProgress | PollWaitingProgress;
type PollProgressUpdate =
  | Omit<PollAttemptProgress, 'elapsedMs'>
  | Omit<PollWaitingProgress, 'elapsedMs'>;

export const duration = (value: string, label: string): number => {
  const match = /^(\d+)(ms|s|m|h)$/.exec(value);
  if (!match) throw new Error(`${label} must be a positive duration such as 5s or 5m.`);
  const unit = { ms: 1, s: 1_000, m: 60_000, h: 3_600_000 }[match[2] as 'ms' | 's' | 'm' | 'h'];
  const parsed = Number(match[1]) * unit;
  if (!Number.isSafeInteger(parsed) || parsed <= 0 || parsed > MAX_TIMER_MS) {
    throw new Error(`${label} is out of range.`);
  }
  return parsed;
};

export const retryExit = (value: string): Set<number> => {
  if (!/^\d+(,\d+)*$/.test(value)) {
    throw new Error('--retry-exit must be comma-separated integer exit codes.');
  }
  const codes = value.split(',').map(Number);
  if (codes.some((code) => code < 1 || code > 255)) {
    throw new Error('--retry-exit codes must be between 1 and 255.');
  }
  return new Set(codes);
};

const collector = (stream: NodeJS.ReadableStream): (() => BoundedOutput) => {
  let output = Buffer.alloc(0);
  let truncated = false;
  stream.on('data', (chunk: Buffer) => {
    if (output.length >= OUTPUT_LIMIT_BYTES) {
      truncated = true;
      return;
    }
    const remainder = OUTPUT_LIMIT_BYTES - output.length;
    if (chunk.length > remainder) truncated = true;
    output = Buffer.concat([output, chunk.subarray(0, remainder)]);
  });
  return () => ({ text: output.toString('utf8'), truncated });
};

const signalGroup = (child: ReturnType<typeof spawn> | undefined, signal: NodeJS.Signals): void => {
  if (!child?.pid) return;
  try {
    if (process.platform === 'win32') child.kill(signal);
    else process.kill(-child.pid, signal);
  } catch (error) {
    if (!(error instanceof Error) || !('code' in error) || error.code !== 'ESRCH') throw error;
  }
};

const terminateGroup = async (child: ReturnType<typeof spawn> | undefined): Promise<void> => {
  signalGroup(child, 'SIGTERM');
  await new Promise<void>((resolve) => setTimeout(resolve, TERM_GRACE_MS));
  signalGroup(child, 'SIGKILL');
};

class Cancellation {
  signal: NodeJS.Signals | undefined;
  private readonly listeners = new Set<() => void>();

  subscribe(listener: () => void): void {
    this.listeners.add(listener);
  }

  unsubscribe(listener: () => void): void {
    this.listeners.delete(listener);
  }

  cancel(signal: NodeJS.Signals): void {
    if (this.signal) return;
    this.signal = signal;
    for (const listener of this.listeners) listener();
  }
}

const runAttempt = (
  options: PollOptions,
  remaining: number,
  cancellation: Cancellation,
): Promise<Attempt> =>
  new Promise((resolve) => {
    let child: ReturnType<typeof spawn> | undefined;
    let settled = false;
    let outcome: Attempt | undefined;
    let cleanup: Promise<void> | undefined;
    let exited: Pick<Attempt, 'exitCode' | 'signal'> | undefined;
    let stdout: (() => BoundedOutput) | undefined;
    let stderr: (() => BoundedOutput) | undefined;
    let drainTimer: NodeJS.Timeout | undefined;
    const setOutcome = (next: Attempt): void => {
      if (!outcome) outcome = next;
    };
    const finish = (patch: Partial<Attempt> = {}): void => {
      if (settled) return;
      settled = true;
      clearTimeout(deadlineTimer);
      clearTimeout(attemptTimer);
      clearTimeout(drainTimer);
      cancellation.unsubscribe(cancel);
      child?.stdout?.destroy();
      child?.stderr?.destroy();
      resolve({
        kind: 'exit',
        ...outcome,
        ...exited,
        stdout: stdout?.(),
        stderr: stderr?.(),
        ...patch,
      });
    };
    const stop = (next: Attempt): void => {
      setOutcome(next);
      cleanup ??= terminateGroup(child).then(() => finish());
    };
    const cancel = (): void => stop({ kind: 'cancelled', cancelSignal: cancellation.signal });
    const deadlineTimer = setTimeout(() => stop({ kind: 'deadline' }), remaining);
    const attemptTimer =
      options.attemptTimeout < remaining
        ? setTimeout(() => stop({ kind: 'attempt_timeout' }), options.attemptTimeout)
        : undefined;
    cancellation.subscribe(cancel);

    try {
      child = spawn(options.command[0], options.command.slice(1), {
        detached: process.platform !== 'win32',
        shell: false,
        stdio: ['ignore', 'pipe', 'pipe'],
      });
    } catch (error) {
      finish({
        kind: 'spawn_error',
        error: error instanceof Error ? error : new Error(String(error)),
      });
      return;
    }
    if (child.stdout === null || child.stderr === null) {
      finish({ kind: 'spawn_error', error: new Error('Probe output pipes are unavailable.') });
      return;
    }
    stdout = collector(child.stdout);
    stderr = collector(child.stderr);
    child.once('error', (error) => finish({ kind: 'spawn_error', error }));
    child.once('exit', (exitCode, signal) => {
      exited = { exitCode, signal };
      if (!outcome) drainTimer = setTimeout(() => stop({ kind: 'exit' }), NORMAL_DRAIN_GRACE_MS);
    });
    child.once('close', () => {
      if (!cleanup) finish();
    });
  });

const probe = (attempt: Attempt): Probe => ({
  exitCode: attempt.exitCode ?? null,
  signal: attempt.signal ?? null,
  stdout: attempt.stdout?.text ?? '',
  stderr: attempt.stderr?.text ?? '',
  stdoutTruncated: attempt.stdout?.truncated ?? false,
  stderrTruncated: attempt.stderr?.truncated ?? false,
});

const result = (
  status: PollResult['status'],
  started: number,
  attempts: number,
  lastProbe: Probe | null,
  extra: Omit<Partial<PollResult>, 'status' | 'attempts' | 'elapsedMs' | 'lastProbe'> = {},
): PollResult => ({
  status,
  attempts,
  elapsedMs: Math.round(performance.now() - started),
  lastProbe,
  ...extra,
});

const waitForDelay = (milliseconds: number, cancellation: Cancellation): Promise<boolean> =>
  new Promise((resolve) => {
    if (cancellation.signal) {
      resolve(true);
      return;
    }
    const timer = setTimeout(() => {
      cancellation.unsubscribe(wake);
      resolve(false);
    }, milliseconds);
    const wake = (): void => {
      clearTimeout(timer);
      cancellation.unsubscribe(wake);
      resolve(true);
    };
    cancellation.subscribe(wake);
  });

export const poll = async (options: PollOptions): Promise<PollOutcome> => {
  const started = performance.now();
  const deadline = started + options.timeout;
  const progress = (update: PollProgressUpdate): void => {
    options.onProgress?.({ ...update, elapsedMs: Math.round(performance.now() - started) });
  };
  const cancellation = new Cancellation();
  const onSigint = (): void => cancellation.cancel('SIGINT');
  const onSigterm = (): void => cancellation.cancel('SIGTERM');
  process.once('SIGINT', onSigint);
  process.once('SIGTERM', onSigterm);
  let attempts = 0;
  let lastProbe: Probe | null = null;
  try {
    if (options.initialDelay > 0) {
      const remaining = Math.max(0, deadline - performance.now());
      const delay = Math.min(options.initialDelay, remaining);
      const delayReachesDeadline = options.initialDelay >= remaining;
      progress({ event: 'waiting', phase: 'initial', nextAttempt: 1, delayMs: Math.round(delay) });
      const cancelled = await waitForDelay(delay, cancellation);
      if (cancelled || cancellation.signal) {
        const signal = cancellation.signal ?? 'SIGTERM';
        return {
          code: signal === 'SIGINT' ? 130 : 143,
          result: result('cancelled', started, attempts, lastProbe, { signal }),
        };
      }
      if (delayReachesDeadline)
        return { code: 124, result: result('timeout', started, attempts, lastProbe) };
    }
    while (true) {
      const remaining = deadline - performance.now();
      if (remaining <= 0)
        return { code: 124, result: result('timeout', started, attempts, lastProbe) };
      progress({
        event: 'attempt',
        attempt: attempts + 1,
        remainingMs: Math.round(remaining),
      });
      const attempt = await runAttempt(options, remaining, cancellation);
      attempts += 1;
      lastProbe = probe(attempt);
      if (attempt.kind === 'cancelled') {
        const signal = attempt.cancelSignal ?? 'SIGTERM';
        return {
          code: signal === 'SIGINT' ? 130 : 143,
          result: result('cancelled', started, attempts, lastProbe, { signal }),
        };
      }
      if (attempt.kind === 'deadline')
        return { code: 124, result: result('timeout', started, attempts, lastProbe) };
      if (attempt.kind === 'attempt_timeout') {
        return {
          code: 2,
          result: result('error', started, attempts, lastProbe, { reason: 'attempt_timeout' }),
        };
      }
      if (attempt.kind === 'spawn_error') {
        return {
          code: 2,
          result: result('error', started, attempts, lastProbe, {
            reason: 'spawn_error',
            message: attempt.error?.code ?? attempt.error?.message,
          }),
        };
      }
      if (attempt.exitCode === 0)
        return { code: 0, result: result('success', started, attempts, lastProbe) };
      if (!options.retryExit.has(attempt.exitCode ?? -1)) {
        return {
          code: 2,
          result: result('error', started, attempts, lastProbe, { reason: 'unexpected_exit' }),
        };
      }
      const remainingBeforeSleep = Math.max(0, deadline - performance.now());
      const delay = Math.min(options.interval, remainingBeforeSleep);
      if (delay <= 0) return { code: 124, result: result('timeout', started, attempts, lastProbe) };
      progress({
        event: 'waiting',
        phase: 'retry',
        nextAttempt: attempts + 1,
        delayMs: Math.round(delay),
        lastOutcome: { exitCode: lastProbe.exitCode, signal: lastProbe.signal },
      });
      if ((await waitForDelay(delay, cancellation)) || cancellation.signal) {
        const signal = cancellation.signal ?? 'SIGTERM';
        return {
          code: signal === 'SIGINT' ? 130 : 143,
          result: result('cancelled', started, attempts, lastProbe, { signal }),
        };
      }
      if (delay === remainingBeforeSleep)
        return { code: 124, result: result('timeout', started, attempts, lastProbe) };
    }
  } finally {
    process.removeListener('SIGINT', onSigint);
    process.removeListener('SIGTERM', onSigterm);
  }
};
