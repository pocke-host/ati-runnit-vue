<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-panel">
      <div class="modal-header">
        <span class="modal-title">NEW GROUP EVENT</span>
        <button class="btn-close-modal" @click="$emit('close')">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <div class="modal-body">
        <!-- Title -->
        <div class="field-group">
          <label class="field-label">TITLE</label>
          <input v-model="form.title" type="text" class="field-input" placeholder="Morning 10K" />
        </div>

        <!-- Sport Type -->
        <div class="field-group">
          <label class="field-label">SPORT</label>
          <div class="sport-pills">
            <button
              v-for="s in sports"
              :key="s.value"
              class="sport-pill"
              :class="{ active: form.sportType === s.value }"
              @click="form.sportType = s.value"
            >{{ s.emoji }} {{ s.label }}</button>
          </div>
        </div>

        <!-- Date/Time -->
        <div class="field-group">
          <label class="field-label">DATE &amp; TIME</label>
          <input v-model="form.eventDatetime" type="datetime-local" class="field-input" />
        </div>

        <!-- Location -->
        <div class="field-group">
          <label class="field-label">LOCATION</label>
          <input v-model="form.locationName" type="text" class="field-input" placeholder="Central Park, NYC" />
        </div>

        <!-- Description -->
        <div class="field-group">
          <label class="field-label">DESCRIPTION</label>
          <textarea v-model="form.description" class="field-input" rows="2" placeholder="Optional details…"></textarea>
        </div>

        <!-- Invite friends -->
        <div class="field-group">
          <label class="field-label">INVITE FRIENDS</label>
          <div v-if="loadingFollowing" class="loading-text">Loading…</div>
          <div v-else-if="following.length === 0" class="muted-text">Follow people to invite them.</div>
          <div v-else class="friend-list">
            <label
              v-for="f in following"
              :key="f.id"
              class="friend-row"
              :class="{ selected: selectedIds.includes(f.id) }"
            >
              <input type="checkbox" :value="f.id" v-model="selectedIds" class="friend-check" />
              <div class="friend-avatar" :style="f.profilePhotoUrl ? `background-image:url(${f.profilePhotoUrl})` : ''">
                <span v-if="!f.profilePhotoUrl">{{ initials(f) }}</span>
              </div>
              <span class="friend-name">{{ f.firstName }} {{ f.lastName }}</span>
            </label>
          </div>
        </div>

        <div v-if="error" class="error-msg">{{ error }}</div>
      </div>

      <div class="modal-footer">
        <button class="btn-cancel" @click="$emit('close')">Cancel</button>
        <button class="btn-create" :disabled="saving" @click="submit">
          {{ saving ? 'Creating…' : 'Create Event' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useGroupEventStore } from '@/stores/groupEvent'

const emit = defineEmits(['close', 'created'])

const store = useGroupEventStore()

const sports = [
  { value: 'RUN', label: 'Run', emoji: '🏃' },
  { value: 'RIDE', label: 'Ride', emoji: '🚴' },
  { value: 'SWIM', label: 'Swim', emoji: '🏊' },
  { value: 'HIKE', label: 'Hike', emoji: '🥾' },
  { value: 'WALK', label: 'Walk', emoji: '🚶' },
  { value: 'TRIATHLON', label: 'Tri', emoji: '🏅' },
]

const form = ref({
  title: '',
  sportType: 'RUN',
  eventDatetime: '',
  locationName: '',
  description: '',
})
const selectedIds = ref([])
const following = ref([])
const loadingFollowing = ref(false)
const saving = ref(false)
const error = ref('')

onMounted(async () => {
  loadingFollowing.value = true
  try {
    const { data } = await axios.get('/api/follow/following')
    following.value = data
  } catch {
    // following list non-critical for invite flow
  } finally {
    loadingFollowing.value = false
  }
})

function initials(u) {
  return ((u.firstName?.[0] || '') + (u.lastName?.[0] || '')).toUpperCase()
}

async function submit() {
  error.value = ''
  if (!form.value.title.trim()) { error.value = 'Title is required.'; return }
  if (!form.value.eventDatetime) { error.value = 'Date & time is required.'; return }
  saving.value = true
  try {
    const payload = {
      ...form.value,
      inviteeIds: selectedIds.value,
    }
    const created = await store.createEvent(payload)
    emit('created', created)
    emit('close')
  } catch (e) {
    error.value = e?.response?.data?.error || 'Failed to create event.'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed; inset: 0; background: rgba(0,0,0,0.55);
  display: flex; align-items: center; justify-content: center; z-index: 1100;
}
.modal-panel {
  background: #fff; width: 100%; max-width: 480px;
  max-height: 90vh; display: flex; flex-direction: column; border-radius: 0;
}
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px; border-bottom: 1px solid #E5E5E5;
}
.modal-title { font-size: 13px; font-weight: 700; letter-spacing: 0.15em; }
.btn-close-modal { background: none; border: none; cursor: pointer; padding: 0; font-size: 16px; }
.modal-body { flex: 1; overflow-y: auto; padding: 20px 24px; display: flex; flex-direction: column; gap: 18px; }
.modal-footer {
  padding: 16px 24px; border-top: 1px solid #E5E5E5;
  display: flex; gap: 10px; justify-content: flex-end;
}

.field-group { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 11px; font-weight: 700; letter-spacing: 0.12em; color: #767676; }
.field-input {
  border: 1px solid #E5E5E5; border-radius: 0; padding: 9px 12px;
  font-size: 14px; outline: none; width: 100%; background: #fff;
  font-family: inherit;
}
.field-input:focus { border-color: #000; }
textarea.field-input { resize: vertical; }

.sport-pills { display: flex; flex-wrap: wrap; gap: 8px; }
.sport-pill {
  background: #fff; border: 1px solid #E5E5E5; border-radius: 0;
  padding: 6px 12px; font-size: 12px; cursor: pointer; font-family: inherit;
  letter-spacing: 0.05em;
}
.sport-pill.active { background: #000; color: #fff; border-color: #000; }

.friend-list { display: flex; flex-direction: column; gap: 6px; max-height: 200px; overflow-y: auto; }
.friend-row {
  display: flex; align-items: center; gap: 10px; cursor: pointer;
  padding: 8px; border: 1px solid #E5E5E5;
}
.friend-row.selected { border-color: #000; background: #f9f9f9; }
.friend-check { accent-color: #000; }
.friend-avatar {
  width: 32px; height: 32px; border-radius: 50%; background: #000;
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 11px; font-weight: 700;
  background-size: cover; background-position: center; flex-shrink: 0;
}
.friend-name { font-size: 13px; }

.loading-text, .muted-text { font-size: 13px; color: #767676; }
.error-msg { font-size: 13px; color: #c0392b; }

.btn-cancel {
  background: none; border: 1px solid #E5E5E5; border-radius: 0;
  padding: 9px 18px; font-size: 13px; cursor: pointer; font-family: inherit;
  letter-spacing: 0.08em;
}
.btn-create {
  background: #0052FF; color: #fff; border: none; border-radius: 0;
  padding: 9px 22px; font-size: 13px; cursor: pointer; font-family: inherit;
  letter-spacing: 0.08em; text-transform: uppercase; transition: background 0.15s;
}
.btn-create:hover:not(:disabled) { background: #003ECC; }
.btn-create:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
