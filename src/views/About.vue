<template>
  <main class="about-page">

    <!-- 001 HERO ─ black -->
    <section class="hero">
      <div class="page-inner">
        <SectionIndex :num="1" label="Our Story" :on-dark="true" />
        <h1 class="hero-h1">WE BUILT THE APP<br>WE WANTED TO USE.</h1>
      </div>
    </section>

    <!-- MANIFESTO ─ white -->
    <section class="manifesto-section">
      <div class="manifesto-inner">
        <p class="manifesto-lead">Most apps track your run. Runnit is where your run lives.</p>
        <p class="manifesto-body">Runnit started as one runner's frustration: the apps that tracked everything somehow felt like nothing. Numbers without a story. A feed full of strangers' splits and sponsored shoes.</p>
        <p class="manifesto-body">So it got built — solo, in the hours around training — into the place a run actually lives. The photo. The route. The people who were there when your legs gave out at mile twenty.</p>
      </div>
    </section>

    <!-- 002 WHAT WE BELIEVE ─ smoke -->
    <section class="beliefs-section">
      <div class="page-inner">
        <SectionIndex :num="2" label="What We Believe" />
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

    <!-- 003 HOW IT'S BUILT ─ white 2-col -->
    <section class="build-section">
      <div class="build-stack-col">
        <SectionIndex :num="3" label="How It's Built" />
        <div class="stack-list">
          <div v-for="(item, i) in stackItems" :key="item.name" class="stack-row">
            <span class="stack-num">{{ String(i + 1).padStart(2, '0') }}</span>
            <span class="stack-name">{{ item.name }}</span>
          </div>
        </div>
      </div>
      <div class="build-copy-col">
        <p class="build-body">Runnit is built and maintained by one person, in the hours around marathon and Ironman training. Every feature earns its place because there's no room for the ones that don't.</p>
        <p class="build-bold">Beta opens summer 2026 — built in public, shaped by the people on the list.</p>
      </div>
    </section>

    <!-- CTA ─ black -->
    <section class="final-cta">
      <div class="finish-tick"></div>
      <div class="cta-inner">
        <h2 class="cta-h2">COME BUILD WITH US.</h2>
        <p class="cta-body">Get on the list and help shape what Runnit becomes.</p>
        <router-link to="/waitlist" class="btn-cta">Join the Waitlist</router-link>
      </div>
    </section>

  </main>
</template>

<script setup>
import { useHead } from '@unhead/vue'
import SectionIndex from '@/components/SectionIndex.vue'

useHead({
  title: 'About — Runnit',
  meta: [
    { name: 'description', content: 'Most apps track your run. Runnit is where your run lives. Built solo, in the hours around marathon and Ironman training.' },
  ]
})

const beliefs = [
  { num: '01', title: 'Community over metrics',    body: 'The people you run with matter more than the numbers you post. We design for the crew first.' },
  { num: '02', title: 'Real athletes, not influencers', body: 'No sponsored feeds, no perfect lighting. Just people who showed up and did the work.' },
  { num: '03', title: 'Data that means something', body: "Every stat we show has to earn the pixels. If it doesn't change how you train, it's gone." },
]

const stackItems = [
  { name: 'iOS — native Swift' },
  { name: 'Backend — Spring Boot' },
  { name: 'Data — MySQL' },
  { name: 'Infra — Render + PlanetScale' },
]
</script>

<style scoped>
.about-page {
  min-height: 100vh;
  background: #fff;
  font-family: Futura, 'Futura PT', 'Avenir Next', Avenir, 'Jost', system-ui, sans-serif;
  color: #000;
}

.page-inner {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 24px;
}

/* ── HERO ── */
.hero {
  background: #000;
  color: #fff;
  padding: 92px 0 84px;
}
.hero-h1 {
  font-size: clamp(2.4rem, 6vw, 4.125rem);
  font-weight: 900;
  letter-spacing: -0.04em;
  line-height: 0.96;
  margin: 18px 0 0;
  max-width: 840px;
  animation: rkWipe 0.85s cubic-bezier(0.65,0,0.35,1) 0.08s both;
}

/* ── MANIFESTO ── */
.manifesto-section {
  padding: 84px 48px;
  max-width: 880px;
}
.manifesto-lead {
  font-size: clamp(1.8rem, 3vw, 2.6rem);
  font-weight: 300;
  letter-spacing: -0.02em;
  line-height: 1.15;
  margin: 0 0 40px;
  animation: rkRise 0.7s ease-out both;
}
.manifesto-body {
  color: #767676;
  line-height: 1.6;
  font-size: 1rem;
  margin: 0 0 20px;
  max-width: 640px;
}
.manifesto-body:last-child { margin-bottom: 0; }

/* ── BELIEFS ── */
.beliefs-section {
  background: #F5F5F5;
  border-top: 1px solid #E5E5E5;
  border-bottom: 1px solid #E5E5E5;
}
.beliefs-section .page-inner { padding-top: 72px; padding-bottom: 72px; }
.section-h2 {
  font-size: clamp(2.2rem, 4vw, 2.5rem);
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 1.0;
  margin: 14px 0 36px;
  max-width: 620px;
}
.beliefs-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: #E5E5E5;
  border: 1px solid #E5E5E5;
}
.belief-card {
  background: #fff;
  padding: 36px;
}
.belief-num {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 18px;
  font-variant-numeric: tabular-nums;
}
.belief-title {
  font-weight: 800;
  font-size: 1.2rem;
  letter-spacing: -0.02em;
  margin-bottom: 10px;
}
.belief-body {
  color: #767676;
  line-height: 1.6;
  font-size: 0.92rem;
  margin: 0;
}

/* ── BUILD ── */
.build-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: #fff;
}
.build-stack-col {
  padding: 64px 48px;
  border-right: 1px solid #E5E5E5;
}
.stack-list { margin-top: 24px; }
.stack-row {
  display: flex;
  gap: 14px;
  align-items: baseline;
  font-weight: 800;
  font-size: 1.15rem;
  border-top: 1px solid #E5E5E5;
  padding: 16px 0;
}
.stack-row:last-child { border-bottom: 1px solid #E5E5E5; }
.stack-num {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 0.7rem;
  font-weight: 500;
  color: #767676;
}

.build-copy-col {
  padding: 64px 48px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.build-body {
  color: #767676;
  line-height: 1.6;
  font-size: 1rem;
  margin: 0 0 18px;
}
.build-bold {
  color: #000;
  line-height: 1.6;
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
}

/* ── FINAL CTA ── */
.final-cta { background: #000; color: #fff; }
.finish-tick {
  height: 9px;
  background-image: repeating-linear-gradient(90deg, rgba(255,255,255,0.5) 0 2px, transparent 2px 9px);
}
.cta-inner {
  padding: 80px 48px 84px;
  text-align: center;
}
.cta-h2 {
  font-size: clamp(2.4rem, 5vw, 3.75rem);
  font-weight: 900;
  letter-spacing: -0.04em;
  line-height: 0.94;
  margin: 0;
  animation: rkWipe 0.85s cubic-bezier(0.65,0,0.35,1) both;
}
.cta-body {
  color: rgba(255,255,255,0.6);
  line-height: 1.6;
  margin: 18px auto 30px;
  max-width: 420px;
}
.btn-cta {
  display: inline-flex;
  align-items: center;
  padding: 14px 28px;
  background: #0052FF;
  color: #fff;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-decoration: none;
  border: 2px solid #0052FF;
  transition: background 0.15s, border-color 0.15s;
}
.btn-cta:hover { background: #003ECC; border-color: #003ECC; color: #fff; text-decoration: none; }

/* ── Responsive ── */
@media (max-width: 860px) {
  .manifesto-section { padding: 56px 24px; }
  .beliefs-grid { grid-template-columns: 1fr; }
  .build-section { grid-template-columns: 1fr; }
  .build-stack-col { border-right: none; border-bottom: 1px solid #E5E5E5; padding: 40px 32px; }
  .build-copy-col  { padding: 40px 32px; }
  .cta-inner { padding: 60px 24px; }
}

@media (max-width: 640px) {
  .page-inner { padding-left: 22px; padding-right: 22px; }

  /* Hero */
  .hero { padding: 56px 0 52px; }
  .hero-h1 { font-size: 38px !important; line-height: 0.96; }

  /* Manifesto */
  .manifesto-section { padding: 48px 22px; }
  .manifesto-lead { font-size: 1.6rem !important; font-weight: 300; }

  /* Beliefs */
  .beliefs-section .page-inner { padding-top: 44px; padding-bottom: 44px; }
  .section-h2 { font-size: 32px !important; }
  .belief-card { padding: 26px 22px; }

  /* Build */
  .build-stack-col { padding: 44px 22px; }
  .build-copy-col  { padding: 26px 22px 44px; }

  /* CTA */
  .cta-inner { padding: 56px 22px 60px; }
  .cta-h2 { font-size: 36px !important; }
  .cta-inner .btn-cta { display: block; width: 100%; text-align: center; padding: 15px 0; }
}
</style>
