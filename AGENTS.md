# Session bootstrap

Before substantive work in each session, load every `alwayson-` skill in the catalog whose scope
includes the current agent role. Follow each loaded skill for the session.

The main agent loads `$alwayson-orchestrator` and `$alwayson-mode`; spawned subagents skip them.

# Authoring instructions

When editing skills, agents, or prompts, apply [prompting preferences](llm-docs/PROMPTING_BEST_PRACTICES.md)
and [requirement levels](llm-docs/RFC_2119_KEYWORDS.md). Keep instructions compact; omit repeated boilerplate.

# Contributing to tools

You MAY fix or extend `~/.codex/tools/` without separate approval when the current task reveals
a concrete need. Keep changes focused, follow existing conventions, validate and retry the
original operation. Update affected docs or skills, briefly report the change, and resume the task.
