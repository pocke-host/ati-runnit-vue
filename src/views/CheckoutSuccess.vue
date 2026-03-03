<!-- src/views/CheckoutSuccess.vue -->
<template>
  <main class="success-page">
    <div class="success-hero">
      <div class="success-inner">
        <div class="success-icon"><i class="bi bi-check-lg"></i></div>
        <p class="success-eyebrow">PAYMENT CONFIRMED</p>
        <h1 class="success-headline">You're in.</h1>
        <p class="success-sub">Welcome to {{ tierLabel }}. Your account has been upgraded.</p>
        <router-link to="/dashboard" class="success-btn">Go to Dashboard →</router-link>
      </div>
    </div>
  </main>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

const authStore = useAuthStore()
const { subscriptionTier } = storeToRefs(authStore)

const tierLabel = computed(() => {
  if (subscriptionTier.value === 'duo') return 'Duo'
  if (subscriptionTier.value === 'premium') return 'Premium'
  return 'Premium'
})

onMounted(async () => {
  try {
    await authStore.fetchCurrentUser()
  } catch {
    // proceed regardless
  }
})
</script>

<style scoped>
.success-page {
  min-height: 100vh;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: Futura, 'Avenir Next', system-ui, sans-serif;
}
.success-hero {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
}
.success-inner {
  text-align: center;
  max-width: 480px;
}
.success-icon {
  width: 72px;
  height: 72px;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: #fff;
  margin: 0 auto 32px;
  border-radius: 0;
}
.success-eyebrow {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  color: rgba(255,255,255,0.55);
  margin-bottom: 12px;
}
.success-headline {
  font-size: 3.5rem;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.02em;
  margin-bottom: 16px;
  line-height: 1;
}
.success-sub {
  font-size: 1rem;
  color: rgba(255,255,255,0.7);
  margin-bottom: 40px;
  line-height: 1.5;
}
.success-btn {
  display: inline-block;
  background: #fff;
  color: #000;
  font-weight: 700;
  font-size: 0.82rem;
  letter-spacing: 0.10em;
  text-transform: uppercase;
  text-decoration: none;
  padding: 14px 32px;
  border-radius: 0;
  transition: background 0.15s;
}
.success-btn:hover { background: #e5e5e5; }
</style>
