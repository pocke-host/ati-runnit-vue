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
const coverage = [
  { pub: 'Runner\'s World', headline: '"The Strava Challenger That\'s Actually Different"', date: 'February 2026' },
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
  padding-top: var(--nav-h, 64px);
  min-height: 100vh;
  background: #fff;
}

.ep-hero {
  background: #000;
  color: #fff;
  padding: 80px 24px 72px;
}
.ep-hero-inner {
  max-width: 800px;
  margin: 0 auto;
}
.ep-kicker {
  font-size: 0.70rem;
  font-weight: 700;
  letter-spacing: 0.20em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.50);
  margin-bottom: 24px;
}
.ep-headline {
  font-size: clamp(2.2rem, 6vw, 4rem);
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 1.05;
  margin: 0 0 24px;
}
.ep-sub {
  font-size: 1.1rem;
  color: rgba(255,255,255,0.70);
  max-width: 540px;
  line-height: 1.6;
  margin: 0;
}
.hero-link { color: #fff; font-weight: 700; }

.ep-section { padding: 64px 24px; }
.ep-section-dark { background: #000; color: #fff; }
.ep-content { max-width: 800px; margin: 0 auto; }
.ep-section-title {
  font-size: 0.70rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: rgba(15,18,16,0.45);
  margin: 0 0 24px;
}
.ep-section-title-light { color: rgba(255,255,255,0.45); }

.boilerplate {
  font-size: 1rem;
  line-height: 1.7;
  color: rgba(15,18,16,0.75);
  margin: 0;
}

/* Press list */
.press-list {
  display: flex;
  flex-direction: column;
  gap: 1px;
  background: #E5E5E5;
  border: 1px solid #E5E5E5;
}
.press-item {
  background: #fff;
  padding: 20px 24px;
  display: grid;
  grid-template-columns: 120px 1fr auto;
  align-items: center;
  gap: 16px;
}
.press-pub {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: rgba(15,18,16,0.45);
}
.press-headline {
  font-size: 0.95rem;
  font-weight: 700;
  color: rgba(15,18,16,0.88);
}
.press-date {
  font-size: 0.78rem;
  color: rgba(15,18,16,0.40);
  white-space: nowrap;
}

/* Facts */
.facts-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background: rgba(255,255,255,0.15);
}
.fact-item {
  background: #000;
  padding: 28px 16px;
  text-align: center;
}
.fact-stat {
  font-size: 2rem;
  font-weight: 900;
  color: #fff;
  margin-bottom: 6px;
}
.fact-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255,255,255,0.45);
}

@media (max-width: 700px) {
  .press-item { grid-template-columns: 1fr; gap: 4px; }
  .press-date { display: none; }
  .facts-grid { grid-template-columns: 1fr 1fr; }
}
</style>
