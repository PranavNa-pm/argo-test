---
description: Run before making a change that might conflict with an established Argo pattern. Surfaces conflicts and asks how to proceed. Use when something feels like it breaks a rule, or when Lovable suggests a different approach.
argument-hint: [describe the change you want to make]
---

# Pattern Override Check

Requested change: **$ARGUMENTS**

1. Read `.claude/rules/design-patterns.md`, `.claude/rules/style-tokens.md`, `.claude/rules/component-structure.md`
2. Compare the requested change against every rule across all three files
3. List every conflict found:
   ```
   CONFLICT: [Rule name]
   Current rule: [what it says]
   Requested change: [what this does differently]
   Impact: [what breaks if allowed]
   ```
   If no conflicts: say "No conflicts — safe to proceed" and stop.

4. For each conflict, present these three options:

   **A — Update the rule**
   Change the relevant `.claude/rules/` file + `STYLE_GUIDE.md` to allow this going forward. Add dated note: `<!-- Updated YYYY-MM-DD: [reason] -->`

   **B — One-off exception**
   Proceed without changing the rules. Add inline comment: `// Pattern exception: [reason] — approved YYYY-MM-DD`

   **C — Change the approach**
   Suggest an alternative that achieves the goal without breaking the rule.

5. Wait for the user to pick A, B, or C before proceeding.
