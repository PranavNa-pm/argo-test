---
description: Audit React components for structure, naming, props, and handoff readiness. Run before engineer handoff or before a Lovable sync.
argument-hint: [file path or directory]
---

# Component Audit

1. Read `.claude/rules/component-structure.md` in full
2. Read the target file(s): $ARGUMENTS — if no argument, audit all files in `src/components/argo/`
3. Check every rule in `component-structure.md` against each file

## Output format
For each file:
**File:** `src/components/argo/ComponentName.tsx`
- PASS / FAIL per rule (include line number and fix for each FAIL)

End with overall score and top 3 priority fixes across all files.
