<!-- src/pages/SportRunning.vue -->
<template>
  <main class="sport-page">
    <section class="hero">
      <div class="container-xxl">
        <div class="row align-items-center g-5">
          <div class="col-12 col-lg-6">
            <p class="eyebrow text-uppercase fw-semibold mb-2">Sport module</p>
            <h1 class="display-5 fw-bold mb-3">Running</h1>
            <p class="lead mb-4">
              Log the miles. Watch your trends. Stack wins.
              RUNNIT turns training into a simple loop you can repeat — and actually enjoy.
            </p>

            <div class="d-flex gap-3 flex-wrap">
              <router-link to="/join-us" class="btn btn-primary btn-lg">Start your loop</router-link>
              <router-link to="/features" class="btn btn-outline-dark btn-lg">See tools</router-link>
            </div>

            <div class="micro mt-4">
              <span class="micro-pill"><i class="bi bi-lightning-charge me-2"></i>Momentum</span>
              <span class="micro-pill"><i class="bi bi-graph-up-arrow me-2"></i>Progress</span>
              <span class="micro-pill"><i class="bi bi-people me-2"></i>Community</span>
            </div>

            <p class="small mt-3 mb-0 subtle">
              By continuing you agree to our Terms and Privacy Policy.
            </p>
          </div>

          <div class="col-12 col-lg-6">
            <!-- same box, new feel -->
            <div class="hero-art rounded-4" aria-hidden="true">
              <div class="hud">
                <div class="hud-kicker">RUN MODE</div>
                <div class="hud-row">
                  <div class="hud-stat">
                    <div class="hud-label">Streak</div>
                    <div class="hud-value">—</div>
                  </div>
                  <div class="hud-stat">
                    <div class="hud-label">Focus</div>
                    <div class="hud-value">Z2</div>
                  </div>
                  <div class="hud-stat">
                    <div class="hud-label">Goal</div>
                    <div class="hud-value">Base</div>
                  </div>
                </div>
                <div class="hud-bar">
                  <span class="hud-fill"></span>
                </div>
                <div class="hud-sub">Set your plan. Hit the run. Sync the win.</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- WHY RUNNERS USE IT -->
    <section class="why">
      <div class="container-xxl">
        <div class="row align-items-center g-5">
          <div class="col-12 col-lg-5">
            <h2 class="fw-bold mb-3">Why runners choose RUNNIT</h2>
            <p class="text-muted mb-4">
              We’re not here for noise — we’re here for repeatable progress.
              Clear data, clean motivation, and a community that keeps you moving.
            </p>
            <ul class="list-unstyled m-0">
              <li class="why-item">
                <i class="bi bi-map me-3"></i>
                Explore routes with surfaces, elevation, and “save for later” planning.
              </li>
              <li class="why-item">
                <i class="bi bi-graph-up-arrow me-3"></i>
                See trends that actually matter: pace, consistency, and weekly load.
              </li>
              <li class="why-item">
                <i class="bi bi-heart-fill me-3"></i>
                Get kudos, join a challenge, and keep the loop alive.
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
  { title: 'Routes & Maps', body: 'Find the best places to run with surfaces, elevation, and saved routes.' },
  { title: 'Pace & Splits', body: 'Auto-splits and trends that show improvement over time.' },
  { title: 'Clubs & Challenges', body: 'Join groups, stack badges, and stay consistent together.' },
  { title: 'Device Friendly', body: 'Sync with Garmin, Apple Watch, COROS, Wahoo, and more.' },
  { title: 'Beacon Safety', body: 'Share your live location with trusted contacts while you’re out.' },
  { title: 'Training Tools', body: 'Set goals, build weeks, and keep your plan simple and repeatable.' },
]

const steps = [
  { title: 'Create your account', body: 'Sign up in seconds. Keep it simple.' },
  { title: 'Connect a device or phone', body: 'Auto-sync from your watch or record straight in app.' },
  { title: 'Run → sync → repeat', body: 'Track progress, join challenges, and keep momentum alive.' },
]
</script>

<style scoped>
.sport-page{
  --r-olive:#5A6B4E;
  --r-olive-deep:#2C3726;
  --r-black:#0F1210;
  --r-stone:#A3A69F;
  --r-offwhite:#F5F6F3;
  --r-white:#FFFFFF;
  --r-accent:#C46A2A;

  width:100%;
  min-height:100vh;
  overflow-x:hidden;
  background: var(--r-offwhite);

  font-family: Futura, "Futura PT", "Futura Std", "Avenir Next", Avenir,
    system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
}

/* HERO fills between fixed nav/footer */
.hero{
  --nav-h: 72px;
  --footer-h: 40px;
  min-height: calc(100vh - var(--nav-h) - var(--footer-h));
  display:flex;
  align-items:center;
  padding: 64px 0;

  background:
    radial-gradient(900px 420px at 18% 18%, rgba(255,255,255,0.12), rgba(255,255,255,0) 60%),
    radial-gradient(900px 420px at 85% 30%, rgba(196,106,42,0.10), rgba(196,106,42,0) 60%),
    linear-gradient(135deg, var(--r-olive), var(--r-olive-deep));
  color: var(--r-white);
}
.hero > .container-xxl{ padding: 0 16px; }

.eyebrow{
  letter-spacing:.16em;
  color: rgba(255,255,255,0.82);
}
.hero :deep(.lead){ color: rgba(255,255,255,0.76) !important; }
.subtle{ color: rgba(255,255,255,0.72); }

/* Hero art = glass HUD (subtle sim vibe) */
.hero-art{
  height: 360px;
  position: relative;
  overflow: hidden;

  background:
    radial-gradient(700px 260px at 30% 20%, rgba(255,255,255,0.16), rgba(255,255,255,0) 60%),
    radial-gradient(800px 320px at 80% 80%, rgba(15,18,16,0.35), rgba(15,18,16,0) 60%),
    linear-gradient(135deg, rgba(255,255,255,0.10), rgba(255,255,255,0.04));
  border: 1px solid rgba(255,255,255,0.18);
  box-shadow: 0 26px 70px rgba(15,18,16,0.34);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 18px;
}

.hud{
  position:absolute;
  inset: 18px;
  border-radius: 16px;
  padding: 16px;
  background: rgba(15,18,16,0.16);
  border: 1px solid rgba(255,255,255,0.14);
}
.hud-kicker{
  font-weight: 900;
  letter-spacing: .18em;
  font-size: .74rem;
  color: rgba(255,255,255,0.86);
  margin-bottom: 12px;
}
.hud-row{
  display:flex;
  gap: 12px;
  margin-bottom: 12px;
}
.hud-stat{
  flex:1;
  padding: 10px 10px 8px;
  border-radius: 14px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.12);
}
.hud-label{
  font-size: .72rem;
  letter-spacing: .12em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.72);
  font-weight: 900;
}
.hud-value{
  font-size: 1.1rem;
  font-weight: 900;
  color: rgba(255,255,255,0.92);
}
.hud-bar{
  height: 10px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(255,255,255,0.10);
  border: 1px solid rgba(255,255,255,0.14);
  margin-bottom: 10px;
}
.hud-fill{
  display:block;
  height: 100%;
  width: 62%;
  background: rgba(196,106,42,0.90);
}
.hud-sub{
  color: rgba(255,255,255,0.74);
  font-weight: 800;
}

/* micro pills */
.micro{
  display:flex;
  flex-wrap: wrap;
  gap: 10px;
}
.micro-pill{
  display:inline-flex;
  align-items:center;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.18);
  color: rgba(255,255,255,0.88);
  font-weight: 800;
}

/* Sections */
.why, .features, .how{ padding: 64px 0; background:#fff; }
.cta{
  padding:56px 0 72px;
  background: #fff;
  border-top: 1px solid rgba(15,18,16,0.08);
}

/* “Why” list */
.why-item{
  display:flex;
  align-items:flex-start;
  padding: 12px 0;
  color: var(--r-black);
}
.why-item .bi{
  color: rgba(196,106,42,0.95);
  font-size: 1.1rem;
  margin-top: .1rem;
}

/* Media tile */
.media-tile{
  height: 360px;
  background:
    radial-gradient(800px 320px at 25% 25%, rgba(196,106,42,0.10), rgba(196,106,42,0) 60%),
    linear-gradient(135deg, rgba(90,107,78,0.18), rgba(15,18,16,0.06)),
    #f3f4f6;
  border: 1px solid rgba(15,18,16,0.10);
  box-shadow: 0 14px 40px rgba(15,18,16,0.08);
}

/* Feature cards */
.feature-card{
  border: 1px solid rgba(15,18,16,0.10);
  border-radius: 16px;
  overflow:hidden;
  box-shadow: 0 12px 30px rgba(15,18,16,0.06);
}
.feature-img{
  height: 160px;
  background:
    radial-gradient(700px 220px at 30% 20%, rgba(90,107,78,0.18), rgba(90,107,78,0) 60%),
    repeating-linear-gradient(
      45deg,
      rgba(15,18,16,0.03),
      rgba(15,18,16,0.03) 12px,
      rgba(15,18,16,0.06) 12px,
      rgba(15,18,16,0.06) 24px
    );
}

/* How cards */
.how-card{
  border: 1px solid rgba(15,18,16,0.10);
  border-radius: 16px;
  padding: 16px;
  background: #fff;
  box-shadow: 0 12px 30px rgba(15,18,16,0.06);
}
.step{
  background: rgba(196,106,42,0.14);
  color: var(--r-black);
  border: 1px solid rgba(196,106,42,0.28);
  font-weight: 900;
  margin-bottom: 10px;
  display:inline-block;
}

/* Buttons */
.btn-primary{
  --bs-btn-bg: var(--r-accent);
  --bs-btn-border-color: rgba(255,255,255,0.12);
  --bs-btn-hover-bg: #a85722;
  --bs-btn-hover-border-color: rgba(255,255,255,0.12);
  font-weight: 900;
  border-radius: 12px;
}
.hero :deep(.btn-outline-dark){
  --bs-btn-color: rgba(255,255,255,0.92);
  --bs-btn-border-color: rgba(255,255,255,0.32);
  --bs-btn-hover-bg: rgba(255,255,255,0.12);
  --bs-btn-hover-border-color: rgba(255,255,255,0.40);
  --bs-btn-hover-color: rgba(255,255,255,0.96);
  border-radius: 12px;
}

@media (max-width: 992px){
  .hero{ padding: 48px 0; min-height: 70vh; }
  .hero-art{ height: 260px; }
}
</style>
