<template>
  <main class="sport-page">
    <section class="hero">
      <div class="container-xxl">
        <div class="row align-items-center g-4">
          <div class="col-12 col-lg-6">
            <p class="eyebrow text-uppercase fw-semibold mb-2">Sport module</p>
            <h1 class="display-5 fw-bold mb-2">Swimming</h1>
            <p class="lead mb-4">
              Pool or open water — track pace, distance, and consistency.
              RUNNIT turns sessions into momentum (and momentum into confidence).
            </p>

            <div class="d-flex gap-3 flex-wrap">
              <router-link to="/signup" class="btn btn-primary btn-lg">Start your session</router-link>
              <router-link to="/login" class="btn btn-outline-dark btn-lg">Log in</router-link>
            </div>

            <div class="micro mt-4">
              <span class="micro-pill"><i class="bi bi-stopwatch me-2"></i>Splits</span>
              <span class="micro-pill"><i class="bi bi-water me-2"></i>Open water</span>
              <span class="micro-pill"><i class="bi bi-bar-chart me-2"></i>Volume</span>
            </div>
          </div>

          <div class="col-12 col-lg-6">
            <div class="hero-art" aria-hidden="true">
              <div class="hud">
                <div class="hud-kicker">SWIM MODE</div>

                <div class="hud-row">
                  <div class="hud-stat">
                    <div class="hud-label">Pace</div>
                    <div class="hud-value">—</div>
                  </div>
                  <div class="hud-stat">
                    <div class="hud-label">Distance</div>
                    <div class="hud-value">Queued</div>
                  </div>
                  <div class="hud-stat">
                    <div class="hud-label">Status</div>
                    <div class="hud-value">Ready</div>
                  </div>
                </div>

                <div class="hud-bar"><span class="hud-fill"></span></div>
                <div class="hud-sub">Lock the plan. Track the set. Save the swim.</div>
              </div>
            </div>
          </div>

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
  { t: 'Auto-splits', d: 'See per-lap pace, rest, and trends for every set.' },
  { t: 'Open-water GPS', d: 'Map your swims, conditions, and routes outdoors.' },
  { t: 'Training plans', d: 'Build weekly volume with sessions that fit your schedule.' },
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
  width: 58%;
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
