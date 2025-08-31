<!-- src/pages/Features.vue -->
<template>
    <main class="features-page">
      <!-- HERO -->
      <section class="hero">
        <div class="container-xxl">
          <div class="row align-items-center g-4">
            <div class="col-12 col-lg-6">
              <h1 class="display-5 fw-bold mb-3">Features that keep you moving</h1>
              <p class="lead text-muted mb-4">
                From powerful maps to friendly kudos—everything you need to track, explore, and stay motivated.
              </p>
              <div class="d-flex gap-3">
                <router-link to="/signup" class="btn btn-primary btn-lg">Get Started</router-link>
                <router-link to="/login" class="btn btn-outline-dark btn-lg">Log In</router-link>
              </div>
            </div>
            <div class="col-12 col-lg-6">
              <div class="hero-art rounded-4"></div>
            </div>
          </div>
        </div>
      </section>
  
      <!-- BIG CARD GRID -->
      <section class="grid">
        <div class="container-xxl">
          <div class="row g-4">
            <div v-for="(f, i) in bigGrid" :key="i" class="col-12 col-md-6">
              <div class="card h-100 card-feature">
                <div class="card-art rounded-top"></div>
                <div class="card-body">
                  <h3 class="h4 fw-bold mb-2">{{ f.title }}</h3>
                  <p class="text-muted mb-0">{{ f.body }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
  
      <!-- ICON LIST / MODULES -->
      <section class="modules">
        <div class="container-xxl">
          <h2 class="fw-bold text-center mb-4">Everything in one place</h2>
          <div class="row g-4">
            <div v-for="(m, i) in modules" :key="i" class="col-12 col-sm-6 col-lg-4">
              <div class="module h-100">
                <i :class="m.icon + ' module-icon'"></i>
                <h5 class="fw-semibold mt-2 mb-1">{{ m.title }}</h5>
                <p class="text-muted mb-0">{{ m.body }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
  
      <!-- COMPATIBLE DEVICES STRIP -->
      <section class="devices">
        <div class="container-xxl">
          <div class="d-flex flex-wrap justify-content-center align-items-center gap-4">
            <span class="device-pill">Garmin</span>
            <span class="device-pill">Apple Watch</span>
            <span class="device-pill">COROS</span>
            <span class="device-pill">Wahoo</span>
            <span class="device-pill">Suunto</span>
            <span class="device-pill">Fitbit</span>
          </div>
        </div>
      </section>
  
      <!-- PRICING / CTA -->
      <section class="cta">
        <div class="container-xxl text-center">
          <h2 class="fw-bold mb-2">Try it free</h2>
          <p class="text-muted mb-4">Create an account and explore all features. Cancel anytime.</p>
          <router-link to="/signup" class="btn btn-primary btn-lg">Start Free Trial</router-link>
          <p class="small text-muted mt-3 mb-0">By continuing you agree to our Terms and Privacy Policy.</p>
        </div>
      </section>
    </main>
  </template>
  
  <script setup>
  const bigGrid = [
    {
      title: 'Routes & Heatmaps',
      body: 'Discover popular paths, surfaces, and elevation. Save routes and sync to your watch.',
    },
    {
      title: 'Clubs & Challenges',
      body: 'Join local groups, earn badges, and stay motivated with monthly and seasonal goals.',
    },
    {
      title: 'Training & Analysis',
      body: 'Pace, power, heart rate, and trend charts help you build smarter plans.',
    },
    {
      title: 'Safety & Sharing',
      body: 'Beacon live tracking and privacy zones keep you in control of your data.',
    },
    {
      title: 'Guided AI Feature',
      body: 'Coming soon.',
    },
  ]
  
  const modules = [
    { icon: 'bi bi-map',              title: 'Maps',           body: 'Plan routes with surfaces and elevation.' },
    { icon: 'bi bi-graph-up-arrow',   title: 'Progress',       body: 'See weekly and monthly trends at a glance.' },
    { icon: 'bi bi-flag',             title: 'Segments',       body: 'Compete on local segments and PRs.' },
    { icon: 'bi bi-heart-fill',       title: 'Kudos',          body: 'Motivation from friends and clubs.' },
    { icon: 'bi bi-bell',             title: 'Notifications',  body: 'Stay in the loop on follows and comments.' },
    { icon: 'bi bi-shield-lock',      title: 'Privacy',        body: 'Granular controls and privacy zones.' },
  ]
  </script>
  
  <style scoped>
  /* Page baseline */
  .features-page {
    min-height: 100vh;
    width: 100%;
    background: #fff;
    overflow-x: hidden;
  }
  
  /* ---- HERO ---- */
  .hero {
    --nav-h: 72px;        /* adjust to your fixed top nav height */
    --footer-h: 40px;     /* adjust to your fixed footer height */
    min-height: calc(100vh - var(--nav-h) - var(--footer-h));
    display: flex;
    align-items: center;
    background: #f7f5f2;
    padding: 64px 0;
  }
  .hero-art {
    height: 360px;
    border-radius: 16px;
    background: linear-gradient(135deg, #d7dadf, #aeb4bd);
  }
  
  /* ---- BIG CARD GRID ---- */
  .grid { padding: 56px 0; background: #fff; }
  .card-feature { border: 1px solid #eee; }
  .card-art {
    height: 180px;
    background: repeating-linear-gradient(45deg, #f1f3f5, #f1f3f5 12px, #e9ecef 12px, #e9ecef 24px);
  }
  
  /* ---- MODULES ---- */
  .modules { padding: 56px 0; background: #fff; }
  .module { padding: 16px; border: 1px solid #eee; border-radius: 12px; }
  .module-icon { font-size: 1.4rem; color: #fc4c02; }
  
  /* ---- DEVICES STRIP ---- */
  .devices { padding: 40px 0; background: #f7f5f2; }
  .device-pill {
    display: inline-block;
    padding: 8px 14px;
    border-radius: 999px;
    background: #fff;
    border: 1px solid #e5e7eb;
    font-weight: 600;
  }
  
  /* ---- CTA ---- */
  .cta { padding: 64px 0 80px; background: #fff; border-top: 1px solid #eee; text-align: center; }
  
  /* Strava-ish orange button */
  .btn-primary {
    --bs-btn-bg: #800080;
    --bs-btn-border-color: #800080;
    --bs-btn-hover-bg: #6a006a;
    --bs-btn-hover-border-color: #6a006a;
  }
  </style>
  