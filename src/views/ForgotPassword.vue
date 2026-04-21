<template>
  <main class="auth-page">
    <section class="form-side">
      <div class="auth-container">
        <div class="brand-mark mb-4">
          <div class="logo-circle">R</div>
          <h2 class="brand-name mb-0">RUNNIT</h2>
        </div>

        <h1 class="h2 fw-bold mb-2">Forgot password?</h1>
        <p class="text-muted mb-4">Enter your email and we'll send a reset link your way.</p>

        <!-- Success state -->
        <div v-if="sent" class="sent-card">
          <div class="sent-icon">✓</div>
          <p class="sent-title">Check your inbox</p>
          <p class="sent-body">
            If <strong>{{ submittedEmail }}</strong> is registered, a reset link is on its way.
            Check your spam folder if you don't see it within a minute.
          </p>
          <router-link to="/join-us" class="btn btn-primary w-100 mt-3">Back to sign in</router-link>
        </div>

        <!-- Form state -->
        <form v-else @submit.prevent="submit" novalidate>
          <div class="mb-3">
            <input
              v-model.trim="email"
              type="email"
              class="form-control"
              placeholder="Email address"
              required
              autocomplete="email"
              autofocus
            />
          </div>

          <div v-if="error" class="alert alert-danger py-2 mb-3">{{ error }}</div>

          <button class="btn btn-primary w-100" :disabled="loading || !email">
            <span v-if="!loading">Send Reset Link</span>
            <span v-else>
              <span class="spinner-border spinner-border-sm me-2"></span>
              Sending…
            </span>
          </button>
        </form>

        <p class="text-center text-muted small mt-4 mb-0">
          <router-link to="/join-us" class="link">← Back to sign in</router-link>
        </p>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const email = ref('')
const loading = ref(false)
const error = ref('')
const sent = ref(false)
const submittedEmail = ref('')

const submit = async () => {
  if (!email.value) return
  loading.value = true
  error.value = ''
  try {
    await axios.post(`${API_URL}/auth/forgot-password`, { email: email.value })
    submittedEmail.value = email.value
    sent.value = true
  } catch (e) {
    error.value = e?.response?.data?.error || 'Something went wrong. Please try again.'
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
.auth-container {
  width: 100%;
  max-width: 400px;
}
.brand-mark {
  display: flex;
  align-items: center;
  gap: 12px;
}
.logo-circle {
  width: 48px;
  height: 48px;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 900;
  color: white;
}
.brand-name {
  font-size: 24px;
  font-weight: 900;
  letter-spacing: 0.08em;
  color: #000;
}
h1 { color: #000; font-weight: 700; }
.text-muted { color: #6B7280; font-size: 15px; }

.form-control {
  height: 48px;
  border: 1px solid #E5E7EB;
  border-radius: 0;
  padding: 0 16px;
  font-size: 15px;
  width: 100%;
  font-family: inherit;
  transition: border-color 0.2s;
}
.form-control:focus { outline: none; border-color: #000; box-shadow: none; }
.form-control::placeholder { color: #9CA3AF; }

.btn-primary {
  height: 48px;
  background: #0052FF;
  border: none;
  border-radius: 0;
  color: white;
  font-weight: 700;
  font-size: 0.78rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.2s;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-primary:hover:not(:disabled) { background: #003ECC; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.alert-danger {
  background: #FEF2F2;
  border: 1px solid #FCA5A5;
  border-radius: 0;
  color: #DC2626;
  font-size: 14px;
  padding: 10px 14px;
}

.link { color: #000; text-decoration: none; font-weight: 600; }
.link:hover { text-decoration: underline; }

/* Sent confirmation card */
.sent-card {
  text-align: center;
  padding: 32px 24px;
  border: 1px solid #E5E5E5;
}
.sent-icon {
  width: 56px;
  height: 56px;
  background: #000;
  color: #fff;
  font-size: 24px;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}
.sent-title {
  font-size: 18px;
  font-weight: 700;
  color: #000;
  margin-bottom: 8px;
}
.sent-body {
  font-size: 14px;
  color: #6B7280;
  line-height: 1.6;
  margin: 0;
}

.w-100 { width: 100%; }
.mt-3 { margin-top: 16px; }
.mb-3 { margin-bottom: 16px; }
.mb-4 { margin-bottom: 24px; }
.mt-4 { margin-top: 24px; }
.mb-0 { margin-bottom: 0; }
.me-2 { margin-right: 8px; }
.py-2 { padding-top: 8px; padding-bottom: 8px; }
</style>
