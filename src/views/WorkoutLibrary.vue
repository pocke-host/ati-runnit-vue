<!-- src/views/WorkoutLibrary.vue — Coach workout library (reusable workouts) -->
<template>
  <main class="library-page">

    <!-- Hero -->
    <section class="lib-hero">
      <div class="lib-hero-inner">
        <div class="lib-kicker">COACHING HUB</div>
        <div class="lib-hero-row">
          <h1 class="lib-title">Workout Library</h1>
          <button class="btn-new" @click="openNew">
            <i class="bi bi-plus me-1"></i> New Workout
          </button>
        </div>
        <p class="lib-sub">Build reusable workouts. Assign to any athlete in one click.</p>
      </div>
    </section>

    <!-- Filter tabs -->
    <div class="lib-tabs-bar">
      <div class="lib-tabs">
        <button
          v-for="f in FILTERS" :key="f.value"
          :class="['lib-tab', { active: activeFilter === f.value }]"
          @click="activeFilter = f.value"
        >
          {{ f.label }}
          <span class="lib-tab-count">{{ filterCount(f.value) }}</span>
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="lib-content">
      <!-- Loading -->
      <div v-if="libStore.loading" class="lib-empty">
        <div class="spinner-border"></div>
        <p>Loading library…</p>
      </div>

      <!-- Empty -->
      <div v-else-if="filtered.length === 0 && libStore.library.length === 0" class="lib-empty">
        <i class="bi bi-collection" style="font-size:2.5rem;color:#D0D0D0"></i>
        <p>Your library is empty. Build your first workout to start saving time.</p>
        <button class="btn-primary" @click="openNew">Build First Workout</button>
      </div>
      <div v-else-if="filtered.length === 0" class="lib-empty">
        <i class="bi bi-search" style="font-size:2rem;color:#D0D0D0"></i>
        <p>No workouts in this category.</p>
      </div>

      <!-- Grid -->
      <div v-else class="lib-grid">
        <div
          v-for="workout in filtered"
          :key="workout.id"
          class="lib-card"
          :class="{ expanded: expandedId === workout.id }"
        >
          <!-- Card header -->
          <div class="lc-header" @click="toggleExpand(workout.id)">
            <div class="lc-type-bar" :style="{ background: typeColor(workout.primaryType) }"></div>
            <div class="lc-main">
              <div class="lc-name">{{ workout.name }}</div>
              <div class="lc-meta">
                <span class="lc-badge" :style="{ background: typeColor(workout.primaryType) + '22', color: typeColor(workout.primaryType) }">
                  {{ workout.primaryType || 'WORKOUT' }}
                </span>
                <span class="lc-meta-item">{{ workout.sport || 'RUN' }}</span>
                <span class="lc-meta-sep">·</span>
                <span class="lc-meta-item">{{ (workout.steps || []).length }} steps</span>
                <span class="lc-meta-sep">·</span>
                <span class="lc-meta-item">~{{ estimateTime(workout.steps) }} min</span>
              </div>
              <!-- Step preview chips -->
              <div class="lc-step-chips" v-if="workout.steps?.length">
                <span
                  v-for="(step, i) in (workout.steps || []).slice(0, 5)"
                  :key="i"
                  class="lc-chip"
                  :style="{ background: stepColor(step.type) }"
                  :title="`${step.type}: ${step.duration}${step.durationType === 'TIME' ? 'min' : distLabel}${step.repeat > 1 ? ' ×' + step.repeat : ''}`"
                ></span>
                <span v-if="(workout.steps || []).length > 5" class="lc-chip-more">+{{ workout.steps.length - 5 }}</span>
              </div>
            </div>
            <div class="lc-chevron">
              <i :class="expandedId === workout.id ? 'bi bi-chevron-up' : 'bi bi-chevron-down'"></i>
            </div>
          </div>

          <!-- Expanded: step detail + actions -->
          <div v-if="expandedId === workout.id" class="lc-expanded">
            <div class="lc-steps-list">
              <div v-for="(step, i) in (workout.steps || [])" :key="i" class="lc-step-row">
                <div class="lcs-dot" :style="{ background: stepColor(step.type) }"></div>
                <div class="lcs-info">
                  <span class="lcs-type">{{ step.type }}</span>
                  <span class="lcs-dur">{{ step.duration }}{{ step.durationType === 'TIME' ? 'min' : ' ' + distLabel }}{{ step.repeat > 1 ? ' × ' + step.repeat : '' }}</span>
                  <span v-if="step.targetType === 'ZONE'" class="lcs-target">Zone {{ step.targetZone }}</span>
                  <span v-else-if="step.targetType === 'RPE'" class="lcs-target">RPE {{ step.targetRpe }}</span>
                  <span v-else-if="step.targetType === 'PACE'" class="lcs-target">{{ step.targetPaceMin }}–{{ step.targetPaceMax }} min/{{ distLabel }}</span>
                  <span v-else-if="step.targetType === 'HR_PCT'" class="lcs-target">{{ step.targetHrMin }}–{{ step.targetHrMax }}% HR</span>
                  <span v-if="step.notes" class="lcs-notes">{{ step.notes }}</span>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="lc-actions">
              <button class="btn-assign" @click.stop="openAssign(workout)">
                <i class="bi bi-people me-1"></i> Assign to Athletes
              </button>
              <button class="btn-edit-sm" @click.stop="openEdit(workout)">
                <i class="bi bi-pencil me-1"></i> Edit
              </button>
              <button class="btn-del-sm" @click.stop="confirmDelete(workout)">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── New / Edit Workout Drawer ────────────────────────── -->
    <div v-if="showDrawer" class="drawer-overlay" @click.self="showDrawer = false">
      <div class="lib-drawer">
        <div class="drawer-hdr">
          <h3 class="drawer-title">{{ editingWorkout ? 'Edit Workout' : 'New Workout' }}</h3>
          <button class="drawer-close" @click="showDrawer = false"><i class="bi bi-x-lg"></i></button>
        </div>

        <div class="drawer-body">
          <div class="form-field">
            <label class="field-label">Workout Name</label>
            <input v-model="form.name" class="field-input" placeholder="e.g. 5×1km at Threshold" maxlength="120" />
          </div>

          <div class="form-row-2">
            <div class="form-field">
              <label class="field-label">Sport</label>
              <select v-model="form.sport" class="field-select">
                <option v-for="s in SPORTS" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>
            <div class="form-field">
              <label class="field-label">Primary Type</label>
              <select v-model="form.primaryType" class="field-select">
                <option v-for="t in WORKOUT_TYPES" :key="t" :value="t">{{ t.replace('_', ' ') }}</option>
              </select>
            </div>
          </div>

          <div class="form-field">
            <label class="field-label">Description <span class="optional">(optional)</span></label>
            <textarea v-model="form.description" class="field-textarea" rows="2" placeholder="Overview of this workout…" maxlength="500"></textarea>
          </div>

          <div class="form-field">
            <label class="field-label">Steps</label>
            <WorkoutStepBuilder v-model:steps="form.steps" />
          </div>

          <div v-if="saveError" class="form-error">{{ saveError }}</div>
        </div>

        <div class="drawer-footer">
          <button class="btn-ghost" @click="showDrawer = false">Cancel</button>
          <button class="btn-save-drawer" @click="saveWorkout" :disabled="saving || !form.name.trim()">
            <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
            {{ editingWorkout ? 'Save Changes' : 'Save to Library' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ── Assign to Athletes Modal ─────────────────────────── -->
    <div v-if="showAssign" class="modal-overlay" @click.self="showAssign = false">
      <div class="modal-card">
        <div class="modal-hdr">
          <h3>Assign "{{ assignWorkout?.name }}"</h3>
          <button class="modal-close" @click="showAssign = false"><i class="bi bi-x-lg"></i></button>
        </div>
        <div class="modal-body">
          <div class="form-field">
            <label class="field-label">Schedule Date</label>
            <input type="date" v-model="assignDate" class="field-input" :min="todayStr" />
          </div>
          <div class="form-field">
            <label class="field-label">Select Athletes</label>
            <div v-if="!athletes.length" class="assign-empty">No athletes on your roster yet.</div>
            <div v-else class="assign-list">
              <label v-for="ath in athletes" :key="ath.id" class="assign-athlete">
                <input type="checkbox" v-model="assignedAthleteIds" :value="ath.id" class="assign-check" />
                <div class="ath-pill-avatar">{{ (ath.displayName || '?')[0].toUpperCase() }}</div>
                <span class="ath-pill-name">{{ ath.displayName }}</span>
                <span v-if="ath.activePlan" class="ath-pill-plan">{{ ath.activePlan.name }}</span>
              </label>
            </div>
          </div>
          <div v-if="assignError" class="form-error">{{ assignError }}</div>
        </div>
        <div class="modal-footer">
          <button class="btn-ghost" @click="showAssign = false">Cancel</button>
          <button
            class="btn-primary"
            @click="doAssign"
            :disabled="assigning || !assignDate || !assignedAthleteIds.length"
          >
            <span v-if="assigning" class="spinner-border spinner-border-sm me-1"></span>
            Assign to {{ assignedAthleteIds.length }} athlete{{ assignedAthleteIds.length !== 1 ? 's' : '' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ── Delete Confirm ──────────────────────────────────── -->
    <div v-if="deleteTarget" class="modal-overlay" @click.self="deleteTarget = null">
      <div class="modal-card modal-card--sm">
        <h3 class="modal-confirm-title">Delete "{{ deleteTarget.name }}"?</h3>
        <p class="modal-confirm-sub">This workout will be removed from your library. Already-scheduled workouts won't be affected.</p>
        <div class="modal-actions">
          <button class="btn-ghost" @click="deleteTarget = null">Cancel</button>
          <button class="btn-danger" @click="doDelete" :disabled="deleting">
            <span v-if="deleting" class="spinner-border spinner-border-sm me-1"></span>
            Delete
          </button>
        </div>
      </div>
    </div>

  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useWorkoutLibraryStore } from '@/stores/workoutLibrary'
import { useCoachStore } from '@/stores/coach'
import { useToast } from '@/composables/useToast'
import { useUnits } from '@/composables/useUnits'
import WorkoutStepBuilder from '@/components/WorkoutStepBuilder.vue'

const libStore     = useWorkoutLibraryStore()
const coachStore   = useCoachStore()
const { showToast } = useToast()
const { isImperial } = useUnits()
const { athletes } = storeToRefs(coachStore)

const distLabel  = computed(() => isImperial.value ? 'mi' : 'km')
const todayStr   = new Date().toISOString().slice(0, 10)
const activeFilter  = ref('all')
const expandedId    = ref(null)

const FILTERS = [
  { value: 'all',      label: 'All'      },
  { value: 'RUN',      label: 'Run'      },
  { value: 'RIDE',     label: 'Ride'     },
  { value: 'SWIM',     label: 'Swim'     },
  { value: 'STRENGTH', label: 'Strength' },
]
const SPORTS       = ['RUN', 'RIDE', 'SWIM', 'HIKE', 'WALK', 'STRENGTH']
const WORKOUT_TYPES = ['EASY', 'TEMPO', 'INTERVAL', 'LONG_RUN', 'RECOVERY', 'VO2MAX', 'THRESHOLD', 'STRENGTH', 'REST']

const STEP_COLORS = {
  WARMUP:'#767676', EASY:'#767676', AEROBIC:'#0052FF', TEMPO:'#0052FF',
  THRESHOLD:'#000000', VO2MAX:'#000000', INTERVAL:'#000000',
  SPRINT:'#000000', RECOVERY:'#767676', COOLDOWN:'#767676'
}
const TYPE_COLORS = {
  EASY:'#767676', TEMPO:'#0052FF', INTERVAL:'#000000', LONG_RUN:'#0052FF',
  RECOVERY:'#767676', VO2MAX:'#000000', THRESHOLD:'#000000', STRENGTH:'#767676', REST:'#767676'
}
const stepColor  = (t) => STEP_COLORS[t] || '#767676'
const typeColor  = (t) => TYPE_COLORS[t] || '#767676'

const filtered = computed(() => {
  const lib = libStore.library
  if (activeFilter.value === 'all') return lib
  return lib.filter(w => w.sport === activeFilter.value)
})

const filterCount = (key) => {
  if (key === 'all') return libStore.library.length
  return libStore.library.filter(w => w.sport === key).length
}

const estimateTime = (steps = []) => {
  const PACE = { WARMUP:9,EASY:9,AEROBIC:8.5,TEMPO:7,THRESHOLD:6.5,VO2MAX:5.5,INTERVAL:6,SPRINT:4,RECOVERY:10,COOLDOWN:9 }
  return Math.round(steps.reduce((s, step) => {
    const rep = step.repeat || 1
    const dur = step.duration || 0
    if (step.durationType === 'TIME') return s + dur * rep
    return s + dur * (PACE[step.type] || 8) * rep
  }, 0))
}

const toggleExpand = (id) => { expandedId.value = expandedId.value === id ? null : id }

// ── Drawer (new/edit) ──────────────────────────────────────────
const showDrawer     = ref(false)
const editingWorkout = ref(null)
const saving         = ref(false)
const saveError      = ref('')
const form = ref({ name: '', sport: 'RUN', primaryType: 'EASY', description: '', steps: [] })

const openNew = () => {
  editingWorkout.value = null
  form.value = { name: '', sport: 'RUN', primaryType: 'EASY', description: '', steps: [] }
  saveError.value = ''
  showDrawer.value = true
}

const openEdit = (workout) => {
  editingWorkout.value = workout
  form.value = {
    name:        workout.name,
    sport:       workout.sport || 'RUN',
    primaryType: workout.primaryType || 'EASY',
    description: workout.description || '',
    steps:       (workout.steps || []).map(s => ({ ...s, _id: s._id || `${Date.now()}-${Math.random()}` })),
  }
  saveError.value = ''
  showDrawer.value = true
  expandedId.value = null
}

const saveWorkout = async () => {
  if (!form.value.name.trim()) return
  saving.value = true
  saveError.value = ''
  try {
    const payload = { ...form.value }
    if (editingWorkout.value) {
      await libStore.updateWorkout(editingWorkout.value.id, payload)
      showToast('Workout updated.', 'success')
    } else {
      await libStore.saveWorkout(payload)
      showToast('Workout saved to library.', 'success')
    }
    showDrawer.value = false
  } catch {
    saveError.value = 'Failed to save. Please try again.'
  } finally {
    saving.value = false
  }
}

// ── Assign ─────────────────────────────────────────────────────
const showAssign         = ref(false)
const assignWorkout      = ref(null)
const assignDate         = ref(todayStr)
const assignedAthleteIds = ref([])
const assigning          = ref(false)
const assignError        = ref('')

const openAssign = (workout) => {
  assignWorkout.value      = workout
  assignDate.value         = todayStr
  assignedAthleteIds.value = []
  assignError.value        = ''
  showAssign.value         = true
  expandedId.value         = null
}

const doAssign = async () => {
  if (!assignDate.value || !assignedAthleteIds.value.length) return
  assigning.value = true
  assignError.value = ''
  try {
    await libStore.bulkAssign(assignWorkout.value.id, assignedAthleteIds.value, assignDate.value)
    showToast(`Workout assigned to ${assignedAthleteIds.value.length} athlete${assignedAthleteIds.value.length !== 1 ? 's' : ''}.`, 'success')
    showAssign.value = false
  } catch {
    assignError.value = 'Failed to assign. Please try again.'
  } finally {
    assigning.value = false
  }
}

// ── Delete ─────────────────────────────────────────────────────
const deleteTarget = ref(null)
const deleting     = ref(false)

const confirmDelete = (workout) => { deleteTarget.value = workout; expandedId.value = null }

const doDelete = async () => {
  deleting.value = true
  try {
    await libStore.deleteWorkout(deleteTarget.value.id)
    showToast('Workout removed from library.', 'success')
    deleteTarget.value = null
  } catch {
    showToast('Failed to delete. Please try again.', 'error')
  } finally {
    deleting.value = false
  }
}

onMounted(async () => {
  await Promise.all([
    libStore.fetchLibrary(),
    !athletes.value.length ? coachStore.fetchAthletes() : Promise.resolve()
  ])
})
</script>

<style scoped>
.library-page {
  min-height: 100vh;
  background: #fff;
  padding-top: var(--nav-h, 64px);
  font-family: "Futura PT", Futura, system-ui, sans-serif;
}

/* Hero */
.lib-hero { background: #000; padding: 48px 24px 40px; }
.lib-hero-inner { max-width: 1100px; margin: 0 auto; }
.lib-kicker { font-size: 0.7rem; letter-spacing: 0.20em; font-weight: 700; color: rgba(255,255,255,0.45); text-transform: uppercase; margin-bottom: 8px; }
.lib-hero-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 10px; }
.lib-title { font-size: clamp(2rem, 5vw, 3rem); font-weight: 900; color: #fff; margin: 0; letter-spacing: -0.02em; }
.lib-sub { color: rgba(255,255,255,0.55); font-size: 0.9rem; font-weight: 600; margin: 0; }
.btn-new {
  padding: 12px 24px;
  background: #fff; color: #000; border: none;
  font-family: inherit; font-size: 0.78rem; font-weight: 700;
  letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer;
  flex-shrink: 0;
}
.btn-new:hover { background: #e5e5e5; }

/* Tabs */
.lib-tabs-bar { border-bottom: 1px solid #E5E5E5; position: sticky; top: var(--nav-h, 64px); z-index: 50; background: #fff; }
.lib-tabs { max-width: 1100px; margin: 0 auto; padding: 0 24px; display: flex; overflow-x: auto; scrollbar-width: none; }
.lib-tabs::-webkit-scrollbar { display: none; }
.lib-tab {
  padding: 14px 20px; border: none; background: transparent;
  font-family: inherit; font-size: 0.82rem; font-weight: 700;
  color: rgba(15,18,16,0.50); cursor: pointer; white-space: nowrap;
  border-bottom: 2px solid transparent; margin-bottom: -1px;
  display: flex; align-items: center; gap: 6px;
  transition: color 0.15s, border-color 0.15s;
}
.lib-tab:hover { color: rgba(15,18,16,0.80); }
.lib-tab.active { color: #000; border-bottom-color: #000; }
.lib-tab-count { background: rgba(15,18,16,0.08); padding: 1px 7px; font-size: 0.7rem; }

/* Content */
.lib-content { max-width: 1100px; margin: 0 auto; padding: 32px 24px 80px; }
.lib-empty { display: flex; flex-direction: column; align-items: center; gap: 14px; padding: 80px 24px; color: #767676; text-align: center; }
.lib-empty p { font-size: 0.9rem; font-weight: 600; margin: 0; }

/* Grid */
.lib-grid { display: flex; flex-direction: column; gap: 8px; }

/* Card */
.lib-card { border: 1px solid #E5E5E5; transition: border-color 0.2s; }
.lib-card:hover { border-color: #BDBDBD; }
.lib-card.expanded { border-color: #000; }

.lc-header {
  display: flex;
  align-items: stretch;
  cursor: pointer;
  min-height: 72px;
}
.lc-type-bar { width: 4px; flex-shrink: 0; }
.lc-main { flex: 1; padding: 14px 16px; min-width: 0; }
.lc-chevron { padding: 14px 16px; display: flex; align-items: center; color: #767676; font-size: 0.8rem; flex-shrink: 0; }

.lc-name { font-weight: 700; font-size: 0.95rem; margin-bottom: 5px; }
.lc-meta { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; }
.lc-badge { padding: 2px 8px; font-size: 0.65rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; }
.lc-meta-item { font-size: 0.75rem; color: #767676; font-weight: 600; }
.lc-meta-sep { color: #D0D0D0; font-size: 0.75rem; }

.lc-step-chips { display: flex; gap: 3px; align-items: center; }
.lc-chip { width: 18px; height: 6px; border-radius: 2px; display: inline-block; }
.lc-chip-more { font-size: 0.65rem; font-weight: 700; color: #767676; }

/* Expanded */
.lc-expanded { border-top: 1px solid #F0F0F0; padding: 16px; }
.lc-steps-list { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
.lc-step-row { display: flex; align-items: center; gap: 10px; padding: 6px 0; border-bottom: 1px solid #F5F5F5; }
.lc-step-row:last-child { border-bottom: none; }
.lcs-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.lcs-info { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.lcs-type { font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; }
.lcs-dur { font-size: 0.75rem; color: #767676; }
.lcs-target { font-size: 0.7rem; background: rgba(15,18,16,0.06); padding: 1px 6px; color: #555; font-weight: 600; }
.lcs-notes { font-size: 0.7rem; color: #999; font-style: italic; }

.lc-actions { display: flex; align-items: center; gap: 8px; padding-top: 8px; border-top: 1px solid #F0F0F0; }
.btn-assign {
  padding: 9px 18px; background: #0052FF; color: #fff; border: none;
  font-family: inherit; font-size: 0.78rem; font-weight: 700;
  letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer;
}
.btn-assign:hover { background: #003ECC; }
.btn-edit-sm {
  padding: 8px 14px; background: #fff; color: #000; border: 1px solid #E5E5E5;
  font-family: inherit; font-size: 0.75rem; font-weight: 700; cursor: pointer;
}
.btn-edit-sm:hover { border-color: #000; }
.btn-del-sm {
  padding: 8px 10px; background: #fff; color: #767676; border: 1px solid #E5E5E5;
  font-family: inherit; font-size: 0.82rem; cursor: pointer; margin-left: auto;
}
.btn-del-sm:hover { border-color: #ef4444; color: #ef4444; }

/* Drawer */
.drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 9000; display: flex; justify-content: flex-end; }
.lib-drawer {
  width: min(560px, 100vw);
  background: #fff;
  display: flex; flex-direction: column;
  height: 100%;
  overflow: hidden;
}
.drawer-hdr {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px; border-bottom: 1px solid #E5E5E5; flex-shrink: 0;
}
.drawer-title { font-size: 1.1rem; font-weight: 700; margin: 0; }
.drawer-close { background: none; border: none; font-size: 1.1rem; cursor: pointer; padding: 4px; color: #767676; }
.drawer-close:hover { color: #000; }
.drawer-body { flex: 1; overflow-y: auto; padding: 24px; display: flex; flex-direction: column; gap: 20px; }
.drawer-footer { display: flex; gap: 10px; padding: 16px 24px; border-top: 1px solid #E5E5E5; flex-shrink: 0; }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 9000; display: flex; align-items: center; justify-content: center; padding: 24px; }
.modal-card { background: #fff; width: 100%; max-width: 480px; max-height: 80vh; display: flex; flex-direction: column; overflow: hidden; }
.modal-card--sm { max-width: 380px; padding: 32px; }
.modal-hdr { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid #E5E5E5; flex-shrink: 0; }
.modal-hdr h3 { font-size: 1rem; font-weight: 700; margin: 0; }
.modal-close { background: none; border: none; font-size: 1.1rem; cursor: pointer; padding: 4px; color: #767676; }
.modal-close:hover { color: #000; }
.modal-body { flex: 1; overflow-y: auto; padding: 20px 24px; display: flex; flex-direction: column; gap: 16px; }
.modal-footer { display: flex; gap: 10px; padding: 16px 24px; border-top: 1px solid #E5E5E5; flex-shrink: 0; justify-content: flex-end; }
.modal-confirm-title { font-size: 1rem; font-weight: 700; margin: 0 0 8px; }
.modal-confirm-sub { font-size: 0.85rem; color: #767676; margin: 0 0 24px; }
.modal-actions { display: flex; gap: 10px; }

/* Assign list */
.assign-empty { font-size: 0.85rem; color: #767676; padding: 12px 0; }
.assign-list { display: flex; flex-direction: column; gap: 6px; max-height: 240px; overflow-y: auto; }
.assign-athlete { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border: 1px solid #E5E5E5; cursor: pointer; }
.assign-athlete:hover { border-color: #BDBDBD; }
.assign-check { cursor: pointer; }
.ath-pill-avatar { width: 30px; height: 30px; background: #000; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.78rem; flex-shrink: 0; }
.ath-pill-name { font-weight: 600; font-size: 0.88rem; flex: 1; }
.ath-pill-plan { font-size: 0.7rem; color: #767676; }

/* Common form controls */
.form-field { display: flex; flex-direction: column; gap: 6px; }
.form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.field-label { font-size: 0.62rem; font-weight: 700; letter-spacing: 0.12em; color: #767676; text-transform: uppercase; }
.optional { font-weight: 500; text-transform: none; letter-spacing: 0; font-size: 0.7rem; color: #BDBDBD; }
.field-input {
  padding: 10px 12px; border: 1px solid #E5E5E5; background: #fff;
  font-family: inherit; font-size: 0.88rem; color: #000; outline: none; border-radius: 0;
}
.field-input:focus { border-color: #000; }
.field-select {
  padding: 10px 12px; border: 1px solid #E5E5E5; background: #fff;
  font-family: inherit; font-size: 0.88rem; color: #000; outline: none; border-radius: 0; cursor: pointer;
}
.field-select:focus { border-color: #000; }
.field-textarea { padding: 10px 12px; border: 1px solid #E5E5E5; font-family: inherit; font-size: 0.88rem; resize: vertical; outline: none; border-radius: 0; }
.field-textarea:focus { border-color: #000; }
.form-error { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.25); color: #dc2626; font-size: 0.82rem; font-weight: 600; padding: 10px 12px; }

/* Buttons */
.btn-primary {
  padding: 12px 24px; background: #0052FF; color: #fff; border: 2px solid #0052FF;
  font-family: inherit; font-size: 0.78rem; font-weight: 600;
  letter-spacing: 0.12em; text-transform: uppercase; cursor: pointer;
}
.btn-primary:hover { background: #003ECC; border-color: #003ECC; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-ghost {
  padding: 11px 24px; background: #fff; color: #000; border: 1px solid #E5E5E5;
  font-family: inherit; font-size: 0.78rem; font-weight: 600; cursor: pointer;
}
.btn-ghost:hover { border-color: #000; }
.btn-save-drawer {
  flex: 1; padding: 12px 24px; background: #000; color: #fff; border: none;
  font-family: inherit; font-size: 0.78rem; font-weight: 700;
  letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer;
}
.btn-save-drawer:hover { background: #333; }
.btn-save-drawer:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-danger {
  padding: 11px 20px; background: #ef4444; color: #fff; border: none;
  font-family: inherit; font-size: 0.78rem; font-weight: 700; cursor: pointer;
}
.btn-danger:hover { background: #dc2626; }
.btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }

.spinner-border { width: 1rem; height: 1rem; border: 2px solid rgba(0,0,0,0.1); border-top-color: currentColor; border-radius: 50%; animation: spin 0.75s linear infinite; display: inline-block; }
.spinner-border-sm { width: 0.85rem; height: 0.85rem; }
.me-1 { margin-right: 4px; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 600px) {
  .lib-hero { padding: 28px 16px 24px; }
  .lib-hero-row { flex-direction: column; align-items: flex-start; gap: 12px; }
  .lib-content { padding: 20px 16px 60px; }
  .lib-drawer { width: 100vw; }
}
</style>
