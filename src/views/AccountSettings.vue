<!-- src/views/AccountSettings.vue -->
<template>
  <div class="settings-page">
    <!-- Back bar -->
    <header class="settings-header">
      <button class="back-btn" @click="router.push('/dashboard')">
        <i class="bi bi-arrow-left me-2"></i>Dashboard
      </button>
      <div class="settings-logo">RUNNIT</div>
    </header>

    <div class="settings-body">
      <!-- ── PROFILE ─────────────────────────────── -->
      <section class="settings-section">
        <div class="section-label">Profile</div>

        <div class="settings-card">
          <!-- Avatar -->
          <div class="profile-avatar-row">
            <div class="profile-avatar">{{ userInitial }}</div>
            <div class="profile-avatar-info">
              <div class="profile-name">{{ user?.displayName || 'Athlete' }}</div>
              <div class="profile-email">{{ user?.email }}</div>
            </div>
          </div>

          <div class="divider"></div>

          <!-- Display Name -->
          <div class="field-row">
            <label class="field-label">Display Name</label>
            <div class="field-input-wrap">
              <input
                v-model="displayName"
                type="text"
                class="field-input"
                placeholder="Your name"
                :disabled="savingProfile"
              />
              <button
                class="btn btn-primary btn-sm"
                @click="saveProfile"
                :disabled="savingProfile || displayName === user?.displayName"
              >
                <span v-if="savingProfile" class="spinner-border spinner-border-sm me-1"></span>
                Save
              </button>
            </div>
          </div>

          <!-- Email (read-only) -->
          <div class="field-row">
            <label class="field-label">Email</label>
            <div class="field-readonly">{{ user?.email }}</div>
          </div>

          <div v-if="profileStatus" :class="['field-status', profileStatusType]">
            <i :class="profileStatusType === 'success' ? 'bi bi-check-circle-fill' : 'bi bi-exclamation-circle-fill'"></i>
            {{ profileStatus }}
          </div>
        </div>
      </section>

      <!-- ── UNITS ──────────────────────────────── -->
      <section class="settings-section">
        <div class="section-label">Units</div>
        <div class="section-sublabel">Choose how distances, elevation, and pace are displayed.</div>

        <div class="unit-cards">
          <button
            :class="['unit-card', { active: unitSystem === 'imperial' }]"
            @click="selectUnit('imperial')"
          >
            <div class="unit-flag">🇺🇸</div>
            <div class="unit-name">Imperial</div>
            <div class="unit-examples">
              <span class="unit-example">mi</span>
              <span class="unit-example">ft</span>
              <span class="unit-example">min/mi</span>
            </div>
            <div class="unit-check" v-if="unitSystem === 'imperial'">
              <i class="bi bi-check-lg"></i>
            </div>
          </button>

          <button
            :class="['unit-card', { active: unitSystem === 'metric' }]"
            @click="selectUnit('metric')"
          >
            <div class="unit-flag">📏</div>
            <div class="unit-name">Metric</div>
            <div class="unit-examples">
              <span class="unit-example">km</span>
              <span class="unit-example">m</span>
              <span class="unit-example">min/km</span>
            </div>
            <div class="unit-check" v-if="unitSystem === 'metric'">
              <i class="bi bi-check-lg"></i>
            </div>
          </button>
        </div>

        <!-- Live preview -->
        <div class="unit-preview">
          <div class="unit-preview-label">Preview</div>
          <div class="unit-preview-row">
            <div class="preview-item">
              <div class="preview-val">{{ previewDistance }}</div>
              <div class="preview-key">Distance</div>
            </div>
            <div class="preview-item">
              <div class="preview-val">{{ previewPace }}</div>
              <div class="preview-key">Pace</div>
            </div>
            <div class="preview-item">
              <div class="preview-val">{{ previewElevation }}</div>
              <div class="preview-key">Elevation</div>
            </div>
          </div>
        </div>
      </section>

      <!-- ── PRIVACY ────────────────────────────── -->
      <section class="settings-section">
        <div class="section-label">Privacy</div>
        <div class="settings-card">
          <div class="field-row">
            <div>
              <div class="field-label">Profile Visibility</div>
              <div class="field-hint">Control who can see your profile and activities.</div>
            </div>
            <button class="btn btn-sm" @click="router.push('/profile/edit')">
              <i class="bi bi-pencil me-1"></i>Edit in Profile
            </button>
          </div>
        </div>
      </section>

      <!-- ── SAFETY ─────────────────────────────── -->
      <section class="settings-section">
        <div class="section-label">Safety</div>
        <div class="section-sublabel">Emergency contacts are notified when you trigger SOS during a run.</div>

        <div class="settings-card">
          <!-- Contact list -->
          <div v-if="contacts.length === 0" class="contact-empty">No emergency contacts added.</div>
          <div v-else class="contact-list">
            <div v-for="c in contacts" :key="c.id" class="contact-row">
              <div class="contact-info">
                <span class="contact-name">{{ c.name }}</span>
                <span v-if="c.phone" class="contact-detail">{{ c.phone }}</span>
                <span v-if="c.email" class="contact-detail">{{ c.email }}</span>
              </div>
              <button class="btn-remove-contact" @click="removeContact(c.id)" title="Remove">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>

          <div class="divider"></div>

          <!-- Add form -->
          <form class="contact-form" @submit.prevent="addContact">
            <div class="field-row contact-form-row">
              <input
                v-model.trim="newContact.name"
                class="field-input"
                placeholder="Name *"
                required
                maxlength="100"
              />
              <input
                v-model.trim="newContact.phone"
                class="field-input"
                placeholder="Phone"
                maxlength="30"
              />
              <input
                v-model.trim="newContact.email"
                class="field-input"
                placeholder="Email"
                type="email"
                maxlength="150"
              />
              <button type="submit" class="btn btn-primary btn-sm" :disabled="addingContact || !newContact.name">
                <span v-if="addingContact" class="spinner-border spinner-border-sm me-1"></span>
                Add
              </button>
            </div>
          </form>

          <div v-if="contactStatus" :class="['field-status', contactStatusType]">
            <i :class="contactStatusType === 'success' ? 'bi bi-check-circle-fill' : 'bi bi-exclamation-circle-fill'"></i>
            {{ contactStatus }}
          </div>
        </div>
      </section>

      <!-- ── DANGER ZONE ────────────────────────── -->
      <section class="settings-section">
        <div class="section-label danger-label">Account</div>
        <div class="settings-card">
          <div class="field-row">
            <div>
              <div class="field-label">Sign Out</div>
              <div class="field-hint">You'll need to log back in to access your account.</div>
            </div>
            <button class="btn btn-outline-danger btn-sm" @click="handleLogout">
              <i class="bi bi-box-arrow-right me-1"></i>Sign Out
            </button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { useUnits } from '@/composables/useUnits'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const router = useRouter()
const authStore = useAuthStore()
const { user, unitSystem } = storeToRefs(authStore)
const { formatDistance, formatPace, formatElevation } = useUnits()

const displayName = ref(user.value?.displayName || '')
const savingProfile = ref(false)
const profileStatus = ref('')
const profileStatusType = ref('success')
let profileStatusTimer = null

// Preview values (5 km run at 5:30 /km pace, 137m elevation)
const PREVIEW_METERS = 5000
const PREVIEW_PACE_MIN_KM = 5.5
const PREVIEW_ELEVATION_M = 137

const previewDistance = computed(() => formatDistance(PREVIEW_METERS))
const previewPace = computed(() => formatPace(PREVIEW_PACE_MIN_KM))
const previewElevation = computed(() => formatElevation(PREVIEW_ELEVATION_M))

const userInitial = computed(() => user.value?.displayName?.charAt(0).toUpperCase() || 'A')

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const selectUnit = (system) => {
  authStore.setUnitSystem(system)
}

const showProfileStatus = (msg, type = 'success') => {
  clearTimeout(profileStatusTimer)
  profileStatus.value = msg
  profileStatusType.value = type
  profileStatusTimer = setTimeout(() => { profileStatus.value = '' }, 3500)
}

const saveProfile = async () => {
  if (!displayName.value.trim()) return
  savingProfile.value = true
  try {
    const { data } = await axios.patch(
      `${API_URL}/users/me`,
      { displayName: displayName.value.trim() },
      { headers: getAuthHeaders() }
    )
    authStore.setAuth({ ...user.value, displayName: displayName.value.trim(), ...data })
    showProfileStatus('Profile updated!')
  } catch (err) {
    console.error('Failed to update profile:', err)
    showProfileStatus('Failed to update profile.', 'error')
  } finally {
    savingProfile.value = false
  }
}

const handleLogout = () => {
  authStore.logout()
  router.push('/')
}

/* ── Emergency Contacts ── */
const contacts = ref([])
const newContact = ref({ name: '', phone: '', email: '' })
const addingContact = ref(false)
const contactStatus = ref('')
const contactStatusType = ref('success')
let contactTimer = null

const showContactStatus = (msg, type = 'success') => {
  clearTimeout(contactTimer)
  contactStatus.value = msg
  contactStatusType.value = type
  contactTimer = setTimeout(() => { contactStatus.value = '' }, 3000)
}

const loadContacts = async () => {
  try {
    const { data } = await axios.get(`${API_URL}/emergency-contacts`, { headers: getAuthHeaders() })
    contacts.value = data
  } catch (err) {
    console.error('Failed to load emergency contacts:', err)
  }
}

const addContact = async () => {
  if (!newContact.value.name.trim()) return
  addingContact.value = true
  try {
    const { data } = await axios.post(`${API_URL}/emergency-contacts`, {
      name: newContact.value.name.trim(),
      phone: newContact.value.phone.trim() || null,
      email: newContact.value.email.trim() || null,
    }, { headers: getAuthHeaders() })
    contacts.value.push(data)
    newContact.value = { name: '', phone: '', email: '' }
    showContactStatus('Contact added.')
  } catch {
    showContactStatus('Failed to add contact.', 'error')
  } finally {
    addingContact.value = false
  }
}

const removeContact = async (id) => {
  try {
    await axios.delete(`${API_URL}/emergency-contacts/${id}`, { headers: getAuthHeaders() })
    contacts.value = contacts.value.filter(c => c.id !== id)
  } catch {
    showContactStatus('Failed to remove contact.', 'error')
  }
}

onMounted(() => {
  loadContacts()
})
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
  background: var(--rk-paper, #ffffff);
  font-family: Futura, "Futura PT", "Futura Std", "Avenir Next", Avenir, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
}

/* ── Header ── */
.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 64px;
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(15,18,16,0.10);
  position: sticky;
  top: 0;
  z-index: 100;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  font-weight: 700;
  font-size: 0.95rem;
  color: rgba(15,18,16,0.70);
  cursor: pointer;
  padding: 8px 0;
  transition: color 0.2s;
  font-family: inherit;
}
.back-btn:hover { color: rgba(15,18,16,0.95); }

.settings-logo {
  font-weight: 900;
  font-size: 1rem;
  letter-spacing: 0.08em;
  color: #000;
}

/* ── Body ── */
.settings-body {
  max-width: 640px;
  margin: 0 auto;
  padding: 32px 24px 80px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* ── Sections ── */
.settings-section { display: flex; flex-direction: column; gap: 12px; }

.section-label {
  font-size: 0.75rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: rgba(15,18,16,0.55);
}
.section-sublabel {
  font-size: 0.88rem;
  color: rgba(15,18,16,0.55);
  margin-top: -6px;
}
.danger-label { color: #dc2626; }

/* ── Card ── */
.settings-card {
  background: white;
  border: 1px solid #E5E5E5;
  border-radius: 0;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.divider { height: 1px; background: rgba(15,18,16,0.08); margin: 0 -4px; }

/* ── Profile ── */
.profile-avatar-row {
  display: flex;
  align-items: center;
  gap: 16px;
}
.profile-avatar {
  width: 64px; height: 64px;
  border-radius: 50%;
  background: #000;
  display: flex; align-items: center; justify-content: center;
  font-weight: 900;
  color: white;
  font-size: 1.6rem;
  flex-shrink: 0;
}
.profile-name {
  font-weight: 900;
  font-size: 1.1rem;
  color: rgba(15,18,16,0.92);
}
.profile-email {
  font-size: 0.88rem;
  color: rgba(15,18,16,0.55);
  margin-top: 2px;
}

/* ── Fields ── */
.field-row {
  display: flex;
  align-items: center;
  gap: 16px;
  justify-content: space-between;
}
.field-label {
  font-weight: 700;
  font-size: 0.9rem;
  color: rgba(15,18,16,0.80);
  white-space: nowrap;
  min-width: 120px;
}
.field-hint {
  font-size: 0.82rem;
  color: rgba(15,18,16,0.50);
  margin-top: 2px;
}
.field-input-wrap {
  display: flex;
  gap: 10px;
  flex: 1;
}
.field-input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #E5E5E5;
  border-radius: 0;
  font-family: inherit;
  font-size: 0.95rem;
  color: rgba(15,18,16,0.90);
  background: #fff;
  transition: all 0.2s;
}
.field-input:focus {
  outline: none;
  border-color: #767676;
  box-shadow: none;
  background: white;
}
.field-input:disabled { opacity: 0.60; cursor: not-allowed; }

.field-readonly {
  flex: 1;
  padding: 10px 14px;
  border-radius: 0;
  background: rgba(15,18,16,0.04);
  border: 1px solid #E5E5E5;
  font-size: 0.95rem;
  color: rgba(15,18,16,0.55);
}
.field-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.88rem;
  font-weight: 700;
  padding: 10px 14px;
  border-radius: 0;
}
.field-status.success { background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.20); color: #047857; }
.field-status.error { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.20); color: #dc2626; }

/* ── Unit Cards ── */
.unit-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.unit-card {
  position: relative;
  background: white;
  border: 2px solid rgba(15,18,16,0.12);
  border-radius: 0;
  padding: 24px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  font-family: inherit;
}
.unit-card:hover { border-color: rgba(15,18,16,0.25); transform: none; box-shadow: none; }
.unit-card.active {
  border-color: #767676;
  background: #f9f9f9;
  box-shadow: none;
}
.unit-flag { font-size: 2rem; }
.unit-name {
  font-weight: 900;
  font-size: 1.1rem;
  color: rgba(15,18,16,0.90);
}
.unit-examples {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}
.unit-example {
  background: rgba(15,18,16,0.06);
  color: rgba(15,18,16,0.65);
  padding: 4px 10px;
  border-radius: 0;
  font-size: 0.8rem;
  font-weight: 700;
}
.unit-card.active .unit-example {
  background: #f0f0f0;
  color: #000;
}
.unit-check {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 28px; height: 28px;
  border-radius: 50%;
  background: #000;
  color: white;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.9rem;
  font-weight: 900;
}

/* ── Unit Preview ── */
.unit-preview {
  background: white;
  border: 1px solid #E5E5E5;
  border-radius: 0;
  padding: 20px 24px;
}
.unit-preview-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.10em;
  color: rgba(15,18,16,0.45);
  margin-bottom: 14px;
}
.unit-preview-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.preview-item { text-align: center; }
.preview-val {
  font-size: 1.3rem;
  font-weight: 900;
  color: #000;
  letter-spacing: -0.01em;
}
.preview-key {
  font-size: 0.78rem;
  color: rgba(15,18,16,0.50);
  margin-top: 4px;
  font-weight: 600;
}

/* ── Buttons ── */
.btn {
  border: 1px solid #E5E5E5;
  background: rgba(255,255,255,0.60);
  color: rgba(15,18,16,0.78);
  border-radius: 0;
  height: 40px;
  padding: 0 18px;
  font-weight: 700;
  font-family: inherit;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s;
}
.btn:disabled { opacity: 0.45; cursor: not-allowed; }
.btn-primary {
  background: #0052FF;
  border-color: #0052FF;
  color: white;
}
.btn-primary:hover:not(:disabled) { background: #003ECC; border-color: #003ECC; }
.btn-outline-danger {
  background: transparent;
  border-color: rgba(220,38,38,0.30);
  color: #dc2626;
}
.btn-outline-danger:hover:not(:disabled) { background: rgba(220,38,38,0.06); }
.btn-sm { height: 36px; padding: 0 14px; font-size: 0.85rem; border-radius: 0; }

/* ── Emergency Contacts ── */
.contact-empty {
  font-size: 0.85rem;
  color: rgba(15,18,16,0.45);
  padding: 4px 0;
}
.contact-list { display: flex; flex-direction: column; gap: 10px; }
.contact-row {
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; padding: 10px 14px;
  border: 1px solid #E5E5E5; background: #fafafa;
}
.contact-info { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; flex: 1; }
.contact-name { font-weight: 700; font-size: 0.9rem; color: #000; }
.contact-detail { font-size: 0.80rem; color: #767676; }
.btn-remove-contact {
  width: 32px; height: 32px; border: 1px solid #E5E5E5; background: #fff;
  color: #767676; cursor: pointer; display: flex; align-items: center;
  justify-content: center; font-size: 0.85rem; flex-shrink: 0;
  transition: border-color 0.15s, color 0.15s;
}
.btn-remove-contact:hover { border-color: #dc2626; color: #dc2626; }

.contact-form-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  gap: 10px;
  align-items: center;
  justify-content: unset;
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .settings-body { padding: 20px 16px 60px; }
  .section-card { padding: 20px 16px; }
  .unit-cards { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 480px) {
  .field-row { flex-direction: column; align-items: flex-start; }
  .field-input-wrap { width: 100%; }
  .field-readonly { width: 100%; }
  .unit-preview-row { grid-template-columns: repeat(2, 1fr); }
  .unit-cards { grid-template-columns: 1fr; }
  .section-title { font-size: 1rem; }
  .contact-form-row { grid-template-columns: 1fr 1fr; }
}
</style>
