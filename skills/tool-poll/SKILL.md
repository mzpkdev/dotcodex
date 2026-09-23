---
name: tool-poll
description: Use the local poll CLI to repeat a command until success or a deadline. Use for bounded readiness and status checks; prefer existing provider watches when they already fit.
---

# Poll commands

Run `/home/mzpk/.codex/tools/poll/poll [options] -- command args`. Arguments after `--`
are literal; use `sh -c` for compound commands or `bash -o pipefail -c` for pipelines.
Repeat observations within the task's authority; the CLI executes the entire command each attempt.

```sh
/home/mzpk/.codex/tools/poll/poll --interval 3m --retry-exit 7,22 -- \
  curl -fsS http://localhost:3000/health
```

CLI defaults: five-minute overall timeout, three-minute retry interval, ten-second attempt timeout,
and retry exit code `1`. Override with `--timeout`, `--interval`, `--attempt-timeout`, and
`--retry-exit 1,7`. Durations take positive integers with `ms`, `s`, `m`, or `h`.
Choose retry codes from the command's actual semantics; other nonzero exits stop immediately.
An attempt timeout is an error, not pending. Pass `--interval 3m` explicitly for the user's fixed
three-minute cadence; do not back off after unchanged results. Honor longer server-required retry
delays. The overall deadline includes attempts and delays; allow enough authorized time for the
intended attempts and follow the owning workflow's total waiting limit.

Use interruptible tool waits within active session limits and communication needs. After a tool
yield, await the same process; do not restart the CLI or reset the workflow deadline.

For a long-running wait that needs visible state, add `--progress`. It writes compact JSON Lines
to stderr before every attempt and delay, including retry exit/signal and the next delay, while
stdout remains the single final result JSON.

Read the final JSON (`status`, `attempts`, `elapsedMs`, `lastProbe`) and its bounded stdout/stderr.
CLI exits: `0` success, `124` overall timeout, `2` error, `130`/`143` cancellation.
Timeout is pending work, not success; follow the owning workflow's stopping rules.
POSIX cleanup terminates the probe's process group and may add 200ms beyond the deadline.

See [CLI details](../../tools/poll/README.md) for dependency setup, examples, and validation commands.
