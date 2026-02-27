<template>
  <main class="register-page">
    <!-- LEFT: form -->
    <section class="form-side">
      <div class="register-box">
        <p class="eyebrow text-uppercase fw-semibold mb-2">Start the loop.</p>
        <h1 class="mb-3">Create your account</h1>
        <p class="text-muted mb-4">Log your moments. Build your momentum.</p>

        <!-- Social buttons (UI-only) -->
        <div class="mb-3">
          <button type="button" class="btn btn-social btn-google w-100 mb-2" @click="onSocial('google')">
            <i class="bi bi-google me-2"></i> Continue with Google
          </button>
          <button type="button" class="btn btn-social btn-facebook w-100 mb-2" @click="onSocial('facebook')">
            <i class="bi bi-facebook me-2"></i> Continue with Facebook
          </button>
          <button type="button" class="btn btn-social btn-apple w-100" @click="onSocial('apple')">
             Continue with Apple
          </button>
        </div>

        <div class="divider my-3"><span>or</span></div>

        <!-- Email form -->
        <form @submit.prevent="submit" novalidate>
          <div class="mb-3">
            <label for="displayName" class="form-label">Full name</label>
            <input
              id="displayName" displayName="name" v-model.trim="displayName"
              class="form-control" placeholder="Your name"
              required autofocus autocomplete="name"
            />
          </div>

          <div class="mb-3">
            <label for="email" class="form-label">Email</label>
            <input
              id="email" name="email" v-model.trim="email" type="email"
              class="form-control" placeholder="you@example.com"
              required autocomplete="email"
            />
          </div>

          <div class="mb-2">
            <label for="password" class="form-label d-flex justify-content-between">
              <span>Password</span>
              <small class="text-muted">min 8 characters</small>
            </label>
            <div class="input-group">
              <input
                :type="showPwd ? 'text' : 'password'"
                id="password" name="password"
                v-model="password"
                class="form-control" placeholder="••••••••"
                minlength="8" required autocomplete="new-password"
              />
              <button class="btn btn-outline-secondary" type="button" @click="showPwd = !showPwd" aria-label="Toggle password visibility">
                <i :class="showPwd ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
              </button>
            </div>
          </div>

          <div class="form-check my-2">
            <input id="tos" class="form-check-input" type="checkbox" v-model="agree" />
            <label class="form-check-label" for="tos">
              I agree to the <a href="#" class="link">Terms</a> and <a href="#" class="link">Privacy Policy</a>.
            </label>
          </div>

          <div v-if="error" class="alert alert-danger py-2 mt-2" role="alert" aria-live="polite">{{ error }}</div>

          <button class="btn btn-primary w-100 mt-3" :disabled="!canSubmit || loading">
            <span v-if="!loading">Create account</span>
            <span v-else>
              <span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
              Creating…
            </span>
          </button>
        </form>

        <p class="small text-muted mt-4 mb-0">
          Already in?
          <router-link to="/login" class="link">Log in</router-link>
        </p>
      </div>
    </section>

    <!-- RIGHT: image / promo -->
    <section class="art-side" aria-hidden="true">
      <div class="art-overlay">
        <div class="art-badge">RUNNIT</div>
        <div class="art-title">Movement with purpose.</div>
        <div class="art-sub">Show up. Log it. Repeat.</div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { apiRegister } from "@/lib/api";

const router = useRouter()

const displayName = ref('')
const email = ref('')
const password = ref('')
const agree = ref(false)
const showPwd = ref(false)
const loading = ref(false)
const error = ref('')

const canSubmit = computed(() =>
displayName.value && email.value && password.value.length >= 8 && agree.value && !loading.value
)

const submit = async () => {
  if (!canSubmit.value) return
  loading.value = true
  error.value = ''
  try {
    await apiRegister({ displayName: displayName.value, email: email.value, password: password.value })
    router.push('/')
  } catch (e) {
    error.value = e?.response?.data?.message || e?.message || 'Registration failed'
  } finally {
    loading.value = false
  }
}

const onSocial = (provider) => {
  console.log(`Social signup: ${provider}`)
}
</script>

<style scoped>
.register-page{
  --r-olive:#5A6B4E;
  --r-olive-deep:#2C3726;
  --r-black:#0F1210;
  --r-stone:#A3A69F;
  --r-offwhite:#F5F6F3;
  --r-white:#FFFFFF;
  --r-accent:#C46A2A;

  --nav-h:72px;
  --footer-h:40px;
  min-height: calc(100vh - var(--nav-h) - var(--footer-h));
  display: grid;
  grid-template-columns: 1fr 1fr;
  overflow: hidden;
  background: var(--r-offwhite);

  font-family: Futura, "Futura PT", "Futura Std", "Avenir Next", Avenir,
    system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
}

/* Left/form */
.form-side{
  display:flex;
  align-items:center;
  justify-content:center;
  padding: 32px 24px;
}
.register-box{
  width:100%;
  max-width: 460px;
  background: rgba(255,255,255,0.75);
  border: 1px solid rgba(15,18,16,0.10);
  border-radius: 18px;
  padding: 22px;
  box-shadow: 0 18px 50px rgba(15,18,16,0.08);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.eyebrow{
  letter-spacing:.16em;
  color: rgba(15,18,16,0.65);
}

/* Right/art */
.art-side{
  position: relative;
  background:
    radial-gradient(900px 420px at 18% 18%, rgba(255,255,255,0.12), rgba(255,255,255,0) 60%),
    radial-gradient(900px 420px at 85% 30%, rgba(196,106,42,0.10), rgba(196,106,42,0) 60%),
    linear-gradient(135deg, var(--r-olive), var(--r-olive-deep));
}
.art-overlay{
  position:absolute;
  inset: 0;
  display:flex;
  flex-direction:column;
  align-items:flex-start;
  justify-content:flex-end;
  padding: 34px;
  color: var(--r-white);
}
.art-badge{
  font-weight: 900;
  letter-spacing: .22em;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.16);
  margin-bottom: 10px;
}
.art-title{
  font-size: 1.6rem;
  font-weight: 900;
  margin-bottom: 6px;
}
.art-sub{
  color: rgba(255,255,255,0.78);
  font-weight: 700;
}

/* Social buttons */
.btn-social{
  height: 44px;
  border-radius: 12px;
  font-weight: 800;
  border: 1px solid rgba(15,18,16,0.12);
  background: rgba(255,255,255,0.90);
}
.btn-social:hover{
  background: rgba(255,255,255,0.98);
}
.btn-facebook{ background:#1877f2; color:#fff; border-color:#1877f2; }
.btn-apple{ background:#000; color:#fff; border-color:#000; }

/* Divider */
.divider{ position:relative; text-align:center; }
.divider::before{
  content:"";
  position:absolute; left:0; right:0; top:50%;
  height:1px; background: rgba(15,18,16,0.12);
}
.divider > span{
  position:relative;
  background: rgba(255,255,255,0.85);
  padding:0 .75rem;
  font-size:12px;
  color: rgba(15,18,16,0.55);
  border-radius: 999px;
  border: 1px solid rgba(15,18,16,0.08);
}

/* Inputs */
.form-control{
  height: 44px;
  border-radius: 12px;
  border: 1px solid rgba(15,18,16,0.16);
  background: rgba(255,255,255,0.92);
}
.form-control:focus{
  border-color: rgba(196,106,42,0.65);
  box-shadow: 0 0 0 3px rgba(196,106,42,0.20);
}
.input-group .btn{ border-radius: 12px; }

/* Links */
.link{ color: var(--r-accent); text-decoration:none; font-weight: 800; }
.link:hover{ text-decoration:underline; }

/* Primary button (RUNNIT accent) */
.btn-primary{
  --bs-btn-bg: var(--r-accent);
  --bs-btn-border-color: rgba(255,255,255,0.12);
  --bs-btn-hover-bg: #a85722;
  --bs-btn-hover-border-color: rgba(255,255,255,0.12);
  height: 44px;
  border-radius: 12px;
  font-weight: 900;
  letter-spacing: .02em;
}

/* Make outline-secondary button (eye icon) match vibe */
.btn-outline-secondary{
  border-color: rgba(15,18,16,0.16);
}
.btn-outline-secondary:hover{
  background: rgba(15,18,16,0.04);
}

/* Responsive: stack form, hide art */
@media (max-width: 992px){
  .register-page{ grid-template-columns: 1fr; }
  .art-side{ display:none; }
  .register-box{ padding: 18px; }
}
</style>
