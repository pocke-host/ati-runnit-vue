<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { login as apiLogin } from '@/lib/auth'   // <-- uses axios client we set up

const router = useRouter()

const email = ref('')
const password = ref('')
const remember = ref(true)
const loading = ref(false)
const error = ref('')

// --- Optional/legacy Google button (UI only right now) ---
let auth2
function loadGapi() {
  return new Promise((resolve, reject) => {
    if (window.gapi?.auth2) return resolve(window.gapi)
    if (window.gapi) { window.gapi.load('auth2', () => resolve(window.gapi)); return }
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
  try {
    const gapi = await loadGapi()
    await new Promise(res => gapi.load('auth2', res))
    auth2 = await gapi.auth2.init({ client_id: 'YOUR_CLIENT_ID.apps.googleusercontent.com' })
  } catch {}
})
const handleGoogleSignIn = async () => {
  if (!auth2) return
  const googleUser = await auth2.signIn()
  const profile = googleUser.getBasicProfile()
  console.log('Google name:', profile.getName(), 'email:', profile.getEmail())
}

// --- Email/password login to PHP backend ---
const onSubmit = async (e) => {
  e.preventDefault()
  error.value = ''
  loading.value = true
  try {
    if (!email.value || !password.value) throw new Error('Please enter email and password')
    await apiLogin({ email: email.value, password: password.value })   // <-- real call
    router.push('/')                                                   // success redirect
  } catch (err) {
    error.value = err?.response?.data?.message || err?.message || 'Login failed'
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
          <input v-model.trim="email" id="email" type="email" class="form-control" placeholder="you@example.com" required autocomplete="email" />
        </div>

        <div class="mb-2">
          <label for="password" class="form-label">Password</label>
          <input v-model="password" id="password" type="password" class="form-control" placeholder="••••••••" required autocomplete="current-password" />
        </div>

        <div class="d-flex align-items-center justify-content-between mb-3">
          <label class="form-check-label d-flex align-items-center gap-2">
            <input class="form-check-input" type="checkbox" v-model="remember" />
            Remember me
          </label>
          <a href="#" class="muted-link">Forgot password?</a>
        </div>

        <div v-if="error" class="alert alert-danger py-2" role="alert">{{ error }}</div>

        <button class="btn btn-primary w-100" :disabled="loading" type="submit">
          <span v-if="loading" class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
          <span v-if="!loading">Log In</span>
          <span v-else>Signing in…</span>
        </button>
      </form>

      <p class="small text-muted mt-4 mb-0 text-center">
        Don’t have an account?
        <router-link to="/signup" class="link">Create one</router-link>
      </p>
    </div>
  </section>
</template>

<style scoped>
/* Respect fixed TopNav/Footer: fill the space between them */
.login-hero {
  --nav-h: 72px;         /* keep in sync with your TopNav */
  --footer-h: 40px;      /* keep in sync with your Footer */
  min-height: calc(100vh - var(--nav-h) - var(--footer-h));
  padding: 20px;
  display: flex; align-items: center; justify-content: center;
  background:
    linear-gradient(to right, rgba(0,0,0,.55), rgba(0,0,0,.35)),
    url('/images/join-us-bg.jpg') center/cover no-repeat; /* replace as needed */
  overflow: hidden;
}

/* Centered form card */
.login-box {
  background: #fff;
  border-radius: 12px;
  padding: 40px;
  width: 100%;
  max-width: 560px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.18);
}

/* Social buttons */
.btn-social {
  height: 48px; border-radius: 8px; font-weight: 600;
  border: 1px solid #e5e7eb; background: #fff;
}
.btn-facebook { background:#1877f2; color:#fff; border-color:#1877f2; }
.btn-apple    { background:#000;    color:#fff; border-color:#000; }

/* Divider */
.divider { position: relative; text-align: center; }
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
  border-color: #800080;                     /* Runnit purple */
  box-shadow: 0 0 0 3px rgba(128,0,128,.22); /* soft purple ring */
}

/* Primary button (Runnit purple) */
.btn-primary {
  background: #800080; border-color: #800080;
  font-weight: 700; height: 48px; border-radius: 8px;
}
.btn-primary:hover { background: #6a006a; border-color: #6a006a; }

/* Links */
.link { color: #800080; text-decoration: none; }
.link:hover { text-decoration: underline; }
.muted-link { color: #6b7280; text-decoration: none; }
.muted-link:hover { text-decoration: underline; }

/* Make sure there’s never horizontal scroll on this page */
:host, .login-hero { overflow-x: hidden; }
</style>
