<!-- src/views/PlanDetail.vue -->
<template>
  <div class="plan-detail-page">
    <!-- Loading -->
    <div v-if="loading" class="page-loading">
      <div class="spinner-border"></div>
      <p>Loading plan…</p>
    </div>

    <template v-else-if="plan">
      <!-- Header -->
      <header class="plan-header">
        <div class="plan-header-inner">
          <button class="back-btn" @click="router.push('/plans')">
            <i class="bi bi-arrow-left me-2"></i>Plans
          </button>

          <div class="plan-header-main">
            <div class="plan-sport-big">{{ getSportIcon(plan.sport) }}</div>
            <div class="plan-header-info">
              <div class="plan-header-badges">
                <span class="ph-badge ph-badge-sport">{{ plan.sport }}</span>
                <span class="ph-badge" :class="'ph-badge-' + plan.level">{{ plan.level }}</span>
                <span v-if="plan.isActive" class="ph-badge ph-badge-active">
                  <i class="bi bi-circle-fill me-1" style="font-size:0.5rem"></i>Active
                </span>
              </div>
              <h1 class="plan-header-name">{{ plan.name }}</h1>
              <div class="plan-header-meta">
                {{ plan.totalWeeks }} weeks · {{ plan.daysPerWeek }}x/week · Starts {{ formatDateShort(plan.startDate) }}
              </div>
            </div>
          </div>

          <!-- Overall progress -->
          <div class="plan-overall-progress">
            <div class="progress-labels">
              <span>Week {{ currentWeek }} of {{ plan.totalWeeks }}</span>
              <span class="progress-pct">{{ overallPct }}%</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill" :style="{ width: overallPct + '%' }"></div>
            </div>
          </div>

          <!-- Action buttons -->
          <div class="plan-header-actions">
            <button
              v-if="!plan.isActive"
              class="btn btn-primary btn-sm"
              @click="setActive"
              :disabled="actionLoading"
            >
              <i class="bi bi-check-circle me-1"></i>Set Active
            </button>
            <button class="btn btn-outline-danger btn-sm" @click="confirmDelete" :disabled="actionLoading">
              <i class="bi bi-trash me-1"></i>Delete
            </button>
          </div>
        </div>
      </header>

      <!-- Status toast -->
      <div v-if="statusMessage" :class="['status-toast', statusType]">
        <i :class="statusType === 'success' ? 'bi bi-check-circle-fill' : 'bi bi-exclamation-circle-fill'"></i>
        {{ statusMessage }}
      </div>

      <!-- Week selector tabs -->
      <div class="week-tabs-wrapper">
        <div class="week-tabs">
          <button
            v-for="w in plan.weeks"
            :key="w.weekNumber"
            :class="['week-tab', {
              active: selectedWeek === w.weekNumber,
              current: w.weekNumber === currentWeek,
            }]"
            @click="selectedWeek = w.weekNumber"
          >
            <span class="week-tab-label">W{{ w.weekNumber }}</span>
            <span v-if="w.weekNumber === currentWeek" class="week-tab-dot"></span>
          </button>
        </div>
      </div>

      <!-- Week content -->
      <div class="week-content container-xxl" v-if="activeWeekData">
        <!-- Week header -->
        <div class="week-header">
          <div>
            <div class="week-title">Week {{ activeWeekData.weekNumber }} — {{ activeWeekData.theme }}</div>
            <div class="week-stats">
              <span>
                <i class="bi bi-check2-circle me-1"></i>
                {{ weekCompleted }}/{{ weekTotal }} completed
              </span>
              <span>
                <i class="bi bi-geo-alt me-1"></i>
                {{ formatDistance(weekTotalDistance) }} this week
              </span>
            </div>
          </div>
          <div class="week-progress-mini">
            <div class="week-progress-fill" :style="{ width: weekPct + '%' }"></div>
          </div>
        </div>

        <!-- Workout cards -->
        <div class="workouts-list">
          <div
            v-for="workout in activeWeekData.workouts"
            :key="workout.id"
            :class="['workout-card', {
              'workout-completed': workout.completed,
              'workout-today': isToday(workout),
              'workout-missed': isMissed(workout),
            }]"
          >
            <div class="workout-check-col">
              <button
                class="check-btn"
                :class="{ checked: workout.completed }"
                @click="toggleWorkout(workout)"
                :disabled="!!workoutLoading[workout.id]"
              >
                <i v-if="workoutLoading[workout.id]" class="bi bi-arrow-repeat spin"></i>
                <i v-else-if="workout.completed" class="bi bi-check-lg"></i>
              </button>
            </div>

            <div class="workout-body">
              <div class="workout-top-row">
                <div class="workout-day-type">
                  <span class="workout-day">{{ workout.dayLabel }}</span>
                  <span class="workout-sep">·</span>
                  <span :class="['workout-type', `type-${workout.type.split(' ')[0].toLowerCase()}`]">
                    {{ workout.type }}
                  </span>
                </div>
                <div class="workout-tags">
                  <span v-if="isToday(workout)" class="tag-today">Today</span>
                  <span v-if="isMissed(workout)" class="tag-missed">Missed</span>
                </div>
              </div>

              <div class="workout-detail-row" v-if="workout.type !== 'Rest'">
                <span class="workout-dist">{{ formatDistance(workout.distanceMeters) }}</span>
                <span class="workout-dur">{{ workout.durationMinutes }} min</span>
              </div>

              <p class="workout-desc" v-if="workout.description">{{ workout.description }}</p>
            </div>
          </div>
        </div>

        <!-- Week summary -->
        <div class="week-summary">
          <div class="summary-stat">
            <div class="summary-val">{{ weekCompleted }}/{{ weekTotal }}</div>
            <div class="summary-key">Workouts done</div>
          </div>
          <div class="summary-stat">
            <div class="summary-val">{{ formatDistance(weekTotalDistance) }}</div>
            <div class="summary-key">Distance</div>
          </div>
          <div class="summary-stat">
            <div class="summary-val">{{ weekTotalMinutes }} min</div>
            <div class="summary-key">Duration</div>
          </div>
          <div class="summary-stat">
            <div class="summary-val">{{ weekPct }}%</div>
            <div class="summary-key">Complete</div>
          </div>
        </div>
      </div>
    </template>

    <!-- Not found -->
    <div v-else-if="!loading" class="page-loading">
      <p>Plan not found.</p>
      <button class="btn btn-primary mt-3" @click="router.push('/plans')">Back to Plans</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePlanStore } from '@/stores/plan.js'
import { useUnits } from '@/composables/useUnits'

const router = useRouter()
const route = useRoute()
const planStore = usePlanStore()
const { formatDistance } = useUnits()

const plan = ref(null)
const loading = ref(false)
const selectedWeek = ref(1)
const workoutLoading = ref({})
const actionLoading = ref(false)
const statusMessage = ref('')
const statusType = ref('success')
let statusTimer = null

// ── Helpers ──────────────────────────────────────

const showStatus = (msg, type = 'success') => {
  clearTimeout(statusTimer)
  statusMessage.value = msg
  statusType.value = type
  statusTimer = setTimeout(() => { statusMessage.value = '' }, 4000)
}

const getSportIcon = (sport) => {
  const m = { Running: '🏃', Cycling: '🚴', Swimming: '🏊', Hiking: '🥾', Walking: '🚶' }
  return m[sport] || '🏋️'
}

const formatDateShort = (str) => {
  if (!str) return '—'
  return new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ── Computed ─────────────────────────────────────

const currentWeek = computed(() => {
  if (!plan.value?.startDate) return 1
  const start = new Date(plan.value.startDate)
  const now = new Date()
  const diff = Math.floor((now - start) / (7 * 24 * 3600 * 1000))
  return Math.min(Math.max(diff + 1, 1), plan.value.totalWeeks)
})

const overallPct = computed(() => {
  if (!plan.value) return 0
  const allWorkouts = plan.value.weeks.flatMap(w => w.workouts)
  const done = allWorkouts.filter(w => w.completed).length
  return allWorkouts.length ? Math.round((done / allWorkouts.length) * 100) : 0
})

const activeWeekData = computed(() => {
  if (!plan.value) return null
  return plan.value.weeks.find(w => w.weekNumber === selectedWeek.value)
})

const weekCompleted = computed(() => activeWeekData.value?.workouts.filter(w => w.completed).length || 0)
const weekTotal = computed(() => activeWeekData.value?.workouts.length || 0)
const weekTotalDistance = computed(() => activeWeekData.value?.workouts.reduce((s, w) => s + (w.completed ? (w.distanceMeters || 0) : 0), 0) || 0)
const weekTotalMinutes = computed(() => activeWeekData.value?.workouts.reduce((s, w) => s + (w.completed ? (w.durationMinutes || 0) : 0), 0) || 0)
const weekPct = computed(() => weekTotal.value ? Math.round((weekCompleted.value / weekTotal.value) * 100) : 0)

function isToday(workout) {
  if (!plan.value?.startDate || selectedWeek.value !== currentWeek.value) return false
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  const todayName = days[new Date().getDay()]
  return workout.dayLabel === todayName
}

function isMissed(workout) {
  if (workout.completed) return false
  if (selectedWeek.value > currentWeek.value) return false
  if (selectedWeek.value < currentWeek.value) return true
  if (!plan.value?.startDate) return false
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  const todayIdx = new Date().getDay()
  const workoutIdx = days.indexOf(workout.dayLabel)
  return workoutIdx >= 0 && workoutIdx < todayIdx
}

// ── Actions ──────────────────────────────────────

const toggleWorkout = async (workout) => {
  workoutLoading.value[workout.id] = true
  try {
    if (workout.completed) {
      await planStore.uncompleteWorkout(plan.value.id, workout.id)
    } else {
      await planStore.completeWorkout(plan.value.id, workout.id)
    }
    workout.completed = !workout.completed
  } catch {
    showStatus('Failed to update workout.', 'error')
  } finally {
    delete workoutLoading.value[workout.id]
  }
}

const setActive = async () => {
  actionLoading.value = true
  try {
    await planStore.setActivePlan(plan.value.id)
    plan.value.isActive = true
    showStatus('Plan set as active!')
  } catch {
    showStatus('Failed to set active.', 'error')
  } finally {
    actionLoading.value = false
  }
}

const confirmDelete = async () => {
  if (!confirm(`Delete "${plan.value.name}"? This can't be undone.`)) return
  actionLoading.value = true
  try {
    await planStore.deletePlan(plan.value.id)
    router.push('/plans')
  } catch {
    showStatus('Failed to delete plan.', 'error')
    actionLoading.value = false
  }
}

// ── Load ──────────────────────────────────────────

onMounted(async () => {
  loading.value = true
  try {
    const data = await planStore.fetchPlan(route.params.id)
    plan.value = data
    selectedWeek.value = currentWeek.value
  } catch {
    plan.value = null
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.plan-detail-page {
  --r-olive: #5A6B4E;
  --r-olive-deep: #2C3726;
  --r-accent: #C46A2A;
  --r-offwhite: #F5F6F3;
  --nav-h: 72px;

  min-height: 100vh;
  background: var(--r-offwhite);
  padding-top: var(--nav-h);
  font-family: Futura, "Futura PT", "Futura Std", "Avenir Next", Avenir, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
}

/* Page loading */
.page-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; gap: 16px; color: rgba(15,18,16,0.55); }

/* ── Plan Header ── */
.plan-header {
  background: linear-gradient(135deg, var(--r-olive), var(--r-olive-deep));
  color: white; padding: 24px 0 28px;
}
.plan-header-inner { max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; flex-direction: column; gap: 20px; }

.back-btn { display: inline-flex; align-items: center; gap: 4px; background: none; border: none; color: rgba(255,255,255,0.75); font-weight: 700; font-size: 0.9rem; cursor: pointer; padding: 0; font-family: inherit; transition: color 0.2s; }
.back-btn:hover { color: white; }

.plan-header-main { display: flex; align-items: center; gap: 20px; }
.plan-sport-big { font-size: 3.5rem; }
.plan-header-badges { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 8px; }

.ph-badge { padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; text-transform: capitalize; }
.ph-badge-sport { background: rgba(255,255,255,0.15); color: white; }
.ph-badge-beginner     { background: rgba(16,185,129,0.25); color: #a7f3d0; }
.ph-badge-intermediate { background: rgba(245,158,11,0.25); color: #fde68a; }
.ph-badge-advanced     { background: rgba(239,68,68,0.25);  color: #fecaca; }
.ph-badge-active { background: rgba(196,106,42,0.30); color: #fed7aa; display: inline-flex; align-items: center; }

.plan-header-name { font-weight: 900; font-size: 1.6rem; margin: 0 0 4px; color: white; }
.plan-header-meta { font-size: 0.88rem; color: rgba(255,255,255,0.70); }

/* Overall progress bar */
.plan-overall-progress { max-width: 400px; }
.progress-labels { display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; color: rgba(255,255,255,0.85); margin-bottom: 8px; }
.progress-pct { color: rgba(255,255,255,0.70); }
.progress-track { height: 8px; background: rgba(255,255,255,0.20); border-radius: 99px; overflow: hidden; }
.progress-fill { height: 100%; background: rgba(255,255,255,0.90); border-radius: 99px; transition: width 0.5s; }

/* Header actions */
.plan-header-actions { display: flex; gap: 10px; }

/* Status toast */
.status-toast {
  position: fixed; top: 90px; right: 24px; z-index: 9000;
  display: flex; align-items: center; gap: 10px;
  padding: 14px 20px; border-radius: 14px;
  font-weight: 700; font-size: 0.9rem;
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
  animation: slideInRight 0.3s ease;
}
.status-toast.success { background: #047857; color: white; }
.status-toast.error   { background: #dc2626; color: white; }
@keyframes slideInRight { from { opacity:0; transform:translateX(30px); } to { opacity:1; transform:translateX(0); } }

/* ── Week Tabs ── */
.week-tabs-wrapper {
  background: rgba(255,255,255,0.95); backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(15,18,16,0.08);
  position: sticky; top: var(--nav-h); z-index: 50;
  overflow-x: auto; -webkit-overflow-scrolling: touch;
}
.week-tabs { display: flex; padding: 0 24px; gap: 4px; min-width: max-content; }

.week-tab {
  position: relative; display: flex; flex-direction: column; align-items: center;
  padding: 14px 16px; border: none; background: transparent;
  font-family: inherit; font-size: 0.82rem; font-weight: 700;
  color: rgba(15,18,16,0.55); cursor: pointer; transition: all 0.2s;
  border-bottom: 3px solid transparent; white-space: nowrap;
}
.week-tab:hover { color: rgba(15,18,16,0.85); }
.week-tab.active { color: var(--r-accent); border-bottom-color: var(--r-accent); }
.week-tab.current .week-tab-label { color: var(--r-olive); }
.week-tab-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--r-accent); margin-top: 4px; }

/* ── Week Content ── */
.week-content { padding: 28px 24px 60px; }

.week-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
.week-title { font-weight: 900; font-size: 1.2rem; color: rgba(15,18,16,0.92); margin-bottom: 6px; }
.week-stats { display: flex; gap: 16px; font-size: 0.85rem; color: rgba(15,18,16,0.60); font-weight: 600; }
.week-progress-mini { width: 120px; height: 6px; background: rgba(15,18,16,0.10); border-radius: 99px; overflow: hidden; flex-shrink: 0; }
.week-progress-fill { height: 100%; background: linear-gradient(90deg, var(--r-accent), #a85722); border-radius: 99px; transition: width 0.4s; }

/* ── Workout Cards ── */
.workouts-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px; }

.workout-card {
  display: flex; gap: 16px; align-items: flex-start;
  background: white; border: 1px solid rgba(15,18,16,0.10);
  border-radius: 18px; padding: 20px;
  transition: all 0.2s; box-shadow: 0 2px 12px rgba(15,18,16,0.05);
}
.workout-card:hover { box-shadow: 0 6px 24px rgba(15,18,16,0.10); }
.workout-today { border-color: var(--r-accent); box-shadow: 0 0 0 3px rgba(196,106,42,0.12), 0 4px 20px rgba(196,106,42,0.15); }
.workout-completed { background: rgba(16,185,129,0.04); border-color: rgba(16,185,129,0.20); }
.workout-missed { border-color: rgba(239,68,68,0.25); background: rgba(239,68,68,0.02); }

/* Check button */
.check-btn {
  width: 36px; height: 36px; border-radius: 50%;
  border: 2px solid rgba(15,18,16,0.20);
  background: transparent; display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.2s; flex-shrink: 0; font-size: 1rem;
  color: rgba(15,18,16,0.50);
}
.check-btn:hover { border-color: var(--r-accent); color: var(--r-accent); }
.check-btn.checked { background: rgba(16,185,129,1); border-color: rgba(16,185,129,1); color: white; }
.check-btn:disabled { opacity: 0.50; cursor: not-allowed; }

/* Workout body */
.workout-body { flex: 1; min-width: 0; }
.workout-top-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; flex-wrap: wrap; gap: 8px; }
.workout-day-type { display: flex; align-items: center; gap: 8px; }
.workout-day { font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(15,18,16,0.50); }
.workout-sep { color: rgba(15,18,16,0.25); }
.workout-type { font-weight: 900; font-size: 1rem; color: rgba(15,18,16,0.90); }
.workout-completed .workout-type { text-decoration: line-through; opacity: 0.55; }

/* Workout type colors */
.type-easy, .type-recovery   { color: #047857; }
.type-tempo                  { color: #b45309; }
.type-long                   { color: var(--r-olive); }
.type-interval               { color: #b91c1c; }
.type-endurance              { color: #047857; }

.workout-tags { display: flex; gap: 6px; }
.tag-today { background: rgba(196,106,42,0.12); color: var(--r-accent); padding: 3px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 700; }
.tag-missed { background: rgba(239,68,68,0.10); color: #dc2626; padding: 3px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 700; }

.workout-detail-row { display: flex; gap: 12px; font-size: 0.88rem; font-weight: 700; color: rgba(15,18,16,0.70); margin-bottom: 8px; }
.workout-desc { font-size: 0.85rem; color: rgba(15,18,16,0.55); margin: 0; line-height: 1.5; font-style: italic; }

/* Week summary */
.week-summary {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;
  background: white; border: 1px solid rgba(15,18,16,0.10);
  border-radius: 20px; padding: 20px 28px;
  box-shadow: 0 2px 12px rgba(15,18,16,0.06);
}
.summary-stat { text-align: center; }
.summary-val { font-size: 1.4rem; font-weight: 900; color: var(--r-accent); margin-bottom: 4px; }
.summary-key { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(15,18,16,0.50); }

/* Spin animation for loading icon */
.spin { animation: spin 0.8s linear infinite; display: inline-block; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

/* Buttons */
.btn {
  border: 1px solid rgba(15,18,16,0.14); background: rgba(255,255,255,0.60);
  color: rgba(15,18,16,0.78); border-radius: 12px; height: 40px; padding: 0 18px;
  font-weight: 700; font-family: inherit;
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  cursor: pointer; transition: all 0.2s;
}
.btn:disabled { opacity: 0.45; cursor: not-allowed; }
.btn-primary { background: linear-gradient(135deg, var(--r-accent), #a85722); border-color: transparent; color: white; }
.btn-primary:hover:not(:disabled) { background: linear-gradient(135deg, #a85722, #914a1e); }
.btn-outline-danger { background: rgba(255,255,255,0.70); border-color: rgba(220,38,38,0.30); color: #dc2626; }
.btn-outline-danger:hover:not(:disabled) { background: rgba(220,38,38,0.06); }
.btn-sm { height: 36px; padding: 0 14px; font-size: 0.85rem; border-radius: 10px; }
.mt-3 { margin-top: 16px; }

@media (max-width: 640px) {
  .week-summary { grid-template-columns: repeat(2, 1fr); }
  .plan-header-main { flex-wrap: wrap; }
  .week-stats { flex-direction: column; gap: 6px; }
}
</style>
