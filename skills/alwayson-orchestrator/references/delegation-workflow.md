# Delegation and review workflow

Read before delegating, selecting review for meaningful behavioral risk, or adjudicating findings.
Main owns coordination and acceptance; pass only
applicable requirements to subagents.

## Select review

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
  the filesystem and must preserve others' edits. Before parallel edits, settle shared interfaces
  and behavioral acceptance from agreed requirements, including relevant defaults, states, and
  intentional differences. Pass those common conditions to each owner and dispatch independent
  assignments together. Assign ownership of shared build outputs and active runs too; serialize
  conflicting commands and distinguish source review from live-run observation.
- Brief with outcome, scope, acceptance conditions, and relevant dependencies or exclusions. Map
  changed behavior to existing test suites and production conditions; assign any uncovered checks
  to the integration owner. Validate a shared procedure once before distributing repeated work.
  Pass only task-specific additions to the agent's role contract. Name tasks by subject, not role.
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

Pass applicable target, coordination, and evidence requirements from the selected review reference
in the brief. Maintain one current validation index when coordinated evidence is needed, and reuse
unaffected evidence after a correction.

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
