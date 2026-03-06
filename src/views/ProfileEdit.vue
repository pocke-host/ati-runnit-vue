<!-- src/views/ProfileEdit.vue -->
<template>
  <div class="profile-edit-page">
    <div class="pe-wrap">

      <!-- Header -->
      <div class="pe-header">
        <button class="btn-back" @click="$router.back()">
          <i class="bi bi-arrow-left"></i>
        </button>
        <div>
          <div class="pe-kicker">ACCOUNT</div>
          <h1 class="pe-title">Edit Profile</h1>
        </div>
      </div>

      <!-- Status banner -->
      <div v-if="saved" class="pe-banner pe-banner-success">
        <i class="bi bi-check-circle-fill"></i> Profile updated successfully.
      </div>
      <div v-if="error" class="pe-banner pe-banner-error">
        <i class="bi bi-exclamation-circle-fill"></i> {{ error }}
      </div>

      <div class="pe-grid">

        <!-- Avatar section -->
        <div class="pe-card pe-avatar-card">
          <div class="pe-section-label">PHOTO</div>
          <div class="avatar-preview">{{ initials }}</div>
          <p class="avatar-note">Photo upload coming soon. Your initials are displayed as your avatar.</p>
        </div>

        <!-- Form -->
        <div class="pe-card">
          <form @submit.prevent="saveProfile">

            <div class="pe-section-label">BASIC INFO</div>

            <div class="pe-field">
              <label class="pe-label">Display Name</label>
              <input
                v-model="form.displayName"
                class="pe-input"
                type="text"
                placeholder="Your name"
                maxlength="60"
              />
            </div>

            <div class="pe-field">
              <label class="pe-label">Bio</label>
              <textarea
                v-model="form.bio"
                class="pe-input pe-textarea"
                placeholder="A few words about you and your running..."
                maxlength="300"
                rows="4"
              ></textarea>
              <div class="pe-char-count">{{ form.bio?.length ?? 0 }} / 300</div>
            </div>

            <div class="pe-field">
              <label class="pe-label">Location</label>
              <input
                v-model="form.location"
                class="pe-input"
                type="text"
                placeholder="City, State"
                maxlength="80"
              />
            </div>

            <div class="pe-divider"></div>
            <div class="pe-section-label">PREFERENCES</div>

            <div class="pe-field">
              <label class="pe-label">Primary Sport</label>
              <select v-model="form.primarySport" class="pe-input pe-select">
                <option value="running">Running</option>
                <option value="cycling">Cycling</option>
                <option value="swimming">Swimming</option>
                <option value="triathlon">Triathlon</option>
                <option value="trail">Trail Running</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div class="pe-field">
              <label class="pe-label">Unit System</label>
              <div class="pe-toggle-row">
                <button
                  type="button"
                  :class="['pe-toggle-btn', form.unitSystem === 'imperial' ? 'active' : '']"
                  @click="form.unitSystem = 'imperial'"
                >Imperial (mi, ft)</button>
                <button
                  type="button"
                  :class="['pe-toggle-btn', form.unitSystem === 'metric' ? 'active' : '']"
                  @click="form.unitSystem = 'metric'"
                >Metric (km, m)</button>
              </div>
            </div>

            <div class="pe-field">
              <label class="pe-label">Profile Visibility</label>
              <div class="pe-toggle-row">
                <button
                  type="button"
                  :class="['pe-toggle-btn', form.isPublic ? 'active' : '']"
                  @click="form.isPublic = true"
                >Public</button>
                <button
                  type="button"
                  :class="['pe-toggle-btn', !form.isPublic ? 'active' : '']"
                  @click="form.isPublic = false"
                >Private</button>
              </div>
            </div>

            <div class="pe-actions">
              <button type="submit" class="btn-save" :disabled="saving">
                <span v-if="saving" class="btn-spinner"></span>
                {{ saving ? 'Saving…' : 'Save Changes' }}
              </button>
            </div>

          </form>
        </div>

      </div>

      <!-- Danger zone -->
      <div class="pe-card pe-danger-card">
        <div class="pe-section-label danger-label">DANGER ZONE</div>
        <div class="danger-row">
          <div>
            <div class="danger-title">Delete Account</div>
            <div class="danger-sub">Permanently delete your account and all data. This cannot be undone.</div>
          </div>
          <button class="btn-danger" @click="confirmDelete">Delete Account</button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
const router = useRouter()
const authStore = useAuthStore()
const { user } = storeToRefs(authStore)

const saving = ref(false)
const saved = ref(false)
const error = ref('')

const form = ref({
  displayName: '',
  bio: '',
  location: '',
  primarySport: 'running',
  unitSystem: 'imperial',
  isPublic: true
})

const initials = computed(() => {
  const name = form.value.displayName || user.value?.displayName || ''
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'
})

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const saveProfile = async () => {
  saving.value = true
  saved.value = false
  error.value = ''
  try {
    const { data } = await axios.patch(`${API_URL}/users/me`, {
      displayName: form.value.displayName,
      bio: form.value.bio,
      location: form.value.location,
      primarySport: form.value.primarySport,
      unitSystem: form.value.unitSystem,
      isPublic: form.value.isPublic
    }, { headers: getAuthHeaders() })

    // Update auth store with new display name
    if (data.displayName) {
      authStore.setUnitSystem(form.value.unitSystem)
    }
    saved.value = true
    setTimeout(() => { saved.value = false }, 4000)
  } catch (e) {
    error.value = 'Failed to save changes. Please try again.'
  } finally {
    saving.value = false
  }
}

const confirmDelete = () => {
  if (confirm('Are you sure you want to permanently delete your account? This cannot be undone.')) {
    // TODO: call DELETE /users/me then logout
    authStore.logout()
    router.push('/')
  }
}

onMounted(() => {
  if (user.value) {
    form.value.displayName = user.value.displayName || ''
    form.value.bio = user.value.bio || ''
    form.value.location = user.value.location || ''
    form.value.primarySport = user.value.primarySport || 'running'
    form.value.unitSystem = user.value.unitSystem || localStorage.getItem('unitSystem') || 'imperial'
    form.value.isPublic = user.value.isPublic !== false
  }
})
</script>

<style scoped>
.profile-edit-page {
  min-height: 100vh;
  background: #fff;
  padding-top: var(--nav-h, 64px);
  font-family: "Futura PT", "Futura", "Century Gothic", "Trebuchet MS", sans-serif;
}

.pe-wrap {
  max-width: 840px;
  margin: 0 auto;
  padding: 48px 24px 80px;
}

/* Header */
.pe-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 36px;
}

.btn-back {
  width: 44px;
  height: 44px;
  border: 1px solid #E5E5E5;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.1rem;
  color: #000;
  border-radius: 0;
  transition: background 0.15s;
  flex-shrink: 0;
}
.btn-back:hover { background: #f5f5f5; }

.pe-kicker {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  color: #767676;
  margin-bottom: 4px;
}

.pe-title {
  font-size: 1.8rem;
  font-weight: 900;
  letter-spacing: -0.02em;
  margin: 0;
  color: #000;
}

/* Status banners */
.pe-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  margin-bottom: 24px;
  font-size: 0.88rem;
  font-weight: 600;
  border-radius: 0;
}
.pe-banner-success { background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; }
.pe-banner-error   { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; }

/* Grid */
.pe-grid {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

/* Card */
.pe-card {
  border: 1px solid #E5E5E5;
  padding: 32px;
  background: #fff;
}

.pe-avatar-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;
}

.avatar-preview {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #000;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  font-weight: 900;
  letter-spacing: 0.04em;
  flex-shrink: 0;
}

.avatar-note {
  font-size: 0.75rem;
  color: #767676;
  line-height: 1.5;
  margin: 0;
}

/* Section label */
.pe-section-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #767676;
  margin-bottom: 20px;
}

/* Form fields */
.pe-field {
  margin-bottom: 20px;
}

.pe-label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.10em;
  text-transform: uppercase;
  color: #000;
  margin-bottom: 8px;
}

.pe-input {
  width: 100%;
  height: 44px;
  border: 1px solid #E5E5E5;
  border-radius: 0;
  padding: 0 14px;
  font-size: 0.9rem;
  color: #000;
  background: #fff;
  outline: none;
  transition: border-color 0.15s;
  box-sizing: border-box;
  font-family: inherit;
}
.pe-input:focus { border-color: #000; }

.pe-textarea {
  height: auto;
  padding: 12px 14px;
  resize: vertical;
  line-height: 1.5;
}

.pe-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23000' stroke-width='1.5' fill='none'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  padding-right: 36px;
  cursor: pointer;
}

.pe-char-count {
  font-size: 11px;
  color: #767676;
  text-align: right;
  margin-top: 4px;
}

/* Toggle row */
.pe-toggle-row {
  display: flex;
  gap: 0;
}

.pe-toggle-btn {
  flex: 1;
  height: 44px;
  border: 1px solid #E5E5E5;
  background: #fff;
  color: #767676;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
  margin-right: -1px;
}
.pe-toggle-btn:last-child { margin-right: 0; }
.pe-toggle-btn.active {
  background: #000;
  border-color: #000;
  color: #fff;
  position: relative;
  z-index: 1;
}
.pe-toggle-btn:hover:not(.active) { background: #f5f5f5; color: #000; }

.pe-divider {
  border: none;
  border-top: 1px solid #E5E5E5;
  margin: 28px 0 24px;
}

/* Actions */
.pe-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 28px;
}

.btn-save {
  height: 48px;
  padding: 0 40px;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 0;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.10em;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: background 0.15s;
  font-family: inherit;
}
.btn-save:hover:not(:disabled) { background: #222; }
.btn-save:disabled { opacity: 0.45; cursor: not-allowed; }

.btn-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Danger zone */
.pe-danger-card {
  border-color: #fecaca;
}

.danger-label { color: #dc2626; }

.danger-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.danger-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: #000;
  margin-bottom: 4px;
}
.danger-sub {
  font-size: 0.82rem;
  color: #767676;
  line-height: 1.5;
}

.btn-danger {
  height: 40px;
  padding: 0 24px;
  background: transparent;
  border: 1px solid #fecaca;
  color: #dc2626;
  border-radius: 0;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
  font-family: inherit;
  flex-shrink: 0;
}
.btn-danger:hover { background: #fef2f2; border-color: #dc2626; }

/* Responsive */
@media (max-width: 640px) {
  .pe-grid {
    grid-template-columns: 1fr;
  }
  .pe-avatar-card {
    flex-direction: row;
    text-align: left;
    padding: 24px;
  }
  .danger-row {
    flex-direction: column;
    align-items: flex-start;
  }
  .pe-wrap {
    padding: 32px 16px 80px;
  }
}
</style>
