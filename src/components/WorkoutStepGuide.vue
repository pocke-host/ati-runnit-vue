<!-- src/components/WorkoutStepGuide.vue -->
<template>
  <div v-if="workout" class="wsg">
    <!-- Header bar -->
    <div class="wsg-header">
      <span class="wsg-overline">WORKOUT GUIDE</span>
      <span class="wsg-type-chip" :style="{ background: typeColor }">{{ workout.workoutType }}</span>
    </div>

    <!-- Current step -->
    <div class="wsg-step-current">
      <div class="wsg-step-label">STEP {{ currentStepIndex + 1 }} OF {{ steps.length }}</div>
      <div class="wsg-step-name">{{ currentStep.name }}</div>
      <div class="wsg-step-target" v-if="currentStep.targetPace">
        <i class="bi bi-speedometer2 me-1"></i>Target: {{ currentStep.targetPace }}
      </div>
      <div class="wsg-step-desc" v-if="currentStep.desc">{{ currentStep.desc }}</div>

      <!-- Progress within step -->
      <div class="wsg-step-progress">
        <div class="wsg-prog-bar">
          <div class="wsg-prog-fill" :style="{ width: Math.min(stepProgressPct, 100) + '%' }"></div>
        </div>
        <div class="wsg-prog-label">{{ stepProgressLabel }}</div>
      </div>
    </div>

    <!-- Next step preview -->
    <div v-if="nextStep" class="wsg-next">
      <span class="wsg-next-label">NEXT UP</span>
      <span class="wsg-next-name">{{ nextStep.name }}</span>
    </div>

    <!-- Overall progress dots -->
    <div class="wsg-dots">
      <div
        v-for="(s, i) in steps"
        :key="i"
        :class="['wsg-dot', {
          'wsg-dot-done': i < currentStepIndex,
          'wsg-dot-active': i === currentStepIndex,
        }]"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUnits } from '@/composables/useUnits'

const props = defineProps({
  workout: { type: Object, default: null },
  elapsedSeconds: { type: Number, default: 0 },
})

const { formatPace } = useUnits()

// Generate steps from workout definition
const steps = computed(() => {
  const w = props.workout
  if (!w) return []

  // targetPaceSeconds is seconds per km → divide by 60 to get min/km for formatPace
  const targetPaceStr = w.targetPaceSeconds
    ? formatPace(w.targetPaceSeconds / 60)
    : null

  if (w.workoutType === 'INTERVAL') {
    // Derive rep count from total distance: each interval ~800m, clamped 2–8
    const reps = Math.max(2, Math.min(8, Math.round((w.distanceMeters || 5000) / 800)))
    const result = []
    result.push({ name: 'Warm-Up', durationSec: 600, targetPace: null, desc: 'Easy jog, loosen up' })
    for (let i = 1; i <= reps; i++) {
      result.push({ name: `Interval ${i}/${reps}`, durationSec: 120, targetPace: targetPaceStr, desc: 'Hard effort — push the pace' })
      if (i < reps) result.push({ name: `Recovery ${i}`, durationSec: 90, targetPace: null, desc: 'Walk or easy jog' })
    }
    result.push({ name: 'Cool-Down', durationSec: 600, targetPace: null, desc: 'Easy jog, let the legs flush' })
    return result
  }

  if (w.workoutType === 'TEMPO') {
    const totalSec = (w.durationMinutes || 40) * 60
    return [
      { name: 'Warm-Up', durationSec: 600, targetPace: null, desc: 'Easy 10 minutes' },
      { name: 'Tempo Block', durationSec: Math.max(1200, totalSec - 1200), targetPace: targetPaceStr, desc: 'Comfortably hard — you can speak in short phrases' },
      { name: 'Cool-Down', durationSec: 600, targetPace: null, desc: 'Easy 10 minutes' },
    ]
  }

  // EASY / LONG_RUN / RECOVERY / REST — single-step guide
  const names = { EASY: 'Easy Run', LONG_RUN: 'Long Run', RECOVERY: 'Recovery Jog', REST: 'Rest Day' }
  const descs = { EASY: 'Conversational pace. Zone 2.', LONG_RUN: 'Slow and steady. Build time on feet.', RECOVERY: 'Very easy — just keep moving.' }
  return [{
    name: names[w.workoutType] || w.workoutType,
    durationSec: (w.durationMinutes || 30) * 60,
    targetPace: targetPaceStr,
    desc: descs[w.workoutType] || w.description || '',
  }]
})

// Which step are we currently on based on elapsed time
const currentStepIndex = computed(() => {
  let acc = 0
  for (let i = 0; i < steps.value.length; i++) {
    acc += steps.value[i].durationSec
    if (props.elapsedSeconds < acc) return i
  }
  // Clamp to last step once we've exceeded total workout time
  return steps.value.length - 1
})

const currentStep = computed(() => steps.value[currentStepIndex.value] || {})
const nextStep = computed(() => steps.value[currentStepIndex.value + 1] || null)

// Seconds elapsed at the start of the current step
const stepStartSec = computed(() => {
  let acc = 0
  for (let i = 0; i < currentStepIndex.value; i++) acc += steps.value[i].durationSec
  return acc
})

const stepElapsed = computed(() => props.elapsedSeconds - stepStartSec.value)

// 0–100 percentage through the current step
const stepProgressPct = computed(() => {
  const dur = currentStep.value.durationSec || 1
  return (stepElapsed.value / dur) * 100
})

// Countdown label: "m:ss remaining"
const stepProgressLabel = computed(() => {
  const remaining = Math.max(0, (currentStep.value.durationSec || 0) - stepElapsed.value)
  const m = Math.floor(remaining / 60)
  const s = remaining % 60
  return `${m}:${String(s).padStart(2, '0')} remaining`
})

// Brand color per workout type
const typeColor = computed(() => ({
  INTERVAL: '#ef4444',
  TEMPO: '#0052FF',
  EASY: '#22c55e',
  LONG_RUN: '#8b5cf6',
  RECOVERY: '#06b6d4',
  REST: '#767676',
}[props.workout?.workoutType] || '#767676'))
</script>

<style scoped>
.wsg {
  background: #000;
  color: #fff;
  padding: 16px 20px;
  border-bottom: 2px solid #0052FF;
  font-family: Futura, "Avenir Next", system-ui, sans-serif;
}

.wsg-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.wsg-overline {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  color: rgba(255, 255, 255, 0.55);
}

.wsg-type-chip {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 3px 10px;
  color: #fff;
}

.wsg-step-current {
  margin-bottom: 12px;
}

.wsg-step-label {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  color: rgba(255, 255, 255, 0.45);
  margin-bottom: 4px;
}

.wsg-step-name {
  font-size: 1.3rem;
  font-weight: 900;
  letter-spacing: -0.02em;
  line-height: 1.1;
  margin-bottom: 4px;
}

.wsg-step-target {
  font-size: 0.82rem;
  font-weight: 700;
  color: #0052FF;
  margin-bottom: 4px;
}

.wsg-step-desc {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.60);
  margin-bottom: 10px;
}

.wsg-step-progress {
  margin-top: 10px;
}

.wsg-prog-bar {
  height: 4px;
  background: rgba(255, 255, 255, 0.15);
  margin-bottom: 6px;
}

.wsg-prog-fill {
  height: 100%;
  background: #0052FF;
  transition: width 1s linear;
}

.wsg-prog-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.55);
  font-variant-numeric: tabular-nums;
}

.wsg-next {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  margin-bottom: 10px;
}

.wsg-next-label {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  color: rgba(255, 255, 255, 0.40);
  white-space: nowrap;
}

.wsg-next-name {
  font-size: 0.82rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.70);
}

.wsg-dots {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.wsg-dot {
  width: 8px;
  height: 8px;
  background: rgba(255, 255, 255, 0.15);
  flex-shrink: 0;
}

.wsg-dot-done {
  background: #22c55e;
}

.wsg-dot-active {
  background: #0052FF;
}
</style>
