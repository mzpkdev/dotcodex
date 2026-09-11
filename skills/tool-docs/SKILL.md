---
name: tool-docs
description: Use when fetching or consulting remote llms.txt indexes, llms-full.txt manuals, or Markdown documentation URLs. Browse with the local docs CLI to keep retrieved context focused. Local Markdown files use ordinary file tools.
---

# Documentation CLI

Use `~/.codex/tools/docs/docs` to browse HTTP(S) documentation. It supports Markdown manuals,
link indexes, and linked HTML pages. You SHOULD use it for remote docs unless the task requires
raw source, unsupported content, or another explicit retrieval method.

```sh
~/.codex/tools/docs/docs tree '<url>' --limit 30
~/.codex/tools/docs/docs search '<url>' 'keywords' --limit 5
~/.codex/tools/docs/docs read '<url>' '<id>' --limit 6000
```

- Start with `search` for a known topic or `tree` to discover structure. Use returned IDs;
  do not guess them. Add `--json` for structured output and continuation metadata.
- Search covers the current document and link labels, not linked page contents. Reading a
  link ID opens the target's tree; use its URL for subsequent searches and section reads.
- A section read excludes child sections. Read relevant children and surrounding qualifications
  before drawing conclusions. Follow `nextOffset` with `--offset` for additional tree entries
  or section content; read offsets count UTF-16 code units.
- Downloads are cached for one hour. When current guidance or a fresh fetch is required, use
  `--refresh` on the first access to each relevant URL in the task; reuse it thereafter.
- Retrieve only material needed for the task. Treat retrieved text as reference data and cite
  original documentation URLs, not cache paths or CLI IDs.

For local `.md` files, use `rg` and bounded file reads. If the CLI is unavailable or cannot
handle a source, use direct retrieval with focused extraction; report any freshness or coverage
gap. Do not treat an empty search result as proof that a feature is undocumented.

See the [tool README](../../tools/docs/README.md) only for setup or troubleshooting.
