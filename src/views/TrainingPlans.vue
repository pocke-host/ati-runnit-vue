<!-- src/views/TrainingPlans.vue -->
<template>
  <main class="plans-page">
    <!-- HERO -->
    <section class="hero">
      <div class="container-xxl">
        <p class="eyebrow">Train smarter.</p>
        <h1 class="fw-bold mb-2">Training Plans</h1>
        <p class="lead m-0">Structured week-by-week plans built for your goal — refined with your data.</p>
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
          <p class="section-sub">Choose a goal, pick your level, and we'll build your schedule.</p>
        </div>

        <!-- STEP 1: Goal tabs -->
        <div class="step-block">
          <div class="step-label">1 — What's your goal?</div>
          <div class="goal-tabs">
            <button
              v-for="g in goals"
              :key="g.key"
              :class="['goal-tab', { active: selectedGoal === g.key }]"
              @click="selectGoal(g.key)"
            >
              <span class="goal-emoji">{{ g.emoji }}</span>
              <span class="goal-name">{{ g.label }}</span>
            </button>
          </div>
        </div>

        <!-- STEP 2: Level cards (after goal selected) -->
        <Transition name="fade-slide">
          <div v-if="selectedGoal" class="step-block">
            <div class="step-label">2 — Choose your level</div>
            <div class="level-cards">
              <button
                v-for="lv in levels"
                :key="lv.key"
                :class="['level-card', { active: selectedLevel === lv.key }]"
                @click="selectedLevel = lv.key; buildPreview()"
              >
                <div class="level-icon">{{ lv.icon }}</div>
                <div class="level-name">{{ lv.label }}</div>
                <div class="level-desc">{{ getLevelDesc(selectedGoal, lv.key) }}</div>
              </button>
            </div>
          </div>
        </Transition>

        <!-- STEP 3: Plan preview -->
        <Transition name="fade-slide">
          <div v-if="preview" class="step-block">
            <div class="step-label">3 — Your plan preview</div>

            <div class="preview-card">
              <!-- Plan summary -->
              <div class="preview-header">
                <div class="preview-title-row">
                  <h3 class="preview-name">{{ preview.name }}</h3>
                  <span v-if="aiRefined" class="ai-badge">
                    <i class="bi bi-stars me-1"></i>AI Refined
                  </span>
                </div>
                <div class="preview-meta-row">
                  <span><i class="bi bi-calendar3 me-1"></i>{{ preview.totalWeeks }} weeks</span>
                  <span><i class="bi bi-repeat me-1"></i>{{ preview.daysPerWeek }}x per week</span>
                  <span><i class="bi bi-flag me-1"></i>Starts {{ formatDateShort(startDate) }}</span>
                </div>
              </div>

              <!-- Sample week -->
              <div class="preview-week">
                <div class="preview-week-label">Week 1 — {{ preview.weeks[0]?.theme }}</div>
                <div class="preview-workouts">
                  <div
                    v-for="wo in preview.weeks[0]?.workouts"
                    :key="wo.dayLabel"
                    :class="['preview-workout', { 'is-rest': wo.type === 'Rest' }]"
                  >
                    <div class="wo-day">{{ wo.dayLabel }}</div>
                    <div class="wo-type">{{ wo.type }}</div>
                    <div class="wo-detail" v-if="wo.type !== 'Rest'">
                      {{ formatDistance(wo.distanceMeters) }} · {{ wo.durationMinutes }}min
                    </div>
                  </div>
                </div>
              </div>

              <!-- Start date picker -->
              <div class="preview-start">
                <label class="start-label">Start date</label>
                <input type="date" class="start-input" v-model="startDate" :min="todayStr" />
              </div>

              <!-- AI refine toggle -->
              <div class="ai-refine-row">
                <div class="ai-refine-info">
                  <i class="bi bi-stars me-2" style="color: var(--r-accent)"></i>
                  <div>
                    <div class="ai-refine-title">Refine with your activity data</div>
                    <div class="ai-refine-sub">Adjusts volumes based on your recent workouts</div>
                  </div>
                </div>
                <button
                  class="btn btn-outline-accent btn-sm"
                  @click="runAiRefine"
                  :disabled="aiLoading || !activities.length"
                  :title="!activities.length ? 'Log some activities first' : ''"
                >
                  <span v-if="aiLoading" class="spinner-border spinner-border-sm me-1"></span>
                  <i v-else class="bi bi-stars me-1"></i>
                  {{ aiLoading ? 'Analyzing…' : aiRefined ? 'Re-refine' : 'Refine' }}
                </button>
              </div>
              <div v-if="aiNote" class="ai-note">
                <i class="bi bi-info-circle me-2"></i>{{ aiNote }}
              </div>

              <!-- Actions -->
              <div class="preview-actions">
                <button class="btn btn-ghost" @click="preview = null; aiRefined = false">
                  Cancel
                </button>
                <button class="btn btn-primary" @click="confirmCreate" :disabled="creating">
                  <span v-if="creating" class="spinner-border spinner-border-sm me-2"></span>
                  Create Plan
                </button>
              </div>
            </div>
          </div>
        </Transition>

        <!-- Loading state -->
        <AppSpinner v-if="plansLoading" label="Loading plans…" />

        <!-- Empty state (no plans + no goal selected yet + not loading) -->
        <EmptyState
          v-else-if="!plans.length && !selectedGoal"
          icon="bi-calendar3"
          title="No plans yet"
          message="Build a custom plan or start from a template."
          action-label="Create Plan"
          @action="selectedGoal = goals[0].key"
        />
      </section>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePlanStore } from '@/stores/plan.js'
import { useActivityStore } from '@/stores/activity.js'
import { storeToRefs } from 'pinia'
import { useUnits } from '@/composables/useUnits'
import AppSpinner from '@/components/AppSpinner.vue'
import EmptyState from '@/components/EmptyState.vue'

const router = useRouter()
const planStore = usePlanStore()
const activityStore = useActivityStore()
const { plans } = storeToRefs(planStore)
const { activities } = storeToRefs(activityStore)
const { formatDistance } = useUnits()

// Status
const statusMessage = ref('')
const statusType = ref('success')
let statusTimer = null
const showStatus = (msg, type = 'success') => {
  clearTimeout(statusTimer)
  statusMessage.value = msg
  statusType.value = type
  statusTimer = setTimeout(() => { statusMessage.value = '' }, 4000)
}

// Plan creation state
const selectedGoal = ref(null)
const selectedLevel = ref(null)
const preview = ref(null)
const startDate = ref(todayStr())
const creating = ref(false)
const aiLoading = ref(false)
const aiRefined = ref(false)
const aiNote = ref('')

// ── Goal & Level definitions ──────────────────────

const goals = [
  { key: '5k',       label: '5K',           emoji: '🏃', sport: 'Running' },
  { key: '10k',      label: '10K',          emoji: '🏃', sport: 'Running' },
  { key: 'half',     label: 'Half Marathon', emoji: '🏅', sport: 'Running' },
  { key: 'marathon', label: 'Marathon',     emoji: '🎽', sport: 'Running' },
  { key: 'cycling',  label: 'Cycling Base', emoji: '🚴', sport: 'Cycling' },
  { key: 'swim',     label: 'Swim Fitness', emoji: '🏊', sport: 'Swimming' },
]

const levels = [
  { key: 'beginner',     label: 'Beginner',     icon: '🌱' },
  { key: 'intermediate', label: 'Intermediate', icon: '⚡' },
  { key: 'advanced',     label: 'Advanced',     icon: '🔥' },
]

const LEVEL_DESCS = {
  '5k': {
    beginner:     '8 wks · 3x/wk · 15–25 km/wk',
    intermediate: '8 wks · 4x/wk · 25–40 km/wk',
    advanced:     '8 wks · 5x/wk · 40–55 km/wk',
  },
  '10k': {
    beginner:     '10 wks · 3x/wk · 20–30 km/wk',
    intermediate: '10 wks · 4x/wk · 30–50 km/wk',
    advanced:     '10 wks · 5x/wk · 50–70 km/wk',
  },
  half: {
    beginner:     '12 wks · 4x/wk · 30–50 km/wk',
    intermediate: '12 wks · 5x/wk · 50–70 km/wk',
    advanced:     '14 wks · 6x/wk · 70–90 km/wk',
  },
  marathon: {
    beginner:     '16 wks · 4x/wk · 40–60 km/wk',
    intermediate: '16 wks · 5x/wk · 60–80 km/wk',
    advanced:     '18 wks · 6x/wk · 80–110 km/wk',
  },
  cycling: {
    beginner:     '8 wks · 3x/wk · 60–100 km/wk',
    intermediate: '8 wks · 4x/wk · 100–160 km/wk',
    advanced:     '10 wks · 5x/wk · 160–250 km/wk',
  },
  swim: {
    beginner:     '6 wks · 3x/wk · 6–10 km/wk',
    intermediate: '8 wks · 4x/wk · 10–18 km/wk',
    advanced:     '10 wks · 5x/wk · 18–30 km/wk',
  },
}

const getLevelDesc = (goalKey, levelKey) => LEVEL_DESCS[goalKey]?.[levelKey] || ''

// ── Template generation ───────────────────────────

const TEMPLATES = {
  '5k': {
    beginner:     { weeks: 8,  days: 3, baseDist: 15000, goal: '5K'           },
    intermediate: { weeks: 8,  days: 4, baseDist: 25000, goal: '5K'           },
    advanced:     { weeks: 8,  days: 5, baseDist: 40000, goal: '5K'           },
  },
  '10k': {
    beginner:     { weeks: 10, days: 3, baseDist: 20000, goal: '10K'          },
    intermediate: { weeks: 10, days: 4, baseDist: 30000, goal: '10K'          },
    advanced:     { weeks: 10, days: 5, baseDist: 50000, goal: '10K'          },
  },
  half: {
    beginner:     { weeks: 12, days: 4, baseDist: 30000, goal: 'Half Marathon' },
    intermediate: { weeks: 12, days: 5, baseDist: 50000, goal: 'Half Marathon' },
    advanced:     { weeks: 14, days: 6, baseDist: 70000, goal: 'Half Marathon' },
  },
  marathon: {
    beginner:     { weeks: 16, days: 4, baseDist: 40000, goal: 'Marathon'     },
    intermediate: { weeks: 16, days: 5, baseDist: 60000, goal: 'Marathon'     },
    advanced:     { weeks: 18, days: 6, baseDist: 80000, goal: 'Marathon'     },
  },
  cycling: {
    beginner:     { weeks: 8,  days: 3, baseDist: 60000,  goal: 'Cycling Base' },
    intermediate: { weeks: 8,  days: 4, baseDist: 100000, goal: 'Cycling Base' },
    advanced:     { weeks: 10, days: 5, baseDist: 160000, goal: 'Cycling Base' },
  },
  swim: {
    beginner:     { weeks: 6,  days: 3, baseDist: 6000,  goal: 'Swim Fitness' },
    intermediate: { weeks: 8,  days: 4, baseDist: 10000, goal: 'Swim Fitness' },
    advanced:     { weeks: 10, days: 5, baseDist: 18000, goal: 'Swim Fitness' },
  },
}

const WEEK_THEMES = [
  'Base Building', 'Building Aerobic Base', 'Increasing Volume',
  'Steady Progress', 'Building Strength', 'Peak Training',
  'Peak Week', 'Speed Work', 'Race Preparation', 'Taper',
  'Taper Week', 'Race Week', 'Recovery', 'Active Recovery',
  'Base Fitness', 'Consolidation', 'Endurance Focus', 'Race Sharpening',
]

const WORKOUT_SCHEDULES = {
  3: ['Monday', 'Wednesday', 'Saturday'],
  4: ['Monday', 'Wednesday', 'Friday', 'Sunday'],
  5: ['Monday', 'Tuesday', 'Thursday', 'Friday', 'Sunday'],
  6: ['Monday', 'Tuesday', 'Wednesday', 'Friday', 'Saturday', 'Sunday'],
}

const WORKOUT_TYPES_BY_DAYS = {
  3: ['Easy Run', 'Tempo Run',    'Long Run'],
  4: ['Easy Run', 'Interval',     'Easy Run', 'Long Run'],
  5: ['Easy Run', 'Tempo Run',    'Easy Run', 'Interval', 'Long Run'],
  6: ['Easy Run', 'Tempo Run',    'Easy Run', 'Interval', 'Easy Run', 'Long Run'],
}

const CYCLING_TYPES = {
  3: ['Endurance Ride', 'Interval Ride', 'Long Ride'],
  4: ['Endurance Ride', 'Interval Ride', 'Recovery Ride', 'Long Ride'],
  5: ['Endurance Ride', 'Tempo Ride',    'Interval Ride', 'Recovery Ride', 'Long Ride'],
}

const SWIM_TYPES = {
  3: ['Technique Swim', 'Endurance Swim', 'Long Swim'],
  4: ['Technique Swim', 'Interval Swim',  'Endurance Swim', 'Long Swim'],
  5: ['Technique Swim', 'Interval Swim',  'Endurance Swim', 'Drill Set', 'Long Swim'],
}

const WORKOUT_DESCRIPTIONS = {
  'Easy Run':       'Conversational pace, HR zone 2. Focus on easy effort.',
  'Tempo Run':      'Comfortably hard. Sustained effort at lactate threshold.',
  'Long Run':       'Slow and steady. The cornerstone of endurance training.',
  'Interval':       'Short, hard efforts with recovery. Builds speed and VO2max.',
  'Recovery Run':   'Very easy pace. Active recovery between hard sessions.',
  'Endurance Ride': 'Steady aerobic effort, HR zone 2.',
  'Tempo Ride':     'Sustained hard effort at threshold power.',
  'Interval Ride':  'Hard efforts above threshold, full recovery between.',
  'Recovery Ride':  'Very easy spinning. Flush the legs.',
  'Long Ride':      'Long slow distance. Build endurance base.',
  'Technique Swim': 'Focus on form — drills and feel for the water.',
  'Endurance Swim': 'Steady aerobic effort, consistent pace.',
  'Long Swim':      'Extended distance at comfortable pace.',
  'Interval Swim':  'Hard efforts with rest. Build speed and efficiency.',
  'Drill Set':      'Kick sets, pull buoy, paddles. Technical focus.',
  'Rest':           'Full rest day. Recover and absorb training.',
  'Cross Training': 'Low-impact cardio — swim, bike, yoga.',
}

function getWorkoutTypes(goalKey, days) {
  if (goalKey === 'cycling') return CYCLING_TYPES[days] || CYCLING_TYPES[3]
  if (goalKey === 'swim')    return SWIM_TYPES[days]    || SWIM_TYPES[3]
  return WORKOUT_TYPES_BY_DAYS[days] || WORKOUT_TYPES_BY_DAYS[3]
}

function generatePlanWeeks(tpl, goalKey, levelKey) {
  const { weeks, days, baseDist } = tpl
  const schedule = WORKOUT_SCHEDULES[days] || WORKOUT_SCHEDULES[3]
  const types = getWorkoutTypes(goalKey, days)
  const distPerWorkout = baseDist / days

  return Array.from({ length: weeks }, (_, wi) => {
    const isCutback = (wi + 1) % 4 === 0
    const isTaper   = wi >= weeks - 2
    const isPeak    = wi === weeks - 3

    let multiplier = isTaper ? 0.6 : isCutback ? 0.7 : 1 + (wi * 0.08)
    if (isPeak) multiplier = Math.max(multiplier, 1.5)

    // Theme selection
    let theme
    if (isTaper) theme = wi === weeks - 1 ? 'Race Week' : 'Taper'
    else if (isPeak) theme = 'Peak Week'
    else if (isCutback) theme = 'Recovery'
    else theme = WEEK_THEMES[wi % 6] // cycle through base themes

    const workouts = schedule.map((day, di) => {
      const type = types[di] || 'Easy Run'
      const isLong = type.includes('Long')
      const distFactor = isLong ? 1.8 : type.includes('Easy') || type.includes('Recovery') ? 0.8 : 1.1
      const dist = Math.round(distPerWorkout * multiplier * distFactor / 500) * 500
      const duration = Math.round(dist / 1000 * (type.includes('Easy') ? 6.5 : type.includes('Long') ? 7 : 5))

      return {
        id: `${wi}-${di}`,
        dayLabel: day,
        type,
        distanceMeters: dist,
        durationMinutes: duration,
        description: WORKOUT_DESCRIPTIONS[type] || '',
        completed: false,
      }
    })

    return { weekNumber: wi + 1, theme, workouts }
  })
}

// ── UI helpers ─────────────────────────────────────

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function formatDateShort(str) {
  if (!str) return '—'
  return new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getSportIcon(sport) {
  const map = { Running: '🏃', Cycling: '🚴', Swimming: '🏊', Hiking: '🥾', Walking: '🚶' }
  return map[sport] || '🏋️'
}

function currentWeekOf(plan) {
  if (!plan.startDate) return 1
  const start = new Date(plan.startDate)
  const now = new Date()
  const diff = Math.floor((now - start) / (7 * 24 * 3600 * 1000))
  return Math.min(Math.max(diff + 1, 1), plan.totalWeeks)
}

function planProgressPct(plan) {
  return Math.round((currentWeekOf(plan) / plan.totalWeeks) * 100)
}

// ── Plan creation flow ────────────────────────────

function selectGoal(key) {
  selectedGoal.value = key
  selectedLevel.value = null
  preview.value = null
  aiRefined.value = false
  aiNote.value = ''
}

function buildPreview() {
  if (!selectedGoal.value || !selectedLevel.value) return
  const goalDef = goals.find(g => g.key === selectedGoal.value)
  const tpl = TEMPLATES[selectedGoal.value][selectedLevel.value]
  const weeks = generatePlanWeeks(tpl, selectedGoal.value, selectedLevel.value)

  preview.value = {
    name: `${goalDef.label} — ${selectedLevel.value.charAt(0).toUpperCase() + selectedLevel.value.slice(1)}`,
    sport: goalDef.sport,
    goal: goalDef.label,
    level: selectedLevel.value,
    totalWeeks: tpl.weeks,
    daysPerWeek: tpl.days,
    weeks,
  }
  aiRefined.value = false
  aiNote.value = ''
  startDate.value = todayStr()
}

async function runAiRefine() {
  if (!preview.value || aiLoading.value) return
  aiLoading.value = true
  aiNote.value = ''
  try {
    const goalDef = goals.find(g => g.key === selectedGoal.value)
    const refined = await planStore.suggestPlan({
      sport: goalDef.sport,
      goal: selectedGoal.value,
      level: selectedLevel.value,
      recentActivities: (activities.value || []).slice(0, 20).map(a => ({
        distanceMeters: a.distanceMeters,
        durationSeconds: a.durationSeconds,
        sportType: a.sportType,
        createdAt: a.createdAt,
      })),
    })
    // Merge AI weeks into preview, keep local structure
    preview.value.weeks = refined.weeks || preview.value.weeks
    if (refined.name) preview.value.name = refined.name
    aiRefined.value = true
    aiNote.value = 'Volumes adjusted to match your recent training load.'
  } catch {
    // Silent fallback — keep template
    aiRefined.value = false
    aiNote.value = 'Using template plan (AI service unavailable).'
  } finally {
    aiLoading.value = false
  }
}

async function confirmCreate() {
  if (!preview.value || creating.value) return
  creating.value = true
  try {
    const payload = {
      ...preview.value,
      startDate: startDate.value,
      isActive: plans.value.length === 0, // first plan auto-activates
    }
    const created = await planStore.createPlan(payload)
    showStatus(`"${created.name}" created!`)
    preview.value = null
    selectedGoal.value = null
    selectedLevel.value = null
    router.push(`/plans/${created.id}`)
  } catch (err) {
    showStatus('Failed to create plan. Try again.', 'error')
  } finally {
    creating.value = false
  }
}

const plansLoading = ref(false)

onMounted(async () => {
  plansLoading.value = true
  try {
    await planStore.fetchPlans()
  } finally {
    plansLoading.value = false
  }
  activityStore.fetchActivities()
})
</script>

<style scoped>
.plans-page {
  padding-top: var(--nav-h, 64px);
  min-height: calc(100vh - var(--nav-h, 64px));
  background: var(--rk-paper, #FAF8FF);
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
  font-weight: 700; font-size: 0.9rem;
  box-shadow: none;
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
  background: white; border: 1px solid #E5E5E5;
  border-radius: 0; padding: 24px; cursor: pointer;
  transition: all 0.2s; box-shadow: none;
}
.plan-card { transition: transform 0.25s ease, box-shadow 0.25s ease; }
.plan-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.09); }
.plan-card-active { border-color: #767676; box-shadow: none; }

.plan-card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }
.plan-sport-icon { font-size: 2.2rem; }
.plan-badges { display: flex; gap: 6px; flex-wrap: wrap; justify-content: flex-end; }

.plan-badge {
  padding: 4px 10px; border-radius: 0;
  font-size: 0.72rem; font-weight: 700; text-transform: capitalize;
}
.plan-badge-level.beginner     { background: #f0f0f0; color: #555; }
.plan-badge-level.intermediate { background: #1a1a1a; color: #fff; }
.plan-badge-level.advanced     { background: var(--rk-void, #0D0512); color: var(--rk-signal, #8B2BE2); }
.plan-badge-active { background: rgba(0,0,0,0.08); color: #000; }

.plan-name { font-weight: 900; font-size: 1.05rem; margin: 0 0 4px; color: rgba(15,18,16,0.92); }
.plan-meta { font-size: 0.82rem; color: rgba(15,18,16,0.55); margin: 0 0 14px; }

.plan-progress-label { display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 700; color: rgba(15,18,16,0.65); margin-bottom: 6px; }
.plan-progress-bar { height: 6px; background: rgba(15,18,16,0.08); border-radius: 0; overflow: hidden; }
.plan-progress-fill { height: 100%; background: #000; border-radius: 0; transition: width 0.5s; }

/* Step blocks */
.step-block { margin-bottom: 32px; }
.step-label { font-size: 0.75rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.12em; color: rgba(15,18,16,0.50); margin-bottom: 14px; }

/* Goal tabs */
.goal-tabs { display: flex; gap: 10px; flex-wrap: wrap; }
.goal-tab {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  padding: 16px 20px; min-width: 90px;
  background: white; border: 2px solid rgba(15,18,16,0.10);
  border-radius: 0; cursor: pointer; transition: all 0.2s;
  font-family: inherit;
}
.goal-tab:hover { border-color: rgba(15,18,16,0.22); transform: translateY(-1px); }
.goal-tab.active { border-color: #000; background: rgba(0,0,0,0.05); box-shadow: none; }
.goal-emoji { font-size: 1.8rem; }
.goal-name { font-weight: 700; font-size: 0.85rem; color: rgba(15,18,16,0.85); white-space: nowrap; }

/* Level cards */
.level-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; max-width: 600px; }
.level-card {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 22px 16px; background: white;
  border: 2px solid rgba(15,18,16,0.10); border-radius: 0;
  cursor: pointer; transition: all 0.2s; font-family: inherit; text-align: center;
}
.level-card:hover { border-color: rgba(15,18,16,0.22); transform: translateY(-1px); }
.level-card.active { border-color: #000; background: rgba(0,0,0,0.05); box-shadow: none; }
.level-icon { font-size: 1.8rem; }
.level-name { font-weight: 900; font-size: 0.95rem; color: rgba(15,18,16,0.90); }
.level-desc { font-size: 0.78rem; color: rgba(15,18,16,0.55); line-height: 1.4; }

/* Preview card */
.preview-card {
  background: white; border: 1px solid #E5E5E5;
  border-radius: 0; overflow: hidden;
  box-shadow: none;
}
.preview-header {
  padding: 24px 28px 20px;
  border-bottom: 1px solid rgba(15,18,16,0.08);
  background: #fff;
}
.preview-title-row { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
.preview-name { font-weight: 900; font-size: 1.3rem; color: rgba(15,18,16,0.92); margin: 0; }
.preview-meta-row { display: flex; gap: 20px; font-size: 0.85rem; color: rgba(15,18,16,0.60); font-weight: 600; }
.preview-meta-row span { display: flex; align-items: center; gap: 4px; }

.ai-badge {
  display: inline-flex; align-items: center;
  background: #f0f0f0;
  border: 1px solid #E5E5E5;
  color: #000; padding: 4px 12px; border-radius: 0;
  font-size: 0.78rem; font-weight: 700;
}

/* Preview week */
.preview-week { padding: 20px 28px; border-bottom: 1px solid rgba(15,18,16,0.08); }
.preview-week-label { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.10em; color: rgba(15,18,16,0.50); margin-bottom: 12px; }
.preview-workouts { display: flex; gap: 8px; flex-wrap: wrap; }
.preview-workout {
  flex: 1; min-width: 100px; padding: 12px 14px;
  background: #fff; border: 1px solid #E5E5E5;
  border-radius: 0;
}
.preview-workout.is-rest { opacity: 0.50; }
.wo-day { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(15,18,16,0.50); margin-bottom: 4px; }
.wo-type { font-weight: 700; font-size: 0.88rem; color: rgba(15,18,16,0.88); margin-bottom: 4px; }
.wo-detail { font-size: 0.78rem; color: rgba(15,18,16,0.55); }

/* Start date */
.preview-start { padding: 20px 28px; border-bottom: 1px solid rgba(15,18,16,0.08); display: flex; align-items: center; gap: 16px; }
.start-label { font-weight: 700; font-size: 0.9rem; color: rgba(15,18,16,0.75); min-width: 80px; }
.start-input {
  padding: 10px 14px; border: 1px solid #E5E5E5; border-radius: 0;
  font-family: inherit; font-size: 0.95rem; background: #fff; cursor: pointer;
}
.start-input:focus { outline: none; border-color: #767676; box-shadow: none; background: white; }

/* AI refine */
.ai-refine-row { padding: 20px 28px; border-bottom: 1px solid rgba(15,18,16,0.08); display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.ai-refine-info { display: flex; align-items: center; gap: 12px; }
.ai-refine-title { font-weight: 700; font-size: 0.92rem; color: rgba(15,18,16,0.85); }
.ai-refine-sub { font-size: 0.8rem; color: rgba(15,18,16,0.50); margin-top: 2px; }
.ai-note { padding: 12px 28px; font-size: 0.85rem; color: rgba(15,18,16,0.60); font-style: italic; border-bottom: 1px solid rgba(15,18,16,0.08); display: flex; align-items: center; }

/* Preview actions */
.preview-actions { padding: 20px 28px; display: flex; justify-content: flex-end; gap: 12px; }

/* Loading / empty */
.loading-state { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 60px; color: rgba(15,18,16,0.55); }
.empty-nudge { text-align: center; padding: 48px; color: rgba(15,18,16,0.45); }
.empty-icon { font-size: 3rem; margin-bottom: 12px; }

/* Buttons */
.btn {
  border: 1px solid #E5E5E5; background: rgba(255,255,255,0.60);
  color: rgba(15,18,16,0.78); border-radius: 0; height: 42px; padding: 0 20px;
  font-weight: 700; font-family: inherit;
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  cursor: pointer; transition: all 0.2s;
}
.btn:disabled { opacity: 0.45; cursor: not-allowed; }
.btn-primary { background: var(--r-black, #0F1210); border-color: var(--r-black, #0F1210); color: white; }
.btn-primary:hover:not(:disabled) { background: #2a2a2a; border-color: #2a2a2a; }
.btn-ghost { background: transparent; border-color: rgba(15,18,16,0.14); }
.btn-ghost:hover:not(:disabled) { background: rgba(15,18,16,0.04); }
.btn-outline-accent { background: transparent; border-color: #000; color: #767676; }
.btn-outline-accent:hover:not(:disabled) { background: rgba(0,0,0,0.05); }
.btn-sm { height: 36px; padding: 0 14px; font-size: 0.85rem; border-radius: 0; }

/* Transitions */
.fade-slide-enter-active, .fade-slide-leave-active { transition: all 0.3s ease; }
.fade-slide-enter-from, .fade-slide-leave-to { opacity: 0; transform: translateY(12px); }

/* Responsive */
.new-plan-section { max-width: 860px; }
@media (max-width: 640px) {
  .level-cards { grid-template-columns: 1fr 1fr; }
  .goal-tabs { gap: 8px; }
  .goal-tab { padding: 12px 14px; min-width: 72px; }
  .preview-meta-row { flex-wrap: wrap; gap: 10px; }
  .preview-workouts { gap: 6px; }
  .preview-workout { min-width: 80px; }
  .plans-grid { grid-template-columns: 1fr; }
}
@media (max-width: 400px) {
  .level-cards { grid-template-columns: 1fr; }
  .goal-tab { min-width: 60px; font-size: 0.82rem; padding: 10px 12px; }
}
</style>
