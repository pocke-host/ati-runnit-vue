<template>
  <main class="coach-dash">
    <!-- Hero Bar -->
    <section class="hero-bar">
      <div class="hero-inner">
        <div class="hero-kicker">COACHING HUB</div>
        <h1 class="hero-name">{{ user?.displayName || 'Coach' }}</h1>
        <div class="hero-stats">
          <div class="hstat">
            <div class="hstat-val">{{ athletes.length }}</div>
            <div class="hstat-label">Athletes</div>
          </div>
          <div class="hstat-divider"></div>
          <div class="hstat">
            <div class="hstat-val">{{ pendingRequests.length }}</div>
            <div class="hstat-label">Pending</div>
          </div>
          <div class="hstat-divider"></div>
          <div class="hstat">
            <div class="hstat-val">{{ plansAssigned }}</div>
            <div class="hstat-label">Plans Assigned</div>
          </div>
        </div>
      </div>
    </section>

    <div class="content-wrap">
      <div v-if="actionError" class="action-error">
        <i class="bi bi-exclamation-circle-fill me-2"></i>{{ actionError }}
      </div>

      <!-- Pending Requests -->
      <section v-if="pendingRequests.length > 0" class="section">
        <div class="section-header">
          <h2 class="section-title">PENDING REQUESTS</h2>
          <span class="badge-count">{{ pendingRequests.length }}</span>
        </div>
        <div class="request-list">
          <div v-for="req in pendingRequests" :key="req.id" class="request-card">
            <div class="req-avatar">{{ (req.displayName || req.athleteName || '?')[0].toUpperCase() }}</div>
            <div class="req-info">
              <div class="req-name">{{ req.displayName || req.athleteName }}</div>
              <div class="req-meta">Sent {{ formatTime(req.createdAt) }}</div>
            </div>
            <div class="req-actions">
              <button class="btn-approve" @click="approve(req.id)" :disabled="actionLoading === req.id">
                <span v-if="actionLoading === req.id" class="spinner-border spinner-border-sm"></span>
                <span v-else>Approve</span>
              </button>
              <button class="btn-decline" @click="decline(req.id)">Decline</button>
            </div>
          </div>
        </div>
      </section>

      <!-- Coaching Rate -->
      <section class="section">
        <div class="section-header">
          <h2 class="section-title">COACHING RATE</h2>
        </div>
        <div class="rate-card">
          <div class="rate-current">
            <span v-if="user?.monthlyRate" class="rate-value">${{ user.monthlyRate }}<span class="rate-unit">/mo</span></span>
            <span v-else class="rate-unset">Not set — athletes can't hire you yet</span>
          </div>
          <div class="rate-form">
            <div class="rate-input-wrap">
              <span class="rate-prefix">$</span>
              <input
                v-model.number="rateInput"
                type="number"
                min="0"
                class="rate-input"
                placeholder="0"
                :disabled="savingRate"
              />
              <span class="rate-suffix">/mo</span>
            </div>
            <button
              class="btn-save-rate"
              @click="saveRate"
              :disabled="savingRate || rateInput === (user?.monthlyRate ?? null)"
            >
              <span v-if="savingRate" class="spinner-border spinner-border-sm"></span>
              <span v-else>Save</span>
            </button>
          </div>
          <div v-if="rateStatus" :class="['rate-status', rateStatusType]">{{ rateStatus }}</div>
        </div>
      </section>

      <!-- Athlete Roster -->
      <section class="section">
        <div class="section-header">
          <h2 class="section-title">ATHLETES</h2>
          <div class="section-links">
            <router-link to="/coach/library" class="section-link">Library →</router-link>
            <router-link to="/coach/athletes" class="section-link">View all →</router-link>
          </div>
        </div>

        <div v-if="loading" class="empty-state">
          <div class="spinner-border spinner-border-sm me-2"></div> Loading...
        </div>

        <div v-else-if="athletes.length === 0" class="empty-state">
          <i class="bi bi-people empty-icon"></i>
          <p>No athletes yet. Share your profile so athletes can find you.</p>
          <router-link to="/coaches" class="btn-cta-sm">View your listing →</router-link>
        </div>

        <div v-else class="athlete-grid">
          <div v-for="athlete in athletes" :key="athlete.id" class="athlete-card">
            <div class="ath-avatar">{{ (athlete.displayName || '?')[0].toUpperCase() }}</div>
            <div class="ath-info">
              <div class="ath-name-row">
                <div class="ath-name">{{ athlete.displayName }}</div>
                <span
                  v-if="athleteCompliance[athlete.id] != null"
                  class="ath-compliance-badge"
                  :class="complianceClass(athleteCompliance[athlete.id])"
                >{{ athleteCompliance[athlete.id] }}%</span>
              </div>
              <div class="ath-plan">{{ athlete.activePlan?.name || 'No active plan' }}</div>
              <div v-if="athlete.activePlan" class="ath-progress-wrap">
                <div class="ath-progress-bar">
                  <div class="ath-progress-fill" :style="{ width: (athlete.activePlan.progress || 0) + '%' }"></div>
                </div>
                <span class="ath-progress-pct">{{ athlete.activePlan.progress || 0 }}%</span>
              </div>
            </div>
            <router-link :to="`/coach/athletes/${athlete.id}`" class="ath-link">View →</router-link>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useCoachStore } from '@/stores/coach'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const authStore = useAuthStore()
const coachStore = useCoachStore()
const { user } = storeToRefs(authStore)
const { athletes, pendingRequests, loading } = storeToRefs(coachStore)

const actionLoading = ref(null)
const actionError = ref('')

// Coaching rate
const rateInput = ref(user.value?.monthlyRate ?? null)
const savingRate = ref(false)
const rateStatus = ref('')
const rateStatusType = ref('success')

const saveRate = async () => {
  savingRate.value = true
  rateStatus.value = ''
  try {
    const token = localStorage.getItem('token')
    const res = await fetch(`${API}/users/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ monthlyRate: rateInput.value }),
    })
    if (!res.ok) throw new Error('Failed to save rate')
    const updated = await res.json()
    // Sync back into auth store so reactivity picks it up
    if (authStore.user) authStore.user.monthlyRate = updated.monthlyRate ?? rateInput.value
    rateStatus.value = 'Rate saved!'
    rateStatusType.value = 'success'
  } catch {
    rateStatus.value = 'Failed to save. Please try again.'
    rateStatusType.value = 'error'
  } finally {
    savingRate.value = false
  }
}
// keyed by athlete.id → compliance % (0–100), null if not yet loaded
const athleteCompliance = ref({})

const plansAssigned = computed(() =>
  athletes.value.filter(a => a.activePlan).length
)

function complianceClass(pct) {
  if (pct >= 80) return 'compliance-good'
  if (pct >= 50) return 'compliance-mid'
  return 'compliance-low'
}

const formatTime = (d) => {
  if (!d) return ''
  const diff = Date.now() - new Date(d)
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

const approve = async (reqId) => {
  actionLoading.value = reqId
  actionError.value = ''
  try {
    await coachStore.approveRequest(reqId)
  } catch {
    actionError.value = 'Failed to approve request. Please try again.'
  } finally {
    actionLoading.value = null
  }
}

const decline = async (reqId) => {
  actionError.value = ''
  try {
    await coachStore.rejectRequest(reqId)
  } catch {
    actionError.value = 'Failed to decline request. Please try again.'
  }
}

onMounted(async () => {
  await Promise.all([coachStore.fetchAthletes(), coachStore.fetchRequests()])
  // Load compliance for each athlete in parallel (non-blocking)
  athletes.value.forEach(async (athlete) => {
    const weeks = await coachStore.fetchAthleteCompliance(athlete.id, 4)
    if (weeks.length) {
      const total = weeks.reduce((s, w) => s + (w.planned || 0), 0)
      const done = weeks.reduce((s, w) => s + (w.completed || 0), 0)
      athleteCompliance.value[athlete.id] = total > 0 ? Math.round((done / total) * 100) : null
    }
  })
})
</script>

<style scoped>
.coach-dash {
  min-height: 100vh;
  background: #fff;
  padding-top: var(--nav-h, 64px);
  font-family: "Futura PT", Futura, "Century Gothic", system-ui, sans-serif;
}

/* Hero */
.hero-bar {
  background: #000;
  color: #fff;
  padding: 48px 24px 40px;
}
.hero-inner { max-width: 1100px; margin: 0 auto; }
.hero-kicker {
  font-size: 0.7rem;
  letter-spacing: 0.20em;
  font-weight: 700;
  color: rgba(255,255,255,0.5);
  text-transform: uppercase;
  margin-bottom: 8px;
}
.hero-name {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 900;
  letter-spacing: -0.02em;
  margin: 0 0 32px;
}
.hero-stats {
  display: flex;
  align-items: center;
  gap: 32px;
}
.hstat-val { font-size: 2rem; font-weight: 800; line-height: 1; }
.hstat-label { font-size: 0.7rem; letter-spacing: 0.10em; text-transform: uppercase; color: rgba(255,255,255,0.5); margin-top: 4px; }
.hstat-divider { width: 1px; height: 36px; background: rgba(255,255,255,0.15); }

/* Content */
.content-wrap { max-width: 1100px; margin: 0 auto; padding: 40px 24px; display: flex; flex-direction: column; gap: 48px; }
.action-error { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.20); color: #dc2626; font-size: 0.88rem; font-weight: 600; padding: 12px 16px; display: flex; align-items: center; margin-bottom: -32px; }

.section {}
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  border-bottom: 1px solid #E5E5E5;
  padding-bottom: 12px;
}
.section-title { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.14em; color: #767676; margin: 0; }
.section-links { display: flex; gap: 14px; align-items: center; }
.section-link { font-size: 0.82rem; font-weight: 600; color: #000; text-decoration: none; }
.section-link:hover { text-decoration: underline; }
.badge-count {
  background: #000;
  color: #fff;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 0;
  letter-spacing: 0.05em;
}

/* Request cards */
.request-list { display: flex; flex-direction: column; gap: 10px; }
.request-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  border: 1px solid #E5E5E5;
}
.req-avatar {
  width: 40px; height: 40px;
  background: #000; color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 1rem; flex-shrink: 0;
}
.req-info { flex: 1; min-width: 0; }
.req-name { font-weight: 600; font-size: 0.9rem; }
.req-meta { font-size: 0.75rem; color: #767676; margin-top: 2px; }
.req-actions { display: flex; gap: 8px; }
.btn-approve {
  padding: 8px 16px;
  background: #0052FF; color: #fff; border: none;
  font-size: 0.78rem; font-weight: 700; letter-spacing: 0.06em;
  text-transform: uppercase; cursor: pointer;
}
.btn-approve:hover { background: #003ECC; }
.btn-approve:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-decline {
  padding: 8px 16px;
  background: #fff; color: #000; border: 1px solid #E5E5E5;
  font-size: 0.78rem; font-weight: 600; cursor: pointer;
}
.btn-decline:hover { border-color: #000; }

/* Athlete grid */
.athlete-grid { display: flex; flex-direction: column; gap: 10px; }
.athlete-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  border: 1px solid #E5E5E5;
}
.ath-avatar {
  width: 44px; height: 44px;
  background: #f0f0f0; color: #000;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 1.1rem; flex-shrink: 0;
}
.ath-info { flex: 1; min-width: 0; }
.ath-name-row { display: flex; align-items: center; gap: 8px; }
.ath-name { font-weight: 700; font-size: 0.9rem; }
.ath-compliance-badge {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 2px 7px;
  letter-spacing: 0.04em;
  flex-shrink: 0;
}
.compliance-good { background: rgba(22,163,74,0.12); color: #16a34a; }
.compliance-mid  { background: rgba(245,158,11,0.12); color: #b45309; }
.compliance-low  { background: rgba(239,68,68,0.12);  color: #dc2626; }
.ath-plan { font-size: 0.78rem; color: #767676; margin-top: 2px; }
.ath-progress-wrap { display: flex; align-items: center; gap: 8px; margin-top: 8px; }
.ath-progress-bar { flex: 1; height: 2px; background: #E5E5E5; }
.ath-progress-fill { height: 100%; background: #000; }
.ath-progress-pct { font-size: 0.7rem; font-weight: 700; color: #767676; }
.ath-link { font-size: 0.82rem; font-weight: 600; color: #000; text-decoration: none; flex-shrink: 0; }
.ath-link:hover { text-decoration: underline; }

/* Coaching Rate card */
.rate-card {
  border: 1px solid #E5E5E5;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.rate-current { display: flex; align-items: baseline; gap: 6px; }
.rate-value { font-size: 1.6rem; font-weight: 800; color: #0052FF; line-height: 1; }
.rate-unit { font-size: 0.85rem; font-weight: 600; color: #767676; }
.rate-unset { font-size: 0.88rem; color: #767676; font-style: italic; }
.rate-form { display: flex; align-items: center; gap: 10px; }
.rate-input-wrap {
  display: flex;
  align-items: center;
  border: 1px solid #E5E5E5;
  overflow: hidden;
}
.rate-prefix, .rate-suffix {
  padding: 0 10px;
  font-size: 0.88rem;
  font-weight: 600;
  color: #767676;
  background: #F5F5F5;
  height: 38px;
  display: flex;
  align-items: center;
}
.rate-input {
  border: none;
  outline: none;
  padding: 0 10px;
  height: 38px;
  width: 90px;
  font-size: 0.95rem;
  font-weight: 700;
  font-family: inherit;
  background: #fff;
  -moz-appearance: textfield;
}
.rate-input::-webkit-outer-spin-button,
.rate-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.btn-save-rate {
  padding: 0 20px;
  height: 38px;
  background: #0052FF;
  color: #fff;
  border: none;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  flex-shrink: 0;
}
.btn-save-rate:hover { background: #003ECC; }
.btn-save-rate:disabled { opacity: 0.5; cursor: not-allowed; }
.rate-status { font-size: 0.8rem; font-weight: 600; }
.rate-status.success { color: #16a34a; }
.rate-status.error { color: #dc2626; }

/* Empty */
.empty-state { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 48px 24px; color: #767676; text-align: center; }
.empty-icon { font-size: 2.5rem; }
.empty-state p { font-size: 0.9rem; margin: 0; }
.btn-cta-sm {
  padding: 10px 20px;
  background: #000; color: #fff; border: none;
  font-size: 0.78rem; font-weight: 700; letter-spacing: 0.06em;
  text-transform: uppercase; text-decoration: none;
  cursor: pointer;
}

.spinner-border { width: 1rem; height: 1rem; border: 2px solid rgba(0,0,0,0.10); border-top-color: #000; border-radius: 50%; animation: spin 0.75s linear infinite; display: inline-block; }
.spinner-border-sm { width: 0.85rem; height: 0.85rem; }
.me-2 { margin-right: 8px; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 600px) {
  .hero-bar { padding: 28px 16px 24px; }
  .hero-name { font-size: clamp(1.8rem, 7vw, 2.8rem); }
  .hero-stats { gap: 16px; flex-wrap: wrap; }
  .content-wrap { padding: 20px 16px; gap: 28px; }
  .request-card { flex-wrap: wrap; gap: 10px; padding: 12px; }
  .req-actions { width: 100%; display: flex; gap: 8px; }
  .btn-approve, .btn-decline { flex: 1; text-align: center; }
  .athlete-card { flex-wrap: wrap; gap: 10px; padding: 12px; }
  .ath-info { flex: 0 0 calc(100% - 60px); }
  .section-links { gap: 8px; }
}
</style>
