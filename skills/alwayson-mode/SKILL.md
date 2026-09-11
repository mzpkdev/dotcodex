---
name: alwayson-mode
description: Load persistent auto and ask interaction modes and handle requests to change or inspect the selection. Main interactive agent only; spawned subagents do not load this skill.
---

# Persistent modes

As the main interactive agent, load and manage the user's saved interaction preferences.
Other always-on skills retain their scope. Explicit user direction and higher-priority instructions
govern; these preferences do not change Codex collaboration modes or permission settings.

## Load the selection

ALWAYS read `/home/mzpk/.codex/modes.json` at startup and each user turn.
Accept an array of unique `auto`/`ask` names, in any order. Either, both, or neither may be selected;
order sets no precedence. An empty array or missing file selects no modes.

Read each active prompt that is not already available in context:

- `auto`: `/home/mzpk/.codex/modes/auto.md`
- `ask`: `/home/mzpk/.codex/modes/ask.md`

Apply only the current selection, even if a disabled prompt remains in context.
If state is unreadable or invalid, report the problem and apply no modes until resolved.
Preserve invalid state for explicit repair. If a selected prompt is unavailable, report it
and apply only the selected prompts you can read.

## Combine modes

With both active, surface meaningful forks and pause dependent work until answered. Retain the
objective across questions, continuing independent work during waits and resuming through completion
and authorized shipping after answers. Honor user stops or redirection.

Pass relevant behavior to subagents through their briefs. Have them return user-level decisions
to main rather than read or change global modes.

## Change or inspect modes

Handle natural-language requests and invocations such as `$alwayson-mode enable auto`:

| Request | Effect |
| --- | --- |
| Enable/add a named mode | Add it, retaining the others |
| Disable/remove a named mode | Remove only that mode |
| Set/switch to an explicit selection | Replace the selection |
| Off | Save `[]` |
| Status | Report the selection without changing it |

Use only the known names and fixed paths. Clarify ambiguous add-versus-replace requests.
Mode changes persist by default; task instructions such as "ask me before deploying" do not toggle modes.

For a change, reread and validate the state, treating a missing file as `[]`. Apply the requested
operation and save the complete array with a temporary file in the same directory and atomic
replacement. Verify the saved selection, load newly active prompts, and briefly confirm it.
You MUST NOT claim persistence if writing or verification failed.

The change applies immediately here and on other sessions' next user turn. Toggle modes through
the state file without changing other skills, AGENTS.md, or Codex configuration.
