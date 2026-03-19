<template>
  <main class="callback-page">
    <div class="callback-container">
      <div class="logo-circle">R</div>

      <div v-if="error" class="callback-error">
        <p class="error-text">{{ error }}</p>
        <a href="/join-us" class="btn-back">Back to sign in</a>
      </div>

      <div v-else class="callback-loading">
        <div class="spinner"></div>
        <p class="loading-text">Signing you in...</p>
      </div>
    </div>
  </main>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const error = ref('')

onMounted(async () => {
  // Surface any error the backend forwarded (e.g. missing token from Apple)
  if (route.query.error) {
    error.value = 'Sign-in failed. Please try again.'
    return
  }

  try {
    // The httpOnly JWT cookie was already set by the backend redirect.
    // Calling /auth/me with credentials:true picks it up automatically.
    await authStore.fetchCurrentUser()

    const user = authStore.user
    const needsOnboarding = !user?.onboardingComplete
    const homeDash = user?.role === 'coach' ? '/coach/dashboard' : '/dashboard'

    if (needsOnboarding) {
      sessionStorage.setItem('needs_onboarding', 'true')
      router.replace('/onboard')
    } else {
      router.replace(homeDash)
    }
  } catch {
    error.value = 'Could not load your account. Please try signing in again.'
  }
})
</script>

<style scoped>
.callback-page {
  font-family: Futura, "Futura PT", "Futura Std", "Avenir Next", Avenir, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
}

.callback-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
}

.logo-circle {
  width: 56px;
  height: 56px;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 900;
  color: white;
}

.callback-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #E5E5E5;
  border-top-color: #000;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  font-size: 15px;
  color: #6B7280;
  margin: 0;
}

.callback-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
}

.error-text {
  font-size: 15px;
  color: #DC2626;
  margin: 0;
}

.btn-back {
  display: inline-block;
  padding: 12px 24px;
  background: #000;
  color: #fff;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
</style>
