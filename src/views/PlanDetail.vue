<!-- src/views/PlanDetail.vue -->
<template>
  <div class="plan-detail-page">
    <!-- Loading skeleton -->
    <div v-if="loading" class="plan-skeleton">
      <div class="sk-header">
        <div class="sk-bar sk-bar-sm"></div>
        <div class="sk-bar sk-bar-lg"></div>
        <div class="sk-bar sk-bar-md"></div>
      </div>
      <div class="sk-tabs">
        <div v-for="n in 5" :key="n" class="sk-tab"></div>
      </div>
      <div class="sk-workouts">
        <div v-for="n in 4" :key="n" class="sk-workout-card">
          <div class="sk-bar sk-bar-xs"></div>
          <div class="sk-bar sk-bar-md"></div>
          <div class="sk-bar sk-bar-sm"></div>
        </div>
      </div>
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
        <button
          v-if="currentWeek && selectedWeek !== currentWeek"
          class="week-jump-today"
          @click="selectedWeek = currentWeek; scrollToActiveTab()"
        >
          <i class="bi bi-arrow-right-circle me-1"></i>Current Week
        </button>
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
          <div v-for="workout in activeWeekData.workouts" :key="workout.id" class="workout-outer">
            <div
              :class="['workout-card', {
                'workout-completed': workout.completed,
                'workout-skipped':  workout.skipped,
                'workout-today':    isToday(workout),
                'workout-missed':   isMissed(workout) && !workout.skipped,
              }]"
            >
              <div class="workout-check-col">
                <button
                  class="check-btn"
                  :class="{ checked: workout.completed }"
                  @click="toggleWorkout(workout)"
                  :disabled="!!workoutLoading[workout.id] || workout.skipped"
                  :title="workout.completed ? 'Mark incomplete' : 'Mark complete'"
                >
                  <i v-if="workoutLoading[workout.id]" class="bi bi-arrow-repeat spin"></i>
                  <i v-else-if="workout.completed" class="bi bi-check-lg"></i>
                </button>
                <button
                  v-if="!workout.completed"
                  :class="['skip-btn', { 'skip-btn--active': workout.skipped }]"
                  @click="skipWorkout(workout)"
                  :disabled="!!workoutLoading[workout.id]"
                  :title="workout.skipped ? 'Undo skip' : 'Skip this workout'"
                >
                  <i class="bi bi-forward-fill"></i>
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
                <span class="workout-dist" v-if="workout.distanceMeters">{{ formatDistance(workout.distanceMeters) }}</span>
                <span class="workout-dur" v-if="workout.durationMinutes">
                  <span class="dur-sep" v-if="workout.distanceMeters">·</span>
                  {{ workout.durationMinutes }} min
                </span>
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

              <!-- Athlete note / RPE display -->
              <div v-if="workout.rpe || workout.athleteNotes" class="athlete-note-row">
                <span v-if="workout.rpe" class="rpe-chip">RPE {{ workout.rpe }}/10</span>
                <span v-if="workout.athleteNotes" class="athlete-note-text">{{ workout.athleteNotes }}</span>
                <button class="note-edit-btn" @click="openEditNote(workout)" title="Edit note"><i class="bi bi-pencil"></i></button>
              </div>

              <!-- Workout bottom actions -->
              <div class="workout-bottom-actions">
                <button class="wba-btn" @click="toggleAdjust(workout.id)">
                  <i class="bi bi-sliders me-1"></i>{{ adjustOpen.has(workout.id) ? 'Close' : 'Adjust' }}
                </button>
                <button
                  v-if="!workout.completed && workout.workoutType !== 'REST'"
                  class="wba-btn wba-btn-start"
                  @click="startWorkout(workout)"
                >
                  <i class="bi bi-play-fill me-1"></i>Start
                </button>
              </div>
            </div>
          </div><!-- /.workout-card -->

          <!-- Post-completion panel moved to bottom sheet below -->

          <!-- Post-completion panel (bottom-sheet stub — keeps workout loop clean) -->
          <div v-if="false && postCompletion?.id === workout.id" class="completion-panel">
            <div class="cp-header">
              <span class="cp-title">How'd it go?</span>
              <button class="cp-close" @click="closePostCompletion"><i class="bi bi-x"></i></button>
            </div>
            <div class="rpe-row">
              <span class="rpe-label">Effort (RPE)</span>
              <div class="rpe-btns">
                <button
                  v-for="n in 10"
                  :key="n"
                  :class="['rpe-btn', { active: postCompletion.rpe === n }]"
                  @click="postCompletion.rpe = n"
                >{{ n }}</button>
              </div>
            </div>
            <textarea
              v-model="postCompletion.notes"
              class="cp-notes"
              placeholder="How did the workout feel? Any notes…"
              rows="2"
            ></textarea>
            <div class="cp-actions">
              <button class="cp-skip-btn" @click="closePostCompletion">Skip</button>
              <button class="cp-save-btn" @click="savePostCompletion(workout)">Save Note</button>
            </div>
          </div>

          <!-- Adjust panel -->
          <div v-if="adjustOpen.has(workout.id)" class="adjust-panel">
            <div class="ap-title">Adjust Workout</div>
            <div class="ap-fields">
              <div class="ap-field">
                <label class="ap-label">Distance ({{ distLabel }})</label>
                <input
                  v-model.number="adjustForm[workout.id].distance"
                  type="number" min="0" step="0.1"
                  class="ap-input"
                  :placeholder="workout.distanceMeters ? (workout.distanceMeters / (isImperial ? 1609.34 : 1000)).toFixed(1) : '0'"
                />
              </div>
              <div class="ap-field">
                <label class="ap-label">Duration (min)</label>
                <input
                  v-model.number="adjustForm[workout.id].duration"
                  type="number" min="0"
                  class="ap-input"
                  :placeholder="workout.durationMinutes || '0'"
                />
              </div>
            </div>
            <div class="ap-field" style="margin-top:8px">
              <label class="ap-label">Notes / Workout Swap</label>
              <textarea
                v-model="adjustForm[workout.id].description"
                class="ap-textarea"
                rows="2"
                :placeholder="workout.description || 'Describe any changes or substitutions…'"
              ></textarea>
            </div>
            <div class="ap-actions">
              <button class="ap-cancel" @click="toggleAdjust(workout.id)">Cancel</button>
              <button class="ap-save" @click="saveAdjustment(workout)" :disabled="adjustSaving[workout.id]">
                <span v-if="adjustSaving[workout.id]" class="spin me-1">↻</span>
                Save Changes
              </button>
            </div>
          </div>

          </div><!-- /.workout-outer -->
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

  <!-- RPE Bottom Sheet (global, outside workout loop) -->
  <Teleport to="body">
    <Transition name="rpe-sheet">
      <div v-if="postCompletion" class="rpe-sheet-overlay" @click.self="closePostCompletion">
        <div class="rpe-sheet">
          <div class="rpe-sheet-handle"></div>
          <div class="rpe-sheet-header">
            <span class="rpe-sheet-title">How'd it go?</span>
            <button class="rpe-sheet-close" @click="closePostCompletion"><i class="bi bi-x-lg"></i></button>
          </div>
          <div class="rpe-sheet-body">
            <div class="rpe-row">
              <span class="rpe-label">Effort (RPE)</span>
              <div class="rpe-btns">
                <button
                  v-for="n in 10"
                  :key="n"
                  :class="['rpe-btn', { active: postCompletion.rpe === n }]"
                  @click="postCompletion.rpe = n"
                >{{ n }}</button>
              </div>
            </div>
            <textarea
              v-model="postCompletion.notes"
              class="cp-notes"
              placeholder="How did the workout feel? Any notes…"
              rows="3"
            ></textarea>
            <div class="rpe-sheet-actions">
              <button class="cp-skip-btn" @click="closePostCompletion">Skip</button>
              <button class="cp-save-btn" @click="savePostCompletionFromSheet">Save Note</button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
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
  WARMUP:'#767676', EASY:'#767676', AEROBIC:'#0052FF', TEMPO:'#0052FF',
  THRESHOLD:'#000000', VO2MAX:'#000000', INTERVAL:'#000000',
  SPRINT:'#000000', RECOVERY:'#767676', COOLDOWN:'#767676'
}
const stepColor = (t) => STEP_COLORS[t] || '#767676'
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

// Post-completion RPE + notes
const postCompletion = ref(null) // { id, rpe, notes }

// Inline adjust panel
const adjustOpen = ref(new Set())
const adjustForm = ref({})
const adjustSaving = ref({})

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
    EASY: '#767676', TEMPO: '#0052FF', INTERVAL: '#000000',
    LONG_RUN: '#0052FF', RECOVERY: '#767676', REST: '#767676',
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
  BASE: '#767676', BUILD: '#0052FF', PEAK: '#000000', TAPER: '#767676',
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
      postCompletion.value = null
    } else {
      await planStore.completeWorkout(plan.value.id, workout.id)
      workout.completed = true
      workout.skipped = false
      // Open post-completion RPE panel
      postCompletion.value = { id: workout.id, rpe: workout.rpe || null, notes: workout.athleteNotes || '' }
    }
  } catch {
    showToast('Failed to update workout.', 'error')
  } finally {
    delete workoutLoading.value[workout.id]
  }
}

const savePostCompletion = async (workout) => {
  try {
    await planStore.updateWorkout(plan.value.id, workout.id, {
      rpe: postCompletion.value.rpe,
      athleteNotes: postCompletion.value.notes.trim(),
    })
    workout.rpe = postCompletion.value.rpe
    workout.athleteNotes = postCompletion.value.notes.trim()
    showToast('Note saved!', 'success')
  } catch {
    // Non-blocking — note is optional
  }
  postCompletion.value = null
}

const closePostCompletion = () => { postCompletion.value = null }

// Bottom-sheet save: look up the workout by id from the active week data
const savePostCompletionFromSheet = async () => {
  if (!postCompletion.value || !activeWeekData.value) return
  const workout = activeWeekData.value.workouts?.find(w => w.id === postCompletion.value.id)
  if (workout) await savePostCompletion(workout)
  else postCompletion.value = null
}

const openEditNote = (workout) => {
  postCompletion.value = { id: workout.id, rpe: workout.rpe || null, notes: workout.athleteNotes || '' }
}

const skipWorkout = async (workout) => {
  workoutLoading.value[workout.id] = true
  try {
    if (workout.skipped) {
      await planStore.updateWorkout(plan.value.id, workout.id, { skipped: false })
      workout.skipped = false
    } else {
      await planStore.updateWorkout(plan.value.id, workout.id, { skipped: true })
      workout.skipped = true
      postCompletion.value = null
    }
  } catch {
    showToast('Failed to update workout.', 'error')
  } finally {
    delete workoutLoading.value[workout.id]
  }
}

const startWorkout = (workout) => {
  router.push(`/track?planId=${plan.value?.id}&workoutId=${workout.id}`)
}

const toggleAdjust = (workoutId) => {
  const s = new Set(adjustOpen.value)
  if (s.has(workoutId)) {
    s.delete(workoutId)
  } else {
    s.add(workoutId)
    // Pre-fill form with current values
    const workout = activeWeekData.value?.workouts.find(w => w.id === workoutId)
    if (workout) {
      adjustForm.value[workoutId] = {
        distance: workout.distanceMeters ? parseFloat((workout.distanceMeters / (isImperial.value ? 1609.34 : 1000)).toFixed(2)) : '',
        duration: workout.durationMinutes || '',
        description: workout.description || '',
      }
    }
  }
  adjustOpen.value = s
}

const saveAdjustment = async (workout) => {
  adjustSaving.value[workout.id] = true
  const form = adjustForm.value[workout.id] || {}
  try {
    const updates = {}
    if (form.distance !== '' && form.distance != null) {
      updates.distanceMeters = Math.round(form.distance * (isImperial.value ? 1609.34 : 1000))
    }
    if (form.duration !== '' && form.duration != null) {
      updates.durationMinutes = form.duration
    }
    if (form.description !== undefined) {
      updates.description = form.description
    }
    await planStore.updateWorkout(plan.value.id, workout.id, updates)
    if (updates.distanceMeters !== undefined) workout.distanceMeters = updates.distanceMeters
    if (updates.durationMinutes !== undefined) workout.durationMinutes = updates.durationMinutes
    if (updates.description !== undefined) workout.description = updates.description
    toggleAdjust(workout.id)
    showToast('Workout updated.', 'success')
  } catch {
    showToast('Failed to save changes.', 'error')
  } finally {
    delete adjustSaving.value[workout.id]
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

/* Plan detail skeleton */
@keyframes sk-shimmer {
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}
.sk-bar {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 800px 100%;
  animation: sk-shimmer 1.4s infinite linear;
  border-radius: 0;
  height: 16px;
}
.sk-bar-xs  { width: 60px;  height: 12px; }
.sk-bar-sm  { width: 120px; }
.sk-bar-md  { width: 220px; height: 20px; }
.sk-bar-lg  { width: 320px; height: 32px; }
.plan-skeleton { padding-top: var(--nav-h, 64px); }
.sk-header {
  background: #000;
  padding: 40px 24px 36px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.sk-header .sk-bar { filter: brightness(0.4); }
.sk-tabs {
  display: flex;
  gap: 4px;
  padding: 0 24px;
  border-bottom: 1px solid #E5E5E5;
  background: #fff;
}
.sk-tab {
  width: 80px;
  height: 44px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 800px 100%;
  animation: sk-shimmer 1.4s infinite linear;
}
.sk-workouts {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
  padding: 24px;
}
.sk-workout-card {
  border: 1px solid #E5E5E5;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

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
  display: flex; align-items: stretch;
}
.week-jump-today {
  flex-shrink: 0;
  padding: 0 14px;
  border: none; border-right: 1px solid #E5E5E5;
  background: #0052FF; color: #fff;
  font-size: 0.70rem; font-weight: 700; letter-spacing: 0.08em;
  text-transform: uppercase; cursor: pointer; font-family: inherit;
  white-space: nowrap; transition: background 0.15s;
}
.week-jump-today:hover { background: #003ECC; }
.week-tabs { display: flex; padding: 0 24px; gap: 4px; min-width: max-content; flex: 1; }
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

.workout-detail-row { display: flex; align-items: baseline; gap: 8px; margin-bottom: 6px; }
.workout-dist { font-size: 1.5rem; font-weight: 900; letter-spacing: -0.02em; color: rgba(15,18,16,0.90); line-height: 1; }
.workout-dur { font-size: 0.85rem; font-weight: 600; color: rgba(15,18,16,0.50); }
.dur-sep { color: rgba(15,18,16,0.25); margin-right: 4px; }

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

/* Skip button */
.skip-btn {
  width: 28px; height: 28px; margin-top: 6px;
  border: 1px solid rgba(15,18,16,0.14); background: transparent;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; font-size: 0.72rem; color: rgba(15,18,16,0.35);
  transition: all 0.15s;
}
.skip-btn:hover { border-color: #767676; color: #767676; }
.skip-btn--active { background: #767676; border-color: #767676; color: #fff; }
.skip-btn:disabled { opacity: 0.3; cursor: not-allowed; }

/* Skipped card */
.workout-skipped { opacity: 0.5; background: #fafafa; }
.workout-skipped .workout-type { text-decoration: line-through; }

/* Athlete note row */
.athlete-note-row {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  margin-top: 10px; padding-top: 10px;
  border-top: 1px solid rgba(15,18,16,0.06);
}
.rpe-chip {
  font-size: 0.68rem; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase;
  background: rgba(0,82,255,0.08); color: #0052FF; padding: 2px 8px;
}
.athlete-note-text { font-size: 0.82rem; color: rgba(15,18,16,0.55); font-style: italic; flex: 1; min-width: 0; }
.note-edit-btn { background: none; border: none; color: #ccc; font-size: 0.7rem; cursor: pointer; padding: 0 4px; }
.note-edit-btn:hover { color: #767676; }

/* Workout bottom actions */
.workout-bottom-actions {
  display: flex; gap: 8px; margin-top: 12px; padding-top: 10px;
  border-top: 1px solid rgba(15,18,16,0.06);
}
.wba-btn {
  display: inline-flex; align-items: center; gap: 4px;
  background: none; border: 1px solid rgba(15,18,16,0.12);
  font-family: inherit; font-size: 0.72rem; font-weight: 700;
  letter-spacing: 0.05em; text-transform: uppercase;
  color: rgba(15,18,16,0.55); padding: 5px 12px; cursor: pointer;
  transition: all 0.15s;
}
.wba-btn:hover { border-color: #000; color: #000; }
.wba-btn-start {
  background: #0052FF; border-color: #0052FF; color: #fff;
}
.wba-btn-start:hover { background: #003ECC; border-color: #003ECC; color: #fff; }

/* Post-completion panel */
.completion-panel {
  background: #000; color: #fff;
  padding: 20px; display: flex; flex-direction: column; gap: 14px;
  animation: slideDown 0.2s ease;
}
@keyframes slideDown { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
.cp-header { display: flex; align-items: center; justify-content: space-between; }
.cp-title { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(255,255,255,0.6); }
.cp-close { background: none; border: none; color: rgba(255,255,255,0.5); font-size: 1rem; cursor: pointer; padding: 0; }
.cp-close:hover { color: #fff; }
.rpe-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.rpe-label { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(255,255,255,0.55); flex-shrink: 0; }
.rpe-btns { display: flex; gap: 4px; flex-wrap: wrap; }
.rpe-btn {
  width: 30px; height: 30px; border: 1px solid rgba(255,255,255,0.20);
  background: transparent; color: rgba(255,255,255,0.60);
  font-family: inherit; font-size: 0.78rem; font-weight: 700; cursor: pointer;
  transition: all 0.12s;
}
.rpe-btn:hover { border-color: #fff; color: #fff; }
.rpe-btn.active { background: #0052FF; border-color: #0052FF; color: #fff; }
.cp-notes {
  background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.15);
  color: #fff; padding: 10px 12px; font-family: inherit; font-size: 0.85rem;
  resize: none; outline: none; width: 100%; box-sizing: border-box;
}
.cp-notes::placeholder { color: rgba(255,255,255,0.30); }
.cp-notes:focus { border-color: rgba(255,255,255,0.40); }
.cp-actions { display: flex; gap: 10px; justify-content: flex-end; }
.cp-skip-btn {
  background: none; border: 1px solid rgba(255,255,255,0.20); color: rgba(255,255,255,0.55);
  font-family: inherit; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.06em;
  text-transform: uppercase; padding: 8px 16px; cursor: pointer;
}
.cp-save-btn {
  background: #0052FF; border: none; color: #fff;
  font-family: inherit; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.06em;
  text-transform: uppercase; padding: 8px 20px; cursor: pointer;
}
.cp-save-btn:hover { background: #003ECC; }

/* Adjust panel */
.adjust-panel {
  background: #fff; border: 1px solid #E5E5E5; border-top: none;
  padding: 18px 20px; display: flex; flex-direction: column; gap: 10px;
}
.ap-title { font-size: 0.68rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #767676; margin-bottom: 4px; }
.ap-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.ap-field { display: flex; flex-direction: column; gap: 4px; }
.ap-label { font-size: 0.68rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #999; }
.ap-input {
  height: 38px; border: 1px solid #E5E5E5; padding: 0 10px;
  font-family: inherit; font-size: 0.88rem; outline: none;
}
.ap-input:focus { border-color: #000; }
.ap-textarea {
  border: 1px solid #E5E5E5; padding: 8px 10px; font-family: inherit;
  font-size: 0.85rem; outline: none; resize: none; width: 100%; box-sizing: border-box;
}
.ap-textarea:focus { border-color: #000; }
.ap-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 4px; }
.ap-cancel {
  background: none; border: 1px solid #E5E5E5; color: #767676;
  font-family: inherit; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.06em;
  text-transform: uppercase; padding: 8px 16px; cursor: pointer;
}
.ap-save {
  background: #0052FF; border: none; color: #fff;
  font-family: inherit; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.06em;
  text-transform: uppercase; padding: 8px 20px; cursor: pointer;
  display: inline-flex; align-items: center;
}
.ap-save:hover:not(:disabled) { background: #003ECC; }
.ap-save:disabled { opacity: 0.5; cursor: not-allowed; }

/* Workout outer wrapper */
.workout-outer { display: flex; flex-direction: column; }

/* Spin */
.spin { animation: spin 0.8s linear infinite; display: inline-block; }
.me-1 { margin-right: 4px; }
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

/* ── RPE Bottom Sheet ── */
.rpe-sheet-overlay {
  position: fixed; inset: 0; z-index: 2000;
  background: rgba(0,0,0,0.50);
  display: flex; align-items: flex-end;
}
.rpe-sheet {
  width: 100%; background: #000; color: #fff;
  border-radius: 0; padding-bottom: env(safe-area-inset-bottom, 0px);
}
.rpe-sheet-handle {
  width: 36px; height: 4px; background: rgba(255,255,255,0.25);
  margin: 12px auto 0; border-radius: 2px;
}
.rpe-sheet-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 24px 8px;
}
.rpe-sheet-title {
  font-size: 0.72rem; font-weight: 900; letter-spacing: 0.16em; text-transform: uppercase; color: rgba(255,255,255,0.6);
}
.rpe-sheet-close {
  background: none; border: none; color: rgba(255,255,255,0.5); font-size: 1rem; cursor: pointer; padding: 0;
}
.rpe-sheet-close:hover { color: #fff; }
.rpe-sheet-body { padding: 8px 24px 24px; display: flex; flex-direction: column; gap: 14px; }
.rpe-sheet-actions { display: flex; gap: 10px; justify-content: flex-end; }

/* Bottom sheet slide-up transition */
.rpe-sheet-enter-active, .rpe-sheet-leave-active { transition: all 0.28s cubic-bezier(0.32, 0.72, 0, 1); }
.rpe-sheet-enter-from, .rpe-sheet-leave-to { opacity: 0; }
.rpe-sheet-enter-from .rpe-sheet, .rpe-sheet-leave-to .rpe-sheet { transform: translateY(100%); }
.rpe-sheet-enter-active .rpe-sheet, .rpe-sheet-leave-active .rpe-sheet { transition: transform 0.28s cubic-bezier(0.32, 0.72, 0, 1); }
</style>
