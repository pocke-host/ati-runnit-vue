<!-- ========== views/Devices.vue ========== -->
<template>
  <div class="devices-page">
    <div class="devices-wrap">
      <div class="devices-header">
        <button class="btn-back" @click="$router.back()" aria-label="Go back">←</button>
        <div>
          <div class="devices-kicker">Account</div>
          <h1 class="devices-title">Devices &amp; Integrations</h1>
        </div>
      </div>
      <div class="integrations-intro"><div><div class="devices-kicker">Connected services</div><h2>Bring your training together.</h2></div><p>Connect the tools you already use. RUNNIT keeps the links here so you can see what is active and reconnect when needed.</p></div>
      <ConnectDevices />

      <div class="spotify-integration-card">
        <div class="spotify-integration-left">
          <div class="spotify-mark"><i class="bi bi-spotify"></i></div>
          <div>
            <div class="gcal-integration-name">Spotify — Listening history</div>
            <div class="gcal-integration-desc">Connect once and RUNNIT will suggest what you listened to during each run.</div>
            <div :class="['spotify-connected', { 'spotify-connected--off': !spotifyConnected }]" ><span></span> {{ spotifyConnected ? 'CONNECTED' : 'NOT CONNECTED' }}</div>
          </div>
        </div>
        <button class="gcal-integration-btn" type="button" @click="connectSpotify" :disabled="spotifyLoading">
          {{ spotifyConnected ? 'Reconnect →' : 'Connect →' }}
        </button>
      </div>
      <p v-if="spotifyError" class="integration-error" role="alert">{{ spotifyError }}</p>

      <!-- Google Calendar integration card -->
      <div class="gcal-integration-card">
        <div class="gcal-integration-left">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22" style="flex-shrink:0;color:#2A55F5"><rect x="3" y="4" width="18" height="18"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <div>
            <div class="gcal-integration-name">Google Calendar</div>
            <div class="gcal-integration-desc">Sync your planned workouts to Google Calendar automatically.</div>
          </div>
        </div>
        <router-link to="/calendar/sync" class="gcal-integration-btn">Set Up →</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import axios from 'axios'
import ConnectDevices from '@/components/ConnectDevices.vue'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
const spotifyConnected = ref(false)
const spotifyLoading = ref(false)
const spotifyError = ref('')
const headers = () => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}
const connectSpotify = async () => {
  spotifyLoading.value = true
  spotifyError.value = ''
  try {
    const { data } = await axios.get(`${API_URL}/spotify/connect`, { headers: headers() })
    window.location.href = data.url
  } catch (e) { spotifyError.value = e.response?.data?.error || 'Spotify connection is unavailable right now. Try again shortly.'; spotifyLoading.value = false }
}
onMounted(async () => {
  try { spotifyConnected.value = (await axios.get(`${API_URL}/spotify/status`, { headers: headers() })).data.connected } catch {}
})
</script>

<style scoped>
.devices-page {
  min-height: 100vh;
  background: #FBF6EC;
  padding-top: var(--page-top);
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
  color: #16130F;
}

.devices-wrap {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 24px 80px;
}

.devices-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 36px;
}

.btn-back {
  width: 38px;
  height: 38px;
  border: 2px solid #16130F;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 800;
  color: #16130F;
  border-radius: 0;
  transition: background 0.15s;
  flex-shrink: 0;
}
.btn-back:hover { background: rgba(22,19,15,0.06); }

.devices-kicker {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #2A55F5;
  margin-bottom: 4px;
}

.devices-title {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-weight: 900;
  font-size: clamp(1.8rem, 6vw, 2.6rem);
  line-height: 0.85;
  text-transform: uppercase;
  margin: 0;
  color: #16130F;
}
.integrations-intro { display:flex; justify-content:space-between; align-items:end; gap:24px; margin:0 0 18px; padding:18px 0; border-top:1px solid #ddd4c5; border-bottom:1px solid #ddd4c5; }
.integrations-intro h2 { margin:6px 0 0; font-size:1.3rem; }
.integrations-intro p { max-width:420px; margin:0; color:#665f55; font-size:.84rem; line-height:1.5; }

@media (max-width: 640px) {
  .devices-wrap { padding: 28px 18px 80px; }
}

.gcal-integration-card {
  margin-top: 24px;
  border: 2px solid #16130F;
  background: #fff;
  padding: 18px 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
}

.gcal-integration-left {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
  min-width: 0;
}

.gcal-integration-name {
  font-weight: 800;
  font-size: 0.95rem;
  color: #16130F;
  margin-bottom: 2px;
}

.gcal-integration-desc {
  font-size: 0.82rem;
  color: #5A5348;
  line-height: 1.4;
}

.gcal-integration-btn {
  border: 2px solid #16130F;
  border-radius: 999px;
  padding: 8px 18px;
  background: #2A55F5;
  color: #fff;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-decoration: none;
  white-space: nowrap;
  box-shadow: 3px 3px 0 #16130F;
  transition: background 0.15s;
  flex-shrink: 0;
}
.gcal-integration-btn:hover { background: #1E42D6; text-decoration: none; color: #fff; }
.spotify-integration-card { display:flex; align-items:center; justify-content:space-between; gap:18px; margin-top:16px; padding:18px 20px; border:2px solid #16130F; background:#fff; box-shadow:4px 4px #16130F; }
.spotify-integration-left { display:flex; align-items:center; gap:12px; }
.spotify-mark { width:34px; height:34px; display:grid; place-items:center; border-radius:50%; background:#1DB954; color:#fff; font-size:20px; }
.spotify-connected { margin-top:6px; color:#16883f; font:10px 'Spline Sans Mono', monospace; letter-spacing:.08em; }
.spotify-connected--off { color:#8a8174; }
.spotify-connected--off span { background:#8a8174; }
.spotify-connected span { display:inline-block; width:6px; height:6px; border-radius:50%; background:#1DB954; margin-right:4px; }
.integration-error { margin:8px 0 0; color:#b42318; font-size:.8rem; }

@media (max-width: 600px) {
  .integrations-intro { align-items:flex-start; flex-direction:column; gap:8px; }
  .gcal-integration-card { flex-direction: column; align-items: flex-start; }
  .gcal-integration-btn { width: 100%; text-align: center; }
  .spotify-integration-card { align-items:flex-start; flex-direction:column; }
  .spotify-integration-card .gcal-integration-btn { width:100%; }
}
</style>
