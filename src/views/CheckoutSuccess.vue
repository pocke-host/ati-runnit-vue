<template>
  <main class="success-page">

    <div class="success-card">

      <!-- Check icon -->
      <div class="check-wrap">
        <div class="check-circle">
          <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="#FBF6EC" stroke-width="3">
            <path d="M4 13l5 5L20 6"/>
          </svg>
        </div>
      </div>

      <!-- Headline block -->
      <div class="headline-block">
        <span class="badge-sticker">Payment Confirmed</span>
        <h1 class="success-h1">You're in.</h1>
        <p class="success-sub">Welcome to {{ tierLabel }}. Route planning, goal tracking, and pace insights are unlocked.</p>
      </div>

      <!-- Plan detail card -->
      <div class="plan-card">
        <div class="plan-row">
          <span class="plan-label">Plan</span>
          <span class="plan-value">{{ planName }}</span>
        </div>
        <div class="plan-row">
          <span class="plan-label">Billed</span>
          <span class="plan-value plan-value--mono">{{ billingAmount }}</span>
        </div>
        <div class="plan-row plan-row--last">
          <span class="plan-label">Next Charge</span>
          <span class="plan-value plan-value--mono">{{ nextChargeDate }}</span>
        </div>
      </div>

      <!-- CTA -->
      <router-link to="/dashboard" class="btn-dashboard">Go to Dashboard →</router-link>
      <router-link to="/billing" class="btn-receipt">View Receipt</router-link>

    </div>

  </main>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { useHead } from '@unhead/vue'

useHead({ title: 'Payment Confirmed — Runnit' })

const authStore = useAuthStore()
const { subscriptionTier } = storeToRefs(authStore)

onMounted(async () => {
  try { await authStore.fetchCurrentUser() } catch { /* proceed regardless */ }
})

const tierLabel = computed(() => subscriptionTier.value === 'duo' ? 'Elite' : 'Premium')
const planName  = computed(() => subscriptionTier.value === 'duo' ? 'Runnit Elite' : 'Runnit Pro')
const billingAmount = computed(() => subscriptionTier.value === 'duo' ? '$19.00 / mo' : '$9.00 / mo')

const nextChargeDate = computed(() => {
  const d = new Date()
  d.setDate(d.getDate() + 14)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
})
</script>

<style scoped>
@keyframes rkPop {
  0%   { transform: scale(0.4); opacity: 0 }
  60%  { transform: scale(1.08) }
  100% { transform: scale(1);   opacity: 1 }
}
@keyframes rkRise {
  from { opacity: 0; transform: translateY(14px) }
  to   { opacity: 1; transform: translateY(0) }
}

.success-page {
  min-height: 100vh;
  background: #16130F;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
  color: #FBF6EC;
}

.success-card {
  width: 100%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

/* ── Check icon ── */
.check-wrap { animation: rkPop 0.5s cubic-bezier(.34,1.56,.64,1) both; }
.check-circle {
  width: 88px;
  height: 88px;
  background: #2A55F5;
  border: 3px solid #2A55F5;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 5px 5px 0 rgba(251,246,236,0.15);
}

/* ── Headline ── */
.headline-block {
  margin-top: 26px;
  animation: rkRise 0.5s ease-out 0.15s both;
}
.badge-sticker {
  display: inline-block;
  background: #FFC53D;
  color: #16130F;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.66rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  padding: 6px 13px;
  border: 2px solid #16130F;
  transform: rotate(-2deg);
}
.success-h1 {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-weight: 900;
  font-size: 56px;
  line-height: 0.82;
  text-transform: uppercase;
  margin: 18px 0 0;
}
.success-sub {
  font-size: 1rem;
  line-height: 1.55;
  color: rgba(251,246,236,0.68);
  max-width: 300px;
  margin: 16px auto 0;
}

/* ── Plan card ── */
.plan-card {
  border: 2px solid rgba(251,246,236,0.28);
  width: 100%;
  margin-top: 28px;
  animation: rkRise 0.5s ease-out 0.25s both;
}
.plan-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 2px solid rgba(251,246,236,0.2);
}
.plan-row--last { border-bottom: none; }
.plan-label {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(251,246,236,0.55);
}
.plan-value {
  font-weight: 800;
  font-size: 0.9rem;
}
.plan-value--mono {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-weight: 600;
}

/* ── CTAs ── */
.btn-dashboard {
  display: block;
  width: 100%;
  text-align: center;
  background: #2A55F5;
  color: #fff;
  border: 2px solid #FBF6EC;
  border-radius: 999px;
  padding: 16px 0;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-weight: 800;
  font-size: 0.76rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-decoration: none;
  margin-top: 28px;
  box-shadow: 4px 4px 0 rgba(251,246,236,0.25);
  animation: rkRise 0.5s ease-out 0.3s both;
  transition: background 0.15s;
}
.btn-dashboard:hover { background: #1E42D6; color: #fff; text-decoration: none; }

.btn-receipt {
  display: block;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(251,246,236,0.55);
  text-decoration: none;
  margin-top: 16px;
  animation: rkRise 0.5s ease-out 0.35s both;
  transition: color 0.15s;
}
.btn-receipt:hover { color: #FBF6EC; text-decoration: none; }
</style>
