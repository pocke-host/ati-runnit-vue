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
      <ConnectDevices />

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
import ConnectDevices from '@/components/ConnectDevices.vue'
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

@media (max-width: 600px) {
  .gcal-integration-card { flex-direction: column; align-items: flex-start; }
  .gcal-integration-btn { width: 100%; text-align: center; }
}
</style>
