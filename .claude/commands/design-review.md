---
description: Review a component or page against Argo's UI design patterns. Run after building or editing any UI component, or after a Lovable sync.
argument-hint: [component file path or component name]
---

# Design Review

1. Read `.claude/rules/design-patterns.md` in full
2. Read the target file(s): $ARGUMENTS — if no argument, use `git diff --name-only HEAD~1` to find recently changed files in `src/components/argo/`
3. Check every rule in `design-patterns.md` against the file

## Output format
- **PASS** — rule satisfied
- **FAIL [rule name]** — rule violated: exact line + suggested fix
- **WARN [rule name]** — not wrong but worth flagging

Group by section. End with: X passed · Y failed · Z warnings.
