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
              RUNNIT is built for the people who show up — even when motivation isn’t loud.
              We turn daily training into a moment you can feel, track, and share.
            </p>
            <div class="d-flex gap-3">
              <router-link to="/signup" class="btn btn-primary btn-lg">Join RUNNIT</router-link>
              <router-link to="/features" class="btn btn-outline-light btn-lg">Explore Features</router-link>
            </div>
          </div>
          <div class="col-12 col-lg-5">
            <div class="hero-art rounded-4">
              <div class="hero-card">
                <div class="hero-card-title">A mirror for growth</div>
                <div class="hero-card-sub">
                  Train → capture the moment → build momentum.
                </div>
                <div class="hero-card-pills">
                  <span class="pill">Moments</span>
                  <span class="pill">Streaks</span>
                  <span class="pill">Community</span>
                </div>
              </div>
            </div>
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
              Make consistency easier than motivation. RUNNIT blends community, structure, and reflection
              so training becomes a habit you can sustain — and a story you’re proud of.
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
              RUNNIT started from one belief: progress is built in quiet reps — not highlight reels.
              We wanted a place where training feels meaningful, not noisy.
            </p>
            <p class="text-muted mb-0">
              Whether you’re chasing your first 5K or a new marathon PR, RUNNIT is designed to help you
              keep the loop alive: show up, log the moment, and build momentum.
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

    <!-- TEAM -->
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
  'Systems that help you build consistency without burnout.',
  'Privacy you control — your data, your rules.',
  'Device-friendly: bring Garmin, Apple Watch, COROS, and more.',
]

// stats should be dynamic
const stats = [
  { value: '100M+', label: 'Moments captured' },
  { value: '30B+',  label: 'Miles tracked' },
  { value: '190+',  label: 'Countries moving' },
  { value: '∞',     label: 'Reasons to show up' },
]

const values = [
  { title: 'Build the habit', body: 'Consistency beats intensity you can’t repeat.' },
  { title: 'Earned confidence', body: 'Progress is proof — stack the days.' },
  { title: 'Better together', body: 'Community makes hard things easier.' },
  { title: 'Trust always', body: 'Clear controls and no surprises with your data.' },
]
</script>

<style scoped>
.about-page{
  --r-olive:#5A6B4E;
  --r-olive-deep:#2C3726;
  --r-black:#0F1210;
  --r-stone:#A3A69F;
  --r-offwhite:#F5F6F3;
  --r-white:#FFFFFF;
  --r-accent:#C46A2A;

  background: var(--r-offwhite);
  font-family: Futura, "Futura PT", "Futura Std", "Avenir Next", Avenir,
    system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
}

/* HERO */
.hero{
  min-height: calc(100vh - 72px);
  display:flex;
  align-items:center;
  color: var(--r-white);
  padding: 72px 0;

  background:
    radial-gradient(900px 420px at 18% 18%, rgba(255,255,255,0.10), rgba(255,255,255,0) 60%),
    radial-gradient(900px 420px at 85% 30%, rgba(196,106,42,0.10), rgba(196,106,42,0) 60%),
    linear-gradient(135deg, var(--r-olive), var(--r-olive-deep));
}
.eyebrow{
  text-transform:uppercase;
  letter-spacing:.14em;
  opacity:.9;
  margin-bottom:.5rem;
  color: rgba(255,255,255,0.82);
}
.hero :deep(.lead){
  color: rgba(255,255,255,0.76) !important;
}

/* Hero art = premium glass */
.hero-art{
  height: 320px;
  position: relative;
  border-radius: 16px;
  overflow:hidden;

  background:
    radial-gradient(700px 260px at 30% 20%, rgba(255,255,255,0.14), rgba(255,255,255,0) 60%),
    radial-gradient(800px 320px at 80% 80%, rgba(15,18,16,0.35), rgba(15,18,16,0) 60%),
    linear-gradient(135deg, rgba(255,255,255,0.09), rgba(255,255,255,0.03));
  border: 1px solid rgba(255,255,255,0.18);
  box-shadow: 0 26px 70px rgba(15,18,16,0.34);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
.hero-card{
  position:absolute;
  inset: 18px;
  border-radius: 16px;
  padding: 18px;
  background: rgba(15,18,16,0.18);
  border: 1px solid rgba(255,255,255,0.16);
}
.hero-card-title{
  font-weight: 900;
  letter-spacing: .06em;
  margin-bottom: 6px;
}
.hero-card-sub{
  color: rgba(255,255,255,0.78);
  margin-bottom: 14px;
}
.hero-card-pills{
  display:flex;
  gap: 8px;
  flex-wrap: wrap;
}
.pill{
  display:inline-flex;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(255,255,255,0.10);
  border: 1px solid rgba(255,255,255,0.16);
  color: rgba(255,255,255,0.86);
  font-weight: 700;
  font-size: .78rem;
}

/* MISSION */
.mission{ padding: 64px 0; background:#fff; }
.mission-card{
  background:#fff;
  border:1px solid rgba(15,18,16,0.10);
  box-shadow: 0 12px 30px rgba(15,18,16,0.06);
}
.mission-card .bi{
  color: var(--r-accent);
  font-size:1.1rem;
  margin-top:.15rem;
}

/* STATS */
.stats{ padding: 40px 0; background:#fff; border-top:1px solid rgba(15,18,16,0.06); border-bottom:1px solid rgba(15,18,16,0.06); }
.stat .value{ font-size: 32px; font-weight: 900; color: var(--r-black); }
.stat .label{ color:#6b7280; }

/* STORY / VALUES */
.story{ padding: 64px 0; background:#fff; }
.values .value-item{ padding:12px 0; border-bottom:1px solid rgba(15,18,16,0.06); }
.values .value-item:last-child{ border-bottom:0; }

/* TEAM */
.team{ padding: 64px 0; background:#fff; }
.team-card{
  background:#fff;
  border:1px solid rgba(15,18,16,0.10);
  box-shadow: 0 12px 30px rgba(15,18,16,0.06);
}
.team-card .avatar{
  height:120px;
  background: linear-gradient(135deg, rgba(90,107,78,0.18), rgba(196,106,42,0.14));
}

/* CTA band */
.cta-band{ padding: 56px 0 72px; background:#fff; border-top:1px solid rgba(15,18,16,0.08); }
.mini-card{
  background:#fff;
  border:1px solid rgba(15,18,16,0.10);
  box-shadow: 0 12px 30px rgba(15,18,16,0.06);
}
.mini-card.highlight{
  border-color: rgba(196,106,42,0.35);
  box-shadow: 0 20px 60px rgba(196,106,42,0.12);
}

/* Buttons (RUNNIT accent) */
.btn-primary{
  --bs-btn-bg: var(--r-accent);
  --bs-btn-border-color: rgba(255,255,255,0.12);
  --bs-btn-hover-bg: #a85722;
  --bs-btn-hover-border-color: rgba(255,255,255,0.12);
}
.btn-outline-light{
  --bs-btn-color: rgba(255,255,255,0.92);
  --bs-btn-border-color: rgba(255,255,255,0.32);
  --bs-btn-hover-bg: rgba(255,255,255,0.10);
  --bs-btn-hover-border-color: rgba(255,255,255,0.40);
  --bs-btn-hover-color: rgba(255,255,255,0.96);
}

/* Responsive tweaks */
@media (max-width: 992px){
  .hero{ min-height: 70vh; padding: 48px 0; }
  .hero-art{ height:220px; }
}
</style>
