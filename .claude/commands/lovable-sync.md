---
description: Run after pulling changes from Lovable to catch regressions. Lovable sometimes reintroduces patterns that have been intentionally replaced.
---

# Lovable Sync Check

1. Find changed files: `git diff main...HEAD --name-only` (or `git diff HEAD~1 --name-only` if already merged). Read every changed file in `src/components/argo/`.

2. Read `.claude/rules/design-patterns.md` and `.claude/rules/style-tokens.md`

3. Scan for these specific Lovable regression patterns:

| Pattern | Flag | Expected |
|---------|------|----------|
| Tables | `<table` `<thead` `<tbody` `<tr` `<td` | `<button>` rows with `hover:bg-black/5` |
| Pagination | `setPage(` `currentPage` `PAGE_SIZE` "Load more" | `IntersectionObserver` + `displayCount` |
| Mobile breakpoints | `sm:` `md:` `lg:` `xl:` in any className | None — desktop only |
| Hardcoded colors | `#` hex · `bg-blue-` · `bg-gray-` · `bg-slate-` | Token classes only |
| Type filters | filter by Markdown/HTML/PPTX in artifact views | No type filter |
| Visibility text | "Private" or "Shared" text badge | `Globe` / `Lock` icon only |
| Row card backgrounds | `bg-card` or `shadow-sm` on list row buttons | `hover:bg-black/5` only |
| PanelHeader | `<PanelHeader` or `function PanelHeader` | Was intentionally removed |
| Default exports | `export default function` in `src/components/argo/` | Named exports only |

4. Report: **PASS** (no regressions) or **FAIL** with file, line, pattern found, and correct replacement.

5. If regressions found: ask "Fix automatically or flag for manual review?"
