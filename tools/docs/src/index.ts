#!/usr/bin/env node

import { execute } from 'cmdore';

import { readCommand, searchCommand, treeCommand } from './commands/index.ts';

export const main = async (argv = process.argv.slice(2)): Promise<number> =>
  execute([treeCommand, searchCommand, readCommand], {
    argv,
    metadata: {
      name: 'docs',
      version: '0.1.0',
      description: 'Browse current documentation with bounded output.',
    },
    onError: 'throw',
  });

main().then(
  (code) => {
    process.exitCode = code;
  },
  (error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    const exitCode =
      typeof error === 'object' && error !== null && 'exitCode' in error
        ? Number(error.exitCode)
        : 1;

    if (process.argv.includes('--json')) {
      process.stdout.write(`${JSON.stringify({ error: message, exitCode })}\n`);
    } else {
      process.stderr.write(`${message}\n`);
    }

    process.exitCode = Number.isInteger(exitCode) && exitCode > 0 ? exitCode : 1;
  },
);
