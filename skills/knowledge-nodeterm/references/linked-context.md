# Reading linked nodeterm nodes (get-linked-context)

When you run inside a nodeterm canvas session, this node may be linked to other agent
nodes (Claude, Codex or Gemini) or sticky notes by a context-link edge. You can READ a
linked node's context on demand — nothing is pushed automatically:

```sh
sh "/home/mzpk/.config/node-terminal/context-links/context.sh" list                        # nodes you are linked to (start here)
sh "/home/mzpk/.config/node-terminal/context-links/context.sh" summary --node <id|title>   # last lines of its conversation
sh "/home/mzpk/.config/node-terminal/context-links/context.sh" transcript --node <id|title>
sh "/home/mzpk/.config/node-terminal/context-links/context.sh" terminal --node <id|title>  # its recent terminal output
```

Only meaningful inside nodeterm (NODETERM_NODE_ID set) with a linked edge. If the CLI
says "Not a nodeterm session" or "No linked nodes", there is nothing to read — do not retry.

Sandboxed Codex: if a call fails with "Could not read linked context (nodeterm unreachable)" or with
"Codex's sandbox blocked this connection to nodeterm. nodeterm itself is running — do not relink or restart it.",
Codex's command sandbox is denying loopback/socket connections while nodeterm itself is
healthy. Retry the SAME command once with command-specific escalated permissions (approve the
escalation prompt) — never relink, reinstall or restart nodeterm for this error; that cannot
help. On macOS the permanent fix is adding the advertised hook socket path (the
`NODETERM_HOOK_SOCK` value) to `network.allow_unix_sockets` in ~/.codex/config.toml: hook
calls then work inside the sandbox with no escalation.
