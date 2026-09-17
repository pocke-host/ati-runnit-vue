<template>
  <main class="subscribe-page">

    <!-- HERO — ink, centered -->
    <section class="hero">
      <div class="page-inner">
        <span class="gr-eyebrow-badge">Pricing</span>
        <h1 class="hero-h1">Core training stays free.</h1>
        <p class="launch-note">Free for every athlete. Runnit earns when coaches earn.</p>
      </div>
    </section>

    <!-- PLAN CARDS -->
    <section class="pricing-section">
      <div class="page-inner">
        <div class="plan-grid">

          <!-- Free -->
          <div class="plan-card">
            <div class="plan-tier">Free</div>
            <div class="plan-price-row">
              <span class="plan-price">$0</span>
              <span class="plan-per">/MO</span>
            </div>
            <div class="plan-tagline">Everything athletes need. Free forever.</div>
            <div class="plan-features">
              <div v-for="f in freeFeatures" :key="f" class="plan-feature">
                <span class="plan-check">✓</span>{{ f }}
              </div>
            </div>
            <router-link to="/signup" class="btn-plan btn-plan--ghost">Lace Up</router-link>
          </div>

        </div>
      </div>
    </section>

    <!-- CTA — cobalt -->
    <section class="final-cta">
      <h2 class="cta-h2">Train like you mean it.</h2>
      <p class="cta-sub">Runnit is free for athletes. Coaches pay only when they earn through the marketplace.</p>
      <router-link to="/signup" class="btn-pill-paper">Lace Up</router-link>
    </section>

  </main>
</template>

<script setup>
import { useHead } from '@unhead/vue'

useHead({
  title: 'Pricing — Runnit',
  meta: [
    { name: 'description', content: 'Runnit is free for athletes. Discover coaches, train with your community, and track your progress without a paywall.' },
  ]
})

const freeFeatures  = ['Unlimited activity tracking', 'Feed, comments, GIFs, and challenges', 'Plans, folders, races, and strength journal', 'Apple Health and connected devices']
</script>

<style scoped>
.subscribe-page {
  min-height: 100vh;
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
  padding: 76px 0 60px;
  text-align: center;
  border-bottom: 2px solid #16130F;
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
.launch-note {
  margin: -8px 0 0;
  color: #E7DFCE;
  font-size: 0.9rem;
  font-weight: 700;
}
.hero-h1 {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-weight: 900;
  font-size: clamp(60px, 9vw, 100px);
  line-height: 0.82;
  text-transform: uppercase;
  margin: 18px 0 22px;
  animation: rkRise 0.6s ease-out both;
}
.billing-toggle {
  display: inline-flex;
  border: 2px solid rgba(251,246,236,0.35);
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
}
.toggle-opt {
  padding: 10px 22px;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: transparent;
  color: rgba(251,246,236,0.7);
  border: none;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.toggle-opt--active {
  background: #FBF6EC;
  color: #16130F;
}

/* ── PRICING ── */
.pricing-section {
  padding: 44px 0;
  background: #FBF6EC;
  border-bottom: 2px solid #16130F;
}
.plan-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  max-width: 760px;
  margin: 0 auto;
}
.plan-card {
  border: 2px solid #16130F;
  background: #fff;
  padding: 30px 26px;
  display: flex;
  flex-direction: column;
  position: relative;
}
.plan-card--pro {
  box-shadow: 6px 6px 0 #2A55F5;
}
.plan-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background: #2A55F5;
  color: #fff;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 6px 12px;
  border: 2px solid #16130F;
}
.plan-tier {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #5A5348;
}
.plan-tier--cobalt { color: #2A55F5; }
.plan-price-row {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  margin: 14px 0 4px;
}
.plan-price {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-size: 3.6rem;
  font-weight: 900;
  line-height: 0.9;
}
.plan-per {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.8rem;
  font-weight: 500;
  color: #5A5348;
  margin-bottom: 12px;
}
.plan-tagline { color: #5A5348; font-size: 0.9rem; margin-bottom: 22px; }
.plan-features { display: flex; flex-direction: column; gap: 11px; margin-bottom: 26px; font-size: 0.92rem; flex: 1; }
.plan-feature { display: flex; gap: 8px; align-items: baseline; }
.plan-check { color: #2A55F5; font-weight: 700; }

.btn-plan {
  display: block;
  text-align: center;
  border-radius: 999px;
  padding: 13px 0;
  font-weight: 800;
  font-size: 0.9rem;
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
  text-decoration: none;
  cursor: pointer;
  border: 2px solid #16130F;
  transition: opacity 0.15s;
  margin-top: auto;
  width: 100%;
}
.btn-plan:hover:not(:disabled) { opacity: 0.85; text-decoration: none; }
.btn-plan:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-plan--ghost { background: #fff; color: #16130F; }
.btn-plan--cobalt { background: #2A55F5; color: #fff; }

/* ── CTA ── */
.final-cta {
  background: #2A55F5;
  color: #fff;
  padding: 56px 32px;
  text-align: center;
}
.cta-h2 {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-weight: 900;
  font-size: clamp(48px, 6vw, 76px);
  line-height: 0.86;
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
  .plan-grid { grid-template-columns: 1fr; max-width: 400px; margin: 0 auto; }
}
@media (max-width: 640px) {
  .page-inner { padding: 0 22px; }
  .hero { padding: 56px 0 40px; }
  .pricing-section { padding: 32px 0; }
  .final-cta { padding: 44px 22px; }
}
</style>
