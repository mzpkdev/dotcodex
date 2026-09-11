# poll

`poll` runs a command immediately and repeats it until it exits `0`, reaches the overall deadline, or encounters an error. It prints one compact JSON result to standard output.

Requires Node.js 24.12 or later. Examples run from `~/.codex`; from other directories,
use `~/.codex/tools/poll/poll`. TypeScript source runs directly through the launcher;
cmdore handles arguments and WebAnvil provides formatting, checks, tests, and builds.

```sh
cd ~/.codex/tools/poll
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm ci
npm run format
npm run check
npm test
npm run build
```

The environment flag skips WebAnvil's unused browser download. Run `./poll` for the source
entry point or `node dist/index.js` for the build. `--dry-run` previews the command without
starting it; place probe arguments after `--` so their flags remain literal.

```sh
tools/poll/poll --timeout 5m --interval 5s --retry-exit 1,7,22 -- \
  curl --fail --silent http://localhost:3000/health
```

The overall timeout defaults to five minutes. The interval defaults to five seconds; an individual command has a ten-second timeout. Durations use a positive integer and `ms`, `s`, `m`, or `h`.

```sh
tools/poll/poll --timeout 5m --interval 30s --attempt-timeout 10s --retry-exit 1,7 -- command arg1 arg2
```

There is no implicit shell: arguments are passed literally. For pipes, redirects, or compound commands, choose a shell explicitly:

```sh
tools/poll/poll --timeout 5m --interval 5s --retry-exit 1,22 -- \
  bash -o pipefail -c 'curl -fsS http://localhost:3000/status | grep -qx ready'
```

Exit `0` succeeds. Listed `--retry-exit` codes are treated as pending (default: `1`) and run again after the interval. Any other non-zero exit is terminal. Retrying runs the command again, so use it for observations, not commands that make a non-idempotent change.

One attempt timing out is a terminal error. An overall timeout exits `124`; terminal errors exit `2`; `SIGINT` and `SIGTERM` exit `130` and `143`. On POSIX systems `poll` terminates the command's process group on a deadline, cancellation, or attempt timeout. It gives the group 200ms to exit after `SIGTERM` before sending `SIGKILL`, so cleanup can add up to 200ms to the deadline.

The JSON result has `status`, `attempts`, `elapsedMs`, and `lastProbe`. `lastProbe` includes the exit code or signal and bounded stdout/stderr. Each stream is capped at 8 KiB and gets a corresponding `*Truncated` flag.
