<template>
  <main class="editorial-page">
    <section class="ep-hero">
      <div class="ep-hero-inner">
        <div class="ep-kicker">RUNNIT // PRESS</div>
        <h1 class="ep-headline">Media &amp;<br>Press Resources.</h1>
        <p class="ep-sub">For press inquiries, interviews, and media assets, reach us at <a href="mailto:press@runnit.co" class="hero-link">press@runnit.co</a>.</p>
      </div>
    </section>

    <section class="ep-section">
      <div class="ep-content">
        <h2 class="ep-section-title">About Runnit</h2>
        <p class="boilerplate">Runnit is an athlete training platform that helps runners, cyclists, swimmers, and hikers train smarter — not just harder. Founded in 2025, Runnit combines GPS activity tracking, social community, and AI-driven training plans into a single, clean experience. Athletes on Runnit have collectively logged over 1 million miles across 50+ countries.</p>

        <h2 class="ep-section-title" style="margin-top:48px;">Coverage</h2>
        <div class="press-list">
          <div class="press-item" v-for="item in coverage" :key="item.pub">
            <div class="press-pub">{{ item.pub }}</div>
            <div class="press-headline">{{ item.headline }}</div>
            <div class="press-date">{{ item.date }}</div>
          </div>
        </div>

      </div>
    </section>

    <section class="ep-section ep-section-dark">
      <div class="ep-content">
        <h2 class="ep-section-title ep-section-title-light">Key Facts</h2>
        <div class="facts-grid">
          <div class="fact-item" v-for="f in facts" :key="f.stat">
            <div class="fact-stat">{{ f.stat }}</div>
            <div class="fact-label">{{ f.label }}</div>
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
  padding-top: var(--nav-h, 66px);
  min-height: 100vh;
  background: #FBF6EC;
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
}

.ep-hero {
  background: #16130F;
  color: #FBF6EC;
  padding: 80px 24px 72px;
}
.ep-hero-inner {
  max-width: 800px;
  margin: 0 auto;
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

.boilerplate {
  font-size: 1rem;
  line-height: 1.7;
  color: #5A5348;
  margin: 0;
}

/* Press list */
.press-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  background: #E7DFCE;
  border: 2px solid #16130F;
}
.press-item {
  background: #FBF6EC;
  padding: 20px 24px;
  display: grid;
  grid-template-columns: 120px 1fr auto;
  align-items: center;
  gap: 16px;
}
.press-pub {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #8A8A8A;
}
.press-headline {
  font-size: 0.95rem;
  font-weight: 700;
  color: #16130F;
}
.press-date {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  color: #8A8A8A;
  white-space: nowrap;
}

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
  .press-item { grid-template-columns: 1fr; gap: 4px; }
  .press-date { display: none; }
  .facts-grid { grid-template-columns: 1fr 1fr; }
}
</style>
