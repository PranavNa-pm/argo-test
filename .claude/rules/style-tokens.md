# Argo Style Tokens — Rule Checklist

Used by: `/style-check`, `/pattern-override`
Source of truth: `src/index.css` and `STYLE_GUIDE.md`

---

## Colors — never hardcode
Allowed: `text-foreground` `text-muted-foreground` `text-primary` `bg-background` `bg-card` `bg-secondary` `bg-accent` `bg-muted` `border-border` `text-destructive` `bg-destructive`
Allowed opacity variants: `bg-black/5` `bg-white/40` `bg-accent/50` `bg-primary/10`

Flag immediately:
- Any `#` hex in className
- Any `rgb(` or `hsl(` in className (outside index.css)
- `bg-blue-*` `bg-gray-*` `bg-slate-*` `text-gray-*` — use tokens instead
- `text-[#...]` or `bg-[#...]` arbitrary values

## Typography
- Sizes: Tailwind scale only — `text-xs` `text-sm` `text-base` `text-lg` `text-xl`
- Allowed small exceptions: `text-[10px]` `text-[11px]` for metadata only
- Weights: `font-normal` `font-medium` `font-semibold` `font-bold` only
- No inline font overrides — Geist comes from `body` in index.css

## Spacing
- Tailwind scale only: `p-1` `p-2` `p-3` `p-4` `p-6` `p-8`
- Flag arbitrary: `p-[13px]` `gap-[7px]` — find nearest scale value

## Border Radius
- Buttons, inputs, rows: `rounded-lg`
- Modals, panels: `rounded-xl`
- Badges, avatars: `rounded-full`
- Never arbitrary: `rounded-[6px]`

## Shadows
- List rows: NO shadow
- Modals: `shadow-xl`
- Never arbitrary shadow values

## Imports
- No unused imports
- Lucide: imported individually, never `* as Icons`
- Path aliases: `@/components/` `@/context/` — not relative `../../`
- Conditional classes: use `cn()` utility — not string concatenation
