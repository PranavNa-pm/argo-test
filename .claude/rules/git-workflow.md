# Argo Git Workflow — Rules

## Remotes
- `origin` → `Argo-PN-Sandbox` — **default working repo**
- `live` → `Argo-Live` — **production, never push without explicit approval**

## Rules
- All commits and pushes go to `origin` (Argo-PN-Sandbox) by default
- NEVER push to `live` unless the user explicitly says "push to live" or "sync live"
- When pushing to live is requested, confirm what will be pushed before doing it
- `git push live` is blocked by settings.json deny rule as a safeguard
