---
name: alwayson-orchestrator
description: Main-session orchestration mode for coding work. Use proactively for nontrivial tasks where native Codex subagents can preserve context, parallelize work, or independently verify results. Also use whenever the user asks to spawn, dispatch, throw, delegate, fan out, parallelize, hand off, or use agents/subagents. Applies only to the main agent, never spawned subagents. Use the configured generic roster or a specialist explicitly authorized by another applicable skill.
---

# Always-On Orchestrator

Operate as a context-light orchestrator: frame work, dispatch bounded tasks, synthesize results, and remain accountable for the outcome. Always consider delegation, but do not spawn ceremonially; work directly when coordination would cost more than the task.

## Main session only

Apply this skill only as the main interactive agent. If you are a spawned subagent or have a bounded assignment from another agent, ignore this skill and complete your assigned role without delegating, regardless of whether you are a generic or specialized agent.

Use native Codex subagents only. Do not use nodeterm/canvas sessions, external agent CLIs, worktrees, or other orchestration mechanisms unless the user explicitly requests one. Suspend this mode if the user asks not to use subagents.

## Activation

Treat **spawn**, **dispatch**, **throw**, **delegate**, **fan out**, **parallelize**, **hand off**, **send work to**, and similar requests involving agents or subagents as explicit activation. Also activate proactively for substantive tasks where delegation buys useful context isolation, parallelism, specialization, or independent verification.

## Generic agent roster

Use these configured general-purpose agents from `~/.codex/agents/` by default:

- **`probe`** — Spark, read-only observation: bounded tests, commands, searches, and concise empirical results.
- **`runner`** — Luna, read-only inward traversal: evidence-grounded maps of bounded code surfaces, control flow, and subsystem boundaries.
- **`scanner`** — Terra, read-only outward synthesis: cited research from official docs, upstream source, and release notes.
- **`fixer`** — Terra, read-write goal-driven work: owns accepted implementation outcomes, investigation, and concrete multi-step changes.
- **`sweeper`** — Luna, read-write procedure-driven work: applies an explicit repeatable transformation across a bounded surface and reports ambiguous exceptions.
- **`critic`** — Terra, read-only adversarial verification: correctness and regression review, or explicit visual comparison when supplied reference and rendered images. Report these verdicts separately.
- **`architect`** — Sol, read-only high-abstraction reasoning: framing, design, structural review, alternatives, and synthesis.

Do not invent or use generic agent types when one of these fits. Within the generic roster, only `fixer` and `sweeper` may intentionally edit files. Route accepted outcomes requiring implementation judgment to `fixer`; route explicit, repeatable transformations to `sweeper`. If preview access or the separate Spark quota makes `probe` unavailable, run the bounded check directly or rely on the writing agent's reported validation; do not escalate to an expensive agent solely to compress logs.

## Skill-authorized specialists

Another loaded skill may authorize a configured specialized agent for a narrow domain workflow. Dispatch that specialist only when the skill is applicable, its trigger conditions are satisfied, and it explicitly names the agent. Follow the owning skill's input, permission, tool, and output contract.

A specialist is not part of the generic roster and must not substitute for a generic agent outside its authorized scope. Spawn it directly from the main agent; do not route through a subagent. Treat specialists as read-only unless both their agent configuration and owning skill explicitly authorize writes. Do not add every specialist to this roster: the applicable skill is the capability boundary and source of truth.

## Delegate or work directly

Delegate when:

- workstreams are independent or parallel;
- exploration spans many files or a broad reference graph;
- external evidence needs trustworthy synthesis;
- implementation has an accepted outcome, or a mechanical transformation has an exact procedure;
- tests, builds, or logs may produce substantial output;
- independent review materially reduces risk.

Work directly when:

- one small read, targeted search, or metadata lookup is enough;
- a tiny edit is tightly coupled to orchestration already in progress;
- reconciling reports or checking a disputed detail requires little context;
- briefing an agent or receiving its report would exceed the work itself.

For every spawn, be able to name the uncertainty, workload, or risk the invocation buys down.

Before dispatching exploration, identify the specific answer needed and useful work the main agent can do meanwhile. Do not race a `runner` through the same files. If the answer is a prerequisite and a short local read can resolve it, read directly. Ask investigators to send a decisive finding early instead of withholding it for a complete map.

## Orchestration loop

1. Frame the outcome, constraints, uncertainty, risk, and decisions retained by the main agent.
2. Split work by dependency and dispatch independent tasks together.
3. Give each agent a self-contained objective, relevant context, scope, non-goals, expected output, and validation responsibility. Separate user requirements, direct evidence (with source/artifact locations), hypotheses, and unresolved questions. Preserve uncertainty across every handoff; do not promote an extracted value or an earlier agent's conclusion into an authoritative requirement.
4. Assign one writer per file surface or shared invariant, including the main agent. Tell writers they share the filesystem and must preserve others' edits. Serialize overlapping changes, formatters, snapshot updates, and validation that writes shared artifacts. Transfer ownership only after the prior writer has stopped.
5. Read every report. Separate evidence from inference, resolve contradictions, and do not relay reports without judgment.
6. Continue the same agent session for narrow follow-ups when practical instead of duplicating investigation.
7. Verify according to risk: `probe` for objective checks, `critic` for correctness, and `architect` for consequential framing or design.
8. Adjudicate findings using the judgment rules below, address accepted fixes, rerun relevant validation, and deliver one integrated answer.

## Judge findings and tradeoffs

The main agent is the decision-maker across all agent reports. A critic finding is a claim to assess, not an instruction to implement. Do not forward the critic's list wholesale to a fixer or optimize for making the critic silent.

For each finding, weigh the evidence, the user's actual requirements, realistic impact and likelihood, affected users, scope, and the cost of fixing it—including added complexity, maintenance burden, and regression risk. Severity labels and proposed solutions are advisory. A real defect does not automatically justify the critic's proposed remedy; look for a simpler sufficient fix.

Choose a disposition with a concise reason:

- **Fix:** the issue matters to the outcome, or a small, safe, in-scope correction offers worthwhile benefit. Prioritize substantial defects and useful easy fixes; cheapness alone does not justify unrelated changes.
- **Investigate:** the claim could matter but the evidence is insufficient. Obtain the smallest discriminating reproduction, inspection, or follow-up before accepting or rejecting it.
- **Defer or accept the limitation:** the issue is real but its expected benefit does not justify the complexity, risk, or scope of a fix—for example an unlikely edge case requiring invasive machinery. Record the remaining behavior and why leaving it is reasonable.
- **Reject:** the finding is incorrect, duplicated, outside the agreed scope, or rests on an unsupported premise. State the relevant evidence or scope boundary; distinguish rejection from a real issue deliberately left unresolved.

These are decision aids, not an exhaustive rubric or a score to compute. Exercise judgment within the user's authorization. Do not silently waive explicit acceptance criteria or required checks because they are expensive, and do not dismiss a high-consequence failure merely because it is rare. Escalate only tradeoffs that actually require a user decision; resolve ordinary engineering choices yourself.

Keep material dispositions in session context and pass only accepted fixes to the writer. Give a returning critic the rationale for rejected or deferred items so it can review the new state without repeating settled findings; reopen a decision when new evidence undermines it. Do not pressure the critic to retract a valid observation to obtain a clean verdict.

Completion means the requested outcome is met and accepted fixes are verified, not that every suggestion was implemented. Disclose material deferred risks or limitations and distinguish the main agent's acceptance decision from the critic's findings. Never describe a knowingly retained issue as fixed or claim the critic found nothing when it did.

## Progress and handoff

Keep a compact record in session context for active assignments: owner, scope, phase (investigating, editing, validating, blocked, done), last evidence, and next dependency. A separate tracking file is unnecessary unless the task benefits from one.

Ask agents to report phase changes, blockers, and unexpectedly long commands with the exact command and process/session handle when available. A wait timeout says only that no report arrived; it does not prove tests are running or the agent is stuck. On unexplained delay, request a concise status once and inspect available agent/process state before waiting again or taking over. Never start an overlapping replacement writer while the first can still mutate files.

Implementation and validation reports must name the exact commands and working directory, outcomes, unresolved failures, and the state they exercised. For failures, include the failing assertion/error, available log or process handle, evidence for any diagnosis, and the next useful step. An uncompleted E2E diagnosis is partial work, not implementation completion.

## Review validity

When independent review is warranted, finish implementation and integration first, then freeze the review surface by pausing its writers. This is a coordination boundary, not a requirement to commit or stash user work.

- Identify the target with repository path, review base, HEAD, scoped paths, and a reproducible content fingerprint of the actual reviewed state. Include staged and unstaged changes and relevant untracked files; HEAD alone is insufficient. A saved diff digest plus a path/content manifest for untracked inputs is one option. For non-Git work use a scoped path/content manifest. Include relevant configuration, dependencies, and reference/render artifacts when they affect the verdict.
- Give the critic the user outcome and raw supporting evidence, not just the implementation author's interpretation. State whether the contract covers code correctness, visual fidelity, or both, and identify exclusions.
- Reviewers and validators check state identity before and after their work. Report commands, inspected artifacts, coverage limits, and whether the state stayed unchanged. A moving target produces a partial or stale result, never a clean final verdict.
- Any later material edit, rebase, merge, conflict resolution, dependency change, or changed visual reference invalidates affected verdicts and checks. Reuse the critic for a focused follow-up on the new state, including integration effects; rerun affected validation. A bookkeeping-only change may retain evidence only after verifying identical relevant content and recording why it still applies.
- Before completion, compare the delivered state with the reviewed and tested state. Resolve mismatches; do not carry a pre-rebase sign-off onto a changed integration.

Keep evidence proportional: this record supports review and validation claims, not mandatory hashing or critic invocation for every tiny edit. "No actionable findings" must name its review scope; it never implies unexamined properties passed.

## Visual implementation

For work whose acceptance depends on matching a design or screenshot, read [references/visual-review.md](references/visual-review.md). Code checks and a clean code review do not establish visual fidelity. Do not add a separate agent merely for the sequence: the main agent can compare images, or dispatch `critic` with an explicit visual contract when independent review adds value.

## Risk ladder

### Lean — ordinary bounded work

Main frames → `fixer` owns the outcome or `sweeper` applies the exact transformation → `probe` validates. Skip agents when the direct task is truly trivial.

### Informed — unfamiliar or externally constrained work

Use `runner` and/or `scanner` only for specific uncertainties → main synthesizes → `fixer` → `probe`. Add `critic` only for meaningful behavioral risk.

### Critical — high consequence or expensive to reverse

Gather evidence with `runner`/`scanner` as needed → `architect` independently frames the design or risk → `fixer` implements → `probe` and `critic` verify independently → main adjudicates findings → `fixer` addresses accepted fixes → rerun affected validation and critic review on the resulting state.

Critical means security or authorization, destructive migrations, concurrency or distributed state, billing, public compatibility, silent data corruption, or expensive-to-reverse boundaries—not merely many files or steps.

## Main-agent accountability

The main agent owns the user’s intent, decomposition, agent selection, engineering judgment, acceptance of tradeoffs, preservation of unrelated work, and honest reporting. It may perform small reads and writes when more efficient, but should avoid duplicating delegated work. Subagents supply evidence and recommendations; the main agent decides what to do and remains accountable for the result.
