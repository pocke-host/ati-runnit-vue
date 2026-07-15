<template>
  <main class="pricing-page">

    <!-- HERO — ink, centered -->
    <section class="hero">
      <div class="page-inner hero-inner">
        <span class="gr-eyebrow-badge">Pricing</span>
        <h1 class="hero-h1">Pick your pace.</h1>
        <div class="billing-toggle">
          <button :class="['toggle-opt', !annual ? 'toggle-opt--active' : '']" @click="annual = false">Monthly</button>
          <button :class="['toggle-opt', annual ? 'toggle-opt--active' : '']" @click="annual = true">Annual · 2 mo free</button>
        </div>
      </div>
    </section>

    <!-- PRICING CARDS -->
    <section class="cards-section">
      <div class="page-inner">
        <div class="cards-grid">

          <!-- Free -->
          <div class="price-card">
            <div class="plan-tier plan-tier--muted">Free</div>
            <div class="price-row">
              <span class="price-amount">$0</span>
              <span class="price-mo">/MO</span>
            </div>
            <div class="plan-tagline">For getting started</div>
            <ul class="plan-features">
              <li><b class="check">✓</b>&nbsp; Activity tracking</li>
              <li><b class="check">✓</b>&nbsp; Up to 3 crews</li>
              <li><b class="check">✓</b>&nbsp; Basic stats</li>
              <li><b class="check">✓</b>&nbsp; Strava sync</li>
            </ul>
            <router-link to="/waitlist" class="btn-plan btn-plan--outline">Get Started</router-link>
          </div>

          <!-- Pro — featured -->
          <div class="price-card price-card--featured">
            <div class="popular-tag">Most Popular</div>
            <div class="plan-tier plan-tier--cobalt">Pro</div>
            <div class="price-row">
              <span class="price-amount">{{ annual ? '$7' : '$9' }}</span>
              <span class="price-mo">/MO</span>
            </div>
            <div class="plan-tagline">For serious training</div>
            <ul class="plan-features">
              <li><b class="check">✓</b>&nbsp; Everything in Free</li>
              <li><b class="check">✓</b>&nbsp; Adaptive plans</li>
              <li><b class="check">✓</b>&nbsp; Unlimited crews</li>
              <li><b class="check">✓</b>&nbsp; Moments</li>
              <li><b class="check">✓</b>&nbsp; Garmin sync</li>
              <li><b class="check">✓</b>&nbsp; PR tracking</li>
            </ul>
            <button class="btn-plan btn-plan--cobalt" :disabled="checkoutLoading" @click="handlePlanClick('premium')">
              {{ checkoutLoading === 'premium' ? 'Loading…' : planLabel('premium') }}
            </button>
          </div>

          <!-- Elite -->
          <div class="price-card">
            <div class="plan-tier plan-tier--muted">Elite</div>
            <div class="price-row">
              <span class="price-amount">{{ annual ? '$15' : '$19' }}</span>
              <span class="price-mo">/MO</span>
            </div>
            <div class="plan-tagline">For racing</div>
            <ul class="plan-features">
              <li><b class="check">✓</b>&nbsp; Everything in Pro</li>
              <li><b class="check">✓</b>&nbsp; Coached plan reviews</li>
              <li><b class="check">✓</b>&nbsp; Advanced analytics</li>
              <li><b class="check">✓</b>&nbsp; Priority live share</li>
              <li><b class="check">✓</b>&nbsp; Early features</li>
            </ul>
            <button class="btn-plan btn-plan--outline" :disabled="checkoutLoading" @click="handlePlanClick('duo')">
              {{ checkoutLoading === 'duo' ? 'Loading…' : planLabel('duo') }}
            </button>
          </div>

        </div>
      </div>
    </section>

    <!-- CTA — cobalt -->
    <section class="final-cta">
      <h2 class="cta-h2">Train like you mean it.</h2>
      <p class="cta-sub">Start free. Upgrade when your training does.</p>
      <router-link to="/waitlist" class="btn-pill-paper">Get Started</router-link>
    </section>

  </main>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useHead } from '@unhead/vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useStripe } from '@/composables/useStripe'

useHead({
  title: 'Pricing — Runnit | Free & Pro Plans for Endurance Athletes',
  link: [{ rel: 'canonical', href: 'https://runnit.live/pricing' }],
  meta: [
    { name: 'description', content: 'Start free and log unlimited sessions. Upgrade to Pro for adaptive training plans, advanced analytics, coaching tools, and priority support. Pick your pace.' },
    { property: 'og:title', content: 'Pricing — Runnit | Free & Pro Plans for Endurance Athletes' },
    { property: 'og:description', content: 'Start free. Upgrade to Pro for adaptive training plans, advanced analytics, and coaching tools.' },
    { property: 'og:url', content: 'https://runnit.live/pricing' },
    { property: 'og:image', content: 'https://runnit.live/og-image.png' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Pricing — Runnit | Free & Pro Plans for Endurance Athletes' },
    { name: 'twitter:description', content: 'Start free. Upgrade to Pro for adaptive training plans, advanced analytics, and coaching tools.' },
    { name: 'twitter:image', content: 'https://runnit.live/og-image.png' },
  ]
})

const annual = ref(false)
const checkoutLoading = ref(null)

const router = useRouter()
const { isAuthenticated, subscriptionTier } = storeToRefs(useAuthStore())
const { redirectToCheckout, openBillingPortal } = useStripe()

const hasActiveSub = computed(() => subscriptionTier.value && subscriptionTier.value !== 'free')

const planLabel = (tier) => {
  if (!isAuthenticated.value) return tier === 'premium' ? 'Start Pro' : 'Go Elite'
  if (subscriptionTier.value === tier) return 'Manage Plan'
  if (hasActiveSub.value) return tier === 'premium' ? 'Switch to Pro' : 'Switch to Elite'
  return tier === 'premium' ? 'Start Pro' : 'Go Elite'
}

const handlePlanClick = async (tier) => {
  const period = annual.value ? 'annual' : 'monthly'
  if (!isAuthenticated.value) {
    router.push({ path: '/signup', query: { plan: tier, period } })
    return
  }
  checkoutLoading.value = tier
  try {
    if (hasActiveSub.value) {
      await openBillingPortal()
    } else {
      await redirectToCheckout(tier, period)
    }
  } finally {
    checkoutLoading.value = null
  }
}
</script>

<style scoped>
.pricing-page {
  min-height: 100vh;
  background: #FBF6EC;
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
  color: #16130F;
  padding-top: var(--nav-h);
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
  padding: 56px 0 44px;
  text-align: center;
}
.hero-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
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
  font-size: clamp(64px, 9vw, 100px);
  line-height: 0.82;
  text-transform: uppercase;
  margin: 18px 0 22px;
  animation: rkRise 0.6s ease-out both;
}

/* Billing toggle */
.billing-toggle {
  display: inline-flex;
  border: 2px solid rgba(251,246,236,0.35);
}
.toggle-opt {
  padding: 10px 22px;
  background: transparent;
  border: none;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(251,246,236,0.6);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.toggle-opt--active {
  background: #FBF6EC;
  color: #16130F;
  font-weight: 700;
}

/* ── CARDS ── */
.cards-section {
  padding: 44px 0;
  background: #FBF6EC;
  border-bottom: 2px solid #16130F;
}
.cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}
.price-card {
  border: 2px solid #16130F;
  background: #fff;
  padding: 30px 26px;
  display: flex;
  flex-direction: column;
  position: relative;
}
.price-card--featured {
  box-shadow: 6px 6px 0 #2A55F5;
}
.popular-tag {
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
}
.plan-tier--muted { color: #5a5348; }
.plan-tier--cobalt { color: #2A55F5; }

.price-row {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  margin: 14px 0 4px;
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
}
.price-amount {
  font-size: 3.6rem;
  font-weight: 900;
  line-height: 0.9;
}
.price-mo {
  color: #5a5348;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.8rem;
  font-weight: 500;
  margin-bottom: 12px;
}
.plan-tagline {
  color: #5a5348;
  font-size: 0.9rem;
  margin-bottom: 22px;
}
.plan-features {
  list-style: none;
  padding: 0;
  margin: 0 0 26px;
  display: flex;
  flex-direction: column;
  gap: 11px;
  font-size: 0.92rem;
}
.check { color: #2A55F5; font-style: normal; }

.btn-plan {
  margin-top: auto;
  display: block;
  text-align: center;
  border-radius: 999px;
  padding: 13px 0;
  font-weight: 800;
  font-size: 0.9rem;
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
  text-decoration: none;
  cursor: pointer;
  transition: opacity 0.15s;
  width: 100%;
}
.btn-plan--outline {
  background: #fff;
  color: #16130F;
  border: 2px solid #16130F;
}
.btn-plan--cobalt {
  background: #2A55F5;
  color: #fff;
  border: 2px solid #16130F;
}
.btn-plan:hover:not(:disabled) { opacity: 0.8; }
.btn-plan:disabled { opacity: 0.5; cursor: not-allowed; }

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
  font-size: clamp(48px, 7vw, 76px);
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
.btn-pill-paper:hover { opacity: 0.85; color: #16130F; }

/* ── RESPONSIVE ── */
@media (max-width: 768px) {
  .cards-grid { grid-template-columns: 1fr; gap: 16px; }
  .price-card--featured { box-shadow: 4px 4px 0 #2A55F5; }
}
@media (max-width: 640px) {
  .page-inner { padding: 0 22px; }
  .hero { padding: 44px 0 36px; }
  .cards-section { padding: 32px 0; }
  .final-cta { padding: 44px 22px; }
}
</style>
