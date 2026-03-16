<template>
  <main class="coach-athletes">
    <div class="page-header">
      <div class="header-inner">
        <div class="header-kicker">COACHING HUB</div>
        <div class="header-row">
          <h1 class="header-title">ATHLETES</h1>
          <span class="header-count">{{ athletes.length }} athlete{{ athletes.length !== 1 ? 's' : '' }}</span>
        </div>
        <!-- Tabs -->
        <div class="tab-bar">
          <button :class="['tab', { active: tab === 'roster' }]" @click="tab = 'roster'">Roster</button>
          <button :class="['tab', { active: tab === 'requests' }]" @click="tab = 'requests'">
            Requests
            <span v-if="pendingRequests.length > 0" class="tab-badge">{{ pendingRequests.length }}</span>
          </button>
        </div>
      </div>
    </div>

    <div class="content-wrap">
      <!-- Pending Requests Tab -->
      <template v-if="tab === 'requests'">
        <div v-if="pendingRequests.length === 0" class="empty-state">
          <i class="bi bi-person-check empty-icon"></i>
          <p>No pending requests.</p>
        </div>
        <div v-else class="request-list">
          <div v-for="req in pendingRequests" :key="req.id" class="request-card">
            <div class="req-avatar">{{ (req.displayName || req.athleteName || '?')[0].toUpperCase() }}</div>
            <div class="req-info">
              <div class="req-name">{{ req.displayName || req.athleteName }}</div>
              <div class="req-meta">{{ formatTime(req.createdAt) }}</div>
            </div>
            <div class="req-actions">
              <button class="btn-approve" @click="approve(req.id)">Approve</button>
              <button class="btn-decline" @click="decline(req.id)">Decline</button>
            </div>
          </div>
        </div>
      </template>

      <!-- Roster Tab -->
      <template v-else>
        <div v-if="loading" class="empty-state">
          <div class="spinner-border spinner-border-sm me-2"></div> Loading...
        </div>
        <div v-else-if="athletes.length === 0" class="empty-state">
          <i class="bi bi-people empty-icon"></i>
          <p>No athletes yet.</p>
        </div>
        <div v-else class="accordion-list">
          <div v-for="athlete in athletes" :key="athlete.id" class="accordion-item">
            <div class="accordion-header-wrap">
              <router-link :to="`/coach/athletes/${athlete.id}`" class="ath-row ath-row--link">
                <div class="ath-avatar">{{ (athlete.displayName || '?')[0].toUpperCase() }}</div>
                <div class="ath-info">
                  <div class="ath-name">{{ athlete.displayName }}</div>
                  <div class="ath-meta">{{ athlete.email }} · {{ athlete.activePlan?.name || 'No active plan' }}</div>
                </div>
              </router-link>
              <button
                class="accordion-toggle"
                @click="toggleAthlete(athlete.id)"
                :aria-expanded="expanded.includes(athlete.id)"
              >
                <i :class="['bi', expanded.includes(athlete.id) ? 'bi-chevron-up' : 'bi-chevron-down']"></i>
              </button>
            </div>

            <div v-if="expanded.includes(athlete.id)" class="accordion-body">
              <div v-if="!athletePlans[athlete.id]" class="plan-loading">
                <div class="spinner-border spinner-border-sm me-2"></div> Loading plans...
              </div>
              <template v-else>
                <div v-if="athletePlans[athlete.id].length === 0" class="no-plans">No plans assigned.</div>
                <div v-else class="plan-list">
                  <div v-for="plan in athletePlans[athlete.id]" :key="plan.id" class="plan-row">
                    <div class="plan-info">
                      <div class="plan-name">{{ plan.name }}</div>
                      <div class="plan-meta">{{ plan.sport }} · {{ plan.durationWeeks }}w</div>
                      <div class="plan-progress-wrap">
                        <div class="plan-progress-bar">
                          <div class="plan-progress-fill" :style="{ width: (plan.progress || 0) + '%' }"></div>
                        </div>
                        <span class="plan-pct">{{ plan.progress || 0 }}%</span>
                      </div>
                    </div>
                    <router-link :to="`/coach/plans/${plan.id}/edit`" class="btn-edit">Edit Plan →</router-link>
                  </div>
                </div>
                <button class="btn-new-plan" @click="openCreatePlan(athlete.id)">+ Create New Plan</button>
              </template>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Create Plan Modal -->
    <Teleport to="body">
      <div v-if="createModal.open" class="modal-overlay" @click.self="createModal.open = false">
        <div class="modal-panel">
          <div class="modal-header">
            <span class="modal-title">NEW PLAN</span>
            <button class="modal-close" @click="createModal.open = false"><i class="bi bi-x-lg"></i></button>
          </div>
          <form @submit.prevent="submitCreatePlan" class="modal-body">
            <div class="field-row">
              <label class="field-label">PLAN NAME</label>
              <input v-model="createModal.name" type="text" class="field-input" placeholder="e.g. 12-Week 5K Plan" required />
            </div>
            <div class="field-row">
              <label class="field-label">SPORT</label>
              <select v-model="createModal.sport" class="field-input">
                <option value="Running">Running</option>
                <option value="Cycling">Cycling</option>
                <option value="Swimming">Swimming</option>
                <option value="Triathlon">Triathlon</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div class="field-row">
              <label class="field-label">DURATION (WEEKS)</label>
              <input v-model.number="createModal.durationWeeks" type="number" min="1" max="52" class="field-input" placeholder="12" required />
            </div>
            <div v-if="createModal.error" class="modal-error">{{ createModal.error }}</div>
            <button type="submit" class="btn-create" :disabled="createModal.loading">
              <span v-if="createModal.loading" class="spinner-border spinner-border-sm me-2"></span>
              {{ createModal.loading ? 'Creating…' : 'Create Plan' }}
            </button>
          </form>
        </div>
      </div>
    </Teleport>
  </main>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useCoachStore } from '@/stores/coach'
import { usePlanStore } from '@/stores/plan'

const router = useRouter()
const coachStore = useCoachStore()
const planStore = usePlanStore()
const { athletes, pendingRequests, loading } = storeToRefs(coachStore)

const tab = ref('roster')
const expanded = ref([])
const athletePlans = ref({})

const createModal = reactive({
  open: false,
  athleteId: null,
  name: '',
  sport: 'Running',
  durationWeeks: 12,
  loading: false,
  error: ''
})

const toggleAthlete = async (athleteId) => {
  const idx = expanded.value.indexOf(athleteId)
  if (idx === -1) {
    expanded.value.push(athleteId)
    if (!athletePlans.value[athleteId]) {
      try {
        athletePlans.value[athleteId] = await planStore.fetchAthletePlans(athleteId)
      } catch {
        athletePlans.value[athleteId] = []
      }
    }
  } else {
    expanded.value.splice(idx, 1)
  }
}

const formatTime = (d) => {
  if (!d) return ''
  const diff = Date.now() - new Date(d)
  const days = Math.floor(diff / 86400000)
  if (days < 1) return 'today'
  return `${days}d ago`
}

const approve = async (reqId) => {
  try { await coachStore.approveRequest(reqId) } catch {}
}
const decline = async (reqId) => {
  try { await coachStore.rejectRequest(reqId) } catch {}
}

const openCreatePlan = (athleteId) => {
  createModal.athleteId = athleteId
  createModal.name = ''
  createModal.sport = 'Running'
  createModal.durationWeeks = 12
  createModal.error = ''
  createModal.open = true
}

const submitCreatePlan = async () => {
  createModal.loading = true
  createModal.error = ''
  try {
    const plan = await planStore.createPlanForAthlete(createModal.athleteId, {
      name: createModal.name,
      sport: createModal.sport,
      durationWeeks: createModal.durationWeeks,
    })
    createModal.open = false
    // Refresh this athlete's plan list
    athletePlans.value[createModal.athleteId] = await planStore.fetchAthletePlans(createModal.athleteId)
    // Navigate directly to the editor
    if (plan?.id) router.push(`/coach/plans/${plan.id}/edit`)
  } catch (e) {
    createModal.error = e?.response?.data?.message || 'Failed to create plan. Try again.'
  } finally {
    createModal.loading = false
  }
}

onMounted(() => {
  coachStore.fetchAthletes()
  coachStore.fetchRequests()
})
</script>

<style scoped>
.coach-athletes {
  min-height: 100vh;
  background: #fff;
  padding-top: var(--nav-h, 64px);
  font-family: "Futura PT", Futura, "Century Gothic", system-ui, sans-serif;
}

.page-header { background: #000; color: #fff; padding: 40px 24px 0; }
.header-inner { max-width: 1100px; margin: 0 auto; }
.header-kicker { font-size: 0.7rem; letter-spacing: 0.20em; color: rgba(255,255,255,0.5); text-transform: uppercase; margin-bottom: 6px; }
.header-row { display: flex; align-items: baseline; gap: 16px; margin-bottom: 24px; }
.header-title { font-size: clamp(1.8rem, 4vw, 2.8rem); font-weight: 900; letter-spacing: -0.02em; margin: 0; }
.header-count { font-size: 0.85rem; color: rgba(255,255,255,0.5); }

.tab-bar { display: flex; gap: 0; border-bottom: none; }
.tab {
  padding: 12px 24px;
  background: none; border: none;
  font-size: 0.78rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase;
  color: rgba(255,255,255,0.5); cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: color 0.15s, border-color 0.15s;
}
.tab.active { color: #fff; border-bottom-color: #fff; }
.tab-badge {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 18px; height: 18px; padding: 0 4px;
  background: #ef4444; color: #fff;
  font-size: 0.6rem; font-weight: 700; border-radius: 0;
  margin-left: 6px;
}

.content-wrap { max-width: 1100px; margin: 0 auto; padding: 32px 24px; }

/* Requests */
.request-list { display: flex; flex-direction: column; gap: 10px; }
.request-card { display: flex; align-items: center; gap: 14px; padding: 16px; border: 1px solid #E5E5E5; }
.req-avatar { width: 40px; height: 40px; background: #000; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1rem; flex-shrink: 0; }
.req-info { flex: 1; }
.req-name { font-weight: 600; font-size: 0.9rem; }
.req-meta { font-size: 0.75rem; color: #767676; margin-top: 2px; }
.req-actions { display: flex; gap: 8px; }
.btn-approve { padding: 8px 16px; background: #000; color: #fff; border: none; font-size: 0.78rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer; }
.btn-approve:hover { background: #222; }
.btn-decline { padding: 8px 16px; background: #fff; color: #000; border: 1px solid #E5E5E5; font-size: 0.78rem; font-weight: 600; cursor: pointer; }
.btn-decline:hover { border-color: #000; }

/* Accordion */
.accordion-list { display: flex; flex-direction: column; }
.accordion-item { border-bottom: 1px solid #E5E5E5; }
.accordion-header-wrap {
  width: 100%; display: flex; align-items: center; justify-content: space-between;
  padding: 16px 0; gap: 12px;
}
.accordion-toggle {
  background: none; border: none; cursor: pointer; color: #767676;
  font-size: 0.9rem; padding: 6px; flex-shrink: 0;
}
.accordion-toggle:hover { color: #000; }
.ath-row { display: flex; align-items: center; gap: 14px; flex: 1; }
.ath-row--link {
  text-decoration: none; color: inherit; flex: 1; transition: opacity 0.12s;
}
.ath-row--link:hover { opacity: 0.70; }
.ath-avatar { width: 44px; height: 44px; background: #f0f0f0; color: #000; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.1rem; flex-shrink: 0; }
.ath-name { font-weight: 700; font-size: 0.9rem; text-align: left; }
.ath-meta { font-size: 0.75rem; color: #767676; text-align: left; margin-top: 2px; }

.accordion-body { padding: 8px 0 24px 58px; }
.plan-loading { font-size: 0.85rem; color: #767676; display: flex; align-items: center; }
.no-plans { font-size: 0.85rem; color: #767676; padding: 8px 0; }

.plan-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; }
.plan-row { display: flex; align-items: center; justify-content: space-between; padding: 14px; border: 1px solid #E5E5E5; gap: 16px; }
.plan-info { flex: 1; }
.plan-name { font-weight: 700; font-size: 0.88rem; }
.plan-meta { font-size: 0.75rem; color: #767676; margin-top: 2px; }
.plan-progress-wrap { display: flex; align-items: center; gap: 8px; margin-top: 8px; }
.plan-progress-bar { flex: 1; height: 2px; background: #E5E5E5; }
.plan-progress-fill { height: 100%; background: #000; }
.plan-pct { font-size: 0.7rem; font-weight: 700; color: #767676; }
.btn-edit { font-size: 0.82rem; font-weight: 600; color: #000; text-decoration: none; flex-shrink: 0; }
.btn-edit:hover { text-decoration: underline; }

.btn-new-plan {
  padding: 10px 20px; background: #fff; color: #000;
  border: 1px dashed #767676; font-size: 0.8rem; font-weight: 600;
  letter-spacing: 0.04em; cursor: pointer; width: 100%;
}
.btn-new-plan:hover { border-color: #000; border-style: solid; }

.empty-state { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 60px 24px; color: #767676; text-align: center; }
.empty-icon { font-size: 2.5rem; }
.empty-state p { font-size: 0.9rem; margin: 0; }

.spinner-border { width: 1rem; height: 1rem; border: 2px solid rgba(0,0,0,0.10); border-top-color: #000; border-radius: 50%; animation: spin 0.75s linear infinite; display: inline-block; }
.spinner-border-sm { width: 0.85rem; height: 0.85rem; }
.me-2 { margin-right: 8px; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Create Plan Modal */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.55);
  z-index: 9000;
  display: flex; align-items: center; justify-content: center;
  padding: 24px;
}
.modal-panel {
  background: #fff;
  width: 100%; max-width: 440px;
  border: 1px solid #E5E5E5;
}
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #E5E5E5;
}
.modal-title { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.14em; color: #000; }
.modal-close { background: none; border: none; font-size: 1rem; color: #767676; cursor: pointer; }
.modal-close:hover { color: #000; }
.modal-body { padding: 24px; display: flex; flex-direction: column; gap: 18px; }
.field-row { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 0.62rem; font-weight: 700; letter-spacing: 0.12em; color: #767676; text-transform: uppercase; }
.field-input {
  height: 44px; padding: 0 12px;
  border: 1px solid #E5E5E5; background: #fff;
  font-size: 0.9rem; color: #000;
  outline: none; width: 100%;
  font-family: inherit;
}
.field-input:focus { border-color: #000; }
select.field-input { cursor: pointer; }
.modal-error { font-size: 0.82rem; color: #dc2626; }
.btn-create {
  height: 48px; background: #000; color: #fff; border: none;
  font-size: 0.78rem; font-weight: 700; letter-spacing: 0.10em;
  text-transform: uppercase; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
.btn-create:hover:not(:disabled) { background: #222; }
.btn-create:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
