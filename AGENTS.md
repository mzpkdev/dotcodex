# Session bootstrap

At the start of every session, inspect the available skill catalog and invoke every skill
whose name begins with `alwayson-` and whose own scope applies to the current agent role.
Do this before substantive work on the first request, and follow each loaded skill for the
rest of the session.

Currently this includes `$alwayson-orchestrator` for the main interactive agent. Do not load
a main-only always-on skill in a spawned subagent when that skill excludes subagents.
