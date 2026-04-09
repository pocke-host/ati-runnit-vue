# Runnit Views — Claude Instructions

## Design System
- `border-radius: 0` everywhere — no rounded corners
- `box-shadow: none` — no shadows on cards, drawers, hovers
- No CSS gradients except on map/image overlays
- Page background: `#fff`
- Hero sections: `background: #000`
- **Primary buttons: `background: #0052FF`, white text, uppercase, `letter-spacing: 0.12em`, `font-weight: 600`, `font-size: 0.78rem`, `border: 2px solid #0052FF`**
- **Primary button hover: `background: #003ECC`, `border-color: #003ECC`**
- Secondary/ghost buttons: white bg, border `1px solid #E5E5E5`
- Danger buttons: keep red (`#dc2626` / `#ef4444`)
- Font: `Futura, "Futura PT", "Futura Std", "Avenir Next", Avenir, system-ui, ...`
- Active state: `border-bottom: 2px solid #000` (underline, not filled)
- Borders: `1px solid #E5E5E5`

## Design Tokens
```css
/* Electric Blue brand system — do NOT use olive or orange */
--rk-void:    #000000   /* black — hero backgrounds, text */
--rk-signal:  #0052FF   /* electric blue — primary CTA, active states */
--rk-signal-light: #EBF0FF  /* tinted surface */
--rk-ash:     #767676   /* secondary text */
--rk-rule:    #E5E5E5   /* borders */
--rk-smoke:   #F5F5F5   /* alternate bg */
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
