<template>
  <main class="auth-page">
    <section class="form-side">
      <div class="auth-container">
        <div class="brand-mark mb-4">
          <div class="logo-circle">R</div>
          <h2 class="brand-name mb-0">RUNNIT</h2>
        </div>

        <!-- Invalid/missing token -->
        <div v-if="!token" class="error-card">
          <p class="error-title">Invalid reset link</p>
          <p class="error-body">This link is missing a reset token. Please request a new one.</p>
          <router-link to="/forgot-password" class="btn btn-primary w-100 mt-3">Request new link</router-link>
        </div>

        <!-- Success state -->
        <div v-else-if="done" class="sent-card">
          <div class="sent-icon">✓</div>
          <p class="sent-title">Password updated!</p>
          <p class="sent-body">Your password has been changed. Sign in with your new password.</p>
          <router-link to="/join-us" class="btn btn-primary w-100 mt-3">Sign in</router-link>
        </div>

        <!-- Form state -->
        <template v-else>
          <h1 class="h2 fw-bold mb-2">Set new password</h1>
          <p class="text-muted mb-4">Choose a strong password for your RUNNIT account.</p>

          <form @submit.prevent="submit" novalidate>
            <div class="mb-3">
              <div class="password-input">
                <input
                  :type="showPwd ? 'text' : 'password'"
                  v-model="password"
                  class="form-control"
                  placeholder="New password (min 8 characters)"
                  minlength="8"
                  required
                  autocomplete="new-password"
                />
                <button type="button" class="password-toggle" @click="showPwd = !showPwd" aria-label="Toggle visibility">
                  <i :class="showPwd ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                </button>
              </div>
            </div>

            <!-- Password strength -->
            <div v-if="password.length > 0" class="pwd-strength mb-3">
              <div class="pwd-strength-bars">
                <div v-for="i in 4" :key="i" class="pwd-bar"
                     :style="{ background: i <= pwdStrength.score ? pwdStrength.color : '#E5E5E5' }"></div>
              </div>
              <span class="pwd-strength-label" :style="{ color: pwdStrength.color }">{{ pwdStrength.label }}</span>
            </div>

            <div class="mb-3">
              <input
                :type="showPwd ? 'text' : 'password'"
                v-model="confirm"
                class="form-control"
                placeholder="Confirm new password"
                required
                autocomplete="new-password"
              />
            </div>

            <div v-if="error" class="alert alert-danger py-2 mb-3">{{ error }}</div>

            <button class="btn btn-primary w-100" :disabled="loading || !canSubmit">
              <span v-if="!loading">Update Password</span>
              <span v-else>
                <span class="spinner-border spinner-border-sm me-2"></span>
                Updating…
              </span>
            </button>
          </form>
        </template>

        <p class="text-center text-muted small mt-4 mb-0">
          <router-link to="/join-us" class="link">← Back to sign in</router-link>
        </p>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
const route = useRoute()

const token = ref('')
const password = ref('')
const confirm = ref('')
const showPwd = ref(false)
const loading = ref(false)
const error = ref('')
const done = ref(false)

onMounted(() => {
  token.value = route.query.token || ''
})

const pwdStrength = computed(() => {
  const p = password.value
  if (!p) return { score: 0, label: '', color: '' }
  let score = 0
  if (p.length >= 8)  score++
  if (p.length >= 12) score++
  if (/[A-Z]/.test(p)) score++
  if (/[0-9]/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  if (score <= 1) return { score, label: 'Weak',   color: '#DC2626' }
  if (score === 2) return { score, label: 'Fair',   color: '#f59e0b' }
  if (score === 3) return { score, label: 'Good',   color: '#0052FF' }
  return               { score, label: 'Strong', color: '#16a34a' }
})

const canSubmit = computed(() =>
  password.value.length >= 8 &&
  password.value === confirm.value &&
  !loading.value
)

const submit = async () => {
  error.value = ''
  if (password.value !== confirm.value) {
    error.value = 'Passwords do not match.'
    return
  }
  loading.value = true
  try {
    await axios.post(`${API_URL}/auth/reset-password`, {
      token: token.value,
      newPassword: password.value
    })
    done.value = true
  } catch (e) {
    error.value = e?.response?.data?.error || 'This link may have expired. Please request a new one.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  font-family: Futura, "Futura PT", "Futura Std", "Avenir Next", Avenir, system-ui, sans-serif;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
}
.form-side {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  width: 100%;
}
.auth-container { width: 100%; max-width: 400px; }
.brand-mark { display: flex; align-items: center; gap: 12px; }
.logo-circle {
  width: 48px; height: 48px; background: #000;
  display: flex; align-items: center; justify-content: center;
  font-size: 24px; font-weight: 900; color: white;
}
.brand-name { font-size: 24px; font-weight: 900; letter-spacing: 0.08em; color: #000; }
h1 { color: #000; font-weight: 700; }
.text-muted { color: #6B7280; font-size: 15px; }

.form-control {
  height: 48px; border: 1px solid #E5E7EB; border-radius: 0;
  padding: 0 16px; font-size: 15px; width: 100%; font-family: inherit;
  transition: border-color 0.2s; box-sizing: border-box;
}
.form-control:focus { outline: none; border-color: #000; box-shadow: none; }
.form-control::placeholder { color: #9CA3AF; }

.password-input { position: relative; }
.password-toggle {
  position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
  background: none; border: none; color: #9CA3AF; font-size: 18px; cursor: pointer;
}

.pwd-strength { display: flex; align-items: center; gap: 10px; }
.pwd-strength-bars { display: flex; gap: 4px; flex: 1; }
.pwd-bar { flex: 1; height: 4px; transition: background 0.2s; }
.pwd-strength-label { font-size: 12px; font-weight: 700; min-width: 44px; text-align: right; }

.btn-primary {
  height: 48px; background: #0052FF; border: none; border-radius: 0;
  color: white; font-weight: 700; font-size: 0.78rem; letter-spacing: 0.12em;
  text-transform: uppercase; cursor: pointer; transition: background 0.2s;
  width: 100%; display: flex; align-items: center; justify-content: center;
}
.btn-primary:hover:not(:disabled) { background: #003ECC; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.alert-danger {
  background: #FEF2F2; border: 1px solid #FCA5A5; border-radius: 0;
  color: #DC2626; font-size: 14px; padding: 10px 14px;
}
.link { color: #000; text-decoration: none; font-weight: 600; }
.link:hover { text-decoration: underline; }

.sent-card, .error-card {
  text-align: center; padding: 32px 24px; border: 1px solid #E5E5E5;
}
.sent-icon {
  width: 56px; height: 56px; background: #000; color: #fff;
  font-size: 24px; font-weight: 900;
  display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;
}
.sent-title, .error-title { font-size: 18px; font-weight: 700; color: #000; margin-bottom: 8px; }
.sent-body, .error-body { font-size: 14px; color: #6B7280; line-height: 1.6; margin: 0; }

.w-100 { width: 100%; }
.mt-3 { margin-top: 16px; }
.mb-3 { margin-bottom: 16px; }
.mb-4 { margin-bottom: 24px; }
.mt-4 { margin-top: 24px; }
.mb-0 { margin-bottom: 0; }
.me-2 { margin-right: 8px; }
.py-2 { padding-top: 8px; padding-bottom: 8px; }
</style>
