# Runnit Pinia Stores — Claude Instructions

## Stores
| File | Purpose |
|------|---------|
| `auth.js` | token, user object, unitSystem, login/logout/register |
| `activity.js` | activities[], fetchActivities(), pagination |
| `plan.js` | plans[], fetchPlan(id), completeWorkout(), setActivePlan() |
| `pr.js` | allPRs[], fetchPRs(activities) — client-side computed |
| `notification.js` | unreadCount, fetchNotifications(), markAllRead(), 30s poll |
| `follow.js` | followingIds Set, follow/unfollow |
| `moment.js` | moments feed |
| `upload.js` | S3 presigned upload helper |

## Auth Store Pattern
```js
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
const authStore = useAuthStore()
const { user, unitSystem, isAuthenticated } = storeToRefs(authStore)
// NEVER: const isAuthenticated = computed(() => localStorage.getItem('token'))
// Always use storeToRefs for reactivity
```

## API Calls
All stores use axios with:
```js
const token = localStorage.getItem('token')
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
```
Or per-call headers: `{ headers: { Authorization: \`Bearer \${token}\` } }`
