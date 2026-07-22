<template>
  <div class="join-page">
    <div class="join-card">

      <div v-if="loading" class="join-state">
        <div class="spinner-border" role="status"></div>
      </div>

      <div v-else-if="notFound" class="join-state">
        <div class="join-kicker">INVITE LINK</div>
        <h1 class="join-title">Link not found</h1>
        <p class="join-body">This invite link doesn't exist or has expired. Ask your coach to send you a fresh one.</p>
        <router-link to="/" class="btn-join-secondary">Back to Runnit</router-link>
      </div>

      <div v-else-if="joined" class="join-state">
        <div class="join-kicker">YOU'RE IN</div>
        <h1 class="join-title">Training with {{ coach.displayName }}.</h1>
        <p class="join-body">You're on their roster now — they can see your training and assign you plans.</p>
        <router-link to="/dashboard" class="btn-join-primary">Go to my dashboard</router-link>
      </div>

      <div v-else class="join-state">
        <div class="join-kicker">COACH INVITE</div>
        <h1 class="join-title">Join {{ coach.displayName }}'s roster.</h1>
        <p class="join-body">You'll show up on their athlete list instantly — no request, no waiting for approval.</p>

        <p v-if="errorMsg" class="join-error">{{ errorMsg }}</p>

        <template v-if="isAuthenticated">
          <button class="btn-join-primary" @click="accept" :disabled="accepting">
            <span v-if="accepting" class="spinner-border spinner-border-sm me-2"></span>
            Join {{ coach.displayName }}'s roster
          </button>
        </template>
        <template v-else>
          <div class="join-actions">
            <router-link to="/signup" class="btn-join-primary" @click="rememberInvite">Sign up to join</router-link>
            <router-link to="/signin" class="btn-join-secondary" @click="rememberInvite">Already have an account? Sign in</router-link>
          </div>
        </template>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { isAuthenticated } = storeToRefs(authStore)
const { showToast } = useToast()

const code = route.params.code

const loading = ref(true)
const notFound = ref(false)
const joined = ref(false)
const accepting = ref(false)
const errorMsg = ref('')
const coach = ref({})

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function rememberInvite() {
  sessionStorage.setItem('pending_coach_invite', code)
}

async function accept() {
  accepting.value = true
  errorMsg.value = ''
  try {
    const { data } = await axios.post(`${API}/coach/invite/${code}/accept`, {}, { headers: getAuthHeaders() })
    coach.value = data.coach
    joined.value = true
    showToast(`You're now training with ${data.coach.displayName}.`, 'success')
  } catch (err) {
    errorMsg.value = err.response?.data?.error || 'Failed to join — please try again.'
  } finally {
    accepting.value = false
  }
}

onMounted(async () => {
  try {
    const { data } = await axios.get(`${API}/coach/invite/${code}`)
    coach.value = data
  } catch {
    notFound.value = true
  } finally {
    loading.value = false
  }

  // Already logged in and just landed here after signup/login via the pending-invite resume in App.vue
  if (isAuthenticated.value && !notFound.value && route.query.autoAccept === '1') {
    accept()
  }
})
</script>

<style scoped>
.join-page {
  min-height: 100vh;
  background: #16130F;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.join-card {
  max-width: 440px;
  width: 100%;
  background: #FBF6EC;
  border: 2px solid #16130F;
  box-shadow: 6px 6px 0 #2A55F5;
  padding: 40px 32px;
}

.join-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 4px;
}

.join-kicker {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  color: #2A55F5;
  margin-bottom: 8px;
}

.join-title {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-weight: 900;
  font-size: clamp(1.6rem, 6vw, 2.2rem);
  line-height: 0.9;
  text-transform: uppercase;
  color: #16130F;
  margin: 0 0 14px;
}

.join-body {
  font-size: 0.92rem;
  color: #5A5348;
  line-height: 1.5;
  margin: 0 0 24px;
}

.join-error {
  color: #C0392B;
  font-size: 0.85rem;
  font-weight: 600;
  margin: -8px 0 16px;
}

.join-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.btn-join-primary {
  background: #2A55F5;
  color: #fff;
  border: 2px solid #16130F;
  border-radius: 999px;
  box-shadow: 4px 4px 0 #16130F;
  padding: 12px 28px;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-weight: 700;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-join-primary:hover:not(:disabled) { background: #1E42D6; }
.btn-join-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-join-secondary {
  background: transparent;
  color: #16130F;
  border: 2px solid #16130F;
  padding: 10px 24px;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-weight: 700;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-top: 16px;
}
</style>
