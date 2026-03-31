# Argo Design System — Style Guide

> This is the single source of truth for Argo's UI design system.
> The CSS implementation lives in `src/index.css`.
> Skills that enforce these rules live in `.claude/commands/`.

---

## Principles

1. **Desktop only.** Argo is a full-screen desktop app. No mobile or tablet breakpoints. Never use `sm:`, `md:`, `lg:`, `xl:` Tailwind prefixes.
2. **Effortless, not decorative.** UI should disappear — content and actions come first.
3. **Consistent over clever.** Use the established patterns. Don't invent new ones without updating this guide.
4. **Plain English everywhere.** Labels, tooltips, empty states, error messages — all in plain, simple language.

---

## Color Tokens

All colors must come from CSS variables. Never hardcode hex, rgb, or hsl values in components.

| Token | Value | Usage |
|-------|-------|-------|
| `--background` | hsl(210 17% 97%) | Page/canvas background — cool blue-gray |
| `--foreground` | hsl(220 20% 12%) | Primary text |
| `--card` | hsl(0 0% 100%) | Chat area, modals, elevated surfaces |
| `--sidebar-background` | hsl(210 15% 95%) | Sidebar — slightly deeper cool gray |
| `--primary` | hsl(200 68% 38%) | Brand blue — CTAs, active states, links |
| `--secondary` | hsl(220 12% 93%) | Subtle fills, code backgrounds |
| `--muted` | hsl(220 8% 96%) | Placeholder backgrounds |
| `--muted-foreground` | hsl(220 8% 48%) | Metadata, secondary labels |
| `--accent` | hsl(220 13% 91%) | Hover states, selected sidebar items |
| `--border` | hsl(220 10% 89%) | All borders |
| `--destructive` | hsl(0 72% 51%) | Errors, destructive actions |

### Color Rules
- Use opacity variants for subtle effects: `bg-black/5` for row hover, `bg-primary/10` for icon backgrounds
- Color communicates meaning — don't use it for decoration
- Active/selected: `bg-accent text-foreground`
- Disabled: `opacity-40` or `opacity-50`, never a separate color

---

## Typography

**Font family:** Inter (loaded from Google Fonts). No overrides.
**Monospace:** JetBrains Mono — code blocks, file extensions, timestamps only.

| Role | Class |
|------|-------|
| Page title | `text-lg font-semibold text-foreground tracking-tight` |
| Section heading | `text-sm font-semibold text-foreground` |
| Body / row primary | `text-sm font-medium text-foreground` |
| Row secondary | `text-sm text-muted-foreground` |
| Metadata / timestamps | `text-xs text-muted-foreground` |
| Column headers | `text-[11px] font-medium text-foreground/60 uppercase tracking-wide` |
| Helper text | `text-[10px] text-muted-foreground` |

---

## Spacing

Uses Tailwind's default spacing scale. Never use arbitrary values like `p-[13px]`.

- Page padding: `p-6`
- Content max-width: `max-w-4xl mx-auto` on all content pages
- Row padding: `px-4 py-3`
- Gap between items: `gap-2` (small), `gap-3` (medium), `gap-4` (large)
- Space between stacked rows: `space-y-0.5` or `space-y-1`

---

## Border Radius

| Element | Class |
|---------|-------|
| Buttons, inputs, list rows | `rounded-lg` |
| Modals, panel containers | `rounded-xl` |
| Small badges, avatars | `rounded-full` |
| Tags, chips | `rounded` |

---

## List Views (Projects, Artifacts, Chats)

The core pattern used everywhere for lists.

```
[Row]  Name + description (flex-1)          Owner  Date  [actions on hover]
[Row]  ...
```

**Rules:**
- `<button>` element, not `<div>`
- No row background — `bg-transparent`
- Hover: `hover:bg-black/5` only
- Actions: `opacity-0 group-hover:opacity-100 transition-opacity`
- Count: "Showing X of Y projects" when filtered, "X projects" unfiltered
- Sort: small clickable column headers above the list
- Load more: IntersectionObserver infinite scroll — NO pagination, NO "Load more" button
- Filters: inline tab pills (not dropdown)
- Search bar: `bg-secondary/50 border border-border rounded-lg px-3 py-2`

---

## Icons

**Library:** Lucide React only. Imported individually.

| Element | Icon | Size |
|---------|------|------|
| Projects (sidebar + page) | `FolderOpen` | `w-3.5 h-3.5` |
| Artifacts (sidebar) | `Layers` | `w-3.5 h-3.5` |
| General Chat (sidebar) | `MessagesSquare` | `w-3.5 h-3.5` |
| Shared / visible | `Globe` | `w-3 h-3` |
| Private | `Lock` | `w-3 h-3` |
| New chat / add | `Plus` | `w-3.5 h-3.5` |
| Edit | `Pencil` | `w-3.5 h-3.5` |
| Search | `Search` | `w-3.5 h-3.5` |
| Upload | `Upload` | `w-3.5 h-3.5` |
| Copy | `Copy` | `w-3.5 h-3.5` |

**Rules:**
- Visibility: icon only — NEVER text ("Private" / "Shared")
- Action buttons: icon only unless it's a named primary CTA
- Every icon button must have `title` attribute for hover tooltip
- Sizes: `w-3 h-3` for row metadata, `w-3.5 h-3.5` for nav/actions, `w-4 h-4` for headers

---

## Buttons

| Type | Classes |
|------|---------|
| Primary CTA | `bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-3 py-1.5 text-sm font-medium` |
| Secondary/outlined | `border border-border text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg px-3 py-1.5 text-sm` |
| Ghost/text | `text-muted-foreground hover:text-foreground transition-colors` |
| Destructive | `text-destructive hover:bg-destructive/10 rounded-lg` |
| Send button | `bg-primary text-primary-foreground rounded-lg p-2 hover:bg-primary/90 disabled:opacity-40` |

---

## Hover States

Every interactive element must have a visible hover state. Rules:

- List rows: `hover:bg-black/5`
- Sidebar items: `hover:bg-accent/60`
- Icon buttons: `hover:bg-accent hover:text-foreground`
- Text/links: `hover:underline` or `hover:text-foreground`
- All transitions: `transition-colors` (duration 150ms default)
- Hover must be in the same color family — no dramatic color changes

---

## Empty States

Shown when a list is empty (and not loading).

```tsx
<div className="flex flex-col items-center justify-center py-20 text-center">
  <Icon className="w-8 h-8 text-muted-foreground/40 mb-3" />
  <p className="text-sm font-medium text-muted-foreground">
    {filtered ? 'No items match your filter' : 'No items yet'}
  </p>
  <p className="text-xs text-muted-foreground/60 mt-1">
    Helpful next step
  </p>
</div>
```

Two messages: one for empty list, one for no search/filter results.

---

## Loading States

- All list views show `<ListRowSkeleton />` while loading
- Chat view shows `<ChatMessageSkeleton />` while loading
- Skeleton uses `animate-pulse` with `bg-muted` placeholder shapes
- Loading controlled by `isLoading` from `useArgo()` context
- ⚠️ `isLoading` is currently a 1.2s demo timer — must be replaced with real async state when connecting Supabase

---

## Modals

```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
  <div className="bg-background rounded-xl border border-border shadow-xl w-full max-w-lg mx-4">
    {/* Header */}
    <div className="px-5 py-4 border-b border-border flex items-center justify-between">
      <h2 className="text-sm font-semibold text-foreground">Title</h2>
      <button title="Close"><X className="w-4 h-4" /></button>
    </div>
    {/* Body */}
    <div className="px-5 py-4 space-y-3 max-h-[70vh] overflow-y-auto argo-scrollbar">
      {/* content */}
    </div>
    {/* Footer */}
    <div className="px-5 py-3 border-t border-border flex gap-2 justify-end">
      <button>Cancel</button>
      <button className="bg-primary ...">Confirm</button>
    </div>
  </div>
</div>
```

- Close on backdrop click
- Max width: `max-w-lg` (form modals) or `max-w-md` (simple confirm)
- Footer actions: Cancel (ghost) left, primary action right

---

## Sidebar

- Background: `bg-sidebar-background`
- Item hover: `hover:bg-accent/60 rounded-lg`
- Active item: `bg-accent text-foreground font-semibold`
- Section labels: `text-[10px] font-semibold text-muted-foreground uppercase tracking-wider`
- Project names truncate with `truncate min-w-0` — icons stay fixed-width `shrink-0`
- "View more" navigates to full page view — does NOT expand inline

---

## Forms & Inputs

```tsx
<input className="w-full text-sm bg-background border border-border rounded-md px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
<textarea className="... resize-none" rows={3} />
```

- Labels: `text-xs font-semibold text-muted-foreground block mb-1`
- Helper text: `text-[10px] text-muted-foreground mt-1`
- Error state: add `border-destructive` to input + show error with `AlertCircle` icon

---

## Where Things Live

| What | Where |
|------|-------|
| CSS tokens / design variables | `src/index.css` |
| Component files | `src/components/argo/*.tsx` |
| Skeleton components | `src/components/argo/skeletons/` |
| Design review skill | `.claude/commands/design-review.md` |
| Style check skill | `.claude/commands/style-check.md` |
| Component audit skill | `.claude/commands/component-audit.md` |
| Mock data | `src/context/ArgoContext.tsx` |
| Supabase client | `src/integrations/supabase/client.ts` |

---

## Skills Quick Reference

| Command | When to use |
|---------|-------------|
| `/design-review [file]` | After building or editing any UI component |
| `/style-check [file]` | Before committing — checks token compliance |
| `/component-audit [file]` | Before engineer handoff |
| `/add-skeleton [file]` | When a list view needs a loading state |
| `/add-empty-state [file]` | When a list view needs an empty state |
| `/supabase-connect` | When connecting real backend data |
