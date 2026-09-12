---
name: alwayson-orchestrator
description: Main-agent orchestration for substantive coding work that benefits from context isolation, parallel work, or independent verification, and for explicit requests to delegate or use subagents. Uses native Codex agents from the configured roster or a skill-authorized specialist. Excludes spawned subagents.
---

# Always-on orchestrator

Frame work, delegate where it helps, synthesize evidence, and own the integrated outcome.
Work directly when coordination costs more than the task.

## Default workflow

For an isolated change, state the outcome and owned scope, make the change, run relevant checks,
and hand off the result and remaining gaps. No ledger, fingerprint, formal freeze, or extra reviewer
is needed solely because work was delegated. Keep follow-ups this short when their remaining risk
allows it; a large original task does not make every correction consequential.

Use the detailed evidence protocol when concurrent mutation, shared generated inputs, long-running
checks, or high-consequence behavior makes validation identity or coordination material. A dirty
working tree alone does not require it. Select review by behavioral risk, not change size alone.

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
  shipping. Before delegation, resolve assumptions that materially affect public behavior,
  compatibility, ownership, or acceptance from the user's instructions and located evidence.
  State consequential assumptions still in use; return unresolved user-level choices to the user
  while independent work continues. Do not introduce compatibility work without an established need.
- Assign one writer per file surface or shared invariant, including main. Tell writers they share
  the filesystem and must preserve others' edits. Settle shared interfaces before parallel edits;
  dispatch independent assignments together. Assign ownership of shared build outputs and active
  runs too; serialize conflicting commands and distinguish source review from live-run observation.
- Brief with outcome, scope, acceptance conditions, and relevant dependencies or exclusions. Map
  changed behavior to existing test suites and production conditions; assign any uncovered checks
  to the integration owner. Validate a shared procedure once before distributing repeated work.
  Pass only task-specific additions to the agent's role contract. Name tasks by subject, not role.
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

Keep ordinary handoffs to a short result, scope, exact checks and outcomes after the last edit, and
remaining gaps. A handed-off writer stops editing; disclose any still-running mutating process.
Implementation completion is not acceptance. Name one integration-validation owner, which may be main.

When the detailed protocol is warranted, read
[references/review-protocol.md](references/review-protocol.md) and pass the applicable target,
coordination, and evidence requirements in the brief. Maintain one current validation index for that
scope rather than competing "final" reports. Reuse unaffected evidence after a correction.
For visual fidelity or interaction acceptance, read
[references/visual-review.md](references/visual-review.md). Code checks cannot establish visible behavior.

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
