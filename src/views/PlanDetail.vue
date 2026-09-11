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
              <router-link v-if="upcomingRace" to="/races" class="plan-race-context">
                <span>Next race</span><strong>{{ upcomingRace.raceName }}</strong><em>{{ daysUntilRace(upcomingRace.raceDate) }}</em>
              </router-link>
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
            <button class="btn btn-sm folder-save-btn" @click="openFolderPicker('PLAN', plan.id)">
              <i class="bi bi-folder-plus me-1"></i>Save to folder
            </button>
            <button
              v-if="!plan.isActive"
              class="btn btn-primary btn-sm"
              @click="setActive"
              :disabled="actionLoading"
            >
              <i class="bi bi-check-circle me-1"></i>Set Active
            </button>
            <button
              class="btn btn-sm adaptive-toggle-btn"
              :class="{ 'adaptive-toggle-btn--off': !plan.adaptiveEnabled }"
              @click="toggleAdaptive"
              :disabled="adaptiveToggleLoading"
              :title="plan.adaptiveEnabled ? 'Auto-adjust is on — click to take full manual control' : 'Auto-adjust is off — click to let the plan adapt to your training again'"
            >
              <i :class="['bi', plan.adaptiveEnabled ? 'bi-magic' : 'bi-pause-circle', 'me-1']"></i>
              Auto-Adjust: {{ plan.adaptiveEnabled ? 'On' : 'Off' }}
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
            <p class="confirm-body">Delete <strong>{{ plan.name }}</strong>? Every week in it — gone, no rebuilding.</p>
            <div class="confirm-actions">
              <button class="confirm-btn-cancel" @click="showDeleteConfirm = false">Cancel</button>
              <button class="confirm-btn-danger" @click="doDelete">Delete</button>
            </div>
          </div>
        </div>
      </Teleport>

      <!-- Week selector tabs -->
      <div class="week-tabs-wrapper">
        <button class="week-overview-toggle" @click="showOverview = !showOverview">
          <i :class="['bi', showOverview ? 'bi-list' : 'bi-grid-3x3-gap-fill']"></i>
          {{ showOverview ? 'Week View' : 'Plan Overview' }}
        </button>
        <button
          v-if="!showOverview && currentWeek && selectedWeek !== currentWeek"
          class="week-jump-today"
          @click="selectedWeek = currentWeek; scrollToActiveTab()"
        >
          <i class="bi bi-arrow-right-circle me-1"></i>Current Week
        </button>
        <div v-if="!showOverview" class="week-tabs" ref="weekTabsEl">
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

      <!-- Plan overview — week-at-a-glance across the whole block -->
      <div v-if="showOverview" class="plan-overview container-xxl">
        <div class="overview-grid">
          <button
            v-for="w in plan.weeks"
            :key="w.weekNumber"
            class="overview-week"
            :class="{ 'overview-week--current': w.weekNumber === currentWeek }"
            :style="{ borderLeftColor: phaseColors[w.phase] || '#8A8A8A' }"
            @click="selectedWeek = w.weekNumber; showOverview = false"
          >
            <div class="overview-week-head">
              <span class="overview-week-num">W{{ w.weekNumber }}</span>
              <span class="overview-week-phase" :style="{ color: phaseColors[w.phase] || '#8A8A8A' }">{{ w.phase }}</span>
            </div>
            <div class="overview-days">
              <span
                v-for="workout in w.workouts"
                :key="workout.id"
                class="overview-day-dot"
                :class="{ 'overview-day-dot--done': workout.completed }"
                :style="{ background: typeChipColor(workout.workoutType) }"
                :title="`${workout.title || workout.workoutType}${workout.completed ? ' — done' : ''}`"
              ></span>
            </div>
          </button>
        </div>
      </div>

      <!-- Week content -->
      <div class="week-content container-xxl" v-if="activeWeekData && !showOverview">
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

              <!-- Adaptation reason -->
              <div v-if="workoutAdaptations[workout.id]" class="adaptation-note">
                <i class="bi bi-lightbulb-fill me-1"></i>{{ workoutAdaptations[workout.id].reason }}
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
                <button class="wba-btn" @click="openActivityPicker(workout)">
                  <i class="bi bi-link-45deg me-1"></i>{{ workout.linkedActivityId ? 'Change activity' : 'Attach activity' }}
                </button>
              </div>
            </div>
          </div><!-- /.workout-card -->

          <!-- Post-completion RPE/notes entry happens in the bottom sheet, not inline here -->

          <!-- Adjust panel -->
          <div v-if="adjustOpen.has(workout.id)" class="adjust-panel">
            <div class="ap-title">Adjust Workout</div>
            <div class="ap-fields">
              <div class="ap-field">
                <label class="ap-label">Workout Type</label>
                <select v-model="adjustForm[workout.id].type" class="ap-input ap-select">
                  <option value="EASY">Easy</option>
                  <option value="TEMPO">Tempo</option>
                  <option value="INTERVAL">Interval</option>
                  <option value="LONG_RUN">Long Run</option>
                  <option value="RECOVERY">Recovery</option>
                  <option value="REST">Rest</option>
                </select>
              </div>
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
              <label class="ap-label">Notes</label>
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
      <p>Can't find that plan.</p>
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

      <Teleport to="body">
        <div v-if="folderPicker" class="attach-overlay" @click.self="folderPicker = null">
          <div class="attach-modal"><div class="attach-modal-head"><strong>Save to training folder</strong><button @click="folderPicker = null">×</button></div>
            <select v-model="selectedFolderId" class="attach-select"><option value="">Choose a folder…</option><option v-for="f in folders" :key="f.id" :value="String(f.id)">{{ f.name }}</option></select>
            <button class="attach-save" @click="saveToFolder" :disabled="!selectedFolderId || folderSaving">{{ folderSaving ? 'Saving…' : 'Save to folder' }}</button>
          </div>
        </div>
        <div v-if="activityPickerWorkout" class="attach-overlay" @click.self="activityPickerWorkout = null">
          <div class="attach-modal">
            <div class="attach-modal-head"><strong>Attach an activity</strong><button @click="activityPickerWorkout = null">×</button></div>
            <p class="attach-help">Link a completed activity to “{{ activityPickerWorkout.title }}”.</p>
            <select v-model="selectedActivityId" class="attach-select">
              <option value="">Choose an activity…</option>
              <option v-for="a in attachableActivities" :key="a.id" :value="String(a.id)">{{ activityLabel(a) }}</option>
            </select>
            <div class="attach-actions">
              <button v-if="activityPickerWorkout.linkedActivityId" class="attach-clear" @click="saveActivityAttachment(null)">Unlink</button>
              <button class="attach-save" @click="saveActivityAttachment(selectedActivityId || null)" :disabled="attachmentSaving">{{ attachmentSaving ? 'Saving…' : 'Save link' }}</button>
            </div>
          </div>
        </div>
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
import { useActivityStore } from '@/stores/activity.js'
import axios from 'axios'

const router = useRouter()
const route = useRoute()
const planStore = usePlanStore()
const activityStore = useActivityStore()
const { activities } = storeToRefs(activityStore)
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
  WARMUP:'#8A8A8A', EASY:'#8A8A8A', AEROBIC:'#2A55F5', TEMPO:'#2A55F5',
  THRESHOLD:'#16130F', VO2MAX:'#16130F', INTERVAL:'#16130F',
  SPRINT:'#16130F', RECOVERY:'#8A8A8A', COOLDOWN:'#8A8A8A'
}
const stepColor = (t) => STEP_COLORS[t] || '#8A8A8A'
const authStore = useAuthStore()
const { unitSystem } = storeToRefs(authStore)

const { showToast } = useToast()

const plan = ref(null)
const loading = ref(false)
const selectedWeek = ref(1)
const showOverview = ref(false) // week-at-a-glance toggle — additive UI state only
const workoutAdaptations = ref({})
const weekTabsEl = ref(null)
const workoutLoading = ref({})
const actionLoading = ref(false)
const showDeleteConfirm = ref(false)
const activityPickerWorkout = ref(null)
const selectedActivityId = ref('')
const attachmentSaving = ref(false)
const folderPicker = ref(null)
const folders = ref([])
const selectedFolderId = ref('')
const folderSaving = ref(false)
const upcomingRace = ref(null)
const attachableActivities = computed(() => (activities.value || []).filter(a => a?.id).slice(0, 200))
const activityLabel = (a) => `${new Date(a.performedAt || a.createdAt || Date.now()).toLocaleDateString()} · ${a.title || a.sportType || 'Activity'}${a.distanceMeters ? ` · ${(a.distanceMeters / 1000).toFixed(1)} km` : ''}`
const daysUntilRace = (date) => { const days = Math.ceil((new Date(`${date}T00:00:00`) - new Date()) / 86400000); return days < 0 ? 'Past' : days === 0 ? 'Race day' : `${days} days` }
const openFolderPicker = async (itemType, itemId) => { folderPicker.value = { itemType, itemId }; selectedFolderId.value = ''; try { folders.value = (await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/training-folders`)).data } catch { showToast('Folders did not load.', 'error') } }
const saveToFolder = async () => { if (!selectedFolderId.value || folderSaving.value) return; folderSaving.value = true; try { await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/training-folders/${selectedFolderId.value}/items`, folderPicker.value); folderPicker.value = null; showToast('Saved to training folder.', 'success') } catch { showToast('Could not save to that folder.', 'error') } finally { folderSaving.value = false } }

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
    EASY: '#8A8A8A', TEMPO: '#2A55F5', INTERVAL: '#16130F',
    LONG_RUN: '#2A55F5', RECOVERY: '#8A8A8A', REST: '#8A8A8A',
  }[wType] || '#8A8A8A'
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
  BASE: '#8A8A8A', BUILD: '#2A55F5', PEAK: '#16130F', TAPER: '#8A8A8A',
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
    showToast('Couldn\'t update that workout — give it another tap.', 'error')
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
    showToast('Couldn\'t skip that workout — give it another tap.', 'error')
  } finally {
    delete workoutLoading.value[workout.id]
  }
}

const startWorkout = (workout) => {
  router.push(`/track?planId=${plan.value?.id}&workoutId=${workout.id}`)
}

const openActivityPicker = async (workout) => {
  activityPickerWorkout.value = workout
  selectedActivityId.value = workout.linkedActivityId ? String(workout.linkedActivityId) : ''
  if (!activities.value.length) await activityStore.fetchActivities()
}

const saveActivityAttachment = async (activityId) => {
  if (!activityPickerWorkout.value || attachmentSaving.value) return
  attachmentSaving.value = true
  try {
    await planStore.updateWorkout(plan.value.id, activityPickerWorkout.value.id, { linkedActivityId: activityId })
    activityPickerWorkout.value.linkedActivityId = activityId
    showToast(activityId ? 'Activity attached to the training block.' : 'Activity unlinked.', 'success')
    activityPickerWorkout.value = null
  } catch { showToast('Couldn’t update that activity link.', 'error') }
  finally { attachmentSaving.value = false }
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
        type: workout.workoutType || 'EASY',
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
    if (form.type && form.type !== workout.workoutType) {
      updates.workoutType = form.type
    }
    await planStore.updateWorkout(plan.value.id, workout.id, updates)
    if (updates.distanceMeters !== undefined) workout.distanceMeters = updates.distanceMeters
    if (updates.durationMinutes !== undefined) workout.durationMinutes = updates.durationMinutes
    if (updates.description !== undefined) workout.description = updates.description
    if (updates.workoutType !== undefined) workout.workoutType = updates.workoutType
    toggleAdjust(workout.id)
    showToast('Workout dialed in.', 'success')
  } catch {
    showToast('Couldn\'t save those changes — give it another shot.', 'error')
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
    showToast('Couldn\'t make this your active plan — try again.', 'error')
  } finally {
    actionLoading.value = false
  }
}

const adaptiveToggleLoading = ref(false)
const toggleAdaptive = async () => {
  adaptiveToggleLoading.value = true
  const next = !plan.value.adaptiveEnabled
  try {
    await planStore.setPlanAdaptive(plan.value.id, next)
    plan.value.adaptiveEnabled = next
    showToast(next ? 'Auto-adjust is back on.' : 'Auto-adjust is off — this plan is fully manual now.', 'success')
  } catch {
    showToast("Couldn't update auto-adjust — try again.", 'error')
  } finally {
    adaptiveToggleLoading.value = false
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
    showToast('Plan didn\'t delete — try again.', 'error')
    actionLoading.value = false
  }
}

// ── Load ──────────────────────────────────────────

onMounted(async () => {
  try {
    const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/race-bookmarks`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
    upcomingRace.value = (Array.isArray(data) ? data : []).filter(r => r.raceDate && new Date(`${r.raceDate}T00:00:00`) >= new Date()).sort((a, b) => new Date(a.raceDate) - new Date(b.raceDate))[0] || null
  } catch { upcomingRace.value = null }
  loading.value = true
  try {
    const data = await planStore.fetchPlan(route.params.id)
    plan.value = data
    selectedWeek.value = currentWeek.value
    scrollToActiveTab()
    if (plan.value?.isActive) loadWorkoutAdaptations()
  } catch {
    plan.value = null
  } finally {
    loading.value = false
  }
})

// Adaptations come back one row per changed field — group by workout,
// keep only the most recent event per workout since its reason is full prose.
async function loadWorkoutAdaptations() {
  try {
    const rows = await planStore.fetchActivePlanAdaptations()
    const latest = {}
    for (const row of rows) {
      const existing = latest[row.planWorkoutId]
      if (!existing || new Date(row.createdAt) > new Date(existing.createdAt)) {
        latest[row.planWorkoutId] = row
      }
    }
    workoutAdaptations.value = latest
  } catch {
    // Non-critical — the plan itself already rendered fine without this.
  }
}
</script>

<style scoped>
.plan-detail-page {
  min-height: 100vh;
  background: var(--r-offwhite);
  padding-top: var(--page-top);
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
}
.attach-overlay { position: fixed; inset: 0; z-index: 30; display: grid; place-items: center; padding: 20px; background: rgba(22,19,15,.55); }
.attach-modal { width: min(440px, 100%); padding: 20px; background: var(--r-offwhite); border: 2px solid #16130F; box-shadow: 6px 6px 0 #16130F; }
.attach-modal-head { display: flex; justify-content: space-between; align-items: center; font-size: 1.1rem; }
.attach-modal-head button { border: 0; background: transparent; font-size: 1.5rem; cursor: pointer; }
.attach-help { color: #5A5348; font-size: .82rem; }
.attach-select { width: 100%; border: 2px solid #16130F; padding: 11px; background: #fff; }
.attach-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
.attach-clear, .attach-save { border: 2px solid #16130F; padding: 9px 13px; font-weight: 800; cursor: pointer; }
.attach-clear { background: transparent; }
.attach-save { background: #2A55F5; color: #fff; }
.attach-save:disabled { opacity: .5; }

/* Page loading */
.page-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; gap: 16px; color: rgba(22,19,15,0.55); }

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
.plan-skeleton { padding-top: var(--page-top); }
.sk-header {
  background: #16130F;
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
  border-bottom: 2px solid #E7DFCE;
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
  border: 2px solid #E7DFCE;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ── Plan Header ── */
.plan-header { background: #16130F; color: white; padding: 24px 0 28px; }
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
.plan-race-context { display: inline-flex; align-items: center; gap: 8px; width: fit-content; margin-top: 12px; padding: 8px 10px; border: 1px solid rgba(255,255,255,.45); color: #16130F; background: #FFC53D; font-size: .78rem; text-decoration: none; }
.plan-race-context span, .plan-race-context em { font: 10px 'Spline Sans Mono', monospace; text-transform: uppercase; }
.plan-race-context strong { max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.plan-race-context em { font-style: normal; font-weight: 700; }
.plan-race-context:hover { color: #16130F; background: #fff; }

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
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
}
.confirm-title { font-size: 1rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.08em; }
.confirm-body { font-size: 0.88rem; color: #555; margin: 0; }
.confirm-actions { display: flex; gap: 10px; margin-top: 8px; }
.confirm-btn-cancel {
  flex: 1; height: 44px; border: 2px solid #E7DFCE; background: #fff;
  color: #8A8A8A; font-family: inherit; font-weight: 700; font-size: 0.82rem;
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
  border-bottom: 1px solid rgba(22,19,15,0.08);
  position: sticky; top: var(--nav-h); z-index: 50;
  overflow-x: auto; -webkit-overflow-scrolling: touch;
  display: flex; align-items: stretch;
}
.week-overview-toggle {
  flex-shrink: 0;
  padding: 0 16px;
  border: none; border-right: 2px solid #E7DFCE;
  background: #FBF6EC; color: #16130F;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.68rem; font-weight: 700; letter-spacing: 0.06em;
  text-transform: uppercase; cursor: pointer; white-space: nowrap;
  display: flex; align-items: center; gap: 6px; transition: background 0.15s;
}
.week-overview-toggle:hover { background: #EEF1FF; color: #2A55F5; }
.week-jump-today {
  flex-shrink: 0;
  padding: 0 14px;
  border: none; border-right: 2px solid #E7DFCE;
  background: #2A55F5; color: #fff;
  font-size: 0.70rem; font-weight: 700; letter-spacing: 0.08em;
  text-transform: uppercase; cursor: pointer; font-family: inherit;
  white-space: nowrap; transition: background 0.15s;
}
.week-jump-today:hover { background: #1E42D6; }
.week-tabs { display: flex; padding: 0 24px; gap: 4px; min-width: max-content; flex: 1; }
.week-tab {
  position: relative; display: flex; flex-direction: column; align-items: center;
  padding: 14px 16px; border: none; background: transparent;
  font-family: inherit; font-size: 0.82rem; font-weight: 700;
  color: rgba(22,19,15,0.55); cursor: pointer; transition: all 0.2s;
  border-bottom: 3px solid transparent; white-space: nowrap;
}
.week-tab:hover { color: rgba(22,19,15,0.85); }
.week-tab.active { color: #16130F; border-bottom-color: #16130F; }
.week-tab.current .week-tab-label { color: #16130F; }
.week-tab-dot { width: 6px; height: 6px; border-radius: 0; background: #16130F; margin-top: 4px; }

/* ── Plan Overview (week-at-a-glance) ── */
.plan-overview { padding: 24px 24px 4px; }
.overview-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; }
.overview-week {
  border: 2px solid #E7DFCE; border-left: 4px solid #8A8A8A; background: #fff;
  padding: 12px 14px; text-align: left; cursor: pointer; font-family: inherit;
  display: flex; flex-direction: column; gap: 10px; transition: box-shadow 0.15s, border-color 0.15s;
}
.overview-week:hover { box-shadow: 3px 3px 0 #16130F; border-color: #16130F; }
.overview-week--current { border-color: #16130F; box-shadow: 3px 3px 0 #2A55F5; }
.overview-week-head { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
.overview-week-num {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-weight: 900; font-size: 1.3rem; line-height: 1; color: #16130F;
}
.overview-week-phase {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.62rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
}
.overview-days { display: flex; flex-wrap: wrap; gap: 5px; }
.overview-day-dot { width: 10px; height: 10px; border-radius: 999px; flex-shrink: 0; opacity: 0.4; }
.overview-day-dot--done { opacity: 1; }

/* ── Week Content ── */
.week-content { padding: 28px 24px 60px; }
.week-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
.week-title {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-weight: 900; font-size: 1.7rem; line-height: 0.85;
  text-transform: uppercase; color: #16130F; margin-bottom: 6px;
}
.week-stats { display: flex; gap: 16px; font-size: 0.85rem; color: rgba(22,19,15,0.60); font-weight: 600; flex-wrap: wrap; }
.week-progress-mini { width: 120px; height: 6px; background: rgba(22,19,15,0.10); border-radius: 0; overflow: hidden; flex-shrink: 0; }
.week-progress-fill { height: 100%; background: #16130F; border-radius: 0; transition: width 0.4s; }

/* ── Workout Cards ── */
.workouts-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px; }
.workout-card {
  display: flex; gap: 16px; align-items: flex-start;
  background: white; border: 1px solid rgba(22,19,15,0.10);
  border-radius: 0; padding: 20px; transition: all 0.2s;
}
.workout-today { border-color: #16130F; }
.workout-completed { background: rgba(16,185,129,0.04); border-color: rgba(16,185,129,0.20); }
.workout-missed { border-color: rgba(239,68,68,0.25); background: rgba(239,68,68,0.02); }

/* Check button */
.check-btn {
  width: 36px; height: 36px; border-radius: 0;
  border: 2px solid rgba(22,19,15,0.20);
  background: transparent; display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.2s; flex-shrink: 0; font-size: 1rem;
  color: rgba(22,19,15,0.50);
}
.check-btn:hover { border-color: #16130F; color: #16130F; }
.check-btn.checked { background: rgba(16,185,129,1); border-color: rgba(16,185,129,1); color: white; }
.check-btn:disabled { opacity: 0.50; cursor: not-allowed; }

/* Workout body */
.workout-body { flex: 1; min-width: 0; }
.workout-top-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; flex-wrap: wrap; gap: 8px; }
.workout-day-type { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.workout-day { font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(22,19,15,0.50); }
.workout-sep { color: rgba(22,19,15,0.25); }
.workout-type { font-weight: 900; font-size: 1rem; color: rgba(22,19,15,0.90); }
.workout-completed .workout-type { text-decoration: line-through; opacity: 0.55; }

/* Workout type colors */
.type-easy, .type-recovery   { color: #047857; }
.type-tempo                  { color: #2A55F5; }
.type-long                   { color: #16130F; }
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
.tag-today  { background: rgba(196,106,42,0.12); color: #16130F; padding: 3px 10px; border-radius: 0; font-size: 0.72rem; font-weight: 700; }
.tag-missed { background: rgba(239,68,68,0.10); color: #dc2626; padding: 3px 10px; border-radius: 0; font-size: 0.72rem; font-weight: 700; }

.workout-detail-row { display: flex; align-items: baseline; gap: 8px; margin-bottom: 6px; }
.workout-dist { font-size: 1.5rem; font-weight: 900; letter-spacing: -0.02em; color: rgba(22,19,15,0.90); line-height: 1; }
.workout-dur { font-size: 0.85rem; font-weight: 600; color: rgba(22,19,15,0.50); }
.dur-sep { color: rgba(22,19,15,0.25); margin-right: 4px; }

/* Pace target */
.pace-target {
  display: inline-flex; align-items: center;
  font-size: 0.82rem; font-weight: 700; color: rgba(22,19,15,0.60);
  background: rgba(22,19,15,0.04); padding: 3px 10px; border-radius: 0;
  margin-bottom: 6px;
}

.workout-desc { font-size: 0.85rem; color: rgba(22,19,15,0.55); margin: 0; line-height: 1.5; font-style: italic; }

/* ── Adaptation Reason ── */
.adaptation-note {
  display: flex; align-items: flex-start; gap: 4px;
  font-size: 0.78rem; font-weight: 600; line-height: 1.5;
  color: #16130F;
  background: #EEF1FF;
  border: 2px solid #2A55F5;
  border-radius: 0;
  padding: 8px 10px;
  margin-bottom: 8px;
}
.adaptation-note i { color: #2A55F5; flex-shrink: 0; margin-top: 1px; }

/* Structured steps in plan */
.steps-preview-strip { display: flex; gap: 2px; margin-top: 8px; }
.step-chip-mini { width: 16px; height: 5px; border-radius: 2px; }
.steps-toggle {
  display: flex; align-items: center; gap: 5px; margin-top: 6px;
  background: none; border: none; font-family: inherit;
  font-size: 0.72rem; font-weight: 700; color: #8A8A8A;
  cursor: pointer; padding: 0; text-transform: uppercase; letter-spacing: 0.05em;
  transition: color 0.15s;
}
.steps-toggle:hover { color: #16130F; }
.steps-expanded { margin-top: 8px; border: 2px solid #E7DFCE; padding: 8px; background: #FAFAFA; }
.step-row { display: flex; align-items: center; gap: 8px; padding: 5px 0; border-bottom: 1px solid #F5F5F5; flex-wrap: wrap; }
.step-row:last-child { border-bottom: none; }
.step-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.step-info { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.step-type { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; }
.step-dur { font-size: 0.7rem; color: #8A8A8A; }
.step-target { font-size: 0.68rem; background: rgba(22,19,15,0.06); padding: 1px 5px; color: #555; font-weight: 600; }
.step-notes { font-size: 0.68rem; color: #999; font-style: italic; }

/* Week summary */
.week-summary {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;
  background: white; border: 1px solid rgba(22,19,15,0.10);
  border-radius: 0; padding: 20px 28px;
}
.summary-stat { text-align: center; }
.summary-val { font-size: 1.4rem; font-weight: 900; color: #16130F; margin-bottom: 4px; }
.summary-key { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(22,19,15,0.50); }

/* Skip button */
.skip-btn {
  width: 28px; height: 28px; margin-top: 6px;
  border: 1px solid rgba(22,19,15,0.14); background: transparent;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; font-size: 0.72rem; color: rgba(22,19,15,0.35);
  transition: all 0.15s;
}
.skip-btn:hover { border-color: #8A8A8A; color: #8A8A8A; }
.skip-btn--active { background: #8A8A8A; border-color: #8A8A8A; color: #fff; }
.skip-btn:disabled { opacity: 0.3; cursor: not-allowed; }

/* Skipped card */
.workout-skipped { opacity: 0.5; background: #fafafa; }
.workout-skipped .workout-type { text-decoration: line-through; }

/* Athlete note row */
.athlete-note-row {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  margin-top: 10px; padding-top: 10px;
  border-top: 1px solid rgba(22,19,15,0.06);
}
.rpe-chip {
  font-size: 0.68rem; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase;
  background: rgba(42,85,245,0.08); color: #2A55F5; padding: 2px 8px;
}
.athlete-note-text { font-size: 0.82rem; color: rgba(22,19,15,0.55); font-style: italic; flex: 1; min-width: 0; }
.note-edit-btn { background: none; border: none; color: #ccc; font-size: 0.7rem; cursor: pointer; padding: 0 4px; }
.note-edit-btn:hover { color: #8A8A8A; }

/* Workout bottom actions */
.workout-bottom-actions {
  display: flex; gap: 8px; margin-top: 12px; padding-top: 10px;
  border-top: 1px solid rgba(22,19,15,0.06);
}
.wba-btn {
  display: inline-flex; align-items: center; gap: 4px;
  background: none; border: 1px solid rgba(22,19,15,0.12);
  font-family: inherit; font-size: 0.72rem; font-weight: 700;
  letter-spacing: 0.05em; text-transform: uppercase;
  color: rgba(22,19,15,0.55); padding: 5px 12px; cursor: pointer;
  transition: all 0.15s;
}
.wba-btn:hover { border-color: #16130F; color: #16130F; }
.wba-btn-start {
  background: #2A55F5; border-color: #2A55F5; color: #fff;
}
.wba-btn-start:hover { background: #1E42D6; border-color: #1E42D6; color: #fff; }

/* Post-completion RPE/notes — used by the bottom sheet only */
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
.rpe-btn.active { background: #2A55F5; border-color: #2A55F5; color: #fff; }
.cp-notes {
  background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.15);
  color: #fff; padding: 10px 12px; font-family: inherit; font-size: 0.85rem;
  resize: none; outline: none; width: 100%; box-sizing: border-box;
}
.cp-notes::placeholder { color: rgba(255,255,255,0.30); }
.cp-notes:focus { border-color: rgba(255,255,255,0.40); }
.cp-skip-btn {
  background: none; border: 1px solid rgba(255,255,255,0.20); color: rgba(255,255,255,0.55);
  font-family: inherit; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.06em;
  text-transform: uppercase; padding: 8px 16px; cursor: pointer;
}
.cp-save-btn {
  background: #2A55F5; border: none; color: #fff;
  font-family: inherit; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.06em;
  text-transform: uppercase; padding: 8px 20px; cursor: pointer;
}
.cp-save-btn:hover { background: #1E42D6; }

/* Adjust panel */
.adjust-panel {
  background: #fff; border: 2px solid #E7DFCE; border-top: none;
  padding: 18px 20px; display: flex; flex-direction: column; gap: 10px;
}
.ap-title { font-size: 0.68rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #8A8A8A; margin-bottom: 4px; }
.ap-fields { display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 12px; }
.ap-select { background: #fff; cursor: pointer; }
.ap-field { display: flex; flex-direction: column; gap: 4px; }
.ap-label { font-size: 0.68rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #999; }
.ap-input {
  height: 38px; border: 2px solid #E7DFCE; padding: 0 10px;
  font-family: inherit; font-size: 0.88rem; outline: none;
}
.ap-input:focus { border-color: #16130F; }
.ap-textarea {
  border: 2px solid #E7DFCE; padding: 8px 10px; font-family: inherit;
  font-size: 0.85rem; outline: none; resize: none; width: 100%; box-sizing: border-box;
}
.ap-textarea:focus { border-color: #16130F; }
.ap-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 4px; }
.ap-cancel {
  background: none; border: 2px solid #E7DFCE; color: #8A8A8A;
  font-family: inherit; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.06em;
  text-transform: uppercase; padding: 8px 16px; cursor: pointer;
}
.ap-save {
  background: #2A55F5; border: none; color: #fff;
  font-family: inherit; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.06em;
  text-transform: uppercase; padding: 8px 20px; cursor: pointer;
  display: inline-flex; align-items: center;
}
.ap-save:hover:not(:disabled) { background: #1E42D6; }
.ap-save:disabled { opacity: 0.5; cursor: not-allowed; }

/* Workout outer wrapper */
.workout-outer { display: flex; flex-direction: column; }

/* Spin */
.spin { animation: spin 0.8s linear infinite; display: inline-block; }
.me-1 { margin-right: 4px; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

/* Buttons */
.btn {
  border: 2px solid #16130F; background: #fff;
  color: #16130F; border-radius: 0; height: 40px; padding: 0 18px;
  font-weight: 700; font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.78rem; letter-spacing: 0.06em; text-transform: uppercase;
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  cursor: pointer; transition: all 0.2s;
}
.btn:disabled { opacity: 0.45; cursor: not-allowed; }
.btn-primary {
  background: #2A55F5; border-color: #16130F; color: #fff;
  border-radius: 999px; box-shadow: 3px 3px 0 #16130F;
}
.btn-primary:hover:not(:disabled) { background: #1E42D6; }
.btn-outline-danger { background: #fff; border-color: #C0392B; color: #C0392B; }
.btn-outline-danger:hover:not(:disabled) { background: rgba(192,57,43,0.06); }
.adaptive-toggle-btn { background: #fff; border-color: #2A55F5; color: #2A55F5; }
.adaptive-toggle-btn:hover:not(:disabled) { background: #EEF1FF; }
.adaptive-toggle-btn--off { border-color: #8A8A8A; color: #8A8A8A; }
.adaptive-toggle-btn--off:hover:not(:disabled) { background: rgba(138,138,138,0.08); }
.btn-sm { height: 36px; padding: 0 14px; font-size: 0.72rem; }
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
  width: 100%; background: #16130F; color: #fff;
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
