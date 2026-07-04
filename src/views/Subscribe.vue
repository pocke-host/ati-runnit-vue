<template>
  <main class="subscribe-page">

    <!-- 001 HERO ─ black -->
    <section class="hero">
      <div class="hero-inner">
        <SectionIndex :num="1" label="Pricing" :on-dark="true" />
        <h1 class="hero-h1">PICK YOUR PACE.</h1>
        <div class="billing-toggle">
          <button :class="['toggle-opt', { 'toggle-opt--active': billing === 'monthly' }]" @click="billing = 'monthly'">Monthly</button>
          <button :class="['toggle-opt', { 'toggle-opt--active': billing === 'annual' }]" @click="billing = 'annual'">Annual · 2 Mo Free</button>
        </div>
      </div>
    </section>

    <!-- PLAN CARDS ─ white -->
    <section class="pricing-section">
      <div class="pricing-inner">
        <div class="plan-grid">

          <!-- Free -->
          <div class="plan-card">
            <div class="plan-tier">Free</div>
            <div class="plan-price-row">
              <span class="plan-price">$0</span>
              <span class="plan-per">/MO</span>
            </div>
            <div class="plan-tagline">For getting started</div>
            <div class="plan-features">
              <div v-for="f in freeFeatures" :key="f" class="plan-feature">
                <span class="plan-check">&#10003;</span>{{ f }}
              </div>
            </div>
            <router-link to="/signup" class="btn-outline">Get Started</router-link>
          </div>

          <!-- Pro (highlighted) -->
          <div class="plan-card plan-card--pro">
            <div class="plan-badge">Most Popular</div>
            <div class="plan-tier plan-tier--pro">Pro</div>
            <div class="plan-price-row">
              <span class="plan-price">{{ billing === 'annual' ? '$7' : '$9' }}</span>
              <span class="plan-per">/MO</span>
            </div>
            <div class="plan-tagline">For serious training</div>
            <div class="plan-features">
              <div v-for="f in proFeatures" :key="f" class="plan-feature">
                <span class="plan-check">&#10003;</span>{{ f }}
              </div>
            </div>
            <router-link v-if="!isAuthenticated" to="/waitlist" class="btn-cta">Start Pro</router-link>
            <button v-else class="btn-cta" @click="handleUpgrade">Start Pro</button>
          </div>

          <!-- Elite -->
          <div class="plan-card">
            <div class="plan-tier">Elite</div>
            <div class="plan-price-row">
              <span class="plan-price">{{ billing === 'annual' ? '$15' : '$19' }}</span>
              <span class="plan-per">/MO</span>
            </div>
            <div class="plan-tagline">For racing</div>
            <div class="plan-features">
              <div v-for="f in eliteFeatures" :key="f" class="plan-feature">
                <span class="plan-check">&#10003;</span>{{ f }}
              </div>
            </div>
            <router-link to="/waitlist" class="btn-outline">Go Elite</router-link>
          </div>

        </div>
      </div>
    </section>

    <!-- 002 WHY PRO ─ smoke -->
    <section class="why-pro-section">
      <div class="page-inner">
        <SectionIndex :num="2" label="Why Pro" />
        <h2 class="section-h2">What the upgrade buys you.</h2>
        <div class="why-grid">
          <div v-for="w in whyPro" :key="w.num" class="why-card">
            <div class="why-num">{{ w.num }}</div>
            <div class="why-title">{{ w.title }}</div>
            <p class="why-body">{{ w.body }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA ─ black -->
    <section class="final-cta">
      <div class="finish-tick"></div>
      <div class="cta-inner">
        <h2 class="cta-h2">TRAIN LIKE YOU MEAN IT.</h2>
        <p class="cta-body">Start free. Upgrade when your training does.</p>
        <router-link to="/signup" class="btn-cta-white">Get Started</router-link>
      </div>
    </section>

  </main>
</template>

<script setup>
import { ref } from 'vue'
import { useHead } from '@unhead/vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import SectionIndex from '@/components/SectionIndex.vue'

useHead({
  title: 'Pricing — Runnit',
  meta: [
    { name: 'description', content: 'Simple, honest pricing. Free to start, Pro when your training does.' },
  ]
})

const router = useRouter()
const { isAuthenticated } = storeToRefs(useAuthStore())
const billing = ref('monthly')

const freeFeatures = ['Activity tracking', 'Up to 3 clubs', 'Basic stats', 'Strava sync']
const proFeatures  = ['Everything in Free', 'AI training plans', 'Unlimited clubs', 'Moments', 'Garmin sync', 'PR tracking']
const eliteFeatures = ['Everything in Pro', 'Coached plan reviews', 'Advanced analytics', 'Priority live share', 'Early features']

const whyPro = [
  { num: '01', title: 'Plans that adapt',  body: 'Every block reshapes around the runs you actually log.' },
  { num: '02', title: 'Unlimited clubs',   body: 'Join every crew you run with, no caps.' },
  { num: '03', title: 'Moments',           body: 'Post the run, stamped and shared in one tap.' },
  { num: '04', title: 'Garmin + PRs',      body: 'Auto-import devices and track every record.' },
]

function handleUpgrade() {
  router.push('/billing')
}
</script>

<style scoped>
.subscribe-page {
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
  padding: 80px 0 64px;
  text-align: center;
}
.hero-inner {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.hero-h1 {
  font-size: clamp(2.6rem, 6vw, 3.75rem);
  font-weight: 900;
  letter-spacing: -0.04em;
  line-height: 0.96;
  margin: 16px 0 28px;
  animation: rkWipe 0.85s cubic-bezier(0.65,0,0.35,1) 0.08s both;
}

.billing-toggle {
  display: inline-flex;
  border: 1px solid rgba(255,255,255,0.3);
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
}
.toggle-opt {
  padding: 10px 22px;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border: none;
  background: transparent;
  color: rgba(255,255,255,0.7);
  cursor: pointer;
  transition: color 0.15s;
}
.toggle-opt:hover { color: #fff; }
.toggle-opt--active {
  background: #fff;
  color: #000;
  font-weight: 600;
}

/* ── PLANS ── */
.pricing-section {
  padding: 56px 24px 72px;
  background: #fff;
}
.pricing-inner {
  max-width: 1000px;
  margin: 0 auto;
}
.plan-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  align-items: start;
}

.plan-card {
  border: 1px solid #E5E5E5;
  background: #fff;
  padding: 36px 32px;
  display: flex;
  flex-direction: column;
  position: relative;
  animation: rkRise 0.55s ease-out both;
}
.plan-card--pro {
  border: 2px solid #000;
}

.plan-badge {
  position: absolute;
  top: 0;
  right: 0;
  background: #000;
  color: #fff;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 0.58rem;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  padding: 6px 12px;
}

.plan-tier {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #767676;
}
.plan-tier--pro { color: #000; }

.plan-price-row {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  margin: 18px 0 4px;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-variant-numeric: tabular-nums;
}
.plan-price {
  font-size: 3rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1;
}
.plan-per {
  color: #767676;
  font-size: 0.8rem;
  margin-bottom: 9px;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
}

.plan-tagline {
  color: #767676;
  font-size: 0.9rem;
  margin-bottom: 26px;
}

.plan-features {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 30px;
  flex: 1;
}
.plan-feature {
  display: flex;
  gap: 10px;
  align-items: baseline;
  font-size: 0.92rem;
}
.plan-check {
  font-weight: 900;
  color: #000;
}

.btn-outline {
  margin-top: auto;
  display: block;
  text-align: center;
  background: #fff;
  color: #000;
  border: 1px solid #E5E5E5;
  padding: 13px 0;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-decoration: none;
  cursor: pointer;
  transition: border-color 0.15s;
}
.btn-outline:hover { border-color: #000; text-decoration: none; }

.btn-cta {
  margin-top: auto;
  display: block;
  text-align: center;
  background: #0052FF;
  color: #fff;
  border: 2px solid #0052FF;
  padding: 13px 0;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  width: 100%;
}
.btn-cta:hover { background: #003ECC; border-color: #003ECC; color: #fff; text-decoration: none; }

/* ── WHY PRO ── */
.why-pro-section {
  background: #F5F5F5;
  border-top: 1px solid #E5E5E5;
}
.why-pro-section .page-inner { padding-top: 72px; padding-bottom: 72px; }
.section-h2 {
  font-size: clamp(2.2rem, 4vw, 2.5rem);
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 1.0;
  margin: 14px 0 36px;
  max-width: 620px;
}
.why-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background: #E5E5E5;
  border: 1px solid #E5E5E5;
}
.why-card {
  background: #fff;
  padding: 32px;
}
.why-num {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 16px;
  font-variant-numeric: tabular-nums;
}
.why-title {
  font-weight: 800;
  font-size: 1.05rem;
  letter-spacing: -0.02em;
  margin-bottom: 8px;
}
.why-body {
  color: #767676;
  line-height: 1.55;
  font-size: 0.88rem;
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
.btn-cta-white {
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
.btn-cta-white:hover { background: #003ECC; border-color: #003ECC; color: #fff; text-decoration: none; }

/* ── Responsive ── */
@media (max-width: 860px) {
  .plan-grid { grid-template-columns: 1fr; max-width: 440px; margin: 0 auto; }
  .why-grid { grid-template-columns: repeat(2, 1fr); }
  .cta-inner { padding: 60px 24px; }
}

@media (max-width: 640px) {
  .page-inner { padding-left: 22px; padding-right: 22px; }

  /* Hero */
  .hero { padding: 56px 0 44px; }
  .hero-h1 { font-size: 40px !important; line-height: 0.96; }
  .billing-toggle { display: flex; width: 100%; }
  .toggle-opt { flex: 1; justify-content: center; }

  /* Plans */
  .pricing-section { padding: 44px 22px 56px; }
  .plan-card { padding: 30px 24px; }
  .plan-price { font-size: 2.6rem; }
  .btn-cta, .btn-outline { padding: 15px 0; }

  /* Why Pro */
  .why-pro-section .page-inner { padding-top: 44px; padding-bottom: 44px; }
  .section-h2 { font-size: 32px !important; }
  .why-grid { grid-template-columns: repeat(2, 1fr); }
  .why-card { padding: 22px; }

  /* CTA */
  .cta-inner { padding: 56px 22px 60px; }
  .cta-h2 { font-size: 36px !important; }
  .btn-cta-white { display: block; width: 100%; text-align: center; padding: 15px 0; }
}
</style>
