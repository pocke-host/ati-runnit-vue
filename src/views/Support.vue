<!-- src/pages/Support.vue -->
<template>
  <main class="support-page">
    <!-- Header -->
    <section class="hero">
      <div class="container-xxl text-center">
        <p class="kicker mb-2">Help center</p>
        <h1 class="display-5 fw-bold mb-2">Support</h1>
        <p class="lead m-0">Find answers, or tap us in when you need backup.</p>
      </div>
    </section>

    <!-- Featured Articles -->
    <section class="help-list">
      <div class="container-xxl">
        <div class="d-flex align-items-end justify-content-between flex-wrap gap-2 mb-3">
          <h2 class="h4 m-0">Featured help topics</h2>
          <router-link to="/request" class="btn btn-outline-dark btn-sm">Submit a request</router-link>
        </div>

        <ul class="list-unstyled row g-3 m-0">
          <li class="col-md-6" v-for="item in articles" :key="item.title">
            <a href="#" class="help-link d-flex align-items-start gap-3 p-3 rounded-4">
              <div class="icon-wrap">
                <i class="bi bi-file-earmark-text"></i>
              </div>
              <div class="flex-grow-1">
                <div class="help-title">{{ item.title }}</div>
                <p class="small mb-0 help-sub">{{ item.subtitle }}</p>
              </div>
              <i class="bi bi-chevron-right chevron"></i>
            </a>
          </li>
        </ul>
      </div>
    </section>

    <!-- Footer CTA -->
    <section class="cta">
      <div class="container-xxl text-center">
        <h2 class="h4 fw-bold mb-2">Still stuck?</h2>
        <p class="text-muted mb-3">Send a request — we’ll get you moving again.</p>
        <router-link to="/request" class="btn btn-primary">Submit a Request</router-link>
      </div>
    </section>
  </main>
</template>

<script setup>
const articles = [
  { title: 'Login Problems on iOS?', subtitle: 'Known issue for app version 4.25' },
  { title: 'How are distances calculated?', subtitle: 'Understand how we measure activity distance' },
  { title: 'How to cancel your subscription', subtitle: 'Steps to cancel or manage billing' },
  { title: 'Data and privacy', subtitle: 'Your choices and our commitments' }
]
</script>

<style scoped>
/* ===== RUNNIT Brand Tokens (page-local) ===== */
.support-page{
  --r-olive:#5A6B4E;
  --r-olive-deep:#2C3726;
  --r-black:#0F1210;
  --r-stone:#A3A69F;
  --r-offwhite:#F5F6F3;
  --r-white:#FFFFFF;
  --r-accent:#C46A2A;

  --nav-h: 72px;
  --footer-h: 40px;

  padding-top: var(--nav-h);
  min-height: calc(100vh - var(--nav-h) - var(--footer-h));
  background: var(--r-offwhite);
  font-family: Futura, "Futura PT", "Futura Std", "Avenir Next", Avenir,
    system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
}

/* ===== HERO: cinematic + subtle “system” vibe ===== */
.hero{
  padding: 52px 0 44px;
  color: var(--r-white);
  border-bottom: 1px solid rgba(255,255,255,0.10);
  background: #000;
}
.kicker{
  letter-spacing: .18em;
  text-transform: uppercase;
  font-weight: 900;
  font-size: .78rem;
  color: rgba(255,255,255,0.82);
}
.hero :deep(.lead){
  color: rgba(255,255,255,0.78) !important;
}

/* ===== LIST ===== */
.help-list{
  padding: 34px 0 26px;
}

/* Each item feels like a “module” tile (not pixel art) */
.help-link{
  text-decoration: none;
  color: inherit;
  background:
    radial-gradient(700px 220px at 30% 0%, rgba(90,107,78,0.12), rgba(90,107,78,0) 60%),
    linear-gradient(135deg, rgba(255,255,255,0.78), rgba(255,255,255,0.56));
  border: 1px solid rgba(15,18,16,0.12);
  box-shadow: none;
  
  transition: transform .12s ease, box-shadow .12s ease, border-color .12s ease;
  position: relative;
  overflow: hidden;
}
.help-link::after{ display: none; }
.help-link:hover{
  transform: none;
  border-color: #000;
  box-shadow: 0 18px 44px rgba(15,18,16,0.10);
}
.help-link:hover::after{ opacity: 1; }

.icon-wrap{
  width: 44px;
  height: 44px;
  border-radius: 0;
  display:flex;
  align-items:center;
  justify-content:center;
  background: #f5f5f5;
  border: 1px solid rgba(15,18,16,0.10);
}
.icon-wrap .bi{
  font-size: 1.25rem;
  color: rgba(15,18,16,0.75);
}

.help-title{
  font-weight: 900;
  letter-spacing: .01em;
  color: rgba(15,18,16,0.90);
}
.help-sub{
  color: rgba(15,18,16,0.60) !important;
}

.chevron{
  color: rgba(15,18,16,0.35);
  margin-top: 2px;
}

/* ===== CTA ===== */
.cta{
  padding: 40px 0 64px;
}

/* Buttons */
.btn-primary{
  --bs-btn-bg: #000;
  --bs-btn-border-color: #000;
  --bs-btn-hover-bg: #333;
  --bs-btn-hover-border-color: #333;
  font-weight: 900;
  height: 46px;
  border-radius: 0;
  padding-inline: 18px;
}

/* Keep “outline” neutral, not Strava-ish */
.btn-outline-dark{
  --bs-btn-color: rgba(15,18,16,0.82);
  --bs-btn-border-color: rgba(15,18,16,0.22);
  --bs-btn-hover-bg: rgba(15,18,16,0.06);
  --bs-btn-hover-border-color: rgba(15,18,16,0.26);
}

/* Small */
@media (max-width: 576px){
  .help-link{ border-radius: 0; }
}
</style>
