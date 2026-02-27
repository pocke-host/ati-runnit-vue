<!-- src/pages/Features.vue -->
<template>
  <main class="features-page">
    <!-- HERO -->
    <section class="hero">
      <div class="container-xxl">
        <div class="row align-items-center g-4">
          <div class="col-12 col-lg-6">
            <p class="eyebrow text-uppercase fw-semibold mb-2">Simulation mode: ON</p>
            <h1 class="display-5 fw-bold mb-3">Systems that build the habit.</h1>
            <p class="lead text-muted mb-4">
              RUNNIT isn’t just tracking. It turns training into a “Workout Moment” — the route, the photo,
              and the reason you showed up. Progress feels like leveling up.
            </p>
            <div class="d-flex gap-3">
              <router-link to="/signup" class="btn btn-primary btn-lg">Start Your Moment</router-link>
              <router-link to="/join-us" class="btn btn-outline-dark btn-lg">See It In Action</router-link>
            </div>
          </div>
          <div class="col-12 col-lg-6">
            <div class="hero-art rounded-4">
              <div class="hud-label">MODULE PREVIEW</div>

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
        <h2 class="fw-bold text-center mb-4">Your whole loop, in one place</h2>
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
        <h2 class="fw-bold mb-2">Ready to run the loop?</h2>
        <p class="text-muted mb-4">Create an account, post your first Moment, and start stacking days.</p>
        <router-link to="/signup" class="btn btn-primary btn-lg">Enter Simulation</router-link>
        <p class="small text-muted mt-3 mb-0">By continuing you agree to our Terms and Privacy Policy.</p>
      </div>
    </section>
  </main>
</template>

<script setup>
const bigGrid = [
  {
    title: 'Workout Moments',
    body: 'Capture the daily moment: photo + route + a line about why you showed up. Training becomes memory, not noise.',
  },
  {
    title: 'Streaks & Challenges',
    body: 'Consistency is the game. Stack days, complete weekly missions, and keep the loop alive.',
  },
  {
    title: 'Progress Systems',
    body: 'Track your trends without drowning in dashboards. See what’s improving and what needs recovery.',
  },
  {
    title: 'Community Signal',
    body: 'Follow the people who motivate you. Celebrate discipline, not perfection.',
  },
  {
    title: 'Adaptive Plans (Coming Soon)',
    body: 'Plans that adjust to your schedule and fitness — designed to keep you progressing without burning out.',
  },
]

const modules = [
  { icon: 'bi bi-camera',            title: 'Moments',        body: 'Post the workout moment with a photo + route snapshot.' },
  { icon: 'bi bi-map',               title: 'Route Snapshots', body: 'Save routes, elevation, and surfaces — simple and clean.' },
  { icon: 'bi bi-lightning-charge',  title: 'Streaks',        body: 'Keep your loop alive. Breakthroughs come from showing up.' },
  { icon: 'bi bi-trophy',            title: 'Challenges',     body: 'Weekly missions that build consistency and mental toughness.' },
  { icon: 'bi bi-people',            title: 'Community',      body: 'Clubs + friends that push you forward without the noise.' },
  { icon: 'bi bi-shield-lock',       title: 'Privacy',        body: 'Control what’s visible and where. Your data stays yours.' },
]
</script>

<style scoped>
/* =========================
   RUNNIT Retro Simulation HUD Skin (Features page)
   Layout unchanged — just vibe + copy.
   ========================= */

/* Page baseline */
.features-page{
  --r-olive: #5A6B4E;
  --r-olive-deep: #2C3726;
  --r-black: #0F1210;
  --r-stone: #A3A69F;
  --r-offwhite: #F5F6F3;
  --r-white: #FFFFFF;
  --r-accent: #C46A2A;

  --hud-green: #BEE7C2;
  --hud-line: rgba(190,231,194,0.22);

  min-height:100vh;
  width:100%;
  background: var(--r-offwhite);
  overflow-x:hidden;

  font-family: Futura, "Futura PT", "Futura Std", "Avenir Next", Avenir,
    system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
}

/* ---- HERO ---- */
.hero{
  --nav-h:72px;
  --footer-h:40px;
  min-height:calc(100vh - var(--nav-h) - var(--footer-h));
  display:flex;
  align-items:center;
  padding:64px 0;
  position:relative;
  overflow:hidden;

  background:
    radial-gradient(900px 420px at 18% 18%, rgba(255,255,255,0.10), rgba(255,255,255,0) 60%),
    radial-gradient(900px 420px at 85% 30%, rgba(196,106,42,0.10), rgba(196,106,42,0) 60%),
    linear-gradient(135deg, var(--r-olive), var(--r-olive-deep));
}

/* Pixel grid */
.hero::before{
  content:"";
  position:absolute;
  inset:-2px;
  pointer-events:none;
  opacity:.40;
  background:
    linear-gradient(var(--hud-line) 1px, transparent 1px),
    linear-gradient(90deg, var(--hud-line) 1px, transparent 1px);
  background-size: 28px 28px;
  mix-blend-mode: overlay;
}

/* Scanlines */
.hero::after{
  content:"";
  position:absolute;
  inset:0;
  pointer-events:none;
  opacity:.22;
  background: repeating-linear-gradient(
    180deg,
    rgba(255,255,255,0.06),
    rgba(255,255,255,0.06) 2px,
    rgba(0,0,0,0.05) 3px,
    rgba(0,0,0,0.05) 6px
  );
  mix-blend-mode: soft-light;
}

.eyebrow{
  letter-spacing:.18em;
  color: rgba(190,231,194,0.92);
  text-shadow: 0 0 14px rgba(190,231,194,0.22);
  text-transform: uppercase;
}

.hero :deep(h1){
  color: var(--r-white);
  text-shadow: 0 10px 40px rgba(15,18,16,0.35);
}

.hero :deep(.lead),
.hero :deep(.text-muted){
  color: rgba(255,255,255,0.74) !important;
}

/* Buttons = game UI */
.btn{
  border-radius: 14px;
  font-weight: 800;
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

/* Hero art = simulator panel */
.hero-art{
  height:360px;
  position:relative;
  overflow:hidden;

  background:
    radial-gradient(700px 260px at 30% 20%, rgba(255,255,255,0.14), rgba(255,255,255,0) 60%),
    radial-gradient(800px 320px at 80% 80%, rgba(15,18,16,0.35), rgba(15,18,16,0) 60%),
    linear-gradient(135deg, rgba(255,255,255,0.09), rgba(255,255,255,0.03));
  border: 1px solid rgba(190,231,194,0.22);
  box-shadow: 0 26px 70px rgba(15,18,16,0.34);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

/* HUD label */
.hud-label{
  position:absolute;
  top:14px;
  left:14px;
  padding: 6px 10px;
  border-radius: 12px;
  background: rgba(15,18,16,0.22);
  border: 1px solid rgba(190,231,194,0.22);
  color: rgba(190,231,194,0.90);
  font-weight: 900;
  letter-spacing: .14em;
  font-size: .72rem;
}

/* Phone card (reuse from home vibe) */
.phone-card{
  position:absolute; right:18px; bottom:18px; width:250px; border-radius:16px;
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
.phone-body .line{
  height:10px;
  background: rgba(190,231,194,0.14);
  border-radius: 8px;
  margin:.45rem 0;
}
.phone-body .chart{
  height:110px;
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

/* Floating modules */
.floating-card{
  position:absolute;
  border-radius:14px;
  background: rgba(15,18,16,0.18);
  border: 1px solid rgba(190,231,194,0.18);
  box-shadow:0 18px 46px rgba(15,18,16,.30);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
.card-1{ left:18px; top:22px; width:170px; height:120px; }
.card-2{ left:72px; bottom:62px; width:130px; height:90px; }

/* ---- BIG CARD GRID ---- */
.grid{ padding:56px 0; background:#fff; }
.card-feature{
  border: 1px solid rgba(15,18,16,0.10);
  border-radius: 16px;
  overflow:hidden;
  box-shadow: 0 12px 30px rgba(15,18,16,0.06);
}
.card-art{
  height:180px;
  background:
    linear-gradient(rgba(190,231,194,0.10) 1px, transparent 1px),
    linear-gradient(90deg, rgba(190,231,194,0.10) 1px, transparent 1px),
    radial-gradient(520px 220px at 20% 20%, rgba(90,107,78,0.30), rgba(90,107,78,0) 60%),
    radial-gradient(420px 190px at 80% 60%, rgba(196,106,42,0.20), rgba(196,106,42,0) 60%),
    #f8faf8;
  background-size: 22px 22px, 22px 22px, auto, auto, auto;
}

/* ---- MODULES ---- */
.modules{ padding:56px 0; background:#fff; }
.module{
  padding:16px;
  border: 1px solid rgba(15,18,16,0.10);
  border-radius: 16px;
  background:#fff;
  box-shadow: 0 12px 30px rgba(15,18,16,0.06);
}
.module-icon{
  font-size:1.5rem;
  color: var(--r-accent);
}

/* ---- DEVICES STRIP ---- */
.devices{ padding:40px 0; background:#f7f5f2; }
.device-pill{
  display:inline-block;
  padding:8px 14px;
  border-radius:12px;
  background:#fff;
  border:1px solid rgba(15,18,16,0.10);
  font-weight:800;
  letter-spacing: .06em;
  text-transform: uppercase;
}

/* ---- CTA ---- */
.cta{
  padding:64px 0 80px;
  background:#fff;
  border-top:1px solid rgba(15,18,16,0.08);
  text-align:center;
}
</style>
