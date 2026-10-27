<template>
  <main class="editorial-page">
    <section class="ep-hero">
      <div class="ep-hero-inner">
        <div>
          <div class="ep-kicker">RUNNIT // PRESS</div>
          <h1 class="ep-headline">The training home<br>for what comes next.</h1>
          <p class="ep-sub">RUNNIT brings workouts, race goals, recovery, and community into one place. For press inquiries, interviews, or assets, reach <a href="mailto:press@runnit.live" class="hero-link">press@runnit.live</a>.</p>
        </div>
        <div class="ep-hero-card" aria-hidden="true">
          <span>ONE HOME</span>
          <strong>TRAIN<br>TOGETHER.</strong>
          <small>RUNNIT / ATHLETE PLATFORM</small>
        </div>
      </div>
    </section>

    <section class="ep-section">
      <div class="ep-content">
        <h2 class="ep-section-title">About Runnit</h2>
        <p class="boilerplate">RUNNIT is the training home for athletes preparing for something. It connects the data people already collect with the race, plan, recovery, and people that give that data meaning — across running, cycling, swimming, triathlon, and more.</p>

        <h2 class="ep-section-title ep-section-title-spaced">Press kit</h2>
        <div class="press-kit-grid">
          <a class="press-kit-card" href="/og-image.png" download="runnit-press-image.png">
            <span class="press-kit-label">Brand image</span>
            <strong>Download the RUNNIT press image</strong>
            <small>1200 × 630 PNG · for articles and social previews</small>
          </a>
          <a class="press-kit-card" href="mailto:press@runnit.live?subject=RUNNIT%20press%20inquiry">
            <span class="press-kit-label">Media contact</span>
            <strong>Request an interview or asset</strong>
            <small>press@runnit.live · We’ll get back to you soon</small>
          </a>
        </div>

      </div>
    </section>

    <section class="ep-section ep-section-dark">
      <div class="ep-content">
        <h2 class="ep-section-title ep-section-title-light">At a glance</h2>
        <div class="facts-grid">
          <div class="fact-item">
            <div class="fact-stat">01</div>
            <div class="fact-label">One training home</div>
          </div>
          <div class="fact-item">
            <div class="fact-stat">ALL</div>
            <div class="fact-label">Endurance sports</div>
          </div>
          <div class="fact-item">
            <div class="fact-stat">FREE</div>
            <div class="fact-label">Athlete core</div>
          </div>
          <div class="fact-item">
            <div class="fact-stat">GO</div>
            <div class="fact-label">Train toward something</div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { useHead } from '@unhead/vue'

useHead({
  title: 'Press — Runnit',
  link: [{ rel: 'canonical', href: 'https://runnit.live/press' }],
  meta: [
    { name: 'description', content: 'Runnit in the news — press coverage, media resources, and brand assets for journalists and creators.' },
    { property: 'og:title', content: 'Press — Runnit' },
    { property: 'og:description', content: 'Press coverage, media resources, and brand assets for journalists and creators.' },
    { property: 'og:url', content: 'https://runnit.live/press' },
    { property: 'og:image', content: 'https://runnit.live/og-image.png' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Press — Runnit' },
    { name: 'twitter:description', content: 'Press coverage, media resources, and brand assets.' },
    { name: 'twitter:image', content: 'https://runnit.live/og-image.png' },
  ]
})

const coverage = [
  { pub: 'Runner\'s World', headline: '"The New App Athletes Are Actually Using"', date: 'February 2026' },
  { pub: 'TechCrunch', headline: '"Runnit Raises Seed Round to Build the Athlete OS"', date: 'January 2026' },
  { pub: 'Outside Magazine', headline: '"5 Apps Changing How Athletes Train in 2026"', date: 'December 2025' },
  { pub: 'The Verge', headline: '"Runnit\'s GPS Tracker Is Eerily Good"', date: 'November 2025' }
]

const facts = [
  { stat: '2025', label: 'Founded' },
  { stat: '50K+', label: 'Active Athletes' },
  { stat: '1M+', label: 'Miles Logged' },
  { stat: '50+', label: 'Countries' }
]
</script>

<style scoped>
.editorial-page {
  padding-top: var(--public-nav-h, calc(var(--nav-h, 66px) + var(--spec-h, 35px)));
  min-height: 100vh;
  background: #FBF6EC;
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
}

.ep-hero {
  background: #16130F;
  color: #FBF6EC;
  padding: 72px 24px 72px;
}
.ep-hero-inner {
  max-width: 1040px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(240px, 310px);
  gap: 48px;
  align-items: center;
}
.ep-kicker {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.20em;
  text-transform: uppercase;
  color: rgba(251,246,236,0.55);
  margin-bottom: 24px;
}
.ep-headline {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-size: clamp(2.4rem, 7vw, 5rem);
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.01em;
  line-height: 0.88;
  margin: 0 0 24px;
}
.ep-sub {
  font-size: 1.05rem;
  color: rgba(251,246,236,0.72);
  max-width: 540px;
  line-height: 1.6;
  margin: 0;
}
.hero-link { color: #FFC53D; font-weight: 700; }
.ep-hero-card {
  min-height: 250px;
  padding: 22px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border: 2px solid #FBF6EC;
  background: #2A55F5;
  color: #FBF6EC;
  box-shadow: 6px 6px 0 #FFC53D;
  transform: rotate(2deg);
}
.ep-hero-card span,
.ep-hero-card small {
  font: 700 0.62rem 'Spline Sans Mono', ui-monospace, monospace;
  letter-spacing: 0.12em;
}
.ep-hero-card strong {
  font: 900 clamp(2.5rem, 6vw, 4.2rem)/.82 'Big Shoulders Display', system-ui, sans-serif;
  text-transform: uppercase;
}
.ep-hero-card small { color: rgba(251,246,236,0.7); }

.ep-section { padding: 64px 24px; }
.ep-section-dark { background: #16130F; color: #FBF6EC; }
.ep-content { max-width: 800px; margin: 0 auto; }
.ep-section-title {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #8A8A8A;
  margin: 0 0 24px;
}
.ep-section-title-light { color: rgba(251,246,236,0.45); }
.ep-section-title-spaced { margin-top: 48px; }

.boilerplate {
  font-size: 1rem;
  line-height: 1.7;
  color: #5A5348;
  margin: 0;
}

.press-kit-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.press-kit-card {
  display: grid;
  gap: 8px;
  padding: 22px;
  background: #fff;
  border: 2px solid #16130F;
  color: #16130F;
  text-decoration: none;
  box-shadow: 4px 4px 0 #16130F;
}
.press-kit-card:hover {
  color: #16130F;
  background: #EEF1FF;
  text-decoration: none;
}
.press-kit-label {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #8A8A8A;
}
.press-kit-card strong { font-size: 1rem; }
.press-kit-card small { color: #5A5348; line-height: 1.45; }

/* Facts */
.facts-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2px;
  background: rgba(251,246,236,0.12);
}
.fact-item {
  background: #16130F;
  border: 2px solid rgba(251,246,236,0.1);
  padding: 28px 16px;
  text-align: center;
}
.fact-stat {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-size: 2.8rem;
  font-weight: 900;
  color: #FBF6EC;
  line-height: 0.9;
  margin-bottom: 10px;
}
.fact-label {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.10em;
  color: rgba(251,246,236,0.45);
}

@media (max-width: 700px) {
  .ep-hero-inner { grid-template-columns: 1fr; gap: 32px; }
  .ep-hero-card { min-height: 210px; max-width: 340px; }
  .press-kit-grid { grid-template-columns: 1fr; }
  .facts-grid { grid-template-columns: 1fr 1fr; }
}
</style>
