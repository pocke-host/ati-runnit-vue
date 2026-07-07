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
</style>
