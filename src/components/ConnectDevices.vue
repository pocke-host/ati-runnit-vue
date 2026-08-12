<!-- ========== ConnectDevices.vue ========== -->
<template>
  <div class="connect-devices">
    <!-- Status Banner -->
    <div v-if="statusMessage" :class="['status-banner', statusType]">
      <i :class="statusType === 'success' ? 'bi bi-check-circle-fill' : 'bi bi-exclamation-circle-fill'"></i>
      {{ statusMessage }}
    </div>

    <div class="devices-grid">
      <!-- Garmin -->
      <div class="device-card">
        <div class="device-icon-circle">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
        </div>
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
            <div v-if="syncCounts.garmin" class="sync-count">{{ syncCounts.garmin }} activities synced</div>
            <button class="btn btn-primary" @click="syncNow" :disabled="syncing">
              <span v-if="syncing" class="spinner"></span>
              {{ syncing ? 'Syncing…' : 'Sync Now' }}
            </button>
            <button class="btn-disconnect" @click="disconnectGarmin">Disconnect</button>
          </div>
        </template>
      </div>

      <!-- Apple Health -->
      <div class="device-card">
        <div class="device-icon-circle">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 5.5-7 10-7 10Z"/></svg>
        </div>
        <h3>Apple Health</h3>

        <template v-if="appleHealthAvailable">
          <p>Sync runs, rides, and more straight from HealthKit</p>
          <template v-if="!appleHealthConnected">
            <button class="btn btn-primary" @click="connectAppleHealth" :disabled="appleHealthConnecting">
              <span v-if="appleHealthConnecting" class="spinner"></span>
              {{ appleHealthConnecting ? 'Connecting…' : 'Connect Apple Health' }}
            </button>
          </template>
          <template v-else>
            <div class="connected-state">
              <div class="connected-chip">
                <span class="green-dot"></span>
                CONNECTED
              </div>
              <div class="last-sync-label">
                Last synced: {{ relativeTime(appleHealthLastSync) }}
              </div>
              <div v-if="syncCounts.appleHealth" class="sync-count">{{ syncCounts.appleHealth }} activities synced</div>
              <button class="btn btn-primary" @click="syncAppleHealth" :disabled="appleHealthSyncing">
                <span v-if="appleHealthSyncing" class="spinner"></span>
                {{ appleHealthSyncing ? 'Syncing…' : 'Sync Now' }}
              </button>
              <button class="btn-disconnect" @click="disconnectAppleHealth">Disconnect</button>
            </div>
          </template>
        </template>
        <template v-else>
          <p>On iPhone: open the RUNNIT app and grant HealthKit access for automatic sync. On web: import a GPX file.</p>
          <div class="apple-actions">
            <label class="btn btn-primary gpx-import-label" :class="{ disabled: gpxImporting }">
              <span v-if="gpxImporting" class="spinner spinner-sm me-1"></span>
              <i v-else class="bi bi-upload me-2"></i>
              Import GPX
              <input type="file" accept=".gpx,.fit,.tcx" class="gpx-file-input" @change="importGpx" :disabled="gpxImporting" />
            </label>
          </div>
        </template>
      </div>

      <!-- COROS -->
      <div class="device-card">
        <div class="device-icon-circle">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v4l2.5 2.5"/></svg>
        </div>
        <h3>COROS</h3>
        <p>Sync runs, rides, and swims from your COROS watch</p>

        <template v-if="!corosConnected">
          <button class="btn btn-primary" @click="connectCoros" :disabled="loading">
            Connect COROS
          </button>
        </template>
        <template v-else>
          <div class="connected-state">
            <div class="connected-chip">
              <span class="green-dot"></span>
              CONNECTED
            </div>
            <div class="last-sync-label">
              Last synced: {{ relativeTime(corosLastSync) }}
            </div>
            <div v-if="syncCounts.coros" class="sync-count">{{ syncCounts.coros }} activities synced</div>
            <button class="btn btn-primary" @click="syncCoros" :disabled="syncing">
              <span v-if="syncing" class="spinner"></span>
              {{ syncing ? 'Syncing…' : 'Sync Now' }}
            </button>
            <button class="btn-disconnect" @click="disconnectCoros">Disconnect</button>
          </div>
        </template>
      </div>

      <!-- WHOOP -->
      <div class="device-card">
        <div class="device-icon-circle">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/></svg>
        </div>
        <h3>WHOOP</h3>
        <p>Sync workouts and strain data from your WHOOP band</p>

        <template v-if="!whoopConnected">
          <button class="btn btn-primary" @click="connectWhoop" :disabled="loading">
            Connect WHOOP
          </button>
        </template>
        <template v-else>
          <div class="connected-state">
            <div class="connected-chip">
              <span class="green-dot"></span>
              CONNECTED
            </div>
            <div class="last-sync-label">
              Last synced: {{ relativeTime(whoopLastSync) }}
            </div>
            <div v-if="syncCounts.whoop" class="sync-count">{{ syncCounts.whoop }} activities synced</div>
            <button class="btn btn-primary" @click="syncWhoop" :disabled="syncing">
              <span v-if="syncing" class="spinner"></span>
              {{ syncing ? 'Syncing…' : 'Sync Now' }}
            </button>
            <button class="btn-disconnect" @click="resyncWhoop" :disabled="resyncingWhoop">
              {{ resyncingWhoop ? 'Fixing dates…' : 'Activities showing wrong dates? Fix now' }}
            </button>
            <button class="btn-disconnect" @click="disconnectWhoop">Disconnect</button>
          </div>
        </template>
      </div>

      <!-- Fitbit (Coming Soon) -->
      <div class="device-card device-coming-soon">
        <div class="device-icon-circle">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>
        </div>
        <h3>Fitbit</h3>
        <p>Sync steps, runs, and wellness data</p>
        <div class="coming-soon-badge">COMING SOON</div>
      </div>
    </div>

  <ConfirmModal
    v-model="showDisconnectConfirm"
    title="Disconnect Integration"
    :body="`Disconnect ${disconnectLabels[pendingDisconnect] || ''}? Nothing new syncs in until you reconnect.`"
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
import { useAppleHealth } from '@/composables/useAppleHealth'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const garminConnected = ref(false)
const garminLastSync = ref(null)
const corosConnected = ref(false)
const corosLastSync = ref(null)
const whoopConnected = ref(false)
const whoopLastSync = ref(null)
const loading = ref(false)
const syncing = ref(false)
const gpxImporting = ref(false)
const statusMessage = ref('')
const statusType = ref('success')
const syncCounts = ref({ garmin: 0, coros: 0, whoop: 0, appleHealth: 0 })

const { showToast } = useToast()
const showDisconnectConfirm = ref(false)
const pendingDisconnect = ref(null) // 'garmin' | 'coros' | 'whoop' | 'appleHealth'

const disconnectLabels = { garmin: 'Garmin', coros: 'COROS', whoop: 'WHOOP', appleHealth: 'Apple Health' }

const appleHealth = useAppleHealth()
const appleHealthAvailable = appleHealth.isAvailable
const appleHealthConnected = ref(false)
const appleHealthLastSync = ref(null)
const appleHealthConnecting = ref(false)
const appleHealthSyncing = ref(false)

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
  const [garminRes, corosRes, whoopRes, appleHealthRes, countsRes] = await Promise.all([
    safeFetch(`${API_URL}/integrations/garmin/status`),
    safeFetch(`${API_URL}/integrations/coros/status`),
    safeFetch(`${API_URL}/integrations/whoop/status`),
    safeFetch(`${API_URL}/integrations/apple-health/status`),
    safeFetch(`${API_URL}/integrations/sync-counts`),
  ])
  if (garminRes) {
    garminConnected.value = garminRes.data.connected
    garminLastSync.value = garminRes.data.lastSync || null
  }
  if (corosRes) {
    corosConnected.value = corosRes.data.connected
    corosLastSync.value = corosRes.data.lastSync || null
  }
  if (whoopRes) {
    whoopConnected.value = whoopRes.data.connected
    whoopLastSync.value = whoopRes.data.lastSync || null
  }
  if (appleHealthRes) {
    appleHealthConnected.value = appleHealthRes.data.connected
    appleHealthLastSync.value = appleHealthRes.data.lastSync || null
  }
  if (countsRes?.data) syncCounts.value = countsRes.data
}

const connectGarmin = async () => {
  loading.value = true
  try {
    const { data } = await axios.get(`${API_URL}/integrations/garmin/connect`, {
      headers: getAuthHeaders()
    })
    window.location.href = data.authorizationUrl
  } catch {
    showStatus("Couldn't connect Garmin. Try again.", 'error')
  } finally {
    loading.value = false
  }
}

const disconnectGarmin = () => { pendingDisconnect.value = 'garmin'; showDisconnectConfirm.value = true }
const disconnectCoros  = () => { pendingDisconnect.value = 'coros';  showDisconnectConfirm.value = true }
const disconnectWhoop  = () => { pendingDisconnect.value = 'whoop';  showDisconnectConfirm.value = true }
const disconnectAppleHealth = () => { pendingDisconnect.value = 'appleHealth'; showDisconnectConfirm.value = true }

const doDisconnect = async () => {
  showDisconnectConfirm.value = false
  const service = pendingDisconnect.value
  try {
    if (service === 'appleHealth') {
      await appleHealth.disconnect()
    } else {
      await axios.delete(`${API_URL}/integrations/${service}/disconnect`, { headers: getAuthHeaders() })
    }
    if (service === 'garmin')      { garminConnected.value      = false; garminLastSync.value      = null }
    if (service === 'coros')       { corosConnected.value       = false; corosLastSync.value       = null }
    if (service === 'whoop')       { whoopConnected.value       = false; whoopLastSync.value       = null }
    if (service === 'appleHealth') { appleHealthConnected.value = false; appleHealthLastSync.value = null }
    showToast(`${disconnectLabels[service]} disconnected.`, 'info')
  } catch {
    showToast(`Couldn't disconnect ${disconnectLabels[service]}. Try again.`, 'error')
  }
}

const syncNow = async () => {
  syncing.value = true
  try {
    await axios.post(`${API_URL}/integrations/garmin/sync`, {}, { headers: getAuthHeaders() })
    showStatus('Sync triggered — activities will appear shortly.')
    await checkConnectionStatus()
  } catch {
    showStatus("Sync didn't take. Try again.", 'error')
  } finally {
    syncing.value = false
  }
}

const connectCoros = async () => {
  loading.value = true
  try {
    const { data } = await axios.get(`${API_URL}/integrations/coros/connect`, { headers: getAuthHeaders() })
    window.location.href = data.url
  } catch {
    showStatus("Couldn't connect COROS. Try again.", 'error')
  } finally {
    loading.value = false
  }
}

const syncCoros = async () => {
  syncing.value = true
  try {
    await axios.post(`${API_URL}/integrations/coros/sync`, {}, { headers: getAuthHeaders() })
    showStatus('COROS sync triggered — activities will appear shortly.')
    await checkConnectionStatus()
  } catch {
    showStatus("Sync didn't take. Try again.", 'error')
  } finally {
    syncing.value = false
  }
}


const connectWhoop = async () => {
  loading.value = true
  try {
    const { data } = await axios.get(`${API_URL}/integrations/whoop/connect`, { headers: getAuthHeaders() })
    window.location.href = data.url
  } catch {
    showStatus("Couldn't connect WHOOP. Try again.", 'error')
  } finally {
    loading.value = false
  }
}

const syncWhoop = async () => {
  syncing.value = true
  try {
    await axios.post(`${API_URL}/integrations/whoop/sync`, {}, { headers: getAuthHeaders() })
    showStatus('WHOOP sync triggered — activities will appear shortly.')
    await checkConnectionStatus()
  } catch {
    showStatus("Sync didn't take. Try again.", 'error')
  } finally {
    syncing.value = false
  }
}

const resyncingWhoop = ref(false)
const resyncWhoop = async () => {
  resyncingWhoop.value = true
  try {
    const { data } = await axios.post(`${API_URL}/integrations/whoop/resync`, {}, { headers: getAuthHeaders() })
    showStatus(`Fixed — removed ${data.deleted} activities with wrong dates and re-imported ${data.imported} with the correct ones.`)
    await checkConnectionStatus()
  } catch {
    showStatus("Couldn't fix those dates. Try again.", 'error')
  } finally {
    resyncingWhoop.value = false
  }
}

const connectAppleHealth = async () => {
  appleHealthConnecting.value = true
  try {
    await appleHealth.connect()
    appleHealthConnected.value = true
    showStatus('Apple Health connected! Syncing your workouts…')
    await syncAppleHealth()
  } catch {
    showStatus("Couldn't connect Apple Health. Try again.", 'error')
  } finally {
    appleHealthConnecting.value = false
  }
}

const syncAppleHealth = async () => {
  appleHealthSyncing.value = true
  try {
    const { imported } = await appleHealth.sync()
    showStatus(`Apple Health sync complete — ${imported} activities synced.`)
    await checkConnectionStatus()
  } catch {
    showStatus("Sync didn't take. Try again.", 'error')
  } finally {
    appleHealthSyncing.value = false
  }
}

const importGpx = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  gpxImporting.value = true
  try {
    const form = new FormData()
    form.append('file', file)
    await axios.post(`${API_URL}/activities/import/gpx`, form, {
      headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' }
    })
    showStatus(`${file.name} imported! Activity will appear shortly.`)
  } catch {
    showStatus('Import failed. Make sure the file is a valid GPX/FIT/TCX.', 'error')
  } finally {
    gpxImporting.value = false
    e.target.value = ''
  }
}

onMounted(() => {
  checkConnectionStatus()

  const params = new URLSearchParams(window.location.search)
  if (params.get('garmin') === 'connected') {
    garminConnected.value = true
    showStatus("Garmin's in.")
  } else if (params.get('coros') === 'connected') {
    corosConnected.value = true
    showStatus('COROS connected! Your workouts will sync automatically.')
  } else if (params.get('whoop') === 'connected') {
    whoopConnected.value = true
    showStatus('WHOOP connected! Your workouts will sync automatically.')
  } else if (params.get('error')) {
    showStatus("That connection didn't go through. Try again.", 'error')
  }

  if (params.has('garmin') || params.has('coros') || params.has('whoop') || params.has('error')) {
    history.replaceState({}, '', window.location.pathname)
  }
})
</script>

<style scoped>
.connect-devices {
  max-width: 1200px;
  margin: 0 auto;
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
  border: 2px solid #16130F;
  border-radius: 0;
  padding: 20px;
  text-align: center;
}

.device-coming-soon {
  opacity: 0.45;
  pointer-events: none;
}

.device-icon-circle {
  width: 44px;
  height: 44px;
  border-radius: 999px;
  background: #16130F;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
}

.device-card h3 {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-weight: 800;
  font-size: 1.5rem;
  text-transform: uppercase;
  margin: 0 0 8px;
  color: #16130F;
  line-height: 1;
}

.device-card p {
  color: #5a5348;
  margin: 0 0 16px;
  font-size: 0.82rem;
  line-height: 1.4;
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
  background: #2A55F5;
  border-color: #16130F;
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background: #1E42D6;
}

.btn-primary:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.btn-outline {
  background: #fff;
  border-color: #16130F;
  color: #16130F;
}

.btn-outline:hover:not(:disabled) {
  background: rgba(22,19,15,0.05);
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
  border: 2px solid #E7DFCE;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(15,18,16,0.40);
}

/* Sync count */
.sync-count { font-size: 0.75rem; color: #767676; margin-bottom: 8px; }

/* Apple Health GPX import */
.apple-actions { display: flex; flex-direction: column; gap: 8px; }
.gpx-import-label { cursor: pointer; position: relative; display: inline-flex; align-items: center; }
.gpx-file-input { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; }
.gpx-import-label.disabled { opacity: 0.6; cursor: not-allowed; }
.spinner-sm { width: 0.8rem; height: 0.8rem; border-width: 2px; }
</style>
