<template>
  <div class="event-detail-page" v-if="event">

    <!-- HERO -->
    <section class="event-hero">
      <div class="event-hero-inner">
        <div class="event-kicker">{{ eventTypeLabel }} · {{ event.eventDate || 'No date set' }}</div>
        <h1 class="event-name">{{ event.name }}</h1>
        <div class="event-totals">
          <div class="total-chip">
            <span class="total-val">{{ formatDistance(event.totalDistanceMeters) }}</span>
            <span class="total-label">Total Distance</span>
          </div>
          <div class="total-chip">
            <span class="total-val">{{ formatDuration(event.totalDurationSeconds) }}</span>
            <span class="total-label">Total Time</span>
          </div>
          <div class="total-chip">
            <span class="total-val">{{ event.segments?.length ?? 0 }}</span>
            <span class="total-label">Segments</span>
          </div>
        </div>
        <div class="event-actions" v-if="isOwner">
          <button class="btn-ghost-sm" @click="showEdit = true">Edit</button>
          <button class="btn-danger-sm" @click="confirmDelete = true">Delete</button>
        </div>
      </div>
    </section>

    <div class="event-body">

      <!-- TIMELINE -->
      <section class="timeline">
        <div
          v-for="(seg, idx) in event.segments"
          :key="seg.id"
          class="timeline-item"
        >
          <!-- Connector line -->
          <div class="timeline-track">
            <div class="timeline-dot" :style="{ background: segColor(seg.label || seg.sportType) }"></div>
            <div v-if="idx < event.segments.length - 1" class="timeline-line"></div>
          </div>

          <!-- Card -->
          <div class="seg-card" @click="$router.push(`/activities/${seg.activityId}`)">
            <div class="seg-header">
              <div class="seg-badge" :style="{ background: segColor(seg.label || seg.sportType), color: '#fff' }">
                {{ seg.label || seg.sportType }}
              </div>
              <div class="seg-order">Segment {{ idx + 1 }}</div>
            </div>
            <div class="seg-stats">
              <div class="seg-stat" v-if="seg.distanceMeters">
                <span class="seg-stat-val">{{ formatDistance(seg.distanceMeters) }}</span>
                <span class="seg-stat-lbl">Distance</span>
              </div>
              <div class="seg-stat" v-if="seg.durationSeconds">
                <span class="seg-stat-val">{{ formatDuration(seg.durationSeconds) }}</span>
                <span class="seg-stat-lbl">Time</span>
              </div>
              <div class="seg-stat" v-if="seg.averagePace">
                <span class="seg-stat-val">{{ formatPace(seg.averagePace) }}</span>
                <span class="seg-stat-lbl">Avg Pace</span>
              </div>
              <div class="seg-stat" v-if="seg.averageHeartRate">
                <span class="seg-stat-val">{{ seg.averageHeartRate }}</span>
                <span class="seg-stat-lbl">Avg HR</span>
              </div>
            </div>
            <div class="seg-view-link">View activity →</div>
          </div>
        </div>
      </section>

      <!-- NOTES -->
      <section class="event-notes" v-if="event.notes">
        <div class="notes-label">Notes</div>
        <p class="notes-text">{{ event.notes }}</p>
      </section>

    </div>

    <!-- EDIT MODAL -->
    <div class="modal-backdrop" v-if="showEdit" @click.self="showEdit = false">
      <div class="modal-box">
        <h2 class="modal-title">Edit Event</h2>
        <CreateEventForm :initial="event" @saved="onSaved" @cancel="showEdit = false" />
      </div>
    </div>

    <!-- DELETE CONFIRM -->
    <div class="modal-backdrop" v-if="confirmDelete" @click.self="confirmDelete = false">
      <div class="modal-box modal-box-sm">
        <h2 class="modal-title">Delete event?</h2>
        <p style="color:#767676;font-size:.9rem">This won't delete the individual activities.</p>
        <div class="modal-actions">
          <button class="btn-ghost-sm" @click="confirmDelete = false" :disabled="deleting">Cancel</button>
          <button class="btn-danger-sm" @click="deleteEvent" :disabled="deleting">
            <span v-if="deleting" class="spinner-border spinner-border-sm me-1"></span>
            {{ deleting ? 'Deleting…' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>

  <div v-if="deleteError" class="delete-error-banner">
    <i class="bi bi-exclamation-circle-fill me-2"></i>{{ deleteError }}
  </div>

  </div>

  <div v-else-if="loading" class="loading-center">
    <div class="spinner-border" style="width:1.5rem;height:1.5rem;border-color:#E5E5E5;border-top-color:#000"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { useUnits } from '@/composables/useUnits'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import CreateEventForm from '@/components/CreateEventForm.vue'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
const route  = useRoute()
const router = useRouter()
const { formatDistance, formatDuration, formatPace } = useUnits()
const { user } = storeToRefs(useAuthStore())

const event        = ref(null)
const loading      = ref(true)
const showEdit     = ref(false)
const confirmDelete = ref(false)
const deleteError  = ref('')
const deleting     = ref(false)

const isOwner = computed(() => event.value?.userId === user.value?.id)

const eventTypeLabel = computed(() => {
  const types = {
    TRIATHLON:   'Triathlon',
    DUATHLON:    'Duathlon',
    AQUABIKE:    'Aquabike',
    BRICK:       'Brick Workout',
    STAGE_RACE:  'Stage Race',
    TRIP:        'Trip',
    MULTISPORT:  'Multisport',
    OTHER:       'Event',
  }
  return types[event.value?.eventType] || 'Event'
})

function segColor(label) {
  const l = (label || '').toUpperCase()
  if (l.includes('SWIM') || l === 'SWIM') return '#0052FF'
  if (l === 'T1' || l === 'T2')           return '#767676'
  if (l.includes('BIKE') || l === 'BIKE' || l === 'RIDE') return '#000000'
  if (l.includes('RUN')  || l === 'RUN')  return '#0052FF'
  if (l.includes('HIKE') || l === 'HIKE') return '#767676'
  return '#767676'
}

async function loadEvent() {
  loading.value = true
  try {
    const token = localStorage.getItem('token')
    const { data } = await axios.get(`${API_URL}/multisport-events/${route.params.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    event.value = data
  } catch { router.push('/activities') }
  finally { loading.value = false }
}

async function deleteEvent() {
  deleting.value = true
  deleteError.value = ''
  try {
    const token = localStorage.getItem('token')
    await axios.delete(`${API_URL}/multisport-events/${route.params.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    router.push('/feed')
  } catch {
    deleteError.value = 'Failed to delete event. Please try again.'
    deleting.value = false
    confirmDelete.value = false
  }
}

function onSaved(updated) {
  event.value = updated
  showEdit.value = false
}

onMounted(loadEvent)
</script>

<style scoped>
.event-detail-page { background: #fff; min-height: 100vh; }

.event-hero {
  background: #000;
  color: #fff;
  padding: 48px 24px 40px;
}
.event-hero-inner { max-width: 760px; margin: 0 auto; }
.event-kicker {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.5);
  margin-bottom: 10px;
}
.event-name {
  font-size: clamp(1.8rem, 5vw, 3rem);
  font-weight: 900;
  line-height: 1.05;
  margin: 0 0 24px;
}
.event-totals { display: flex; gap: 32px; flex-wrap: wrap; margin-bottom: 24px; }
.total-chip { display: flex; flex-direction: column; gap: 2px; }
.total-val { font-size: 1.6rem; font-weight: 900; }
.total-label { font-size: 0.7rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.5); }
.event-actions { display: flex; gap: 8px; }

.event-body { max-width: 760px; margin: 0 auto; padding: 40px 24px; }

/* Timeline */
.timeline { display: flex; flex-direction: column; gap: 0; }
.timeline-item { display: flex; gap: 20px; }
.timeline-track { display: flex; flex-direction: column; align-items: center; flex-shrink: 0; }
.timeline-dot { width: 16px; height: 16px; border-radius: 50%; flex-shrink: 0; margin-top: 4px; }
.timeline-line { width: 2px; flex: 1; background: #E5E5E5; margin: 6px 0; min-height: 24px; }

.seg-card {
  flex: 1;
  border: 1px solid #E5E5E5;
  padding: 16px 20px;
  margin-bottom: 16px;
  cursor: pointer;
  transition: border-color 0.15s;
}
.seg-card:hover { border-color: #000; }
.seg-header { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.seg-badge {
  padding: 3px 10px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.seg-order { font-size: 0.75rem; color: #767676; }
.seg-stats { display: flex; gap: 24px; flex-wrap: wrap; }
.seg-stat { display: flex; flex-direction: column; gap: 2px; }
.seg-stat-val { font-size: 1.1rem; font-weight: 700; }
.seg-stat-lbl { font-size: 0.7rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #767676; }
.seg-view-link { font-size: 0.75rem; color: #767676; margin-top: 10px; }

/* Notes */
.event-notes { margin-top: 32px; border-top: 1px solid #E5E5E5; padding-top: 24px; }
.notes-label { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #767676; margin-bottom: 8px; }
.notes-text { font-size: 0.9rem; color: #333; line-height: 1.6; white-space: pre-wrap; }

/* Modal */
.delete-error-banner {
  background: rgba(239,68,68,0.08);
  border: 1px solid rgba(239,68,68,0.20);
  color: #dc2626;
  font-size: 0.88rem;
  font-weight: 600;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  max-width: 760px;
  margin: 0 auto 16px;
}

.modal-backdrop {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 16px;
}
.modal-box { background: #fff; width: 100%; max-width: 600px; padding: 32px; max-height: 90vh; overflow-y: auto; }
.modal-box-sm { max-width: 400px; }
.modal-title { font-size: 1.2rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.06em; margin: 0 0 20px; }
.modal-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 20px; }

.btn-ghost-sm { padding: 8px 16px; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; border: 1px solid #E5E5E5; background: #fff; cursor: pointer; }
.btn-ghost-sm:hover { border-color: #000; }
.btn-danger-sm { padding: 8px 16px; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; border: none; background: #ef4444; color: #fff; cursor: pointer; }

.loading-center { display: flex; justify-content: center; align-items: center; min-height: 40vh; }
</style>
