#!/usr/bin/env node

import { effect, execute, defineArgument, defineCommand, defineOption } from 'cmdore';

import {
  DEFAULT_ATTEMPT_TIMEOUT_MS,
  DEFAULT_INTERVAL_MS,
  DEFAULT_TIMEOUT_MS,
  duration,
  poll,
  retryExit,
  type PollOutcome,
} from './poll.ts';

class PollOutcomeError extends Error {
  readonly outcome: PollOutcome;

  constructor(outcome: PollOutcome) {
    super(outcome.result.status);
    this.outcome = outcome;
  }
}

const command = defineArgument({
  name: 'command',
  description: 'Command and literal arguments after --.',
  variadic: true,
  required: true,
});

const timeout = defineOption({
  name: 'timeout',
  hint: 'DURATION',
  description: 'Overall deadline (default: 5m).',
  arity: 1,
  defaultValue: () => DEFAULT_TIMEOUT_MS,
  coerce: (value) => duration(value, '--timeout'),
});
const interval = defineOption({
  name: 'interval',
  hint: 'DURATION',
  description: 'Delay between retries (default: 5s).',
  arity: 1,
  defaultValue: () => DEFAULT_INTERVAL_MS,
  coerce: (value) => duration(value, '--interval'),
});
const attemptTimeout = defineOption({
  name: 'attempt-timeout',
  hint: 'DURATION',
  description: 'Maximum time for one attempt (default: 10s).',
  arity: 1,
  defaultValue: () => DEFAULT_ATTEMPT_TIMEOUT_MS,
  coerce: (value) => duration(value, '--attempt-timeout'),
});
const retry = defineOption({
  name: 'retry-exit',
  hint: 'CODES',
  description: 'Comma-separated retryable exit codes (default: 1).',
  arity: 1,
  defaultValue: () => new Set([1]),
  coerce: retryExit,
});

const write = (value: unknown): void => {
  process.stdout.write(`${JSON.stringify(value)}\n`);
};

const pollCommand = defineCommand({
  name: 'poll',
  description: 'Repeat a literal command until it succeeds or its deadline passes.',
  arguments: [command],
  options: [timeout, interval, attemptTimeout, retry],
  examples: ['--timeout 5m --interval 5s -- curl -fsS http://localhost:3000/health'],
  run: async (argv) => {
    if (!effect.enabled) {
      write({
        status: 'dry-run',
        attempts: 0,
        elapsedMs: 0,
        lastProbe: null,
        command: argv.command,
      });
      return;
    }
    const outcome = await poll({
      timeout: argv.timeout,
      interval: argv.interval,
      attemptTimeout: argv['attempt-timeout'],
      retryExit: argv['retry-exit'],
      command: argv.command,
    });
    if (outcome.code === 0) {
      write(outcome.result);
      return;
    }
    throw new PollOutcomeError(outcome);
  },
});

const hasBoundary = (argv: string[]): boolean => argv.includes('--');
const requestsMetadata = (argv: string[]): boolean =>
  argv.includes('--help') ||
  argv.includes('-h') ||
  argv.includes('--version') ||
  argv.includes('-v');

const hasOnlyOptionsBeforeBoundary = (argv: string[]): boolean => {
  const boundary = argv.indexOf('--');
  const valueOptions = new Set(['--timeout', '--interval', '--attempt-timeout', '--retry-exit']);
  for (let index = 0; index < boundary; index += 1) {
    const token = argv[index];
    if (valueOptions.has(token)) {
      index += 1;
      continue;
    }
    if (
      token === '--help' ||
      token === '-h' ||
      token === '--version' ||
      token === '-v' ||
      token === '--dry-run' ||
      token === '--json' ||
      token === '--quiet' ||
      token === '--verbose' ||
      token === '--no-colors' ||
      [...valueOptions].some((option) => token.startsWith(`${option}=`))
    ) {
      continue;
    }
    return false;
  }
  return true;
};

export const main = async (argv = process.argv.slice(2)): Promise<number> => {
  if (
    (!hasBoundary(argv) && !requestsMetadata(argv)) ||
    (hasBoundary(argv) && !hasOnlyOptionsBeforeBoundary(argv))
  ) {
    write({ status: 'error', reason: 'invalid_arguments', message: 'command must follow --' });
    return 2;
  }
  try {
    return await execute(pollCommand, {
      argv,
      metadata: {
        name: 'poll',
        version: '0.1.0',
        description: 'Poll a command with a bounded deadline.',
      },
      onError: 'throw',
    });
  } catch (error) {
    if (error instanceof PollOutcomeError) {
      write(error.outcome.result);
      return error.outcome.code;
    }
    write({
      status: 'error',
      reason: 'invalid_arguments',
      message: error instanceof Error ? error.message : String(error),
    });
    return 2;
  }
};

main().then((code) => {
  process.exitCode = code;
});
