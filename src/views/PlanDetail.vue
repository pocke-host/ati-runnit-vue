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

      <!-- Phase banner -->
      <div v-if="currentPhase" class="phase-banner" :style="{ background: phaseColors[currentPhase] }">
        <div class="phase-banner-inner container-xxl">
          <span class="phase-banner-label">{{ currentPhase }}</span>
          <span class="phase-banner-sub">{{ phaseDescription }}</span>
        </div>
      </div>

      <!-- Delete confirm modal -->
      <Teleport to="body">
        <div v-if="showDeleteConfirm" class="confirm-overlay" @click.self="showDeleteConfirm = false">
          <div class="confirm-modal">
            <div class="confirm-title">Delete Plan</div>
            <p class="confirm-body">Delete <strong>{{ plan.name }}</strong>? This can't be undone.</p>
            <div class="confirm-actions">
              <button class="confirm-btn-cancel" @click="showDeleteConfirm = false">Cancel</button>
              <button class="confirm-btn-danger" @click="doDelete">Delete</button>
            </div>
          </div>
        </div>
      </Teleport>

      <!-- Week selector tabs -->
      <div class="week-tabs-wrapper">
        <div class="week-tabs" ref="weekTabsEl">
          <button
            v-for="w in plan.weeks"
            :key="w.weekNumber"
            :data-week="w.weekNumber"
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
                {{ formatDistance(weekTotalDistance) }} done · {{ formatDistance(weekPlannedDistance) }} planned
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
                  <span :class="['workout-type', `type-${(workout.type || '').split(' ')[0].toLowerCase()}`]">
                    {{ workout.type }}
                  </span>
                  <!-- Workout type chip -->
                  <span
                    v-if="workout.workoutType"
                    class="wtype-chip"
                    :style="{ background: typeChipColor(workout.workoutType) }"
                  >
                    {{ workout.workoutType.replace('_', ' ') }}
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

              <!-- Pace target -->
              <div v-if="workout.targetPaceSeconds" class="pace-target">
                <i class="bi bi-stopwatch me-1"></i>
                Target: {{ formatPace(workout.targetPaceSeconds) }}
              </div>

              <p class="workout-desc" v-if="workout.description">{{ workout.description }}</p>

              <!-- Structured steps -->
              <template v-if="workout.steps?.length">
                <!-- Step chips preview strip -->
                <div class="steps-preview-strip">
                  <div
                    v-for="(step, i) in workout.steps"
                    :key="i"
                    class="step-chip-mini"
                    :style="{ background: stepColor(step.type) }"
                    :title="`${step.type}: ${step.duration}${step.durationType === 'TIME' ? 'min' : ' ' + distLabel}${step.repeat > 1 ? ' ×' + step.repeat : ''}`"
                  ></div>
                </div>
                <!-- Expand toggle -->
                <button class="steps-toggle" @click.stop="toggleSteps(workout.id)">
                  <i :class="expandedSteps.has(workout.id) ? 'bi bi-chevron-up' : 'bi bi-list-ul'"></i>
                  {{ expandedSteps.has(workout.id) ? 'Hide steps' : `${workout.steps.length} structured steps` }}
                </button>
                <!-- Expanded steps -->
                <div v-if="expandedSteps.has(workout.id)" class="steps-expanded">
                  <div v-for="(step, i) in workout.steps" :key="i" class="step-row">
                    <div class="step-dot" :style="{ background: stepColor(step.type) }"></div>
                    <div class="step-info">
                      <span class="step-type">{{ step.type }}</span>
                      <span class="step-dur">{{ step.duration }}{{ step.durationType === 'TIME' ? ' min' : ' ' + distLabel }}{{ step.repeat > 1 ? ' × ' + step.repeat : '' }}</span>
                      <span v-if="step.targetType === 'ZONE'" class="step-target">Zone {{ step.targetZone }}</span>
                      <span v-else-if="step.targetType === 'RPE'" class="step-target">RPE {{ step.targetRpe }}</span>
                      <span v-else-if="step.targetType === 'PACE'" class="step-target">{{ step.targetPaceMin }}–{{ step.targetPaceMax }} min/{{ distLabel }}</span>
                      <span v-else-if="step.targetType === 'HR_PCT'" class="step-target">{{ step.targetHrMin }}–{{ step.targetHrMax }}% HR</span>
                    </div>
                    <span v-if="step.notes" class="step-notes">{{ step.notes }}</span>
                  </div>
                </div>
              </template>
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
            <div class="summary-key">Done</div>
          </div>
          <div class="summary-stat">
            <div class="summary-val">{{ formatDistance(weekPlannedDistance) }}</div>
            <div class="summary-key">Planned</div>
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
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePlanStore } from '@/stores/plan.js'
import { useUnits } from '@/composables/useUnits'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth.js'
import { storeToRefs } from 'pinia'

const router = useRouter()
const route = useRoute()
const planStore = usePlanStore()
const { formatDistance, isImperial } = useUnits()
const distLabel = computed(() => isImperial.value ? 'mi' : 'km')

// Structured steps state
const expandedSteps = ref(new Set())
const toggleSteps = (workoutId) => {
  const s = new Set(expandedSteps.value)
  s.has(workoutId) ? s.delete(workoutId) : s.add(workoutId)
  expandedSteps.value = s
}

const STEP_COLORS = {
  WARMUP:'#fb923c', EASY:'#22c55e', AEROBIC:'#4ade80', TEMPO:'#f59e0b',
  THRESHOLD:'#ef4444', VO2MAX:'#8b5cf6', INTERVAL:'#3b82f6',
  SPRINT:'#dc2626', RECOVERY:'#60a5fa', COOLDOWN:'#94a3b8'
}
const stepColor = (t) => STEP_COLORS[t] || '#9ca3af'
const authStore = useAuthStore()
const { unitSystem } = storeToRefs(authStore)

const { showToast } = useToast()

const plan = ref(null)
const loading = ref(false)
const selectedWeek = ref(1)
const weekTabsEl = ref(null)
const workoutLoading = ref({})
const actionLoading = ref(false)
const showDeleteConfirm = ref(false)

function scrollToActiveTab() {
  nextTick(() => {
    if (!weekTabsEl.value) return
    const activeBtn = weekTabsEl.value.querySelector('[data-week="' + selectedWeek.value + '"]')
    if (activeBtn) activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  })
}

// ── Helpers ──────────────────────────────────────

const getSportIcon = (sport) => {
  return { Running: '🏃', Cycling: '🚴', Swimming: '🏊', Hiking: '🥾', Walking: '🚶' }[sport] || '🏋️'
}

const formatDateShort = (str) => {
  if (!str) return '—'
  return new Date(str + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function typeChipColor(wType) {
  return {
    EASY: '#22c55e', TEMPO: '#0052FF', INTERVAL: '#ef4444',
    LONG_RUN: '#8b5cf6', RECOVERY: '#06b6d4', REST: '#9ca3af',
  }[wType] || '#767676'
}

function formatPace(sPerKm) {
  if (!sPerKm) return null
  const paceSec = unitSystem.value === 'imperial'
    ? Math.round(sPerKm * 1.609344)
    : sPerKm
  const mins = Math.floor(paceSec / 60)
  const secs = paceSec % 60
  const unit = unitSystem.value === 'imperial' ? '/mi' : '/km'
  return `${mins}:${String(secs).padStart(2, '0')} ${unit}`
}

// ── Phase ─────────────────────────────────────────

const phaseColors = {
  BASE: '#22c55e', BUILD: '#0052FF', PEAK: '#ef4444', TAPER: '#3b82f6',
}

const phaseDescriptions = {
  BASE:  'Building your aerobic base — easy effort, consistent volume.',
  BUILD: 'Increasing intensity — tempo + interval work enters the mix.',
  PEAK:  'Peak training load — your hardest weeks before taper.',
  TAPER: 'Reducing volume — arriving fresh on race day.',
}

const currentPhase = computed(() => {
  if (!activeWeekData.value) return null
  return activeWeekData.value.phase || null
})

const phaseDescription = computed(() => phaseDescriptions[currentPhase.value] || '')

// ── Computed ─────────────────────────────────────

const currentWeek = computed(() => {
  if (!plan.value?.startDate) return 1
  const start = new Date(plan.value.startDate + 'T00:00:00')
  const now = new Date()
  const diff = Math.floor((now - start) / (7 * 86400000))
  return Math.min(Math.max(diff + 1, 1), plan.value.totalWeeks)
})

const overallPct = computed(() => {
  if (!plan.value?.weeks) return 0
  const allWorkouts = plan.value.weeks.flatMap(w => w.workouts)
  const done = allWorkouts.filter(w => w.completed).length
  return allWorkouts.length ? Math.round((done / allWorkouts.length) * 100) : 0
})

const activeWeekData = computed(() => {
  if (!plan.value?.weeks) return null
  return plan.value.weeks.find(w => w.weekNumber === selectedWeek.value)
})

const weekCompleted = computed(() => activeWeekData.value?.workouts.filter(w => w.completed).length || 0)
const weekTotal = computed(() => activeWeekData.value?.workouts.length || 0)
const weekTotalDistance = computed(() =>
  activeWeekData.value?.workouts.reduce((s, w) => s + (w.completed ? (w.distanceMeters || 0) : 0), 0) || 0
)
const weekPlannedDistance = computed(() =>
  activeWeekData.value?.workouts.reduce((s, w) => s + (w.distanceMeters || 0), 0) || 0
)
const weekTotalMinutes = computed(() =>
  activeWeekData.value?.workouts.reduce((s, w) => s + (w.completed ? (w.durationMinutes || 0) : 0), 0) || 0
)
const weekPct = computed(() => weekTotal.value ? Math.round((weekCompleted.value / weekTotal.value) * 100) : 0)

function isToday(workout) {
  if (!plan.value?.startDate || selectedWeek.value !== currentWeek.value) return false
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  return workout.dayLabel === days[new Date().getDay()]
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
      workout.completed = false
    } else {
      await planStore.completeWorkout(plan.value.id, workout.id)
      workout.completed = true
      showToast('Workout complete!', 'success')
    }
  } catch {
    showToast('Failed to update workout.', 'error')
  } finally {
    delete workoutLoading.value[workout.id]
  }
}

const setActive = async () => {
  actionLoading.value = true
  try {
    await planStore.setActivePlan(plan.value.id)
    plan.value.isActive = true
    showToast('Plan set as active!', 'success')
  } catch {
    showToast('Failed to set active.', 'error')
  } finally {
    actionLoading.value = false
  }
}

const confirmDelete = () => {
  showDeleteConfirm.value = true
}

const doDelete = async () => {
  showDeleteConfirm.value = false
  actionLoading.value = true
  try {
    await planStore.deletePlan(plan.value.id)
    router.push('/plans')
  } catch {
    showToast('Failed to delete plan. Try again.', 'error')
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
    scrollToActiveTab()
  } catch {
    plan.value = null
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.plan-detail-page {
  min-height: 100vh;
  background: var(--r-offwhite);
  padding-top: var(--nav-h);
  font-family: Futura, "Futura PT", "Futura Std", "Avenir Next", Avenir, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
}

/* Page loading */
.page-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; gap: 16px; color: rgba(15,18,16,0.55); }

/* ── Plan Header ── */
.plan-header { background: #000; color: white; padding: 24px 0 28px; }
.plan-header-inner { max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; flex-direction: column; gap: 20px; }
.back-btn { display: inline-flex; align-items: center; gap: 4px; background: none; border: none; color: rgba(255,255,255,0.75); font-weight: 700; font-size: 0.9rem; cursor: pointer; padding: 0; font-family: inherit; transition: color 0.2s; }
.back-btn:hover { color: white; }
.plan-header-main { display: flex; align-items: center; gap: 20px; }
.plan-sport-big { font-size: 3.5rem; }
.plan-header-badges { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 8px; }
.ph-badge { padding: 4px 12px; border-radius: 0; font-size: 0.75rem; font-weight: 700; text-transform: capitalize; }
.ph-badge-sport { background: rgba(255,255,255,0.15); color: white; }
.ph-badge-beginner     { background: rgba(16,185,129,0.25); color: #a7f3d0; }
.ph-badge-intermediate { background: rgba(245,158,11,0.25); color: #fde68a; }
.ph-badge-advanced     { background: rgba(239,68,68,0.25);  color: #fecaca; }
.ph-badge-active { background: rgba(255,255,255,0.15); color: #fff; display: inline-flex; align-items: center; }
.plan-header-name { font-weight: 900; font-size: 1.6rem; margin: 0 0 4px; color: white; }
.plan-header-meta { font-size: 0.88rem; color: rgba(255,255,255,0.70); }

/* Overall progress bar */
.plan-overall-progress { max-width: 400px; }
.progress-labels { display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; color: rgba(255,255,255,0.85); margin-bottom: 8px; }
.progress-pct { color: rgba(255,255,255,0.70); }
.progress-track { height: 8px; background: rgba(255,255,255,0.20); border-radius: 0; overflow: hidden; }
.progress-fill { height: 100%; background: rgba(255,255,255,0.90); border-radius: 0; transition: width 0.5s; }

/* Header actions */
.plan-header-actions { display: flex; gap: 10px; }

/* ── Phase Banner ── */
.phase-banner { padding: 10px 0; }
.phase-banner-inner { display: flex; align-items: center; gap: 16px; padding: 0 24px; max-width: 1200px; margin: 0 auto; }
.phase-banner-label {
  font-size: 0.7rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.14em;
  color: white; background: rgba(0,0,0,0.20); padding: 3px 10px; border-radius: 0;
}
.phase-banner-sub { font-size: 0.83rem; font-weight: 600; color: rgba(255,255,255,0.90); }

/* ── Delete confirm modal ── */
.confirm-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.55);
  z-index: 9000; display: flex; align-items: center; justify-content: center; padding: 24px;
}
.confirm-modal {
  background: #fff; width: 100%; max-width: 400px; padding: 28px;
  display: flex; flex-direction: column; gap: 12px;
  font-family: Futura, "Avenir Next", system-ui, sans-serif;
}
.confirm-title { font-size: 1rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.08em; }
.confirm-body { font-size: 0.88rem; color: #555; margin: 0; }
.confirm-actions { display: flex; gap: 10px; margin-top: 8px; }
.confirm-btn-cancel {
  flex: 1; height: 44px; border: 1px solid #E5E5E5; background: #fff;
  color: #767676; font-family: inherit; font-weight: 700; font-size: 0.82rem;
  text-transform: uppercase; letter-spacing: 0.08em; cursor: pointer;
}
.confirm-btn-danger {
  flex: 1; height: 44px; border: none; background: #dc2626; color: #fff;
  font-family: inherit; font-weight: 700; font-size: 0.82rem;
  text-transform: uppercase; letter-spacing: 0.08em; cursor: pointer;
}
.confirm-btn-danger:hover { background: #b91c1c; }

/* ── Week Tabs ── */
.week-tabs-wrapper {
  background: rgba(255,255,255,0.95);
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
.week-tab.active { color: #000; border-bottom-color: #000; }
.week-tab.current .week-tab-label { color: #000; }
.week-tab-dot { width: 6px; height: 6px; border-radius: 0; background: #000; margin-top: 4px; }

/* ── Week Content ── */
.week-content { padding: 28px 24px 60px; }
.week-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
.week-title { font-weight: 900; font-size: 1.2rem; color: rgba(15,18,16,0.92); margin-bottom: 6px; }
.week-stats { display: flex; gap: 16px; font-size: 0.85rem; color: rgba(15,18,16,0.60); font-weight: 600; flex-wrap: wrap; }
.week-progress-mini { width: 120px; height: 6px; background: rgba(15,18,16,0.10); border-radius: 0; overflow: hidden; flex-shrink: 0; }
.week-progress-fill { height: 100%; background: #000; border-radius: 0; transition: width 0.4s; }

/* ── Workout Cards ── */
.workouts-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px; }
.workout-card {
  display: flex; gap: 16px; align-items: flex-start;
  background: white; border: 1px solid rgba(15,18,16,0.10);
  border-radius: 0; padding: 20px; transition: all 0.2s;
}
.workout-today { border-color: #000; }
.workout-completed { background: rgba(16,185,129,0.04); border-color: rgba(16,185,129,0.20); }
.workout-missed { border-color: rgba(239,68,68,0.25); background: rgba(239,68,68,0.02); }

/* Check button */
.check-btn {
  width: 36px; height: 36px; border-radius: 0;
  border: 2px solid rgba(15,18,16,0.20);
  background: transparent; display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.2s; flex-shrink: 0; font-size: 1rem;
  color: rgba(15,18,16,0.50);
}
.check-btn:hover { border-color: #000; color: #000; }
.check-btn.checked { background: rgba(16,185,129,1); border-color: rgba(16,185,129,1); color: white; }
.check-btn:disabled { opacity: 0.50; cursor: not-allowed; }

/* Workout body */
.workout-body { flex: 1; min-width: 0; }
.workout-top-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; flex-wrap: wrap; gap: 8px; }
.workout-day-type { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.workout-day { font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(15,18,16,0.50); }
.workout-sep { color: rgba(15,18,16,0.25); }
.workout-type { font-weight: 900; font-size: 1rem; color: rgba(15,18,16,0.90); }
.workout-completed .workout-type { text-decoration: line-through; opacity: 0.55; }

/* Workout type colors */
.type-easy, .type-recovery   { color: #047857; }
.type-tempo                  { color: #0052FF; }
.type-long                   { color: #000; }
.type-interval               { color: #b91c1c; }
.type-endurance              { color: #047857; }

/* Workout type chip */
.wtype-chip {
  display: inline-flex; align-items: center;
  padding: 2px 8px; border-radius: 0;
  font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;
  color: white;
}

.workout-tags { display: flex; gap: 6px; }
.tag-today  { background: rgba(196,106,42,0.12); color: #000; padding: 3px 10px; border-radius: 0; font-size: 0.72rem; font-weight: 700; }
.tag-missed { background: rgba(239,68,68,0.10); color: #dc2626; padding: 3px 10px; border-radius: 0; font-size: 0.72rem; font-weight: 700; }

.workout-detail-row { display: flex; gap: 12px; font-size: 0.88rem; font-weight: 700; color: rgba(15,18,16,0.70); margin-bottom: 6px; }

/* Pace target */
.pace-target {
  display: inline-flex; align-items: center;
  font-size: 0.82rem; font-weight: 700; color: rgba(15,18,16,0.60);
  background: rgba(15,18,16,0.04); padding: 3px 10px; border-radius: 0;
  margin-bottom: 6px;
}

.workout-desc { font-size: 0.85rem; color: rgba(15,18,16,0.55); margin: 0; line-height: 1.5; font-style: italic; }

/* Structured steps in plan */
.steps-preview-strip { display: flex; gap: 2px; margin-top: 8px; }
.step-chip-mini { width: 16px; height: 5px; border-radius: 2px; }
.steps-toggle {
  display: flex; align-items: center; gap: 5px; margin-top: 6px;
  background: none; border: none; font-family: inherit;
  font-size: 0.72rem; font-weight: 700; color: #767676;
  cursor: pointer; padding: 0; text-transform: uppercase; letter-spacing: 0.05em;
  transition: color 0.15s;
}
.steps-toggle:hover { color: #000; }
.steps-expanded { margin-top: 8px; border: 1px solid #F0F0F0; padding: 8px; background: #FAFAFA; }
.step-row { display: flex; align-items: center; gap: 8px; padding: 5px 0; border-bottom: 1px solid #F5F5F5; flex-wrap: wrap; }
.step-row:last-child { border-bottom: none; }
.step-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.step-info { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.step-type { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; }
.step-dur { font-size: 0.7rem; color: #767676; }
.step-target { font-size: 0.68rem; background: rgba(15,18,16,0.06); padding: 1px 5px; color: #555; font-weight: 600; }
.step-notes { font-size: 0.68rem; color: #999; font-style: italic; }

/* Week summary */
.week-summary {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;
  background: white; border: 1px solid rgba(15,18,16,0.10);
  border-radius: 0; padding: 20px 28px;
}
.summary-stat { text-align: center; }
.summary-val { font-size: 1.4rem; font-weight: 900; color: #000; margin-bottom: 4px; }
.summary-key { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(15,18,16,0.50); }

/* Spin */
.spin { animation: spin 0.8s linear infinite; display: inline-block; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

/* Buttons */
.btn {
  border: 1px solid rgba(15,18,16,0.14); background: rgba(255,255,255,0.60);
  color: rgba(15,18,16,0.78); border-radius: 0; height: 40px; padding: 0 18px;
  font-weight: 700; font-family: inherit;
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  cursor: pointer; transition: all 0.2s;
}
.btn:disabled { opacity: 0.45; cursor: not-allowed; }
.btn-primary { background: #0052FF; border-color: transparent; color: white; }
.btn-primary:hover:not(:disabled) { background: #003ECC; }
.btn-outline-danger { background: rgba(255,255,255,0.70); border-color: rgba(220,38,38,0.30); color: #dc2626; }
.btn-outline-danger:hover:not(:disabled) { background: rgba(220,38,38,0.06); }
.btn-sm { height: 36px; padding: 0 14px; font-size: 0.85rem; border-radius: 0; }
.mt-3 { margin-top: 16px; }

@media (max-width: 640px) {
  .week-summary { grid-template-columns: repeat(2, 1fr); }
  .plan-header-main { flex-wrap: wrap; }
  .week-stats { flex-direction: column; gap: 6px; }
  .phase-banner-sub { display: none; }
}
</style>
