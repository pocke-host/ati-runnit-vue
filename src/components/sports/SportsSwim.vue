<template>
    <main class="sport-page">
      <section class="hero">
        <div class="container-xxl">
          <div class="row align-items-center g-4">
            <div class="col-12 col-lg-6">
              <p class="eyebrow">Sport</p>
              <h1 class="display-5 fw-bold mb-2">Swimming</h1>
              <p class="lead text-muted mb-4">
                Pool or open water—measure distance, pace, and progress.
              </p>
              <div class="d-flex gap-3">
                <router-link to="/signup" class="btn btn-primary btn-lg">Get Started</router-link>
                <router-link to="/login" class="btn btn-outline-dark btn-lg">Log In</router-link>
              </div>
            </div>
            <div class="col-12 col-lg-6"><div class="hero-art" /></div>
          </div>
        </div>
      </section>
  
      <section class="features">
        <div class="container-xxl">
          <h2 class="fw-bold text-center mb-4">Built for swimmers</h2>
          <div class="row g-4">
            <div class="col-12 col-md-6 col-lg-4" v-for="f in feats" :key="f.t">
              <div class="card h-100 feature-card">
                <div class="feature-img"></div>
                <div class="card-body">
                  <h5 class="mb-2">{{ f.t }}</h5>
                  <p class="text-muted mb-0">{{ f.d }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
  
      <section class="cta text-center">
        <div class="container-xxl">
          <h2 class="fw-bold mb-2">Dive in.</h2>
          <p class="text-muted mb-3">Join free and start logging swims.</p>
          <router-link to="/signup" class="btn btn-primary btn-lg">Create Account</router-link>
        </div>
      </section>
    </main>
  </template>
  
  <script setup>
  const feats = [
    { t: 'Auto-splits', d: 'See per-lap pace and trends in the pool.' },
    { t: 'Open-water GPS', d: 'Map your swims and conditions outdoors.' },
    { t: 'Training plans', d: 'Hit consistent weekly volume.' },
  ]
  </script>
  
  <style scoped>
  .sport-page{ --nav:72px; --footer:40px; min-height:calc(100vh - var(--nav) - var(--footer)); background:#fff; }
  .hero{ padding:64px 0; background:#f7f5f2; border-bottom:1px solid #eee; }
  .eyebrow{ letter-spacing:.08em; text-transform:uppercase; color:#6b7280; }
  .hero-art{ height:320px; border-radius:16px; background:linear-gradient(135deg,#cffafe,#a5f3fc); }
  .features{ padding:64px 0; }
  .feature-card{ border:1px solid #eee; border-radius:16px; overflow:hidden; }
  .feature-img{ height:160px; background:repeating-linear-gradient(45deg,#f3f4f6,#f3f4f6 10px,#e5e7eb 10px,#e5e7eb 20px); }
  .cta{ padding:56px 0 72px; background:#f7f5f2; border-top:1px solid #eee; }
  .btn-primary{ --bs-btn-bg:#800080; --bs-btn-border-color:#800080; --bs-btn-hover-bg:#6a006a; --bs-btn-hover-border-color:#6a006a; }
  </style>
  