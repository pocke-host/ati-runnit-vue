<!-- src/pages/SportRunning.vue -->
<template>
    <main class="sport-page">
      <section class="hero">
        <div class="container-xxl">
          <div class="row align-items-center g-5">
            <div class="col-12 col-lg-6">
              <p class="eyebrow text-uppercase fw-semibold mb-2">Sport</p>
              <h1 class="display-5 fw-bold mb-3">Running</h1>
              <p class="lead mb-4">
                Track every run, find new routes, and get kudos from friends.
                Join millions of runners building consistency and having fun.
              </p>
              <div class="d-flex gap-3">
                <router-link to="/join-us" class="btn btn-primary btn-lg">Sign Up With Email</router-link>
              </div>
              <p class="small text-muted mt-3 mb-0">By continuing you agree to our Terms and Privacy Policy.</p>
            </div>
            <div class="col-12 col-lg-6">
              <!-- Replace with your real image or phone mockup -->
              <div class="hero-art rounded-4"></div>
            </div>
          </div>
        </div>
      </section>
  
      <!-- STATS STRIP -->
      <!-- <section class="stats">
        <div class="container-xxl">
          <div class="row text-center g-4">
            <div class="col-6 col-md-3">
              <div class="stat">
                <div class="value">100M+</div>
                <div class="label">Athletes</div>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="stat">
                <div class="value">30B+</div>
                <div class="label">Activities</div>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="stat">
                <div class="value">190+</div>
                <div class="label">Countries</div>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="stat">
                <div class="value">#1</div>
                <div class="label">Running community</div>
              </div>
            </div>
          </div>
        </div>
      </section> -->
  
      <!-- WHY RUNNERS USE IT -->
      <section class="why">
        <div class="container-xxl">
          <div class="row align-items-center g-5">
            <div class="col-12 col-lg-5">
              <h2 class="fw-bold mb-3">Why runners choose RUNNIT</h2>
              <p class="text-muted mb-4">
                Everything you need to build a habit you love — routes, motivation, and
                insights powered by your data.
              </p>
              <ul class="list-unstyled m-0">
                <li class="why-item">
                  <i class="bi bi-map me-3"></i>
                  Explore routes nearby or plan new ones with surface info and elevation.
                </li>
                <li class="why-item">
                  <i class="bi bi-graph-up-arrow me-3"></i>
                  See pace, splits, and trends to improve each week.
                </li>
                <li class="why-item">
                  <i class="bi bi-heart-fill me-3"></i>
                  Get kudos and join clubs to keep the stoke high.
                </li>
              </ul>
            </div>
            <div class="col-12 col-lg-7">
              <div class="media-tile rounded-4"></div>
            </div>
          </div>
        </div>
      </section>
  
      <!-- FEATURE CARDS -->
      <section class="features">
        <div class="container-xxl">
          <h2 class="fw-bold text-center mb-4">Features for runners</h2>
          <div class="row g-4">
            <div class="col-12 col-md-6 col-lg-4" v-for="(f, i) in featureList" :key="i">
              <div class="card h-100 feature-card">
                <div class="feature-img rounded-top"></div>
                <div class="card-body">
                  <h5 class="card-title mb-2">{{ f.title }}</h5>
                  <p class="card-text text-muted mb-0">{{ f.body }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
  
      <!-- HOW IT WORKS -->
      <section class="how">
        <div class="container-xxl">
          <h2 class="fw-bold text-center mb-4">How it works</h2>
          <div class="row g-4">
            <div class="col-12 col-lg-4" v-for="(s, i) in steps" :key="i">
              <div class="how-card">
                <span class="step badge rounded-pill">{{ i + 1 }}</span>
                <h5 class="mb-2">{{ s.title }}</h5>
                <p class="text-muted mb-0">{{ s.body }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
  
      <!-- CTA BAND -->
      <section class="cta">
        <div class="container-xxl text-center">
          <h2 class="fw-bold mb-3">Ready to run with us?</h2>
          <p class="text-muted mb-4">Create a free account and start tracking today.</p>
          <router-link to="/signup" class="btn btn-primary btn-lg">Get Started</router-link>
        </div>
      </section>
  
    </main>
  </template>
  
  <script setup>
  const featureList = [
    { title: 'Routes & Maps', body: 'Find the best places to run with heatmaps, surfaces, and turn-by-turn cues.' },
    { title: 'Pace & Splits', body: 'Auto-splits, segment efforts, and weekly trend charts to see improvement.' },
    { title: 'Clubs & Challenges', body: 'Join local groups, stack badges, and stay motivated with monthly goals.' },
    { title: 'Device Friendly', body: 'Works with Garmin, Apple Watch, Coros, Wahoo, and more.' },
    { title: 'Beacon Safety', body: 'Share your live location with trusted contacts while you’re out.' },
    { title: 'Training Tools', body: 'Set goals, plan workouts, and compare efforts across routes.' },
  ]
  
  const steps = [
    { title: 'Create your account', body: 'Sign up with email or a social account in seconds.' },
    { title: 'Connect a device or phone', body: 'Auto-sync from your watch or record with the app.' },
    { title: 'Run and get kudos', body: 'Track progress, join challenges, and have fun with friends.' },
  ]
  </script>
  
  <style scoped>
  /* Page always covers the viewport */
  .sport-page{
    width:100%;
    min-height:100vh;
    overflow-x:hidden;     /* kills horizontal scroll/gutters */
    background:#fff;
  }
  
  /* Tell the hero to fill the space between fixed nav + fixed footer */
  .hero{
    /* adjust these two numbers to your actual heights */
    --nav-h: 72px;         /* your fixed top nav height */
    --footer-h: 40px;      /* your fixed footer height */
  
    min-height: calc(100vh - var(--nav-h) - var(--footer-h));
    display:flex;
    align-items:center;
    background:#f7f5f2;
  }
  
  /* keep your content centered; this doesn't limit the hero background */
  .hero > .container-xxl{ padding:64px 16px; }
  
  /* keep the rest of your sections normal */
  .stats{ padding:32px 0; }
  .why, .features, .how{ padding:64px 0; }
  .cta{ padding:56px 0 72px; background:#f7f5f2; border-top:1px solid #eee; }
  
  /* tiny helpers you already had */
  .eyebrow{ letter-spacing:.08em; color:#6b7280; }
  .hero-art{ height:360px; background:linear-gradient(135deg,#d7dadf,#aeb4bd); border-radius:12px; }
  .btn-primary{
    --bs-btn-bg:#AA0505; --bs-btn-border-color:#AA0505;
    --bs-btn-hover-bg:#AA0505; --bs-btn-hover-border-color:#AA0505;
  }
  </style>
  
