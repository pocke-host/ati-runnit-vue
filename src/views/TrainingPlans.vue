<!-- src/views/TrainingPlans.vue -->
<template>
  <main class="plans-page">
    <!-- HERO -->
    <section class="hero">
      <div class="container-xxl">
        <p class="eyebrow">Train smarter.</p>
        <h1 class="fw-bold mb-2">Training Plans</h1>
        <p class="lead m-0">Periodized plans powered by sport science — built around your race date and fitness.</p>
      </div>
    </section>

    <!-- Status Toast -->
    <div v-if="statusMessage" :class="['status-toast', statusType]">
      <i :class="statusType === 'success' ? 'bi bi-check-circle-fill' : 'bi bi-exclamation-circle-fill'"></i>
      {{ statusMessage }}
    </div>

    <div class="plans-body container-xxl">

      <!-- ── MY PLANS ───────────────────────────────── -->
      <section v-if="plans.length > 0" class="my-plans-section">
        <div class="section-header">
          <h2 class="section-title">My Plans</h2>
        </div>
        <div class="plans-grid">
          <article
            v-for="plan in plans"
            :key="plan.id"
            :class="['plan-card', { 'plan-card-active': plan.isActive }]"
            @click="router.push(`/plans/${plan.id}`)"
          >
            <div class="plan-card-top">
              <div class="plan-sport-icon">{{ getSportIcon(plan.sport) }}</div>
              <div class="plan-badges">
                <span class="plan-badge plan-badge-level" :class="plan.level">{{ plan.level }}</span>
                <span v-if="plan.isActive" class="plan-badge plan-badge-active">Active</span>
              </div>
            </div>
            <div class="plan-card-body">
              <h3 class="plan-name">{{ plan.name }}</h3>
              <p class="plan-meta">{{ plan.sport }} · {{ plan.totalWeeks }} weeks · {{ plan.daysPerWeek }}x/week</p>
              <div class="plan-progress-wrap">
                <div class="plan-progress-label">
                  <span>Week {{ currentWeekOf(plan) }} of {{ plan.totalWeeks }}</span>
                  <span>{{ planProgressPct(plan) }}%</span>
                </div>
                <div class="plan-progress-bar">
                  <div class="plan-progress-fill" :style="{ width: planProgressPct(plan) + '%' }"></div>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      <!-- ── START A NEW PLAN ───────────────────────── -->
      <section class="new-plan-section">
        <div class="section-header">
          <h2 class="section-title">{{ plans.length ? 'Start Another Plan' : 'Start Your First Plan' }}</h2>
          <p class="section-sub">Five steps to a fully personalized, periodized training plan.</p>
        </div>

        <!-- ── WIZARD ── -->
        <div class="wizard">

          <!-- Step indicator -->
          <div class="wizard-steps-bar">
            <div
              v-for="(stepLabel, idx) in stepLabels"
              :key="idx"
              :class="['wsb-step', { active: wizardStep === idx + 1, done: wizardStep > idx + 1 }]"
            >
              <div class="wsb-dot">
                <i v-if="wizardStep > idx + 1" class="bi bi-check-lg"></i>
                <span v-else>{{ idx + 1 }}</span>
              </div>
              <div class="wsb-label">{{ stepLabel }}</div>
            </div>
          </div>

          <!-- Step 1: Goal -->
          <Transition name="fade-slide" mode="out-in">
            <div v-if="wizardStep === 1" key="s1" class="wizard-content">
              <div class="step-label">What's your goal?</div>
              <div class="goal-tabs">
                <button
                  v-for="g in goals"
                  :key="g.key"
                  :class="['goal-tab', { active: selectedGoal === g.key }]"
                  @click="selectedGoal = g.key"
                >
                  <span class="goal-emoji">{{ g.emoji }}</span>
                  <span class="goal-name">{{ g.label }}</span>
                </button>
              </div>
              <div class="wizard-nav">
                <button class="btn btn-primary" @click="wizardStep = 2" :disabled="!selectedGoal">
                  Next <i class="bi bi-arrow-right ms-1"></i>
                </button>
              </div>
            </div>

            <!-- Step 2: Race Date -->
            <div v-else-if="wizardStep === 2" key="s2" class="wizard-content">
              <div class="step-label">When's your target race?</div>

              <div class="fitness-toggle-row">
                <label class="fitness-toggle">
                  <input type="checkbox" v-model="justBuildingFitness" @change="onJustFitnessToggle" />
                  <span class="toggle-track"></span>
                  <span class="toggle-label">Just building fitness (no race date)</span>
                </label>
              </div>

              <div v-if="!justBuildingFitness" class="field-group">
                <label class="field-label">Target race date</label>
                <input
                  type="date"
                  class="field-input"
                  v-model="targetRaceDate"
                  :min="minRaceDate"
                />
                <div v-if="computedTotalWeeks > 0" class="field-hint">
                  <i class="bi bi-calendar3 me-1"></i>
                  Plan will be approximately <strong>{{ computedTotalWeeks }} weeks</strong>
                  <span v-if="computedTotalWeeks < 8" class="hint-warn"> (consider a longer runway)</span>
                </div>
              </div>

              <div v-else class="field-hint mt-2">
                <i class="bi bi-calendar3 me-1"></i>
                We'll build a <strong>12-week</strong> base fitness block.
              </div>

              <div class="wizard-nav">
                <button class="btn btn-ghost" @click="wizardStep = 1">
                  <i class="bi bi-arrow-left me-1"></i> Back
                </button>
                <button class="btn btn-primary" @click="wizardStep = 3" :disabled="!targetRaceDate && !justBuildingFitness">
                  Next <i class="bi bi-arrow-right ms-1"></i>
                </button>
              </div>
            </div>

            <!-- Step 3: Current Fitness -->
            <div v-else-if="wizardStep === 3" key="s3" class="wizard-content">
              <div class="step-label">Tell us about your current fitness</div>

              <div class="field-group">
                <label class="field-label">Weekly {{ distanceUnit }} (current training)</label>
                <div class="field-input-row">
                  <input
                    type="number"
                    class="field-input"
                    v-model.number="weeklyMileageInput"
                    min="0"
                    max="200"
                    placeholder="e.g. 25"
                    style="max-width: 160px"
                  />
                  <span class="field-unit">{{ distanceUnit }}/week</span>
                </div>
                <div class="level-derived" v-if="weeklyMileageInput > 0">
                  <span class="level-chip" :class="derivedLevel">{{ derivedLevelLabel }}</span>
                  level based on your mileage
                </div>
              </div>

              <div class="field-group">
                <label class="field-label">Recent 5K time <span class="optional-label">(optional — enables pace targets)</span></label>
                <div class="field-input-row">
                  <input
                    type="text"
                    class="field-input"
                    v-model="recentRaceTimeInput"
                    placeholder="mm:ss  e.g. 25:00"
                    style="max-width: 160px"
                  />
                </div>
                <div class="field-hint" v-if="targetSeconds">
                  <i class="bi bi-stopwatch me-1"></i>
                  Pace targets will be calculated for all workout types.
                </div>
              </div>

              <div class="wizard-nav">
                <button class="btn btn-ghost" @click="wizardStep = 2">
                  <i class="bi bi-arrow-left me-1"></i> Back
                </button>
                <button class="btn btn-primary" @click="wizardStep = 4" :disabled="weeklyMileageInput <= 0">
                  Next <i class="bi bi-arrow-right ms-1"></i>
                </button>
              </div>
            </div>

            <!-- Step 4: Schedule -->
            <div v-else-if="wizardStep === 4" key="s4" class="wizard-content">
              <div class="step-label">Which days can you train?</div>
              <div class="days-grid">
                <button
                  v-for="day in allDays"
                  :key="day"
                  :class="['day-btn', { active: availableDays.has(day) }]"
                  @click="toggleDay(day)"
                >
                  <span class="day-abbr">{{ day.slice(0, 3) }}</span>
                  <span class="day-full">{{ day }}</span>
                </button>
              </div>
              <div class="field-hint mt-2" :class="{ 'hint-warn': availableDays.size < 3 }">
                <i class="bi bi-info-circle me-1"></i>
                {{ availableDays.size }} days selected · Minimum 3 required
              </div>

              <div class="wizard-nav">
                <button class="btn btn-ghost" @click="wizardStep = 3">
                  <i class="bi bi-arrow-left me-1"></i> Back
                </button>
                <button class="btn btn-primary" @click="goToPreview" :disabled="availableDays.size < 3">
                  Preview Plan <i class="bi bi-arrow-right ms-1"></i>
                </button>
              </div>
            </div>

            <!-- Step 5: Preview -->
            <div v-else-if="wizardStep === 5 && preview" key="s5" class="wizard-content">
              <div class="step-label">Your personalized plan</div>

              <div class="preview-card">
                <!-- Plan header -->
                <div class="preview-header">
                  <div class="preview-title-row">
                    <h3 class="preview-name">{{ preview.name }}</h3>
                    <span class="engine-badge">
                      <i class="bi bi-graph-up me-1"></i>Periodized
                    </span>
                  </div>
                  <div class="preview-meta-row">
                    <span><i class="bi bi-calendar3 me-1"></i>{{ preview.totalWeeks }} weeks</span>
                    <span><i class="bi bi-repeat me-1"></i>{{ availableDays.size }}x per week</span>
                    <span><i class="bi bi-flag me-1"></i>Starts {{ formatDateShort(startDate) }}</span>
                  </div>
                </div>

                <!-- Phase breakdown -->
                <div class="phase-breakdown">
                  <div class="phase-strip" title="Base phase" style="background:#22c55e">
                    <span class="phase-strip-label">Base</span>
                    <span class="phase-strip-weeks">{{ preview.phaseBreakdown.base }}w</span>
                  </div>
                  <div class="phase-strip" title="Build phase" style="background:#f97316">
                    <span class="phase-strip-label">Build</span>
                    <span class="phase-strip-weeks">{{ preview.phaseBreakdown.build }}w</span>
                  </div>
                  <div class="phase-strip" title="Peak phase" style="background:#ef4444">
                    <span class="phase-strip-label">Peak</span>
                    <span class="phase-strip-weeks">{{ preview.phaseBreakdown.peak }}w</span>
                  </div>
                  <div v-if="preview.phaseBreakdown.taper > 0" class="phase-strip" title="Taper" style="background:#3b82f6">
                    <span class="phase-strip-label">Taper</span>
                    <span class="phase-strip-weeks">{{ preview.phaseBreakdown.taper }}w</span>
                  </div>
                </div>

                <!-- Sample week 1 -->
                <div class="preview-week">
                  <div class="preview-week-label">Week 1 — {{ preview.weeks[0]?.theme }}</div>
                  <div class="preview-workouts">
                    <div
                      v-for="wo in preview.weeks[0]?.workouts"
                      :key="wo.dayLabel"
                      :class="['preview-workout', { 'is-rest': wo.workoutType === 'REST' }]"
                    >
                      <div class="wo-day">{{ wo.dayLabel }}</div>
                      <div class="wo-type-chip" :style="{ background: typeChipColor(wo.workoutType) }">
                        {{ wo.workoutType }}
                      </div>
                      <div class="wo-name">{{ wo.type }}</div>
                      <div class="wo-detail" v-if="wo.workoutType !== 'REST'">
                        {{ formatDistance(wo.distanceMeters) }} · {{ wo.durationMinutes }}min
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Start date -->
                <div class="preview-start">
                  <label class="start-label">Start date</label>
                  <input type="date" class="start-input" v-model="startDate" :min="todayStr()" @change="rebuildPreview" />
                </div>

                <!-- Actions -->
                <div class="preview-actions">
                  <button class="btn btn-ghost" @click="wizardStep = 4">
                    <i class="bi bi-arrow-left me-1"></i> Back
                  </button>
                  <button class="btn btn-primary" @click="confirmCreate" :disabled="creating">
                    <span v-if="creating" class="spinner-border spinner-border-sm me-2"></span>
                    Create Plan
                  </button>
                </div>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Loading state -->
        <AppSpinner v-if="plansLoading" label="Loading plans…" />

        <!-- Empty state (no plans + wizard at step 1 + not loading) -->
        <EmptyState
          v-else-if="!plans.length && wizardStep === 1 && !selectedGoal"
          icon="bi-calendar3"
          title="No plans yet"
          message="Build a personalized periodized plan in 5 steps."
        />
      </section>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePlanStore } from '@/stores/plan.js'
import { storeToRefs } from 'pinia'
import { useUnits } from '@/composables/useUnits'
import { useAuthStore } from '@/stores/auth.js'
import AppSpinner from '@/components/AppSpinner.vue'
import EmptyState from '@/components/EmptyState.vue'

const router = useRouter()
const planStore = usePlanStore()
const authStore = useAuthStore()
const { plans } = storeToRefs(planStore)
const { formatDistance } = useUnits()
const { unitSystem } = storeToRefs(authStore)

// ── Status ──────────────────────────────────────────
const statusMessage = ref('')
const statusType = ref('success')
let statusTimer = null
const showStatus = (msg, type = 'success') => {
  clearTimeout(statusTimer)
  statusMessage.value = msg
  statusType.value = type
  statusTimer = setTimeout(() => { statusMessage.value = '' }, 4000)
}

// ── Wizard state ────────────────────────────────────
const wizardStep = ref(1)
const stepLabels = ['Goal', 'Race Date', 'Fitness', 'Schedule', 'Preview']

const selectedGoal = ref(null)
const targetRaceDate = ref('')
const justBuildingFitness = ref(false)
const weeklyMileageInput = ref(0)
const recentRaceTimeInput = ref('')
const availableDays = ref(new Set(['Monday', 'Wednesday', 'Thursday', 'Saturday', 'Sunday']))
const startDate = ref(nextMonday())
const preview = ref(null)
const creating = ref(false)

// ── Units ───────────────────────────────────────────
const distanceUnit = computed(() => unitSystem.value === 'imperial' ? 'mi' : 'km')
const metersPerUnit = computed(() => unitSystem.value === 'imperial' ? 1609.344 : 1000)
const currentWeeklyMeters = computed(() =>
  Math.round((weeklyMileageInput.value || 0) * metersPerUnit.value)
)

// ── Race time parsing ────────────────────────────────
const targetSeconds = computed(() => {
  const t = recentRaceTimeInput.value.trim()
  if (!t) return null
  const parts = t.split(':').map(Number)
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return parts[0] * 60 + parts[1]
  }
  if (parts.length === 3 && parts.every(p => !isNaN(p))) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2]
  }
  return null
})

// ── Derived level ────────────────────────────────────
const derivedLevel = computed(() => {
  const miles = unitSystem.value === 'imperial'
    ? weeklyMileageInput.value
    : weeklyMileageInput.value * 0.621371
  if (miles < 20) return 'beginner'
  if (miles < 40) return 'intermediate'
  return 'advanced'
})
const derivedLevelLabel = computed(() => {
  const m = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' }
  return m[derivedLevel.value]
})

// ── Date helpers ─────────────────────────────────────
function nextMonday() {
  const d = new Date()
  const day = d.getDay()
  const diff = day === 0 ? 1 : 8 - day
  const mon = new Date(d.getTime() + diff * 86400000)
  return mon.toISOString().slice(0, 10)
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

const minRaceDate = computed(() => {
  const d = new Date(startDate.value || todayStr())
  d.setDate(d.getDate() + 28) // minimum 4 weeks
  return d.toISOString().slice(0, 10)
})

const computedTotalWeeks = computed(() => {
  if (!targetRaceDate.value || !startDate.value) return 0
  const s = new Date(startDate.value)
  const e = new Date(targetRaceDate.value)
  return Math.max(4, Math.round((e - s) / (7 * 86400000)))
})

function formatDateShort(str) {
  if (!str) return '—'
  return new Date(str + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function onJustFitnessToggle() {
  if (justBuildingFitness.value) {
    const d = new Date()
    d.setDate(d.getDate() + 84)
    targetRaceDate.value = d.toISOString().slice(0, 10)
  } else {
    targetRaceDate.value = ''
  }
}

// ── Goals & constants ────────────────────────────────
const goals = [
  { key: '5k',       label: '5K',           emoji: '🏃', sport: 'Running' },
  { key: '10k',      label: '10K',          emoji: '🏃', sport: 'Running' },
  { key: 'half',     label: 'Half Marathon', emoji: '🏅', sport: 'Running' },
  { key: 'marathon', label: 'Marathon',     emoji: '🎽', sport: 'Running' },
  { key: 'cycling',  label: 'Cycling Base', emoji: '🚴', sport: 'Cycling' },
  { key: 'swim',     label: 'Swim Fitness', emoji: '🏊', sport: 'Swimming' },
]

const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function toggleDay(day) {
  if (availableDays.value.has(day)) {
    if (availableDays.value.size > 3) {
      availableDays.value.delete(day)
    }
  } else {
    availableDays.value.add(day)
  }
}

// ── Periodization engine ─────────────────────────────

const WORKOUT_DESCS = {
  EASY:     'Conversational pace, HR zone 2. Focus on easy effort.',
  TEMPO:    'Comfortably hard. Sustained effort at lactate threshold.',
  LONG_RUN: 'Slow and steady. The cornerstone of endurance training.',
  INTERVAL: 'Short, hard efforts with recovery. Builds speed and VO2max.',
  RECOVERY: 'Very easy pace. Active recovery between hard sessions.',
}
const CYCLING_DESCS = {
  EASY: 'Steady aerobic effort, HR zone 2.', TEMPO: 'Sustained hard effort at threshold power.',
  INTERVAL: 'Hard efforts above threshold, full recovery between.',
  LONG_RUN: 'Long slow distance. Build endurance base.', RECOVERY: 'Very easy spinning. Flush the legs.',
}
const SWIM_DESCS = {
  EASY: 'Steady aerobic effort, consistent pace.', TEMPO: 'Sustained moderate-hard effort.',
  INTERVAL: 'Hard efforts with rest. Build speed and efficiency.',
  LONG_RUN: 'Extended distance at comfortable pace.', RECOVERY: 'Easy technique focus.',
}

function getWorkoutDesc(wType, sport) {
  if (sport === 'Cycling') return CYCLING_DESCS[wType] || ''
  if (sport === 'Swimming') return SWIM_DESCS[wType] || ''
  return WORKOUT_DESCS[wType] || ''
}

function getTypeDisplay(wType, sport) {
  if (sport === 'Cycling') {
    return { EASY: 'Endurance Ride', TEMPO: 'Tempo Ride', INTERVAL: 'Interval Ride', LONG_RUN: 'Long Ride', RECOVERY: 'Recovery Ride', REST: 'Rest' }[wType] || wType
  }
  if (sport === 'Swimming') {
    return { EASY: 'Endurance Swim', TEMPO: 'Tempo Swim', INTERVAL: 'Interval Swim', LONG_RUN: 'Long Swim', RECOVERY: 'Recovery Swim', REST: 'Rest' }[wType] || wType
  }
  return { EASY: 'Easy Run', TEMPO: 'Tempo Run', INTERVAL: 'Interval', LONG_RUN: 'Long Run', RECOVERY: 'Recovery Run', REST: 'Rest' }[wType] || wType
}

function computePaceTarget(wType) {
  if (!targetSeconds.value || targetSeconds.value <= 0) return null
  // Treat recent race time as 5K time → s/km
  const paceSkm = targetSeconds.value / 5
  switch (wType) {
    case 'EASY':     return Math.round(paceSkm + 120)
    case 'TEMPO':    return Math.round(paceSkm + 30)
    case 'INTERVAL': return Math.round(paceSkm - 10)
    case 'LONG_RUN': return Math.round(paceSkm + 100)
    default:         return null
  }
}

function assignWorkoutTypes(numDays, phase) {
  const assignments = new Array(numDays).fill('EASY')
  if (numDays === 0) return []

  assignments[numDays - 1] = 'LONG_RUN'

  if (phase === 'BUILD' || phase === 'PEAK') {
    if (numDays >= 3) {
      const midIdx = Math.floor(numDays / 2)
      assignments[midIdx] = 'INTERVAL'
      if (numDays >= 4) {
        // Find TEMPO slot not adjacent to INTERVAL or LONG_RUN
        let placed = false
        for (let i = 1; i < numDays - 1 && !placed; i++) {
          if (assignments[i] === 'EASY' && Math.abs(i - midIdx) > 1) {
            assignments[i] = 'TEMPO'
            placed = true
          }
        }
        if (!placed) {
          for (let i = 1; i < numDays - 1 && !placed; i++) {
            if (assignments[i] === 'EASY') { assignments[i] = 'TEMPO'; placed = true }
          }
        }
      }
    }
  } else if (phase === 'TAPER') {
    if (numDays >= 2) {
      assignments[Math.min(1, numDays - 2)] = 'TEMPO'
    }
  }
  // BASE: EASY + LONG_RUN only
  return assignments
}

function generatePlanWeeks() {
  const goalDef = goals.find(g => g.key === selectedGoal.value)
  if (!goalDef) return []
  const sport = goalDef.sport

  const totalWeeks = computedTotalWeeks.value
  const baseWks  = Math.ceil(totalWeeks * 0.40)
  const buildWks = Math.ceil(totalWeeks * 0.35)
  const peakWks  = Math.ceil(totalWeeks * 0.15)
  const taperWks = Math.max(0, totalWeeks - baseWks - buildWks - peakWks)

  const dayOrder = allDays
  const sortedDays = [...availableDays.value].sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b))
  const numDays = sortedDays.length

  // Build volume array (10% rule)
  const volumes = []
  let vol = currentWeeklyMeters.value || 30000
  let maxVol = vol
  const taperStart = baseWks + buildWks + peakWks

  for (let w = 0; w < totalWeeks; w++) {
    if (w >= taperStart) { volumes.push(-1); continue }
    const isCutback = (w + 1) % 4 === 0
    if (isCutback) {
      const cutVol = Math.round(vol * 0.70)
      volumes.push(cutVol)
      vol = Math.round(cutVol * 1.10)
    } else {
      volumes.push(vol)
      maxVol = Math.max(maxVol, vol)
      vol = Math.round(vol * 1.10)
    }
  }

  const taperFactors = [0.80, 0.60, 0.40]
  for (let i = 0; i < taperWks; i++) {
    volumes[taperStart + i] = Math.round(maxVol * (taperFactors[i] ?? 0.40))
  }

  const weeks = []
  for (let w = 0; w < totalWeeks; w++) {
    const weekNum = w + 1
    const weekVol = volumes[w] || currentWeeklyMeters.value || 30000

    let phase, theme
    if (weekNum <= baseWks) {
      phase = 'BASE'; theme = weekNum % 4 === 0 ? 'Recovery' : 'Base Building'
    } else if (weekNum <= baseWks + buildWks) {
      phase = 'BUILD'; theme = weekNum % 4 === 0 ? 'Recovery' : 'Build Phase'
    } else if (weekNum <= baseWks + buildWks + peakWks) {
      phase = 'PEAK'; theme = 'Peak Week'
    } else {
      phase = 'TAPER'; theme = weekNum === totalWeeks ? 'Race Week' : 'Taper'
    }

    const workoutTypes = assignWorkoutTypes(numDays, phase)
    const distPerDay = weekVol / numDays

    const workouts = sortedDays.map((dayLabel, i) => {
      const wType = workoutTypes[i]
      const distFactor = wType === 'LONG_RUN' ? 1.8
                       : (wType === 'EASY' || wType === 'RECOVERY') ? 0.8
                       : 1.1
      const dist = Math.max(0, Math.round(distPerDay * distFactor / 500) * 500)
      const paceMinKm = wType === 'LONG_RUN' ? 7 : wType === 'EASY' ? 6.5
                     : wType === 'RECOVERY' ? 7.5 : wType === 'TEMPO' ? 5.5 : 4.8
      const duration = Math.max(20, Math.round(dist / 1000 * paceMinKm))

      return {
        id: `${weekNum}-${i}`,
        dayLabel,
        day: i + 1,
        type: getTypeDisplay(wType, sport),
        workoutType: wType,
        distanceMeters: dist,
        durationMinutes: duration,
        description: getWorkoutDesc(wType, sport),
        targetPaceSeconds: computePaceTarget(wType),
        completed: false,
      }
    })

    weeks.push({ weekNumber: weekNum, theme, phase, workouts })
  }

  return weeks
}

// ── Wizard navigation ────────────────────────────────

function goToPreview() {
  rebuildPreview()
  wizardStep.value = 5
}

function rebuildPreview() {
  if (!selectedGoal.value || !targetRaceDate.value) return
  const goalDef = goals.find(g => g.key === selectedGoal.value)
  const weeks = generatePlanWeeks()
  const totalWeeks = computedTotalWeeks.value
  const baseWks  = Math.ceil(totalWeeks * 0.40)
  const buildWks = Math.ceil(totalWeeks * 0.35)
  const peakWks  = Math.ceil(totalWeeks * 0.15)
  const taperWks = Math.max(0, totalWeeks - baseWks - buildWks - peakWks)

  const levelLabel = derivedLevelLabel.value
  preview.value = {
    name: `${goalDef.label} — ${levelLabel}`,
    sport: goalDef.sport,
    goal: goalDef.label,
    totalWeeks,
    phaseBreakdown: { base: baseWks, build: buildWks, peak: peakWks, taper: taperWks },
    weeks,
  }
}

async function confirmCreate() {
  if (!preview.value || creating.value) return
  creating.value = true
  try {
    const flatWorkouts = preview.value.weeks.flatMap(week =>
      week.workouts.map(wo => ({
        weekNumber: week.weekNumber,
        day: wo.day,
        title: wo.dayLabel,
        description: wo.description,
        workoutType: wo.workoutType,
        distanceMeters: wo.distanceMeters,
        durationMinutes: wo.durationMinutes,
        targetPaceSeconds: wo.targetPaceSeconds || null,
      }))
    )

    const payload = {
      name: preview.value.name,
      sport: preview.value.sport,
      goal: preview.value.goal,
      level: derivedLevel.value,
      totalWeeks: preview.value.totalWeeks,
      daysPerWeek: availableDays.value.size,
      startDate: startDate.value,
      targetRaceDate: targetRaceDate.value,
      currentWeeklyMeters: currentWeeklyMeters.value,
      targetSeconds: targetSeconds.value || null,
      isActive: plans.value.length === 0,
      workouts: flatWorkouts,
    }

    const created = await planStore.createPlan(payload)
    showStatus(`"${created.name}" created!`)
    // Reset wizard
    wizardStep.value = 1
    selectedGoal.value = null
    targetRaceDate.value = ''
    preview.value = null
    weeklyMileageInput.value = 0
    recentRaceTimeInput.value = ''
    availableDays.value = new Set(['Monday', 'Wednesday', 'Thursday', 'Saturday', 'Sunday'])
    router.push(`/plans/${created.id}`)
  } catch {
    showStatus('Failed to create plan. Try again.', 'error')
  } finally {
    creating.value = false
  }
}

// ── Plan card helpers ────────────────────────────────

function getSportIcon(sport) {
  return { Running: '🏃', Cycling: '🚴', Swimming: '🏊', Hiking: '🥾', Walking: '🚶' }[sport] || '🏋️'
}

function currentWeekOf(plan) {
  if (!plan.startDate) return 1
  const diff = Math.floor((Date.now() - new Date(plan.startDate).getTime()) / (7 * 86400000))
  return Math.min(Math.max(diff + 1, 1), plan.totalWeeks)
}

function planProgressPct(plan) {
  return Math.round((currentWeekOf(plan) / plan.totalWeeks) * 100)
}

// ── Chip colors ──────────────────────────────────────

function typeChipColor(wType) {
  return {
    EASY: '#22c55e', TEMPO: '#f97316', INTERVAL: '#ef4444',
    LONG_RUN: '#8b5cf6', RECOVERY: '#06b6d4', REST: '#e5e7eb',
  }[wType] || '#767676'
}

const plansLoading = ref(false)

onMounted(async () => {
  plansLoading.value = true
  try {
    await planStore.fetchPlans()
  } finally {
    plansLoading.value = false
  }
})
</script>

<style scoped>
.plans-page {
  padding-top: var(--nav-h, 64px);
  min-height: calc(100vh - var(--nav-h, 64px));
  background: #fff;
  font-family: Futura, "Futura PT", "Futura Std", "Avenir Next", Avenir, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
}

/* Hero */
.hero {
  padding: 42px 0 22px;
  border-bottom: 1px solid rgba(15,18,16,0.08);
  background: #000;
  color: white;
}
.eyebrow { font-size: 0.75rem; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: rgba(255,255,255,0.75); margin-bottom: 8px; }
.hero .lead { color: rgba(255,255,255,0.76); }

/* Status Toast */
.status-toast {
  position: fixed; top: 90px; right: 24px; z-index: 9000;
  display: flex; align-items: center; gap: 10px;
  padding: 14px 20px; border-radius: 0;
  font-weight: 700; font-size: 0.9rem; box-shadow: none;
  animation: slideInRight 0.3s ease;
}
.status-toast.success { background: #047857; color: white; }
.status-toast.error   { background: #dc2626; color: white; }
@keyframes slideInRight { from { opacity:0; transform:translateX(30px); } to { opacity:1; transform:translateX(0); } }

/* Body */
.plans-body { padding: 36px 24px 80px; display: flex; flex-direction: column; gap: 48px; }

/* Section headers */
.section-header { margin-bottom: 20px; }
.section-title { font-weight: 900; font-size: 1.4rem; color: rgba(15,18,16,0.92); margin: 0 0 4px; }
.section-sub { color: rgba(15,18,16,0.55); font-size: 0.92rem; margin: 0; }

/* My Plans Grid */
.plans-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
.plan-card {
  background: white; border: 1px solid #E5E5E5; border-radius: 0; padding: 24px;
  cursor: pointer; transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.plan-card:hover { transform: none; }
.plan-card-active { border-color: #767676; }
.plan-card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }
.plan-sport-icon { font-size: 2.2rem; }
.plan-badges { display: flex; gap: 6px; flex-wrap: wrap; justify-content: flex-end; }
.plan-badge { padding: 4px 10px; border-radius: 0; font-size: 0.72rem; font-weight: 700; text-transform: capitalize; }
.plan-badge-level.beginner     { background: #f0f0f0; color: #555; }
.plan-badge-level.intermediate { background: #1a1a1a; color: #fff; }
.plan-badge-level.advanced     { background: #000; color: #fff; }
.plan-badge-active { background: rgba(0,0,0,0.08); color: #000; }
.plan-name { font-weight: 900; font-size: 1.05rem; margin: 0 0 4px; color: rgba(15,18,16,0.92); }
.plan-meta { font-size: 0.82rem; color: rgba(15,18,16,0.55); margin: 0 0 14px; }
.plan-progress-label { display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 700; color: rgba(15,18,16,0.65); margin-bottom: 6px; }
.plan-progress-bar { height: 6px; background: rgba(15,18,16,0.08); border-radius: 0; overflow: hidden; }
.plan-progress-fill { height: 100%; background: #000; border-radius: 0; transition: width 0.5s; }

/* Wizard */
.new-plan-section { max-width: 860px; }
.wizard { background: white; border: 1px solid #E5E5E5; border-radius: 0; overflow: hidden; }

/* Step indicator bar */
.wizard-steps-bar {
  display: flex; background: #f8f8f8; border-bottom: 1px solid #E5E5E5; padding: 20px 28px; gap: 0;
}
.wsb-step {
  display: flex; align-items: center; gap: 8px; flex: 1;
  color: rgba(15,18,16,0.35); font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;
}
.wsb-step:not(:last-child)::after {
  content: ''; flex: 1; height: 1px; background: rgba(15,18,16,0.12); margin: 0 8px;
}
.wsb-dot {
  width: 26px; height: 26px; border-radius: 0; border: 2px solid rgba(15,18,16,0.18);
  display: flex; align-items: center; justify-content: center; font-size: 0.78rem; font-weight: 900;
  flex-shrink: 0; background: white;
}
.wsb-step.active { color: #000; }
.wsb-step.active .wsb-dot { border-color: #000; background: #000; color: white; }
.wsb-step.done { color: rgba(15,18,16,0.55); }
.wsb-step.done .wsb-dot { border-color: #22c55e; background: #22c55e; color: white; }
.wsb-label { display: none; }
@media (min-width: 580px) { .wsb-label { display: inline; } }

/* Wizard content */
.wizard-content { padding: 32px 28px; }
.step-label { font-size: 0.75rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.12em; color: rgba(15,18,16,0.50); margin-bottom: 18px; }

/* Goal tabs */
.goal-tabs { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 28px; }
.goal-tab {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  padding: 16px 20px; min-width: 90px;
  background: white; border: 2px solid rgba(15,18,16,0.10);
  border-radius: 0; cursor: pointer; transition: all 0.2s; font-family: inherit;
}
.goal-tab:hover { border-color: rgba(15,18,16,0.22); transform: translateY(-1px); }
.goal-tab.active { border-color: #000; background: rgba(0,0,0,0.04); }
.goal-emoji { font-size: 1.8rem; }
.goal-name { font-weight: 700; font-size: 0.85rem; color: rgba(15,18,16,0.85); white-space: nowrap; }

/* Field groups */
.field-group { margin-bottom: 24px; }
.field-label { display: block; font-weight: 700; font-size: 0.88rem; color: rgba(15,18,16,0.75); margin-bottom: 8px; }
.field-input {
  padding: 10px 14px; border: 1px solid #E5E5E5; border-radius: 0;
  font-family: inherit; font-size: 0.95rem; background: #fff; cursor: text; width: 100%;
}
.field-input:focus { outline: none; border-color: #767676; }
.field-input-row { display: flex; align-items: center; gap: 10px; }
.field-unit { font-size: 0.9rem; font-weight: 700; color: rgba(15,18,16,0.55); white-space: nowrap; }
.field-hint { font-size: 0.83rem; color: rgba(15,18,16,0.55); margin-top: 8px; display: flex; align-items: center; flex-wrap: wrap; gap: 4px; }
.hint-warn { color: #b45309; }
.optional-label { font-weight: 400; color: rgba(15,18,16,0.45); font-size: 0.82rem; }
.mt-2 { margin-top: 8px; }

/* Toggle (just building fitness) */
.fitness-toggle-row { margin-bottom: 20px; }
.fitness-toggle { display: flex; align-items: center; gap: 10px; cursor: pointer; }
.fitness-toggle input[type="checkbox"] { display: none; }
.toggle-track {
  width: 40px; height: 22px; background: rgba(15,18,16,0.15); border-radius: 11px;
  position: relative; transition: background 0.2s; flex-shrink: 0;
}
.fitness-toggle input:checked + .toggle-track { background: #000; }
.toggle-track::after {
  content: ''; position: absolute; top: 3px; left: 3px;
  width: 16px; height: 16px; border-radius: 50%; background: white;
  transition: transform 0.2s;
}
.fitness-toggle input:checked + .toggle-track::after { transform: translateX(18px); }
.toggle-label { font-weight: 700; font-size: 0.9rem; color: rgba(15,18,16,0.78); }

/* Level derived badge */
.level-derived { margin-top: 10px; display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: rgba(15,18,16,0.60); }
.level-chip { padding: 3px 10px; border-radius: 0; font-size: 0.78rem; font-weight: 700; text-transform: capitalize; }
.level-chip.beginner     { background: #f0f0f0; color: #555; }
.level-chip.intermediate { background: #1a1a1a; color: #fff; }
.level-chip.advanced     { background: #000; color: #fff; }

/* Days grid */
.days-grid { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 8px; }
.day-btn {
  display: flex; flex-direction: column; align-items: center; gap: 2px;
  padding: 12px 14px; min-width: 60px; background: white;
  border: 2px solid rgba(15,18,16,0.10); border-radius: 0;
  cursor: pointer; font-family: inherit; transition: all 0.2s;
}
.day-btn:hover { border-color: rgba(15,18,16,0.25); }
.day-btn.active { border-color: #000; background: rgba(0,0,0,0.05); }
.day-abbr { font-weight: 900; font-size: 0.88rem; color: rgba(15,18,16,0.85); }
.day-full { font-size: 0.7rem; color: rgba(15,18,16,0.45); display: none; }
@media (min-width: 500px) { .day-full { display: block; } }

/* Preview card */
.preview-card { background: #fff; border: 1px solid #E5E5E5; }
.preview-header { padding: 24px 28px 20px; border-bottom: 1px solid rgba(15,18,16,0.08); }
.preview-title-row { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
.preview-name { font-weight: 900; font-size: 1.3rem; color: rgba(15,18,16,0.92); margin: 0; }
.engine-badge {
  display: inline-flex; align-items: center;
  background: #f0fdf4; border: 1px solid #86efac;
  color: #166534; padding: 4px 12px; border-radius: 0;
  font-size: 0.78rem; font-weight: 700;
}
.preview-meta-row { display: flex; gap: 20px; font-size: 0.85rem; color: rgba(15,18,16,0.60); font-weight: 600; flex-wrap: wrap; }
.preview-meta-row span { display: flex; align-items: center; gap: 4px; }

/* Phase breakdown */
.phase-breakdown {
  display: flex; border-bottom: 1px solid rgba(15,18,16,0.08);
}
.phase-strip {
  flex: 1; padding: 12px 8px; display: flex; flex-direction: column; align-items: center; gap: 2px;
  border-right: 1px solid rgba(255,255,255,0.30);
}
.phase-strip:last-child { border-right: none; }
.phase-strip-label { font-size: 0.72rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.08em; color: white; }
.phase-strip-weeks { font-size: 1rem; font-weight: 900; color: white; }

/* Preview week */
.preview-week { padding: 20px 28px; border-bottom: 1px solid rgba(15,18,16,0.08); }
.preview-week-label { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.10em; color: rgba(15,18,16,0.50); margin-bottom: 12px; }
.preview-workouts { display: flex; gap: 8px; flex-wrap: wrap; }
.preview-workout {
  flex: 1; min-width: 90px; padding: 12px 10px;
  background: #fff; border: 1px solid #E5E5E5; border-radius: 0; text-align: center;
}
.preview-workout.is-rest { opacity: 0.45; }
.wo-day { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(15,18,16,0.45); margin-bottom: 6px; }
.wo-type-chip { display: inline-block; padding: 2px 6px; border-radius: 0; font-size: 0.65rem; font-weight: 700; color: white; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px; }
.wo-name { font-weight: 700; font-size: 0.82rem; color: rgba(15,18,16,0.85); margin-bottom: 4px; }
.wo-detail { font-size: 0.75rem; color: rgba(15,18,16,0.50); }

/* Start date */
.preview-start { padding: 20px 28px; border-bottom: 1px solid rgba(15,18,16,0.08); display: flex; align-items: center; gap: 16px; }
.start-label { font-weight: 700; font-size: 0.9rem; color: rgba(15,18,16,0.75); min-width: 80px; }
.start-input { padding: 10px 14px; border: 1px solid #E5E5E5; border-radius: 0; font-family: inherit; font-size: 0.95rem; background: #fff; cursor: pointer; }
.start-input:focus { outline: none; border-color: #767676; }

/* Preview actions */
.preview-actions { padding: 20px 28px; display: flex; justify-content: flex-end; gap: 12px; }

/* Wizard nav */
.wizard-nav { display: flex; justify-content: flex-end; gap: 12px; margin-top: 28px; padding-top: 24px; border-top: 1px solid rgba(15,18,16,0.08); }

/* Buttons */
.btn {
  border: 1px solid #E5E5E5; background: rgba(255,255,255,0.60);
  color: rgba(15,18,16,0.78); border-radius: 0; height: 42px; padding: 0 20px;
  font-weight: 700; font-family: inherit;
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  cursor: pointer; transition: all 0.2s;
}
.btn:disabled { opacity: 0.45; cursor: not-allowed; }
.btn-primary { background: #0F1210; border-color: #0F1210; color: white; }
.btn-primary:hover:not(:disabled) { background: #2a2a2a; }
.btn-ghost { background: transparent; border-color: rgba(15,18,16,0.14); }
.btn-ghost:hover:not(:disabled) { background: rgba(15,18,16,0.04); }
.btn-sm { height: 36px; padding: 0 14px; font-size: 0.85rem; }

/* Transitions */
.fade-slide-enter-active, .fade-slide-leave-active { transition: all 0.25s ease; }
.fade-slide-enter-from, .fade-slide-leave-to { opacity: 0; transform: translateY(10px); }

@media (max-width: 640px) {
  .plans-grid { grid-template-columns: 1fr; }
  .wizard-steps-bar { padding: 14px 16px; }
  .wizard-content { padding: 24px 16px; }
  .preview-header, .preview-week, .preview-start, .preview-actions { padding-left: 16px; padding-right: 16px; }
  .preview-meta-row { gap: 10px; }
  .goal-tabs { gap: 8px; }
  .goal-tab { padding: 12px 14px; min-width: 72px; }
  .phase-breakdown { flex-wrap: wrap; }
}
</style>
