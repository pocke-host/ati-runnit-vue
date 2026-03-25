<template>
  <div class="onboard-page">
    <!-- Progress bar (steps 2–7) -->
    <div class="progress-bar-track" v-if="step > 1">
      <div class="progress-bar-fill" :style="{ width: progressWidth }"></div>
    </div>

    <!-- Header row (steps 2–6, athlete only) -->
    <div class="onboard-header" v-if="!isCoach && step >= 2 && step <= 6">
      <button class="btn-back" @click="back" v-if="step > 2">← Back</button>
      <span v-else></span>
      <span class="step-counter">{{ String(step - 1).padStart(2, '0') }} / 05</span>
    </div>
    <!-- Header row for coach steps -->
    <div class="onboard-header" v-if="isCoach && step >= 2 && step <= 3">
      <button class="btn-back" @click="back" v-if="step > 2">← Back</button>
      <span v-else></span>
      <span class="step-counter">{{ String(step - 1).padStart(2, '0') }} / 02</span>
    </div>

    <!-- ── Step 1: Welcome ── -->
    <div v-if="step === 1" class="step-container step-welcome">
      <div class="welcome-inner">
        <div class="brand-lockup">
          <div class="brand-square">R</div>
          <span class="brand-name">RUNNIT</span>
        </div>
        <h1 class="welcome-headline">Welcome,<br>{{ firstName }}.</h1>
        <p class="welcome-sub" v-if="isCoach">Let's set up your coaching profile in under a minute.</p>
        <p class="welcome-sub" v-else>Let's set you up in under a minute.</p>
        <button class="btn-cta" @click="step = 2">Get started</button>
      </div>
    </div>

    <!-- ── Coach Step C1: Sports coached ── -->
    <div v-else-if="step === 2 && isCoach" class="step-container">
      <h2 class="step-question">What sports<br>do you coach?</h2>
      <div class="tile-grid">
        <button
          v-for="opt in coachSportOptions"
          :key="opt.value"
          class="tile"
          :class="{ selected: coachSelections.sports.includes(opt.value) }"
          @click="toggleCoachSport(opt.value)"
        >
          <span class="tile-emoji">{{ opt.emoji }}</span>
          <span class="tile-label">{{ opt.label }}</span>
        </button>
      </div>
      <button class="btn-cta mt-auto" :disabled="coachSelections.sports.length === 0" @click="step = 3">Continue</button>
    </div>

    <!-- ── Coach Step C2: Athlete count ── -->
    <div v-else-if="step === 3 && isCoach" class="step-container">
      <button class="btn-back standalone" @click="back">← Back</button>
      <h2 class="step-question">How many<br>athletes?</h2>
      <div class="tile-grid tile-grid--4">
        <button
          v-for="opt in athleteCountOptions"
          :key="opt.value"
          class="tile tile--compact"
          :class="{ selected: coachSelections.athleteCount === opt.value }"
          @click="coachSelections.athleteCount = opt.value"
        >
          <span class="tile-label">{{ opt.label }}</span>
        </button>
      </div>
      <button class="btn-cta mt-auto" :disabled="!coachSelections.athleteCount" @click="finishCoach">Continue</button>
    </div>

    <!-- ── Coach Done ── -->
    <div v-else-if="step === 4 && isCoach" class="step-container step-done">
      <div class="done-sport-emoji">🏆</div>
      <h2 class="done-headline">You're set up.</h2>
      <div class="done-summary">
        <div class="summary-row">
          <span class="summary-label">Sports coached</span>
          <span class="summary-value">{{ coachSelections.sports.join(', ') }}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Athletes</span>
          <span class="summary-value">{{ coachSelections.athleteCount }}</span>
        </div>
      </div>
      <button class="btn-cta" :disabled="saving" @click="goToCoachDashboard">
        <span v-if="!saving">Open Coaching Hub</span>
        <span v-else><span class="spinner-border spinner-border-sm me-2"></span>Saving...</span>
      </button>
    </div>

    <!-- ── Step 2: Sport ── -->
    <div v-else-if="step === 2" class="step-container">
      <h2 class="step-question">What do you<br>primarily train?</h2>
      <div class="tile-grid">
        <button
          v-for="opt in sportOptions"
          :key="opt.value"
          class="tile"
          :class="{ selected: selections.sport === opt.value }"
          @click="select('sport', opt.value)"
        >
          <span class="tile-emoji">{{ opt.emoji }}</span>
          <span class="tile-label">{{ opt.label }}</span>
        </button>
      </div>
      <button class="btn-cta mt-auto" :disabled="!selections.sport" @click="step = 3">Continue</button>
    </div>

    <!-- ── Step 3: Goal ── -->
    <div v-else-if="step === 3" class="step-container">
      <button class="btn-back standalone" @click="back">← Back</button>
      <h2 class="step-question">What are you<br>working toward?</h2>
      <div class="tile-grid">
        <button
          v-for="opt in goalOptions"
          :key="opt.value"
          class="tile"
          :class="{ selected: selections.goal === opt.value }"
          @click="select('goal', opt.value)"
        >
          <span class="tile-emoji">{{ opt.emoji }}</span>
          <span class="tile-label">{{ opt.label }}</span>
        </button>
      </div>
      <button class="btn-cta mt-auto" :disabled="!selections.goal" @click="step = 4">Continue</button>
    </div>

    <!-- ── Step 4: Level ── -->
    <div v-else-if="step === 4" class="step-container">
      <button class="btn-back standalone" @click="back">← Back</button>
      <h2 class="step-question">How experienced<br>are you?</h2>
      <div class="tile-grid tile-grid--3">
        <button
          v-for="opt in levelOptions"
          :key="opt.value"
          class="tile"
          :class="{ selected: selections.level === opt.value }"
          @click="select('level', opt.value)"
        >
          <span class="tile-emoji">{{ opt.emoji }}</span>
          <span class="tile-label">{{ opt.label }}</span>
        </button>
      </div>
      <button class="btn-cta mt-auto" :disabled="!selections.level" @click="step = 5">Continue</button>
    </div>

    <!-- ── Step 5: Days ── -->
    <div v-else-if="step === 5" class="step-container">
      <button class="btn-back standalone" @click="back">← Back</button>
      <h2 class="step-question">How many days a week<br>can you train?</h2>
      <div class="tile-grid tile-grid--4">
        <button
          v-for="opt in daysOptions"
          :key="opt.value"
          class="tile tile--compact"
          :class="{ selected: selections.days === opt.value }"
          @click="select('days', opt.value)"
        >
          <span class="tile-label">{{ opt.label }}</span>
        </button>
      </div>
      <button class="btn-cta mt-auto" :disabled="!selections.days" @click="step = 6">Continue</button>
    </div>

    <!-- ── Step 6: Units ── -->
    <div v-else-if="step === 6" class="step-container">
      <button class="btn-back standalone" @click="back">← Back</button>
      <h2 class="step-question">Which do<br>you prefer?</h2>
      <div class="tile-grid tile-grid--2">
        <button
          class="tile tile--tall"
          :class="{ selected: selections.units === 'imperial' }"
          @click="select('units', 'imperial')"
        >
          <span class="tile-emoji">🇺🇸</span>
          <span class="tile-label">Miles &amp; feet</span>
          <span class="tile-sub">mi, ft, min/mi</span>
        </button>
        <button
          class="tile tile--tall"
          :class="{ selected: selections.units === 'metric' }"
          @click="select('units', 'metric')"
        >
          <span class="tile-emoji">🌍</span>
          <span class="tile-label">Kilometers &amp; meters</span>
          <span class="tile-sub">km, m, min/km</span>
        </button>
      </div>
      <button class="btn-cta mt-auto" @click="finish">Continue</button>
    </div>

    <!-- ── Step 7: Done ── -->
    <div v-else-if="step === 7" class="step-container step-done">
      <div class="done-sport-emoji">{{ selectedSportEmoji }}</div>
      <h2 class="done-headline">You're all set.</h2>
      <div class="done-summary">
        <div class="summary-row">
          <span class="summary-label">Sport</span>
          <span class="summary-value">{{ selectedSportLabel }}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Goal</span>
          <span class="summary-value">{{ selectedGoalLabel }}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Level</span>
          <span class="summary-value">{{ selectedLevelLabel }}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Training days</span>
          <span class="summary-value">{{ selections.days }} days/week</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Units</span>
          <span class="summary-value">{{ selections.units === 'imperial' ? 'Miles & feet' : 'Kilometers & meters' }}</span>
        </div>
      </div>
      <button class="btn-cta" :disabled="saving" @click="goToDashboard">
        <span v-if="!saving">Start training</span>
        <span v-else><span class="spinner-border spinner-border-sm me-2"></span>Saving...</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'

const router = useRouter()
const authStore = useAuthStore()
const { user, role } = storeToRefs(authStore)

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const step = ref(1)
const TOTAL_STEPS = 5
const saving = ref(false)

const isCoach = computed(() => role.value === 'coach')

const selections = reactive({
  sport: '',
  goal: '',
  level: '',
  days: '',
  units: 'imperial'
})

const coachSelections = reactive({
  sports: [],
  athleteCount: ''
})

const firstName = computed(() => {
  const name = user.value?.displayName || user.value?.name || 'Athlete'
  return name.split(' ')[0]
})

const progressWidth = computed(() => {
  if (step.value <= 1) return '0%'
  const filled = Math.min(step.value - 1, TOTAL_STEPS)
  return `${(filled / TOTAL_STEPS) * 100}%`
})

const sportOptions = [
  { value: 'running',  emoji: '🏃', label: 'Running' },
  { value: 'cycling',  emoji: '🚴', label: 'Cycling' },
  { value: 'swimming', emoji: '🏊', label: 'Swimming' },
  { value: 'hiking',   emoji: '🥾', label: 'Hiking' },
  { value: 'other',    emoji: '⚡', label: 'Other' },
]

const goalOptions = [
  { value: 'consistency', emoji: '📅', label: 'Build consistency' },
  { value: 'race',        emoji: '🏅', label: 'Race goal' },
  { value: 'speed',       emoji: '⚡', label: 'Get faster' },
  { value: 'fitness',     emoji: '💪', label: 'General fitness' },
]

const levelOptions = [
  { value: 'beginner',     emoji: '🌱', label: 'Just starting' },
  { value: 'intermediate', emoji: '🔥', label: 'Some experience' },
  { value: 'advanced',     emoji: '🏆', label: 'Training regularly' },
]

const daysOptions = [
  { value: '1-2',   label: '1–2' },
  { value: '3-4',   label: '3–4' },
  { value: '5-6',   label: '5–6' },
  { value: 'daily', label: 'Daily' },
]

const coachSportOptions = [
  { value: 'running',   emoji: '🏃', label: 'Running' },
  { value: 'cycling',   emoji: '🚴', label: 'Cycling' },
  { value: 'swimming',  emoji: '🏊', label: 'Swimming' },
  { value: 'triathlon', emoji: '🏅', label: 'Triathlon' },
  { value: 'other',     emoji: '⚡', label: 'Other' },
]

const athleteCountOptions = [
  { value: '1-5',   label: '1–5' },
  { value: '6-15',  label: '6–15' },
  { value: '16-30', label: '16–30' },
  { value: '30+',   label: '30+' },
]

function toggleCoachSport(value) {
  const idx = coachSelections.sports.indexOf(value)
  if (idx === -1) coachSelections.sports.push(value)
  else coachSelections.sports.splice(idx, 1)
}

const selectedSportEmoji = computed(() =>
  sportOptions.find(o => o.value === selections.sport)?.emoji || '🏃'
)
const selectedSportLabel = computed(() =>
  sportOptions.find(o => o.value === selections.sport)?.label || ''
)
const selectedGoalLabel = computed(() =>
  goalOptions.find(o => o.value === selections.goal)?.label || ''
)
const selectedLevelLabel = computed(() =>
  levelOptions.find(o => o.value === selections.level)?.label || ''
)

function select(field, value) {
  selections[field] = value
}

function back() {
  if (step.value > 1) step.value--
}

function finish() {
  step.value = 7
}

function finishCoach() {
  step.value = 4
}

async function goToCoachDashboard() {
  saving.value = true
  axios.patch(`${API_URL}/users/me/preferences`, {
    sportsCoached: coachSelections.sports,
    athleteCount: coachSelections.athleteCount,
  }).catch(() => {})
  sessionStorage.removeItem('needs_onboarding')
  authStore.completeOnboarding()
  router.push('/coach/dashboard')
}

async function goToDashboard() {
  saving.value = true
  authStore.setUnitSystem(selections.units)

  // Fire-and-forget preferences save
  axios.patch(`${API_URL}/users/me/preferences`, {
    sport: selections.sport,
    goal: selections.goal,
    level: selections.level,
    trainingDays: selections.days,
  }).catch(() => {})

  sessionStorage.removeItem('needs_onboarding')
  authStore.completeOnboarding()
  router.push('/dashboard')
}
</script>

<style scoped>
.onboard-page {
  min-height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: column;
  position: relative;
  font-family: "Futura PT", "Futura", "Century Gothic", "Trebuchet MS", sans-serif;
}

/* ── Progress bar ── */
.progress-bar-track {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: #E5E5E5;
  z-index: 100;
}

.progress-bar-fill {
  height: 100%;
  background: #000;
  transition: width 0.4s ease;
}

/* ── Header row ── */
.onboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px 0;
  padding-top: calc(2px + 24px);
}

.btn-back {
  background: none;
  border: none;
  padding: 0;
  font-size: 0.85rem;
  font-weight: 400;
  color: #767676;
  cursor: pointer;
  letter-spacing: 0.02em;
  transition: color 0.2s;
}

.btn-back:hover {
  color: #000;
}

.btn-back.standalone {
  display: none; /* hidden — handled in header for steps 2–6 */
}

.step-counter {
  font-size: 0.65rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #767676;
  font-weight: 500;
}

/* ── Step containers ── */
.step-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 48px 40px 56px;
  max-width: 600px;
  width: 100%;
  margin: 0 auto;
}

.mt-auto {
  margin-top: auto;
}

/* ── Welcome step ── */
.step-welcome {
  justify-content: center;
  align-items: flex-start;
}

.welcome-inner {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.brand-lockup {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 48px;
}

.brand-square {
  width: 36px;
  height: 36px;
  background: #000;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 900;
}

.brand-name {
  font-size: 1rem;
  font-weight: 900;
  letter-spacing: 0.20em;
  color: #000;
}

.welcome-headline {
  font-size: clamp(2.2rem, 7vw, 4rem);
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 1.05;
  color: #000;
  margin: 0 0 20px;
}

.welcome-sub {
  font-size: 1rem;
  color: #767676;
  font-weight: 400;
  margin: 0 0 48px;
  letter-spacing: 0.01em;
}

/* ── Question ── */
.step-question {
  font-size: clamp(1.8rem, 5vw, 3rem);
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 1.1;
  color: #000;
  margin: 0 0 40px;
}

/* ── Tile grid ── */
.tile-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 32px;
}

.tile-grid--3 {
  grid-template-columns: 1fr 1fr 1fr;
}

.tile-grid--4 {
  grid-template-columns: repeat(4, 1fr);
}

.tile-grid--2 {
  grid-template-columns: 1fr 1fr;
}

/* Odd tile in 2-col grid gets full width */
.tile-grid > .tile:last-child:nth-child(odd) {
  grid-column: 1 / -1;
}

.tile {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  padding: 20px 24px;
  border: 1px solid #E5E5E5;
  border-radius: 0;
  background: #fff;
  cursor: pointer;
  text-align: left;
  transition: border-color 0.15s, background 0.15s, color 0.15s;
}

.tile:hover:not(.selected) {
  border-color: #000;
}

.tile.selected {
  background: #000;
  border-color: #000;
  color: #fff;
}

.tile--compact {
  padding: 16px 12px;
  align-items: center;
}

.tile--tall {
  padding: 28px 24px;
  gap: 10px;
}

.tile-emoji {
  font-size: 1.5rem;
  line-height: 1;
}

.tile-label {
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  line-height: 1.2;
}

.tile-sub {
  font-size: 0.72rem;
  letter-spacing: 0.04em;
  color: #767676;
  font-weight: 400;
}

.tile.selected .tile-sub {
  color: rgba(255, 255, 255, 0.7);
}

/* ── CTA button ── */
.btn-cta {
  display: block;
  width: 100%;
  padding: 16px 24px;
  background: #0052FF;
  color: #fff;
  border: none;
  border-radius: 0;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.10em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-cta:hover:not(:disabled) {
  background: #003ECC;
}

.btn-cta:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

/* ── Done step ── */
.step-done {
  align-items: flex-start;
  justify-content: flex-start;
  gap: 0;
}

.done-sport-emoji {
  font-size: 3rem;
  margin-bottom: 20px;
}

.done-headline {
  font-size: clamp(2rem, 6vw, 3.5rem);
  font-weight: 900;
  letter-spacing: -0.03em;
  color: #000;
  margin: 0 0 40px;
}

.done-summary {
  width: 100%;
  border-top: 1px solid #E5E5E5;
  margin-bottom: 40px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid #E5E5E5;
}

.summary-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #767676;
  font-weight: 500;
}

.summary-value {
  font-size: 0.85rem;
  font-weight: 700;
  color: #000;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

/* ── Responsive ── */
@media (max-width: 480px) {
  .step-container {
    padding: 40px 24px 48px;
  }

  .onboard-header {
    padding: 16px 24px 0;
  }

  .tile-grid--3 {
    grid-template-columns: 1fr 1fr;
  }

  .tile-grid--4 {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
