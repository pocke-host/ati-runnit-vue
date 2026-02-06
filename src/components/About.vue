<!-- src/pages/About.vue -->
<template>
    <main class="about-page">
      <!-- HERO -->
      <section class="hero">
        <div class="container-xxl">
          <div class="row align-items-center g-4">
            <div class="col-12 col-lg-7">
              <p class="eyebrow">About RUNNIT</p>
              <h1 class="display-5 fw-bold mb-3">Movement with purpose.</h1>
              <p class="lead mb-4">
                We’re building the most welcoming place for athletes to show up,
                build momentum, and celebrate the journey together.
              </p>
              <div class="d-flex gap-3">
                <router-link to="/signup" class="btn btn-primary btn-lg">Join RUNNIT</router-link>
                <router-link to="/features" class="btn btn-outline-light btn-lg">Explore Features</router-link>
              </div>
            </div>
            <div class="col-12 col-lg-5">
              <div class="hero-art rounded-4"></div>
            </div>
          </div>
        </div>
      </section>
  
      <!-- MISSION -->
      <section class="mission">
        <div class="container-xxl">
          <div class="row g-5 align-items-center">
            <div class="col-12 col-lg-6">
              <h2 class="fw-bold mb-3">Our mission</h2>
              <p class="fs-5 text-muted mb-0">
                Help people build a sustainable habit through community, coaching,
                and a touch of friendly rivalry. When we move together, we go further.
              </p>
            </div>
            <div class="col-12 col-lg-6">
              <div class="mission-card rounded-4 p-4">
                <ul class="list-unstyled m-0">
                  <li class="d-flex align-items-start gap-3 mb-3" v-for="(point, i) in missionPoints" :key="i">
                    <i class="bi bi-check-circle-fill"></i>
                    <div class="small">{{ point }}</div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
  
      <!-- STATS -->
      <section class="stats">
        <div class="container-xxl">
          <div class="row text-center g-4">
            <div class="col-6 col-md-3" v-for="(s, i) in stats" :key="i">
              <div class="stat">
                <div class="value">{{ s.value }}</div>
                <div class="label">{{ s.label }}</div>
              </div>
            </div>
          </div>
        </div>
      </section>
  
      <!-- STORY / VALUES -->
      <section class="story">
        <div class="container-xxl">
          <div class="row g-5">
            <div class="col-12 col-lg-6">
              <h2 class="fw-bold mb-3">Our story</h2>
              <p class="text-muted">
                RUNNIT started with a simple idea: the best training partner is a community.
                We pair thoughtful coaching tools with a social layer that makes consistency fun.
                Whether it’s your first 5K or your fastest marathon, you’ll find your people here.
              </p>
              <p class="text-muted mb-0">
                We’re privacy-first, device-friendly, and relentlessly focused on making fitness stick—
                one session, one kudos, one small win at a time.
              </p>
            </div>
            <div class="col-12 col-lg-6">
              <h2 class="fw-bold mb-3">Our values</h2>
              <ul class="list-unstyled values m-0">
                <li v-for="(v, i) in values" :key="i" class="value-item">
                  <h6 class="mb-1">{{ v.title }}</h6>
                  <p class="text-muted small mb-0">{{ v.body }}</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
  
      <!-- TEAM (placeholder grid you can swap with real headshots) -->
      <section class="team">
        <div class="container-xxl">
          <div class="d-flex align-items-end justify-content-between mb-3">
            <h2 class="fw-bold m-0">Meet the team</h2>
          </div>
  
          <div class="row g-4">
            <div class="col-6 col-md-4 col-lg-3" v-for="n in 6" :key="n">
              <div class="team-card rounded-4 p-3">
                <div class="avatar rounded-3 mb-3"></div>
                <div class="fw-semibold">Teammate {{ n }}</div>
                <div class="text-muted small">Role title</div>
              </div>
            </div>
          </div>
        </div>
      </section>
  
      <!-- PRESS / CONTACT / CAREERS -->
      <section class="cta-band">
        <div class="container-xxl">
          <div class="row g-4">
            <div class="col-12 col-lg-4">
              <div class="mini-card rounded-4 p-4 h-100">
                <h5 class="fw-bold mb-2">Press</h5>
                <p class="text-muted mb-3">Media kit, logos, and story inquiries.</p>
                <a href="#" class="btn btn-outline-dark">Press resources</a>
              </div>
            </div>
            <div class="col-12 col-lg-4">
              <div class="mini-card rounded-4 p-4 h-100">
                <h5 class="fw-bold mb-2">Contact</h5>
                <p class="text-muted mb-3">We’d love to hear from you. Say hello.</p>
                <a href="#" class="btn btn-outline-dark">Get in touch</a>
              </div>
            </div>
            <div class="col-12 col-lg-4">
              <div class="mini-card rounded-4 p-4 h-100 highlight">
                <h5 class="fw-bold mb-2">Careers</h5>
                <p class="text-muted mb-3">Join a small team with big energy.</p>
                <router-link to="/careers" class="btn btn-primary">See open roles</router-link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </template>
  
  <script setup>
  const missionPoints = [
    'Community-first motivation that makes training stick.',
    'Coaching tools that fit your pace and life.',
    'Privacy you control. Your data, your rules.',
    'Device-friendly: bring your Garmin, Apple Watch, COROS, and more.',
  ]
  
  // stats should be dynamic
  const stats = [
    { value: '100M+', label: 'Athletes inspired' },
    { value: '30B+', label: 'Activities logged' },
    { value: '190+', label: 'Countries represented' },
    { value: '∞',    label: 'Kudos given' },
  ]
  
  const values = [
    { title: 'Athlete Obsession', body: 'We build with empathy for beginners and pros alike.' },
    { title: 'Consistency over Streaks', body: 'Small wins beat heroic efforts you can’t repeat.' },
    { title: 'Celebrate the Crew', body: 'Kudos matter. Progress is better with friends.' },
    { title: 'Trust by Default', body: 'Clear controls. No surprises with your data.' },
  ]
  </script>
  
  <style scoped>
  /* Layout wrapper */
  .about-page { background:#fff; }
  
  /* HERO */
  .hero {
    min-height: calc(100vh - 72px); /* fill below fixed top nav */
    display: flex; align-items: center;
    color:#fff;
    background:
      linear-gradient(0deg, rgba(128,0,128,.55), rgba(128,0,128,.55)),
      url('/images/about-hero.jpg') center/cover no-repeat;
    padding: 72px 0;
  }
  .eyebrow { text-transform:uppercase; letter-spacing:.08em; opacity:.9; margin-bottom:.5rem; }
  .hero-art { height: 320px; background: linear-gradient(135deg,#f3e8ff,#d8b4fe); }
  
  /* MISSION */
  .mission { padding: 64px 0; background:#fff; }
  .mission-card {
    background:#f8f9fb; border:1px solid #eee;
  }
  .mission-card .bi { color:#AA0505; font-size:1.1rem; margin-top:.15rem; }
  
  /* STATS */
  .stats { padding: 40px 0; background:#fff; }
  .stat .value { font-size: 32px; font-weight:800; }
  .stat .label { color:#6b7280; }
  
  /* STORY / VALUES */
  .story { padding: 64px 0; background:#fff; }
  .values .value-item { padding:12px 0; border-bottom:1px solid #f0f0f0; }
  .values .value-item:last-child { border-bottom:0; }
  
  /* TEAM */
  .team { padding: 64px 0; background:#fff; }
  .team-card { background:#f8f9fb; border:1px solid #eee; }
  .team-card .avatar { height:120px; background: #e9e3f3; }
  
  /* CTA band */
  .cta-band { padding: 56px 0 72px; background:#f7f5f2; border-top:1px solid #eee; }
  .mini-card { background:#fff; border:1px solid #eee; }
  .mini-card.highlight { border-color:#e7d4ff; box-shadow: 0 0 0 3px rgba(128,0,128,.08) inset; }
  
  /* Buttons (RUNNIT purple) */
  .btn-primary{
    --bs-btn-bg:#AA0505; --bs-btn-border-color:#AA0505;
    --bs-btn-hover-bg:#AA0505; --bs-btn-hover-border-color:#AA0505;
  }
  
  /* Links */
  .link { color:#AA0505; text-decoration:none; }
  .link:hover { text-decoration:underline; }
  
  /* Responsive tweaks */
  @media (max-width: 992px){
    .hero { min-height: 70vh; padding: 48px 0; }
    .hero-art { height:220px; }
  }
  </style>
  