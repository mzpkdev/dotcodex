---
name: alwayson-orchestrator
description: Main-agent orchestration for substantive coding work that benefits from context isolation, parallel work, or independent verification, and for explicit requests to delegate or use subagents. Uses native Codex agents from the configured roster or a skill-authorized specialist. Excludes spawned subagents.
---

# Always-on orchestrator

Frame work, delegate where it helps, synthesize evidence, and own the integrated outcome.
Work directly when coordination costs more than the task.

## Scope and roles

Apply only as main. Spawned agents complete their bounded assignments without loading this skill
or delegating. Use native Codex subagents; nodeterm, external agent CLIs, and worktree orchestration
require an explicit user request. Suspend delegation when the user declines it.

Delegate for explicit requests or when independent work, context isolation, or independent judgment
justifies it. For each spawn, name the uncertainty, workload, or risk reduced and the concurrent
main-agent work. Read short prerequisites directly; do not duplicate delegated exploration.

Choose a fitting configured agent from `~/.codex/agents/`:

| Agent | Assignment |
| --- | --- |
| `runner` | Map a bounded local execution path or subsystem. |
| `scanner` | Resolve a question requiring external, cited evidence. |
| `fixer` | Investigate, implement, and validate an accepted outcome. |
| `sweeper` | Apply an explicit mechanical transformation within a bounded surface. |
| `probe` | Measure a specified condition or run bounded checks. |
| `critic` | Independently challenge correctness or inspect visual fidelity. |
| `architect` | Resolve a consequential design, interface, or product-framing question. |

Only `fixer` and `sweeper` implement source changes. Probe and critic may retain validation artifacts and reports
within their configured contracts; assign output locations that avoid other writers. A loaded skill
may authorize a named specialist within its trigger, input, permission, tool, and output contract.
Spawn specialists only from main; source writes require both configuration and skill authorization.

Choose roles by need; main may implement or validate directly. Use a critic for meaningful
behavioral risk; for high-consequence boundaries, pair independent review with integration evidence.
An architect needs an unresolved design question; a probe needs a useful independent measurement.
If probe access or quota blocks it, validate directly or use writer evidence rather than escalating
just to compress logs. Reviewer independence is separation from implementation, not a fresh session
for every correction.

## Brief and coordinate

- Retain the requested outcome, constraints, decisions, and delivery condition, including authorized
  shipping. Separate requirements, located evidence, hypotheses, and open questions.
- Assign one writer per file surface or shared invariant, including main. Tell writers they share
  the filesystem and must preserve others' edits. Settle shared interfaces before parallel edits;
  dispatch independent assignments together and serialize overlapping writes or shared build outputs.
- Brief with objective, owned scope, dependencies, non-goals, acceptance conditions, validation duty,
  and the handoff below. Name production conditions the checks need to exercise, rather than only
  commands that happen to pass. Validate a shared procedure once before distributing repeated work.
- After a failed repair or contradicted diagnosis, get the smallest discriminating reproduction or
  trace before another implementation attempt. Keep unresolved diagnosis partial.
- Reuse agents for related follow-ups. Use `send_message` for a running agent; `followup_task` assigns
  new work and restarts an idle or completed agent. A message alone does not restart one.
- Track owner, scope, phase, evidence, and next dependency. Retain completed assignments and their
  outcomes; use a small task-local ledger when session context becomes difficult to manage.
- Request updates on phase changes, blockers, or unexpectedly long commands with process/session
  handles. A quiet process or timeout does not prove a hang: inspect status once, then wait or take
  over safely. You MUST NOT replace a writer while it can still mutate.

## Handoff and acceptance

Each handoff names the result and owned scope; whether editing and mutating processes have stopped;
exact checks, working directory, outcomes, and exercised state; evidence paths for expensive checks;
and remaining gaps or integration dependencies. A failed check includes the assertion/error,
diagnosis evidence, and next step. Editorial handoffs also identify important guidance removed or
consolidated and changed anchors. Keep reports concise; implementation completion is not acceptance.

Name one final-validation owner, which may be main. For shared or consequential work, track the
relevant scope as **editing → frozen for review/integration → accepted**. Freeze only after relevant
writers acknowledge stopping and their mutating processes finish. Run final checks and review on
that scope; focused development checks may run earlier. Reopening the scope returns it to editing
and invalidates affected evidence. A conversational label alone does not establish a freeze.

Before independent review or integration validation involving shared, dirty, long-running, or
high-consequence state, read [references/review-protocol.md](references/review-protocol.md) and pass
its applicable evidence contract to agents. Tiny isolated edits need no hashes or extra reviewers.
For design or screenshot acceptance, read [references/visual-review.md](references/visual-review.md).
Code checks cannot establish visual fidelity.

## Judge and deliver

Read every report and adjudicate findings; do not forward claims as implementation orders or optimize
for reviewer silence. Weigh evidence, realistic impact, likelihood, scope, and fix/regression cost.
Briefly record material dispositions:

- **Fix:** a defect or worthwhile safe correction within scope.
- **Investigate:** a potentially material claim needs a discriminating check.
- **Defer/accept:** a real limitation does not justify the remedy; retain the behavior and rationale.
- **Reject:** wrong, duplicate, unsupported, or out of scope; explain the distinction from accepted risk.

Do not waive explicit criteria for cost or dismiss rare, high-consequence failures. Send writers only
accepted fixes; give returning critics rejected/deferred rationale, and reopen on contrary evidence.
Escalate user-level tradeoffs without pressuring reviewers to retract valid findings.

Reconcile tested, reviewed, and delivered states, including integration effects after corrections.
Complete the requested delivery condition and disclose material limits. You MUST NOT call a retained
issue fixed or claim a critic found nothing when it did. “No actionable findings” covers only the
reviewed scope; main's acceptance remains a separate judgment.
