# docs

Browse, search, and read documentation from Markdown, `llms.txt` indexes, and HTML pages.

## Get started

Requires Node.js 24.12+.

```sh
cd ~/.codex/tools/docs
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm ci
./docs --help
```

## Examples

```sh
# Find a section, then read its ID from the results.
./docs tree https://svelte.dev/docs/svelte/llms.txt
./docs search https://svelte.dev/docs/svelte/llms.txt "class state"
./docs read https://svelte.dev/docs/svelte/llms.txt classes

# Request a smaller page, then continue.
./docs tree https://ark-ui.com/llms.txt --limit 20
./docs tree https://ark-ui.com/llms.txt --limit 20 --offset 20

# Get structured results.
./docs search https://ark-ui.com/llms.txt "svelte dialog" --json
```

## CLI

| Command                | Result                                                     |
| ---------------------- | ---------------------------------------------------------- |
| `tree <url>`           | Headings and linked pages with IDs.                        |
| `search <url> <query>` | Matching sections and link labels in the current document. |
| `read <url> <id>`      | A section's direct content, or a linked page's tree.       |

Use IDs from `tree` or `search` with `read`. Reading a section excludes its child sections.
Reading a link opens that page; use its target URL for further searches and reads.
Search does not crawl linked pages.

| Option         | Behavior                                                                                                         |
| -------------- | ---------------------------------------------------------------------------------------------------------------- |
| `--limit <n>`  | Tree: 1–60 entries (default 60). Search: 1–100 results (default 10). Read: 1–12,000 characters (default 12,000). |
| `--offset <n>` | Continue tree or read results from an offset (default 0).                                                        |
| `--json`       | Return JSON, including `page.nextOffset` for paged results.                                                      |
| `--refresh`    | Fetch again instead of using the one-hour cache.                                                                 |
| `--dry-run`    | Preview without fetching.                                                                                        |
| `--help`       | Show usage for the CLI or a command.                                                                             |

Follow the returned continuation offset to read the next page. Set `DOCS_CACHE_DIR` to
choose a cache directory; the default is `.cache/` in this tool's directory.
