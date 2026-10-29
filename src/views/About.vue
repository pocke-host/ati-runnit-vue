<template>
  <main class="about-page">

    <!-- HERO — ink -->
    <section class="hero">
      <div class="page-inner hero-grid">
        <div class="hero-copy">
          <span class="gr-eyebrow-badge">Our story</span>
          <h1 class="hero-h1">Your training,<br>one home.</h1>
          <p class="hero-sub">RUNNIT brings the workouts, race goals, recovery, and people you already rely on into one clearer week.</p>
        </div>
        <div class="hero-photo" role="img" aria-label="Athletes training together on a road">
          <div class="hero-photo-stamp">BUILT FOR THE<br>WORK BETWEEN<br>THE BIG MOMENTS.</div>
          <div class="hero-photo-meta">RUNNIT / ATHLETE STORY</div>
        </div>
      </div>
    </section>

    <!-- LEAD + 2-col story -->
    <section class="story-section">
      <div class="page-inner">
        <p class="story-lead">Training is better when the whole week makes sense.</p>
        <div class="story-grid">
          <p class="story-body">Your watch records the workout. Your recovery app records the night. Your calendar holds the plan, and your group chat holds the accountability. The pieces are useful. The stitching is exhausting.</p>
          <p class="story-body">RUNNIT gives the whole block a home. Put the event first, bring in the data you already collect, and see what you did, what is next, and who is in it with you.</p>
        </div>
      </div>
    </section>

    <!-- THREE THINGS -->
    <section class="beliefs-section">
      <div class="page-inner">
        <div class="gr-eyebrow">What we believe</div>
        <h2 class="section-h2">Three things, held hard.</h2>
        <div class="beliefs-grid">
          <div v-for="b in beliefs" :key="b.num" class="belief-card">
            <div class="belief-num">{{ b.num }}</div>
            <div class="belief-title">{{ b.title }}</div>
            <p class="belief-body">{{ b.body }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA — cobalt -->
    <section class="final-cta">
      <h2 class="cta-h2">Make the next week count.</h2>
      <p class="cta-sub">Bring your training home and find the people who keep you moving.</p>
      <router-link to="/signup" class="btn-pill-paper">Join Runnit</router-link>
    </section>

  </main>
</template>

<script setup>
import { useHead } from '@unhead/vue'

useHead({
  title: 'About — Runnit | The training home for what comes next',
  link: [{ rel: 'canonical', href: 'https://runnit.live/about' }],
  meta: [
    { name: 'description', content: 'RUNNIT is the training home for athletes preparing for something: a clearer week, connected data, better accountability, and more progress.' },
    { property: 'og:title', content: 'About — Runnit | The training home for what comes next' },
    { property: 'og:description', content: 'Bring workouts, race goals, recovery, and people into one clearer training week.' },
    { property: 'og:url', content: 'https://runnit.live/about' },
    { property: 'og:image', content: 'https://runnit.live/og-image.png' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'About — Runnit | The training home for what comes next' },
    { name: 'twitter:description', content: 'Bring workouts, race goals, recovery, and people into one clearer training week.' },
    { name: 'twitter:image', content: 'https://runnit.live/og-image.png' },
  ]
})

const beliefs = [
  { num: '01', title: 'Community over metrics',      body: 'The people you run with matter more than the numbers you post.' },
  { num: '02', title: 'Real athletes, not influencers', body: 'No sponsored feeds, no perfect lighting. Just people who did the work.' },
  { num: '03', title: 'Data that means something',   body: "Every stat has to earn the pixels. If it doesn't change how you train, it's gone." },
]

const stackItems = [
  'iOS — native Swift',
  'Backend — Spring Boot',
  'Data — MySQL',
  'Infra — Render + PlanetScale',
]
</script>

<style scoped>
.about-page {
  min-height: 100vh;
  padding-top: var(--public-nav-h, calc(var(--nav-h, 66px) + var(--spec-h, 35px)));
  background: #FBF6EC;
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
  color: #16130F;
}
.page-inner {
  max-width: 1040px;
  margin: 0 auto;
  padding: 0 32px;
}

/* ── HERO ── */
.hero {
  background: #16130F;
  color: #FBF6EC;
  padding: 72px 0 64px;
  border-bottom: 2px solid #16130F;
}
.hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(260px, 360px);
  gap: 48px;
  align-items: center;
}
.hero-copy { min-width: 0; }
.hero-sub {
  max-width: 510px;
  margin: 24px 0 0;
  color: rgba(251,246,236,0.72);
  font-size: 1.02rem;
  line-height: 1.65;
}
.hero-photo {
  position: relative;
  min-height: 360px;
  overflow: hidden;
  border: 2px solid #FBF6EC;
  box-shadow: 6px 6px 0 #2A55F5;
  background-color: #5A5348;
  background-image: url('https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=700&fit=crop&q=85');
  background-size: cover;
  background-position: center;
}
.hero-photo::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(22,19,15,0.28);
}
.hero-photo-stamp {
  position: absolute;
  z-index: 1;
  left: 16px;
  bottom: 18px;
  padding: 10px 12px;
  background: #FFC53D;
  color: #16130F;
  border: 2px solid #16130F;
  font: 700 0.66rem/1.35 'Spline Sans Mono', ui-monospace, monospace;
  letter-spacing: 0.08em;
}
.hero-photo-meta {
  position: absolute;
  z-index: 1;
  top: 14px;
  right: 14px;
  color: #FBF6EC;
  font: 700 0.62rem 'Spline Sans Mono', ui-monospace, monospace;
  letter-spacing: 0.12em;
}
.gr-eyebrow-badge {
  display: inline-block;
  background: #2A55F5;
  color: #fff;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  padding: 6px 12px;
  transform: rotate(-2deg);
}
.hero-h1 {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-weight: 900;
  font-size: clamp(52px, 8vw, 96px);
  line-height: 0.82;
  text-transform: uppercase;
  margin: 20px 0 0;
  animation: rkRise 0.6s ease-out both;
}

/* ── STORY ── */
.story-section {
  padding: 56px 0;
  background: #FBF6EC;
  border-bottom: 2px solid #16130F;
}
.story-lead {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-weight: 700;
  font-size: clamp(26px, 3vw, 38px);
  line-height: 1.02;
  letter-spacing: 0.01em;
  text-transform: uppercase;
  margin: 0 0 26px;
  max-width: 760px;
}
.story-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}
.story-body {
  color: #5A5348;
  line-height: 1.7;
  font-size: 1rem;
  margin: 0;
}

/* ── BELIEFS ── */
.beliefs-section {
  padding: 52px 0;
  background: #FBF6EC;
  border-bottom: 2px solid #16130F;
}
.gr-eyebrow {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #2A55F5;
}
.section-h2 {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-weight: 800;
  font-size: clamp(40px, 5vw, 56px);
  line-height: 0.9;
  text-transform: uppercase;
  margin: 8px 0 28px;
}
.beliefs-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border: 2px solid #16130F;
}
.belief-card {
  padding: 28px;
  border-right: 2px solid #16130F;
}
.belief-card:last-child { border-right: none; }
.belief-num {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 1rem;
  font-weight: 600;
  color: #2A55F5;
  margin-bottom: 14px;
}
.belief-title { font-weight: 800; font-size: 1.2rem; margin-bottom: 8px; }
.belief-body { color: #5A5348; line-height: 1.6; font-size: 0.9rem; margin: 0; }

/* ── BUILD ── */
/* ── CTA ── */
.final-cta {
  background: #2A55F5;
  color: #fff;
  padding: 60px 32px;
  text-align: center;
}
.cta-h2 {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-weight: 900;
  font-size: clamp(48px, 7vw, 88px);
  line-height: 0.84;
  text-transform: uppercase;
  margin: 0;
}
.cta-sub {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin: 16px 0 24px;
  opacity: 0.92;
}
.btn-pill-paper {
  display: inline-block;
  background: #FBF6EC;
  color: #16130F;
  border: 2px solid #16130F;
  border-radius: 999px;
  padding: 14px 30px;
  font-weight: 800;
  font-size: 0.95rem;
  text-decoration: none;
  box-shadow: 4px 4px 0 #16130F;
  transition: opacity 0.15s;
}
.btn-pill-paper:hover { opacity: 0.85; text-decoration: none; color: #16130F; }

/* ── RESPONSIVE ── */
@media (max-width: 768px) {
  .hero-grid { grid-template-columns: 1fr; gap: 32px; }
  .hero-photo { min-height: 280px; max-width: 420px; }
  .story-grid { grid-template-columns: 1fr; }
  .beliefs-grid { grid-template-columns: 1fr; }
  .belief-card { border-right: none; border-bottom: 2px solid #16130F; }
  .belief-card:last-child { border-bottom: none; }
}
@media (max-width: 640px) {
  .page-inner { padding: 0 22px; }
  .hero { padding: 60px 0 44px; }
  .story-section, .beliefs-section { padding: 40px 0; }
  .final-cta { padding: 48px 22px; }
}

.about-page .hero {
  background: radial-gradient(circle at 78% 20%, rgba(42,85,245,.22), transparent 30%), #16130F;
}
.about-page .hero-photo { border-radius: 22px; box-shadow: 8px 8px 0 #2A55F5; }
.about-page .belief-card { background: rgba(255,255,255,.34); transition: transform .18s ease, background .18s ease; }
.about-page .belief-card:hover { background: #fff; transform: translateY(-4px); }
.about-page .beliefs-grid { border-radius: 18px; overflow: hidden; }
.about-page .final-cta { position: relative; overflow: hidden; }
</style>
