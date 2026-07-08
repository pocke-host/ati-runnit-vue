<!-- src/views/AccountSettings.vue -->
<template>
  <div class="settings-page">
    <div class="settings-page-head">
      <button class="settings-back-btn" @click="router.push('/dashboard')">
        <i class="bi bi-arrow-left"></i> Dashboard
      </button>
      <h1 class="settings-title">Settings</h1>
    </div>

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

      <!-- ── SECURITY ──────────────────────────── -->
      <section class="settings-section">
        <div class="section-label">Security</div>
        <div class="section-sublabel">Change your password. You'll need your current password to confirm.</div>

        <div class="settings-card">
          <div class="field-row">
            <label class="field-label" for="current-password">Current Password</label>
            <input
              id="current-password"
              v-model="currentPassword"
              type="password"
              class="field-input"
              placeholder="Current password"
              autocomplete="current-password"
              :disabled="savingPassword"
            />
          </div>
          <div class="field-row">
            <label class="field-label" for="new-password">New Password</label>
            <input
              id="new-password"
              v-model="newPassword"
              type="password"
              class="field-input"
              placeholder="At least 8 characters"
              autocomplete="new-password"
              :disabled="savingPassword"
            />
          </div>
          <div class="field-row">
            <label class="field-label" for="confirm-password">Confirm Password</label>
            <div class="field-input-wrap">
              <input
                id="confirm-password"
                v-model="confirmPassword"
                type="password"
                class="field-input"
                placeholder="Repeat new password"
                autocomplete="new-password"
                :disabled="savingPassword"
              />
              <button
                class="btn btn-primary btn-sm"
                @click="changePassword"
                :disabled="savingPassword || !currentPassword || !newPassword || newPassword !== confirmPassword || newPassword.length < 8"
              >
                <span v-if="savingPassword" class="spinner-border spinner-border-sm me-1"></span>
                Update
              </button>
            </div>
          </div>
          <div v-if="newPassword && confirmPassword && newPassword !== confirmPassword" class="field-status error">
            <i class="bi bi-exclamation-circle-fill"></i> Passwords don't match
          </div>
          <div v-if="passwordStatus" :class="['field-status', passwordStatusType]">
            <i :class="passwordStatusType === 'success' ? 'bi bi-check-circle-fill' : 'bi bi-exclamation-circle-fill'"></i>
            {{ passwordStatus }}
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
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { useUnits } from '@/composables/useUnits'
import { useToast } from '@/composables/useToast'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const router = useRouter()
const authStore = useAuthStore()
const { user, unitSystem } = storeToRefs(authStore)
const { formatDistance, formatPace, formatElevation } = useUnits()
const { showToast } = useToast()

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
  } catch {
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
  } catch {
    // non-critical, contacts section will show empty
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

/* ── Password Change ── */
const currentPassword  = ref('')
const newPassword      = ref('')
const confirmPassword  = ref('')
const savingPassword   = ref(false)
const passwordStatus   = ref('')
const passwordStatusType = ref('success')
let passwordTimer = null

const showPasswordStatus = (msg, type = 'success') => {
  clearTimeout(passwordTimer)
  passwordStatus.value = msg
  passwordStatusType.value = type
  passwordTimer = setTimeout(() => { passwordStatus.value = '' }, 3500)
}

const changePassword = async () => {
  if (newPassword.value !== confirmPassword.value) return
  if (newPassword.value.length < 8) return
  savingPassword.value = true
  try {
    await axios.post(
      `${API_URL}/auth/change-password`,
      { currentPassword: currentPassword.value, newPassword: newPassword.value },
      { headers: getAuthHeaders() }
    )
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    showPasswordStatus('Password updated successfully!')
  } catch (err) {
    const msg = err.response?.data?.error || 'Failed to update password. Check your current password.'
    showPasswordStatus(msg, 'error')
  } finally {
    savingPassword.value = false
  }
}

/* ── Unsaved display-name guard ── */
onBeforeRouteLeave(() => {
  if (displayName.value !== user.value?.displayName) {
    return window.confirm('You have unsaved changes to your display name. Leave anyway?')
  }
})

onMounted(() => {
  loadContacts()
})
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
  background: #FBF6EC;
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
  color: #16130F;
  padding-top: var(--nav-h, 66px);
}

/* ── Page head ── */
.settings-page-head {
  border-bottom: 2px solid #16130F;
  padding: 24px 24px 20px;
  max-width: 700px;
  margin: 0 auto;
}
.settings-back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #5A5348;
  cursor: pointer;
  padding: 0 0 10px;
  transition: color 0.15s;
}
.settings-back-btn:hover { color: #16130F; }
.settings-title {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-size: clamp(36px, 7vw, 48px);
  font-weight: 900;
  text-transform: uppercase;
  line-height: 0.88;
  margin: 0;
  color: #16130F;
}

/* ── Body ── */
.settings-body {
  max-width: 700px;
  margin: 0 auto;
  padding: 32px 24px 80px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* ── Sections ── */
.settings-section { display: flex; flex-direction: column; gap: 10px; }

.section-label {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.62rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: #2A55F5;
}
.section-sublabel {
  font-size: 0.86rem;
  color: #5A5348;
  margin-top: -4px;
  line-height: 1.5;
}
.danger-label { color: #dc2626; }

/* ── Card ── */
.settings-card {
  background: #fff;
  border: 2px solid #16130F;
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.divider { height: 2px; background: #E7DFCE; margin: 0; }

/* ── Profile ── */
.profile-avatar-row {
  display: flex;
  align-items: center;
  gap: 16px;
}
.profile-avatar {
  width: 60px; height: 60px;
  border-radius: 999px;
  background: #2A55F5;
  border: 2px solid #16130F;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
  font-weight: 800;
  color: #fff;
  font-size: 1.4rem;
  flex-shrink: 0;
}
.profile-name {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-weight: 800;
  font-size: 1.3rem;
  text-transform: uppercase;
  line-height: 0.9;
  color: #16130F;
}
.profile-email {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.66rem;
  color: #8A8A8A;
  margin-top: 4px;
}

/* ── Fields ── */
.field-row {
  display: flex;
  align-items: center;
  gap: 16px;
  justify-content: space-between;
}
.field-label {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.58rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #5A5348;
  white-space: nowrap;
  min-width: 110px;
}
.field-hint {
  font-size: 0.82rem;
  color: #8A8A8A;
  margin-top: 3px;
  line-height: 1.4;
}
.field-input-wrap {
  display: flex;
  gap: 10px;
  flex: 1;
}
.field-input {
  flex: 1;
  padding: 12px 14px;
  border: 2px solid #16130F;
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
  font-size: 0.95rem;
  color: #16130F;
  background: #fff;
  transition: border-color 0.15s;
  outline: none;
}
.field-input:focus { border-color: #2A55F5; }
.field-input:disabled { opacity: 0.55; cursor: not-allowed; background: #F1EADC; }

.field-readonly {
  flex: 1;
  padding: 12px 14px;
  border: 2px solid #E7DFCE;
  background: #F1EADC;
  font-size: 0.95rem;
  color: #8A8A8A;
}
.field-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.84rem;
  font-weight: 700;
  padding: 10px 14px;
}
.field-status.success { background: #F0FFF4; border: 2px solid #86EFAC; color: #15803D; }
.field-status.error { background: #FEF2F2; border: 2px solid #FCA5A5; color: #DC2626; }

/* ── Unit Cards ── */
.unit-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.unit-card {
  position: relative;
  background: #fff;
  border: 2px solid #16130F;
  padding: 20px 16px;
  text-align: center;
  cursor: pointer;
  transition: background 0.15s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
}
.unit-card:hover { background: #F1EADC; }
.unit-card.active { background: #EEF1FF; border-color: #2A55F5; }
.unit-flag { font-size: 1.8rem; }
.unit-name {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-weight: 800;
  font-size: 1.1rem;
  text-transform: uppercase;
  color: #16130F;
}
.unit-examples { display: flex; gap: 6px; flex-wrap: wrap; justify-content: center; }
.unit-example {
  background: #F1EADC;
  color: #5A5348;
  padding: 3px 8px;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  font-weight: 700;
  border: 1px solid #E7DFCE;
}
.unit-card.active .unit-example { background: #EEF1FF; color: #2A55F5; border-color: #2A55F5; }
.unit-check {
  position: absolute;
  top: 12px; right: 12px;
  width: 24px; height: 24px;
  border-radius: 999px;
  background: #2A55F5;
  border: 2px solid #16130F;
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.8rem;
  font-weight: 900;
}

/* ── Unit Preview ── */
.unit-preview {
  background: #fff;
  border: 2px solid #E7DFCE;
  padding: 18px 20px;
}
.unit-preview-label {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.58rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #8A8A8A;
  margin-bottom: 12px;
}
.unit-preview-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.preview-item { text-align: center; }
.preview-val {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-size: 1.5rem;
  font-weight: 800;
  color: #16130F;
  line-height: 0.9;
}
.preview-key {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.54rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #8A8A8A;
  margin-top: 6px;
}

/* ── Buttons ── */
.btn {
  border: 2px solid #16130F;
  background: #FBF6EC;
  color: #16130F;
  height: 40px;
  padding: 0 16px;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  transition: background 0.15s;
}
.btn:disabled { opacity: 0.45; cursor: not-allowed; }
.btn:hover:not(:disabled) { background: #E7DFCE; }

.btn-primary {
  background: #2A55F5;
  border-color: #16130F;
  color: #fff;
  border-radius: 999px;
  box-shadow: 3px 3px 0 #16130F;
}
.btn-primary:hover:not(:disabled) { background: #1E42D6; box-shadow: 2px 2px 0 #16130F; }

.btn-outline-danger {
  background: transparent;
  border: 2px solid rgba(220,38,38,0.40);
  color: #dc2626;
}
.btn-outline-danger:hover:not(:disabled) { background: rgba(220,38,38,0.06); }
.btn-sm { height: 36px; padding: 0 14px; font-size: 0.6rem; }

/* ── Emergency Contacts ── */
.contact-empty {
  font-size: 0.85rem;
  color: #8A8A8A;
  padding: 4px 0;
}
.contact-list { display: flex; flex-direction: column; gap: 8px; }
.contact-row {
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; padding: 10px 14px;
  border: 2px solid #E7DFCE; background: #FBF6EC;
}
.contact-info { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; flex: 1; }
.contact-name { font-weight: 700; font-size: 0.9rem; color: #16130F; }
.contact-detail { font-family: 'Spline Sans Mono', ui-monospace, monospace; font-size: 0.72rem; color: #8A8A8A; }
.btn-remove-contact {
  width: 32px; height: 32px; border: 2px solid #E7DFCE; background: #fff;
  color: #8A8A8A; cursor: pointer; display: flex; align-items: center;
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
  .unit-cards { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 480px) {
  .settings-page-head { padding: 20px 16px 16px; }
  .field-row { flex-direction: column; align-items: flex-start; }
  .field-input-wrap { width: 100%; }
  .field-readonly { width: 100%; }
  .unit-preview-row { grid-template-columns: repeat(2, 1fr); }
  .unit-cards { grid-template-columns: 1fr; }
  .contact-form-row { grid-template-columns: 1fr 1fr; }
}
</style>
