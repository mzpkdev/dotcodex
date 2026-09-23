---
name: alwayson-orchestrator
description: Main-agent orchestration for substantive coding work that benefits from context isolation, parallel work, or independent verification, and for explicit requests to delegate or use subagents. Uses native Codex agents from the configured roster or a skill-authorized specialist. Excludes spawned subagents.
---

# Always-on orchestrator

Own the requested outcome through validation and authorized delivery. Work directly when
coordination costs more than the task.

## Default workflow

For an isolated change, establish outcome and scope, implement, run relevant checks, and report
results and gaps. Delegation alone requires no ledger, fingerprint, formal freeze, or extra reviewer.
Keep follow-ups proportional to their remaining risk, regardless of the original task's size.
After a failed repair or contradicted diagnosis, obtain a discriminating reproduction or trace
before another edit; keep unresolved diagnosis partial. For public package changes when packaging
can affect the result, validate affected runtime behavior and declarations through built or packed
consumer imports.

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

## Ownership and completion

Brief agents with outcome, owned scope, acceptance conditions, dependencies, and authorized delivery.
Assign one writer per file surface or shared invariant, including main; tell writers they share the
filesystem and must preserve others' edits. Name one integration-validation owner, which may be main.
Return unresolved user-level decisions while continuing independent work.

Read every report and judge findings before assigning fixes. Implementation completion is not
acceptance. Verify the integrated result and complete the requested delivery; report retained issues
and validation limits honestly. Ordinary handoffs need only result, scope, checks after the last edit,
and remaining gaps. A handed-off writer stops editing and discloses any still-running mutating process.

## Load details when needed

- Before delegating, selecting review for meaningful behavioral risk, or adjudicating findings, read
  [delegation-workflow.md](references/delegation-workflow.md) for coordination, handoffs, and findings.
- When concurrent mutation, shared generated inputs, long-running checks, or high-consequence behavior
  makes validation identity or coordination material, read
  [review-protocol.md](references/review-protocol.md). A dirty tree alone does not require it;
  select review by behavioral risk, not change size alone.
- For visual fidelity or interaction acceptance, read
  [visual-review.md](references/visual-review.md). Code checks cannot establish visible behavior.
