<!-- ========== ConnectDevices.vue ========== -->
<template>
  <div class="connect-devices">
    <h2>Connect Your Devices</h2>
    <p>Automatically sync your workouts from your favorite fitness platforms</p>

    <!-- Status Banner -->
    <div v-if="statusMessage" :class="['status-banner', statusType]">
      <i :class="statusType === 'success' ? 'bi bi-check-circle-fill' : 'bi bi-exclamation-circle-fill'"></i>
      {{ statusMessage }}
    </div>

    <div class="devices-grid">
      <!-- Garmin -->
      <div class="device-card">
        <div class="device-icon">🏃</div>
        <h3>Garmin</h3>
        <p>Sync runs, rides, and more from your Garmin device</p>

        <template v-if="!garminConnected">
          <button class="btn btn-primary" @click="connectGarmin" :disabled="loading">
            Connect Garmin
          </button>
        </template>
        <template v-else>
          <div class="connected-state">
            <div class="connected-chip">
              <span class="green-dot"></span>
              CONNECTED
            </div>
            <div class="last-sync-label">
              Last synced: {{ relativeTime(garminLastSync) }}
            </div>
            <button class="btn btn-primary" @click="syncNow" :disabled="syncing">
              <span v-if="syncing" class="spinner"></span>
              {{ syncing ? 'Syncing…' : 'Sync Now' }}
            </button>
            <button class="btn-disconnect" @click="disconnectGarmin">Disconnect</button>
          </div>
        </template>
      </div>

      <!-- Strava -->
      <div class="device-card">
        <div class="device-icon">
          <img src="https://upload.wikimedia.org/wikipedia/commons/c/cb/Strava_Logo.svg" alt="Strava" class="brand-logo" />
        </div>
        <h3>Strava</h3>
        <p>Automatically import every run, ride, and swim you log on Strava</p>

        <template v-if="!stravaConnected">
          <button class="btn btn-strava" @click="connectStrava" :disabled="loading">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="flex-shrink:0"><path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169"/></svg>
            Connect Strava
          </button>
        </template>
        <template v-else>
          <div class="connected-state">
            <div class="connected-chip">
              <span class="green-dot"></span>
              CONNECTED
            </div>
            <div class="last-sync-label">Last synced: {{ relativeTime(stravaLastSync) }}</div>
            <button class="btn btn-primary" @click="syncStrava" :disabled="syncing">
              <span v-if="syncing" class="spinner"></span>
              {{ syncing ? 'Syncing…' : 'Sync Now' }}
            </button>
            <button class="btn-disconnect" @click="disconnectStrava">Disconnect</button>
          </div>
        </template>
      </div>

      <!-- Zwift -->
      <div class="device-card">
        <div class="device-icon">🚴</div>
        <h3>Zwift</h3>
        <p>Sync rides and runs from Zwift</p>

        <template v-if="!zwiftConnected">
          <button class="btn btn-primary" @click="connectZwift" :disabled="loading">
            Connect Zwift
          </button>
        </template>
        <template v-else>
          <div class="connected-state">
            <div class="connected-chip">
              <span class="green-dot"></span>
              CONNECTED
            </div>
            <button class="btn btn-outline" @click="disconnectZwift">
              <i class="bi bi-check-circle me-2"></i>Disconnect
            </button>
          </div>
        </template>
      </div>

      <!-- Apple Watch -->
      <div class="device-card">
        <div class="device-icon">⌚</div>
        <h3>Apple Watch</h3>
        <p>Requires the RUNNIT iOS app. Apple Watch syncs automatically once you install and grant HealthKit access.</p>
        <a href="#" class="btn btn-outline">Get iOS App →</a>
      </div>

      <!-- COROS (Coming Soon) -->
      <div class="device-card device-coming-soon">
        <div class="device-icon">⌚</div>
        <h3>COROS</h3>
        <p>Sync workouts from COROS watches</p>
        <div class="coming-soon-badge">COMING SOON</div>
      </div>

      <!-- Wahoo (Coming Soon) -->
      <div class="device-card device-coming-soon">
        <div class="device-icon">🚲</div>
        <h3>Wahoo</h3>
        <p>Sync rides and workouts from Wahoo</p>
        <div class="coming-soon-badge">COMING SOON</div>
      </div>

      <!-- Fitbit (Coming Soon) -->
      <div class="device-card device-coming-soon">
        <div class="device-icon">📊</div>
        <h3>Fitbit</h3>
        <p>Sync steps, runs, and wellness data</p>
        <div class="coming-soon-badge">COMING SOON</div>
      </div>
    </div>

  <ConfirmModal
    v-model="showDisconnectConfirm"
    title="Disconnect Integration"
    :body="`Disconnect ${disconnectLabels[pendingDisconnect] || ''}? New activities will no longer sync automatically.`"
    confirm-label="Disconnect"
    :danger="true"
    @confirm="doDisconnect"
  />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import ConfirmModal from '@/components/ConfirmModal.vue'
import { useToast } from '@/composables/useToast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const garminConnected = ref(false)
const garminLastSync = ref(null)
const stravaConnected = ref(false)
const stravaLastSync = ref(null)
const zwiftConnected = ref(false)
const loading = ref(false)
const syncing = ref(false)
const statusMessage = ref('')
const statusType = ref('success')



const { showToast } = useToast()
const showDisconnectConfirm = ref(false)
const pendingDisconnect = ref(null) // 'garmin' | 'strava' | 'zwift'

const disconnectLabels = { garmin: 'Garmin', strava: 'Strava', zwift: 'Zwift' }

const showStatus = (message, type = 'success') => {
  statusMessage.value = message
  statusType.value = type
  setTimeout(() => { statusMessage.value = '' }, 4000)
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const relativeTime = (iso) => {
  if (!iso) return 'Never'
  const diff = Date.now() - new Date(iso)
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const safeFetch = (url) =>
  axios.get(url, { headers: getAuthHeaders() }).catch(() => null)

const checkConnectionStatus = async () => {
  const [garminRes, stravaRes, zwiftRes] = await Promise.all([
    safeFetch(`${API_URL}/integrations/garmin/status`),
    safeFetch(`${API_URL}/integrations/strava/status`),
    safeFetch(`${API_URL}/integrations/zwift/status`),
  ])
  if (garminRes) {
    garminConnected.value = garminRes.data.connected
    garminLastSync.value = garminRes.data.lastSync || null
  }
  if (stravaRes) {
    stravaConnected.value = stravaRes.data.connected
    stravaLastSync.value = stravaRes.data.lastSync || null
  }
  if (zwiftRes) {
    zwiftConnected.value = zwiftRes.data.connected
  }
}

const connectGarmin = async () => {
  loading.value = true
  try {
    const { data } = await axios.get(`${API_URL}/integrations/garmin/connect`, {
      headers: getAuthHeaders()
    })
    window.location.href = data.authorizationUrl
  } catch {
    showStatus('Failed to connect Garmin. Please try again.', 'error')
  } finally {
    loading.value = false
  }
}

const disconnectGarmin = () => { pendingDisconnect.value = 'garmin'; showDisconnectConfirm.value = true }
const disconnectStrava = () => { pendingDisconnect.value = 'strava'; showDisconnectConfirm.value = true }
const disconnectZwift  = () => { pendingDisconnect.value = 'zwift';  showDisconnectConfirm.value = true }

const doDisconnect = async () => {
  showDisconnectConfirm.value = false
  const service = pendingDisconnect.value
  try {
    await axios.delete(`${API_URL}/integrations/${service}/disconnect`, { headers: getAuthHeaders() })
    if (service === 'garmin') { garminConnected.value = false; garminLastSync.value = null }
    if (service === 'strava') { stravaConnected.value = false; stravaLastSync.value = null }
    if (service === 'zwift')  { zwiftConnected.value  = false }
    showToast(`${disconnectLabels[service]} disconnected.`, 'info')
  } catch {
    showToast(`Failed to disconnect ${disconnectLabels[service]}. Try again.`, 'error')
  }
}

const syncNow = async () => {
  syncing.value = true
  try {
    await axios.post(`${API_URL}/integrations/garmin/sync`, {}, { headers: getAuthHeaders() })
    showStatus('Sync triggered — activities will appear shortly.')
    await checkConnectionStatus()
  } catch {
    showStatus('Sync failed. Please try again.', 'error')
  } finally {
    syncing.value = false
  }
}

const connectStrava = async () => {
  try {
    const { data } = await axios.get(`${API_URL}/integrations/strava/connect`, { headers: getAuthHeaders() })
    window.location.href = data.url
  } catch {
    showStatus('Failed to connect Strava. Please try again.', 'error')
  }
}


const syncStrava = async () => {
  syncing.value = true
  try {
    await axios.post(`${API_URL}/integrations/strava/sync`, {}, { headers: getAuthHeaders() })
    showStatus('Strava sync triggered — activities will appear shortly.')
    await checkConnectionStatus()
  } catch {
    showStatus('Sync failed. Please try again.', 'error')
  } finally {
    syncing.value = false
  }
}

const connectZwift = async () => {
  loading.value = true
  try {
    const { data } = await axios.get(`${API_URL}/integrations/zwift/connect`, {
      headers: getAuthHeaders()
    })
    window.location.href = data.authorizationUrl
  } catch {
    showStatus('Failed to connect Zwift. Please try again.', 'error')
  } finally {
    loading.value = false
  }
}


onMounted(() => {
  checkConnectionStatus()

  const params = new URLSearchParams(window.location.search)
  if (params.get('garmin') === 'connected') {
    garminConnected.value = true
    showStatus('Garmin connected successfully!')
  } else if (params.get('strava') === 'connected') {
    stravaConnected.value = true
    showStatus('Strava connected! Your activities will sync automatically.')
  } else if (params.get('zwift') === 'connected') {
    zwiftConnected.value = true
    showStatus('Zwift connected successfully!')
  } else if (params.get('error')) {
    showStatus('Connection failed. Please try again.', 'error')
  }

  if (params.has('garmin') || params.has('strava') || params.has('zwift') || params.has('error')) {
    history.replaceState({}, '', window.location.pathname)
  }
})
</script>

<style scoped>
.connect-devices {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.connect-devices h2 {
  font-weight: 900;
  font-size: 2rem;
  margin-bottom: 12px;
  letter-spacing: -0.02em;
}

.connect-devices > p {
  color: rgba(15,18,16,0.55);
  margin-bottom: 40px;
  font-size: 0.95rem;
}

/* Status Banner */
.status-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  margin-bottom: 28px;
  border-radius: 0;
  font-size: 0.9rem;
  font-weight: 600;
}

.status-banner.success {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #166534;
}

.status-banner.error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
}

/* Grid */
.devices-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
}

/* Card */
.device-card {
  background: #fff;
  border: 1px solid #E5E5E5;
  border-radius: 0;
  padding: 32px 28px;
  text-align: center;
  box-shadow: none;
  transition: border-color 0.15s;
}

.device-card:hover:not(.device-coming-soon) {
  border-color: #ccc;
}

.device-coming-soon {
  opacity: 0.5;
  pointer-events: none;
}

.device-icon {
  font-size: 3rem;
  margin-bottom: 14px;
  line-height: 1;
}

.device-card h3 {
  font-weight: 900;
  font-size: 1.1rem;
  margin-bottom: 8px;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.device-card p {
  color: rgba(15,18,16,0.55);
  margin-bottom: 24px;
  font-size: 0.85rem;
  line-height: 1.5;
}

/* Buttons */
.btn {
  width: 100%;
  height: 44px;
  border-radius: 0;
  font-weight: 700;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  border: 1px solid;
  text-decoration: none;
  transition: background 0.15s, color 0.15s;
}

.btn-primary {
  background: #0052FF;
  border-color: #0052FF;
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background: #003ECC;
  border-color: #003ECC;
}

.btn-primary:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.btn-outline {
  background: transparent;
  border-color: #E5E5E5;
  color: rgba(15,18,16,0.80);
}

.btn-outline:hover:not(:disabled) {
  background: #f5f5f5;
}

/* Connected state */
.connected-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.connected-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #166534;
}

.green-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #10b981;
  flex-shrink: 0;
}

.last-sync-label {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(15,18,16,0.45);
}

.btn-strava {
  background: #FC4C02;
  border-color: #FC4C02;
  color: #fff;
}
.btn-strava:hover:not(:disabled) {
  background: #e04400;
  border-color: #e04400;
}
.brand-logo {
  width: 80px;
  height: auto;
  object-fit: contain;
}
.device-icon img { display: block; margin: 0 auto; }

.btn-disconnect {
  background: none;
  border: none;
  font-size: 0.75rem;
  text-decoration: underline;
  color: rgba(15,18,16,0.45);
  cursor: pointer;
  padding: 0;
  letter-spacing: 0.04em;
  transition: color 0.15s;
}

.btn-disconnect:hover {
  color: rgba(15,18,16,0.75);
}

/* Spinner */
.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Coming soon badge */
.coming-soon-badge {
  display: inline-block;
  padding: 6px 14px;
  border: 1px solid #E5E5E5;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(15,18,16,0.40);
}
</style>
