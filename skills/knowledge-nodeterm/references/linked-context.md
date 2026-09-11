# Read linked Nodeterm nodes (get-linked-context)

Inside a Nodeterm canvas session, a context-link edge may connect this node to agent nodes (Claude,
Codex, Gemini) or sticky notes. Read context on demand; nothing is pushed:

```sh
sh "/home/mzpk/.config/node-terminal/context-links/context.sh" list                        # nodes you are linked to (start here)
sh "/home/mzpk/.config/node-terminal/context-links/context.sh" summary --node <id|title>   # last lines of its conversation
sh "/home/mzpk/.config/node-terminal/context-links/context.sh" transcript --node <id|title>
sh "/home/mzpk/.config/node-terminal/context-links/context.sh" terminal --node <id|title>  # its recent terminal output
```

These commands require Nodeterm (`NODETERM_NODE_ID`) and a linked edge. If the CLI says "Not a nodeterm session" or "No linked nodes", do not retry.

If a sandboxed Codex call says "Could not read linked context (nodeterm unreachable)" or "Codex's sandbox blocked this connection to nodeterm. nodeterm itself is running — do not relink or restart it.", the sandbox blocked a healthy Nodeterm loopback/socket connection. Retry the same command once with
command-specific escalated permissions and approve its escalation prompt. Do not relink, reinstall,
or restart Nodeterm. On macOS, add the advertised `NODETERM_HOOK_SOCK` path to
`network.allow_unix_sockets` in `~/.codex/config.toml` so hook calls work in the sandbox without
escalation.
