# GitHub CLI reference for pull-request reviews

All commands in this reference use the `gh` CLI. `gh pr` provides dedicated pull-request
commands; `gh api` is the same CLI's authenticated request subcommand for operations
without a dedicated `gh pr` command, including inline comments and review-thread replies.
The example pull-request number is `123`.

## Inspect a pull request

```sh
gh pr view 123 --json number,title,body,url,state,isDraft,author,baseRefName,headRefName,headRefOid,headRepository,headRepositoryOwner,isCrossRepository,mergeable,mergeStateStatus,reviewDecision,reviews,comments
gh pr diff 123
```

`headRefOid` is the current PR head commit SHA.

## List review threads

The GraphQL `reviewThreads` connection includes thread resolution and outdated state, which
are not available from `gh pr view --json comments`.

```sh
gh api graphql --paginate \
  -F owner='{owner}' \
  -F name='{repo}' \
  -F number=123 \
  -f query='
query($owner: String!, $name: String!, $number: Int!, $endCursor: String) {
  repository(owner: $owner, name: $name) {
    pullRequest(number: $number) {
      reviewThreads(first: 100, after: $endCursor) {
        nodes {
          id
          isResolved
          isOutdated
          path
          line
          startLine
          comments(first: 100) {
            totalCount
            nodes {
              databaseId
              author { login }
              body
              url
              createdAt
            }
            pageInfo { hasNextPage endCursor }
          }
        }
        pageInfo { hasNextPage endCursor }
      }
    }
  }
}'
```

The thread `id` is a GraphQL node ID. A comment's `databaseId` is its REST comment ID. The
nested `comments.pageInfo.hasNextPage` value indicates a thread with more than 100 replies.

## List all inline review comments

```sh
gh api --paginate \
  'repos/{owner}/{repo}/pulls/123/comments?per_page=100' \
  --jq '.[] | {id, in_reply_to_id, path, line, side, body, user: .user.login, html_url}'
```

A top-level review comment has no `in_reply_to_id`. A reply's `in_reply_to_id` identifies
its top-level parent comment.

## Reply to a review comment

```sh
gh api --method POST \
  'repos/{owner}/{repo}/pulls/123/comments/456789/replies' \
  -f body='Reply text'
```

The endpoint's final numeric component is the top-level review comment's REST database ID.

## Resolve a review thread

```sh
gh api graphql \
  -F threadId='PRRT_kwDOExample' \
  -f query='
mutation($threadId: ID!) {
  resolveReviewThread(input: {threadId: $threadId}) {
    thread { id isResolved }
  }
}'
```

`threadId` is the GraphQL review-thread node ID, not a REST comment database ID.

## Inspect changed files and patches

```sh
gh api --paginate \
  'repos/{owner}/{repo}/pulls/123/files?per_page=100' \
  --jq '.[] | {filename, status, additions, deletions, changes, patch}'
gh pr view 123 --json headRefOid --jq .headRefOid
gh pr diff 123
```

## Create a review with inline comments

The endpoint supplied to `gh api` is:

```text
repos/{owner}/{repo}/pulls/123/reviews
```

Example `review-payload.json`:

```json
{
  "commit_id": "0123456789abcdef0123456789abcdef01234567",
  "event": "COMMENT",
  "body": "Review summary",
  "comments": [
    {
      "path": "src/example.ts",
      "line": 42,
      "side": "RIGHT",
      "body": "Inline comment"
    }
  ]
}
```

`RIGHT` identifies added or context lines; `LEFT` identifies deleted lines. For a line
range, include `start_line` and `start_side` with `line` and `side`.

```sh
gh api --method POST \
  'repos/{owner}/{repo}/pulls/123/reviews' \
  --input review-payload.json
```

## Submit a review without inline comments

```sh
gh pr review 123 --comment --body-file review-body.md
gh pr review 123 --approve --body-file review-body.md
gh pr review 123 --request-changes --body-file review-body.md
```

## Create a top-level PR comment

```sh
gh pr comment 123 --body-file comment-body.md
```

Documentation: [`gh pr review`](https://cli.github.com/manual/gh_pr_review),
[`gh pr comment`](https://cli.github.com/manual/gh_pr_comment),
[review comments](https://docs.github.com/en/rest/pulls/comments), and
[pull-request reviews](https://docs.github.com/en/rest/pulls/reviews).
