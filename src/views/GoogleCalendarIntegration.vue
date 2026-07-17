<template>
  <div class="gcal-page">
    <div class="gcal-wrap">

      <!-- Header -->
      <div class="gcal-header">
        <button class="btn-back" @click="$router.back()">←</button>
        <div>
          <div class="gcal-kicker">Integrations</div>
          <h1 class="gcal-title">Google Calendar</h1>
        </div>
      </div>

      <!-- Explainer card -->
      <div class="gcal-explainer">
        <div class="gcal-explainer-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="28" height="28"><rect x="3" y="4" width="18" height="18"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        </div>
        <div>
          <div class="gcal-explainer-head">Two-way training visibility</div>
          <p class="gcal-explainer-body">Connect once and your planned workouts — runs, rides, swims, strength sessions — push to Google Calendar automatically. Your training shows up alongside your meetings so nothing gets lost.</p>
        </div>
      </div>

      <!-- How it works -->
      <div class="gcal-how">
        <div class="gcal-how-label">HOW IT WORKS</div>
        <div class="gcal-steps">
          <div class="gcal-step">
            <div class="gcal-step-num">01</div>
            <div class="gcal-step-body">Connect your Google account below — one OAuth popup, done.</div>
          </div>
          <div class="gcal-step">
            <div class="gcal-step-num">02</div>
            <div class="gcal-step-body">Click Sync Now to push all upcoming planned workouts.</div>
          </div>
          <div class="gcal-step">
            <div class="gcal-step-num">03</div>
            <div class="gcal-step-body">Workouts appear color-coded by sport in your Google Calendar.</div>
          </div>
        </div>
      </div>

      <!-- The sync card -->
      <GoogleCalendarSync :workouts="workouts" />
      <p v-if="workouts.length" class="gcal-ready-note">
        {{ workouts.length }} upcoming workout{{ workouts.length === 1 ? '' : 's' }} ready to sync.
      </p>

      <!-- Sport color legend -->
      <div class="gcal-legend">
        <div class="gcal-legend-label">CALENDAR COLORS</div>
        <div class="gcal-legend-grid">
          <div class="gcal-legend-item"><span class="dot dot--run"></span>Run</div>
          <div class="gcal-legend-item"><span class="dot dot--ride"></span>Ride</div>
          <div class="gcal-legend-item"><span class="dot dot--swim"></span>Swim</div>
          <div class="gcal-legend-item"><span class="dot dot--strength"></span>Strength</div>
        </div>
      </div>

      <!-- Read: what's already on your Google Calendar -->
      <div class="gcal-read" v-if="connected">
        <div class="gcal-how-label">YOUR GOOGLE CALENDAR — NEXT 30 DAYS</div>
        <button class="gcal-load-btn" @click="loadGoogleEvents" :disabled="syncing">
          {{ syncing ? 'Loading…' : 'Load my events' }}
        </button>

        <div v-if="importedEvents.length" class="gcal-read-list">
          <div v-for="ev in importedEvents" :key="ev.id" class="gcal-read-item">
            <span class="gcal-read-time">{{ formatEventTime(ev) }}</span>
            <span class="gcal-read-title">{{ ev.summary || '(No title)' }}</span>
          </div>
        </div>
        <p v-else-if="hasLoadedEvents" class="gcal-explainer-body">No events found in the next 30 days.</p>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useHead } from '@unhead/vue'
import axios from 'axios'
import GoogleCalendarSync from '@/components/GoogleCalendarSync.vue'
import { useGoogleCalendar } from '@/composables/useGoogleCalendar'

useHead({
  title: 'Google Calendar — Runnit',
  meta: [{ name: 'description', content: 'Sync your Runnit training plan to Google Calendar.' }],
})

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const workouts = ref([])

async function loadUpcomingWorkouts() {
  const start = new Date().toISOString().slice(0, 10)
  const end = new Date(Date.now() + 60 * 86400000).toISOString().slice(0, 10)
  try {
    const { data } = await axios.get(`${API}/workout-events`, {
      params: { start, end },
      headers: getAuthHeaders(),
    })
    workouts.value = (data || []).map(ev => ({
      date: ev.plannedDate,
      title: ev.title || ev.workoutType?.replace('_', ' ') || 'Workout',
      description: ev.description || '',
      sport: ev.workoutType,
      durationMinutes: ev.durationMinutes,
    }))
  } catch {
    workouts.value = []
  }
}

onMounted(loadUpcomingWorkouts)

const { connected, syncing, importedEvents, hasLoadedEvents, readAll } = useGoogleCalendar()

function loadGoogleEvents() {
  readAll()
}

function formatEventTime(ev) {
  const raw = ev.start?.dateTime || ev.start?.date
  if (!raw) return ''
  const d = new Date(raw)
  if (ev.start?.date && !ev.start?.dateTime) return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}
</script>

<style scoped>
.gcal-page {
  min-height: 100vh;
  background: #FBF6EC;
  padding-top: var(--nav-h, 66px);
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
  color: #16130F;
}

.gcal-wrap {
  max-width: 680px;
  margin: 0 auto;
  padding: 40px 24px 80px;
}

.gcal-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 36px;
}

.btn-back {
  width: 38px;
  height: 38px;
  border: 2px solid #16130F;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 800;
  color: #16130F;
  transition: background 0.15s;
  flex-shrink: 0;
}
.btn-back:hover { background: rgba(22,19,15,0.06); }

.gcal-kicker {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #2A55F5;
  margin-bottom: 4px;
}

.gcal-title {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-weight: 900;
  font-size: clamp(1.8rem, 6vw, 2.8rem);
  line-height: 0.85;
  text-transform: uppercase;
  margin: 0;
}

/* Explainer */
.gcal-explainer {
  border: 2px solid #16130F;
  background: #fff;
  padding: 24px;
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
  box-shadow: 4px 4px 0 #16130F;
}

.gcal-explainer-icon {
  flex-shrink: 0;
  color: #2A55F5;
  margin-top: 2px;
}

.gcal-explainer-head {
  font-weight: 800;
  font-size: 1rem;
  margin-bottom: 8px;
}

.gcal-explainer-body {
  color: #5A5348;
  font-size: 0.9rem;
  line-height: 1.6;
  margin: 0;
}

/* How it works */
.gcal-how {
  margin-bottom: 24px;
}

.gcal-how-label {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #2A55F5;
  margin-bottom: 12px;
}

.gcal-steps {
  display: flex;
  flex-direction: column;
  border: 2px solid #16130F;
}

.gcal-step {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  padding: 16px 20px;
  border-bottom: 2px solid #16130F;
}
.gcal-step:last-child { border-bottom: none; }

.gcal-step-num {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.72rem;
  font-weight: 700;
  color: #2A55F5;
  flex-shrink: 0;
  margin-top: 1px;
}

.gcal-step-body {
  font-size: 0.92rem;
  line-height: 1.5;
  color: #16130F;
}

/* Legend */
.gcal-legend {
  margin-top: 20px;
  border: 2px solid #E7DFCE;
  padding: 16px 20px;
}

.gcal-legend-label {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #8A8A8A;
  margin-bottom: 12px;
}

.gcal-legend-grid {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.gcal-legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  font-weight: 600;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}
.dot--run      { background: #4e72ef; }
.dot--ride     { background: #0f9d58; }
.dot--swim     { background: #9e69af; }
.dot--strength { background: #f4b400; }

.gcal-ready-note {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.75rem;
  color: #2A55F5;
  margin: 10px 2px 0;
}

/* Read section */
.gcal-read {
  margin-top: 24px;
  border: 2px solid #16130F;
  background: #fff;
  padding: 20px;
}

.gcal-load-btn {
  border: 2px solid #16130F;
  border-radius: 999px;
  background: #2A55F5;
  color: #fff;
  box-shadow: 3px 3px 0 #16130F;
  padding: 8px 18px;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  margin-bottom: 14px;
  transition: background 0.15s;
}
.gcal-load-btn:hover:not(:disabled) { background: #1E42D6; }
.gcal-load-btn:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }

.gcal-read-list {
  border-top: 2px solid #E7DFCE;
  padding-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.gcal-read-item {
  display: flex;
  gap: 12px;
  align-items: baseline;
  font-size: 0.88rem;
}

.gcal-read-time {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.7rem;
  font-weight: 700;
  color: #5A5348;
  flex-shrink: 0;
  min-width: 92px;
}

.gcal-read-title {
  color: #16130F;
  font-weight: 600;
}

@media (max-width: 640px) {
  .gcal-wrap { padding: 28px 18px 80px; }
  .gcal-explainer { flex-direction: column; gap: 12px; }
}
</style>
