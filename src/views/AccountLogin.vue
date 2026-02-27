<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'  // ← Add this

const router = useRouter()
const authStore = useAuthStore()  // ← Add this

const email = ref('')
const password = ref('')          // FIX: you were using passwordHash but binding v-model="password"
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

// --- Email/password login ---
const onSubmit = async (e) => {
  e.preventDefault()
  error.value = ''
  loading.value = true
  try {
    if (!email.value || !password.value) throw new Error('Please enter email and password')

    await authStore.login(email.value, password.value)

    router.push('/dashboard') // or '/'
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
      <p class="eyebrow text-uppercase fw-semibold mb-2">Resume the loop.</p>
      <h3 class="mb-2">Log in</h3>
      <p class="text-muted mb-4">Pick up where you left off — momentum saved.</p>

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
          <input
            v-model.trim="email"
            id="email"
            type="email"
            class="form-control"
            placeholder="you@example.com"
            required
            autocomplete="email"
          />
        </div>

        <div class="mb-2">
          <label for="password" class="form-label">Password</label>
          <input
            v-model="password"
            id="password"
            type="password"
            class="form-control"
            placeholder="••••••••"
            required
            autocomplete="current-password"
          />
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
.login-hero{
  --r-olive:#5A6B4E;
  --r-olive-deep:#2C3726;
  --r-black:#0F1210;
  --r-stone:#A3A69F;
  --r-offwhite:#F5F6F3;
  --r-white:#FFFFFF;
  --r-accent:#C46A2A;

  --nav-h: 72px;
  --footer-h: 40px;
  min-height: calc(100vh - var(--nav-h) - var(--footer-h));
  padding: 20px;
  display:flex;
  align-items:center;
  justify-content:center;

  /* “simulation feel” through atmosphere, not pixels */
  background:
    radial-gradient(900px 420px at 18% 18%, rgba(255,255,255,0.10), rgba(255,255,255,0) 60%),
    radial-gradient(900px 420px at 85% 30%, rgba(196,106,42,0.10), rgba(196,106,42,0) 60%),
    linear-gradient(135deg, var(--r-olive), var(--r-olive-deep));
  overflow: hidden;

  font-family: Futura, "Futura PT", "Futura Std", "Avenir Next", Avenir,
    system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
}

/* Glass card */
.login-box{
  width:100%;
  max-width: 560px;
  padding: 34px;

  background: rgba(255,255,255,0.78);
  border: 1px solid rgba(255,255,255,0.22);
  border-radius: 18px;
  box-shadow: 0 22px 70px rgba(15,18,16,0.28);

  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.eyebrow{
  letter-spacing:.16em;
  color: rgba(15,18,16,0.60);
}

/* Social buttons */
.btn-social{
  height: 48px;
  border-radius: 12px;
  font-weight: 900;
  border: 1px solid rgba(15,18,16,0.12);
  background: rgba(255,255,255,0.92);
}
.btn-social:hover{ background: rgba(255,255,255,0.98); }
.btn-facebook{ background:#1877f2; color:#fff; border-color:#1877f2; }
.btn-apple{ background:#000; color:#fff; border-color:#000; }

/* Divider */
.divider{ position: relative; text-align: center; }
.divider::before{
  content:"";
  position:absolute; left:0; right:0; top:50%;
  height:1px; background: rgba(15,18,16,0.12);
}
.divider > span{
  position: relative;
  background: rgba(255,255,255,0.85);
  padding: 0 .75rem;
  font-size: 12px;
  color: rgba(15,18,16,0.55);
  border: 1px solid rgba(15,18,16,0.08);
  border-radius: 999px;
}

/* Inputs */
.form-control{
  height: 48px;
  border-radius: 12px;
  border: 1px solid rgba(15,18,16,0.16);
  background: rgba(255,255,255,0.92);
}
.form-control:focus{
  border-color: rgba(196,106,42,0.65);
  box-shadow: 0 0 0 3px rgba(196,106,42,0.20);
}

/* Primary button (burnt orange) */
.btn-primary{
  --bs-btn-bg: var(--r-accent);
  --bs-btn-border-color: rgba(255,255,255,0.12);
  --bs-btn-hover-bg: #a85722;
  --bs-btn-hover-border-color: rgba(255,255,255,0.12);
  font-weight: 900;
  height: 48px;
  border-radius: 12px;
  letter-spacing: .02em;
}

/* Links */
.link{ color: var(--r-accent); text-decoration: none; font-weight: 900; }
.link:hover{ text-decoration: underline; }
.muted-link{ color: rgba(255,255,255,0.85); text-decoration:none; }
.muted-link:hover{ text-decoration: underline; }

/* Checkbox spacing */
.form-check-input{ margin-top: 0; }

/* never horizontal scroll */
:host, .login-hero{ overflow-x: hidden; }
</style>
