<!-- src/pages/Home.vue -->
<template>
    <main class="home-page">
      <!-- HERO SECTION -->
      <!-- the prominent, large-scale visual element at the top of a webpage that immediately grabs 
      a visitor's attention to convey the site's purpose and valu -->
      <section class="hero">
        <div class="container-xxl">
          <div class="row align-items-center g-4">
            <div class="col-12 col-lg-6">
              <p class="eyebrow text-uppercase fw-semibold mb-2">Movement with purpose.</p>
              <h1 class="display-4 fw-bold mb-3">Personalized AI plans + the world’s best community</h1>
              <p class="lead text-muted mb-4">
                Get a training plan that adapts to you, then log every run and earn kudos. One place for maps,
                progress, and motivation.
              </p>
              <div class="d-flex flex-wrap gap-3">
                <router-link to="/join-us" class="btn btn-primary btn-lg">Start Free</router-link>
                <router-link to="/features" class="btn btn-outline-dark btn-lg">See Features</router-link>
              </div>
              <div class="badges d-flex flex-wrap gap-3 mt-4">
                <span class="badge-pill"><i class="bi bi-person-check me-2"></i>AI-guided</span>
                <span class="badge-pill"><i class="bi bi-activity me-2"></i>Device friendly</span>
                <span class="badge-pill"><i class="bi bi-shield-check me-2"></i>Privacy controls</span>
              </div>
            </div>
            <div class="col-12 col-lg-6">
              <div class="hero-art rounded-4">
                <!-- Placeholder “app preview” blocks -->
                <div class="phone-card">
                  <div class="phone-header">
                    <div class="dot"></div><div class="dot"></div><div class="dot"></div>
                  </div>
                  <div class="phone-body">
                    <div class="line w-75"></div>
                    <div class="line w-50"></div>
                    <div class="chart"></div>
                    <div class="line w-100"></div>
                    <div class="line w-60"></div>
                  </div>
                </div>
                <div class="floating-card card-1"></div>
                <div class="floating-card card-2"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
  
      <!-- TRUST BAR -->
      <section class="trust">
        <div class="container-xxl">
          <div class="row g-3 align-items-center justify-content-center text-center gap-2">
            <div class="col-auto small text-muted">Works with</div>
            <div class="col-auto device-pill">Garmin</div>
            <div class="col-auto device-pill">Apple&nbsp;Watch</div>
            <div class="col-auto device-pill">COROS</div>
            <div class="col-auto device-pill">Wahoo</div>
            <div class="col-auto device-pill">Suunto</div>
          </div>
        </div>
      </section>
  
      <!-- PROGRAMS (Runna vibe) -->
      <section class="programs">
        <div class="container-xxl">
          <div class="d-flex justify-content-between align-items-end mb-3">
            <h2 class="fw-bold m-0">Plans for every goal</h2>
            <router-link to="/features" class="link">Browse all</router-link>
          </div>
  
          <div class="program-row">
            <article v-for="(p, i) in programs" :key="i" class="program-card">
              <div class="program-art"></div>
              <div class="program-body">
                <div class="tag">{{ p.level }}</div>
                <h3 class="h5 fw-bold mb-1">{{ p.title }}</h3>
                <p class="text-muted small mb-2">{{ p.subtitle }}</p>
                <div class="meta small">
                  <span><i class="bi bi-calendar-week me-1"></i>{{ p.weeks }} weeks</span>
                  <span class="ms-3"><i class="bi bi-graph-up-arrow me-1"></i>Progressive</span>
                </div>
              </div>
              <router-link class="btn btn-outline-dark w-100 mt-3" to="/signup">Start plan</router-link>
            </article>
          </div>
        </div>
      </section>
  
      <!-- COMMUNITY / FEATURES (Strava vibe) -->
      <section class="community">
        <div class="container-xxl">
          <div class="row g-4 align-items-center">
            <div class="col-12 col-lg-6">
              <h2 class="fw-bold mb-3">Maps, segments, and kudos</h2>
              <p class="text-muted">
                Discover the best routes with heatmaps, track segment efforts, and share progress with friends and clubs.
              </p>
              <ul class="list-unstyled mt-3">
                <li class="why-item"><i class="bi bi-map me-2"></i>Explore routes with surfaces & elevation</li>
                <li class="why-item"><i class="bi bi-flag me-2"></i>Chase PRs on local segments</li>
                <li class="why-item"><i class="bi bi-heart-fill me-2"></i>Stay motivated with kudos & challenges</li>
              </ul>
            </div>
            <div class="col-12 col-lg-6">
              <div class="community-art rounded-4"></div>
            </div>
          </div>
        </div>
      </section>
  
      <!-- TESTIMONIALS -->
      <section class="testimonials">
        <div class="container-xxl">
          <div class="row g-4">
            <div v-for="(t, i) in testimonials" :key="i" class="col-12 col-lg-4">
              <div class="quote-card h-100">
                <p class="mb-2">“{{ t.quote }}”</p>
                <div class="small text-muted">— {{ t.author }}</div>
              </div>
            </div>
          </div>
        </div>
      </section>
  
      <!-- CTA -->
      <section class="cta">
        <div class="container-xxl text-center">
          <h2 class="fw-bold mb-2">Ready to get moving?</h2>
          <p class="text-muted mb-4">Join free, connect your device, and start your first plan today.</p>
          <router-link to="/join-us" class="btn btn-primary btn-lg">Join Free</router-link>
        </div>
      </section>
    </main>
  </template>
  
  <script setup>
  const programs = [
    { title: 'Beginner 5K', level: 'Beginner', subtitle: 'Build consistency and finish strong', weeks: 8 },
    { title: '10K Improvement', level: 'Intermediate', subtitle: 'Get faster with structured sessions', weeks: 10 },
    { title: 'Half Marathon', level: 'Intermediate', subtitle: 'Balance volume and recovery', weeks: 12 },
    { title: 'Marathon Performance', level: 'Advanced', subtitle: 'Dial in pacing & long runs', weeks: 16 },
  ]
  
  const testimonials = [
    { quote: 'The plan adapted around my schedule and I finally nailed my 5K PR.', author: 'Bill H.' },
    { quote: 'Weekly insights made me more consistent than ever.', author: 'Regina D.' },
    { quote: 'Routes, segments, and my watch all in one place — super motivating.', author: 'Sophia D.' },
  ]
  </script>
  
  <style scoped>
  /* Page baseline */
  .home-page{
    min-height:100vh;
    width:100%;
    background:#fff;
    overflow-x:hidden;
  }
  
  /* HERO (fills between your fixed TopNav/Footer) */
  .hero{
    --nav-h:72px;    /* adjust to your TopNav */
    --footer-h:40px; /* adjust to your Footer */
    min-height:calc(100vh - var(--nav-h) - var(--footer-h));
    display:flex; align-items:center;
    background:#f7f5f2;
    padding:64px 0;
  }
  .eyebrow{ letter-spacing:.08em; color:#6b7280; }
  .hero-art{
    position:relative; height:420px; background:linear-gradient(135deg,#e6e9ee,#c7ccd5);
  }
  .phone-card{
    position:absolute; right:24px; bottom:24px; width:260px; border-radius:18px;
    background:#fff; box-shadow:0 12px 30px rgba(0,0,0,.15); overflow:hidden;
  }
  .phone-header{ display:flex; gap:6px; padding:10px 12px; background:#f3f4f6; }
  .phone-header .dot{ width:8px; height:8px; border-radius:50%; background:#d1d5db; }
  .phone-body{ padding:14px; }
  .phone-body .line{ height:10px; background:#e5e7eb; border-radius:6px; margin:.4rem 0; }
  .phone-body .chart{ height:120px; border-radius:10px; background:repeating-linear-gradient(0deg,#f1f3f5,#f1f3f5 10px,#e9ecef 10px,#e9ecef 20px); margin:8px 0 12px; }
  .floating-card{
    position:absolute; border-radius:14px; background:#fff; box-shadow:0 12px 30px rgba(0,0,0,.12);
  }
  .card-1{ left:24px; top:24px; width:160px; height:110px; }
  .card-2{ left:64px; bottom:40px; width:120px; height:80px; }
  
  /* TRUST BAR */
  .trust{ padding:16px 0; background:#fff; border-top:1px solid #eee; border-bottom:1px solid #eee; }
  .device-pill{
    display:inline-block; padding:6px 12px; border-radius:999px; background:#fff; border:1px solid #e5e7eb; font-weight:600;
  }
  
  /* PROGRAMS (horiz scroll like a carousel without JS) */
  .programs{ padding:48px 0; }
  .program-row{
    display:grid; grid-auto-flow:column; grid-auto-columns:minmax(260px, 1fr); gap:16px;
    overflow-x:auto; padding-bottom:6px; scroll-snap-type:x mandatory;
  }
  .program-row::-webkit-scrollbar{ height:8px; }
  .program-row::-webkit-scrollbar-thumb{ background:#ddd; border-radius:999px; }
  .program-card{
    display:flex; flex-direction:column; scroll-snap-align:start;
    border:1px solid #eee; border-radius:14px; padding:12px; background:#fff; min-height:260px;
  }
  .program-art{ height:110px; border-radius:10px; background:linear-gradient(135deg,#f1f3f5,#e9ecef); margin-bottom:10px; }
  .program-body .tag{
    display:inline-block; font-size:.75rem; padding:.15rem .5rem; border-radius:999px;
    background:#fff3eb; color:#b93800; border:1px solid #ffd8bf; margin-bottom:6px;
  }
  
  /* COMMUNITY */
  .community{ padding:56px 0; background:#fff; }
  .why-item{ padding:.4rem 0; color:#333; }
  .community-art{ height:320px; background:linear-gradient(135deg,#e8eaee,#d5dae3); }
  
  /* TESTIMONIALS */
  .testimonials{ padding:48px 0; background:#fff; }
  .quote-card{
    border:1px solid #eee; border-radius:12px; padding:16px; background:#fff;
  }
  
  /* CTA */
  .cta{
    background:#f7f5f2; padding:56px 0 72px; border-top:1px solid #eee; text-align:center;
  }
  
  /* Brand button color (Strava-ish) */
  .btn-primary {
  --bs-btn-bg: #AA0505;              /* KINETAI purple */
  --bs-btn-border-color: #AA0505;
  --bs-btn-hover-bg: #AA0505;        /* darker purple on hover */
  --bs-btn-hover-border-color: #AA0505;
}

  /* Small helpers */
  .link{ color:#fc4c02; text-decoration:none; }
  .link:hover{ text-decoration:underline; }
  </style>
  