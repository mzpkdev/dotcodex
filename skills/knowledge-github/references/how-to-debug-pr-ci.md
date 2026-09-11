# GitHub CLI reference for pull-request CI

The example pull-request number is `123`, head SHA is
`0123456789abcdef0123456789abcdef01234567`, and Actions run ID is `456789`.

## Inspect PR and merge state

```sh
gh pr view 123 --json number,url,headRefName,headRefOid,mergeable,mergeStateStatus,reviewDecision,statusCheckRollup
```

## List PR checks

```sh
gh pr checks 123 \
  --json name,workflow,state,bucket,startedAt,completedAt,link,event
```

The `bucket` value is one of `pass`, `fail`, `pending`, `skipping`, or `cancel`. Exit code
`8` indicates pending checks.

```sh
gh pr checks 123 --required
gh pr checks 123 --watch --interval 300
gh pr checks 123 --watch --fail-fast --interval 300
```

Follow the active polling loop in `../SKILL.md`. A watch returning or timing out does not establish
task completion: refresh the full relevant PR state and continue as needed. Prefer explicit poll
rounds when watching checks would omit expected reviews or other asynchronous work. Empty check/run
lists immediately after a push are pending when checks are expected, not evidence of success.

## Find GitHub Actions runs for a PR head

```sh
gh run list \
  --commit 0123456789abcdef0123456789abcdef01234567 \
  --json databaseId,workflowName,displayTitle,status,conclusion,headSha,headBranch,event,createdAt,updatedAt,url
```

Runs associated with a pull request are also represented by `gh pr checks 123`.

## Inspect a failed run

```sh
gh run view 456789 \
  --json databaseId,workflowName,status,conclusion,headSha,attempt,jobs,url
gh run view 456789 --log-failed
```

List job database IDs:

```sh
gh run view 456789 \
  --json jobs \
  --jq '.jobs[] | {name, databaseId, status, conclusion}'
```

Inspect one job whose database ID is `987654`:

```sh
gh run view 456789 --job 987654
gh run view 456789 --job 987654 --log
```

## Rerun GitHub Actions jobs

```sh
gh run rerun 456789 --failed
gh run rerun 456789 --job 987654
```

The job ID accepted by `gh run rerun --job` is the `databaseId` returned by
`gh run view --json jobs`, not the number shown in a browser job URL.

Documentation: [`gh pr checks`](https://cli.github.com/manual/gh_pr_checks),
[`gh run list`](https://cli.github.com/manual/gh_run_list),
[`gh run view`](https://cli.github.com/manual/gh_run_view), and
[`gh run rerun`](https://cli.github.com/manual/gh_run_rerun).
