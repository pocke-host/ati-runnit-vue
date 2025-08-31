<!-- src/components/AccountLogin.vue -->
<script setup>
import { onMounted, ref } from 'vue'

const email = ref('')
const password = ref('')
const remember = ref(true)
const loading = ref(false)
const error = ref('')

let auth2

/** Load Google Platform.js and init auth */
function loadGapi() {
  return new Promise((resolve, reject) => {
    if (window.gapi?.auth2) return resolve(window.gapi)
    if (window.gapi) {
      window.gapi.load('auth2', () => resolve(window.gapi))
      return
    }
    const s = document.createElement('script')
    s.src = 'https://apis.google.com/js/platform.js'
    s.async = true
    s.defer = true
    s.onload = () => resolve(window.gapi)
    s.onerror = reject
    document.head.appendChild(s)
  })
}

onMounted(async () => {
  const gapi = await loadGapi()
  await new Promise(res => gapi.load('auth2', res))
  auth2 = await gapi.auth2.init({
    client_id: 'YOUR_CLIENT_ID.apps.googleusercontent.com'
  })
})

const handleGoogleSignIn = async () => {
  if (!auth2) return
  const googleUser = await auth2.signIn()
  const profile = googleUser.getBasicProfile()
  console.log('Name:', profile.getName(), 'Email:', profile.getEmail())
}

const onSubmit = async (e) => {
  e.preventDefault()
  error.value = ''
  loading.value = true
  try {
    await new Promise(r => setTimeout(r, 600))
    if (!email.value || !password.value) throw new Error('Please enter email and password')
    window.location.href = '/'
  } catch (err) {
    error.value = err.message || 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="login-hero">
    <div class="login-box">
      <h3 class="text-center mb-4">Already a Member? Log In</h3>

      <!-- Social buttons -->
      <div class="mb-3">
        <button type="button" class="btn btn-social btn-google w-100 mb-2" @click="handleGoogleSignIn">
          <i class="bi bi-google me-2"></i> Continue with Google
        </button>
        <button type="button" class="btn btn-social btn-facebook w-100 mb-2">
          <i class="bi bi-facebook me-2"></i> Continue with Facebook
        </button>
        <button type="button" class="btn btn-social btn-apple w-100">
           Continue with Apple
        </button>
      </div>

      <div class="divider my-3"><span>or</span></div>

      <!-- Email form -->
      <form @submit="onSubmit" novalidate>
        <div class="mb-3">
          <label for="email" class="form-label">Email</label>
          <input v-model.trim="email" id="email" type="email" class="form-control" placeholder="you@example.com" required />
        </div>

        <div class="mb-2">
          <label for="password" class="form-label">Password</label>
          <input v-model="password" id="password" type="password" class="form-control" placeholder="••••••••" required />
        </div>

        <div class="d-flex align-items-center justify-content-between mb-3">
          <label class="form-check-label d-flex align-items-center gap-2">
            <input class="form-check-input" type="checkbox" v-model="remember" />
            Remember me
          </label>
          <a href="#" class="muted-link">Forgot password?</a>
        </div>

        <div v-if="error" class="alert alert-danger py-2">{{ error }}</div>

        <button class="btn btn-primary w-100" :disabled="loading" type="submit">
          <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
          <span v-if="!loading">Log In</span>
          <span v-else>Signing in…</span>
        </button>
      </form>

      <p class="small text-muted mt-4 mb-0 text-center">
        Don’t have an account?
        <a href="/signup" class="link">Create one</a>
      </p>
    </div>
  </section>
</template>

<style scoped>
/* Full viewport */
.login-hero {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;        /* lock full page */
  width: 100vw;
  overflow: hidden;
  background:
    linear-gradient(to right, rgba(0,0,0,.65), rgba(0,0,0,.45)),
    url('/images/join-us-bg.jpg') center/cover no-repeat; /* swap with your bg */
  padding: 20px;
}

/* Wide centered box */
.login-box {
  background: #fff;
  border-radius: 12px;
  padding: 40px;
  width: 100%;
  max-width: 600px; /* wider form */
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
}

/* Social buttons */
.btn-social {
  height: 48px;
  border-radius: 8px;
  font-weight: 600;
  border: 1px solid #e5e7eb;
  background: #fff;
}
.btn-facebook {
  background: #1877f2; color: #fff; border-color: #1877f2;
}
.btn-apple {
  background: #000; color: #fff; border-color: #000;
}

/* Divider */
.divider {
  position: relative; text-align: center;
}
.divider::before {
  content: ""; position: absolute; left: 0; right: 0; top: 50%;
  height: 1px; background: #e5e7eb;
}
.divider > span {
  position: relative; background: #fff; padding: 0 .75rem;
  font-size: 12px; color: #6b7280;
}

/* Inputs */
.form-control {
  height: 48px; border-radius: 8px; border: 1px solid #d1d5db;
}
.form-control:focus {
  border-color: #fc4c02; box-shadow: 0 0 0 3px rgba(252,76,2,.25);
}

/* Primary button */
.btn-primary {
  background: #AA0505; border-color: #AA0505;
  font-weight: 700; height: 48px; border-radius: 8px;
}
.btn-primary:hover { background: #AA0505; border-color: #AA0505; }

/* Links */
.link { color: #AA0505; text-decoration: none; }
.link:hover { text-decoration: underline; }
.muted-link { color: #6b7280; text-decoration: none; }
.muted-link:hover { text-decoration: underline; }
</style>
