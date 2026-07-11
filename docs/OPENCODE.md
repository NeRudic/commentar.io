# OPENCODE.md — tool reference

## Available tools

| Tool | Purpose |
|------|---------|
| `bash` | Run commands (npm, git, build) |
| `read` | Read a file |
| `write` | Create/overwrite a file |
| `edit` | Partial file edit (oldString → newString) |
| `glob` | Find files by pattern (`**/*.ts`) |
| `grep` | Search file contents |
| `task` | Launch a sub-agent for background/complex work |

## Restrictions

- Do not create files without explicit user instruction
- Do not generate URLs without confidence in their correctness
- Do not add `Co-Authored-By` / `Signed-off-by` to commits
- Do not run `git commit` without explicit request
