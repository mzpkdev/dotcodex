# GitHub CLI: pull-request CI

Examples use PR `123`, head SHA `0123456789abcdef0123456789abcdef01234567`, and Actions
run ID `456789`.

## Inspect PR and merge state

```sh
gh pr view 123 --json number,url,headRefName,headRefOid,mergeable,mergeStateStatus,reviewDecision,statusCheckRollup
```

## List PR checks

```sh
gh pr checks 123 \
  --json name,workflow,state,bucket,startedAt,completedAt,link,event
```

`bucket` is `pass`, `fail`, `pending`, `skipping`, or `cancel`. Exit code `8` means pending checks.

```sh
gh pr checks 123 --required
gh pr checks 123 --watch --interval 300
gh pr checks 123 --watch --fail-fast --interval 300
```

Follow the active polling loop in `../SKILL.md`. A watch returning or timing out does not establish
completion: refresh the relevant PR state and continue as needed. Prefer explicit rounds when watching
checks would omit expected reviews or other asynchronous work. Empty check/run lists just after a push
are pending when checks are expected, not success.

## Find GitHub Actions runs for a PR head

```sh
gh run list \
  --commit 0123456789abcdef0123456789abcdef01234567 \
  --json databaseId,workflowName,displayTitle,status,conclusion,headSha,headBranch,event,createdAt,updatedAt,url
```

`gh pr checks 123` also represents runs associated with the pull request.

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

`gh run rerun --job` accepts the `databaseId` from `gh run view --json jobs`, not the number in a
browser job URL.

Documentation: [`gh pr checks`](https://cli.github.com/manual/gh_pr_checks),
[`gh run list`](https://cli.github.com/manual/gh_run_list),
[`gh run view`](https://cli.github.com/manual/gh_run_view), and
[`gh run rerun`](https://cli.github.com/manual/gh_run_rerun).
