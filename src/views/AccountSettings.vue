<!-- src/views/AccountSettings.vue -->
<template>
  <div class="settings-page">

    <!-- Title bar -->
    <div class="st-title-bar">
      <div class="st-page-eyebrow">Your Account</div>
      <h1 class="st-page-title">Settings</h1>
    </div>

    <!-- Two-column layout -->
    <div class="st-layout">

      <!-- Sidebar nav -->
      <nav class="st-sidebar">
        <div class="st-sidebar-item st-sidebar-item--active">Account</div>
        <div class="st-sidebar-item">Units &amp; Display</div>
        <div class="st-sidebar-item">Privacy</div>
        <router-link to="/devices" class="st-sidebar-item">Connected Apps</router-link>
        <div class="st-sidebar-item">Notifications</div>
        <div class="st-sidebar-item">Billing</div>
      </nav>

      <!-- Right panel -->
      <div class="st-panel">

        <!-- ── PROFILE ─────────────────────────────── -->
        <section class="settings-section">
          <div class="section-label">Account</div>

          <div class="settings-card">
            <!-- Avatar row -->
            <div class="profile-avatar-row">
              <div class="avatar-upload-wrap" @click="triggerFilePicker" title="Change photo">
                <UserAvatar :src="avatarPreview || user?.avatarUrl" :name="user?.displayName" :size="56" />
                <div class="avatar-overlay">
                  <span v-if="uploadLoading" class="spinner-border spinner-border-sm"></span>
                  <i v-else class="bi bi-camera-fill"></i>
                </div>
              </div>
              <input
                ref="fileInput"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                class="avatar-file-input"
                @change="onFileChange"
              />
              <div class="profile-avatar-info">
                <div class="profile-name">{{ user?.displayName || 'Athlete' }}</div>
                <div class="profile-email">{{ user?.email }}</div>
              </div>
              <button
                v-if="user?.avatarUrl && !avatarPreview"
                class="st-photo-btn st-photo-btn--remove"
                type="button"
                @click.stop="removePhoto"
                :disabled="uploadLoading"
              >Remove</button>
            </div>
            <p v-if="uploadError" class="avatar-error">{{ uploadError }}</p>
            <p v-else class="field-hint">JPG, PNG or WebP · max 5 MB</p>

            <div class="divider"></div>

            <!-- Display Name -->
            <div class="field-group">
              <label class="field-label">Display Name</label>
              <input
                v-model="form.displayName"
                type="text"
                class="field-input"
                placeholder="Your name"
                maxlength="60"
                :disabled="savingProfile"
              />
            </div>

            <!-- Email (read-only) -->
            <div class="field-group">
              <label class="field-label">Email</label>
              <div class="field-readonly">{{ user?.email }}</div>
            </div>

            <!-- Bio -->
            <div class="field-group">
              <label class="field-label">Bio</label>
              <textarea
                v-model="form.bio"
                class="field-input field-textarea"
                placeholder="A few words about you and your training..."
                maxlength="300"
                rows="3"
                :disabled="savingProfile"
              ></textarea>
              <div class="field-counter">{{ form.bio?.length ?? 0 }} / 300</div>
            </div>

            <!-- Location -->
            <div class="field-group">
              <label class="field-label">Location</label>
              <input
                v-model="form.location"
                type="text"
                class="field-input"
                placeholder="City, State"
                maxlength="80"
                :disabled="savingProfile"
              />
            </div>

            <!-- Primary Sport -->
            <div class="field-group">
              <label class="field-label">Primary Sport</label>
              <select v-model="form.primarySport" class="field-input field-select" :disabled="savingProfile">
                <option value="running">Running</option>
                <option value="cycling">Cycling</option>
                <option value="swimming">Swimming</option>
                <option value="triathlon">Triathlon</option>
                <option value="trail">Trail Running</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div class="field-row">
              <div></div>
              <button
                class="btn btn-primary btn-sm"
                @click="saveProfile"
                :disabled="savingProfile || !isProfileDirty"
              >
                <span v-if="savingProfile" class="spinner-border spinner-border-sm me-1"></span>
                Save Changes
              </button>
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
              <div class="unit-tag">US</div>
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
              <div class="unit-tag">INT</div>
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

          <!-- Toggles card -->
          <div class="settings-card settings-card--toggles">
            <div class="toggle-row">
              <div class="toggle-info">
                <div class="field-label">Public Profile</div>
                <div class="field-hint">Anyone can view your profile and activity history.</div>
              </div>
              <div
                :class="['st-toggle', { 'st-toggle--on': isPublic }]"
                role="switch"
                :aria-checked="isPublic"
                @click="toggleVisibility"
              >
                <div class="st-toggle-knob"></div>
              </div>
            </div>
            <div class="toggle-divider"></div>
            <div class="toggle-row">
              <div class="toggle-info">
                <div class="field-label">Show Activity Map</div>
                <div class="field-hint">Display your route map on activity posts.</div>
              </div>
              <div class="st-toggle st-toggle--on">
                <div class="st-toggle-knob"></div>
              </div>
            </div>
            <div class="toggle-divider"></div>
            <div class="toggle-row">
              <div class="toggle-info">
                <div class="field-label">Email Notifications</div>
                <div class="field-hint">Get notified about kudos, crew activity, and challenges.</div>
              </div>
              <div class="st-toggle">
                <div class="st-toggle-knob"></div>
              </div>
            </div>
          </div>
        </section>

        <!-- ── SAFETY ─────────────────────────────── -->
        <section class="settings-section">
          <div class="section-label">Safety</div>
          <div class="section-sublabel">Emergency contacts are notified when you trigger SOS during a session.</div>

          <div class="settings-card">
            <!-- Contact list -->
            <div v-if="contacts.length === 0" class="contact-empty">No emergency contacts yet.</div>
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
              <div class="contact-form-row">
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
            <div class="field-group">
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
            <div class="field-group">
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
            <div class="field-group">
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
          <div class="section-label">Danger Zone</div>
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
            <div class="st-danger-zone">
              <a href="#" class="st-delete-link" @click.prevent="confirmDelete">Delete account</a>
              <div v-if="deleteError" class="field-status error" style="margin-top: 12px;">
                <i class="bi bi-exclamation-circle-fill"></i> {{ deleteError }}
              </div>
            </div>
          </div>
        </section>

      </div><!-- /st-panel -->
    </div><!-- /st-layout -->

    <ConfirmModal
      v-model="showDeleteAccountConfirm"
      title="Delete Account"
      body="Gone for good — your account and everything on it. No undo."
      confirm-label="Yes, Delete My Account"
      :danger="true"
      @confirm="doDeleteAccount"
    />
  </div><!-- /settings-page -->
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { useUnits } from '@/composables/useUnits'
import { useToast } from '@/composables/useToast'
import axios from 'axios'
import UserAvatar from '@/components/UserAvatar.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const router = useRouter()
const authStore = useAuthStore()
const { user, unitSystem } = storeToRefs(authStore)
const { formatDistance, formatPace, formatElevation } = useUnits()
const { showToast } = useToast()

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// ── Profile form (Display Name, Bio, Location, Primary Sport) ──────────────
const form = ref({ displayName: '', bio: '', location: '', primarySport: 'running' })
const initialForm = ref(null)
const savingProfile = ref(false)
const profileStatus = ref('')
const profileStatusType = ref('success')
let profileStatusTimer = null

const isProfileDirty = computed(() => {
  if (!initialForm.value) return false
  const f = form.value, i = initialForm.value
  return f.displayName !== i.displayName || f.bio !== i.bio ||
    f.location !== i.location || f.primarySport !== i.primarySport
})

const showProfileStatus = (msg, type = 'success') => {
  clearTimeout(profileStatusTimer)
  profileStatus.value = msg
  profileStatusType.value = type
  profileStatusTimer = setTimeout(() => { profileStatus.value = '' }, 3500)
}

const saveProfile = async () => {
  if (!form.value.displayName.trim() || !isProfileDirty.value) return
  savingProfile.value = true
  try {
    const { data } = await axios.patch(`${API_URL}/users/me`, {
      displayName: form.value.displayName.trim(),
      bio: form.value.bio,
      location: form.value.location,
      primarySport: form.value.primarySport,
    }, { headers: getAuthHeaders() })

    authStore.setAuth({ ...user.value, ...form.value, ...data })
    initialForm.value = { ...form.value }
    showProfileStatus('Profile updated!')
  } catch {
    showProfileStatus("Profile didn't save. Try again.", 'error')
  } finally {
    savingProfile.value = false
  }
}

// ── Avatar upload ────────────────────────────────────────────────────────
const fileInput = ref(null)
const avatarPreview = ref(null)
const uploadLoading = ref(false)
const uploadError = ref('')

const triggerFilePicker = () => fileInput.value?.click()

const onFileChange = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  uploadError.value = ''

  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    uploadError.value = 'Needs to be a JPG, PNG, or WebP.'
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    uploadError.value = 'Image must be under 5 MB.'
    return
  }

  const reader = new FileReader()
  reader.onload = (ev) => { avatarPreview.value = ev.target.result }
  reader.readAsDataURL(file)

  uploadLoading.value = true
  try {
    const form = new FormData()
    form.append('file', file)
    const { data } = await axios.post(`${API_URL}/users/me/avatar`, form, {
      headers: { 'Content-Type': 'multipart/form-data', ...getAuthHeaders() }
    })
    authStore.updateAvatar(data.avatarUrl)
    avatarPreview.value = null
  } catch {
    uploadError.value = "Upload didn't go through. Try again."
    avatarPreview.value = null
  } finally {
    uploadLoading.value = false
    e.target.value = ''
  }
}

const removePhoto = async () => {
  uploadLoading.value = true
  uploadError.value = ''
  try {
    await axios.delete(`${API_URL}/users/me/avatar`, { headers: getAuthHeaders() })
    authStore.updateAvatar(null)
  } catch {
    uploadError.value = "Photo didn't remove. Try again."
  } finally {
    uploadLoading.value = false
  }
}

// ── Profile visibility (saves immediately, like unit system) ───────────────
const isPublic = ref(user.value?.isPublic ?? true)

const toggleVisibility = async () => {
  const next = !isPublic.value
  isPublic.value = next
  try {
    const { data } = await axios.patch(`${API_URL}/users/me`, { isPublic: next }, { headers: getAuthHeaders() })
    authStore.setAuth({ ...user.value, isPublic: data.isPublic ?? next })
  } catch {
    isPublic.value = !next
    showToast("Visibility didn't update. Try again.", 'error')
  }
}

const selectUnit = (system) => {
  authStore.setUnitSystem(system)
}

// Preview values (5 km run at 5:30 /km pace, 137m elevation)
const PREVIEW_METERS = 5000
const PREVIEW_PACE_MIN_KM = 5.5
const PREVIEW_ELEVATION_M = 137

const previewDistance = computed(() => formatDistance(PREVIEW_METERS))
const previewPace = computed(() => formatPace(PREVIEW_PACE_MIN_KM))
const previewElevation = computed(() => formatElevation(PREVIEW_ELEVATION_M))

const handleLogout = () => {
  authStore.logout()
  router.push('/')
}

// ── Delete account ───────────────────────────────────────────────────────
const deleting = ref(false)
const deleteError = ref('')
const showDeleteAccountConfirm = ref(false)

const confirmDelete = () => { showDeleteAccountConfirm.value = true }

const doDeleteAccount = async () => {
  showDeleteAccountConfirm.value = false
  deleting.value = true
  deleteError.value = ''
  try {
    await axios.delete(`${API_URL}/users/me`, { headers: getAuthHeaders() })
    authStore.logout()
    router.push('/')
  } catch {
    deleteError.value = "Account didn't delete. Try again, or reach out to support."
    deleting.value = false
  }
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
    showContactStatus("Contact didn't save. Try again.", 'error')
  } finally {
    addingContact.value = false
  }
}

const removeContact = async (id) => {
  try {
    await axios.delete(`${API_URL}/emergency-contacts/${id}`, { headers: getAuthHeaders() })
    contacts.value = contacts.value.filter(c => c.id !== id)
  } catch {
    showContactStatus("Contact didn't remove. Try again.", 'error')
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
    showPasswordStatus('Password updated.')
  } catch (err) {
    const msg = err.response?.data?.error || "Password didn't update. Double-check your current one."
    showPasswordStatus(msg, 'error')
  } finally {
    savingPassword.value = false
  }
}

/* ── Unsaved profile-form guard ── */
onBeforeRouteLeave(() => {
  if (isProfileDirty.value) {
    return window.confirm('Your profile changes are unsaved. Leave anyway?')
  }
})

onMounted(() => {
  if (user.value) {
    form.value = {
      displayName: user.value.displayName || '',
      bio: user.value.bio || '',
      location: user.value.location || '',
      primarySport: user.value.primarySport || 'running',
    }
    initialForm.value = { ...form.value }
    isPublic.value = user.value.isPublic ?? true
  }
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

/* ── Title bar ── */
.st-title-bar {
  padding: 28px 28px 20px;
  border-bottom: 2px solid #16130F;
}
.st-page-eyebrow {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #2A55F5;
  margin-bottom: 8px;
}
.st-page-title {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-weight: 900;
  font-size: clamp(2.4rem, 5vw, 3.6rem);
  line-height: 0.85;
  text-transform: uppercase;
  margin: 0;
  color: #16130F;
}

/* ── Two-column layout ── */
.st-layout {
  display: grid;
  grid-template-columns: 200px 1fr;
  border-top: none;
  min-height: calc(100vh - var(--nav-h, 66px) - 80px);
}

/* ── Sidebar ── */
.st-sidebar {
  border-right: 2px solid #16130F;
  padding: 16px 0;
  background: #FBF6EC;
  position: sticky;
  top: var(--nav-h, 66px);
  align-self: start;
}
.st-sidebar-item {
  display: block;
  padding: 12px 22px;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #5a5348;
  cursor: pointer;
  transition: color 0.15s;
}
.st-sidebar-item:hover { color: #16130F; background: #F1EADC; }
.st-sidebar-item--active {
  background: #2A55F5;
  color: #fff;
  border-left: 3px solid #16130F;
  padding-left: 19px;
}
.st-sidebar-item--active:hover { color: #fff; background: #1E42D6; }

/* ── Panel ── */
.st-panel {
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* ── Sections ── */
.settings-section { display: flex; flex-direction: column; gap: 12px; }

.section-label {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.66rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: #2A55F5;
}
.section-sublabel {
  font-size: 0.88rem;
  color: #5a5348;
  margin-top: -6px;
  line-height: 1.5;
}

/* ── Card ── */
.settings-card {
  background: #fff;
  border: 2px solid #16130F;
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.divider { height: 2px; background: #E7DFCE; }

/* ── Profile avatar row ── */
.profile-avatar-row {
  display: flex;
  align-items: center;
  gap: 16px;
}
.avatar-upload-wrap {
  position: relative;
  cursor: pointer;
  display: inline-flex;
  border-radius: 50%;
  border: 2px solid #16130F;
  flex-shrink: 0;
}
.avatar-upload-wrap:hover .avatar-overlay { opacity: 1; }
.avatar-overlay {
  position: absolute;
  inset: 0;
  background: rgba(22,19,15,0.55);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 1.1rem;
  opacity: 0;
  transition: opacity 0.15s;
}
.avatar-file-input { display: none; }
.avatar-error {
  font-size: 0.78rem;
  color: #C0392B;
  margin: -8px 0 0;
}
.st-photo-btn--remove { color: #C0392B; border-color: #C0392B; }
.st-photo-btn--remove:hover { background: rgba(192,57,43,0.06); }
.profile-avatar-info { flex: 1; }
.profile-name {
  font-weight: 800;
  font-size: 1rem;
  color: #16130F;
}
.profile-email {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.7rem;
  color: #8a8a8a;
  margin-top: 2px;
}
.st-photo-btn {
  border: 2px solid #16130F;
  background: #FBF6EC;
  padding: 8px 14px;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #16130F;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s;
}
.st-photo-btn:hover { background: #E7DFCE; }

/* ── Field groups (vertical label+input) ── */
.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* ── Field row (horizontal label+button) ── */
.field-row {
  display: flex;
  align-items: center;
  gap: 16px;
  justify-content: space-between;
}

.field-label {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #5a5348;
  display: block;
}
.field-hint {
  font-size: 0.82rem;
  color: #8a8a8a;
  margin-top: 2px;
  line-height: 1.4;
}
.field-counter {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.6rem;
  font-weight: 600;
  color: #8a8a8a;
  letter-spacing: 0.08em;
  margin-top: -2px;
}
.field-input-wrap {
  display: flex;
  gap: 10px;
  flex: 1;
}
.field-input {
  flex: 1;
  width: 100%;
  height: 46px;
  padding: 0 14px;
  border: 2px solid #16130F;
  background: #fff;
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
  font-size: 0.92rem;
  color: #16130F;
  outline: none;
  transition: border-color 0.15s;
  box-sizing: border-box;
}
.field-input:focus { border-color: #2A55F5; }
.field-input:disabled { opacity: 0.55; cursor: not-allowed; background: #F1EADC; }
.field-input::placeholder { color: #8a8a8a; }

.field-textarea {
  height: auto;
  min-height: 72px;
  padding: 12px 14px;
  resize: vertical;
  line-height: 1.5;
}
.field-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2316130F' stroke-width='1.5' fill='none'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  padding-right: 36px;
  cursor: pointer;
}

.field-readonly {
  flex: 1;
  height: 46px;
  padding: 0 14px;
  border: 2px solid #E7DFCE;
  background: #F1EADC;
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
  font-size: 0.92rem;
  color: #5a5348;
  display: flex;
  align-items: center;
  box-sizing: border-box;
}
.field-readonly--bio {
  height: auto;
  min-height: 60px;
  padding: 12px 14px;
  align-items: flex-start;
  line-height: 1.5;
}
.field-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  font-weight: 700;
  padding: 10px 14px;
  border: 2px solid;
}
.field-status.success { background: rgba(16,185,129,0.06); border-color: rgba(16,185,129,0.3); color: #047857; }
.field-status.error { background: #FEF2F2; border-color: #FCA5A5; color: #DC2626; }

/* ── Buttons ── */
.btn {
  border: 2px solid #16130F;
  background: #FBF6EC;
  color: #16130F;
  height: 40px;
  padding: 0 18px;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  transition: background 0.15s;
  flex-shrink: 0;
}
.btn:hover:not(:disabled) { background: #E7DFCE; }
.btn:disabled { opacity: 0.45; cursor: not-allowed; }

.btn-primary {
  background: #2A55F5;
  border-color: #16130F;
  color: #fff;
  border-radius: 999px;
  box-shadow: 3px 3px 0 #16130F;
}
.btn-primary:hover:not(:disabled) { background: #1E42D6; }
.btn-primary:disabled { box-shadow: none; }

.btn-outline-danger {
  background: transparent;
  border-color: #C0392B;
  color: #C0392B;
}
.btn-outline-danger:hover:not(:disabled) { background: rgba(192,57,43,0.06); }

.btn-sm { height: 36px; padding: 0 14px; font-size: 0.66rem; }

/* ── Unit Cards ── */
.unit-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.unit-card {
  position: relative;
  background: #fff;
  border: 2px solid #16130F;
  padding: 24px 20px;
  text-align: center;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
  transition: background 0.15s;
}
.unit-card:hover { background: #F1EADC; }
.unit-card.active {
  background: #16130F;
  color: #FBF6EC;
  box-shadow: 3px 3px 0 #2A55F5;
}
.unit-tag {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  background: #F1EADC;
  color: #5a5348;
  padding: 4px 10px;
  border: 2px solid #E7DFCE;
}
.unit-card.active .unit-tag {
  background: rgba(251,246,236,0.12);
  color: rgba(251,246,236,0.7);
  border-color: rgba(251,246,236,0.2);
}
.unit-name {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-weight: 800;
  font-size: 1.4rem;
  text-transform: uppercase;
  line-height: 0.9;
}
.unit-examples {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}
.unit-example {
  background: rgba(22,19,15,0.08);
  color: #5a5348;
  padding: 4px 10px;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.unit-card.active .unit-example {
  background: rgba(251,246,236,0.15);
  color: #FBF6EC;
}
.unit-check {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 26px;
  height: 26px;
  background: #2A55F5;
  border: 2px solid #FBF6EC;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 900;
}

/* ── Unit Preview ── */
.unit-preview {
  background: #fff;
  border: 2px solid #16130F;
  padding: 20px 24px;
}
.unit-preview-label {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #8a8a8a;
  margin-bottom: 14px;
}
.unit-preview-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.preview-item { text-align: center; }
.preview-val {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-size: 1.8rem;
  font-weight: 900;
  color: #16130F;
  line-height: 1;
}
.preview-key {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.62rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #8a8a8a;
  margin-top: 5px;
}

/* ── Privacy Toggles ── */
.settings-card--toggles {
  gap: 0;
  padding: 0;
}
.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 16px 22px;
}
.toggle-info { flex: 1; }
.toggle-divider { height: 1px; background: #E7DFCE; margin: 0 22px; }

/* Toggle switch */
.st-toggle {
  width: 44px;
  height: 24px;
  background: #EDE5D5;
  border: 2px solid #16130F;
  position: relative;
  flex-shrink: 0;
  cursor: pointer;
  transition: background 0.2s;
}
.st-toggle--on { background: #2A55F5; }
.st-toggle-knob {
  width: 16px;
  height: 16px;
  background: #16130F;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: left 0.2s, background 0.2s;
}
.st-toggle--on .st-toggle-knob {
  left: 22px;
  background: #fff;
}

/* ── Emergency Contacts ── */
.contact-empty {
  font-size: 0.88rem;
  color: #8a8a8a;
}
.contact-list { display: flex; flex-direction: column; gap: 8px; }
.contact-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  border: 2px solid #E7DFCE;
  background: #F1EADC;
}
.contact-info { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; flex: 1; }
.contact-name { font-weight: 700; font-size: 0.9rem; color: #16130F; }
.contact-detail { font-size: 0.78rem; color: #8a8a8a; }
.btn-remove-contact {
  width: 32px;
  height: 32px;
  border: 2px solid #E7DFCE;
  background: #fff;
  color: #8a8a8a;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  flex-shrink: 0;
  transition: border-color 0.15s, color 0.15s;
}
.btn-remove-contact:hover { border-color: #C0392B; color: #C0392B; }

.contact-form-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  gap: 10px;
  align-items: center;
}

/* ── Danger zone ── */
.st-danger-zone {
  padding-top: 16px;
  border-top: 2px solid #E7DFCE;
}
.st-delete-link {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #C0392B;
  text-decoration: none;
}
.st-delete-link:hover { text-decoration: underline; }

/* ── Responsive ── */
@media (max-width: 768px) {
  .st-layout { grid-template-columns: 1fr; }
  .st-sidebar { display: flex; overflow-x: auto; border-right: none; border-bottom: 2px solid #16130F; padding: 0; position: static; }
  .st-sidebar-item { white-space: nowrap; padding: 12px 18px; }
  .st-sidebar-item--active { padding-left: 14px; border-left: none; border-bottom: 3px solid #2A55F5; background: transparent; color: #2A55F5; }
  .st-sidebar-item--active:hover { background: transparent; }
  .st-panel { padding: 20px 16px; }
  .unit-cards { grid-template-columns: 1fr 1fr; }
  .contact-form-row { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 480px) {
  .field-row { flex-direction: column; align-items: flex-start; }
  .field-readonly { width: 100%; }
  .unit-preview-row { grid-template-columns: repeat(2, 1fr); }
  .unit-cards { grid-template-columns: 1fr; }
  .contact-form-row { grid-template-columns: 1fr 1fr; }
  .toggle-row { gap: 12px; }
}
</style>
