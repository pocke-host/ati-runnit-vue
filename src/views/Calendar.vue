<!-- src/views/Calendar.vue — Training Calendar with AI workout generation -->
<template>
  <div class="cal-page">

    <!-- HERO ─────────────────────────────────────────────── -->
    <section class="cal-hero">
      <div class="cal-hero-inner">
        <div class="cal-nav-row">
          <div class="cal-month-nav">
            <button class="nav-btn" @click="prevMonth" aria-label="Previous month"><i class="bi bi-chevron-left"></i></button>
            <h1 class="cal-month-title">{{ monthLabel }}</h1>
            <button class="nav-btn" @click="nextMonth" aria-label="Next month"><i class="bi bi-chevron-right"></i></button>
          </div>
          <div class="cal-hero-actions">
            <button class="hero-btn-ghost" @click="goToday">Today</button>
            <button class="hero-btn-ai" @click="openWeekPlan">
              <i class="bi bi-stars me-1"></i>AI Plan Week
            </button>
          </div>
        </div>
        <div class="cal-legend">
          <span v-for="(color, type) in legendColors" :key="type" class="legend-item">
            <span class="legend-dot" :style="{ background: color }"></span>{{ type.replace('_', ' ') }}
          </span>
        </div>
      </div>
    </section>

    <!-- SPLIT LAYOUT ─────────────────────────────────────── -->
    <div class="cal-body" :class="{ 'drawer-open': !!selectedDate }">

      <!-- CALENDAR GRID ──────────────────────────────────── -->
      <div class="cal-grid-wrap">
        <!-- Day-of-week headers -->
        <div class="cal-dow-headers">
          <div v-for="d in DOW_LABELS" :key="d" class="cal-dow">{{ d }}</div>
        </div>
        <!-- Cells -->
        <div class="cal-grid">
          <div
            v-for="day in calDays"
            :key="day.fullDate"
            :class="[
              'cal-cell',
              { 'cal-cell-other': !day.isCurrentMonth },
              { 'cal-cell-today': day.isToday },
              { 'cal-cell-selected': day.fullDate === selectedDate },
              { 'cal-cell-past': day.isPast && !day.isToday },
            ]"
            @click="selectDay(day.fullDate)"
          >
            <div class="cal-date-num">
              {{ day.date }}
              <span v-if="day.weather" class="cal-weather-icon" :title="day.weather.label">{{ day.weather.icon }}</span>
            </div>

            <!-- Planned events -->
            <div
              v-for="ev in day.events"
              :key="ev.id"
              class="cal-chip"
              :style="{ background: typeColor(ev.workoutType) }"
            >
              <span class="cal-chip-type">{{ ev.workoutType?.replace('_', ' ') || 'WORKOUT' }}</span>
              <span class="cal-chip-dist" v-if="ev.distanceMeters">
                {{ formatDistShort(ev.distanceMeters) }}
              </span>
            </div>

            <!-- Completed activities -->
            <div
              v-for="act in day.activities"
              :key="'a' + act.id"
              class="cal-chip cal-chip-done"
            >
              <span class="cal-chip-type">✓ {{ act.sportType }}</span>
              <span class="cal-chip-dist">{{ formatDistShort(act.distanceMeters) }}</span>
            </div>

            <!-- Race bookmarks -->
            <div
              v-for="race in day.races"
              :key="'r' + race.id"
              class="cal-chip cal-chip-race"
            >
              <span class="cal-chip-type">🏁 {{ race.raceName }}</span>
            </div>

            <!-- Group events indicator -->
            <i
              v-if="day.groupEvents?.length"
              class="bi bi-people-fill cal-group-icon"
              :title="`${day.groupEvents.length} group event${day.groupEvents.length > 1 ? 's' : ''}`"
            ></i>

            <button
              class="cal-plus"
              @click.stop="quickAdd(day.fullDate)"
              :title="'Add workout on ' + day.fullDate"
            >+</button>
          </div>
        </div>
      </div>

      <!-- RIGHT DRAWER ───────────────────────────────────── -->
      <aside class="cal-drawer" v-if="selectedDate">
        <div class="drawer-header">
          <h2 class="drawer-date">{{ drawerDateLabel }}</h2>
          <button class="drawer-close" @click="selectedDate = null"><i class="bi bi-x-lg"></i></button>
        </div>

        <div class="drawer-body">

          <!-- Weather warning strip -->
          <div
            v-if="selectedDay?.weather"
            :class="['weather-warn', { 'weather-warn--severe': selectedDay.weather.severe }]"
          >
            <span class="weather-warn-icon">{{ selectedDay.weather.icon }}</span>
            <span class="weather-warn-label">{{ selectedDay.weather.label }}</span>
          </div>

          <!-- Group Events -->
          <div class="drawer-section" v-if="selectedGroupEvents.length">
            <div class="drawer-section-label">GROUP EVENTS</div>
            <div v-for="ge in selectedGroupEvents" :key="'ge' + ge.id" class="drawer-group-event">
              <div class="dge-head">
                <span class="dge-sport">{{ sportEmojiForType(ge.sportType) }}</span>
                <span class="dge-title">{{ ge.title }}</span>
                <span class="dge-rsvp-badge" v-if="ge.myRsvpStatus" :class="`rsvp-${ge.myRsvpStatus?.toLowerCase()}`">
                  {{ ge.myRsvpStatus }}
                </span>
              </div>
              <div class="dge-meta">
                <span v-if="ge.locationName"><i class="bi bi-geo-alt"></i> {{ ge.locationName }}</span>
                <span class="dge-time">{{ ge.eventDatetime?.slice(11, 16) }}</span>
                <span class="dge-creator">by {{ ge.creatorName }}</span>
                <span class="dge-attendees"><i class="bi bi-people"></i> {{ ge.attendeeCount + 1 }} going</span>
              </div>
              <!-- RSVP buttons (only if invited) -->
              <div class="dge-rsvp-row" v-if="ge.myInviteId">
                <button
                  class="dge-rsvp-btn dge-rsvp-yes"
                  :class="{ active: ge.myRsvpStatus === 'ACCEPTED' }"
                  @click="handleRsvp(ge, 'ACCEPTED')"
                >Going</button>
                <button
                  class="dge-rsvp-btn dge-rsvp-maybe"
                  :class="{ active: ge.myRsvpStatus === 'MAYBE' }"
                  @click="handleRsvp(ge, 'MAYBE')"
                >Maybe</button>
                <button
                  class="dge-rsvp-btn dge-rsvp-no"
                  :class="{ active: ge.myRsvpStatus === 'DECLINED' }"
                  @click="handleRsvp(ge, 'DECLINED')"
                >Decline</button>
              </div>
              <!-- Calendar export -->
              <div class="dge-export-row">
                <a :href="googleCalUrl(ge)" target="_blank" rel="noopener" class="dge-export-link">
                  <i class="bi bi-google"></i> Google Calendar
                </a>
                <button class="dge-export-link" @click="downloadIcs(ge)">
                  <i class="bi bi-download"></i> Download .ics
                </button>
              </div>
            </div>
          </div>

          <!-- Planned workouts -->
          <div class="drawer-section" v-if="selectedEvents.length">
            <div class="drawer-section-label">PLANNED</div>
            <div v-for="ev in selectedEvents" :key="ev.id" class="drawer-event">
              <div class="drawer-event-head">
                <span class="drawer-type-chip" :style="{ background: typeColor(ev.workoutType) }">
                  {{ ev.workoutType?.replace('_', ' ') || 'WORKOUT' }}
                </span>
                <span class="drawer-event-source" v-if="ev.source === 'AI'">
                  <i class="bi bi-stars"></i> AI
                </span>
                <div class="drawer-event-actions">
                  <button @click="editEvent(ev)" class="ev-btn"><i class="bi bi-pencil"></i></button>
                  <button @click="deleteEvent(ev.id)" class="ev-btn ev-btn-del"><i class="bi bi-trash"></i></button>
                </div>
              </div>
              <div class="drawer-event-title">{{ ev.title }}</div>
              <div class="drawer-event-meta" v-if="ev.distanceMeters || ev.durationMinutes">
                <span v-if="ev.distanceMeters">{{ formatDistShort(ev.distanceMeters) }}</span>
                <span v-if="ev.distanceMeters && ev.durationMinutes"> · </span>
                <span v-if="ev.durationMinutes">{{ ev.durationMinutes }} min</span>
              </div>
              <div class="drawer-event-desc" v-if="ev.description">{{ ev.description }}</div>
            </div>
          </div>

          <!-- Completed activities -->
          <div class="drawer-section" v-if="selectedActivities.length">
            <div class="drawer-section-label">COMPLETED</div>
            <router-link
              v-for="act in selectedActivities"
              :key="act.id"
              :to="`/activities/${act.id}`"
              class="drawer-act"
            >
              <div class="drawer-act-icon">{{ sportIcon(act.sportType) }}</div>
              <div class="drawer-act-info">
                <div class="drawer-act-type">{{ act.sportType }}</div>
                <div class="drawer-act-meta">
                  {{ formatDistShort(act.distanceMeters) }} · {{ formatDurShort(act.durationSeconds) }}
                </div>
              </div>
              <i class="bi bi-chevron-right drawer-act-arrow"></i>
            </router-link>
          </div>

          <!-- Race bookmarks -->
          <div class="drawer-section" v-if="selectedRaces.length">
            <div class="drawer-section-label">RACES</div>
            <div v-for="race in selectedRaces" :key="race.id" class="drawer-race">
              <div class="drawer-race-head">
                <span class="drawer-race-chip">🏁 {{ race.raceType || 'Race' }}</span>
                <button class="ev-btn ev-btn-del" @click="removeRaceBookmark(race)" title="Remove bookmark">
                  <i class="bi bi-bookmark-x"></i>
                </button>
              </div>
              <div class="drawer-race-name">{{ race.raceName }}</div>
              <div class="drawer-race-meta" v-if="race.city || race.state">
                <i class="bi bi-geo-alt"></i>
                {{ race.city }}<span v-if="race.city && race.state">, </span>{{ race.state }}
              </div>
              <a v-if="race.raceUrl" :href="race.raceUrl" target="_blank" rel="noopener" class="drawer-race-link">
                View → <i class="bi bi-box-arrow-up-right"></i>
              </a>
            </div>
          </div>

          <!-- Empty state -->
          <div class="drawer-empty" v-if="!selectedEvents.length && !selectedActivities.length && !selectedRaces.length && !selectedGroupEvents.length && !showCreateForm && !aiSuggestion">
            <i class="bi bi-calendar3" style="font-size:2rem;color:#d0d0d0"></i>
            <p>Nothing planned yet</p>
          </div>

          <!-- AI Suggestion card -->
          <div class="ai-card" v-if="aiSuggestion">
            <div class="ai-card-header">
              <span class="ai-badge"><i class="bi bi-stars me-1"></i>AI Suggestion</span>
              <button class="ai-close" @click="aiSuggestion = null"><i class="bi bi-x"></i></button>
            </div>
            <div class="ai-type-chip" :style="{ background: typeColor(aiSuggestion.workoutType) }">
              {{ aiSuggestion.workoutType?.replace('_', ' ') }}
            </div>
            <div class="ai-title">{{ aiSuggestion.title }}</div>
            <div class="ai-meta" v-if="aiSuggestion.distanceMeters || aiSuggestion.durationMinutes">
              <span v-if="aiSuggestion.distanceMeters">{{ formatDistShort(aiSuggestion.distanceMeters) }}</span>
              <span v-if="aiSuggestion.durationMinutes"> · ~{{ aiSuggestion.durationMinutes }} min</span>
            </div>
            <div class="ai-desc">{{ aiSuggestion.description }}</div>
            <div class="ai-reasoning" v-if="aiSuggestion.reasoning">
              <i class="bi bi-lightbulb-fill me-1"></i>{{ aiSuggestion.reasoning }}
            </div>
            <div class="ai-actions">
              <button class="ai-btn-accept" @click="acceptAiSuggestion" :disabled="saveLoading">
                <span v-if="saveLoading" class="spinner-border spinner-border-sm me-1"></span>
                Add to Calendar
              </button>
              <button class="ai-btn-regen" @click="regenerate">
                <i class="bi bi-arrow-clockwise me-1"></i>Different
              </button>
            </div>
          </div>

          <!-- Create / Edit form -->
          <div class="create-form" v-if="showCreateForm">
            <div class="create-form-header">
              <div class="create-form-title">{{ editingEvent ? 'Edit Workout' : 'Add Workout' }}</div>
              <button class="create-form-close" @click="closeCreateForm"><i class="bi bi-x-lg"></i></button>
            </div>
            <div class="form-group">
              <label class="form-label">Type</label>
              <div class="type-pills">
                <button
                  v-for="t in WORKOUT_TYPES"
                  :key="t"
                  :class="['type-pill', { active: createForm.workoutType === t }]"
                  :style="createForm.workoutType === t ? { background: typeColor(t), color: '#fff', border: 'none' } : {}"
                  @click="createForm.workoutType = t"
                >{{ t.replace('_', ' ') }}</button>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Title</label>
              <input v-model="createForm.title" class="form-control" :placeholder="createForm.workoutType ? createForm.workoutType.replace('_', ' ') + ' Run' : 'Workout'" />
            </div>
            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label">Distance ({{ distanceLabel }})</label>
                <input v-model.number="createForm.distanceDisplay" type="number" class="form-control" placeholder="0" step="0.1" min="0" />
              </div>
              <div class="form-group">
                <label class="form-label">Duration (min)</label>
                <input v-model.number="createForm.durationMinutes" type="number" class="form-control" placeholder="0" min="0" />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Description <span class="optional">(optional)</span></label>
              <textarea v-model="createForm.description" class="form-control" rows="3" placeholder="Workout details…"></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">Notes <span class="optional">(optional)</span></label>
              <input v-model="createForm.notes" class="form-control" placeholder="Personal notes…" />
            </div>
            <div v-if="formError" class="form-error">{{ formError }}</div>
            <div class="form-actions">
              <button class="btn-cancel" @click="closeCreateForm">Cancel</button>
              <button class="btn-save" @click="saveEvent" :disabled="saveLoading">
                <span v-if="saveLoading" class="spinner-border spinner-border-sm me-1"></span>
                {{ editingEvent ? 'Save Changes' : 'Add Workout' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Drawer footer actions -->
        <div class="drawer-footer" v-if="!showCreateForm">
          <button class="footer-btn" @click="openCreateForm">
            <i class="bi bi-plus-lg me-1"></i>Manual
          </button>
          <button class="footer-btn footer-btn-group" @click="showGroupEventModal = true">
            <i class="bi bi-people me-1"></i>Group Event
          </button>
          <button class="footer-btn footer-btn-ai" @click="getAiSuggestion" :disabled="aiLoading">
            <span v-if="aiLoading" class="spinner-border spinner-border-sm me-1"></span>
            <i v-else class="bi bi-stars me-1"></i>
            {{ aiLoading ? 'Thinking…' : 'AI Suggest' }}
          </button>
        </div>
      </aside>

    </div>

    <!-- CREATE GROUP EVENT MODAL ───────────────────────── -->
    <CreateGroupEventModal
      v-if="showGroupEventModal"
      @close="showGroupEventModal = false"
      @created="onGroupEventCreated"
    />

    <!-- AI PLAN WEEK MODAL ──────────────────────────────── -->
    <div v-if="showWeekPlanModal" class="modal-overlay" @click.self="showWeekPlanModal = false">
      <div class="modal-card modal-week">
        <div class="modal-header">
          <h3>AI Plan Week</h3>
          <div class="modal-header-sub">Week of {{ weekPlanLabel }}</div>
          <button class="modal-close" @click="showWeekPlanModal = false"><i class="bi bi-x-lg"></i></button>
        </div>

        <div class="modal-body">
          <div v-if="weekPlanLoading" class="week-plan-loading">
            <div class="spinner-border"></div>
            <p>Analyzing your training history…</p>
          </div>
          <div v-else class="week-plan-grid">
            <div
              v-for="item in weekPlanItems"
              :key="item.dateStr"
              :class="['week-plan-card', { 'week-plan-selected': item.selected }]"
              @click="item.selected = !item.selected"
            >
              <div class="wpc-dow">{{ weekDayShort(item.dateStr) }}</div>
              <div class="wpc-date">{{ weekDayNum(item.dateStr) }}</div>
              <div class="wpc-type-chip" :style="{ background: typeColor(item.workout.workoutType) }">
                {{ item.workout.workoutType?.replace('_', ' ') }}
              </div>
              <div class="wpc-title">{{ item.workout.title }}</div>
              <div class="wpc-dist" v-if="item.workout.distanceMeters">
                {{ formatDistShort(item.workout.distanceMeters) }}
              </div>
              <div class="wpc-reasoning">{{ item.workout.reasoning }}</div>
              <div class="wpc-check"><i :class="item.selected ? 'bi bi-check-circle-fill' : 'bi bi-circle'"></i></div>
            </div>
          </div>
        </div>

        <div class="modal-footer" v-if="!weekPlanLoading">
          <span class="modal-footer-count">{{ weekPlanItems.filter(i => i.selected).length }} workouts selected</span>
          <button class="btn-cancel" @click="showWeekPlanModal = false">Cancel</button>
          <button
            class="btn-save"
            @click="addWeekPlan"
            :disabled="!weekPlanItems.some(i => i.selected) || saveLoading"
          >
            <span v-if="saveLoading" class="spinner-border spinner-border-sm me-1"></span>
            Add to Calendar
          </button>
        </div>
      </div>
    </div>

  <ConfirmModal
    v-model="showDeleteWorkoutConfirm"
    title="Remove Workout"
    body="This will remove the workout from your calendar."
    confirm-label="Remove"
    :danger="true"
    @confirm="doDeleteEvent"
  />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useActivityStore } from '@/stores/activity'
import { useGroupEventStore } from '@/stores/groupEvent'
import { storeToRefs } from 'pinia'
import { useUnits } from '@/composables/useUnits'
import { useAiWorkout } from '@/composables/useAiWorkout'
import { useToast } from '@/composables/useToast'
import { initWeather, getWeatherForDate } from '@/composables/useWeather'
import axios from 'axios'
import ConfirmModal from '@/components/ConfirmModal.vue'
import CreateGroupEventModal from '@/components/CreateGroupEventModal.vue'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const activityStore = useActivityStore()
const { activities } = storeToRefs(activityStore)
const groupEventStore = useGroupEventStore()
const { events: groupEvents } = storeToRefs(groupEventStore)
const showGroupEventModal = ref(false)
const { isImperial, distanceLabel } = useUnits()
const { generateWorkout, generateWeek, typeColor, TYPE_COLORS } = useAiWorkout()
const legendColors = computed(() => ({ ...TYPE_COLORS, RACE: '#ef4444' }))

const DOW_LABELS    = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const WORKOUT_TYPES = ['EASY', 'TEMPO', 'INTERVAL', 'LONG_RUN', 'RECOVERY', 'REST']

const todayStr = new Date().toISOString().slice(0, 10)
const currentYear  = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth()) // 0-indexed

const events       = ref([])
const raceBookmarks = ref([])
const selectedDate = ref(null)
const aiSuggestion = ref(null)
const aiLoading    = ref(false)
const aiVariant    = ref(0)
const showCreateForm = ref(false)
const editingEvent   = ref(null)
const { showToast } = useToast()
const saveLoading    = ref(false)
const formError      = ref('')
const showDeleteWorkoutConfirm = ref(false)
const pendingDeleteId = ref(null)
const showWeekPlanModal = ref(false)
const weekPlanItems     = ref([])
const weekPlanLoading   = ref(false)

const createForm = ref({
  workoutType: 'EASY', title: '', description: '',
  distanceDisplay: '', durationMinutes: '', notes: ''
})

// ── Computed ──────────────────────────────────────────────────

const monthLabel = computed(() => {
  return new Date(currentYear.value, currentMonth.value, 1)
    .toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
})

const calDays = computed(() => {
  const y = currentYear.value
  const m = currentMonth.value
  const first = new Date(y, m, 1)
  const last  = new Date(y, m + 1, 0)
  const startDow = (first.getDay() + 6) % 7 // Mon=0

  const days = []

  // Padding from prev month
  for (let i = startDow - 1; i >= 0; i--) {
    days.push(_makeDay(new Date(y, m, -i), false))
  }
  // Current month
  for (let d = 1; d <= last.getDate(); d++) {
    days.push(_makeDay(new Date(y, m, d), true))
  }
  // Pad to complete grid (multiple of 7)
  const extra = days.length % 7 === 0 ? 0 : 7 - (days.length % 7)
  for (let i = 1; i <= extra; i++) {
    days.push(_makeDay(new Date(y, m + 1, i), false))
  }
  return days
})

function _makeDay(date, isCurrentMonth) {
  const fullDate = date.toISOString().slice(0, 10)
  const today    = new Date()
  today.setHours(23, 59, 59, 999)
  return {
    date: date.getDate(),
    fullDate,
    isCurrentMonth,
    isToday: fullDate === todayStr,
    isPast:  date < new Date(todayStr),
    events:      events.value.filter(e => e.plannedDate === fullDate),
    activities:  (activities.value || []).filter(a => a.createdAt?.slice(0, 10) === fullDate),
    races:       raceBookmarks.value.filter(r => r.raceDate === fullDate),
    groupEvents: groupEvents.value.filter(ge => ge.eventDatetime?.slice(0, 10) === fullDate),
    weather:     getWeatherForDate(fullDate),
  }
}

const selectedEvents = computed(() =>
  events.value.filter(e => e.plannedDate === selectedDate.value)
)

const selectedActivities = computed(() =>
  (activities.value || []).filter(a => a.createdAt?.slice(0, 10) === selectedDate.value)
)

const selectedRaces = computed(() =>
  raceBookmarks.value.filter(r => r.raceDate === selectedDate.value)
)

const selectedGroupEvents = computed(() =>
  groupEvents.value.filter(ge => ge.eventDatetime?.slice(0, 10) === selectedDate.value)
)

function googleCalUrl(ge) {
  const dt = ge.eventDatetime?.replace('T', '').replace(/[-:]/g, '').slice(0, 15)
  const dtEnd = dt // single moment; Google needs start/end
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: ge.title,
    dates: `${dt}/${dtEnd}`,
    details: ge.description || '',
    location: ge.locationName || '',
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

function downloadIcs(ge) {
  const dt = ge.eventDatetime?.replace('T', '').replace(/[-:]/g, '').slice(0, 15) + 'Z'
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `SUMMARY:${ge.title}`,
    `DTSTART:${dt}`,
    `DTEND:${dt}`,
    `LOCATION:${ge.locationName || ''}`,
    `DESCRIPTION:${ge.description || ''}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
  const blob = new Blob([ics], { type: 'text/calendar' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `${ge.title.replace(/\s+/g, '_')}.ics`; a.click()
  URL.revokeObjectURL(url)
}

function sportEmojiForType(type) {
  const map = { RUN: '🏃', RIDE: '🚴', SWIM: '🏊', HIKE: '🥾', WALK: '🚶', TRIATHLON: '🏅' }
  return map[type] || '🏃'
}

async function handleRsvp(ge, status) {
  if (!ge.myInviteId) return
  await groupEventStore.rsvp(ge.myInviteId, status)
}

function onGroupEventCreated() {
  groupEventStore.fetchMyEvents()
}

const selectedDay = computed(() =>
  selectedDate.value ? calDays.value.find(d => d.fullDate === selectedDate.value) ?? null : null
)

const drawerDateLabel = computed(() => {
  if (!selectedDate.value) return ''
  return new Date(selectedDate.value + 'T12:00:00')
    .toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
})

const weekPlanLabel = computed(() => {
  const items = weekPlanItems.value
  if (!items.length) return ''
  return new Date(items[0].dateStr + 'T12:00:00')
    .toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
})

// ── Navigation ────────────────────────────────────────────────

function prevMonth() {
  if (currentMonth.value === 0) { currentMonth.value = 11; currentYear.value-- }
  else currentMonth.value--
}
function nextMonth() {
  if (currentMonth.value === 11) { currentMonth.value = 0; currentYear.value++ }
  else currentMonth.value++
}
function goToday() {
  currentYear.value  = new Date().getFullYear()
  currentMonth.value = new Date().getMonth()
}

// ── Day selection ─────────────────────────────────────────────

function selectDay(fullDate) {
  if (selectedDate.value === fullDate) { selectedDate.value = null; return }
  selectedDate.value   = fullDate
  aiSuggestion.value   = null
  showCreateForm.value = false
  editingEvent.value   = null
  formError.value      = ''
}

function quickAdd(fullDate) {
  selectDay(fullDate)
  openCreateForm()
}

// ── Race Bookmarks ────────────────────────────────────────────

async function fetchRaceBookmarks() {
  try {
    const { data } = await axios.get(`${API}/race-bookmarks`)
    raceBookmarks.value = Array.isArray(data) ? data : []
  } catch {
    raceBookmarks.value = []
  }
}

async function removeRaceBookmark(race) {
  try {
    await axios.delete(`${API}/race-bookmarks/${race.id}`)
    raceBookmarks.value = raceBookmarks.value.filter(r => r.id !== race.id)
  } catch { /* silent */ }
}

// ── Events CRUD ───────────────────────────────────────────────

async function fetchEvents() {
  const y = currentYear.value
  const m = currentMonth.value
  const start = new Date(y, m, 1).toISOString().slice(0, 10)
  const end   = new Date(y, m + 1, 0).toISOString().slice(0, 10)
  try {
    const { data } = await axios.get(`${API}/workout-events`, { params: { start, end } })
    events.value = Array.isArray(data) ? data : []
  } catch {
    events.value = []
  }
}

async function saveEvent() {
  formError.value = ''
  if (!createForm.value.workoutType) { formError.value = 'Choose a workout type'; return }
  saveLoading.value = true
  try {
    const distMeters = createForm.value.distanceDisplay
      ? Math.round(isImperial.value
          ? createForm.value.distanceDisplay / 0.000621371
          : createForm.value.distanceDisplay * 1000)
      : null
    const payload = {
      plannedDate:     selectedDate.value,
      workoutType:     createForm.value.workoutType,
      title:           createForm.value.title || createForm.value.workoutType.replace('_', ' ') + ' Run',
      description:     createForm.value.description || null,
      notes:           createForm.value.notes || null,
      distanceMeters:  distMeters,
      durationMinutes: createForm.value.durationMinutes || null,
      source:          'MANUAL',
    }
    if (editingEvent.value) {
      const { data } = await axios.put(`${API}/workout-events/${editingEvent.value.id}`, payload)
      const idx = events.value.findIndex(e => e.id === editingEvent.value.id)
      if (idx >= 0) events.value[idx] = data
    } else {
      const { data } = await axios.post(`${API}/workout-events`, payload)
      events.value.push(data)
    }
    closeCreateForm()
  } catch (e) {
    formError.value = e.response?.data?.error || 'Failed to save'
  } finally {
    saveLoading.value = false
  }
}

function deleteEvent(id) {
  pendingDeleteId.value = id
  showDeleteWorkoutConfirm.value = true
}

async function doDeleteEvent() {
  showDeleteWorkoutConfirm.value = false
  const id = pendingDeleteId.value
  try {
    await axios.delete(`${API}/workout-events/${id}`)
    events.value = events.value.filter(e => e.id !== id)
    showToast('Workout removed.', 'info')
  } catch {
    showToast('Failed to remove workout. Try again.', 'error')
  }
}

function editEvent(ev) {
  editingEvent.value = ev
  createForm.value = {
    workoutType:     ev.workoutType || 'EASY',
    title:           ev.title || '',
    description:     ev.description || '',
    notes:           ev.notes || '',
    distanceDisplay: ev.distanceMeters
      ? Math.round((isImperial.value ? ev.distanceMeters * 0.000621371 : ev.distanceMeters / 1000) * 10) / 10
      : '',
    durationMinutes: ev.durationMinutes || '',
  }
  showCreateForm.value = true
  aiSuggestion.value   = null
}

function openCreateForm() {
  editingEvent.value   = null
  createForm.value     = { workoutType: 'EASY', title: '', description: '', distanceDisplay: '', durationMinutes: '', notes: '' }
  showCreateForm.value = true
  aiSuggestion.value   = null
}
function closeCreateForm() {
  showCreateForm.value = false
  editingEvent.value   = null
  formError.value      = ''
}

// ── AI Suggest ────────────────────────────────────────────────

function _buildContext() {
  const acts = activities.value || []
  // Compute lightweight CTL/ATL for context
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  const dayMs = 86400000
  const dailyLoad = new Array(90).fill(0)
  for (const a of acts) {
    const daysAgo = Math.floor((today - new Date(a.createdAt)) / dayMs)
    if (daysAgo >= 0 && daysAgo < 90) dailyLoad[89 - daysAgo] += (a.distanceMeters || 0) / 1000
  }
  let ctl = 0, atl = 0
  for (let i = 0; i < 90; i++) {
    ctl = ctl * (1 - 1/42) + dailyLoad[i] * (1/42)
    atl = atl * (1 - 1/7)  + dailyLoad[i] * (1/7)
  }
  const acwr      = ctl > 0 ? Math.round((atl / ctl) * 100) / 100 : 1
  const formScore = Math.round(Math.min(100, ctl * 10) - Math.min(100, atl * 10))
  return { recentActivities: acts, fitnessMetrics: { ctl, atl, acwr, formScore } }
}

async function getAiSuggestion() {
  aiLoading.value    = true
  aiSuggestion.value = null
  aiVariant.value    = 0
  // Simulate brief AI "thinking" delay for UX
  await new Promise(r => setTimeout(r, 600))
  const ctx = { ..._buildContext(), variant: aiVariant.value }
  aiSuggestion.value = generateWorkout(selectedDate.value, ctx)
  aiLoading.value    = false
  showCreateForm.value = false
}

function regenerate() {
  aiVariant.value = (aiVariant.value + 1) % 3
  const ctx = { ..._buildContext(), variant: aiVariant.value }
  aiSuggestion.value = generateWorkout(selectedDate.value, ctx)
}

async function acceptAiSuggestion() {
  if (!aiSuggestion.value) return
  saveLoading.value = true
  try {
    const payload = {
      plannedDate:     selectedDate.value,
      workoutType:     aiSuggestion.value.workoutType,
      title:           aiSuggestion.value.title,
      description:     aiSuggestion.value.description,
      distanceMeters:  aiSuggestion.value.distanceMeters || null,
      durationMinutes: aiSuggestion.value.durationMinutes || null,
      source:          'AI',
    }
    const { data } = await axios.post(`${API}/workout-events`, payload)
    events.value.push(data)
    aiSuggestion.value = null
  } catch { /* silent */ }
  finally { saveLoading.value = false }
}

// ── AI Plan Week ──────────────────────────────────────────────

async function openWeekPlan() {
  // Find Monday of the currently displayed month's current week (or today's week)
  const d = new Date()
  const dow = (d.getDay() + 6) % 7 // Mon=0
  d.setDate(d.getDate() - dow)
  weekPlanLoading.value = true
  showWeekPlanModal.value = true
  weekPlanItems.value = []

  await new Promise(r => setTimeout(r, 700))

  const mondayStr = d.toISOString().slice(0, 10)
  const ctx = { ..._buildContext(), existingEvents: events.value }
  const suggestions = generateWeek(mondayStr, ctx)
  weekPlanItems.value = suggestions.map(s => ({ ...s, selected: true }))
  weekPlanLoading.value = false
}

async function addWeekPlan() {
  saveLoading.value = true
  try {
    const selected = weekPlanItems.value.filter(i => i.selected)
    for (const item of selected) {
      const payload = {
        plannedDate:     item.dateStr,
        workoutType:     item.workout.workoutType,
        title:           item.workout.title,
        description:     item.workout.description,
        distanceMeters:  item.workout.distanceMeters || null,
        durationMinutes: item.workout.durationMinutes || null,
        source:          'AI',
      }
      const { data } = await axios.post(`${API}/workout-events`, payload)
      events.value.push(data)
    }
    showWeekPlanModal.value = false
  } catch { /* silent */ }
  finally { saveLoading.value = false }
}

// ── Helpers ───────────────────────────────────────────────────

function formatDistShort(meters) {
  if (!meters) return ''
  if (isImperial.value) return `${(meters * 0.000621371).toFixed(1)}mi`
  return `${(meters / 1000).toFixed(1)}km`
}

function formatDurShort(seconds) {
  if (!seconds) return ''
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return h > 0 ? `${h}h${m}m` : `${m}m`
}

function sportIcon(type) {
  const map = { RUN: '🏃', Running: '🏃', BIKE: '🚴', Cycling: '🚴', SWIM: '🏊', Swimming: '🏊', HIKE: '🥾', Hiking: '🥾', WALK: '🚶', Walking: '🚶' }
  return map[type] || '⚡'
}

function weekDayShort(dateStr) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
}
function weekDayNum(dateStr) {
  return new Date(dateStr + 'T12:00:00').getDate()
}

// ── Lifecycle ─────────────────────────────────────────────────

onMounted(async () => {
  if (!activities.value.length) await activityStore.fetchActivities()
  await Promise.all([fetchEvents(), fetchRaceBookmarks(), groupEventStore.fetchMyEvents()])

  // Weather: use cached coords or request geolocation
  const cachedLoc = localStorage.getItem('runnit_weather_loc')
  if (cachedLoc) {
    try {
      const { lat, lng } = JSON.parse(cachedLoc)
      initWeather(lat, lng)
    } catch { /* ignore malformed cache */ }
  } else if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        localStorage.setItem('runnit_weather_loc', JSON.stringify({ lat, lng }))
        initWeather(lat, lng)
      },
      () => { /* denied — silently skip */ }
    )
  }
})

watch([currentYear, currentMonth], fetchEvents)
</script>

<style scoped>
.cal-page {
  min-height: 100vh;
  padding-top: var(--nav-h, 64px);
  background: #fff;
  font-family: Futura, "Futura PT", "Avenir Next", Avenir, system-ui, sans-serif;
}

/* HERO */
.cal-hero {
  background: #000;
  padding: 28px 24px 20px;
  color: #fff;
}
.cal-hero-inner { max-width: 1300px; margin: 0 auto; }
.cal-nav-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.cal-month-nav {
  display: flex;
  align-items: center;
  gap: 16px;
}
.cal-month-title {
  font-size: 1.8rem;
  font-weight: 900;
  color: #fff;
  margin: 0;
  min-width: 240px;
  text-align: center;
  letter-spacing: 0.02em;
}
.nav-btn {
  background: rgba(255,255,255,0.12);
  border: none;
  color: #fff;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.15s;
}
.nav-btn:hover { background: rgba(255,255,255,0.25); }
.cal-hero-actions { display: flex; gap: 10px; }
.hero-btn-ghost {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.35);
  color: #fff;
  font-size: 0.80rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 8px 18px;
  cursor: pointer;
  transition: background 0.15s;
}
.hero-btn-ghost:hover { background: rgba(255,255,255,0.12); }
.hero-btn-ai {
  background: #fff;
  border: none;
  color: #000;
  font-size: 0.80rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 8px 18px;
  cursor: pointer;
  transition: opacity 0.15s;
}
.hero-btn-ai:hover { opacity: 0.85; }
.cal-legend {
  display: flex;
  gap: 16px;
  margin-top: 14px;
  flex-wrap: wrap;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgba(255,255,255,0.60);
}
.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* BODY SPLIT */
.cal-body {
  display: block;
  max-width: 1300px;
  margin: 0 auto;
  padding: 24px 16px 80px;
  transition: padding-right 0.3s;
}
.cal-body.drawer-open {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 24px;
  align-items: start;
}

/* GRID */
.cal-grid-wrap { min-width: 0; }
.cal-dow-headers {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  margin-bottom: 2px;
}
.cal-dow {
  text-align: center;
  font-size: 0.70rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(15,18,16,0.40);
  padding: 6px 0;
}
.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}
.cal-cell {
  min-height: 100px;
  background: #fff;
  border: 1px solid #E5E5E5;
  padding: 8px 6px 6px;
  cursor: pointer;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 3px;
  transition: border-color 0.12s;
}
.cal-cell:hover { border-color: #999; }
.cal-cell-other { background: #fafafa; }
.cal-cell-other .cal-date-num { color: #ccc; }
.cal-cell-today { border-color: #000; border-width: 2px; }
.cal-cell-today .cal-date-num { background: #000; color: #fff; }
.cal-cell-selected { border-color: #8b5cf6; border-width: 2px; background: #faf5ff; }
.cal-cell-past { opacity: 0.75; }

.cal-date-num {
  font-size: 0.78rem;
  font-weight: 900;
  color: rgba(15,18,16,0.75);
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  flex-shrink: 0;
  margin-bottom: 2px;
}
.cal-chip {
  border-radius: 0;
  padding: 2px 5px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
}
.cal-chip-type {
  font-size: 0.58rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.cal-chip-dist {
  font-size: 0.58rem;
  font-weight: 700;
  color: rgba(255,255,255,0.80);
  white-space: nowrap;
  flex-shrink: 0;
}
.cal-chip-done {
  background: #f0f0f0 !important;
}
.cal-chip-done .cal-chip-type { color: rgba(15,18,16,0.60); }
.cal-chip-done .cal-chip-dist { color: rgba(15,18,16,0.40); }
.cal-chip-race {
  background: #ef4444 !important;
}
.cal-chip-race .cal-chip-type { color: #fff; }
.cal-plus {
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 18px;
  height: 18px;
  border: 1px solid #ccc;
  background: #fff;
  font-size: 0.75rem;
  line-height: 1;
  cursor: pointer;
  display: none;
  align-items: center;
  justify-content: center;
  color: #767676;
  transition: all 0.1s;
}
.cal-cell:hover .cal-plus { display: flex; }
.cal-plus:hover { background: #000; color: #fff; border-color: #000; }

/* DRAWER */
.cal-drawer {
  background: #fff;
  border: 1px solid #E5E5E5;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - var(--nav-h, 64px) - 48px);
  position: sticky;
  top: calc(var(--nav-h, 64px) + 24px);
  overflow: hidden;
}
.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px 12px;
  border-bottom: 1px solid #E5E5E5;
  flex-shrink: 0;
}
.drawer-date {
  font-size: 1rem;
  font-weight: 900;
  margin: 0;
  color: #000;
}
.drawer-close {
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  color: #767676;
  padding: 4px;
}
.drawer-close:hover { color: #000; }
.drawer-body { flex: 1; overflow-y: auto; padding: 16px 18px; display: flex; flex-direction: column; gap: 16px; }
.drawer-section {}
.drawer-section-label {
  font-size: 0.65rem;
  font-weight: 900;
  letter-spacing: 0.12em;
  color: rgba(15,18,16,0.40);
  text-transform: uppercase;
  margin-bottom: 8px;
}
.drawer-event {
  background: #fafafa;
  border: 1px solid #E5E5E5;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
}
.drawer-event-head {
  display: flex;
  align-items: center;
  gap: 6px;
}
.drawer-type-chip {
  font-size: 0.62rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #fff;
  padding: 2px 7px;
}
.drawer-event-source {
  font-size: 0.62rem;
  font-weight: 700;
  color: #8b5cf6;
  margin-left: auto;
}
.drawer-event-actions { display: flex; gap: 4px; margin-left: auto; }
.ev-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #767676;
  font-size: 0.78rem;
  padding: 2px 5px;
}
.ev-btn:hover { color: #000; }
.ev-btn-del:hover { color: #ef4444; }
.drawer-event-title { font-size: 0.85rem; font-weight: 900; color: #000; }
.drawer-event-meta { font-size: 0.75rem; color: #767676; font-weight: 700; }
.drawer-event-desc { font-size: 0.75rem; color: rgba(15,18,16,0.60); line-height: 1.5; }
.drawer-act {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  background: #f9f9f9;
  border: 1px solid #E5E5E5;
  text-decoration: none;
  color: inherit;
  margin-bottom: 6px;
  transition: background 0.1s;
}
.drawer-act:hover { background: #f0f0f0; }
.drawer-act-icon { font-size: 1.2rem; }
.drawer-act-info { flex: 1; }
.drawer-act-type { font-size: 0.80rem; font-weight: 900; color: #000; }
.drawer-act-meta { font-size: 0.72rem; color: #767676; }
.drawer-act-arrow { color: #ccc; font-size: 0.80rem; }
.drawer-empty { text-align: center; padding: 32px 16px; color: rgba(15,18,16,0.35); }
.drawer-empty p { font-size: 0.85rem; margin-top: 10px; font-weight: 600; }

/* Drawer race entries */
.drawer-race {
  background: #fff5f5;
  border: 1px solid #fca5a5;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
}
.drawer-race-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.drawer-race-chip {
  font-size: 0.62rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #ef4444;
  background: #fee2e2;
  padding: 2px 7px;
}
.drawer-race-name { font-size: 0.88rem; font-weight: 900; color: #000; }
.drawer-race-meta { font-size: 0.75rem; color: #767676; display: flex; align-items: center; gap: 4px; }
.drawer-race-link {
  font-size: 0.75rem;
  font-weight: 700;
  color: #ef4444;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.drawer-race-link:hover { text-decoration: underline; }
.drawer-footer {
  display: flex;
  gap: 8px;
  padding: 12px 18px;
  border-top: 1px solid #E5E5E5;
  flex-shrink: 0;
}
.footer-btn {
  flex: 1;
  padding: 10px;
  border: 1px solid #E5E5E5;
  background: #fff;
  font-size: 0.78rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s;
}
.footer-btn:hover { background: #f5f5f5; border-color: #000; }
.footer-btn-ai {
  background: #000;
  color: #fff;
  border-color: #000;
}
.footer-btn-ai:hover { opacity: 0.85; }
.footer-btn-ai:disabled { opacity: 0.5; cursor: not-allowed; }

/* AI CARD */
.ai-card {
  border: 2px solid #8b5cf6;
  background: #faf5ff;
  padding: 14px 14px 12px;
}
.ai-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.ai-badge {
  font-size: 0.68rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #7c3aed;
}
.ai-close { background: none; border: none; cursor: pointer; color: #9ca3af; font-size: 0.9rem; }
.ai-close:hover { color: #000; }
.ai-type-chip {
  display: inline-block;
  font-size: 0.62rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #fff;
  padding: 2px 8px;
  margin-bottom: 6px;
}
.ai-title { font-size: 1rem; font-weight: 900; color: #000; margin-bottom: 4px; }
.ai-meta { font-size: 0.75rem; font-weight: 700; color: #767676; margin-bottom: 8px; }
.ai-desc { font-size: 0.78rem; color: rgba(15,18,16,0.70); line-height: 1.55; margin-bottom: 8px; }
.ai-reasoning {
  font-size: 0.72rem;
  color: #7c3aed;
  background: #ede9fe;
  padding: 6px 10px;
  line-height: 1.45;
  margin-bottom: 10px;
}
.ai-actions { display: flex; gap: 8px; }
.ai-btn-accept {
  flex: 1;
  background: #000;
  color: #fff;
  border: none;
  font-size: 0.75rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 9px;
  cursor: pointer;
}
.ai-btn-accept:disabled { opacity: 0.5; cursor: not-allowed; }
.ai-btn-regen {
  background: #fff;
  border: 1px solid #8b5cf6;
  color: #7c3aed;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 9px 14px;
  cursor: pointer;
}
.ai-btn-regen:hover { background: #ede9fe; }

/* CREATE FORM */
.create-form { border: 1px solid #E5E5E5; padding: 16px; }
.create-form-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.create-form-title { font-size: 0.90rem; font-weight: 900; color: #000; }
.create-form-close { background: none; border: none; cursor: pointer; color: #767676; }
.create-form-close:hover { color: #000; }
.form-group { margin-bottom: 12px; }
.form-label { font-size: 0.72rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.06em; color: rgba(15,18,16,0.55); display: block; margin-bottom: 5px; }
.optional { font-weight: 600; text-transform: none; color: rgba(15,18,16,0.35); }
.form-control { width: 100%; border: 1px solid #E5E5E5; padding: 8px 10px; font-size: 0.85rem; background: #fff; border-radius: 0; box-sizing: border-box; }
.form-control:focus { outline: none; border-color: #000; }
textarea.form-control { resize: vertical; min-height: 60px; }
.form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.type-pills { display: flex; flex-wrap: wrap; gap: 4px; }
.type-pill {
  font-size: 0.65rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 4px 9px;
  border: 1px solid #E5E5E5;
  background: #fff;
  color: rgba(15,18,16,0.60);
  cursor: pointer;
  transition: all 0.1s;
}
.type-pill:hover { border-color: #999; color: #000; }
.form-error { font-size: 0.75rem; color: #ef4444; margin-bottom: 10px; }
.form-actions { display: flex; gap: 8px; margin-top: 4px; }
.btn-cancel {
  flex: 1;
  background: #fff;
  border: 1px solid #E5E5E5;
  padding: 9px;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
}
.btn-cancel:hover { border-color: #000; }
.btn-save {
  flex: 2;
  background: #0052FF;
  color: #fff;
  border: none;
  padding: 9px;
  font-size: 0.75rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-save:hover:not(:disabled) { background: #003ECC; }
.btn-save:disabled { opacity: 0.5; cursor: not-allowed; }

/* WEEK PLAN MODAL */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.55);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.modal-card {
  background: #fff;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.modal-week { max-width: 900px; }
.modal-header {
  padding: 20px 24px 16px;
  border-bottom: 1px solid #E5E5E5;
  display: flex;
  align-items: baseline;
  gap: 12px;
  flex-shrink: 0;
}
.modal-header h3 { font-size: 1.1rem; font-weight: 900; margin: 0; }
.modal-header-sub { font-size: 0.78rem; color: #767676; font-weight: 600; flex: 1; }
.modal-close { background: none; border: none; cursor: pointer; color: #767676; font-size: 1.1rem; margin-left: auto; }
.modal-close:hover { color: #000; }
.modal-body { flex: 1; overflow-y: auto; padding: 20px 24px; }
.modal-footer {
  padding: 14px 24px;
  border-top: 1px solid #E5E5E5;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.modal-footer-count { font-size: 0.78rem; font-weight: 700; color: #767676; flex: 1; }
.week-plan-loading { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 60px 20px; color: #767676; }
.week-plan-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; }
.week-plan-card {
  border: 2px solid #E5E5E5;
  padding: 14px 12px;
  cursor: pointer;
  position: relative;
  transition: border-color 0.12s;
  opacity: 0.6;
}
.week-plan-card:hover { border-color: #999; opacity: 0.85; }
.week-plan-selected { border-color: #000 !important; opacity: 1 !important; }
.wpc-dow { font-size: 0.65rem; font-weight: 900; letter-spacing: 0.10em; color: rgba(15,18,16,0.45); text-transform: uppercase; }
.wpc-date { font-size: 1.4rem; font-weight: 900; color: #000; line-height: 1; margin-bottom: 8px; }
.wpc-type-chip { display: inline-block; font-size: 0.60rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.06em; color: #fff; padding: 2px 7px; margin-bottom: 6px; }
.wpc-title { font-size: 0.82rem; font-weight: 900; color: #000; margin-bottom: 4px; }
.wpc-dist { font-size: 0.75rem; font-weight: 700; color: #767676; margin-bottom: 8px; }
.wpc-reasoning { font-size: 0.68rem; color: rgba(15,18,16,0.50); line-height: 1.45; }
.wpc-check {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 1rem;
  color: #000;
}
.week-plan-selected .wpc-check { color: #22c55e; }

/* RESPONSIVE */
@media (max-width: 900px) {
  .cal-body.drawer-open { grid-template-columns: 1fr; }
  .cal-drawer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    top: auto;
    max-height: 65vh;
    z-index: 200;
    border: none;
    border-top: 2px solid #000;
  }
  .cal-cell { min-height: 72px; }
  .cal-chip-type { font-size: 0.52rem; }
}
@media (max-width: 600px) {
  .cal-month-title { font-size: 1.2rem; min-width: 0; }
  .cal-cell { min-height: 56px; padding: 4px 3px; }
  .cal-date-num { font-size: 0.68rem; width: 18px; height: 18px; }
  .cal-dow { font-size: 0.60rem; }
  .week-plan-grid { grid-template-columns: repeat(2, 1fr); }
  .cal-legend { display: none; }
}

/* ── Weather ─────────────────────────────────────────────── */
.cal-date-num {
  display: flex;
  align-items: center;
  gap: 3px;
}
.cal-weather-icon {
  font-size: 0.7rem;
  line-height: 1;
  flex-shrink: 0;
}

.weather-warn {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding: 10px 12px;
  background: #FFF8E1;
  border-left: 3px solid #F59E0B;
  font-size: 0.8rem;
  color: #78350F;
}
.weather-warn--severe {
  background: #FEF2F2;
  border-left-color: #EF4444;
  color: #7F1D1D;
}
.weather-warn-icon { font-size: 1rem; flex-shrink: 0; }
.weather-warn-label { font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }

/* ── Group event cell icon ───────────────────────────────── */
.cal-group-icon {
  font-size: 0.65rem;
  color: #4f46e5;
  position: absolute;
  top: 4px;
  left: 4px;
  pointer-events: none;
}

/* ── Drawer Group Event ───────────────────────────────────── */
.drawer-group-event {
  border: 1px solid #E5E5E5;
  padding: 12px;
  margin-bottom: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.dge-head { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.dge-sport { font-size: 1.1rem; }
.dge-title { font-size: 14px; font-weight: 700; flex: 1; }
.dge-rsvp-badge {
  font-size: 10px; font-weight: 700; letter-spacing: 0.08em;
  padding: 2px 6px; border-radius: 0;
}
.rsvp-accepted { background: #dcfce7; color: #166534; }
.rsvp-pending  { background: #fef9c3; color: #713f12; }
.rsvp-declined { background: #fee2e2; color: #991b1b; }
.rsvp-maybe    { background: #e0e7ff; color: #3730a3; }

.dge-meta { display: flex; flex-wrap: wrap; gap: 10px; font-size: 12px; color: #767676; align-items: center; }
.dge-time { font-weight: 700; color: #000; }

.dge-rsvp-row { display: flex; gap: 6px; }
.dge-rsvp-btn {
  flex: 1; padding: 6px 0; font-size: 12px; font-weight: 700;
  letter-spacing: 0.06em; text-transform: uppercase;
  border: 1px solid #E5E5E5; background: #fff; cursor: pointer;
  font-family: inherit;
}
.dge-rsvp-yes.active   { background: #000; color: #fff; border-color: #000; }
.dge-rsvp-maybe.active { background: #4f46e5; color: #fff; border-color: #4f46e5; }
.dge-rsvp-no.active    { background: #dc2626; color: #fff; border-color: #dc2626; }
.dge-rsvp-btn:hover:not(.active) { border-color: #999; }

.dge-export-row { display: flex; gap: 12px; flex-wrap: wrap; }
.dge-export-link {
  font-size: 12px; color: #767676; text-decoration: none;
  display: flex; align-items: center; gap: 4px;
  background: none; border: none; cursor: pointer; padding: 0; font-family: inherit;
}
.dge-export-link:hover { color: #000; text-decoration: underline; }

/* ── Drawer footer Group Event button ────────────────────── */
.footer-btn-group {
  background: #f0f0ff;
  color: #4f46e5;
  border: 1px solid #4f46e5;
}
.footer-btn-group:hover { background: #4f46e5; color: #fff; }
</style>
