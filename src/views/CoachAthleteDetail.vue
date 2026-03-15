<!-- src/views/CoachAthleteDetail.vue — Coach view of a single athlete -->
<template>
  <main class="athlete-detail">
    <!-- HEADER -->
    <section class="page-header">
      <div class="header-inner">
        <router-link to="/coach/athletes" class="back-link">
          <i class="bi bi-arrow-left"></i> Roster
        </router-link>
        <div class="header-kicker">ATHLETE PROFILE</div>
        <div class="header-row" v-if="athlete">
          <div class="ath-avatar">{{ (athlete.displayName || '?')[0].toUpperCase() }}</div>
          <div class="ath-meta">
            <h1 class="ath-name">{{ athlete.displayName }}</h1>
            <span class="ath-sport-badge">{{ athlete.sport || 'Athlete' }}</span>
          </div>
        </div>
        <div v-else-if="loadingAthlete" class="header-row">
          <div class="spinner-border"></div>
        </div>

        <!-- Stats row -->
        <div class="stats-row" v-if="athlete">
          <div class="stat-item">
            <div class="stat-val">{{ activities.length }}</div>
            <div class="stat-lbl">Activities</div>
          </div>
          <div class="stat-item">
            <div class="stat-val">{{ totalDistanceDisplay }}</div>
            <div class="stat-lbl">Total Distance</div>
          </div>
          <div class="stat-item">
            <div class="stat-val">{{ plans.length }}</div>
            <div class="stat-lbl">Plans</div>
          </div>
          <div class="stat-item">
            <div class="stat-val">{{ unreadCount > 0 ? unreadCount : '—' }}</div>
            <div class="stat-lbl">Unread Msgs</div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="tab-bar">
          <button :class="['tab', { active: tab === 'overview' }]" @click="switchTab('overview')">Overview</button>
          <button :class="['tab', { active: tab === 'messages' }]" @click="switchTab('messages')">
            Messages
            <span v-if="unreadCount > 0" class="tab-badge">{{ unreadCount }}</span>
          </button>
        </div>
      </div>
    </section>

    <div class="content-wrap">

      <!-- OVERVIEW TAB -->
      <template v-if="tab === 'overview'">
        <div class="overview-grid">

          <!-- Active Plan card -->
          <div class="overview-card">
            <div class="card-label">ACTIVE PLAN</div>
            <div v-if="activePlan" class="plan-card">
              <div class="plan-name">{{ activePlan.name }}</div>
              <div class="plan-meta">{{ activePlan.sport }} · {{ activePlan.durationWeeks }}w</div>
              <div class="plan-progress-wrap">
                <div class="plan-progress-bar">
                  <div class="plan-progress-fill" :style="{ width: (activePlan.progress || 0) + '%' }"></div>
                </div>
                <span class="plan-pct">{{ activePlan.progress || 0 }}%</span>
              </div>
              <router-link :to="`/coach/plans/${activePlan.id}/edit`" class="btn-edit-plan">
                Edit Plan →
              </router-link>
            </div>
            <div v-else class="no-data">No active plan assigned.</div>
          </div>

          <!-- Recent Activities -->
          <div class="overview-card overview-card--wide">
            <div class="card-label">RECENT ACTIVITIES</div>
            <div v-if="loadingActivities" class="no-data">
              <div class="spinner-border spinner-border-sm me-2"></div> Loading…
            </div>
            <div v-else-if="activities.length === 0" class="no-data">No activities yet.</div>
            <div v-else class="activity-list">
              <router-link
                v-for="act in activities.slice(0, 8)"
                :key="act.id"
                :to="`/activities/${act.id}`"
                class="act-row"
              >
                <span class="act-icon">{{ sportIcon(act.sportType) }}</span>
                <div class="act-info">
                  <div class="act-name">{{ act.name || act.sportType }}</div>
                  <div class="act-meta">
                    {{ formatDistShort(act.distanceMeters) }}
                    <span v-if="act.durationSeconds"> · {{ formatDurShort(act.durationSeconds) }}</span>
                    <span class="act-date"> · {{ formatDateShort(act.createdAt) }}</span>
                  </div>
                </div>
                <i class="bi bi-chevron-right act-arrow"></i>
              </router-link>
            </div>
          </div>

        </div>
      </template>

      <!-- MESSAGES TAB -->
      <template v-else-if="tab === 'messages'">
        <div class="messages-wrap">
          <div class="messages-thread" ref="threadRef">
            <div v-if="loadingMessages" class="msg-loading">
              <div class="spinner-border"></div>
            </div>
            <div v-else-if="messages.length === 0" class="msg-empty">
              <i class="bi bi-chat-dots" style="font-size:2rem;color:#d0d0d0"></i>
              <p>No messages yet. Start the conversation.</p>
            </div>
            <div v-else class="msg-list">
              <div
                v-for="msg in messages"
                :key="msg.id"
                :class="['msg-bubble', msg.senderId === myId ? 'msg-mine' : 'msg-theirs']"
              >
                <div class="msg-body">{{ msg.body }}</div>
                <div class="msg-time">{{ formatTime(msg.createdAt) }}</div>
              </div>
            </div>
          </div>

          <div class="msg-input-row">
            <textarea
              v-model="newMessage"
              class="msg-input"
              placeholder="Type a message…"
              rows="2"
              @keydown.enter.exact.prevent="sendMessage"
            ></textarea>
            <button class="msg-send" @click="sendMessage" :disabled="!newMessage.trim() || sendingMessage">
              <span v-if="sendingMessage" class="spinner-border spinner-border-sm"></span>
              <i v-else class="bi bi-send-fill"></i>
            </button>
          </div>
        </div>
      </template>

    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { useUnits } from '@/composables/useUnits'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
const route = useRoute()
const athleteId = computed(() => Number(route.params.id))

const authStore = useAuthStore()
const { user } = storeToRefs(authStore)
const myId = computed(() => user.value?.id)

const { isImperial } = useUnits()

// ── State ─────────────────────────────────────────────────────
const tab = ref('overview')
const athlete = ref(null)
const loadingAthlete = ref(false)
const activities = ref([])
const loadingActivities = ref(false)
const plans = ref([])
const messages = ref([])
const loadingMessages = ref(false)
const newMessage = ref('')
const sendingMessage = ref(false)
const unreadCount = ref(0)
const threadRef = ref(null)

// ── Computed ──────────────────────────────────────────────────
const activePlan = computed(() => plans.value.find(p => p.active) || plans.value[0] || null)

const totalDistanceDisplay = computed(() => {
  const total = activities.value.reduce((s, a) => s + (a.distanceMeters || 0), 0)
  if (!total) return '—'
  return isImperial.value
    ? `${(total * 0.000621371).toFixed(0)} mi`
    : `${(total / 1000).toFixed(0)} km`
})

// ── Fetch ─────────────────────────────────────────────────────
const fetchAthlete = async () => {
  loadingAthlete.value = true
  try {
    // Fetch from the coach's athletes list and find the matching one
    const { data } = await axios.get(`${API}/coach/athletes`)
    athlete.value = data.find(a => a.id === athleteId.value) || null
  } catch { athlete.value = null }
  finally { loadingAthlete.value = false }
}

const fetchActivities = async () => {
  loadingActivities.value = true
  try {
    const { data } = await axios.get(`${API}/activities`, { params: { userId: athleteId.value, page: 0, size: 20 } })
    activities.value = Array.isArray(data) ? data : (data.content || [])
  } catch { activities.value = [] }
  finally { loadingActivities.value = false }
}

const fetchPlans = async () => {
  try {
    const { data } = await axios.get(`${API}/plans`, { params: { athleteId: athleteId.value } })
    plans.value = Array.isArray(data) ? data : []
  } catch { plans.value = [] }
}

const fetchMessages = async () => {
  loadingMessages.value = true
  try {
    const { data } = await axios.get(`${API}/coach/messages/${athleteId.value}`)
    messages.value = Array.isArray(data) ? data : []
    scrollToBottom()
  } catch { messages.value = [] }
  finally { loadingMessages.value = false }
}

const fetchUnreadCount = async () => {
  try {
    const { data } = await axios.get(`${API}/coach/messages/${athleteId.value}`)
    const msgs = Array.isArray(data) ? data : []
    unreadCount.value = msgs.filter(m => !m.isRead && m.senderId !== myId.value).length
  } catch { unreadCount.value = 0 }
}

const markRead = async () => {
  try {
    await axios.patch(`${API}/coach/messages/${athleteId.value}/read`)
    unreadCount.value = 0
    messages.value = messages.value.map(m =>
      m.senderId !== myId.value ? { ...m, isRead: true } : m
    )
  } catch { /* silent */ }
}

// ── Actions ───────────────────────────────────────────────────
const switchTab = async (t) => {
  tab.value = t
  if (t === 'messages') {
    await fetchMessages()
    await markRead()
  }
}

const sendMessage = async () => {
  if (!newMessage.value.trim() || sendingMessage.value) return
  sendingMessage.value = true
  const body = newMessage.value.trim()
  newMessage.value = ''
  try {
    const { data } = await axios.post(`${API}/coach/messages/${athleteId.value}`, { body })
    messages.value.push(data)
    scrollToBottom()
  } catch {
    newMessage.value = body // restore on failure
  } finally {
    sendingMessage.value = false
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    if (threadRef.value) threadRef.value.scrollTop = threadRef.value.scrollHeight
  })
}

// ── Helpers ───────────────────────────────────────────────────
const formatDistShort = (m) => {
  if (!m) return '—'
  return isImperial.value ? `${(m * 0.000621371).toFixed(1)} mi` : `${(m / 1000).toFixed(1)} km`
}
const formatDurShort = (s) => {
  if (!s) return ''
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}
const formatDateShort = (d) => {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
const formatTime = (d) => {
  if (!d) return ''
  return new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', month: 'short', day: 'numeric' })
}
const sportIcon = (t) => {
  const m = { RUN: '🏃', Running: '🏃', BIKE: '🚴', Cycling: '🚴', SWIM: '🏊', Swimming: '🏊', HIKE: '🥾', WALK: '🚶' }
  return m[t] || '⚡'
}

// ── Lifecycle ─────────────────────────────────────────────────
onMounted(async () => {
  await fetchAthlete()
  await Promise.all([fetchActivities(), fetchPlans(), fetchUnreadCount()])
})
</script>

<style scoped>
.athlete-detail {
  min-height: 100vh;
  background: #fff;
  padding-top: var(--nav-h, 64px);
  font-family: Futura, "Futura PT", "Avenir Next", system-ui, sans-serif;
}

.page-header { background: #000; color: #fff; padding: 24px 24px 0; }
.header-inner { max-width: 1100px; margin: 0 auto; }
.back-link {
  font-size: 0.72rem; font-weight: 700; letter-spacing: 0.10em; text-transform: uppercase;
  color: rgba(255,255,255,0.50); text-decoration: none; display: inline-flex; align-items: center; gap: 6px;
  margin-bottom: 14px; transition: color 0.12s;
}
.back-link:hover { color: #fff; }
.header-kicker { font-size: 0.68rem; letter-spacing: 0.20em; color: rgba(255,255,255,0.45); text-transform: uppercase; margin-bottom: 12px; }

.header-row { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
.ath-avatar {
  width: 56px; height: 56px; background: rgba(255,255,255,0.12); color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.4rem; font-weight: 900; flex-shrink: 0;
}
.ath-name { font-size: clamp(1.4rem, 3vw, 2rem); font-weight: 900; letter-spacing: -0.01em; margin: 0; }
.ath-sport-badge {
  display: inline-block; font-size: 0.68rem; font-weight: 700; letter-spacing: 0.10em;
  text-transform: uppercase; color: rgba(255,255,255,0.60); background: rgba(255,255,255,0.10);
  padding: 2px 8px; margin-top: 4px;
}

.stats-row {
  display: flex; gap: 32px; padding: 16px 0; border-top: 1px solid rgba(255,255,255,0.10);
  margin-bottom: 0; flex-wrap: wrap;
}
.stat-item { text-align: left; }
.stat-val { font-size: 1.4rem; font-weight: 900; color: #fff; line-height: 1; }
.stat-lbl { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.10em; text-transform: uppercase; color: rgba(255,255,255,0.45); margin-top: 3px; }

.tab-bar { display: flex; gap: 0; margin-top: 16px; }
.tab {
  padding: 12px 24px; background: none; border: none;
  font-size: 0.78rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase;
  color: rgba(255,255,255,0.50); cursor: pointer; font-family: inherit;
  border-bottom: 2px solid transparent; transition: color 0.15s, border-color 0.15s;
}
.tab.active { color: #fff; border-bottom-color: #fff; }
.tab-badge {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 18px; height: 18px; padding: 0 4px;
  background: #ef4444; color: #fff; font-size: 0.6rem; font-weight: 700;
  margin-left: 6px;
}

.content-wrap { max-width: 1100px; margin: 0 auto; padding: 28px 24px 80px; }

/* OVERVIEW */
.overview-grid {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 20px;
  align-items: start;
}
.overview-card {
  border: 1px solid #E5E5E5;
  padding: 20px;
}
.overview-card--wide {}
.card-label {
  font-size: 0.65rem; font-weight: 900; letter-spacing: 0.12em; text-transform: uppercase;
  color: rgba(15,18,16,0.40); margin-bottom: 14px;
}
.no-data { font-size: 0.85rem; color: #767676; padding: 8px 0; }

.plan-card { display: flex; flex-direction: column; gap: 6px; }
.plan-name { font-size: 0.95rem; font-weight: 900; color: #000; }
.plan-meta { font-size: 0.75rem; color: #767676; }
.plan-progress-wrap { display: flex; align-items: center; gap: 8px; margin: 4px 0; }
.plan-progress-bar { flex: 1; height: 2px; background: #E5E5E5; }
.plan-progress-fill { height: 100%; background: #000; }
.plan-pct { font-size: 0.7rem; font-weight: 700; color: #767676; }
.btn-edit-plan { font-size: 0.82rem; font-weight: 700; color: #000; text-decoration: none; margin-top: 4px; }
.btn-edit-plan:hover { text-decoration: underline; }

.activity-list { display: flex; flex-direction: column; }
.act-row {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 0; border-bottom: 1px solid #E5E5E5;
  text-decoration: none; color: inherit; transition: background 0.1s;
}
.act-row:last-child { border-bottom: none; }
.act-row:hover { background: #fafafa; }
.act-icon { font-size: 1.2rem; }
.act-info { flex: 1; }
.act-name { font-size: 0.85rem; font-weight: 700; color: #000; }
.act-meta { font-size: 0.72rem; color: #767676; margin-top: 2px; }
.act-date { color: #aaa; }
.act-arrow { color: #ccc; font-size: 0.80rem; }

/* MESSAGES */
.messages-wrap {
  display: flex; flex-direction: column;
  height: calc(100vh - var(--nav-h, 64px) - 280px);
  min-height: 400px;
  border: 1px solid #E5E5E5;
}
.messages-thread {
  flex: 1; overflow-y: auto; padding: 20px;
  display: flex; flex-direction: column; gap: 12px;
}
.msg-loading, .msg-empty {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 10px; flex: 1;
  color: rgba(15,18,16,0.40); text-align: center;
}
.msg-empty p { font-size: 0.85rem; margin: 0; font-weight: 600; }
.msg-list { display: flex; flex-direction: column; gap: 10px; }
.msg-bubble {
  max-width: 70%; display: flex; flex-direction: column; gap: 3px;
}
.msg-mine { align-self: flex-end; align-items: flex-end; }
.msg-theirs { align-self: flex-start; align-items: flex-start; }
.msg-body {
  padding: 10px 14px; font-size: 0.88rem; line-height: 1.5; word-break: break-word;
}
.msg-mine .msg-body { background: #000; color: #fff; }
.msg-theirs .msg-body { background: #f0f0f0; color: #000; }
.msg-time { font-size: 0.65rem; color: rgba(15,18,16,0.40); font-weight: 600; }

.msg-input-row {
  display: flex; gap: 0; border-top: 1px solid #E5E5E5; flex-shrink: 0;
}
.msg-input {
  flex: 1; border: none; padding: 14px 16px; font-size: 0.88rem;
  font-family: inherit; resize: none; outline: none; background: #fff;
}
.msg-send {
  width: 52px; background: #000; color: #fff; border: none;
  font-size: 1rem; cursor: pointer; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  transition: opacity 0.12s;
}
.msg-send:hover { opacity: 0.85; }
.msg-send:disabled { opacity: 0.40; cursor: not-allowed; }

/* Spinner */
.spinner-border {
  width: 1.2rem; height: 1.2rem; border: 2px solid rgba(0,0,0,0.10);
  border-top-color: #000; border-radius: 50%; animation: spin 0.75s linear infinite; display: inline-block;
}
.spinner-border-sm { width: 0.85rem; height: 0.85rem; }
.me-2 { margin-right: 8px; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 768px) {
  .overview-grid { grid-template-columns: 1fr; }
  .stats-row { gap: 20px; }
  .messages-wrap { height: calc(100vh - var(--nav-h, 64px) - 360px); }
}
</style>
