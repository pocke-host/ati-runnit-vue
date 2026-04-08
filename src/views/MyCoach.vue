<!-- src/views/MyCoach.vue — Athlete-facing coach relationship + messaging -->
<template>
  <main class="my-coach-page">

    <!-- HERO -->
    <section class="page-hero">
      <div class="hero-inner">
        <div class="hero-kicker">COACHING</div>
        <h1 class="hero-title">My Coach</h1>
      </div>
    </section>

    <div class="content-wrap">

      <!-- Loading -->
      <div v-if="loadingCoach" class="center-state">
        <div class="spinner-border"></div>
      </div>

      <!-- No coach — Find a Coach CTA -->
      <template v-else-if="!coach && !pendingCoachName">
        <div class="no-coach-card">
          <div class="no-coach-icon"><i class="bi bi-person-lines-fill"></i></div>
          <h2 class="no-coach-title">You don't have a coach yet</h2>
          <p class="no-coach-desc">
            Find a certified coach to guide your training, review your workouts, and help you reach your goals.
          </p>
          <router-link to="/coaches" class="btn-find-coach">Find a Coach</router-link>
        </div>
      </template>

      <!-- Pending request -->
      <template v-else-if="!coach && pendingCoachName">
        <div class="pending-card">
          <div class="pending-badge"><i class="bi bi-hourglass-split me-2"></i>Request Pending</div>
          <p class="pending-desc">
            Your coaching request to <strong>{{ pendingCoachName }}</strong> is awaiting approval.
          </p>
          <router-link to="/coaches" class="btn-browse-link">Browse other coaches</router-link>
        </div>
      </template>

      <!-- Has coach -->
      <template v-else-if="coach">

        <!-- Coach card -->
        <div class="coach-card">
          <div class="coach-avatar">{{ (coach.displayName || '?')[0].toUpperCase() }}</div>
          <div class="coach-info">
            <div class="coach-name">{{ coach.displayName }}</div>
            <div class="coach-meta">
              <span class="coach-sport-badge">{{ coach.sport || 'Coach' }}</span>
              <span class="coach-email">{{ coach.email }}</span>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="tab-bar">
          <button :class="['tab', { active: tab === 'messages' }]" @click="switchTab('messages')">
            Messages
            <span v-if="unreadCount > 0" class="tab-badge">{{ unreadCount }}</span>
          </button>
        </div>

        <!-- Messages -->
        <div class="messages-wrap" v-if="tab === 'messages'">
          <div class="messages-thread" ref="threadRef">
            <div v-if="loadingMessages" class="msg-state">
              <div class="spinner-border"></div>
            </div>
            <div v-else-if="messages.length === 0" class="msg-state">
              <i class="bi bi-chat-dots" style="font-size:2rem;color:#d0d0d0"></i>
              <p>No messages yet. Say hello to your coach!</p>
            </div>
            <div v-else class="msg-list">
              <div
                v-for="msg in messages"
                :key="msg.id"
                :class="['msg-bubble', msg.senderId === myId ? 'msg-mine' : 'msg-theirs']"
              >
                <div class="msg-sender" v-if="msg.senderId !== myId">{{ coach.displayName }}</div>
                <div class="msg-body">{{ msg.body }}</div>
                <div class="msg-time">{{ formatTime(msg.createdAt) }}</div>
              </div>
            </div>
          </div>

          <div class="msg-input-row">
            <textarea
              v-model="newMessage"
              class="msg-input"
              placeholder="Message your coach…"
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
import { ref, computed, onMounted, nextTick } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
const authStore = useAuthStore()
const { user } = storeToRefs(authStore)
const myId = computed(() => user.value?.id)

// ── State ─────────────────────────────────────────────────────
const tab = ref('messages')
const coach = ref(null)
const loadingCoach = ref(false)
const pendingCoachName = ref('')
const messages = ref([])
const loadingMessages = ref(false)
const newMessage = ref('')
const sendingMessage = ref(false)
const unreadCount = ref(0)
const threadRef = ref(null)

// ── Fetch ─────────────────────────────────────────────────────
const fetchCoach = async () => {
  loadingCoach.value = true
  try {
    const { data } = await axios.get(`${API}/athlete/coach`)
    coach.value = data || null
  } catch { coach.value = null }
  finally { loadingCoach.value = false }
}

const fetchMessages = async () => {
  if (!coach.value || !myId.value) return
  loadingMessages.value = true
  try {
    const { data } = await axios.get(`${API}/coach/messages/${myId.value}`)
    messages.value = Array.isArray(data) ? data : []
    const unread = messages.value.filter(m => !m.isRead && m.senderId !== myId.value).length
    unreadCount.value = unread
    scrollToBottom()
  } catch { messages.value = [] }
  finally { loadingMessages.value = false }
}

const markRead = async () => {
  if (!myId.value) return
  try {
    await axios.patch(`${API}/coach/messages/${myId.value}/read`)
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
    const { data } = await axios.post(`${API}/coach/messages/${myId.value}`, { body })
    messages.value.push(data)
    scrollToBottom()
  } catch {
    newMessage.value = body
  } finally {
    sendingMessage.value = false
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    if (threadRef.value) threadRef.value.scrollTop = threadRef.value.scrollHeight
  })
}

const formatTime = (d) => {
  if (!d) return ''
  return new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

// ── Lifecycle ─────────────────────────────────────────────────
onMounted(async () => {
  await fetchCoach()
  if (coach.value) {
    await fetchMessages()
    await markRead()
  }
})
</script>

<style scoped>
.my-coach-page {
  min-height: 100vh;
  background: #fff;
  padding-top: var(--nav-h, 64px);
  font-family: Futura, "Futura PT", "Avenir Next", system-ui, sans-serif;
}

.page-hero { background: #000; color: #fff; padding: 40px 24px 32px; }
.hero-inner { max-width: 800px; margin: 0 auto; }
.hero-kicker { font-size: 0.68rem; letter-spacing: 0.20em; color: rgba(255,255,255,0.45); text-transform: uppercase; margin-bottom: 10px; }
.hero-title { font-size: clamp(1.8rem, 4vw, 2.8rem); font-weight: 900; margin: 0; letter-spacing: -0.01em; }

.content-wrap { max-width: 800px; margin: 0 auto; padding: 32px 24px 80px; }

/* States */
.center-state {
  display: flex; align-items: center; justify-content: center; padding: 60px;
}

/* No coach */
.no-coach-card {
  display: flex; flex-direction: column; align-items: center; text-align: center;
  padding: 60px 24px; border: 1px solid #E5E5E5;
}
.no-coach-icon { font-size: 3rem; color: #ccc; margin-bottom: 16px; }
.no-coach-title { font-size: 1.2rem; font-weight: 900; margin: 0 0 12px; }
.no-coach-desc { font-size: 0.88rem; color: #767676; max-width: 360px; margin: 0 0 24px; line-height: 1.6; }
.btn-find-coach {
  height: 44px; padding: 0 32px; background: #0052FF; color: #fff; border: none;
  font-size: 0.80rem; font-weight: 700; letter-spacing: 0.10em; text-transform: uppercase;
  text-decoration: none; display: inline-flex; align-items: center; cursor: pointer;
}
.btn-find-coach:hover { background: #003ECC; }

/* Pending */
.pending-card {
  padding: 28px; border: 1px solid #E5E5E5;
  display: flex; flex-direction: column; gap: 10px;
}
.pending-badge {
  display: inline-flex; align-items: center;
  font-size: 0.72rem; font-weight: 700; letter-spacing: 0.10em; text-transform: uppercase;
  color: #0052FF; background: #EBF0FF; padding: 4px 10px;
  width: fit-content;
}
.pending-desc { font-size: 0.88rem; color: #767676; margin: 0; }
.btn-browse-link {
  font-size: 0.82rem; font-weight: 700; color: #000; text-decoration: none; width: fit-content;
}
.btn-browse-link:hover { text-decoration: underline; }

/* Coach card */
.coach-card {
  display: flex; align-items: center; gap: 16px;
  padding: 20px; border: 1px solid #E5E5E5; margin-bottom: 24px;
}
.coach-avatar {
  width: 52px; height: 52px; background: #000; color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.3rem; font-weight: 900; flex-shrink: 0;
}
.coach-name { font-size: 1rem; font-weight: 900; color: #000; margin-bottom: 6px; }
.coach-meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.coach-sport-badge {
  font-size: 0.65rem; font-weight: 700; letter-spacing: 0.10em; text-transform: uppercase;
  background: #f0f0f0; color: #000; padding: 2px 8px;
}
.coach-email { font-size: 0.78rem; color: #767676; }

/* Tabs */
.tab-bar { display: flex; border-bottom: 1px solid #E5E5E5; margin-bottom: 20px; }
.tab {
  padding: 12px 24px; background: none; border: none;
  font-size: 0.78rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase;
  color: rgba(15,18,16,0.45); cursor: pointer; font-family: inherit;
  border-bottom: 2px solid transparent; margin-bottom: -1px;
  transition: color 0.15s, border-color 0.15s;
}
.tab.active { color: #000; border-bottom-color: #000; }
.tab-badge {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 18px; height: 18px; padding: 0 4px;
  background: #ef4444; color: #fff; font-size: 0.6rem; font-weight: 700; margin-left: 6px;
}

/* Messages */
.messages-wrap {
  display: flex; flex-direction: column;
  height: calc(100vh - var(--nav-h, 64px) - 340px);
  min-height: 360px;
  border: 1px solid #E5E5E5;
}
.messages-thread { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 10px; }
.msg-state {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 10px; flex: 1;
  color: rgba(15,18,16,0.40); text-align: center;
}
.msg-state p { font-size: 0.85rem; margin: 0; font-weight: 600; }
.msg-list { display: flex; flex-direction: column; gap: 10px; }

.msg-bubble {
  max-width: 70%; display: flex; flex-direction: column; gap: 3px;
}
.msg-mine { align-self: flex-end; align-items: flex-end; }
.msg-theirs { align-self: flex-start; align-items: flex-start; }
.msg-sender { font-size: 0.65rem; font-weight: 700; color: #767676; letter-spacing: 0.06em; }
.msg-body { padding: 10px 14px; font-size: 0.88rem; line-height: 1.5; word-break: break-word; }
.msg-mine .msg-body { background: #000; color: #fff; }
.msg-theirs .msg-body { background: #f0f0f0; color: #000; }
.msg-time { font-size: 0.65rem; color: rgba(15,18,16,0.40); font-weight: 600; }

.msg-input-row { display: flex; border-top: 1px solid #E5E5E5; flex-shrink: 0; }
.msg-input {
  flex: 1; border: none; padding: 14px 16px; font-size: 0.88rem;
  font-family: inherit; resize: none; outline: none; background: #fff;
}
.msg-send {
  width: 52px; background: #000; color: #fff; border: none;
  font-size: 1rem; cursor: pointer; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center; transition: opacity 0.12s;
}
.msg-send:hover { opacity: 0.85; }
.msg-send:disabled { opacity: 0.40; cursor: not-allowed; }

.spinner-border {
  width: 1.2rem; height: 1.2rem; border: 2px solid rgba(0,0,0,0.10);
  border-top-color: #000; border-radius: 50%; animation: spin 0.75s linear infinite; display: inline-block;
}
.spinner-border-sm { width: 0.85rem; height: 0.85rem; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 600px) {
  .page-hero { padding: 28px 16px 24px; }
  .hero-title { font-size: 2rem; }
  .content-wrap { padding: 20px 16px 80px; }
  .coach-card { flex-direction: column; align-items: flex-start; gap: 12px; }
  .coach-avatar { width: 52px; height: 52px; font-size: 1.3rem; }
  .msg-list { max-height: 50vh; }
  .msg-compose { flex-direction: column; gap: 8px; }
  .msg-send { width: 100%; padding: 12px; }
  .msg-input { width: 100%; }
}
</style>
