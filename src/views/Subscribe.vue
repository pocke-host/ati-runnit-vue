<template>
  <main class="subscribe-page">

    <!-- HERO — ink, centered -->
    <section class="hero">
      <div class="page-inner">
        <span class="gr-eyebrow-badge">Pricing</span>
        <h1 class="hero-h1">Pick your pace.</h1>
        <div class="billing-toggle">
          <button :class="['toggle-opt', { 'toggle-opt--active': billing === 'monthly' }]" @click="billing = 'monthly'">Monthly</button>
          <button :class="['toggle-opt', { 'toggle-opt--active': billing === 'annual' }]" @click="billing = 'annual'">Annual · 2 mo free</button>
        </div>
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
            <div class="plan-tagline">For getting started</div>
            <div class="plan-features">
              <div v-for="f in freeFeatures" :key="f" class="plan-feature">
                <span class="plan-check">✓</span>{{ f }}
              </div>
            </div>
            <router-link to="/signup" class="btn-plan btn-plan--ghost">Get Started</router-link>
          </div>

          <!-- Pro (featured) -->
          <div class="plan-card plan-card--pro">
            <div class="plan-badge">Most Popular</div>
            <div class="plan-tier plan-tier--cobalt">Pro</div>
            <div class="plan-price-row">
              <span class="plan-price">{{ billing === 'annual' ? '$7' : '$9' }}</span>
              <span class="plan-per">/MO</span>
            </div>
            <div class="plan-tagline">For serious training</div>
            <div class="plan-features">
              <div v-for="f in proFeatures" :key="f" class="plan-feature">
                <span class="plan-check">✓</span>{{ f }}
              </div>
            </div>
            <button class="btn-plan btn-plan--cobalt" :disabled="checkoutLoading" @click="handlePlanClick('premium')">
              {{ checkoutLoading === 'premium' ? 'Loading…' : 'Start Pro' }}
            </button>
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
                <span class="plan-check">✓</span>{{ f }}
              </div>
            </div>
            <button class="btn-plan btn-plan--ghost" :disabled="checkoutLoading" @click="handlePlanClick('duo')">
              {{ checkoutLoading === 'duo' ? 'Loading…' : 'Go Elite' }}
            </button>
          </div>

        </div>
      </div>
    </section>

    <!-- CTA — cobalt -->
    <section class="final-cta">
      <h2 class="cta-h2">Train like you mean it.</h2>
      <p class="cta-sub">Start free. Upgrade when your training does.</p>
      <router-link to="/signup" class="btn-pill-paper">Get Started</router-link>
    </section>

  </main>
</template>

<script setup>
import { ref } from 'vue'
import { useHead } from '@unhead/vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { useStripe } from '@/composables/useStripe'

useHead({
  title: 'Pricing — Runnit',
  meta: [
    { name: 'description', content: 'Pick your pace. Simple, honest pricing — free to start, Pro when your training does.' },
  ]
})

const router = useRouter()
const { isAuthenticated } = storeToRefs(useAuthStore())
const { redirectToCheckout } = useStripe()
const billing = ref('monthly')
const checkoutLoading = ref(null)

const freeFeatures  = ['Activity tracking', 'Up to 3 crews', 'Basic stats', 'Strava sync']
const proFeatures   = ['Everything in Free', 'Adaptive plans', 'Unlimited crews', 'Moments', 'Garmin sync', 'PR tracking']
const eliteFeatures = ['Everything in Pro', 'Coached plan reviews', 'Advanced analytics', 'Priority live share', 'Early features']

const handlePlanClick = async (tier) => {
  const period = billing.value
  if (isAuthenticated.value) {
    checkoutLoading.value = tier
    try {
      await redirectToCheckout(tier, period)
    } finally {
      checkoutLoading.value = null
    }
  } else {
    router.push({ path: '/signup', query: { plan: tier, period } })
  }
}
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
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
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
