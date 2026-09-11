---
name: alwayson-mode
description: Load persistent auto and ask interaction modes and handle requests to change or inspect the selection. Main interactive agent only; spawned subagents do not load this skill.
---

# Persistent modes

As the main interactive agent, load the user's saved interaction preferences and manage mode
changes. Other always-on skills, including the orchestrator, remain active under their own scope.
Modes supplement session instructions; explicit user direction and higher-priority instructions
still govern. These preferences do not change Codex collaboration modes or permission settings.

## Load the selection

ALWAYS read `/home/mzpk/.codex/modes.json` at startup and at the beginning of each user turn.
The selection is an array of unique names from `auto` and `ask`. Either, both, or neither may
be selected; array order does not set precedence. An empty array or missing file selects no modes.

Read each active prompt that is not already available in context:

- `auto`: `/home/mzpk/.codex/modes/auto.md`
- `ask`: `/home/mzpk/.codex/modes/ask.md`

You MUST apply only the current selection, even if a disabled prompt remains in context.
If state is unreadable or invalid, report the problem and apply no modes until resolved.
Preserve invalid state for explicit repair. If a selected prompt is unavailable, report it
and apply only the selected prompts you can read.

## Combine modes

With both modes active, surface meaningful forks and pause work that needs an answer. Retain
the original objective, then resume after each answer through completion and authorized shipping.
Questions may repeatedly pause execution; they do not complete or cancel the task. Continue
independent work while waiting. A user stop or redirection takes precedence over persistence.

Spawned subagents receive relevant behavior through their task briefs. Have them return
user-level forks to the main agent rather than independently read or change global modes.

## Change or inspect modes

Handle natural-language requests and invocations such as `$alwayson-mode enable auto`:

| Request | Effect |
| --- | --- |
| Enable/add a named mode | Add it, retaining the others |
| Disable/remove a named mode | Remove only that mode |
| Set/switch to an explicit selection | Replace the selection |
| Off | Save `[]` |
| Status | Report the selection without changing it |

Accept only the two known names and use their fixed prompt paths. Clarify requests whose
add-versus-replace meaning is ambiguous. A mode-change request persists by default; a task-specific
instruction such as "ask me before deploying" does not request a persistent toggle.

For a change, reread and validate the state, treating a missing file as `[]`. Apply the requested
operation and save the complete array with a temporary file in the same directory and atomic
replacement. Verify the saved selection, load newly active prompts, and briefly confirm it.
You MUST NOT claim persistence if writing or verification failed.

The change applies immediately here and on other sessions' next user turn. Toggle modes through
the state file without changing other skills, AGENTS.md, or Codex configuration.
