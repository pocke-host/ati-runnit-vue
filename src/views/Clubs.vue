<!-- src/views/Clubs.vue -->
<template>
  <main class="clubs-page">
    <!-- HERO -->
    <section class="hero">
      <div class="container-xxl">
        <h1 class="display-5 fw-bold mb-3">Clubs</h1>
        <p class="lead mb-0">
          Connect with athletes who share your passions. Join a club and train together.
        </p>
      </div>
    </section>

    <!-- TAB BAR -->
    <section class="controls">
      <div class="container-xxl">
        <!-- Tabs -->
        <div class="tab-bar mb-4">
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'discover' }"
            @click="activeTab = 'discover'"
          >
            <i class="bi bi-compass me-2"></i>Discover
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'my' }"
            @click="activeTab = 'my'"
          >
            <i class="bi bi-people-fill me-2"></i>My Clubs
            <span v-if="myClubs.length" class="tab-badge">{{ myClubs.length }}</span>
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'invite' }"
            @click="activeTab = 'invite'"
          >
            <i class="bi bi-link-45deg me-2"></i>Invite Links
          </button>
        </div>

        <!-- Filters (only on Discover tab) -->
        <div v-if="activeTab === 'discover'" class="filter-bar">
          <!-- Sport Pills -->
          <div class="sport-pills">
            <button
              v-for="s in ['All', ...sports]"
              :key="s"
              class="sport-pill"
              :class="{ active: sport === s }"
              @click="sport = s"
            >
              {{ s }}
            </button>
          </div>

          <!-- Search & Sort -->
          <div class="search-sort">
            <div class="search-box">
              <i class="bi bi-search"></i>
              <input v-model.trim="q" class="form-control" placeholder="Search clubs…" />
            </div>
            <select v-model="sortBy" class="form-select sort-select">
              <option value="popular">Most popular</option>
              <option value="new">Newest</option>
            </select>
          </div>
        </div>
      </div>
    </section>

    <!-- LOADING -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-success" role="status"></div>
      <p class="mt-2 text-muted">Loading clubs…</p>
    </div>

    <!-- DISCOVER TAB -->
    <section v-else-if="activeTab === 'discover'" class="list">
      <div class="container-xxl">
        <div class="row g-4">
          <div
            class="col-12 col-sm-6 col-lg-4"
            v-for="club in filtered"
            :key="club.id"
          >
            <article class="club-card h-100">
              <div
                class="thumb"
                :style="{ backgroundImage: club.imageUrl ? `url(${club.imageUrl})` : 'none' }"
              >
                <span class="sport-tag">{{ club.sport || 'General' }}</span>
              </div>
              <div class="body">
                <h5 class="title mb-1">{{ club.name }}</h5>
                <p class="text-muted small mb-2">
                  <i class="bi bi-people-fill me-1"></i>{{ formatK(club.memberCount ?? club.members ?? 0) }} members
                </p>
                <p class="small mb-3 flex-grow-1">{{ club.description }}</p>
                <div class="d-flex gap-2 align-items-center mt-auto">
                  <button
                    v-if="!isJoined(club.id)"
                    class="btn-join"
                    :disabled="joiningId === club.id"
                    @click="joinClub(club.id)"
                  >
                    <span v-if="joiningId === club.id" class="spinner-border spinner-border-sm me-1"></span>
                    Join
                  </button>
                  <template v-else>
                    <button class="chat-btn" @click="openChat(club)">
                      <i class="bi bi-chat-dots-fill me-1"></i>Chat
                    </button>
                    <button
                      class="btn-leave"
                      :disabled="joiningId === club.id"
                      @click="leaveClub(club.id)"
                    >
                      <span v-if="joiningId === club.id" class="spinner-border spinner-border-sm me-1"></span>
                      Leave
                    </button>
                  </template>
                </div>
              </div>
            </article>
          </div>

          <!-- Empty -->
          <div class="col-12" v-if="filtered.length === 0">
            <div class="empty">
              <i class="bi bi-search display-4 text-muted d-block mb-3"></i>
              <h5 class="mb-1">No clubs found</h5>
              <p class="text-muted m-0">Try another sport or search term.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- MY CLUBS TAB -->
    <section v-else-if="activeTab === 'my'" class="list">
      <div class="container-xxl">
        <div v-if="myClubs.length === 0" class="empty">
          <i class="bi bi-people display-4 text-muted d-block mb-3"></i>
          <h5 class="mb-1">You haven't joined any clubs yet</h5>
          <p class="text-muted mb-3">Head to Discover to find clubs that match your sport.</p>
          <button class="btn-join" @click="activeTab = 'discover'">Discover Clubs</button>
        </div>
        <div v-else class="row g-4">
          <div
            class="col-12 col-sm-6 col-lg-4"
            v-for="club in myClubs"
            :key="club.id"
          >
            <article class="club-card h-100">
              <div
                class="thumb"
                :style="{ backgroundImage: club.imageUrl ? `url(${club.imageUrl})` : 'none' }"
              >
                <span class="sport-tag">{{ club.sport || 'General' }}</span>
              </div>
              <div class="body">
                <h5 class="title mb-1">{{ club.name }}</h5>
                <p class="text-muted small mb-2">
                  <i class="bi bi-people-fill me-1"></i>{{ formatK(club.memberCount ?? club.members ?? 0) }} members
                </p>
                <p class="small mb-3 flex-grow-1">{{ club.description }}</p>
                <div class="d-flex gap-2 align-items-center mt-auto">
                  <button class="chat-btn flex-grow-1" @click="openChat(club)">
                    <i class="bi bi-chat-dots-fill me-1"></i>Open Chat
                  </button>
                  <button
                    class="btn-leave"
                    :disabled="joiningId === club.id"
                    @click="leaveClub(club.id)"
                  >
                    <span v-if="joiningId === club.id" class="spinner-border spinner-border-sm me-1"></span>
                    Leave
                  </button>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>

    <!-- INVITE TAB -->
    <section v-else-if="activeTab === 'invite'" class="list">
      <div class="container-xxl">
        <div v-if="myClubs.length === 0" class="empty">
          <i class="bi bi-link-45deg display-4 text-muted d-block mb-3"></i>
          <h5 class="mb-1">No clubs to invite to</h5>
          <p class="text-muted mb-3">Join a club first to generate invite links.</p>
          <button class="btn-join" @click="activeTab = 'discover'">Discover Clubs</button>
        </div>
        <div v-else>
          <h5 class="fw-bold mb-4" style="color: var(--r-olive-deep)">Your Club Invite Links</h5>
          <div class="row g-3">
            <div class="col-12 col-md-6" v-for="club in myClubs" :key="'invite-' + club.id">
              <div class="invite-card">
                <div class="d-flex align-items-center gap-3 mb-3">
                  <div class="invite-avatar">{{ getInitial(club.name) }}</div>
                  <div>
                    <div class="fw-bold" style="color: #111827">{{ club.name }}</div>
                    <div class="small text-muted">{{ club.sport || 'General' }}</div>
                  </div>
                </div>
                <div class="invite-link-row">
                  <input
                    class="invite-link-input"
                    readonly
                    :value="`${appOrigin}/clubs/join/${club.id}`"
                  />
                  <button class="btn-copy" @click="copyLink(club.id)">
                    <i :class="copiedId === club.id ? 'bi bi-check-lg' : 'bi bi-clipboard'"></i>
                    {{ copiedId === club.id ? 'Copied!' : 'Copy' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta">
      <div class="container-xxl">
        <div class="cta-content">
          <h2 class="cta-title">Start your own club</h2>
          <p class="cta-text">Bring athletes together, create events, and build community.</p>
          <button class="btn-cta">Create a Club</button>
        </div>
      </div>
    </section>

    <!-- CHAT OVERLAY -->
    <transition name="fade">
      <div v-if="chatOpen" class="chat-overlay" @click="chatOpen = false"></div>
    </transition>

    <!-- CHAT DRAWER -->
    <transition name="slide-right">
      <div v-if="chatOpen" class="chat-drawer">
        <!-- Header -->
        <div class="chat-header">
          <div class="d-flex align-items-center gap-2 min-w-0">
            <div class="chat-club-avatar">{{ getInitial(chatClub?.name) }}</div>
            <div class="min-w-0">
              <div class="chat-club-name text-truncate">{{ chatClub?.name }}</div>
              <div class="chat-club-sub">{{ chatClub?.sport || 'General' }}</div>
            </div>
          </div>
          <button class="chat-close" @click="chatOpen = false">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <!-- Messages -->
        <div class="chat-messages" ref="messagesRef">
          <div v-if="messagesLoading" class="text-center py-4">
            <div class="spinner-border spinner-border-sm text-success" role="status"></div>
          </div>
          <div v-else-if="messages.length === 0" class="chat-empty">
            <i class="bi bi-chat-dots display-6 d-block mb-2"></i>
            No messages yet. Say hello!
          </div>
          <div v-else>
            <div
              class="chat-msg"
              v-for="msg in messages"
              :key="msg.id"
            >
              <router-link
                :to="`/profile/${msg.senderId || msg.userId}`"
                class="msg-avatar-link"
                @click="chatOpen = false"
              >
                <div class="msg-avatar">{{ getInitial(msg.senderName || msg.displayName) }}</div>
              </router-link>
              <div class="msg-content">
                <div class="msg-meta">
                  <router-link
                    :to="`/profile/${msg.senderId || msg.userId}`"
                    class="msg-name"
                    @click="chatOpen = false"
                  >
                    {{ msg.senderName || msg.displayName || 'Member' }}
                  </router-link>
                  <span class="msg-time">{{ formatTime(msg.createdAt || msg.timestamp) }}</span>
                </div>
                <div class="msg-text">{{ msg.text || msg.content }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Input -->
        <div class="chat-input-row">
          <input
            v-model="newMessage"
            class="chat-input"
            placeholder="Type a message…"
            @keydown.enter.prevent="sendMessage"
          />
          <button
            class="chat-send"
            :disabled="!newMessage.trim() || sendingMsg"
            @click="sendMessage"
          >
            <span v-if="sendingMsg" class="spinner-border spinner-border-sm"></span>
            <i v-else class="bi bi-send-fill"></i>
          </button>
        </div>
      </div>
    </transition>
  </main>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
const appOrigin = window.location.origin

const getAuthHeaders = () => ({
  Authorization: 'Bearer ' + localStorage.getItem('token')
})

// ── State ──────────────────────────────────────────────────────────────────
const activeTab = ref('discover')
const allClubs = ref([])
const myClubs = ref([])
const loading = ref(false)
const joiningId = ref(null)

const sports = ['Running', 'Cycling', 'Swimming', 'Hiking', 'Walking']
const q = ref('')
const sport = ref('All')
const sortBy = ref('popular')

// Chat drawer
const chatOpen = ref(false)
const chatClub = ref(null)
const messages = ref([])
const newMessage = ref('')
const sendingMsg = ref(false)
const messagesLoading = ref(false)
const messagesRef = ref(null)

// Invite tab
const copiedId = ref(null)

// ── Computed ───────────────────────────────────────────────────────────────
const filtered = computed(() => {
  let list = allClubs.value.slice()
  if (sport.value !== 'All') {
    list = list.filter(c => (c.sport || '').toLowerCase() === sport.value.toLowerCase())
  }
  if (q.value) {
    const t = q.value.toLowerCase()
    list = list.filter(c =>
      (c.name || '').toLowerCase().includes(t) ||
      (c.description || '').toLowerCase().includes(t)
    )
  }
  if (sortBy.value === 'popular') {
    list.sort((a, b) => (b.memberCount ?? b.members ?? 0) - (a.memberCount ?? a.members ?? 0))
  } else if (sortBy.value === 'new') {
    list.reverse()
  }
  return list
})

// ── API calls ──────────────────────────────────────────────────────────────
async function fetchClubs() {
  loading.value = true
  try {
    const res = await fetch(`${API_URL}/clubs`, { headers: getAuthHeaders() })
    if (res.ok) allClubs.value = await res.json()
  } catch (e) {
    console.error('fetchClubs error', e)
  } finally {
    loading.value = false
  }
}

async function fetchMyClubs() {
  try {
    const res = await fetch(`${API_URL}/clubs/my`, { headers: getAuthHeaders() })
    if (res.ok) myClubs.value = await res.json()
  } catch (e) {
    console.error('fetchMyClubs error', e)
  }
}

async function joinClub(id) {
  joiningId.value = id
  try {
    const res = await fetch(`${API_URL}/clubs/${id}/join`, {
      method: 'POST',
      headers: getAuthHeaders()
    })
    if (res.ok) {
      await fetchMyClubs()
      // bump member count locally so UI reflects immediately
      const club = allClubs.value.find(c => c.id === id)
      if (club) {
        const key = 'memberCount' in club ? 'memberCount' : 'members'
        club[key] = (club[key] ?? 0) + 1
      }
    }
  } catch (e) {
    console.error('joinClub error', e)
  } finally {
    joiningId.value = null
  }
}

async function leaveClub(id) {
  joiningId.value = id
  try {
    const res = await fetch(`${API_URL}/clubs/${id}/leave`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
    if (res.ok) {
      myClubs.value = myClubs.value.filter(c => c.id !== id)
      const club = allClubs.value.find(c => c.id === id)
      if (club) {
        const key = 'memberCount' in club ? 'memberCount' : 'members'
        club[key] = Math.max(0, (club[key] ?? 0) - 1)
      }
      if (chatClub.value?.id === id) chatOpen.value = false
    }
  } catch (e) {
    console.error('leaveClub error', e)
  } finally {
    joiningId.value = null
  }
}

// ── Chat ───────────────────────────────────────────────────────────────────
async function openChat(club) {
  chatClub.value = club
  chatOpen.value = true
  messages.value = []
  await loadMessages()
}

async function loadMessages() {
  if (!chatClub.value) return
  messagesLoading.value = true
  try {
    const res = await fetch(`${API_URL}/clubs/${chatClub.value.id}/messages`, {
      headers: getAuthHeaders()
    })
    if (res.ok) {
      messages.value = await res.json()
      scrollToBottom()
    }
  } catch (e) {
    console.error('loadMessages error', e)
  } finally {
    messagesLoading.value = false
  }
}

async function sendMessage() {
  if (!newMessage.value.trim() || sendingMsg.value) return
  sendingMsg.value = true
  const text = newMessage.value.trim()
  newMessage.value = ''
  try {
    const res = await fetch(`${API_URL}/clubs/${chatClub.value.id}/messages`, {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    })
    if (res.ok) {
      const msg = await res.json()
      messages.value.push(msg)
      scrollToBottom()
    } else {
      newMessage.value = text // restore on failure
    }
  } catch (e) {
    console.error('sendMessage error', e)
    newMessage.value = text
  } finally {
    sendingMsg.value = false
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesRef.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight
    }
  })
}

// ── Invite ─────────────────────────────────────────────────────────────────
function copyLink(id) {
  const url = `${appOrigin}/clubs/join/${id}`
  navigator.clipboard.writeText(url).then(() => {
    copiedId.value = id
    setTimeout(() => { copiedId.value = null }, 2000)
  })
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function isJoined(id) {
  return myClubs.value.some(c => c.id === id)
}

function formatK(n) {
  const num = Number(n) || 0
  if (num >= 1000) return (num / 1000).toFixed(num % 1000 === 0 ? 0 : 1) + 'k'
  return '' + num
}

function formatTime(d) {
  if (!d) return ''
  const diff = (Date.now() - new Date(d).getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago'
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago'
  return Math.floor(diff / 86400) + 'd ago'
}

function getInitial(name) {
  return (name || '?').charAt(0).toUpperCase()
}

onMounted(() => {
  fetchClubs()
  fetchMyClubs()
})
</script>

<style scoped>
/* ===== Design Tokens ===== */
.clubs-page {
  --r-olive: #5A6B4E;
  --r-olive-deep: #2C3726;
  --r-accent: #C46A2A;
  --r-offwhite: #F5F6F3;
  --r-white: #FFFFFF;

  font-family: Futura, "Avenir Next", system-ui, -apple-system, sans-serif;
  background: var(--r-offwhite);
  min-height: 100vh;
  padding-top: 72px;
}

/* ===== HERO ===== */
.hero {
  background: linear-gradient(135deg, var(--r-olive) 0%, var(--r-olive-deep) 100%);
  color: white;
  padding: 80px 0 60px;
}

.hero h1 {
  color: white;
  letter-spacing: -0.02em;
}

.hero .lead {
  color: rgba(255, 255, 255, 0.9);
  font-size: 18px;
  font-weight: 400;
  max-width: 700px;
}

/* ===== CONTROLS ===== */
.controls {
  background: white;
  padding: 24px 0;
  border-bottom: 1px solid #E5E7EB;
  position: sticky;
  top: 72px;
  z-index: 100;
}

/* ===== TAB BAR ===== */
.tab-bar {
  display: flex;
  gap: 4px;
  border-bottom: 2px solid #E5E7EB;
  padding-bottom: 0;
}

.tab-btn {
  position: relative;
  display: flex;
  align-items: center;
  padding: 10px 20px;
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  color: #6B7280;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: color 0.2s ease, border-color 0.2s ease;
}

.tab-btn:hover {
  color: var(--r-olive);
}

.tab-btn.active {
  color: var(--r-olive-deep);
  border-bottom-color: var(--r-accent);
}

.tab-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: var(--r-accent);
  color: white;
  border-radius: 50%;
  font-size: 11px;
  font-weight: 700;
  margin-left: 6px;
}

.filter-bar {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Sport Pills */
.sport-pills {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.sport-pill {
  padding: 8px 20px;
  border: 1px solid #E5E7EB;
  border-radius: 24px;
  background: white;
  color: #374151;
  font-family: inherit;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sport-pill:hover {
  background: #F9FAFB;
  border-color: #D1D5DB;
}

.sport-pill.active {
  background: var(--r-accent);
  border-color: var(--r-accent);
  color: white;
}

/* Search & Sort */
.search-sort {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-box i {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #9CA3AF;
  font-size: 16px;
}

.search-box .form-control {
  height: 44px;
  border: 1px solid #E5E7EB;
  border-radius: 10px;
  padding-left: 40px;
  font-family: inherit;
  font-size: 15px;
}

.search-box .form-control:focus {
  outline: none;
  border-color: var(--r-accent);
  box-shadow: 0 0 0 3px rgba(196, 106, 42, 0.1);
}

.sort-select {
  width: auto;
  min-width: 160px;
  height: 44px;
  border: 1px solid #E5E7EB;
  border-radius: 10px;
  font-family: inherit;
  font-size: 15px;
  font-weight: 500;
}

.sort-select:focus {
  border-color: var(--r-accent);
  box-shadow: 0 0 0 3px rgba(196, 106, 42, 0.1);
}

/* ===== CLUB CARDS ===== */
.list {
  padding: 40px 0 60px;
}

.club-card {
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  overflow: hidden;
  background: white;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.club-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
  border-color: #D1D5DB;
}

.club-card .thumb {
  position: relative;
  height: 180px;
  background: linear-gradient(135deg, var(--r-olive) 0%, var(--r-olive-deep) 100%) center/cover no-repeat;
}

.sport-tag {
  position: absolute;
  bottom: 12px;
  left: 12px;
  background: rgba(0, 0, 0, 0.55);
  color: white;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 4px 10px;
  border-radius: 20px;
  backdrop-filter: blur(4px);
}

.club-card .body {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.club-card .title {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
}

/* Buttons */
.btn-join {
  padding: 8px 18px;
  border: none;
  border-radius: 10px;
  background: var(--r-accent);
  color: white;
  font-family: inherit;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-join:hover:not(:disabled) {
  background: #a85722;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(196, 106, 42, 0.3);
}

.btn-join:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-leave {
  padding: 8px 14px;
  border: 1px solid #D1D5DB;
  border-radius: 10px;
  background: white;
  color: #6B7280;
  font-family: inherit;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-leave:hover:not(:disabled) {
  border-color: #EF4444;
  color: #EF4444;
  background: #FEF2F2;
}

.btn-leave:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Chat button on cards */
.chat-btn {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  border: none;
  border-radius: 10px;
  background: var(--r-olive);
  color: white;
  font-family: inherit;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.chat-btn:hover {
  background: var(--r-olive-deep);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(44, 55, 38, 0.3);
}

/* Empty state */
.empty {
  text-align: center;
  padding: 80px 24px;
  border: 2px dashed rgba(15, 18, 16, 0.15);
  border-radius: 20px;
  background: rgba(245, 246, 243, 0.4);
}

/* ===== INVITE CARDS ===== */
.invite-card {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  padding: 20px;
}

.invite-avatar {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--r-olive) 0%, var(--r-olive-deep) 100%);
  color: white;
  font-size: 18px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.invite-link-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.invite-link-input {
  flex: 1;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  color: #6B7280;
  background: #F9FAFB;
  min-width: 0;
  font-family: monospace;
}

.btn-copy {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 8px 14px;
  border: none;
  border-radius: 8px;
  background: var(--r-olive);
  color: white;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s;
}

.btn-copy:hover {
  background: var(--r-olive-deep);
}

/* ===== CTA SECTION ===== */
.cta {
  background: linear-gradient(135deg, var(--r-olive) 0%, var(--r-olive-deep) 100%);
  padding: 80px 0;
}

.cta-content {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}

.cta-title {
  font-size: 36px;
  font-weight: 700;
  color: white;
  margin-bottom: 16px;
  letter-spacing: -0.02em;
}

.cta-text {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 32px;
  line-height: 1.6;
}

.btn-cta {
  display: inline-block;
  padding: 14px 40px;
  background: var(--r-accent);
  color: white;
  text-decoration: none;
  border: none;
  border-radius: 10px;
  font-family: inherit;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cta:hover {
  background: #a85722;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

/* ===== CHAT DRAWER ===== */
.chat-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 1040;
}

.chat-drawer {
  position: fixed;
  top: 0;
  right: 0;
  width: 380px;
  height: 100vh;
  background: white;
  box-shadow: -4px 0 32px rgba(0, 0, 0, 0.18);
  z-index: 1050;
  display: flex;
  flex-direction: column;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #E5E7EB;
  flex-shrink: 0;
  gap: 12px;
}

.chat-club-avatar {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--r-olive) 0%, var(--r-olive-deep) 100%);
  color: white;
  font-size: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.chat-club-name {
  font-weight: 700;
  font-size: 15px;
  color: #111827;
}

.chat-club-sub {
  font-size: 12px;
  color: #9CA3AF;
}

.chat-close {
  width: 36px;
  height: 36px;
  border: none;
  background: #F3F4F6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  color: #6B7280;
  flex-shrink: 0;
  transition: background 0.15s;
}

.chat-close:hover {
  background: #E5E7EB;
  color: #111827;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chat-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #9CA3AF;
  font-size: 14px;
  text-align: center;
  padding: 40px 0;
}

.chat-msg {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.msg-avatar-link {
  flex-shrink: 0;
  text-decoration: none;
}

.msg-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--r-olive) 0%, var(--r-olive-deep) 100%);
  color: white;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.15s;
}

.msg-avatar-link:hover .msg-avatar {
  opacity: 0.8;
}

.msg-content {
  flex: 1;
  min-width: 0;
}

.msg-meta {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 2px;
}

.msg-name {
  font-size: 13px;
  font-weight: 700;
  color: var(--r-olive-deep);
  text-decoration: none;
}

.msg-name:hover {
  text-decoration: underline;
  color: var(--r-accent);
}

.msg-time {
  font-size: 11px;
  color: #9CA3AF;
}

.msg-text {
  font-size: 14px;
  color: #374151;
  line-height: 1.5;
  word-break: break-word;
}

.chat-input-row {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 12px 16px;
  border-top: 1px solid #E5E7EB;
  flex-shrink: 0;
}

.chat-input {
  flex: 1;
  border: 1px solid #E5E7EB;
  border-radius: 10px;
  padding: 10px 14px;
  font-family: inherit;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.chat-input:focus {
  border-color: var(--r-olive);
  box-shadow: 0 0 0 3px rgba(90, 107, 78, 0.12);
}

.chat-send {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 10px;
  background: var(--r-olive);
  color: white;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.2s;
}

.chat-send:hover:not(:disabled) {
  background: var(--r-olive-deep);
}

.chat-send:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

/* ===== TRANSITIONS ===== */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .hero {
    padding: 60px 0 40px;
  }

  .hero h1 {
    font-size: 32px;
  }

  .controls {
    position: static;
  }

  .search-sort {
    flex-direction: column;
  }

  .search-box {
    max-width: 100%;
  }

  .sort-select {
    width: 100%;
  }

  .sport-pills {
    overflow-x: auto;
    flex-wrap: nowrap;
    padding-bottom: 8px;
  }

  .cta-title {
    font-size: 28px;
  }

  .chat-drawer {
    width: 100vw;
  }

  .tab-btn {
    padding: 10px 14px;
    font-size: 13px;
  }
}
</style>
