# Argo Component Structure — Rule Checklist

Used by: `/component-audit`, `/new-component`, `/pattern-override`
Source of truth: `STYLE_GUIDE.md`

---

## Files
- One component per file
- File name = component name exactly (PascalCase): `ChatView.tsx` → `export function ChatView`
- Location: `src/components/argo/[ComponentName].tsx`
- Skeletons: `src/components/argo/skeletons/[Name]Skeleton.tsx`

## Exports
- Named exports only: `export function ComponentName()`
- Never `export default` in `src/components/argo/`

## Props
- TypeScript typed — no `any`
- Optional props use `?` with sensible defaults
- Prop names: descriptive (`onClose` not `handler`, `spaceName` not `name`)
- No prop drilling beyond 2 levels — use `useArgo()` context

## State
- Local UI state → `useState` in component
- Shared app state → `useArgo()` context
- Mock data lives in `ArgoContext.tsx` only — never inside components
- `isLoading` from `useArgo()` — never a local `useState(false)`

## Naming
- Components: PascalCase
- Handlers: `handle` prefix (`handleSend`, `handleClose`)
- Props callbacks: `on` prefix (`onClose`, `onSave`)
- Booleans: `is`/`has`/`show` prefix (`isLoading`, `showModal`)
- Constants: `SCREAMING_SNAKE_CASE`

## Hooks
- `useEffect` has correct dependency arrays
- IntersectionObserver cleanup: `return () => observer.disconnect()`
- No `useEffect` just to sync props → state

## Size
- Under 300 lines per file
- No function longer than 60 lines

## Comments
- Complex logic has a WHY comment
- DEMO/prototype code: `// DEMO ONLY — remove when connecting backend`
- No commented-out code
- Date stamp on creation: `// Created: YYYY-MM-DD`

## Accessibility (desktop minimum)
- Icon-only buttons have `title` attribute
- Interactive elements are `<button>` not `<div onClick>`
- Inputs have label or `aria-label`
