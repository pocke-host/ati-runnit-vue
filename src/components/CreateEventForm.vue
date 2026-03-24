<template>
  <form @submit.prevent="save" class="cef">

    <!-- Name -->
    <div class="cef-field">
      <label class="cef-label">EVENT NAME</label>
      <input v-model="form.name" class="cef-input" placeholder="e.g. Lake Placid Tri 2026" required />
    </div>

    <!-- Type + Date -->
    <div class="cef-row">
      <div class="cef-field">
        <label class="cef-label">TYPE</label>
        <select v-model="form.eventType" class="cef-input">
          <option value="TRIATHLON">Triathlon</option>
          <option value="DUATHLON">Duathlon</option>
          <option value="AQUABIKE">Aquabike</option>
          <option value="BRICK">Brick Workout</option>
          <option value="STAGE_RACE">Stage Race</option>
          <option value="TRIP">Trip / Adventure</option>
          <option value="MULTISPORT">Multisport</option>
          <option value="OTHER">Other</option>
        </select>
      </div>
      <div class="cef-field">
        <label class="cef-label">DATE</label>
        <input v-model="form.eventDate" type="date" class="cef-input" />
      </div>
    </div>

    <!-- Segments builder -->
    <div class="cef-field">
      <label class="cef-label">SEGMENTS <span class="cef-hint">— drag to reorder</span></label>

      <!-- Existing segments -->
      <div class="seg-list" ref="segListEl">
        <div
          v-for="(seg, idx) in form.segments"
          :key="seg._key"
          class="seg-row"
          draggable="true"
          @dragstart="onDragStart(idx)"
          @dragover.prevent="onDragOver(idx)"
          @dragend="onDragEnd"
        >
          <i class="bi bi-grip-vertical seg-drag-handle"></i>

          <select v-model="seg.label" class="seg-label-select">
            <option value="SWIM">Swim</option>
            <option value="T1">T1 (Transition)</option>
            <option value="BIKE">Bike</option>
            <option value="T2">T2 (Transition)</option>
            <option value="RUN">Run</option>
            <option value="HIKE">Hike</option>
            <option value="PADDLE">Paddle</option>
            <option value="SKI">Ski</option>
            <option value="OTHER">Other</option>
          </select>

          <select v-model="seg.activityId" class="seg-activity-select" required>
            <option value="" disabled>Pick activity…</option>
            <option v-for="a in availableActivities" :key="a.id" :value="a.id">
              {{ a.label }}
            </option>
          </select>

          <button type="button" class="seg-remove" @click="removeSegment(idx)">
            <i class="bi bi-x"></i>
          </button>
        </div>
      </div>

      <button type="button" class="add-seg-btn" @click="addSegment">
        <i class="bi bi-plus"></i> Add segment
      </button>
    </div>

    <!-- Notes -->
    <div class="cef-field">
      <label class="cef-label">NOTES (OPTIONAL)</label>
      <textarea v-model="form.notes" class="cef-input cef-textarea" rows="3" placeholder="Race recap, conditions, etc."></textarea>
    </div>

    <div v-if="error" class="cef-error">{{ error }}</div>

    <!-- Actions -->
    <div class="cef-actions">
      <button type="button" class="btn-ghost" @click="$emit('cancel')">Cancel</button>
      <button type="submit" class="btn-primary" :disabled="saving">
        <span v-if="saving" class="spinner-border spinner-border-sm"></span>
        <span v-else>{{ initial ? 'Save Changes' : 'Create Event' }}</span>
      </button>
    </div>

  </form>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useActivityStore } from '@/stores/activity'
import { storeToRefs } from 'pinia'
import { useUnits } from '@/composables/useUnits'

const props = defineProps({ initial: { type: Object, default: null } })
const emit  = defineEmits(['saved', 'cancel'])

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
const { formatDistance, formatDuration } = useUnits()
const activityStore = useActivityStore()
const { activities } = storeToRefs(activityStore)

const saving = ref(false)
const error  = ref(null)
let _keyCounter = 0

const form = ref({
  name:      props.initial?.name      || '',
  eventType: props.initial?.eventType || 'TRIATHLON',
  eventDate: props.initial?.eventDate || '',
  notes:     props.initial?.notes     || '',
  segments:  (props.initial?.segments || []).map(s => ({
    _key: ++_keyCounter,
    label:      s.label || 'OTHER',
    activityId: s.activityId || '',
  })),
})

// Build option labels for the activity picker
const availableActivities = computed(() =>
  (activities.value || []).map(a => ({
    id:    a.id,
    label: [
      a.activityType || a.sportType,
      a.distanceMeters ? formatDistance(a.distanceMeters) : null,
      a.durationSeconds ? formatDuration(a.durationSeconds) : null,
      a.createdAt ? new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : null,
    ].filter(Boolean).join(' · '),
  }))
)

function addSegment() {
  form.value.segments.push({ _key: ++_keyCounter, label: 'RUN', activityId: '' })
}

function removeSegment(idx) {
  form.value.segments.splice(idx, 1)
}

// Drag-to-reorder
let dragFrom = null
function onDragStart(idx) { dragFrom = idx }
function onDragOver(idx)  {
  if (dragFrom === null || dragFrom === idx) return
  const arr = form.value.segments
  const [item] = arr.splice(dragFrom, 1)
  arr.splice(idx, 0, item)
  dragFrom = idx
}
function onDragEnd() { dragFrom = null }

async function save() {
  error.value = null
  if (!form.value.name.trim()) { error.value = 'Event name is required.'; return }
  if (!form.value.segments.length) { error.value = 'Add at least one segment.'; return }
  if (form.value.segments.some(s => !s.activityId)) { error.value = 'Select an activity for every segment.'; return }

  saving.value = true
  try {
    const token = localStorage.getItem('token')
    const payload = {
      name:      form.value.name,
      eventType: form.value.eventType,
      eventDate: form.value.eventDate || null,
      notes:     form.value.notes || null,
      segments:  form.value.segments.map((s, i) => ({
        activityId: s.activityId,
        label:      s.label,
        order:      i,
      })),
    }

    const url    = props.initial ? `${API_URL}/multisport-events/${props.initial.id}` : `${API_URL}/multisport-events`
    const method = props.initial ? 'patch' : 'post'
    const { data } = await axios[method](url, payload, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
    emit('saved', data)
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to save event.'
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  if (!activities.value?.length) await activityStore.fetchActivities()
})
</script>

<style scoped>
.cef { display: flex; flex-direction: column; gap: 20px; }
.cef-field { display: flex; flex-direction: column; gap: 6px; }
.cef-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.cef-label { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #767676; }
.cef-hint { font-weight: 400; letter-spacing: 0; text-transform: none; font-size: 0.68rem; }
.cef-input {
  padding: 10px 12px;
  border: 1px solid #E5E5E5;
  font-size: 0.9rem;
  font-family: inherit;
  background: #fff;
  width: 100%;
}
.cef-input:focus { outline: 2px solid #000; border-color: #000; }
.cef-textarea { resize: vertical; }

/* Segment rows */
.seg-list { display: flex; flex-direction: column; gap: 6px; margin-bottom: 8px; }
.seg-row { display: flex; align-items: center; gap: 8px; }
.seg-drag-handle { color: #A0A0A0; cursor: grab; font-size: 1rem; }
.seg-label-select { width: 130px; flex-shrink: 0; padding: 8px 10px; border: 1px solid #E5E5E5; font-size: 0.82rem; font-family: inherit; }
.seg-activity-select { flex: 1; padding: 8px 10px; border: 1px solid #E5E5E5; font-size: 0.82rem; font-family: inherit; }
.seg-remove { border: none; background: none; color: #A0A0A0; cursor: pointer; font-size: 1rem; padding: 4px; line-height: 1; }
.seg-remove:hover { color: #ef4444; }

.add-seg-btn {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 8px 14px; border: 1px dashed #E5E5E5; background: none;
  font-size: 0.78rem; font-weight: 600; letter-spacing: 0.06em;
  text-transform: uppercase; cursor: pointer; font-family: inherit; color: #767676;
}
.add-seg-btn:hover { border-color: #000; color: #000; }

.cef-error { font-size: 0.82rem; color: #ef4444; }

.cef-actions { display: flex; gap: 10px; justify-content: flex-end; padding-top: 8px; border-top: 1px solid #E5E5E5; }
.btn-ghost { padding: 10px 20px; font-size: 0.78rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; border: 1px solid #E5E5E5; background: #fff; cursor: pointer; }
.btn-primary { padding: 10px 24px; font-size: 0.78rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; border: none; background: #0052FF; color: #fff; cursor: pointer; display: flex; align-items: center; gap: 6px; }
.btn-primary:hover { background: #003ECC; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
