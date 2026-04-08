<!-- src/components/WorkoutStepBuilder.vue -->
<!-- Structured workout step editor — used in CoachPlanEditor + WorkoutLibrary -->
<template>
  <div class="step-builder">

    <!-- Summary bar -->
    <div class="sb-summary" v-if="steps.length">
      <span class="sb-summary-item">{{ steps.length }} step{{ steps.length !== 1 ? 's' : '' }}</span>
      <span class="sb-sep">·</span>
      <span class="sb-summary-item">~{{ totalMinutes }} min</span>
      <template v-if="totalDistance > 0">
        <span class="sb-sep">·</span>
        <span class="sb-summary-item">~{{ totalDistance.toFixed(1) }} {{ distLabel }}</span>
      </template>
    </div>

    <!-- Step list -->
    <div class="sb-steps">
      <div
        v-for="(step, idx) in steps"
        :key="step._id"
        class="sb-step"
        :style="{ borderLeft: `3px solid ${stepColor(step.type)}` }"
      >
        <!-- Row 1: type | duration | repeat | move/delete -->
        <div class="sb-row1">
          <select v-model="step.type" class="sb-sel sb-type-sel" @change="onChange">
            <option v-for="t in STEP_TYPES" :key="t.value" :value="t.value">{{ t.label }}</option>
          </select>

          <div class="sb-dur-wrap">
            <input
              v-model.number="step.duration"
              type="number" min="0" step="0.5"
              class="sb-num"
              @input="onChange"
            />
            <select v-model="step.durationType" class="sb-sel sb-unit-sel" @change="onChange">
              <option value="TIME">min</option>
              <option value="DISTANCE">{{ distLabel }}</option>
            </select>
          </div>

          <div v-if="step.type === 'INTERVAL' || step.type === 'SPRINT'" class="sb-rpt-wrap">
            <span class="sb-x-label">×</span>
            <input
              v-model.number="step.repeat"
              type="number" min="1" max="30"
              class="sb-num sb-rpt-num"
              @input="onChange"
            />
          </div>

          <div class="sb-btns">
            <button class="sb-btn" @click="moveUp(idx)"   :disabled="idx === 0"            title="Up"><i class="bi bi-chevron-up"></i></button>
            <button class="sb-btn" @click="moveDown(idx)" :disabled="idx === steps.length - 1" title="Down"><i class="bi bi-chevron-down"></i></button>
            <button class="sb-btn sb-del" @click="remove(idx)" title="Remove"><i class="bi bi-x"></i></button>
          </div>
        </div>

        <!-- Row 2: target -->
        <div class="sb-row2">
          <select v-model="step.targetType" class="sb-sel sb-tgt-sel" @change="onChange">
            <option value="FREE">No target</option>
            <option value="ZONE">Heart-rate zone</option>
            <option value="RPE">RPE</option>
            <option value="PACE">Pace range</option>
            <option value="HR_PCT">% Max HR</option>
          </select>

          <template v-if="step.targetType === 'ZONE'">
            <div class="sb-zones">
              <button
                v-for="z in [1,2,3,4,5]" :key="z"
                :class="['sb-zone-pill', { active: step.targetZone === z }]"
                :style="step.targetZone === z ? { background: zoneColor(z), color: '#fff', borderColor: zoneColor(z) } : {}"
                @click="step.targetZone = z; onChange()"
              >Z{{ z }}</button>
            </div>
            <span class="sb-zone-name" v-if="step.targetZone">{{ ZONE_NAMES[step.targetZone] }}</span>
          </template>

          <template v-else-if="step.targetType === 'RPE'">
            <div class="sb-rpe-wrap">
              <input v-model.number="step.targetRpe" type="range" min="1" max="10" class="sb-rpe" @input="onChange" />
              <span class="sb-rpe-val">{{ step.targetRpe || 5 }} / 10</span>
              <span class="sb-zone-name">{{ RPE_LABELS[Math.round(step.targetRpe || 5)] }}</span>
            </div>
          </template>

          <template v-else-if="step.targetType === 'PACE'">
            <div class="sb-range-wrap">
              <input v-model="step.targetPaceMin" class="sb-range-input" placeholder="7:00" @input="onChange" />
              <span class="sb-dash">–</span>
              <input v-model="step.targetPaceMax" class="sb-range-input" placeholder="7:30" @input="onChange" />
              <span class="sb-unit">min/{{ distLabel }}</span>
            </div>
          </template>

          <template v-else-if="step.targetType === 'HR_PCT'">
            <div class="sb-range-wrap">
              <input v-model.number="step.targetHrMin" type="number" min="50" max="100" class="sb-range-input" placeholder="65" @input="onChange" />
              <span class="sb-dash">–</span>
              <input v-model.number="step.targetHrMax" type="number" min="50" max="100" class="sb-range-input" placeholder="80" @input="onChange" />
              <span class="sb-unit">% max HR</span>
            </div>
          </template>
        </div>

        <!-- Row 3: notes -->
        <input
          v-model="step.notes"
          class="sb-notes"
          placeholder="Step notes (optional)"
          @input="onChange"
        />
      </div>

      <div v-if="steps.length === 0" class="sb-empty">
        No steps yet — add warmup, main set, and cooldown below
      </div>
    </div>

    <!-- Quick-add buttons -->
    <div class="sb-add-row">
      <button
        v-for="q in QUICK_ADD" :key="q.type"
        class="sb-quick"
        :style="{ borderColor: stepColor(q.type), color: stepColor(q.type) }"
        @click="addStep(q.type)"
      >+ {{ q.label }}</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUnits } from '@/composables/useUnits'

const props = defineProps({
  steps: { type: Array, default: () => [] }
})
const emit = defineEmits(['update:steps'])

const { isImperial } = useUnits()
const distLabel = computed(() => isImperial.value ? 'mi' : 'km')

const STEP_TYPES = [
  { value: 'WARMUP',    label: 'Warmup'    },
  { value: 'EASY',      label: 'Easy'      },
  { value: 'AEROBIC',   label: 'Aerobic'   },
  { value: 'TEMPO',     label: 'Tempo'     },
  { value: 'THRESHOLD', label: 'Threshold' },
  { value: 'VO2MAX',    label: 'VO₂Max'    },
  { value: 'INTERVAL',  label: 'Interval'  },
  { value: 'SPRINT',    label: 'Sprint'    },
  { value: 'RECOVERY',  label: 'Recovery'  },
  { value: 'COOLDOWN',  label: 'Cooldown'  },
]

const QUICK_ADD = [
  { type: 'WARMUP',   label: 'Warmup'    },
  { type: 'INTERVAL', label: 'Interval'  },
  { type: 'TEMPO',    label: 'Tempo'     },
  { type: 'RECOVERY', label: 'Recovery'  },
  { type: 'COOLDOWN', label: 'Cooldown'  },
]

const STEP_COLORS = {
  WARMUP:    '#fb923c',
  EASY:      '#22c55e',
  AEROBIC:   '#4ade80',
  TEMPO:     '#f59e0b',
  THRESHOLD: '#ef4444',
  VO2MAX:    '#8b5cf6',
  INTERVAL:  '#3b82f6',
  SPRINT:    '#dc2626',
  RECOVERY:  '#60a5fa',
  COOLDOWN:  '#94a3b8',
}
const ZONE_COLORS = { 1: '#60a5fa', 2: '#22c55e', 3: '#f59e0b', 4: '#ef4444', 5: '#8b5cf6' }
const ZONE_NAMES  = { 1: 'Active Recovery', 2: 'Aerobic', 3: 'Tempo', 4: 'Threshold', 5: 'VO₂Max' }
const RPE_LABELS  = { 1:'Very light', 2:'Light', 3:'Light', 4:'Moderate', 5:'Moderate', 6:'Somewhat hard', 7:'Hard', 8:'Hard', 9:'Very hard', 10:'Max' }

const stepColor = (t) => STEP_COLORS[t] || '#9ca3af'
const zoneColor = (z) => ZONE_COLORS[z] || '#767676'

const DEFAULT_DURATIONS = {
  WARMUP:    { duration: 10,   durationType: 'TIME',     targetZone: 2 },
  EASY:      { duration: 30,   durationType: 'TIME',     targetZone: 2 },
  AEROBIC:   { duration: 30,   durationType: 'TIME',     targetZone: 3 },
  TEMPO:     { duration: 20,   durationType: 'TIME',     targetZone: 3 },
  THRESHOLD: { duration: 3,    durationType: 'DISTANCE', targetZone: 4 },
  VO2MAX:    { duration: 0.5,  durationType: 'DISTANCE', targetZone: 5, repeat: 5 },
  INTERVAL:  { duration: 0.5,  durationType: 'DISTANCE', targetZone: 5, repeat: 4 },
  SPRINT:    { duration: 0.25, durationType: 'DISTANCE', targetZone: 5, repeat: 6 },
  RECOVERY:  { duration: 5,    durationType: 'TIME',     targetZone: 1 },
  COOLDOWN:  { duration: 10,   durationType: 'TIME',     targetZone: 1 },
}

// Rough time estimates for distance-based steps (min per unit)
const PACE_ESTIMATE = {
  WARMUP: 9, EASY: 9, AEROBIC: 8.5, TEMPO: 7, THRESHOLD: 6.5,
  VO2MAX: 5.5, INTERVAL: 6, SPRINT: 4, RECOVERY: 10, COOLDOWN: 9
}

const totalMinutes = computed(() =>
  props.steps.reduce((s, step) => {
    const rep = step.repeat || 1
    const dur = step.duration || 0
    if (step.durationType === 'TIME') return s + dur * rep
    return s + dur * (PACE_ESTIMATE[step.type] || 8) * rep
  }, 0)
)

const totalDistance = computed(() =>
  props.steps.reduce((s, step) => {
    if (step.durationType === 'DISTANCE') return s + (step.duration || 0) * (step.repeat || 1)
    return s
  }, 0)
)

const onChange = () => emit('update:steps', [...props.steps])

const addStep = (type) => {
  const defaults = DEFAULT_DURATIONS[type] || { duration: 10, durationType: 'TIME' }
  emit('update:steps', [
    ...props.steps,
    {
      _id: `${Date.now()}-${Math.random()}`,
      type,
      duration:    defaults.duration,
      durationType: defaults.durationType,
      repeat:      defaults.repeat || 1,
      targetType:  'ZONE',
      targetZone:  defaults.targetZone || 2,
      targetRpe:   5,
      targetPaceMin: '',
      targetPaceMax: '',
      targetHrMin:  65,
      targetHrMax:  80,
      notes: '',
    }
  ])
}

const remove = (idx) => emit('update:steps', props.steps.filter((_, i) => i !== idx))

const moveUp = (idx) => {
  if (idx === 0) return
  const arr = [...props.steps]
  ;[arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]]
  emit('update:steps', arr)
}
const moveDown = (idx) => {
  if (idx === props.steps.length - 1) return
  const arr = [...props.steps]
  ;[arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]]
  emit('update:steps', arr)
}
</script>

<style scoped>
.step-builder {
  border: 1px solid #E5E5E5;
  padding: 16px;
  background: #FAFAFA;
  font-family: "Futura PT", Futura, system-ui, sans-serif;
}

.sb-summary {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #767676;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid #EBEBEB;
}
.sb-sep { color: #D0D0D0; }

.sb-steps { display: flex; flex-direction: column; gap: 6px; margin-bottom: 10px; }

.sb-step {
  background: #fff;
  border: 1px solid #EBEBEB;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: border-color 0.15s;
}
.sb-step:hover { border-color: #D5D5D5; }

/* Row 1 */
.sb-row1 {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.sb-sel {
  border: 1px solid #E5E5E5;
  background: #fff;
  font-family: inherit;
  font-size: 0.78rem;
  font-weight: 600;
  color: #000;
  padding: 5px 8px;
  outline: none;
  cursor: pointer;
  border-radius: 0;
  appearance: auto;
}
.sb-sel:focus { border-color: #000; }
.sb-type-sel { flex: 1; min-width: 110px; max-width: 140px; }
.sb-unit-sel { min-width: 58px; }

.sb-dur-wrap { display: flex; align-items: center; gap: 4px; }
.sb-rpt-wrap { display: flex; align-items: center; gap: 4px; }
.sb-x-label  { font-size: 0.82rem; font-weight: 700; color: #767676; }

.sb-num {
  width: 58px;
  padding: 5px 8px;
  border: 1px solid #E5E5E5;
  font-family: inherit;
  font-size: 0.82rem;
  font-weight: 600;
  text-align: center;
  outline: none;
  border-radius: 0;
}
.sb-num:focus { border-color: #000; }
.sb-rpt-num { width: 42px; }

.sb-btns { display: flex; gap: 3px; margin-left: auto; }
.sb-btn {
  width: 26px; height: 26px;
  background: #fff; border: 1px solid #E5E5E5;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; font-size: 0.75rem; color: #767676;
  transition: all 0.15s; border-radius: 0;
}
.sb-btn:hover  { border-color: #000; color: #000; }
.sb-btn:disabled { opacity: 0.25; cursor: not-allowed; }
.sb-del:hover  { border-color: #ef4444; color: #ef4444; }

/* Row 2 */
.sb-row2 {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.sb-tgt-sel { min-width: 140px; }

.sb-zones { display: flex; gap: 3px; }
.sb-zone-pill {
  width: 30px; height: 26px;
  border: 1px solid #E5E5E5;
  background: #fff; color: #767676;
  font-size: 0.7rem; font-weight: 700;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  border-radius: 0; transition: all 0.15s;
}
.sb-zone-pill:hover { border-color: #000; }
.sb-zone-name { font-size: 0.7rem; font-weight: 600; color: #767676; }

.sb-rpe-wrap { display: flex; align-items: center; gap: 8px; }
.sb-rpe { width: 90px; }
.sb-rpe-val { font-size: 0.78rem; font-weight: 700; min-width: 28px; }

.sb-range-wrap { display: flex; align-items: center; gap: 6px; }
.sb-range-input {
  width: 50px; padding: 5px 6px;
  border: 1px solid #E5E5E5;
  font-family: inherit; font-size: 0.78rem; font-weight: 600;
  text-align: center; outline: none; border-radius: 0;
}
.sb-range-input:focus { border-color: #000; }
.sb-dash { color: #767676; font-size: 0.78rem; }
.sb-unit { font-size: 0.7rem; color: #767676; font-weight: 600; }

/* Notes */
.sb-notes {
  width: 100%;
  padding: 5px 8px;
  border: none;
  border-top: 1px solid #F0F0F0;
  background: transparent;
  font-family: inherit;
  font-size: 0.75rem;
  color: #767676;
  outline: none;
  box-sizing: border-box;
}
.sb-notes::placeholder { color: #C0C0C0; }
.sb-notes:focus { color: #000; }

.sb-empty {
  padding: 18px;
  text-align: center;
  color: #BDBDBD;
  font-size: 0.78rem;
  font-weight: 600;
  border: 1px dashed #E5E5E5;
  background: #fff;
}

/* Add row */
.sb-add-row { display: flex; gap: 6px; flex-wrap: wrap; padding-top: 4px; }
.sb-quick {
  padding: 5px 12px;
  background: #fff;
  border: 1px solid;
  font-family: inherit;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  cursor: pointer;
  border-radius: 0;
  transition: opacity 0.15s;
}
.sb-quick:hover { opacity: 0.7; }
</style>
