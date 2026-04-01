<template>
  <main class="plan-editor" v-if="plan">
    <!-- Sticky Header Bar -->
    <div class="editor-bar">
      <div class="editor-bar-inner">
        <div class="editor-title-wrap">
          <input
            v-model="planName"
            class="editor-title-input"
            type="text"
            placeholder="Plan name…"
            @input="markDirty"
          />
          <span class="dirty-dot" :class="{ dirty: isDirty }"></span>
        </div>
        <div class="editor-meta">
          <span v-if="plan.athleteName" class="athlete-chip">{{ plan.athleteName }}</span>
          <span v-if="plan.sport" class="sport-badge">{{ plan.sport }}</span>
        </div>
        <button class="btn-save" @click="savePlan" :disabled="saving">
          <span v-if="saving" class="spinner-border spinner-border-sm"></span>
          <span v-else>Save</span>
        </button>
      </div>
    </div>

    <!-- Error banners -->
    <div v-if="saveError" class="editor-error">
      <i class="bi bi-exclamation-circle-fill me-2"></i>{{ saveError }}
      <button class="editor-error-dismiss" @click="saveError = ''"><i class="bi bi-x"></i></button>
    </div>
    <div v-if="deleteError" class="editor-error">
      <i class="bi bi-exclamation-circle-fill me-2"></i>{{ deleteError }}
      <button class="editor-error-dismiss" @click="deleteError = ''"><i class="bi bi-x"></i></button>
    </div>

    <!-- Week Tabs -->
    <div class="week-tabs-wrap">
      <div class="week-tabs">
        <button
          v-for="w in weeks"
          :key="w"
          :class="['week-tab', { active: activeWeek === w }]"
          @click="activeWeek = w"
        >W{{ w }}</button>
      </div>
    </div>

    <!-- Week Content -->
    <div class="week-content" v-if="currentWeekData">
      <!-- Week Theme -->
      <div class="week-theme-row">
        <label class="field-label">WEEK THEME</label>
        <input
          v-model="currentWeekData.theme"
          class="theme-input"
          type="text"
          placeholder="e.g. Base building, Recovery…"
          @blur="saveWeekTheme"
        />
      </div>

      <!-- Workout Cards -->
      <div class="workout-list">
        <div
          v-for="workout in currentWeekData.workouts"
          :key="workout.id"
          class="workout-card"
        >
          <div class="workout-top-row">
            <select v-model="workout.day" class="day-select" @change="saveWorkout(workout)">
              <option v-for="d in days" :key="d" :value="d">{{ d }}</option>
            </select>
            <select v-model="workout.type" class="type-select" @change="saveWorkout(workout)">
              <option v-for="t in workoutTypes" :key="t" :value="t">{{ t }}</option>
            </select>
            <button class="btn-trash" @click="confirmDelete(workout)" title="Delete workout">
              <i class="bi bi-trash"></i>
            </button>
          </div>
          <div class="workout-fields">
            <div class="field-group">
              <label class="field-label">DISTANCE</label>
              <div class="input-unit-row">
                <input
                  v-model.number="workout.distance"
                  type="number" min="0" step="0.1"
                  class="field-input"
                  @blur="saveWorkout(workout)"
                />
                <span class="unit-label">mi</span>
              </div>
            </div>
            <div class="field-group">
              <label class="field-label">DURATION</label>
              <div class="input-unit-row">
                <input
                  v-model.number="workout.duration"
                  type="number" min="0"
                  class="field-input"
                  @blur="saveWorkout(workout)"
                />
                <span class="unit-label">min</span>
              </div>
            </div>
          </div>
          <div class="field-group full-width">
            <label class="field-label">DESCRIPTION</label>
            <textarea
              v-model="workout.description"
              class="desc-textarea"
              rows="2"
              placeholder="Workout notes…"
              @blur="saveWorkout(workout)"
              @input="autoResize($event)"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Add Workout Row -->
      <button class="btn-add-workout" @click="addWorkout">
        + Add Workout
      </button>
    </div>

    <!-- Delete Confirm Modal -->
    <div v-if="deleteTarget" class="modal-backdrop" @click.self="deleteTarget = null">
      <div class="modal-box">
        <h3 class="modal-title">Delete workout?</h3>
        <p class="modal-sub">This cannot be undone.</p>
        <div class="modal-actions">
          <button class="btn-cancel" @click="deleteTarget = null">Cancel</button>
          <button class="btn-confirm-delete" @click="doDelete">Delete</button>
        </div>
      </div>
    </div>
  </main>

  <main v-else class="plan-editor-loading">
    <div v-if="loading" class="loading-state">
      <div class="spinner-border spinner-border-sm me-2"></div> Loading plan…
    </div>
    <div v-else class="loading-state">Plan not found.</div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePlanStore } from '@/stores/plan'

const route = useRoute()
const router = useRouter()
const planStore = usePlanStore()

const plan = ref(null)
const loading = ref(true)
const saving = ref(false)
const saveError = ref('')
const deleteError = ref('')
const isDirty = ref(false)
const planName = ref('')
const activeWeek = ref(1)
const weeks = ref([])
const weekData = ref({}) // { [weekNum]: { theme, workouts[] } }
const deleteTarget = ref(null)

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const workoutTypes = ['Easy Run', 'Tempo Run', 'Long Run', 'Interval', 'Recovery Run', 'Cross Train', 'Strength', 'Rest']

const currentWeekData = computed(() => weekData.value[activeWeek.value])

const markDirty = () => { isDirty.value = true }

const savePlan = async () => {
  saving.value = true
  saveError.value = ''
  try {
    await planStore.updatePlan(plan.value.id, { name: planName.value })
    isDirty.value = false
  } catch {
    saveError.value = 'Failed to save plan. Please try again.'
  } finally {
    saving.value = false
  }
}

const saveWeekTheme = async () => {
  try {
    await planStore.updatePlan(plan.value.id, {
      weekThemes: { [activeWeek.value]: currentWeekData.value?.theme }
    })
  } catch (err) {
    console.error('Failed to save week theme:', err)
  }
}

const saveWorkout = async (workout) => {
  if (!workout.id) return
  try {
    await planStore.updateWorkout(plan.value.id, workout.id, {
      name: workout.name,
      type: workout.type,
      day: workout.day,
      distance: workout.distance,
      duration: workout.duration,
      description: workout.description,
    })
  } catch (err) {
    console.error('Failed to save workout:', err)
    saveError.value = 'A workout change could not be saved. Please refresh and try again.'
  }
}

const addWorkout = async () => {
  const blank = {
    id: null,
    day: 'Monday',
    type: 'Easy Run',
    distance: 0,
    duration: 0,
    description: '',
    name: 'New Workout',
  }
  try {
    const saved = await planStore.addWorkout(plan.value.id, activeWeek.value, blank)
    if (!weekData.value[activeWeek.value]) {
      weekData.value[activeWeek.value] = { theme: '', workouts: [] }
    }
    weekData.value[activeWeek.value].workouts.push(saved || { ...blank, id: Date.now() })
  } catch {
    // Optimistically add anyway
    if (!weekData.value[activeWeek.value]) {
      weekData.value[activeWeek.value] = { theme: '', workouts: [] }
    }
    weekData.value[activeWeek.value].workouts.push({ ...blank, id: Date.now() })
  }
}

const confirmDelete = (workout) => { deleteTarget.value = workout }

const doDelete = async () => {
  const workout = deleteTarget.value
  deleteTarget.value = null
  if (!workout?.id) return
  try {
    await planStore.deleteWorkout(plan.value.id, workout.id)
    weekData.value[activeWeek.value].workouts = weekData.value[activeWeek.value].workouts.filter(w => w.id !== workout.id)
  } catch {
    deleteError.value = 'Failed to delete workout. Please try again.'
  }
}

const autoResize = (e) => {
  const el = e.target
  el.style.height = 'auto'
  el.style.height = el.scrollHeight + 'px'
}

const buildWeekData = (planData) => {
  const numWeeks = planData.durationWeeks || (planData.weeks?.length) || 4
  weeks.value = Array.from({ length: numWeeks }, (_, i) => i + 1)

  if (planData.weeks) {
    planData.weeks.forEach((w, i) => {
      weekData.value[i + 1] = {
        theme: w.theme || '',
        workouts: Array.isArray(w.workouts) ? w.workouts : []
      }
    })
  } else {
    weeks.value.forEach(w => {
      weekData.value[w] = { theme: '', workouts: [] }
    })
  }
}

onMounted(async () => {
  const planId = route.params.planId
  try {
    const data = await planStore.fetchPlan(planId)
    plan.value = data
    planName.value = data.name || ''
    buildWeekData(data)
  } catch {
    router.replace('/coach/dashboard')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.plan-editor {
  min-height: 100vh;
  background: #fff;
  padding-top: var(--nav-h, 64px);
  font-family: "Futura PT", Futura, "Century Gothic", system-ui, sans-serif;
}

/* Sticky editor bar */
.editor-bar {
  position: sticky;
  top: var(--nav-h, 64px);
  z-index: 100;
  background: #000;
  border-bottom: none;
}
.editor-bar-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 24px;
  height: 60px;
  display: flex;
  align-items: center;
  gap: 16px;
}
.editor-title-wrap { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
.editor-title-input {
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(255,255,255,0.25);
  color: #fff;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  padding: 4px 0;
  min-width: 0;
  flex: 1;
  outline: none;
  font-family: inherit;
}
.editor-title-input::placeholder { color: rgba(255,255,255,0.35); }
.editor-title-input:focus { border-bottom-color: rgba(255,255,255,0.7); }
.dirty-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: rgba(255,255,255,0.2);
  flex-shrink: 0; transition: background 0.2s;
}
.dirty-dot.dirty { background: #0052FF; }
.editor-meta { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.athlete-chip { padding: 3px 10px; background: rgba(255,255,255,0.12); color: rgba(255,255,255,0.75); font-size: 0.72rem; font-weight: 600; letter-spacing: 0.06em; }
.sport-badge { padding: 3px 10px; background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.55); font-size: 0.7rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; }
.btn-save {
  padding: 8px 22px;
  background: #fff; color: #000; border: none;
  font-size: 0.78rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
  cursor: pointer; flex-shrink: 0;
}
.btn-save:hover { background: #e5e5e5; }
.btn-save:disabled { opacity: 0.5; cursor: not-allowed; }

.editor-error {
  background: rgba(239,68,68,0.08);
  border-bottom: 1px solid rgba(239,68,68,0.20);
  color: #dc2626;
  font-size: 0.88rem;
  font-weight: 600;
  padding: 10px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.editor-error-dismiss {
  background: none;
  border: none;
  color: #dc2626;
  cursor: pointer;
  padding: 0 4px;
  font-size: 1rem;
  line-height: 1;
}

/* Week tabs */
.week-tabs-wrap { border-bottom: 1px solid #E5E5E5; overflow-x: auto; }
.week-tabs { display: flex; gap: 0; max-width: 1100px; margin: 0 auto; padding: 0 24px; }
.week-tab {
  padding: 12px 20px;
  background: none; border: none; border-bottom: 2px solid transparent;
  font-size: 0.78rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
  color: #767676; cursor: pointer; white-space: nowrap;
  transition: color 0.15s, border-color 0.15s;
}
.week-tab.active { color: #000; border-bottom-color: #000; }

/* Week content */
.week-content { max-width: 900px; margin: 0 auto; padding: 32px 24px; }

.week-theme-row { display: flex; flex-direction: column; gap: 6px; margin-bottom: 32px; }
.theme-input {
  border: none; border-bottom: 1px solid #E5E5E5;
  padding: 8px 0; font-size: 0.95rem; font-weight: 600; color: #000;
  outline: none; font-family: inherit; background: transparent;
}
.theme-input:focus { border-bottom-color: #000; }
.theme-input::placeholder { color: #BDBDBD; font-weight: 400; }

/* Workout cards */
.workout-list { display: flex; flex-direction: column; gap: 16px; margin-bottom: 20px; }
.workout-card { border: 1px solid #E5E5E5; padding: 20px; }
.workout-top-row { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
.day-select, .type-select {
  padding: 6px 10px; border: 1px solid #E5E5E5; background: #fff;
  font-size: 0.82rem; font-weight: 600; font-family: inherit;
  color: #000; outline: none; cursor: pointer;
  border-radius: 0;
}
.day-select:focus, .type-select:focus { border-color: #000; }
.btn-trash {
  margin-left: auto; background: none; border: none;
  color: #BDBDBD; font-size: 1rem; cursor: pointer; padding: 4px 8px;
  transition: color 0.15s;
}
.btn-trash:hover { color: #ef4444; }

.workout-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
.field-group { display: flex; flex-direction: column; gap: 6px; }
.field-group.full-width { grid-column: 1 / -1; }
.field-label { font-size: 0.62rem; font-weight: 700; letter-spacing: 0.12em; color: #767676; text-transform: uppercase; }
.input-unit-row { display: flex; align-items: center; gap: 8px; }
.field-input {
  width: 80px; padding: 7px 10px; border: 1px solid #E5E5E5;
  font-size: 0.9rem; font-weight: 600; font-family: inherit;
  color: #000; outline: none; border-radius: 0; background: #fff;
}
.field-input:focus { border-color: #000; }
.unit-label { font-size: 0.78rem; color: #767676; font-weight: 600; }
.desc-textarea {
  width: 100%; padding: 10px; border: 1px solid #E5E5E5;
  font-size: 0.88rem; font-family: inherit; color: #000;
  resize: none; outline: none; overflow: hidden;
  min-height: 60px; border-radius: 0;
}
.desc-textarea:focus { border-color: #000; }

/* Add workout */
.btn-add-workout {
  width: 100%; padding: 14px;
  background: #fff; color: #767676;
  border: 1px dashed #BDBDBD; font-size: 0.82rem; font-weight: 600;
  letter-spacing: 0.06em; cursor: pointer; font-family: inherit;
  transition: border-color 0.15s, color 0.15s;
}
.btn-add-workout:hover { border-color: #000; border-style: solid; color: #000; }

/* Modal */
.modal-backdrop {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5);
  z-index: 9000; display: flex; align-items: center; justify-content: center;
}
.modal-box { background: #fff; padding: 32px; max-width: 360px; width: calc(100% - 48px); }
.modal-title { font-size: 1.1rem; font-weight: 700; margin: 0 0 8px; }
.modal-sub { font-size: 0.88rem; color: #767676; margin: 0 0 24px; }
.modal-actions { display: flex; gap: 10px; }
.btn-cancel {
  flex: 1; padding: 12px; background: #fff; color: #000;
  border: 1px solid #E5E5E5; font-size: 0.82rem; font-weight: 600; cursor: pointer;
}
.btn-confirm-delete {
  flex: 1; padding: 12px; background: #ef4444; color: #fff;
  border: none; font-size: 0.82rem; font-weight: 700; cursor: pointer;
  letter-spacing: 0.04em; text-transform: uppercase;
}

.plan-editor-loading { min-height: 100vh; padding-top: var(--nav-h, 64px); display: flex; align-items: center; justify-content: center; }
.loading-state { display: flex; align-items: center; color: #767676; font-size: 0.9rem; }

.spinner-border { width: 1rem; height: 1rem; border: 2px solid rgba(0,0,0,0.10); border-top-color: #000; border-radius: 50%; animation: spin 0.75s linear infinite; display: inline-block; }
.spinner-border-sm { width: 0.85rem; height: 0.85rem; }
.me-2 { margin-right: 8px; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
