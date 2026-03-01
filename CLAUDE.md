# Runnit — Claude Code Instructions

## Git Workflow (Critical)

**ALWAYS commit before pulling.** Never run `git pull` or `git rebase` when there are uncommitted changes.
Uncommitted working-tree changes are silently destroyed during merge/rebase conflicts.

Safe sync sequence:
```
git add <files>          # stage your work
git commit -m "..."      # commit first
git pull                 # now safe to pull (configured to rebase)
git push origin master
```

If there are changes to stage/commit, do it BEFORE pulling, no exceptions.

`pull.rebase=true` is set locally — `git pull` will rebase instead of merge, keeping a clean linear history.

## Stack
- Vue 3 + Vite, Composition API (`<script setup>`)
- Pinia stores, Vue Router 4 (lazy-loaded routes in `src/router/index.js`)
- Spring Boot backend at `localhost:8080/api`, JWT auth via localStorage
- Bootstrap 5 + Bootstrap Icons, Mapbox GL, Chart.js

## Project Layout
- `src/views/`       — all routable pages (lazy-loaded)
- `src/components/`  — shared UI components (TopNav, Footer, LiveTracker, RouteViewer, ConnectDevices, legal pages)
- `src/stores/`      — Pinia stores
- `src/composables/` — useUnits.js (ALWAYS use for distance/pace/elevation — never hardcode km/mi)

## Unit System
Default is **imperial** (mi, ft, min/mi). Always use `useUnits()` composable — never hardcode km/m labels.

## Design Tokens
`--r-olive: #5A6B4E` · `--r-olive-deep: #2C3726` · `--r-accent: #C46A2A` · `--r-offwhite: #F5F6F3`
Font: Futura stack. Nav height: `--nav-h: 72px`.
