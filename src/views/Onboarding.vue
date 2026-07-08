<template>
  <div class="onboard-page">
    <!-- Progress bar (steps 2–7) -->
    <div class="progress-bar-track" v-if="step > 1">
      <div class="progress-bar-fill" :style="{ width: progressWidth }"></div>
    </div>

    <!-- Header row (steps 2–6, athlete only) -->
    <div class="onboard-header" v-if="!isCoach && step >= 2 && step <= 6">
      <button class="btn-back" @click="back">← Back</button>
      <span class="step-counter">{{ String(step - 1).padStart(2, '0') }} / 06</span>
    </div>
    <!-- Header row for coach steps -->
    <div class="onboard-header" v-if="isCoach && step >= 2 && step <= 4">
      <button class="btn-back" @click="back">← Back</button>
      <span class="step-counter">{{ String(step - 1).padStart(2, '0') }} / 03</span>
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
      <button class="btn-cta mt-auto" :disabled="!coachSelections.athleteCount" @click="step = 4">Continue</button>
    </div>

    <!-- ── Coach Step C3: Units ── -->
    <div v-else-if="step === 4 && isCoach" class="step-container">
      <h2 class="step-question">Which do<br>you prefer?</h2>
      <div class="tile-grid tile-grid--2">
        <button
          class="tile tile--tall"
          :class="{ selected: selections.units === 'imperial' }"
          @click="selections.units = 'imperial'"
        >
          <span class="tile-emoji">🇺🇸</span>
          <span class="tile-label">Miles &amp; feet</span>
          <span class="tile-sub">mi, ft, min/mi</span>
        </button>
        <button
          class="tile tile--tall"
          :class="{ selected: selections.units === 'metric' }"
          @click="selections.units = 'metric'"
        >
          <span class="tile-emoji">🌍</span>
          <span class="tile-label">Kilometers &amp; meters</span>
          <span class="tile-sub">km, m, min/km</span>
        </button>
      </div>
      <button class="btn-cta mt-auto" @click="step = 5">Continue</button>
    </div>

    <!-- ── Coach Done ── -->
    <div v-else-if="step === 5 && isCoach" class="step-container step-done">
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
        <div class="summary-row">
          <span class="summary-label">Units</span>
          <span class="summary-value">{{ selections.units === 'imperial' ? 'Miles & feet' : 'Kilometers & meters' }}</span>
        </div>
      </div>
      <div v-if="saveError" class="save-error">{{ saveError }}</div>
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
      <button class="btn-cta mt-auto" @click="step = 7">Continue</button>
    </div>

    <!-- ── Step 7: City ── -->
    <div v-else-if="step === 7" class="step-container">
      <button class="btn-back standalone" @click="back">← Back</button>
      <h2 class="step-question">Where do<br>you run?</h2>
      <p style="color:#767676;font-size:0.9rem;margin:-24px 0 28px;font-weight:300;">
        We'll use this to connect you with local run crews and events.
      </p>
      <div class="tile-grid" style="grid-template-columns:1fr;gap:0;">
        <input
          v-model="selections.city"
          class="city-input"
          placeholder="City (e.g. Austin, TX)"
          @keyup.enter="finish"
          autofocus
        />
      </div>
      <button class="btn-cta mt-auto" @click="finish">Continue</button>
    </div>

    <!-- ── Step 8: Done ── -->
    <div v-else-if="step === 8" class="step-container step-done">
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
      <div v-if="saveError" class="save-error">{{ saveError }}</div>
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

const saveError = ref('')

const router = useRouter()
const authStore = useAuthStore()
const { user, role } = storeToRefs(authStore)

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const step = ref(1)
const ATHLETE_STEPS = 6  // steps 2–7 are the 6 choice screens (city added)
const COACH_STEPS = 2    // steps 2–3 are the 2 coach choice screens
const saving = ref(false)

const isCoach = computed(() => role.value === 'coach')

const selections = reactive({
  city: '',
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
  const total = isCoach.value ? COACH_STEPS : ATHLETE_STEPS
  // step 2 = 1/total filled, step 6 (or 3 for coach) = total/total = 100%
  const filled = Math.min(step.value - 1, total)
  return `${(filled / total) * 100}%`
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
  step.value = 8
}

function finishCoach() {
  step.value = 4
}

async function goToCoachDashboard() {
  saving.value = true
  saveError.value = ''
  try {
    await axios.patch(`${API_URL}/users/me/preferences`, {
      sportsCoached: coachSelections.sports,
      athleteCount: coachSelections.athleteCount,
    })
    sessionStorage.removeItem('needs_onboarding')
    authStore.completeOnboarding()
    router.push('/coach/dashboard')
  } catch {
    saveError.value = 'Failed to save your preferences. Please try again.'
  } finally {
    saving.value = false
  }
}

async function goToDashboard() {
  saving.value = true
  saveError.value = ''
  authStore.setUnitSystem(selections.units)
  try {
    // Set city + sport + compute archetype via new onboarding endpoint
    await axios.post(`${API_URL}/auth/onboarding`, {
      city: selections.city || '',
      sport: selections.sport,
    })
    // Save training preferences separately
    await axios.patch(`${API_URL}/users/me/preferences`, {
      sport: selections.sport,
      goal: selections.goal,
      level: selections.level,
      trainingDays: selections.days,
    })
    sessionStorage.removeItem('needs_onboarding')
    authStore.completeOnboarding()
    router.push('/dashboard')
  } catch {
    saveError.value = 'Failed to save your preferences. Please try again.'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.onboard-page {
  min-height: 100vh;
  background: #FBF6EC;
  display: flex;
  flex-direction: column;
  position: relative;
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
}

/* ── Progress bar ── */
.progress-bar-track {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: #E7DFCE;
  z-index: 100;
}

.progress-bar-fill {
  height: 100%;
  background: #2A55F5;
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
  color: #5A5348;
  cursor: pointer;
  letter-spacing: 0.02em;
  transition: color 0.2s;
}

.btn-back:hover {
  color: #16130F;
}

.btn-back.standalone {
  display: none; /* hidden — handled in header for steps 2–6 */
}

.step-counter {
  font-size: 0.65rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #5A5348;
  font-weight: 500;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
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
  background: #16130F;
  color: #FBF6EC;
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
  color: #16130F;
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
}

.welcome-headline {
  font-size: clamp(2.2rem, 7vw, 4rem);
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.01em;
  line-height: 0.9;
  color: #16130F;
  margin: 0 0 20px;
}

.welcome-sub {
  font-size: 1rem;
  color: #5A5348;
  font-weight: 400;
  margin: 0 0 48px;
  letter-spacing: 0.01em;
}

/* ── Question ── */
.step-question {
  font-size: clamp(1.8rem, 5vw, 3rem);
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.01em;
  line-height: 0.9;
  color: #16130F;
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
  border: 2px solid #16130F;
  border-radius: 0;
  background: #fff;
  cursor: pointer;
  text-align: left;
  transition: border-color 0.15s, background 0.15s, color 0.15s;
}

.tile:hover:not(.selected) {
  border-color: #2A55F5;
}

.tile.selected {
  background: #16130F;
  border-color: #16130F;
  color: #FBF6EC;
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
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-weight: 700;
  letter-spacing: 0.08em;
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
  color: rgba(251, 246, 236, 0.7);
}

/* ── CTA button ── */
.btn-cta {
  display: block;
  width: 100%;
  padding: 16px 24px;
  background: #2A55F5;
  color: #fff;
  border: 2px solid #16130F;
  border-radius: 999px;
  box-shadow: 3px 3px 0 #16130F;
  font-size: 0.85rem;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-weight: 700;
  letter-spacing: 0.10em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-cta:hover:not(:disabled) {
  background: #1E42D6;
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
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.01em;
  line-height: 0.9;
  color: #16130F;
  margin: 0 0 40px;
}

.done-summary {
  width: 100%;
  border-top: 2px solid #E7DFCE;
  margin-bottom: 40px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0;
  border-bottom: 2px solid #E7DFCE;
}

.summary-label {
  font-size: 0.75rem;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #5A5348;
  font-weight: 500;
}

.summary-value {
  font-size: 0.85rem;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-weight: 700;
  color: #16130F;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

/* ── City input ── */
.city-input {
  width: 100%;
  padding: 18px 20px;
  border: 2px solid #16130F;
  border-radius: 0;
  font-size: 1rem;
  font-weight: 400;
  color: #16130F;
  background: #fff;
  outline: none;
  margin-bottom: 32px;
  transition: border-color 0.15s;
}
.city-input:focus {
  border-color: #2A55F5;
}
.city-input::placeholder {
  color: #C5C5C5;
}

/* ── Save error ── */
.save-error {
  width: 100%;
  padding: 12px 16px;
  background: #FEF2F2;
  border: 1px solid #FCA5A5;
  color: #DC2626;
  font-size: 0.82rem;
  font-weight: 500;
  margin-bottom: 16px;
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
