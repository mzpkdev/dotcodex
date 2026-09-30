---
name: tool-poll
description: Use for bounded readiness and status checks that repeat until an observable condition succeeds or a deadline is reached. Use available status commands, provider watches, and interruptible waits.
---

# Observe until ready

Establish the exact target and revision, success condition, terminal failures, and total waiting
limit before repeating a check. Observe only within the task's authority; repeating a command
must not repeat an unintended mutation.

- Inspect immediately, then wait three minutes (180 seconds) between repeated status checks.
  Keep that cadence fixed; honor a longer server-required retry delay. Prefer an existing provider
  watch only when it can follow the same cadence and the workflow's waiting limit.
- Use the command or provider's actual status semantics to distinguish success, pending work,
  retryable failures, and terminal errors. Unknown state or an attempt timeout is not success.
- Bound each attempt and the entire wait by the remaining workflow budget. When no owning
  workflow or user limit applies, use a five-minute total waiting limit.
- Use interruptible waits that allow user steering and timely progress updates. Continue
  independent work while waiting. Resuming the same running process does not require another
  status check; do not restart its deadline after a tool yield.
- Recheck mutable target identity on each observation so results for an obsolete revision cannot
  pass. Stop on verified success, a terminal failure, cancellation, or the applicable deadline.
- On exit, stop any watcher started for this wait and report the last observed target, status,
  elapsed time, and remaining dependency. A timeout means pending work, not completion.

Follow the owning workflow's stopping conditions and waiting budget; do not infer authorization
for indefinite monitoring, retries that mutate state, or background work after the session.
