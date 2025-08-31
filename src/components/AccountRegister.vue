<!-- src/pages/AccountRegister.vue -->
<template>
    <main class="register-page">
      <!-- LEFT: form -->
      <section class="form-side">
        <div class="register-box">
          <h1 class="mb-3">Create your account</h1>
          <p class="text-muted mb-4">Join the community. Build your momentum.</p>
  
          <!-- Social buttons -->
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
              <label for="name" class="form-label">Full name</label>
              <input id="name" v-model.trim="name" class="form-control" placeholder="Enter Your Name Here" required autofocus />
            </div>
  
            <div class="mb-3">
              <label for="email" class="form-label">Email</label>
              <input id="email" v-model.trim="email" type="email" class="form-control" placeholder="you@example.com" required />
            </div>
  
            <div class="mb-2">
              <label for="password" class="form-label d-flex justify-content-between">
                <span>Password</span>
                <small class="text-muted">min 8 characters</small>
              </label>
              <div class="input-group">
                <input
                  :type="showPwd ? 'text' : 'password'"
                  id="password"
                  v-model="password"
                  class="form-control"
                  placeholder="••••••••"
                  minlength="8"
                  required
                />
                <button class="btn btn-outline-secondary" type="button" @click="showPwd = !showPwd">
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
  
            <div v-if="error" class="alert alert-danger py-2 mt-2">{{ error }}</div>
  
            <button class="btn btn-primary w-100 mt-3" :disabled="!canSubmit || loading">
              <span v-if="!loading">Create account</span>
              <span v-else>Creating…</span>
            </button>
          </form>
  
          <p class="small text-muted mt-4 mb-0">
            Already have an account?
            <router-link to="/join-us" class="link">Log in</router-link>
          </p>
        </div>
      </section>
  
      <!-- RIGHT: image / promo -->
      <section class="art-side" aria-hidden="true"></section>
    </main>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
//   import { register as apiRegister } from '@/lib/api'
  
  const name = ref('')
  const email = ref('')
  const password = ref('')
  const agree = ref(false)
  const showPwd = ref(false)
  const loading = ref(false)
  const error = ref('')
  
  const canSubmit = computed(() =>
    name.value && email.value && password.value.length >= 8 && agree.value && !loading.value
  )
  
  const submit = async () => {
    if (!canSubmit.value) return
    loading.value = true
    error.value = ''
    try {
      await apiRegister({ name: name.value, email: email.value, password: password.value })
      window.location.href = '/' // or use router.push('/')
    } catch (e) {
      error.value = e?.response?.data?.message || 'Registration failed'
    } finally {
      loading.value = false
    }
  }
  
  const onSocial = (provider) => {
    // Hook up your real OAuth later
    console.log(`Social signup: ${provider}`)
  }
  </script>
  
  <style scoped>
  /* Full-page split layout (Strava-like) */
  .register-page{
    --nav-h:72px;      /* match your TopNav height */
    --footer-h:40px;   /* match your Footer height */
    min-height: calc(100vh - var(--nav-h) - var(--footer-h));
    display: grid;
    grid-template-columns: 1fr 1fr;
    overflow: hidden;      /* no horizontal scroll */
    background: #fff;
  }
  
  /* Left/form */
  .form-side{
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px 24px;
  }
  .register-box{
    width: 100%;
    max-width: 460px;
  }
  
  /* Right/art */
  .art-side{
    background:
      linear-gradient(0deg, rgba(128,0,128,.35), rgba(128,0,128,.35)),
      url('/images/register-side.jpg') center/cover no-repeat;
  }
  
  /* Social buttons (match your login) */
  .btn-social{
    height: 44px;
    border-radius: 10px;
    font-weight: 600;
    border: 1px solid #e5e7eb;
    background: #fff;
  }
  .btn-facebook{ background:#1877f2; color:#fff; border-color:#1877f2; }
  .btn-apple{ background:#000; color:#fff; border-color:#000; }
  
  /* Divider */
  .divider{ position:relative; text-align:center; }
  .divider::before{
    content:""; position:absolute; left:0; right:0; top:50%;
    height:1px; background:#e5e7eb;
  }
  .divider > span{
    position:relative; background:#fff; padding:0 .75rem; font-size:12px; color:#6b7280;
  }
  
  /* Inputs */
  .form-control{ height:44px; border-radius:10px; border:1px solid #d1d5db; }
  .form-control:focus{ border-color:#AA0505; box-shadow:0 0 0 3px rgba(128,0,128,.2); }
  .input-group .btn{ border-radius:10px; }
  
  /* Links */
  .link{ color:#AA0505; text-decoration:none; }
  .link:hover{ text-decoration:underline; }
  
  /* Purple primary button */
  .btn-primary{
    --bs-btn-bg:#AA0505; --bs-btn-border-color:#AA0505;
    --bs-btn-hover-bg:#6a006a; --bs-btn-hover-border-color:#6a006a;
    height:44px; border-radius:10px; font-weight:700;
  }
  
  /* Responsive: stack form, hide art */
  @media (max-width: 992px){
    .register-page{ grid-template-columns: 1fr; }
    .art-side{ display:none; }
  }
  </style>
  