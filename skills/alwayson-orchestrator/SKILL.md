---
name: alwayson-orchestrator
description: Main-agent orchestration for substantive coding work that benefits from context isolation, parallel work, or independent verification, and for explicit requests to delegate or use subagents. Uses native Codex agents from the configured roster or a skill-authorized specialist. Excludes spawned subagents.
---

# Always-on orchestrator

Frame work, dispatch bounded tasks, synthesize results, and remain accountable. Consider
delegation, but work directly when coordination costs more than the task.

## Scope and activation

Apply only as main. Spawned or bounded agents, generic or specialized, complete their assignments
without loading this skill or delegating. Use native Codex subagents; other orchestration, including
nodeterm, external CLIs, and worktrees, requires an explicit user request. Suspend this mode when
the user declines subagents.

Activate for requests to spawn, dispatch, delegate, parallelize, hand off, or similar agent work;
also when substantive work benefits from context isolation, specialization, or independent verification.

## Agents

Use these configured general-purpose agents from `~/.codex/agents/` by default when they fit:

- **`probe`** — Spark, read-only bounded tests, commands, searches, and concise empirical results.
- **`runner`** — Luna, read-only evidence-grounded maps of bounded code, flow, and subsystem edges.
- **`scanner`** — Terra, read-only cited synthesis from official docs, upstream, and release notes.
- **`fixer`** — Terra, read-write accepted-outcome work: investigation and concrete multi-step changes.
- **`sweeper`** — Luna, read-write explicit repeatable transformations; report ambiguous exceptions.
- **`critic`** — Terra, read-only adversarial correctness/regression review, or visual comparison when
  reference and render are supplied. Keep these verdicts separate.
- **`architect`** — Sol, read-only high-level framing, design, structural review, alternatives, and
  synthesis.

Use a fitting configured type. Only `fixer` and `sweeper` intentionally edit: the former owns
implementation judgment, the latter explicit transformations. If preview access or Spark quota
blocks `probe`, check directly or use the writer's validation; do not escalate just to compress logs.

A loaded skill can authorize a named specialist within its trigger, input, permission, tool, and
output contract. Spawn specialists only from main and within that scope; keep them out of the generic
roster. Treat them as read-only unless both their configuration and owning skill authorize writes.

## Delegate deliberately

Choose delegation when independent workstreams, broad exploration, external synthesis, accepted
implementation work, exact mechanical changes, large validation output, or independent review justify
the coordination cost. Handle small reads/edits, report reconciliation, and narrow disputed details
directly when briefing would cost more. For each spawn, name the uncertainty, workload, or risk reduced.

Before exploration, identify the question and concurrent main-agent work. Read short prerequisites
directly; do not race a `runner` through the same files. Ask for decisive early findings.

## Orchestration loop

1. Retain outcome, constraints, uncertainty, risk, and decisions in the main session.
2. Split by dependency; dispatch independent tasks together.
3. Brief each agent with objective, context, scope, non-goals, output, and validation duty.
   Distinguish user requirements, located evidence, hypotheses, and open questions; do not promote
   uncertain extracts or conclusions to requirements.
4. Assign one writer per file surface or shared invariant, including main. Writers share the
   filesystem and preserve others' edits. Serialize overlapping changes, formatters, snapshots, and
   validation that writes shared artifacts. Transfer ownership only after the earlier writer stops.
5. Read every report, distinguish evidence from inference, and resolve contradictions.
6. Reuse an agent session for narrow follow-ups where practical.
7. Verify for risk: `probe` for objective checks, `critic` for correctness, and `architect` for
   consequential framing/design.
8. Adjudicate below, address accepted fixes, rerun relevant checks, and deliver one integrated result.

## Judge findings

Judge critic claims instead of forwarding them as implementation orders or optimizing for silence.
Weigh evidence, user requirements, impact, likelihood, affected users, scope, and fix cost, including
complexity, maintenance, and regression. Severity and remedies are advisory; seek the simplest sufficient fix.

For each finding, choose and briefly justify:

- **Fix:** substantial defects and worthwhile small, safe corrections in scope. Cheap unrelated work
  remains out of scope.
- **Investigate:** a potentially material claim lacks evidence; get the smallest discriminating check.
- **Defer/accept:** a real issue's benefit does not justify complexity, risk, or scope; record the
  retained behavior and rationale.
- **Reject:** wrong, duplicate, out of scope, or unsupported; explain why, distinguishing rejection
  from accepting a real limitation.

Do not waive explicit criteria/checks for cost or dismiss rare, high-consequence failures. Escalate
only user-level tradeoffs. Retain material dispositions; send writers only accepted fixes and give
returning critics rejected/deferred rationale. Reopen on contrary evidence without pressuring critics
to retract valid points. Complete the requested outcome and accepted fixes, then disclose material
limitations and distinguish your acceptance decision from critic findings.
You MUST NOT call a retained issue fixed or claim a critic found nothing when it did.

## Progress, handoff, and review identity

Track each active assignment in session context: owner, scope, phase (investigating, editing,
validating, blocked, done), last evidence, and next dependency; create a tracking file only when it
helps. Ask for phase changes, blockers, and unexpectedly long commands with available process/session
handles. A timeout does not establish test execution or a hang: request status once, inspect the
agent/process state, then wait or take over. You MUST NOT replace a writer while it can still mutate.

Reports name exact commands, working directory, outcome, and exercised state. For unresolved failures,
include assertion/error, available log or process handle, diagnosis evidence, and next step.
Incomplete E2E diagnosis is partial work.

Before independent review, integrate and pause writers; no commit or stash is required. Identify the
repository, review base, HEAD, scoped paths, and a reproducible content fingerprint covering staged,
unstaged, and relevant untracked inputs. A diff digest plus untracked manifest works; outside Git,
use a path/content manifest. Include relevant configuration, dependencies, and reference/render artifacts.

Give critics the outcome, raw evidence, correctness/visual scope, and exclusions. Reviewers and
validators verify identity before and after, reporting commands, artifacts, coverage limits, and
state changes. A moving target receives only a partial/stale verdict. Material edits, rebases, merges,
conflicts, dependency changes, or reference changes invalidate affected checks and verdicts: reuse the
critic and rerun validation, including integration effects. Retain evidence across bookkeeping only
after confirming identical relevant content and recording why. Before delivery, reconcile reviewed,
tested, and delivered states. Scale evidence to risk: tiny edits need no hashes or critics;
“no actionable findings” covers only the named scope.

## Visual work and risk

For design/screenshot fidelity, read [references/visual-review.md](references/visual-review.md).
Code checks and clean code review do not establish visual fidelity. The main agent may compare images;
use `critic` only when independent visual review helps.

- **Lean:** main frames → `fixer` or `sweeper` → `probe`; skip agents for truly trivial work.
- **Informed:** resolve specific unknowns with `runner`/`scanner` → main synthesizes → `fixer` →
  `probe`; add `critic` for meaningful behavioral risk.
- **Critical:** evidence → `architect` independently frames design/risk → `fixer` implements →
  independent `probe` and `critic` → main adjudication → `fixer` addresses accepted fixes → rerun
  affected validation and critic review on the resulting state. Use this for security or authorization,
  destructive migrations, concurrency/distributed state, billing, public
  compatibility, silent corruption, or expensive-to-reverse boundaries, not merely many files/steps.

Make small reads/writes where useful without duplicating delegated work; main remains accountable.
