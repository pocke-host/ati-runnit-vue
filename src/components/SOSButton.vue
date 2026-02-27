<!-- SOSButton.vue — overlays during a live tracking session -->
<template>
  <div class="sos-container">
    <!-- SOS Triggered Overlay -->
    <div v-if="safetyStore.sosTriggered" class="sos-active-overlay">
      <div class="sos-active-card">
        <div class="sos-pulse-icon"><i class="bi bi-exclamation-triangle-fill"></i></div>
        <h3>SOS Sent</h3>
        <p>Your emergency contacts and location have been notified.</p>
        <button class="btn-cancel-sos" @click="cancelSOS">Cancel SOS</button>
      </div>
    </div>

    <!-- SOS Button -->
    <button
      v-else
      :class="['sos-btn', { confirming: confirming }]"
      @click="handleSOSClick"
    >
      <i class="bi bi-exclamation-circle-fill"></i>
      <span>{{ confirming ? `SOS (${countdown}s)` : 'SOS' }}</span>
    </button>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'
import { useSafetyStore } from '@/stores/safety'

const safetyStore = useSafetyStore()

const confirming = ref(false)
const countdown = ref(5)
let countdownTimer = null

const handleSOSClick = () => {
  if (!confirming.value) {
    confirming.value = true
    countdown.value = 5
    countdownTimer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(countdownTimer)
        confirming.value = false
        safetyStore.triggerSOS()
      }
    }, 1000)
  } else {
    // Second tap = cancel countdown
    clearInterval(countdownTimer)
    confirming.value = false
    countdown.value = 5
  }
}

const cancelSOS = async () => {
  await safetyStore.cancelSOS()
}

onUnmounted(() => {
  if (countdownTimer) clearInterval(countdownTimer)
})
</script>

<style scoped>
.sos-container { position: relative; }

.sos-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ef4444, #b91c1c);
  border: 3px solid rgba(255,255,255,.25);
  color: white;
  font-size: .65rem;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(239,68,68,.5);
  transition: all .2s;
  letter-spacing: .06em;
}
.sos-btn i { font-size: 1.2rem; }
.sos-btn.confirming {
  animation: sos-pulse 0.5s infinite;
  background: linear-gradient(135deg, #dc2626, #991b1b);
  border-color: rgba(255,255,255,.5);
}
@keyframes sos-pulse {
  0%, 100% { transform: scale(1); box-shadow: 0 4px 20px rgba(239,68,68,.5); }
  50% { transform: scale(1.06); box-shadow: 0 6px 28px rgba(239,68,68,.8); }
}

.sos-active-overlay {
  position: fixed;
  inset: 0;
  background: rgba(185,28,28,.92);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.sos-active-card {
  background: white;
  border-radius: 24px;
  padding: 40px 32px;
  text-align: center;
  max-width: 320px;
  width: 100%;
}
.sos-pulse-icon {
  font-size: 3rem;
  color: #ef4444;
  margin-bottom: 16px;
  animation: sos-pulse 1s infinite;
}
.sos-active-card h3 { font-weight: 900; font-size: 1.5rem; margin-bottom: 10px; }
.sos-active-card p { color: #6b7280; margin-bottom: 24px; }
.btn-cancel-sos {
  background: rgba(15,18,16,.08);
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  font-weight: 800;
  cursor: pointer;
  color: #374151;
}
</style>
