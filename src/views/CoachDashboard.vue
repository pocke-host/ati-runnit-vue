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

      <!-- Athlete Roster -->
      <section class="section">
        <div class="section-header">
          <h2 class="section-title">ATHLETES</h2>
          <router-link to="/coach/athletes" class="section-link">View all →</router-link>
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
              <div class="ath-name">{{ athlete.displayName }}</div>
              <div class="ath-plan">{{ athlete.activePlan?.name || 'No active plan' }}</div>
              <div v-if="athlete.activePlan" class="ath-progress-wrap">
                <div class="ath-progress-bar">
                  <div class="ath-progress-fill" :style="{ width: (athlete.activePlan.progress || 0) + '%' }"></div>
                </div>
                <span class="ath-progress-pct">{{ athlete.activePlan.progress || 0 }}%</span>
              </div>
            </div>
            <router-link to="/coach/athletes" class="ath-link">View →</router-link>
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

const authStore = useAuthStore()
const coachStore = useCoachStore()
const { user } = storeToRefs(authStore)
const { athletes, pendingRequests, loading } = storeToRefs(coachStore)

const actionLoading = ref(null)

const plansAssigned = computed(() =>
  athletes.value.filter(a => a.activePlan).length
)

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
  try { await coachStore.approveRequest(reqId) } catch {}
  actionLoading.value = null
}

const decline = async (reqId) => {
  try { await coachStore.rejectRequest(reqId) } catch {}
}

onMounted(async () => {
  await Promise.all([coachStore.fetchAthletes(), coachStore.fetchRequests()])
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
.ath-name { font-weight: 700; font-size: 0.9rem; }
.ath-plan { font-size: 0.78rem; color: #767676; margin-top: 2px; }
.ath-progress-wrap { display: flex; align-items: center; gap: 8px; margin-top: 8px; }
.ath-progress-bar { flex: 1; height: 2px; background: #E5E5E5; }
.ath-progress-fill { height: 100%; background: #000; }
.ath-progress-pct { font-size: 0.7rem; font-weight: 700; color: #767676; }
.ath-link { font-size: 0.82rem; font-weight: 600; color: #000; text-decoration: none; flex-shrink: 0; }
.ath-link:hover { text-decoration: underline; }

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
</style>
