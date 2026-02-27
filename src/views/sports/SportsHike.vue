<template>
  <main class="sport-page">
    <section class="hero">
      <div class="container-xxl">
        <div class="row align-items-center g-4">
          <div class="col-12 col-lg-6">
            <p class="eyebrow text-uppercase fw-semibold mb-2">Sport module</p>
            <h1 class="display-5 fw-bold mb-2">Hiking</h1>
            <p class="lead mb-4">
              Chase trails, stack elevation, and log summit days.
              RUNNIT keeps it simple: route → climb → save the win.
            </p>

            <div class="d-flex gap-3 flex-wrap">
              <router-link to="/signup" class="btn btn-primary btn-lg">Start your loop</router-link>
              <router-link to="/login" class="btn btn-outline-dark btn-lg">Log in</router-link>
            </div>

            <div class="micro mt-4">
              <span class="micro-pill"><i class="bi bi-map me-2"></i>Routes</span>
              <span class="micro-pill"><i class="bi bi-bar-chart me-2"></i>Elevation</span>
              <span class="micro-pill"><i class="bi bi-shield-check me-2"></i>Safety</span>
            </div>

            <p class="small mt-3 mb-0 subtle">
              By continuing you agree to our Terms and Privacy Policy.
            </p>
          </div>

          <div class="col-12 col-lg-6">
            <div class="hero-art rounded-4" aria-hidden="true">
              <div class="hud">
                <div class="hud-kicker">HIKE MODE</div>
                <div class="hud-row">
                  <div class="hud-stat">
                    <div class="hud-label">Gain</div>
                    <div class="hud-value">—</div>
                  </div>
                  <div class="hud-stat">
                    <div class="hud-label">Route</div>
                    <div class="hud-value">Saved</div>
                  </div>
                  <div class="hud-stat">
                    <div class="hud-label">Status</div>
                    <div class="hud-value">Ready</div>
                  </div>
                </div>
                <div class="hud-bar"><span class="hud-fill"></span></div>
                <div class="hud-sub">Offline-ready. Safety on. Go explore.</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>

    <section class="features">
      <div class="container-xxl">
        <h2 class="fw-bold text-center mb-4">Built for hikers</h2>
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
        <h2 class="fw-bold mb-2">Hit the trail.</h2>
        <p class="text-muted mb-3">Plan routes, track gain, and share the view.</p>
        <router-link to="/signup" class="btn btn-primary btn-lg">Create Account</router-link>
      </div>
    </section>
  </main>
</template>

<script setup>
const feats = [
  { t: 'Trail maps', d: 'Popular paths with elevation and surfaces.' },
  { t: 'Offline routes', d: 'Keep maps handy without signal.' },
  { t: 'Safety Beacon', d: 'Share live location with trusted contacts.' },
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

  background:
    radial-gradient(900px 420px at 18% 18%, rgba(255,255,255,0.12), rgba(255,255,255,0) 60%),
    radial-gradient(900px 420px at 85% 30%, rgba(196,106,42,0.10), rgba(196,106,42,0) 60%),
    linear-gradient(135deg, var(--r-olive), var(--r-olive-deep));
  color: var(--r-white);
  border-bottom:1px solid rgba(255,255,255,0.10);
}

.eyebrow{
  letter-spacing:.16em;
  color: rgba(255,255,255,0.82);
}
.hero :deep(.lead){ color: rgba(255,255,255,0.76) !important; }
.subtle{ color: rgba(255,255,255,0.72); }

/* Glass hero art */
.hero-art{
  height:320px;
  border-radius:18px;
  position:relative;
  overflow:hidden;

  background:
    radial-gradient(700px 260px at 30% 20%, rgba(255,255,255,0.16), rgba(255,255,255,0) 60%),
    radial-gradient(800px 320px at 80% 80%, rgba(15,18,16,0.35), rgba(15,18,16,0) 60%),
    linear-gradient(135deg, rgba(255,255,255,0.10), rgba(255,255,255,0.04));
  border: 1px solid rgba(255,255,255,0.18);
  box-shadow: 0 26px 70px rgba(15,18,16,0.34);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

/* subtle “HUD” (feel, not literal game UI) */
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
.hud-row{ display:flex; gap:12px; margin-bottom: 12px; }
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
  width: 58%;
  background: rgba(196,106,42,0.90);
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
  border-radius:999px;
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.18);
  color: rgba(255,255,255,0.88);
  font-weight: 800;
}

/* FEATURES */
.features{ padding:64px 0; background:#fff; }
.feature-card{
  border:1px solid rgba(15,18,16,0.10);
  border-radius:16px;
  overflow:hidden;
  box-shadow: 0 12px 30px rgba(15,18,16,0.06);
}
.feature-img{
  height:160px;
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

/* CTA */
.cta{
  padding:56px 0 72px;
  background:#fff;
  border-top:1px solid rgba(15,18,16,0.08);
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
</style>
