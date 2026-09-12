# Review and validation evidence

Use when concurrent mutation, shared generated inputs, long-running checks, or high-consequence
behavior warrants coordinated validation. Main owns the boundary and passes applicable details in
briefs; subagents do not load the always-on skill. Ordinary isolated checks use the short handoff.

## Establish the target

For final acceptance, freeze the relevant scope after its writers acknowledge stopping and their
mutating processes finish, or validate immutable inputs. Development checks and provisional source
reviews may run earlier, with that limitation stated. Record repository, review base, HEAD, and scoped
inputs. Include dependencies, configuration, fixtures, generated inputs, and reference/render
artifacts that can affect the result. Scope by the tested behavior and its dependencies, not just the
changed-file list; unrelated work outside that scope may continue.

Use a reproducible path/content fingerprint covering staged, unstaged, and relevant untracked
inputs; a diff digest plus untracked content manifest works in Git. Outside Git, use a path/content
manifest. Record the command and scope so another agent can reproduce it. Exclude disposable logs,
caches, and report outputs, but retain build outputs as inputs when a later check consumes them.
Avoid global dirty-tree fingerprints when unrelated files are changing.

Validators and reviewers verify relevant identity before and after. Unexpected input changes make
only the affected checks partial or stale; identify the overlap and integration effects. Matching
endpoint fingerprints do not prove files stayed unchanged during a run, so preserve the writer
freeze or use immutable inputs. When validating an immutable artifact, record its hash and source
provenance separately from mutable test harness inputs.

## Assign validation and evidence

One final-validation owner coordinates required checks, output directories, and coverage gaps.
That owner may delegate bounded checks, but consolidates the evidence and prevents shared-output
collisions. Independent checks may run together against stable inputs and separate outputs; specify
supported command parallelism when it materially affects duration.
After relevant source edits stop, the generation owner builds shared generated inputs or verifies
that existing outputs correspond to those sources, records provenance, then releases dependent
checks. Keep those outputs stable while consumers run; separate source ownership alone is insufficient.

Maintain one current validation index per scope: required check or acceptance condition, tested
identity, command and working directory, execution environment, outcome, and raw evidence path.
Update affected entries in place; mark superseded evidence as historical and unmet coverage as pending
or blocked. An index may link several runs; a file named "final" does not establish authority.
Record environment boundaries that affect observations, such as sandbox, host, container, or remote
machine. "No process visible here" does not establish that a recorded host process has stopped.

For expensive builds, suites, or captures, choose raw log and artifact paths before running. Report
the exercised state and link results from the index. Distinguish
passed, failed, blocked, timed-out, skipped, and stale results. Missing logs limit reproducibility;
do not imply they were saved or repeat an expensive successful run solely to create one unless the
evidence requirement needs it. Report unexpectedly long commands with available process handles.
Keep disposable evidence outside repository content by default. Capturing an artifact does not
decide whether it belongs in a commit or PR; include it only when the requested deliverable needs it.

Probe and critic may write required temporary files, caches, build outputs, captures, logs, and
reports in assigned locations. This does not permit source changes, snapshot/baseline updates, or
fixes. Choose non-overlapping output locations and report unexpected input mutations without
reverting others' work. As the sole source-write exception, a validator may run automated source generation in a disposable
isolated copy. Discard generated source with that copy after checking; never copy it back. Otherwise
assign source generation to a writer.

## Review the claim

Give the critic the user outcome, raw evidence, target identity, relevant production conditions,
exclusions, and any retained finding dispositions. Ask whether the tests exercise those conditions
and seek counterexamples to the implementation's assumptions. Passing checks do not replace review;
review does not replace integration checks.
Distinguish conclusions from supplied logs/images, source inspection, and independent reproduction.
For behavioral claims, seek a breaking case beyond the supplied procedure when feasible; report
unavailable access as a limit. Check the index before treating a log as current acceptance evidence.

Keep confirmed defects separate from hypotheses and optional improvements. Severity follows
realistic impact and exposure. Claims of complete coverage need a stated search/traversal method
and boundaries; otherwise report only the inspected cases. Keep code and visual verdicts separate.

## Reopen and deliver

Corrections invalidate affected checks, including integration effects. Reassess remaining risk before
another freeze or review; isolated follow-ups may use the short handoff. When independent follow-up
is warranted, reuse the critic; the implementer cannot supply an independent verdict on its own work.

Material edits, rebases, merges, conflicts, dependency changes, and reference changes require
reassessing evidence validity. Preserve checks across bookkeeping or unrelated edits only after
confirming relevant inputs remain valid and noting the basis in the current index; do not restart
all reviews on a global manifest mismatch. Before acceptance, connect the delivered state to the reviewed and tested state
and record unresolved coverage or retained limitations.
