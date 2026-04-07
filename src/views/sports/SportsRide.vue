<template>
  <main class="sport-page">
    <section class="hero">
      <div class="container-xxl">
        <div class="row align-items-center g-4">
          <div class="col-12 col-lg-6">
            <p class="eyebrow text-uppercase fw-semibold mb-2">Sport module</p>
            <h1 class="display-5 fw-bold mb-2">Cycling</h1>
            <p class="lead mb-4">
              Stack miles, chase PRs, and unlock routes riders actually repeat.
              RUNNIT turns training into momentum — one ride at a time.
            </p>

            <div class="d-flex gap-3 flex-wrap">
              <router-link to="/signup" class="btn btn-primary btn-lg">Start your loop</router-link>
              <router-link to="/login" class="btn btn-outline-dark btn-lg">Log in</router-link>
            </div>

            <div class="micro mt-4">
              <span class="micro-pill"><i class="bi bi-speedometer2 me-2"></i>PRs</span>
              <span class="micro-pill"><i class="bi bi-map me-2"></i>Routes</span>
              <span class="micro-pill"><i class="bi bi-graph-up-arrow me-2"></i>Load</span>
            </div>
          </div>

          <div class="col-12 col-lg-6">
            <div class="hero-art" aria-hidden="true">
              <div class="hud">
                <div class="hud-kicker">RIDE MODE</div>

                <div class="hud-row">
                  <div class="hud-stat">
                    <div class="hud-label">Power</div>
                    <div class="hud-value">—</div>
                  </div>
                  <div class="hud-stat">
                    <div class="hud-label">Route</div>
                    <div class="hud-value">Queued</div>
                  </div>
                  <div class="hud-stat">
                    <div class="hud-label">Status</div>
                    <div class="hud-value">Ready</div>
                  </div>
                </div>

                <div class="hud-bar"><span class="hud-fill"></span></div>
                <div class="hud-sub">Lock in the plan. Hit start. Save the ride.</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>

    <section class="features">
      <div class="container-xxl">
        <h2 class="fw-bold text-center mb-4">Built for cyclists</h2>
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
        <h2 class="fw-bold mb-2">Ready to ride?</h2>
        <p class="text-muted mb-3">Join free and start tracking today.</p>
        <router-link to="/signup" class="btn btn-primary btn-lg">Create Account</router-link>
      </div>
    </section>
  </main>
</template>

<script setup>
import { useHead } from '@unhead/vue'
useHead({
  title: 'Cycling — Runnit',
  link: [{ rel: 'canonical', href: 'https://runnit.live/sports/ride' }],
  meta: [
    { name: 'description', content: 'Log road, gravel, and MTB rides. Track power, segments, PRs, and training load. Sync with Garmin, Wahoo, and COROS on Runnit.' },
    { property: 'og:title', content: 'Cycling — Runnit' },
    { property: 'og:description', content: 'Log road, gravel, and MTB rides. Track power, segments, and PRs with Garmin and Wahoo sync.' },
    { property: 'og:url', content: 'https://runnit.live/sports/ride' },
    { property: 'og:image', content: 'https://runnit.live/og-image.png' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Cycling — Runnit' },
    { name: 'twitter:image', content: 'https://runnit.live/og-image.png' },
  ]
})

const feats = [
  { t: 'Segments & PRs', d: 'Compare efforts, chase personal records, and climb leaderboards.' },
  { t: 'Route Builder', d: 'Plan road, gravel, or MTB with surfaces and elevation.' },
  { t: 'Training Load', d: 'Track volume and intensity over time to stay consistent.' },
]
</script>

<style scoped>
.sport-page{
  --nav:72px;
  --footer:40px;

  min-height:calc(100vh - var(--nav) - var(--footer));
  background: var(--r-offwhite);
  overflow-x:hidden;

  font-family: Futura, "Futura PT", "Futura Std", "Avenir Next", Avenir,
    system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
}

/* HERO */
.hero{
  padding:64px 0;

  background: #000;
  color: var(--r-white);
  border-bottom:1px solid rgba(255,255,255,0.10);
}

.eyebrow{
  letter-spacing:.16em;
  color: rgba(255,255,255,0.82);
}
.hero :deep(.lead){ color: rgba(255,255,255,0.76) !important; }

/* Glass hero art */
.hero-art{
  height:320px;
  border-radius:0;
  position:relative;
  overflow:hidden;

  background: #111;
  border: 1px solid rgba(255,255,255,0.18);
  box-shadow: none;
  }

/* subtle “HUD” (feel, not literal game UI) */
.hud{
  position:absolute;
  inset: 18px;
  border-radius: 0;
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
.hud-row{ display:flex; gap:12px; margin-bottom: 12px; }
.hud-stat{
  flex:1;
  padding: 10px 10px 8px;
  border-radius: 0;
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
  border-radius: 0;
  overflow: hidden;
  background: rgba(255,255,255,0.10);
  border: 1px solid rgba(255,255,255,0.14);
  margin-bottom: 10px;
}
.hud-fill{
  display:block;
  height: 100%;
  width: 64%;
  background: rgba(255,255,255,0.60);
}
.hud-sub{
  color: rgba(255,255,255,0.74);
  font-weight: 800;
}

/* Micro pills */
.micro{
  display:flex;
  flex-wrap:wrap;
  gap:10px;
}
.micro-pill{
  display:inline-flex;
  align-items:center;
  padding:8px 12px;
  border-radius:0;
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.18);
  color: rgba(255,255,255,0.88);
  font-weight: 800;
}

/* FEATURES */
.features{ padding:64px 0; background:#fff; }
.feature-card{
  border:1px solid rgba(15,18,16,0.10);
  border-radius:0;
  overflow:hidden;
  box-shadow: none;
}
.feature-img {
  height: 160px;
  background: #f5f5f5;
}

/* CTA */
.cta{
  padding:56px 0 72px;
  background:#fff;
  border-top:1px solid rgba(15,18,16,0.08);
}

/* Buttons */
.btn-primary{
  --bs-btn-bg: #000;
  --bs-btn-border-color: #000;
  --bs-btn-hover-bg: #333;
  --bs-btn-hover-border-color: #333;
  font-weight: 900;
  border-radius: 0;
}
.hero :deep(.btn-outline-dark){
  --bs-btn-color: rgba(255,255,255,0.92);
  --bs-btn-border-color: rgba(255,255,255,0.32);
  --bs-btn-hover-bg: rgba(255,255,255,0.12);
  --bs-btn-hover-border-color: rgba(255,255,255,0.40);
  --bs-btn-hover-color: rgba(255,255,255,0.96);
  border-radius: 0;
}
</style>
