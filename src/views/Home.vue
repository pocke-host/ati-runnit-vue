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
            <h1 class="display-4 fw-bold mb-3">Train. Capture the Moment. Level up.</h1>
            <p class="lead text-muted mb-4">
              RUNNIT is the mirror for your growth.
            </p>
            <div class="d-flex flex-wrap gap-3">
              <router-link to="/join-us" class="btn btn-primary btn-lg">Start Your Moment</router-link>
              <router-link to="/features" class="btn btn-outline-dark btn-lg">See How It Works</router-link>
            </div>
            <div class="badges d-flex flex-wrap gap-3 mt-4">
              <span class="badge-pill"><i class="bi bi-camera me-2"></i>Workout Moments</span>
              <span class="badge-pill"><i class="bi bi-map me-2"></i>Route snapshots</span>
              <span class="badge-pill"><i class="bi bi-lightning-charge me-2"></i>Streaks & challenges</span>
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
/* =========================
   RUNNIT: Retro Simulation HUD Skin (Homepage-only)
   Layout unchanged — just vibes.
   ========================= */

/* ===== Tokens ===== */
.home-page{
  --r-olive: #5A6B4E;
  --r-olive-deep: #2C3726;
  --r-black: #0F1210;
  --r-stone: #A3A69F;
  --r-offwhite: #F5F6F3;
  --r-white: #FFFFFF;
  --r-accent: #C46A2A; /* burnt orange */

  /* HUD accents */
  --hud-green: #BEE7C2; /* soft phosphor green */
  --hud-cyan: #8FE4D6;  /* optional secondary glow */
  --hud-line: rgba(190,231,194,0.22);

  min-height:100vh;
  width:100%;
  background: var(--r-offwhite);
  overflow-x:hidden;

  /* Keep your Futura vibe but shift to "system simulation" feel */
  font-family: Futura, "Futura PT", "Futura Std", "Avenir Next", Avenir,
    system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
}

/* ===== HERO: Simulation Screen ===== */
.hero{
  --nav-h:72px;
  --footer-h:40px;
  min-height:calc(100vh - var(--nav-h) - var(--footer-h));
  display:flex; align-items:center;
  padding:64px 0;
  position: relative;
  overflow: hidden;

  /* Base cinematic olive */
  background:
    radial-gradient(900px 420px at 18% 18%, rgba(255,255,255,0.10), rgba(255,255,255,0) 60%),
    radial-gradient(900px 420px at 85% 30%, rgba(196,106,42,0.10), rgba(196,106,42,0) 60%),
    linear-gradient(135deg, var(--r-olive), var(--r-olive-deep));
}

/* Pixel-grid overlay (subtle, not tacky) */
.hero::before{
  content:"";
  position:absolute;
  inset:-2px;
  pointer-events:none;
  opacity: 0.40;
  background:
    linear-gradient(var(--hud-line) 1px, transparent 1px),
    linear-gradient(90deg, var(--hud-line) 1px, transparent 1px);
  background-size: 28px 28px;
  mix-blend-mode: overlay;
}

/* Scanlines overlay */
.hero::after{
  content:"";
  position:absolute;
  inset:0;
  pointer-events:none;
  opacity: 0.24;
  background: repeating-linear-gradient(
    180deg,
    rgba(255,255,255,0.06),
    rgba(255,255,255,0.06) 2px,
    rgba(0,0,0,0.05) 3px,
    rgba(0,0,0,0.05) 6px
  );
  mix-blend-mode: soft-light;
}

/* Make hero copy read like a HUD */
.eyebrow{
  letter-spacing:.18em;
  color: rgba(190,231,194,0.92);
  text-shadow: 0 0 14px rgba(190,231,194,0.25);
}

.hero :deep(h1){
  color: var(--r-white);
  letter-spacing: .02em;
  text-shadow: 0 10px 40px rgba(15,18,16,0.35);
}

/* “System text” feel */
.hero :deep(.lead){
  color: rgba(255,255,255,0.78) !important;
}
.hero :deep(.text-muted){
  color: rgba(255,255,255,0.70) !important;
}

/* ===== Buttons: chunky “game UI” buttons ===== */
.btn{
  border-radius: 14px;
  font-weight: 700;
  letter-spacing: .04em;
  text-transform: uppercase;
  padding: 0.9rem 1.15rem;
  box-shadow: 0 12px 34px rgba(15,18,16,0.25);
}

.btn-primary{
  --bs-btn-bg: var(--r-accent);
  --bs-btn-border-color: rgba(255,255,255,0.12);
  --bs-btn-hover-bg: #a85722;
  --bs-btn-hover-border-color: rgba(255,255,255,0.12);
  position: relative;
}

/* pixel-ish edge + highlight */
.btn-primary::before{
  content:"";
  position:absolute;
  inset:2px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.18);
  pointer-events:none;
}

.hero :deep(.btn-outline-dark){
  --bs-btn-color: rgba(190,231,194,0.95);
  --bs-btn-border-color: rgba(190,231,194,0.40);
  --bs-btn-hover-bg: rgba(190,231,194,0.10);
  --bs-btn-hover-border-color: rgba(190,231,194,0.55);
  --bs-btn-hover-color: rgba(255,255,255,0.95);
}

/* ===== Badges: HUD chips ===== */
.badge-pill{
  display:inline-flex;
  align-items:center;
  padding:9px 12px;
  border-radius: 12px;
  background: rgba(15,18,16,0.18);
  border: 1px solid rgba(190,231,194,0.22);
  color: rgba(190,231,194,0.92);
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
  box-shadow: 0 10px 26px rgba(15,18,16,0.25);
}

/* ===== Hero Art: make it a “simulator panel” ===== */
.hero-art{
  position:relative;
  height:420px;
  overflow:hidden;

  /* glass + depth */
  background:
    radial-gradient(700px 260px at 30% 20%, rgba(255,255,255,0.14), rgba(255,255,255,0) 60%),
    radial-gradient(800px 320px at 80% 80%, rgba(15,18,16,0.35), rgba(15,18,16,0) 60%),
    linear-gradient(135deg, rgba(255,255,255,0.09), rgba(255,255,255,0.03));
  border: 1px solid rgba(190,231,194,0.22);
  box-shadow: 0 26px 70px rgba(15,18,16,0.34);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

/* HUD frame corners (feels like a game panel) */
.hero-art::before{
  content:"";
  position:absolute;
  inset:12px;
  border-radius: 16px;
  border: 1px dashed rgba(190,231,194,0.28);
  pointer-events:none;
  opacity: .9;
}
.hero-art::after{
  content:"";
  position:absolute;
  inset:0;
  pointer-events:none;
  background:
    repeating-linear-gradient(
      90deg,
      rgba(190,231,194,0.06),
      rgba(190,231,194,0.06) 1px,
      transparent 1px,
      transparent 18px
    );
  opacity: .35;
  mix-blend-mode: overlay;
}

/* Phone card becomes “terminal window” */
.phone-card{
  position:absolute; right:24px; bottom:24px; width:260px; border-radius:16px;
  background: rgba(15,18,16,0.28);
  border: 1px solid rgba(190,231,194,0.22);
  box-shadow:0 20px 60px rgba(15,18,16,.40);
  overflow:hidden;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
.phone-header{
  display:flex; gap:6px; padding:10px 12px;
  background: rgba(15,18,16,0.40);
  border-bottom: 1px solid rgba(190,231,194,0.18);
}
.phone-header .dot{
  width:8px; height:8px; border-radius:3px;
  background: rgba(190,231,194,0.35);
  box-shadow: 0 0 10px rgba(190,231,194,0.18);
}
.phone-body{ padding:14px; }

/* “Data lines” feel */
.phone-body .line{
  height:10px;
  background: rgba(190,231,194,0.14);
  border-radius: 8px;
  margin:.45rem 0;
}

/* chart = grid telemetry */
.phone-body .chart{
  height:120px;
  border-radius:12px;
  border: 1px solid rgba(190,231,194,0.18);
  background:
    linear-gradient(rgba(190,231,194,0.10) 1px, transparent 1px),
    linear-gradient(90deg, rgba(190,231,194,0.10) 1px, transparent 1px),
    radial-gradient(400px 160px at 20% 20%, rgba(196,106,42,0.18), rgba(196,106,42,0) 60%),
    rgba(15,18,16,0.18);
  background-size: 18px 18px, 18px 18px, auto, auto;
  margin:10px 0 14px;
}

/* Floating cards = “modules” */
.floating-card{
  position:absolute;
  border-radius:14px;
  background: rgba(15,18,16,0.18);
  border: 1px solid rgba(190,231,194,0.18);
  box-shadow:0 18px 46px rgba(15,18,16,.30);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
.card-1{ left:24px; top:24px; width:160px; height:110px; }
.card-2{ left:64px; bottom:40px; width:120px; height:80px; }

/* ===== TRUST BAR: make it feel like device “compatibility” readout ===== */
.trust{
  padding:16px 0;
  background:#fff;
  border-top:1px solid rgba(15,18,16,0.08);
  border-bottom:1px solid rgba(15,18,16,0.08);
}
.device-pill{
  display:inline-block;
  padding:6px 12px;
  border-radius:12px;
  background: rgba(15,18,16,0.03);
  border:1px solid rgba(15,18,16,0.10);
  font-weight:800;
  letter-spacing: .06em;
  text-transform: uppercase;
}

/* ===== PROGRAMS: keep your layout, add “card system” polish ===== */
.programs{ padding:48px 0; }
.program-row{
  display:grid; grid-auto-flow:column; grid-auto-columns:minmax(260px, 1fr); gap:16px;
  overflow-x:auto; padding-bottom:6px; scroll-snap-type:x mandatory;
}
.program-row::-webkit-scrollbar{ height:8px; }
.program-row::-webkit-scrollbar-thumb{ background:#ddd; border-radius:999px; }

.program-card{
  display:flex; flex-direction:column; scroll-snap-align:start;
  border:1px solid rgba(15,18,16,0.10);
  border-radius:16px;
  padding:12px;
  background:#fff;
  min-height:260px;
  box-shadow: 0 12px 30px rgba(15,18,16,0.06);
}

.program-art{
  height:110px;
  border-radius:12px;
  border: 1px solid rgba(15,18,16,0.08);
  background:
    linear-gradient(135deg, rgba(90,107,78,0.20), rgba(15,18,16,0.03)),
    radial-gradient(380px 150px at 20% 20%, rgba(196,106,42,0.20), rgba(196,106,42,0) 60%);
  margin-bottom:10px;
}

/* tag = “difficulty badge” */
.program-body .tag{
  display:inline-block;
  font-size:.72rem;
  padding:.20rem .55rem;
  border-radius:10px;
  background: rgba(190,231,194,0.22);
  color: rgba(15,18,16,0.78);
  border: 1px solid rgba(15,18,16,0.08);
  font-weight:800;
  letter-spacing: .10em;
  text-transform: uppercase;
  margin-bottom:6px;
}

/* ===== COMMUNITY / TESTIMONIALS / CTA: keep your structure ===== */
.community{ padding:56px 0; background:#fff; }
.why-item{ padding:.4rem 0; color:#333; }
.community-art{
  height:320px;
  border-radius:16px;
  border: 1px solid rgba(15,18,16,0.08);
  background:
    linear-gradient(135deg, rgba(90,107,78,0.18), rgba(15,18,16,0.03)),
    linear-gradient(0deg, rgba(196,106,42,0.10), rgba(196,106,42,0));
}

.testimonials{ padding:48px 0; background:#fff; }
.quote-card{
  border:1px solid rgba(15,18,16,0.10);
  border-radius:16px;
  padding:16px;
  background:#fff;
  box-shadow: 0 12px 30px rgba(15,18,16,0.06);
}

.cta{
  background:#f7f5f2;
  padding:56px 0 72px;
  border-top:1px solid rgba(15,18,16,0.08);
  text-align:center;
}

/* Link uses accent */
.link{ color: var(--r-accent); text-decoration:none; font-weight:800; letter-spacing:.06em; text-transform: uppercase; }
.link:hover{ text-decoration:underline; }
</style>
