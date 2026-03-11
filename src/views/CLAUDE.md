# Runnit Views — Claude Instructions

## Design System (lululemon aesthetic — non-negotiable)
- `border-radius: 0` everywhere — no rounded corners
- `box-shadow: none` — no shadows on cards, drawers, hovers
- No CSS gradients except on map/image overlays
- Page background: `#fff` (never `--rk-paper` or `#FAF8FF`)
- Hero sections: `background: #000`
- Buttons: black bg, uppercase, `letter-spacing: 0.10em`
- Font: `Futura, "Futura PT", "Futura Std", "Avenir Next", Avenir, system-ui, ...`
- Active state: `border-bottom: 2px solid #000` (underline, not filled)
- Borders: `1px solid #E5E5E5`
- No purple `#8B2BE2` / `--rk-signal` / `--rk-void` / `--rk-paper` tokens anywhere

## Design Tokens
```css
--r-olive: #5A6B4E   (avatar bg only)
--r-accent: #C46A2A  (chart bars, accent text)
--r-offwhite: #F5F6F3
--nav-h: 64px
--tab-h: 64px
```

## Unit System
- **Always use `useUnits()` composable** — never hardcode km/mi/ft
- `formatDistance`, `formatPace`, `formatElevation`, `formatDuration`, `formatDurationClock`
- Default: imperial (mi, ft, min/mi)

## API
- Base: `import.meta.env.VITE_API_URL || 'http://localhost:8080/api'`
- Auth header: `Authorization: Bearer <localStorage token>`

## State Management
- `useAuthStore()` — token, user, unitSystem, setUnitSystem()
- `useActivityStore()` — activities list, fetchActivities()
- `usePlanStore()` — plans, fetchPlan(), completeWorkout()
- `usePRStore()` — personal records
- `useNotificationStore()` — bell count, poll every 30s

## Reactions (Moments + Activities)
Valid types: `LIKE`, `FIRE`, `CLAP` only — matches DB enum exactly

## Router
All routes lazy-loaded in `src/router/index.js`. Auth guard redirects to `/login`.

## Common Patterns
```vue
<script setup>
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
const { user, unitSystem } = storeToRefs(useAuthStore())
</script>
```
Always use `storeToRefs` for reactive destructuring from Pinia stores.
