<template>
  <div class="gcal-card">

    <!-- Not configured -->
    <div v-if="notConfigured" class="gcal-row">
      <div class="gcal-left">
        <svg class="gcal-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><rect x="3" y="4" width="18" height="18" rx="0" ry="0"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        <div>
          <div class="gcal-label">GOOGLE CALENDAR</div>
          <div class="gcal-desc">Not configured — add <code>VITE_GOOGLE_CLIENT_ID</code> to enable.</div>
        </div>
      </div>
    </div>

    <!-- Connected state -->
    <div v-else-if="connected" class="gcal-row">
      <div class="gcal-left">
        <span class="gcal-status-dot"></span>
        <div>
          <div class="gcal-label gcal-label--connected">GOOGLE CALENDAR CONNECTED</div>
          <div class="gcal-desc">
            {{ lastSyncDisplay }}
          </div>
        </div>
      </div>
      <div class="gcal-actions">
        <button class="gcal-btn gcal-btn--sync" :disabled="syncing" @click="handleSync">
          <span v-if="syncing" class="gcal-spinner"></span>
          <span v-else>Sync Now</span>
        </button>
        <button class="gcal-disconnect" @click="disconnect" title="Disconnect">×</button>
      </div>
    </div>

    <!-- Disconnected state -->
    <div v-else class="gcal-row">
      <div class="gcal-left">
        <svg class="gcal-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><rect x="3" y="4" width="18" height="18"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        <div>
          <div class="gcal-label">GOOGLE CALENDAR</div>
          <div class="gcal-desc">Sync your planned workouts to Google Calendar automatically.</div>
        </div>
      </div>
      <button class="gcal-btn gcal-btn--connect" @click="connect">Connect →</button>
    </div>

    <!-- Error -->
    <div v-if="error" class="gcal-error">{{ error }}</div>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useGoogleCalendar } from '@/composables/useGoogleCalendar'

const props = defineProps({
  workouts: { type: Array, default: () => [] }
})

const { connected, syncing, error, lastSync, connect, disconnect, syncAll } = useGoogleCalendar()

const notConfigured = computed(() => !import.meta.env.VITE_GOOGLE_CLIENT_ID)

const lastSyncDisplay = computed(() => {
  if (!lastSync.value) return 'Never synced — click Sync Now to push workouts.'
  const d = new Date(lastSync.value)
  const diff = Date.now() - d.getTime()
  if (diff < 60000) return 'Last synced: just now'
  if (diff < 3600000) return `Last synced: ${Math.floor(diff / 60000)}m ago`
  return `Last synced: ${d.toLocaleDateString()}`
})

function handleSync() {
  syncAll(props.workouts)
}
</script>

<style scoped>
.gcal-card {
  border: 2px solid #16130F;
  background: #fff;
  padding: 18px 22px;
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
}

.gcal-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.gcal-left {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
  min-width: 0;
}

.gcal-icon {
  flex-shrink: 0;
  color: #5A5348;
}

.gcal-status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #2A55F5;
  flex-shrink: 0;
  box-shadow: 0 0 0 3px rgba(42, 85, 245, 0.18);
}

.gcal-label {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #5A5348;
}

.gcal-label--connected { color: #2A55F5; }

.gcal-desc {
  font-size: 0.85rem;
  color: #5A5348;
  margin-top: 3px;
  line-height: 1.4;
}

.gcal-desc code {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.78rem;
  background: #F1EADC;
  padding: 1px 5px;
  border: 1px solid #E7DFCE;
}

.gcal-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.gcal-btn {
  border: 2px solid #16130F;
  border-radius: 999px;
  padding: 8px 18px;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background 0.15s;
  white-space: nowrap;
}

.gcal-btn--connect {
  background: #2A55F5;
  color: #fff;
  box-shadow: 3px 3px 0 #16130F;
}
.gcal-btn--connect:hover { background: #1E42D6; }

.gcal-btn--sync {
  background: #2A55F5;
  color: #fff;
  box-shadow: 3px 3px 0 #16130F;
  min-width: 90px;
  justify-content: center;
}
.gcal-btn--sync:hover:not(:disabled) { background: #1E42D6; }
.gcal-btn--sync:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }

.gcal-disconnect {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  color: #8A8A8A;
  padding: 4px 6px;
  line-height: 1;
  transition: color 0.15s;
}
.gcal-disconnect:hover { color: #C0392B; }

.gcal-spinner {
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: gcalSpin 0.7s linear infinite;
}
@keyframes gcalSpin { to { transform: rotate(360deg); } }

.gcal-error {
  margin-top: 12px;
  border: 2px solid #C0392B;
  background: rgba(192, 57, 43, 0.06);
  color: #C0392B;
  padding: 10px 14px;
  font-size: 0.85rem;
  font-weight: 600;
}

@media (max-width: 600px) {
  .gcal-row { flex-direction: column; align-items: flex-start; }
  .gcal-actions { width: 100%; }
  .gcal-btn { flex: 1; justify-content: center; }
}
</style>
