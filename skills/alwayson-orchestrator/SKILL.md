---
name: alwayson-orchestrator
description: Main-session orchestration mode for coding work. Use proactively for nontrivial tasks where native Codex subagents can preserve context, parallelize work, or independently verify results. Also use whenever the user asks to spawn, dispatch, throw, delegate, fan out, parallelize, hand off, or use agents/subagents. Applies only to the main agent, never spawned subagents. Use the configured generic roster or a specialist explicitly authorized by another applicable skill.
---

# Always-On Orchestrator

Frame work, dispatch bounded tasks, synthesize results, and remain accountable. Consider
delegation, but work directly when coordination costs more than the task.

## Scope and activation

Apply only as the main interactive agent. Spawned subagents or agents with bounded assignments
ignore this skill and complete their role without delegation, whether generic or specialized.
Use native Codex subagents only: do not use nodeterm/canvas sessions, external agent CLIs,
worktrees, or other orchestration unless the user explicitly requests one. Suspend this mode when
the user asks not to use subagents.

Activate for requests to **spawn**, **dispatch**, **throw**, **delegate**, **fan out**,
**parallelize**, **hand off**, **send work to**, or similar agent/subagent work; also proactively
when substantive work benefits from context isolation, parallelism, specialization, or independent
verification.

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

Do not invent generic types when one fits. Only `fixer` and `sweeper` intentionally edit: send
implementation judgment to `fixer` and explicit repeatable work to `sweeper`. If preview access or
the separate Spark quota makes `probe` unavailable, run the bounded check directly or use the
writer's validation; do not escalate merely to compress logs.

An applicable loaded skill can authorize a named specialist for its narrow workflow. Dispatch it
only when that skill applies and its trigger is satisfied; follow its input, permission, tool, and
output contract. Specialists are outside this roster: do not substitute one outside its scope, route
through a subagent, or add all specialists here. Spawn from main and treat it as read-only unless its
configuration and owning skill both authorize writes. The owning skill defines its boundary.

## Delegate deliberately

Delegate when workstreams are independent; exploration spans many files or references; external
evidence needs synthesis; implementation has an accepted outcome; a mechanical procedure is exact;
tests, builds, or logs may produce substantial output; or independent review materially reduces risk.
Work directly for one small read/search/lookup, a tiny edit tightly coupled to active orchestration,
reconciling reports or checking a disputed detail needing little context, or when briefing and reporting
cost more than the work. For each spawn, name the uncertainty, workload, or risk reduced.

Before exploration, identify the exact answer and useful concurrent main-agent work. Do not race a
`runner` through the same files. If a prerequisite has a short local answer, read it. Ask
investigators for decisive early findings rather than withholding them for a complete map.

## Orchestration loop

1. Retain outcome, constraints, uncertainty, risk, and decisions in the main session.
2. Split by dependency; dispatch independent tasks together.
3. Give each agent a self-contained objective, context, scope, non-goals, expected output, and validation duty.
   Separate user requirements, direct evidence and its location, hypotheses, and open questions;
   preserve uncertainty rather than promoting extracts or conclusions to requirements.
4. Assign one writer per file surface or shared invariant, including main. Writers share the
   filesystem and preserve others' edits. Serialize overlapping changes, formatters, snapshots, and
   validation that writes shared artifacts. Transfer ownership only after the earlier writer stops.
5. Read every report, distinguish evidence from inference, resolve contradictions, and judge rather
   than relay conclusions.
6. Reuse an agent session for narrow follow-ups where practical.
7. Verify for risk: `probe` for objective checks, `critic` for correctness, and `architect` for
   consequential framing/design.
8. Adjudicate below, address accepted fixes, rerun relevant checks, and deliver one integrated result.

## Judge findings

The main agent decides across reports. A critic finding is a claim, not an implementation order; do
not forward its list wholesale or optimize for silence. Weigh evidence, user requirements, impact and
likelihood, affected users, scope, and fix cost, including complexity, maintenance, and regression.
Severity and proposed remedies are advisory; seek the simplest sufficient fix.

For each finding, choose and briefly justify:

- **Fix:** it matters, or a small safe in-scope correction is worthwhile; prioritize substantial
  defects and useful easy fixes, but do not change unrelated work merely because it is cheap.
- **Investigate:** it could matter but lacks evidence; get the smallest discriminating reproduction,
  inspection, or follow-up.
- **Defer/accept:** it is real but its benefit does not justify complexity, risk, or scope (for
  example, an unlikely edge case needing invasive machinery); record behavior and rationale.
- **Reject:** it is wrong, duplicate, out of scope, or unsupported; state the evidence/boundary and
  distinguish this from accepting a real limitation.

These are aids, not a score. Do not waive explicit criteria or required checks for cost, or dismiss a
high-consequence rare failure. Escalate only user-level tradeoffs. Keep material dispositions in
session context, pass only accepted fixes to writers, and give returning critics rejected/deferred
rationale; reopen a decision on contrary evidence. Never pressure a critic to retract a valid point.
Completion is the requested outcome plus verified accepted fixes, not every suggestion. Disclose
material limitations and distinguish the main acceptance decision from critic findings.
NEVER call a knowingly retained issue fixed or claim a critic found nothing when it did.

## Progress, handoff, and review identity

Track each active assignment in session context: owner, scope, phase (investigating, editing,
validating, blocked, done), last evidence, and next dependency; create a tracking file only when it
helps. Ask for phase changes, blockers, and unexpectedly long commands with exact commands and
process/session handles when available. A timeout shows no
report, not that tests run or work is stuck; request concise status once, inspect agent/process state,
then wait or take over. NEVER start a replacement writer while the first can still mutate.

Implementation and validation reports name the exact commands, working directory, outcome, unresolved failure,
and exercised state. Failures include assertion/error, available log or process handle, diagnosis evidence,
and next useful step. An incomplete E2E diagnosis is partial work.

When independent review is warranted, integrate first and pause writers to freeze the surface; this
does not require committing or stashing user work. Identify repository path, review base, HEAD, scoped
paths, and a reproducible fingerprint of reviewed content, including staged/unstaged changes and
relevant untracked files (HEAD alone is insufficient). A saved diff digest plus untracked
path/content manifest is one option; use a scoped path/content manifest outside Git. Include relevant
configuration, dependencies, and reference/render artifacts.

Give critics the outcome and raw evidence, state whether correctness, visual fidelity, or both are in
scope, and name exclusions. Reviewers/validators verify identity before and after; report commands,
artifacts, coverage limits, and whether state changed. A moving target yields only a partial/stale
verdict. Material edits, rebases, merges, conflicts, dependency changes, or reference changes
invalidate affected verdicts and checks: reuse the critic for focused review, including integration effects, and rerun
affected validation. Bookkeeping can retain evidence only after confirming relevant content is identical
and recording why. Before completion compare delivered, reviewed, and tested states; resolve mismatches
and do not carry a pre-rebase sign-off onto changed integration. Evidence stays proportional: hashes
and critics are not mandatory for tiny edits, but “no actionable findings” names its scope and never
means unexamined properties passed.

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

The main agent owns intent, decomposition, selection, judgment, tradeoffs, preservation of unrelated
work, and honest reporting. It may make small efficient reads/writes without duplicating delegated
work; subagents supply evidence and recommendations, while main remains accountable.
