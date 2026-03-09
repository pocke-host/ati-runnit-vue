<template>
  <main class="support-page">

    <!-- HERO -->
    <section class="ep-hero">
      <div class="ep-hero-inner">
        <div class="ep-kicker">RUNNIT // SUPPORT</div>
        <h1 class="ep-headline">Help Center.</h1>
        <p class="ep-sub">Find answers, or tap us in when you need backup.</p>
      </div>
    </section>

    <!-- ARTICLES -->
    <section class="ep-section">
      <div class="ep-content">
        <div class="section-header">
          <h2 class="section-title">Featured help topics</h2>
          <router-link to="/request" class="section-action">Submit a request →</router-link>
        </div>

        <div class="articles-grid">
          <a href="#" class="article-card" v-for="item in articles" :key="item.title">
            <div class="article-icon">
              <i class="bi bi-file-earmark-text"></i>
            </div>
            <div class="article-body">
              <div class="article-title">{{ item.title }}</div>
              <div class="article-sub">{{ item.subtitle }}</div>
            </div>
            <i class="bi bi-arrow-right article-arrow"></i>
          </a>
        </div>

        <!-- CONTACT CTA -->
        <div class="contact-band">
          <div class="contact-band-text">
            <h3 class="contact-band-title">Still stuck?</h3>
            <p class="contact-band-sub">Send us a request — we'll get you moving again.</p>
          </div>
          <router-link to="/request" class="contact-btn">Submit a Request</router-link>
        </div>
      </div>
    </section>

  </main>
</template>

<script setup>
const articles = [
  { title: 'Login Problems on iOS?',            subtitle: 'Known issue for app version 4.25' },
  { title: 'How are distances calculated?',     subtitle: 'Understand how we measure activity distance' },
  { title: 'How to cancel your subscription',  subtitle: 'Steps to cancel or manage billing' },
  { title: 'Data and privacy',                  subtitle: 'Your choices and our commitments' },
  { title: 'Connecting a Garmin device',        subtitle: 'Sync your Garmin to import workouts automatically' },
  { title: 'What counts as a PR?',              subtitle: 'How personal records are detected and stored' },
]
</script>

<style scoped>
.support-page {
  background: var(--rk-paper, #FAF8FF);
  font-family: Futura, "Futura PT", "Futura Std", "Avenir Next", Avenir,
    system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
  padding-top: var(--nav-h, 64px);
  min-height: 100vh;
}

/* HERO */
.ep-hero {
  background: #000;
  color: #fff;
  padding: 72px 24px 64px;
}
.ep-hero-inner {
  max-width: 900px;
  margin: 0 auto;
}
.ep-kicker {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.38);
  margin-bottom: 24px;
}
.ep-headline {
  font-size: clamp(2.4rem, 7vw, 4.5rem);
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 1.04;
  margin: 0 0 20px;
}
.ep-sub {
  font-size: 1.05rem;
  color: rgba(255,255,255,0.60);
  line-height: 1.65;
  max-width: 440px;
  margin: 0;
}

/* SECTION */
.ep-section {
  padding: 56px 24px 80px;
}
.ep-content {
  max-width: 900px;
  margin: 0 auto;
}

.section-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 24px;
  gap: 16px;
  flex-wrap: wrap;
}
.section-title {
  font-size: 0.92rem;
  font-weight: 900;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: rgba(15,18,16,0.45);
  margin: 0;
}
.section-action {
  font-size: 0.80rem;
  font-weight: 700;
  color: #000;
  text-decoration: none;
  letter-spacing: 0.04em;
  transition: opacity 0.15s;
}
.section-action:hover { opacity: 0.55; }

/* ARTICLES */
.articles-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1px;
  background: #E5E5E5;
  border: 1px solid #E5E5E5;
  margin-bottom: 40px;
}
.article-card {
  background: #fff;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 22px;
  text-decoration: none;
  color: inherit;
  transition: background 0.12s;
}
.article-card:hover { background: #F7F7F7; }

.article-icon {
  width: 40px;
  height: 40px;
  background: #F0F0F0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.article-icon .bi {
  font-size: 1.1rem;
  color: rgba(15,18,16,0.60);
}

.article-body { flex: 1; }
.article-title {
  font-size: 0.90rem;
  font-weight: 900;
  color: #000;
  line-height: 1.3;
  margin-bottom: 3px;
}
.article-sub {
  font-size: 0.78rem;
  color: rgba(15,18,16,0.50);
  line-height: 1.4;
}

.article-arrow {
  color: rgba(15,18,16,0.25);
  font-size: 0.85rem;
  flex-shrink: 0;
}

/* CONTACT BAND */
.contact-band {
  background: #000;
  color: #fff;
  padding: 36px 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
}
.contact-band-title {
  font-size: 1.1rem;
  font-weight: 900;
  margin: 0 0 6px;
}
.contact-band-sub {
  font-size: 0.85rem;
  color: rgba(255,255,255,0.55);
  margin: 0;
}
.contact-btn {
  display: inline-block;
  background: #fff;
  color: #000;
  text-decoration: none;
  padding: 12px 24px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  transition: opacity 0.15s;
  flex-shrink: 0;
}
.contact-btn:hover { opacity: 0.85; }

@media (max-width: 640px) {
  .articles-grid { grid-template-columns: 1fr; }
  .contact-band { flex-direction: column; align-items: flex-start; padding: 28px 24px; }
}
</style>
