# poll

Repeat a command until it succeeds or a deadline passes. Prints one JSON result.

## Get started

Requires Node.js 24.12+.

```sh
cd ~/.codex/tools/poll
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm ci
./poll --timeout 30s -- test -f /tmp/ready
```

## Examples

```sh
# Wait for a local service.
./poll --timeout 5m --interval 5s --retry-exit 1,7,22 -- \
  curl --fail --silent http://localhost:3000/health

# Respect a provider's minimum polling interval before the first request.
./poll --timeout 10m --initial-delay 5m -- \
  curl --fail --silent http://localhost:3000/status

# Preview without running the command.
./poll --dry-run -- test -f /tmp/ready

# Use a shell explicitly for pipes or redirects.
./poll --timeout 5m --interval 5s --retry-exit 1,22 -- \
  bash -o pipefail -c 'curl -fsS http://localhost:3000/status | grep -qx ready'
```

## CLI

```text
poll [options] -- command [args...]
```

Put the command and its arguments after `--`. Arguments are passed literally, without a shell.
The first attempt runs immediately unless `--initial-delay` is set. The initial delay counts
toward the overall timeout. Exit `0` succeeds; retryable exit codes run again after the interval.
Any other failure, including an attempt timeout, stops polling.
Use commands that are safe to repeat.

| Option                         | Default | Behavior                                            |
| ------------------------------ | ------- | --------------------------------------------------- |
| `--timeout <duration>`         | `5m`    | Overall deadline.                                   |
| `--interval <duration>`        | `5s`    | Delay between attempts.                             |
| `--initial-delay <duration>`   |         | Delay before the first attempt.                     |
| `--attempt-timeout <duration>` | `10s`   | Time limit for each attempt.                        |
| `--retry-exit <codes>`         | `1`     | Comma-separated exit codes to retry, from 1 to 255. |
| `--dry-run`                    |         | Preview without running the command.                |
| `--help`                       |         | Show usage.                                         |

Durations are positive integers followed by `ms`, `s`, `m`, or `h`.

## Result

JSON includes `status`, `attempts`, `elapsedMs`, and `lastProbe`. The last probe contains
its exit code, signal, stdout, and stderr. Output is capped at 8 KiB per stream, with
`stdoutTruncated` and `stderrTruncated` flags. Errors can include `reason` and `message`;
invalid arguments return `status: "error"`, `reason`, and `message`.

| Exit code     | Meaning                                |
| ------------- | -------------------------------------- |
| `0`           | Success or dry run.                    |
| `2`           | Invalid arguments or a terminal error. |
| `124`         | Overall deadline reached.              |
| `130` / `143` | Cancelled by SIGINT / SIGTERM.         |
