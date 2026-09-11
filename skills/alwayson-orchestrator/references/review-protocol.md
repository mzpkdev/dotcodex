# Review and validation evidence

Use for independent review or integration validation involving shared, dirty, long-running, or
high-consequence state. Main owns the validation boundary and passes the relevant details in briefs;
subagents do not load the always-on skill.

## Establish the target

After relevant writers and mutating processes stop, record repository, review base, HEAD, and scoped
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

For expensive builds, suites, or captures, choose raw log and artifact paths before running. Report
exact command, working directory, exit outcome, exercised state, and artifact paths. Distinguish
passed, failed, blocked, timed-out, skipped, and stale results. Missing logs limit reproducibility;
do not imply they were saved or repeat an expensive successful run solely to create one unless the
evidence requirement needs it. Report unexpectedly long commands with available process handles.

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

Keep confirmed defects separate from hypotheses and optional improvements. Severity follows
realistic impact and exposure. Claims of complete coverage need a stated search/traversal method
and boundaries; otherwise report only the inspected cases. Keep code and visual verdicts separate.

## Reopen and deliver

Corrections reopen the affected scope. Pause its writers again before rerunning affected checks and
review, including integration effects. Reuse the independent critic for focused follow-ups; the
implementer can investigate findings but cannot supply the independent verdict on its own work.

Material edits, rebases, merges, conflicts, dependency changes, and reference changes require
reassessing evidence validity. Preserve checks across bookkeeping or unrelated edits only after
confirming identical relevant inputs and recording why; do not restart all reviews on a global
manifest mismatch. Before acceptance, connect the delivered state to the reviewed and tested state
and record unresolved coverage or retained limitations.
