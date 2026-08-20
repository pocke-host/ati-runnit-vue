<template>
  <div class="ff-page">
    <div class="ff-wrap">

      <!-- Header -->
      <div class="ff-header">
        <button class="btn-back" @click="$router.back()">←</button>
        <div>
          <div class="ff-kicker">Crews</div>
          <h1 class="ff-title">Find Friends</h1>
        </div>
      </div>

      <!-- Invite card -->
      <div class="ff-card">
        <div class="ff-card-label">INVITE YOUR CREW</div>
        <p class="ff-card-body">Send this link to anyone not on Runnit yet — they'll land on a page to follow you the second they sign up.</p>

        <div class="ff-invite-row">
          <div class="ff-invite-link-wrap">
            <input class="ff-invite-input" :value="inviteUrl || 'Loading…'" readonly @click="$event.target.select()" />
            <button class="ff-copy-btn" @click="copyInviteLink" :disabled="!inviteUrl">
              {{ copied ? 'Copied' : 'Copy' }}
            </button>
          </div>
          <button v-if="canShare" class="btn-pill-secondary" @click="shareInviteLink" :disabled="!inviteUrl">
            <i class="bi bi-share"></i> Share
          </button>
        </div>

        <div class="ff-qr-toggle">
          <button class="ff-qr-btn" @click="showQr = !showQr" :disabled="!inviteUrl">
            {{ showQr ? 'Hide QR code' : 'Show QR code' }}
          </button>
        </div>
        <div v-if="showQr" class="ff-qr-wrap">
          <img v-if="qrDataUrl" :src="qrDataUrl" alt="QR code for your Runnit invite link" class="ff-qr-img" />
          <div v-else class="ff-qr-loading">Generating…</div>
        </div>
      </div>

      <!-- Contacts import card -->
      <div class="ff-card">
        <div class="ff-card-label">IMPORT FROM CONTACTS</div>
        <p class="ff-card-body">Find people you already know. We only check email addresses against existing Runnit accounts — nothing is stored from your contacts.</p>

        <button v-if="contactPickerSupported" class="btn-pill-primary" @click="importFromContacts" :disabled="contactsLoading">
          <span v-if="contactsLoading" class="spinner-border spinner-border-sm me-2"></span>
          <i v-else class="bi bi-person-lines-fill me-2"></i>
          {{ contactsLoading ? 'Matching…' : 'Import Contacts' }}
        </button>

        <div v-else class="ff-manual-contacts">
          <p class="ff-manual-hint">Contact import isn't available in this browser — paste emails instead (one per line, or comma-separated).</p>
          <textarea v-model="manualEmails" class="ff-textarea" rows="3" placeholder="friend1@email.com, friend2@email.com"></textarea>
          <button class="btn-pill-primary" @click="importManualEmails" :disabled="contactsLoading || !manualEmails.trim()">
            <span v-if="contactsLoading" class="spinner-border spinner-border-sm me-2"></span>
            {{ contactsLoading ? 'Matching…' : 'Find Matches' }}
          </button>
        </div>

        <div v-if="contactsSearched" class="ff-user-list">
          <div v-if="contactMatches.length" class="ff-user-cards">
            <div v-for="u in contactMatches" :key="u.id" class="ff-user-card">
              <div class="ff-avatar">{{ (u.displayName || 'U').charAt(0).toUpperCase() }}</div>
              <div class="ff-user-info">
                <div class="ff-user-name">{{ u.displayName || 'User' }}</div>
              </div>
              <button v-if="!u.isFollowing" class="btn-pill-sm-primary" @click="follow(u)" :disabled="followBusy">Follow</button>
              <button v-else class="btn-pill-sm-outline" @click="unfollow(u)" :disabled="followBusy">Following</button>
            </div>
          </div>
          <p v-else class="ff-empty">None of your contacts are on Runnit yet — invite them with the link above.</p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="ff-tabs">
        <button :class="['ff-tab', { 'ff-tab--on': tab === 'suggested' }]" @click="tab = 'suggested'">Suggested</button>
        <button :class="['ff-tab', { 'ff-tab--on': tab === 'search' }]" @click="tab = 'search'">Search</button>
        <button :class="['ff-tab', { 'ff-tab--on': tab === 'following' }]" @click="tab = 'following'">Following ({{ followingList.length }})</button>
        <button :class="['ff-tab', { 'ff-tab--on': tab === 'followers' }]" @click="tab = 'followers'">Followers ({{ followersList.length }})</button>
      </div>

      <!-- Suggested -->
      <div v-if="tab === 'suggested'" class="ff-user-list">
        <div v-if="suggestionsLoading" class="ff-loading">Loading…</div>
        <div v-else-if="suggestions.length" class="ff-user-cards">
          <div v-for="u in suggestions" :key="u.id" class="ff-user-card">
            <div class="ff-avatar">{{ (u.displayName || 'U').charAt(0).toUpperCase() }}</div>
            <div class="ff-user-info">
              <div class="ff-user-name">{{ u.displayName || 'User' }}</div>
              <div class="ff-user-meta">{{ u.location || u.sport || '' }}</div>
            </div>
            <button v-if="!u.isFollowing" class="btn-pill-sm-primary" @click="follow(u)" :disabled="followBusy">Follow</button>
            <button v-else class="btn-pill-sm-outline" @click="unfollow(u)" :disabled="followBusy">Following</button>
          </div>
        </div>
        <p v-else class="ff-empty">No suggestions yet — set your city in your profile to see athletes near you.</p>
      </div>

      <!-- Search -->
      <div v-if="tab === 'search'" class="ff-user-list">
        <input
          v-model="searchQuery"
          class="ff-search-input"
          type="text"
          placeholder="Search by name or email…"
          @input="onSearchInput"
        />
        <div v-if="searchLoading" class="ff-loading">Searching…</div>
        <div v-else-if="searchResults.length" class="ff-user-cards">
          <div v-for="u in searchResults" :key="u.id" class="ff-user-card">
            <div class="ff-avatar">{{ (u.displayName || 'U').charAt(0).toUpperCase() }}</div>
            <div class="ff-user-info">
              <div class="ff-user-name">{{ u.displayName || 'User' }}</div>
              <div class="ff-user-meta">{{ u.bio || '' }}</div>
            </div>
            <button v-if="!u.isFollowing" class="btn-pill-sm-primary" @click="follow(u)" :disabled="followBusy">Follow</button>
            <button v-else class="btn-pill-sm-outline" @click="unfollow(u)" :disabled="followBusy">Following</button>
          </div>
        </div>
        <p v-else-if="searchQuery" class="ff-empty">No matches.</p>
        <p v-else class="ff-empty">Search for friends by name or email.</p>
      </div>

      <!-- Following -->
      <div v-if="tab === 'following'" class="ff-user-list">
        <div v-if="followLoadingList" class="ff-loading">Loading…</div>
        <div v-else-if="followingList.length" class="ff-user-cards">
          <div v-for="u in followingList" :key="u.id" class="ff-user-card">
            <div class="ff-avatar">{{ (u.displayName || 'U').charAt(0).toUpperCase() }}</div>
            <div class="ff-user-info">
              <div class="ff-user-name">{{ u.displayName || 'User' }}</div>
              <div class="ff-user-meta">{{ u.followerCount || 0 }} followers</div>
            </div>
            <button class="btn-pill-sm-outline" @click="unfollow(u)" :disabled="followBusy">Unfollow</button>
          </div>
        </div>
        <p v-else class="ff-empty">You're not following anyone yet.</p>
      </div>

      <!-- Followers -->
      <div v-if="tab === 'followers'" class="ff-user-list">
        <div v-if="followLoadingList" class="ff-loading">Loading…</div>
        <div v-else-if="followersList.length" class="ff-user-cards">
          <div v-for="u in followersList" :key="u.id" class="ff-user-card">
            <div class="ff-avatar">{{ (u.displayName || 'U').charAt(0).toUpperCase() }}</div>
            <div class="ff-user-info">
              <div class="ff-user-name">{{ u.displayName || 'User' }}</div>
              <div class="ff-user-meta">{{ u.followingCount || 0 }} following</div>
            </div>
            <button v-if="!u.isFollowing" class="btn-pill-sm-primary" @click="follow(u)" :disabled="followBusy">Follow Back</button>
            <button v-else class="btn-pill-sm-outline" @click="unfollow(u)" :disabled="followBusy">Following</button>
          </div>
        </div>
        <p v-else class="ff-empty">No followers yet.</p>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useHead } from '@unhead/vue'
import axios from 'axios'
import QRCode from 'qrcode'
import { useToast } from '@/composables/useToast'

useHead({
  title: 'Find Friends — Runnit',
  meta: [{ name: 'description', content: 'Find and invite athletes to train with on Runnit.' }],
})

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
const { showToast } = useToast()

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// ── Invite link + QR ────────────────────────────────────────────────────────
const inviteUrl = ref('')
const copied = ref(false)
const showQr = ref(false)
const qrDataUrl = ref('')
const canShare = computed(() => typeof navigator !== 'undefined' && !!navigator.share)

async function loadInviteLink() {
  try {
    const { data } = await axios.get(`${API}/invite-link`, { headers: getAuthHeaders() })
    inviteUrl.value = data.url
    qrDataUrl.value = await QRCode.toDataURL(data.url, { width: 240, margin: 1, color: { dark: '#16130F', light: '#FBF6EC' } })
  } catch {
    showToast("Couldn't load your invite link.", 'error')
  }
}

async function copyInviteLink() {
  if (!inviteUrl.value) return
  try {
    await navigator.clipboard.writeText(inviteUrl.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    showToast("Couldn't copy — long-press the link to copy it manually.", 'error')
  }
}

async function shareInviteLink() {
  if (!inviteUrl.value) return
  try {
    await navigator.share({ title: 'Join me on Runnit', text: 'Train with me on Runnit.', url: inviteUrl.value })
  } catch {
    // user cancelled the share sheet — no error needed
  }
}

// ── Contacts import ──────────────────────────────────────────────────────────
const contactPickerSupported = typeof navigator !== 'undefined' && 'contacts' in navigator && 'ContactsManager' in window
const contactsLoading = ref(false)
const contactsSearched = ref(false)
const contactMatches = ref([])
const manualEmails = ref('')

async function importFromContacts() {
  try {
    const contacts = await navigator.contacts.select(['name', 'email'], { multiple: true })
    const emails = contacts.flatMap(c => c.email || [])
    if (!emails.length) {
      showToast('No email addresses found in the selected contacts.', 'info')
      return
    }
    await matchContacts(emails)
  } catch {
    // user cancelled the native picker — no error needed
  }
}

function importManualEmails() {
  const emails = manualEmails.value.split(/[\s,]+/).map(e => e.trim()).filter(Boolean)
  if (!emails.length) return
  matchContacts(emails)
}

async function matchContacts(emails) {
  contactsLoading.value = true
  try {
    const { data } = await axios.post(`${API}/users/match-contacts`, { emails }, { headers: getAuthHeaders() })
    contactMatches.value = data
    contactsSearched.value = true
  } catch {
    showToast("Couldn't match contacts — try again.", 'error')
  } finally {
    contactsLoading.value = false
  }
}

// ── Suggested / Search / Following / Followers ─────────────────────────────
const tab = ref('suggested')

const suggestions = ref([])
const suggestionsLoading = ref(false)
async function loadSuggestions() {
  suggestionsLoading.value = true
  try {
    const { data } = await axios.get(`${API}/follow/suggestions`, { headers: getAuthHeaders() })
    suggestions.value = data
  } catch {
    suggestions.value = []
  } finally {
    suggestionsLoading.value = false
  }
}

const searchQuery = ref('')
const searchResults = ref([])
const searchLoading = ref(false)
let searchTimer = null
function onSearchInput() {
  clearTimeout(searchTimer)
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }
  searchTimer = setTimeout(async () => {
    searchLoading.value = true
    try {
      const { data } = await axios.get(`${API}/users/search`, {
        params: { query: searchQuery.value },
        headers: getAuthHeaders(),
      })
      searchResults.value = data
    } catch {
      searchResults.value = []
    } finally {
      searchLoading.value = false
    }
  }, 300)
}

const followingList = ref([])
const followersList = ref([])
const followLoadingList = ref(false)
async function loadFollowData() {
  followLoadingList.value = true
  try {
    const [followingRes, followersRes] = await Promise.all([
      axios.get(`${API}/follow/following`, { headers: getAuthHeaders() }),
      axios.get(`${API}/follow/followers`, { headers: getAuthHeaders() }),
    ])
    followingList.value = followingRes.data
    followersList.value = followersRes.data
  } catch {
    // non-critical, silent fail
  } finally {
    followLoadingList.value = false
  }
}

// ── Follow / unfollow (shared across every list on this page) ──────────────
const followBusy = ref(false)

function markFollowing(userId, value) {
  for (const list of [suggestions.value, searchResults.value, contactMatches.value, followersList.value]) {
    const match = list.find(u => u.id === userId)
    if (match) match.isFollowing = value
  }
}

async function follow(u) {
  followBusy.value = true
  try {
    await axios.post(`${API}/follow/${u.id}`, {}, { headers: getAuthHeaders() })
    markFollowing(u.id, true)
    await loadFollowData()
  } catch {
    showToast("Follow didn't land — try again.", 'error')
  } finally {
    followBusy.value = false
  }
}

async function unfollow(u) {
  followBusy.value = true
  try {
    await axios.delete(`${API}/follow/${u.id}`, { headers: getAuthHeaders() })
    markFollowing(u.id, false)
    followingList.value = followingList.value.filter(f => f.id !== u.id)
  } catch {
    showToast("Unfollow didn't land — try again.", 'error')
  } finally {
    followBusy.value = false
  }
}

onMounted(() => {
  loadInviteLink()
  loadSuggestions()
  loadFollowData()
})
</script>

<style scoped>
.ff-page {
  min-height: 100vh;
  background: #FBF6EC;
  padding-top: var(--nav-h, 66px);
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
  color: #16130F;
}

.ff-wrap {
  max-width: 680px;
  margin: 0 auto;
  padding: 40px 24px 80px;
}

.ff-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
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
  flex-shrink: 0;
}
.btn-back:hover { background: rgba(22,19,15,0.06); }

.ff-kicker {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #2A55F5;
  margin-bottom: 4px;
}

.ff-title {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-weight: 900;
  font-size: clamp(1.8rem, 6vw, 2.6rem);
  line-height: 0.85;
  text-transform: uppercase;
  margin: 0;
}

.ff-card {
  border: 2px solid #16130F;
  background: #fff;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 4px 4px 0 #16130F;
}

.ff-card-label {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #2A55F5;
  margin-bottom: 10px;
}

.ff-card-body {
  color: #5A5348;
  font-size: 0.88rem;
  line-height: 1.55;
  margin: 0 0 18px;
}

.ff-invite-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.ff-invite-link-wrap {
  flex: 1;
  min-width: 200px;
  display: flex;
  border: 2px solid #16130F;
}

.ff-invite-input {
  flex: 1;
  min-width: 0;
  border: none;
  padding: 12px 14px;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.8rem;
  color: #16130F;
  background: #FBF6EC;
  outline: none;
}

.ff-copy-btn {
  border: none;
  border-left: 2px solid #16130F;
  background: #2A55F5;
  color: #fff;
  padding: 0 18px;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  cursor: pointer;
}
.ff-copy-btn:hover:not(:disabled) { background: #1E42D6; }
.ff-copy-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.ff-qr-toggle { margin-top: 14px; }

.ff-qr-btn {
  background: none;
  border: none;
  color: #2A55F5;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  padding: 0;
}
.ff-qr-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.ff-qr-wrap {
  margin-top: 16px;
  display: flex;
  justify-content: center;
  padding: 16px;
  border: 2px solid #E7DFCE;
}

.ff-qr-img { width: 200px; height: 200px; }
.ff-qr-loading { font-size: 0.85rem; color: #8A8A8A; }

.ff-manual-contacts { display: flex; flex-direction: column; gap: 10px; }

.ff-manual-hint {
  font-size: 0.82rem;
  color: #8A8A8A;
  margin: 0;
}

.ff-textarea {
  border: 2px solid #16130F;
  padding: 12px 14px;
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
  font-size: 0.9rem;
  color: #16130F;
  resize: vertical;
  outline: none;
}
.ff-textarea:focus { border-color: #2A55F5; }

.btn-pill-primary, .btn-pill-secondary {
  border: 2px solid #16130F;
  border-radius: 999px;
  padding: 10px 22px;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
}
.btn-pill-primary {
  background: #2A55F5;
  color: #fff;
  box-shadow: 3px 3px 0 #16130F;
}
.btn-pill-primary:hover:not(:disabled) { background: #1E42D6; }
.btn-pill-primary:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }

.btn-pill-secondary {
  background: #fff;
  color: #16130F;
}
.btn-pill-secondary:hover:not(:disabled) { background: rgba(22,19,15,0.06); }
.btn-pill-secondary:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-pill-sm-primary, .btn-pill-sm-outline {
  border: 2px solid #16130F;
  border-radius: 999px;
  padding: 6px 16px;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.66rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  cursor: pointer;
  flex-shrink: 0;
}
.btn-pill-sm-primary {
  background: #2A55F5;
  color: #fff;
}
.btn-pill-sm-primary:hover:not(:disabled) { background: #1E42D6; }
.btn-pill-sm-outline {
  background: #fff;
  color: #16130F;
}
.btn-pill-sm-outline:hover:not(:disabled) { background: rgba(22,19,15,0.06); }
.btn-pill-sm-primary:disabled, .btn-pill-sm-outline:disabled { opacity: 0.5; cursor: not-allowed; }

.ff-tabs {
  display: flex;
  border: 2px solid #16130F;
  margin-bottom: 20px;
  overflow-x: auto;
}

.ff-tab {
  flex: 1;
  background: #fff;
  border: none;
  border-right: 2px solid #16130F;
  padding: 12px 10px;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.66rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #5A5348;
  cursor: pointer;
  white-space: nowrap;
}
.ff-tab:last-child { border-right: none; }
.ff-tab--on { background: #16130F; color: #FBF6EC; }

.ff-user-list { margin-bottom: 20px; }

.ff-search-input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #16130F;
  font-size: 0.95rem;
  color: #16130F;
  background: #fff;
  outline: none;
  margin-bottom: 16px;
}
.ff-search-input:focus { border-color: #2A55F5; }

.ff-loading, .ff-empty {
  color: #8A8A8A;
  font-size: 0.88rem;
  padding: 20px 4px;
  text-align: center;
}

.ff-user-cards {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ff-user-card {
  display: flex;
  align-items: center;
  gap: 12px;
  border: 2px solid #E7DFCE;
  background: #fff;
  padding: 12px 14px;
}

.ff-avatar {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  border: 2px solid #16130F;
  background: #EEF1FF;
  color: #2A55F5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  flex-shrink: 0;
}

.ff-user-info { flex: 1; min-width: 0; }

.ff-user-name {
  font-weight: 700;
  font-size: 0.92rem;
  color: #16130F;
}

.ff-user-meta {
  font-size: 0.78rem;
  color: #8A8A8A;
}

@media (max-width: 640px) {
  .ff-wrap { padding: 28px 18px 80px; }
}
</style>
