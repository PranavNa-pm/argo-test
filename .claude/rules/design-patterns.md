# Argo Design Patterns — Rule Checklist

Used by: `/design-review`, `/lovable-sync`, `/pattern-override`
Source of truth: `STYLE_GUIDE.md`

---

## Lists
- Rows are `<button>` elements, never `<table>`, `<div onClick>`, or card borders
- Row base: no background — `bg-transparent` only
- Row hover: `hover:bg-black/5` — no other hover background
- Actions on rows: `opacity-0 group-hover:opacity-100 transition-opacity`
- Infinite scroll via `IntersectionObserver` — no pagination, no "Load more" button
- Count label: "Showing X of Y items" (filtered) / "X items" (unfiltered)
- Sortable column headers: `text-[11px] font-medium text-foreground/60 uppercase tracking-wide`
- Search bar: `bg-secondary/50 border border-border rounded-lg px-3 py-2`
- Filters: inline tab pills — NOT dropdown

## Backgrounds
- Canvas: `bg-background` — never hardcoded
- Sidebar: `bg-sidebar-background` — never hardcoded
- Chat area only: `bg-card` (pure white)
- Modals: `bg-background border border-border shadow-xl rounded-xl`
- NO card/shadow on list rows

## Icons
- Projects: `FolderOpen` | Artifacts: `Layers` | General Chat: `MessagesSquare`
- Visibility: `Globe` (shared) / `Lock` (private) — icon only, never text
- Every icon button has a `title` attribute
- Sizes: `w-3 h-3` metadata · `w-3.5 h-3.5` actions/nav · `w-4 h-4` headers

## Typography
- Font: Geist only — no overrides
- Page title: `text-lg font-semibold text-foreground tracking-tight`
- Row primary: `text-sm font-medium text-foreground`
- Row secondary: `text-xs text-muted-foreground`
- Plain English everywhere — no jargon, no ALL CAPS, no "N/A"

## Layout
- All content pages: `max-w-4xl mx-auto` — never full width
- Desktop only — NO `sm:` `md:` `lg:` `xl:` breakpoints anywhere
- Page padding: `p-6`
- Header row: `flex items-start justify-between`

## Buttons
- Primary: `bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg`
- Secondary: `border border-border text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg`
- Send: `bg-primary text-primary-foreground rounded-lg p-2 hover:bg-primary/90 disabled:opacity-40`
- No hardcoded color classes (e.g. `bg-blue-500`)

## Hover
- Every interactive element has a visible hover state
- Same hue family — no dramatic color changes on hover
- All transitions use `transition-colors`

## States
- Every list view has a skeleton loading state using `<ListRowSkeleton />`
- Every list view has an empty state: icon + message + helper text, `py-20 text-center`
- Two empty messages: one for empty list, one for no filter/search results
- `isLoading` comes from `useArgo()` — marked `// DEMO ONLY` in ArgoContext

## Filters
- No type-based filters (Markdown/HTML/PPTX) — they don't scale
- Only context filters: All / General Chat / Projects
- Changing filter resets display count to 20
