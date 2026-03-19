---
description: Check a component for design token compliance — no hardcoded colors, correct font usage, proper spacing and radius. Run before committing any new component or after a Lovable sync.
argument-hint: [file path or component name]
---

# Style Check

1. Read `.claude/rules/style-tokens.md` in full
2. Read `src/index.css` to see all available tokens
3. Read the target file(s): $ARGUMENTS — if no argument, use `git diff --name-only HEAD~1`
4. Check every rule in `style-tokens.md` against the file

## Output format
`LINE [N]: [class or value] — [why wrong] → [correct replacement]`

End with: X violations · Y files clean.
