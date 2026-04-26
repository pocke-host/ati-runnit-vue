<!-- src/views/Notifications.vue — Full notification inbox -->
<template>
  <main class="notif-page">

    <!-- Hero -->
    <section class="notif-hero">
      <div class="notif-hero-inner">
        <div class="notif-kicker">INBOX</div>
        <div class="notif-hero-row">
          <h1 class="notif-hero-title">Notifications</h1>
          <button v-if="unreadCount > 0" class="btn-mark-all" @click="markAll">
            Mark all read
          </button>
        </div>
        <!-- Filter tabs -->
        <div class="notif-tabs">
          <button :class="['ntab', { active: filter === 'all' }]" @click="filter = 'all'">
            All
          </button>
          <button :class="['ntab', { active: filter === 'unread' }]" @click="filter = 'unread'">
            Unread
            <span v-if="unreadCount > 0" class="ntab-badge">{{ unreadCount }}</span>
          </button>
        </div>
      </div>
    </section>

    <!-- Body -->
    <div class="notif-body">

      <div v-if="loading" class="notif-skeleton">
        <SkeletonCard v-for="n in 6" :key="n" variant="activity-row" />
      </div>

      <div v-else-if="filtered.length === 0" class="notif-empty">
        <i class="bi bi-bell"></i>
        <p>{{ filter === 'unread' ? 'No unread notifications' : 'No notifications yet' }}</p>
        <span v-if="filter === 'unread'" class="notif-empty-sub">
          You're all caught up!
        </span>
      </div>

      <!-- Grouped list -->
      <template v-else>
        <div v-for="group in grouped" :key="group.label" class="notif-group">
          <div class="notif-group-label">{{ group.label }}</div>
          <div class="notif-list">
            <div
              v-for="n in group.items"
              :key="n.id"
              :class="['notif-item', { 'notif-item--unread': !n.read }]"
              @click="handleClick(n)"
            >
              <!-- Icon -->
              <div :class="['notif-icon', `notif-icon--${n.type?.toLowerCase()}`]">
                <i :class="iconFor(n.type)"></i>
              </div>

              <!-- Body -->
              <div class="notif-content">
                <p class="notif-msg">{{ n.message || messageFor(n) }}</p>
                <span class="notif-time">{{ relativeTime(n.createdAt) }}</span>
              </div>

              <!-- Unread dot -->
              <div v-if="!n.read" class="notif-dot"></div>

              <!-- Chevron -->
              <i class="bi bi-chevron-right notif-arrow"></i>
            </div>
          </div>
        </div>
      </template>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notification'
import { storeToRefs } from 'pinia'
import SkeletonCard from '@/components/SkeletonCard.vue'

const router = useRouter()
const notifStore = useNotificationStore()
const { notifications, unreadCount, loading } = storeToRefs(notifStore)

const filter = ref('all')

const filtered = computed(() => {
  if (filter.value === 'unread') return notifications.value.filter(n => !n.read)
  return notifications.value
})

// Group by time period
const grouped = computed(() => {
  const now = Date.now()
  const DAY = 86400000
  const groups = [
    { label: 'Today',      items: [], test: (d) => now - d < DAY },
    { label: 'Yesterday',  items: [], test: (d) => now - d >= DAY && now - d < 2 * DAY },
    { label: 'This Week',  items: [], test: (d) => now - d >= 2 * DAY && now - d < 7 * DAY },
    { label: 'Earlier',    items: [], test: (d) => now - d >= 7 * DAY },
  ]
  for (const n of filtered.value) {
    const ts = new Date(n.createdAt).getTime()
    const group = groups.find(g => g.test(ts))
    if (group) group.items.push(n)
  }
  return groups.filter(g => g.items.length > 0)
})

function iconFor(type) {
  const map = {
    NEW_FOLLOWER:     'bi bi-person-plus-fill',
    REACTION:         'bi bi-heart-fill',
    COMMENT:          'bi bi-chat-fill',
    CLUB_INVITE:      'bi bi-people-fill',
    CHALLENGE:        'bi bi-trophy-fill',
    PLAN_ASSIGNED:    'bi bi-calendar-check-fill',
    WORKOUT_REMINDER: 'bi bi-alarm-fill',
    PERSONAL_RECORD:  'bi bi-lightning-fill',
    ACHIEVEMENT:      'bi bi-award-fill',
    COACH_NOTE:       'bi bi-chat-quote-fill',
    ACTIVITY_UPLOAD:  'bi bi-upload',
  }
  return map[type] || 'bi bi-bell-fill'
}

function messageFor(n) {
  const actor = n.actorName || 'Someone'
  switch (n.type) {
    case 'NEW_FOLLOWER':     return `${actor} started following you`
    case 'REACTION':         return `${actor} reacted to your activity`
    case 'COMMENT':          return `${actor} commented on your activity`
    case 'CLUB_INVITE':      return `${actor} invited you to ${n.entityName || 'a club'}`
    case 'CHALLENGE':        return `${actor} joined your challenge`
    case 'PLAN_ASSIGNED':    return `Your coach assigned you a new training plan`
    case 'WORKOUT_REMINDER': return `Reminder: you have a ${n.entityName || 'workout'} planned tomorrow`
    case 'PERSONAL_RECORD':  return `New PR! You set a personal record in ${n.entityName || 'your activity'}`
    case 'ACHIEVEMENT':      return `You unlocked the achievement: ${n.entityName || 'New Achievement'}`
    case 'COACH_NOTE':       return `${actor} left a note on your activity`
    case 'ACTIVITY_UPLOAD':  return `${actor} uploaded a new activity`
    default:                 return n.message || 'New notification'
  }
}

function relativeTime(d) {
  if (!d) return ''
  const diff = Date.now() - new Date(d)
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7)  return `${days}d ago`
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

async function handleClick(n) {
  if (!n.read) await notifStore.markRead(n.id)
  // Navigate to relevant content
  if (n.type === 'NEW_FOLLOWER' && n.actorId)         router.push(`/profile/${n.actorId}`)
  else if (n.type === 'REACTION' || n.type === 'COMMENT') {
    if (n.activityId) router.push(`/activities/${n.activityId}`)
    else router.push('/feed')
  }
  else if (n.type === 'CLUB_INVITE')      router.push('/clubs')
  else if (n.type === 'CHALLENGE')        router.push('/challenges')
  else if (n.type === 'PLAN_ASSIGNED')    router.push('/plans')
  else if (n.type === 'WORKOUT_REMINDER') router.push('/plans')
  else if (n.type === 'PERSONAL_RECORD')  router.push('/stats')
  else if (n.type === 'ACHIEVEMENT')      router.push('/achievements')
  else if (n.type === 'COACH_NOTE' && n.activityId) router.push(`/activities/${n.activityId}`)
}

async function markAll() {
  await notifStore.markAllRead()
}

onMounted(() => {
  notifStore.fetchNotifications()
})
</script>

<style scoped>
.notif-page {
  min-height: 100vh;
  background: #fff;
  padding-top: var(--nav-h, 64px);
  font-family: "Futura PT", Futura, "Century Gothic", system-ui, sans-serif;
}

/* Hero */
.notif-hero {
  background: #000;
  color: #fff;
  padding: 40px 24px 0;
}
.notif-hero-inner {
  max-width: 720px;
  margin: 0 auto;
}
.notif-kicker {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  color: rgba(255,255,255,0.45);
  text-transform: uppercase;
  margin-bottom: 8px;
}
.notif-hero-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}
.notif-hero-title {
  font-size: clamp(1.8rem, 5vw, 2.6rem);
  font-weight: 900;
  letter-spacing: -0.02em;
  margin: 0;
}
.btn-mark-all {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.55);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: color 0.15s;
  white-space: nowrap;
}
.btn-mark-all:hover { color: #fff; }

/* Filter tabs */
.notif-tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid rgba(255,255,255,0.12);
}
.ntab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 20px 12px 0;
  background: none;
  border: none;
  color: rgba(255,255,255,0.45);
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: color 0.15s;
  font-family: inherit;
}
.ntab.active { color: #fff; border-bottom-color: #fff; }
.ntab:hover:not(.active) { color: rgba(255,255,255,0.75); }
.ntab-badge {
  background: #ef4444;
  color: #fff;
  font-size: 0.6rem;
  font-weight: 700;
  padding: 1px 5px;
  min-width: 16px;
  text-align: center;
}

/* Body */
.notif-body {
  max-width: 720px;
  margin: 0 auto;
  padding: 32px 24px 80px;
}

.notif-skeleton {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 0;
}

.notif-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 80px 24px;
  color: #767676;
  text-align: center;
}
.notif-empty i { font-size: 2.5rem; }
.notif-empty p { margin: 0; font-size: 0.9rem; font-weight: 600; }
.notif-empty-sub { font-size: 0.78rem; }

/* Groups */
.notif-group { margin-bottom: 32px; }
.notif-group-label {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #aaa;
  margin-bottom: 10px;
}

/* Items */
.notif-list { display: flex; flex-direction: column; }
.notif-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.1s;
  position: relative;
}
.notif-item:last-child { border-bottom: none; }
.notif-item:hover { background: #fafafa; margin: 0 -12px; padding: 16px 12px; }
.notif-item--unread { background: #fafafa; }
.notif-item--unread:hover { background: #f5f5f5; }

/* Icon */
.notif-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  flex-shrink: 0;
  background: #f0f0f0;
  color: #000;
}
.notif-icon--new_follower  { background: #f0f0f0; color: #000; }
.notif-icon--reaction      { background: #fff0f0; color: #ef4444; }
.notif-icon--comment       { background: #EBF0FF; color: #0052FF; }
.notif-icon--club_invite   { background: #f0f0f0; color: #000; }
.notif-icon--challenge     { background: #EBF0FF; color: #0052FF; }
.notif-icon--plan_assigned { background: #EBF0FF; color: #0052FF; }
.notif-icon--workout_reminder { background: #EBF0FF; color: #0052FF; }
.notif-icon--personal_record  { background: #EBF0FF; color: #0052FF; }
.notif-icon--achievement       { background: #EBF0FF; color: #0052FF; }
.notif-icon--coach_note        { background: #EBF0FF; color: #0052FF; }
.notif-icon--activity_upload   { background: #f0f0f0; color: #000; }

.notif-content { flex: 1; min-width: 0; }
.notif-msg {
  font-size: 0.88rem;
  font-weight: 400;
  color: #111;
  margin: 0 0 3px;
  line-height: 1.45;
}
.notif-item--unread .notif-msg { font-weight: 600; }
.notif-time { font-size: 0.72rem; color: #999; }

.notif-dot {
  width: 7px;
  height: 7px;
  background: #0052FF;
  flex-shrink: 0;
}
.notif-arrow {
  font-size: 0.7rem;
  color: #ccc;
  flex-shrink: 0;
}

/* Spinner */
.spinner-border {
  width: 1.1rem; height: 1.1rem;
  border: 2px solid rgba(0,0,0,0.10);
  border-top-color: #000;
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
  display: inline-block;
}
.me-2 { margin-right: 8px; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 600px) {
  .notif-hero { padding: 28px 16px 0; }
  .notif-body { padding: 24px 16px 80px; }
  .ntab { padding: 12px 16px 12px 0; font-size: 0.72rem; }
}
</style>
