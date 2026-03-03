<!-- src/views/Billing.vue -->
<template>
  <main class="billing-page">
    <div class="billing-wrap">
      <div class="billing-header">
        <router-link to="/dashboard" class="billing-back">
          <i class="bi bi-arrow-left me-2"></i>Back to Dashboard
        </router-link>
        <h1 class="billing-title">Subscription</h1>
      </div>

      <div class="billing-card">
        <div class="billing-section">
          <div class="billing-label">CURRENT PLAN</div>
          <div class="billing-tier-row">
            <span class="tier-pill" :class="tierClass">{{ tierLabel }}</span>
            <span v-if="subscriptionStatus" class="billing-status">{{ subscriptionStatus }}</span>
          </div>
        </div>

        <div class="billing-divider"></div>

        <div class="billing-section">
          <p class="billing-desc">
            <template v-if="subscriptionTier === 'free'">
              You're on the free plan. Upgrade to unlock route planning, pace insights, and safety tools.
            </template>
            <template v-else>
              Thank you for being a {{ tierLabel }} member. Manage your billing, update payment methods, or cancel anytime through the Stripe portal.
            </template>
          </p>

          <div v-if="subscriptionTier === 'free'" class="billing-actions">
            <router-link to="/subscribe" class="btn-billing-primary">See Premium Plans →</router-link>
          </div>

          <div v-else class="billing-actions">
            <button class="btn-billing-primary" @click="handlePortal" :disabled="portalLoading">
              <span v-if="portalLoading" class="btn-spinner"></span>
              <span v-else>Manage Billing →</span>
            </button>
            <p v-if="portalError" class="billing-error">{{ portalError }}</p>
          </div>
        </div>
      </div>

      <div class="billing-footer">
        <router-link to="/dashboard" class="billing-link">← Dashboard</router-link>
        <router-link to="/subscribe" class="billing-link">View Plans</router-link>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useStripe } from '@/composables/useStripe'
import { storeToRefs } from 'pinia'

const authStore = useAuthStore()
const { subscriptionTier, subscriptionStatus } = storeToRefs(authStore)
const { openBillingPortal } = useStripe()

const portalLoading = ref(false)
const portalError = ref('')

const tierLabel = computed(() => {
  if (subscriptionTier.value === 'duo') return 'Duo'
  if (subscriptionTier.value === 'premium') return 'Premium'
  return 'Free'
})

const tierClass = computed(() => `tier-${subscriptionTier.value}`)

const handlePortal = async () => {
  portalLoading.value = true
  portalError.value = ''
  try {
    await openBillingPortal()
  } catch {
    portalError.value = 'Unable to open billing portal. Please try again.'
  } finally {
    portalLoading.value = false
  }
}
</script>

<style scoped>
.billing-page {
  min-height: 100vh;
  background: #fff;
  padding-top: var(--nav-h, 64px);
  font-family: Futura, 'Avenir Next', system-ui, sans-serif;
}
.billing-wrap {
  max-width: 560px;
  margin: 0 auto;
  padding: 48px 24px;
}
.billing-header {
  margin-bottom: 32px;
}
.billing-back {
  display: inline-flex;
  align-items: center;
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #767676;
  text-decoration: none;
  margin-bottom: 20px;
  transition: color 0.15s;
}
.billing-back:hover { color: #000; }
.billing-title {
  font-size: 2rem;
  font-weight: 800;
  color: #000;
  margin: 0;
  letter-spacing: -0.01em;
}

.billing-card {
  border: 1px solid #E5E5E5;
  border-radius: 0;
}
.billing-section { padding: 28px 28px; }
.billing-label {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  color: #767676;
  margin-bottom: 12px;
}
.billing-tier-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.tier-pill {
  display: inline-block;
  padding: 6px 14px;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.10em;
  text-transform: uppercase;
  border-radius: 0;
}
.tier-free { background: #f5f5f5; color: #767676; border: 1px solid #E5E5E5; }
.tier-premium { background: #000; color: #fff; }
.tier-duo { background: #000; color: #fff; }
.billing-status {
  font-size: 0.78rem;
  color: #767676;
  text-transform: capitalize;
}
.billing-divider { border: none; border-top: 1px solid #E5E5E5; }
.billing-desc {
  font-size: 0.9rem;
  color: #767676;
  line-height: 1.6;
  margin-bottom: 24px;
}
.billing-actions { display: flex; flex-direction: column; gap: 12px; }

.btn-billing-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #000;
  color: #fff;
  font-weight: 700;
  font-size: 0.82rem;
  letter-spacing: 0.10em;
  text-transform: uppercase;
  text-decoration: none;
  padding: 14px 28px;
  border-radius: 0;
  border: none;
  cursor: pointer;
  transition: background 0.15s;
  width: fit-content;
  min-width: 200px;
}
.btn-billing-primary:hover:not(:disabled) { background: #333; }
.btn-billing-primary:disabled { background: #E5E5E5; color: #767676; cursor: not-allowed; }

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: inline-block;
}
@keyframes spin { to { transform: rotate(360deg); } }

.billing-error {
  font-size: 0.82rem;
  color: #ef4444;
  margin: 0;
}

.billing-footer {
  display: flex;
  gap: 24px;
  margin-top: 24px;
}
.billing-link {
  font-size: 0.82rem;
  color: #767676;
  text-decoration: none;
  transition: color 0.15s;
}
.billing-link:hover { color: #000; }
.me-2 { margin-right: 8px; }
</style>
