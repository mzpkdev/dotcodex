# Git and GitHub CLI: updating a PR branch

Examples use PR `123`, local branch `feature-branch`, and push remote `origin`.

## Inspect the PR head identity

```sh
gh pr view 123 --json number,url,baseRefName,headRefName,headRefOid,headRepository,headRepositoryOwner,isCrossRepository
```

## Inspect local repository state

```sh
git remote -v
git status --short
git branch --show-current
git branch -vv
git rev-parse HEAD
```

## Check out the PR

```sh
gh pr checkout 123
```

`gh pr checkout` can fetch fork PRs. Inspect the resulting local branch and its configured remote
with `git branch -vv` and `git remote -v`.

## Inspect and commit selected changes

```sh
git diff -- src/example.ts
git add -- src/example.ts
git diff --cached
git commit -m "Address review feedback"
```

## Compare local and GitHub head SHAs

```sh
git rev-parse HEAD
gh pr view 123 --json headRefOid --jq .headRefOid
```

## Push to an explicit PR head ref

```sh
git push origin HEAD:feature-branch
```

## Update the PR branch from its base

```sh
gh pr update-branch 123
gh pr update-branch 123 --rebase
```

By default, `gh pr update-branch` creates a merge commit; `--rebase` rebases the PR branch onto
the base branch.

## Verify the pushed PR head

```sh
git rev-parse HEAD
gh pr view 123 --json headRefOid,headRefName,headRepositoryOwner --jq '{headRefOid, headRefName, headRepositoryOwner}'
gh pr checks 123
```

Documentation: [`gh pr checkout`](https://cli.github.com/manual/gh_pr_checkout) and
[`gh pr update-branch`](https://cli.github.com/manual/gh_pr_update-branch).
