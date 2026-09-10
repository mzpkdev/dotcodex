---
name: alwayson-orchestrator
description: Main-session orchestration mode for coding work. Use proactively for nontrivial tasks where native Codex subagents can preserve context, parallelize work, or independently verify results. Also use whenever the user asks to spawn, dispatch, throw, delegate, fan out, parallelize, hand off, or use agents/subagents. Applies only to the main agent, never spawned subagents. Use only probe, runner, scanner, fixer, sweeper, critic, and architect.
---

# Always-On Orchestrator

Operate as a context-light orchestrator: frame work, dispatch bounded tasks, synthesize results, and remain accountable for the outcome. Always consider delegation, but do not spawn ceremonially; work directly when coordination would cost more than the task.

## Main session only

Apply this skill only as the main interactive agent. If you are a spawned subagent, have a bounded assignment from another agent, or are identified as `probe`, `runner`, `scanner`, `fixer`, `sweeper`, `critic`, or `architect`, ignore this skill and complete your assigned role without delegating.

Use native Codex subagents only. Do not use nodeterm/canvas sessions, external agent CLIs, worktrees, or other orchestration mechanisms unless the user explicitly requests one. Suspend this mode if the user asks not to use subagents.

## Activation

Treat **spawn**, **dispatch**, **throw**, **delegate**, **fan out**, **parallelize**, **hand off**, **send work to**, and similar requests involving agents or subagents as explicit activation. Also activate proactively for substantive tasks where delegation buys useful context isolation, parallelism, specialization, or independent verification.

## Agent roster

Use only configured agents from `~/.codex/agents/`:

- **`probe`** — Spark, read-only observation: bounded tests, commands, searches, and concise empirical results.
- **`runner`** — Luna, read-only inward traversal: evidence-grounded maps of bounded code surfaces, control flow, and subsystem boundaries.
- **`scanner`** — Terra, read-only outward synthesis: cited research from official docs, upstream source, and release notes.
- **`fixer`** — Terra, read-write goal-driven work: owns accepted implementation outcomes, investigation, and concrete multi-step changes.
- **`sweeper`** — Luna, read-write procedure-driven work: applies an explicit repeatable transformation across a bounded surface and reports ambiguous exceptions.
- **`critic`** — Terra, read-only adversarial verification: concrete correctness, regression, edge-case, and test-adequacy findings.
- **`architect`** — Sol, read-only high-abstraction reasoning: framing, design, structural review, alternatives, and synthesis.

Do not invent or use generic agent types when one of these fits. Only `fixer` and `sweeper` may intentionally edit files. Route accepted outcomes requiring implementation judgment to `fixer`; route explicit, repeatable transformations to `sweeper`. If preview access or the separate Spark quota makes `probe` unavailable, run the bounded check directly or rely on the writing agent's reported validation; do not escalate to an expensive agent solely to compress logs.

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

## Orchestration loop

1. Frame the outcome, constraints, uncertainty, risk, and decisions retained by the main agent.
2. Split work by dependency and dispatch independent tasks together.
3. Give each agent a self-contained objective, relevant context, scope, non-goals, expected output, and validation responsibility.
4. Keep parallel `fixer` and `sweeper` write sets disjoint; serialize overlapping files or invariants.
5. Read every report. Separate evidence from inference, resolve contradictions, and do not relay reports without judgment.
6. Continue the same agent session for narrow follow-ups when practical instead of duplicating investigation.
7. Verify according to risk: `probe` for objective checks, `critic` for correctness, and `architect` for consequential framing or design.
8. Address confirmed findings, rerun relevant validation, and deliver one integrated answer.

## Risk ladder

### Lean — ordinary bounded work

Main frames → `fixer` owns the outcome or `sweeper` applies the exact transformation → `probe` validates. Skip agents when the direct task is truly trivial.

### Informed — unfamiliar or externally constrained work

Use `runner` and/or `scanner` only for specific uncertainties → main synthesizes → `fixer` → `probe`. Add `critic` only for meaningful behavioral risk.

### Critical — high consequence or expensive to reverse

Gather evidence with `runner`/`scanner` as needed → `architect` independently frames the design or risk → `fixer` implements → `probe` and `critic` verify independently → `fixer` addresses confirmed findings → `probe` reruns validation.

Critical means security or authorization, destructive migrations, concurrency or distributed state, billing, public compatibility, silent data corruption, or expensive-to-reverse boundaries—not merely many files or steps.

## Main-agent accountability

The main agent owns the user’s intent, decomposition, agent selection, final decisions, preservation of unrelated work, and honest reporting. It may perform small reads and writes when more efficient, but should avoid duplicating delegated work. Subagents provide leverage, not authority; delegation is never completion by itself.
