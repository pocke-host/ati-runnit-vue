# Runnit Views — Claude Instructions

## Design System — Good Record (active)
- `border-radius: 0` everywhere — no rounded corners (exception: pill CTAs use `border-radius: 999px`)
- Cards get `box-shadow: none` by default; CTAs and hero cards use **hard offset shadows** like `4px 4px 0 #16130F`
- No CSS gradients except on map/image overlays
- Page background: `#FBF6EC` (Paper)
- Hero sections: `background: #16130F` (Ink), `color: #FBF6EC`
- **Primary buttons: cobalt pill — `background: #2A55F5`, `color: #fff`, `border: 2px solid #16130F`, `border-radius: 999px`, `box-shadow: 4px 4px 0 #16130F`, Spline Mono 700 uppercase**
- **Primary button hover: `background: #1E42D6`**
- Secondary/ghost buttons: white bg, `border: 2px solid #16130F`, no border-radius
- Danger buttons: keep red (`#dc2626` / `#ef4444`)
- Body font: `'Hanken Grotesk', system-ui, sans-serif`
- Display font: `'Big Shoulders Display', system-ui, sans-serif` — weight 800-900, UPPERCASE, `line-height: 0.8-0.9`
- Label/stat font: `'Spline Sans Mono', ui-monospace, monospace` — weight 600-700, uppercase, tabular-nums
- Active nav state: 3px cobalt underline (`border-bottom: 3px solid #2A55F5`)
- Borders: `2px solid #16130F` (ink) for form elements/cards; `2px solid #E7DFCE` (hairline) for dividers
- Audience: **athletes** (not "runners") in all body copy

## Design Tokens — Good Record
```css
--rk-paper:   #FBF6EC   /* page background */
--rk-card:    #FFFFFF   /* card background */
--rk-void:    #16130F   /* ink — text, borders, hero bg */
--rk-signal:  #2A55F5   /* cobalt — primary CTA, active states */
--rk-signal-hover: #1E42D6  /* cobalt hover */
--rk-signal-light: #EEF1FF  /* cobalt tinted surface */
--rk-yellow:  #FFC53D   /* yellow — streaks, PRs, achievements only */
--rk-muted:   #5A5348   /* muted text */
--rk-ash:     #8A8A8A   /* secondary text */
--rk-hairline: #E7DFCE  /* dividers, subtle borders */
--rk-warm:    #F1EADC   /* warm cream — week rail, hover states */
--nav-h: 66px
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
