<template>
  <main class="subscribe-page">

    <!-- HERO -->
    <section class="hero">
      <div class="hero-inner">
        <p class="hero-kicker">RUNNIT PRO</p>
        <h1 class="hero-headline">Train without limits.</h1>
        <p class="hero-sub">AI plans, coach access, advanced analytics, and more — starting at $7.99/mo.</p>
        <div class="billing-toggle">
          <button :class="['toggle-opt', { active: billing === 'monthly' }]" @click="billing = 'monthly'">Monthly</button>
          <button :class="['toggle-opt', { active: billing === 'annual' }]" @click="billing = 'annual'">
            Annual <span class="save-badge">Save 33%</span>
          </button>
        </div>
      </div>
    </section>

    <!-- PRICING GRID -->
    <section class="pricing-section">
      <div class="pricing-inner">

        <!-- Free -->
        <div class="plan-card">
          <div class="plan-tier">Free</div>
          <div class="plan-price">$0<span class="plan-per">/month</span></div>
          <p class="plan-tagline">Everything you need to get moving.</p>
          <ul class="plan-features">
            <li><i class="bi bi-check2"></i> GPS activity tracking</li>
            <li><i class="bi bi-check2"></i> Activity history &amp; basic stats</li>
            <li><i class="bi bi-check2"></i> Community feed &amp; clubs</li>
            <li><i class="bi bi-check2"></i> Challenges &amp; leaderboards</li>
            <li><i class="bi bi-check2"></i> Personal records</li>
            <li><i class="bi bi-check2"></i> Device sync (Garmin, Apple Watch)</li>
            <li><i class="bi bi-check2"></i> Daily Moments</li>
          </ul>
          <router-link to="/signup" class="plan-btn plan-btn-outline">Get started free</router-link>
        </div>

        <!-- Pro (highlighted) -->
        <div class="plan-card plan-card-pro">
          <div class="plan-badge">MOST POPULAR</div>
          <div class="plan-tier">Pro</div>
          <div class="plan-price">
            {{ billing === 'monthly' ? '$11.99' : '$7.99' }}<span class="plan-per">/month</span>
          </div>
          <p class="plan-tagline-sub" v-if="billing === 'annual'">Billed $95.88 annually</p>
          <p class="plan-tagline">For athletes serious about improvement.</p>
          <ul class="plan-features">
            <li><i class="bi bi-check2"></i> Everything in Free</li>
            <li><i class="bi bi-check2"></i> AI-powered training plans</li>
            <li><i class="bi bi-check2"></i> Coach access &amp; DMs</li>
            <li><i class="bi bi-check2"></i> Advanced analytics &amp; load tracking</li>
            <li><i class="bi bi-check2"></i> Race predictor &amp; goal pacing</li>
            <li><i class="bi bi-check2"></i> Weekly performance reports</li>
            <li><i class="bi bi-check2"></i> Priority support</li>
          </ul>
          <router-link v-if="!isAuthenticated" to="/signup" class="plan-btn plan-btn-primary">
            Start free trial
          </router-link>
          <button
            v-else
            class="plan-btn plan-btn-primary"
            @click="handleCheckout('premium')"
            :disabled="checkoutLoading === 'premium'"
          >
            <span v-if="checkoutLoading === 'premium'" class="btn-spinner"></span>
            <span v-else>Start free trial — 14 days</span>
          </button>
          <p class="plan-fine">No credit card required to start.</p>
        </div>

        <!-- Duo -->
        <div class="plan-card">
          <div class="plan-tier">Duo</div>
          <div class="plan-price">
            {{ billing === 'monthly' ? '$19.99' : '$15.99' }}<span class="plan-per">/month</span>
          </div>
          <p class="plan-tagline">Two Pro accounts under one plan.</p>
          <ul class="plan-features">
            <li><i class="bi bi-check2"></i> Two full Pro seats</li>
            <li><i class="bi bi-check2"></i> All Pro features</li>
            <li><i class="bi bi-check2"></i> Shared challenges &amp; goals</li>
            <li><i class="bi bi-check2"></i> Simple invite &amp; manage</li>
            <li><i class="bi bi-check2"></i> Shared billing dashboard</li>
          </ul>
          <router-link v-if="!isAuthenticated" to="/signup" class="plan-btn plan-btn-outline">
            Choose Duo
          </router-link>
          <button
            v-else
            class="plan-btn plan-btn-outline"
            @click="handleCheckout('duo')"
            :disabled="checkoutLoading === 'duo'"
          >
            <span v-if="checkoutLoading === 'duo'" class="btn-spinner btn-spinner-dark"></span>
            <span v-else>Choose Duo</span>
          </button>
        </div>

      </div>

      <p v-if="checkoutError" class="checkout-error">{{ checkoutError }}</p>
    </section>

    <!-- WHY PRO -->
    <section class="why-section">
      <div class="why-inner">
        <p class="section-kicker">Why athletes upgrade</p>
        <div class="why-grid">
          <div class="why-item">
            <i class="bi bi-robot why-icon"></i>
            <div class="why-name">AI Training Plans</div>
            <div class="why-desc">Plans that adapt to your fitness, schedule, and fatigue. Not a generic template.</div>
          </div>
          <div class="why-item">
            <i class="bi bi-graph-up-arrow why-icon"></i>
            <div class="why-name">Deep Analytics</div>
            <div class="why-desc">Weekly load tracking, pace trends, and performance reports that show where you're leaving gains.</div>
          </div>
          <div class="why-item">
            <i class="bi bi-person-badge why-icon"></i>
            <div class="why-name">Real Coach Access</div>
            <div class="why-desc">Connect with a certified coach, get custom plans, and message them directly.</div>
          </div>
          <div class="why-item">
            <i class="bi bi-bullseye why-icon"></i>
            <div class="why-name">Race Predictor</div>
            <div class="why-desc">See your projected finish time for any race distance based on your current fitness.</div>
          </div>
        </div>
      </div>
    </section>

    <!-- FINAL CTA -->
    <section class="final-cta">
      <div class="cta-inner">
        <h2 class="cta-headline">Your next PR starts here.</h2>
        <router-link v-if="!isAuthenticated" to="/signup" class="cta-btn">Start free — no card needed</router-link>
        <button
          v-else
          class="cta-btn"
          @click="handleCheckout('premium')"
          :disabled="checkoutLoading === 'premium'"
        >
          <span v-if="checkoutLoading === 'premium'" class="btn-spinner"></span>
          <span v-else>Start Pro trial — 14 days free</span>
        </button>
        <p class="cta-fine">Cancel anytime. No commitment.</p>
      </div>
    </section>

  </main>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useStripe } from '@/composables/useStripe'
import { storeToRefs } from 'pinia'

const authStore = useAuthStore()
const { isAuthenticated } = storeToRefs(authStore)
const { redirectToCheckout } = useStripe()

const billing = ref('annual')
const checkoutLoading = ref('')
const checkoutError = ref('')

const handleCheckout = async (tier) => {
  checkoutLoading.value = tier
  checkoutError.value = ''
  try {
    await redirectToCheckout(tier, billing.value)
  } catch {
    checkoutError.value = 'Something went wrong. Please try again.'
    checkoutLoading.value = ''
  }
}
</script>

<style scoped>
.subscribe-page {
  min-height: 100vh;
  background: #fff;
  padding-top: var(--nav-h, 64px);
  font-family: Futura, 'Avenir Next', system-ui, sans-serif;
  color: #000;
}

/* HERO */
.hero {
  background: #000;
  color: #fff;
  padding: 80px 24px 72px;
  border-bottom: 1px solid #111;
}
.hero-inner { max-width: 700px; margin: 0 auto; }
.hero-kicker {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.20em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.45);
  margin-bottom: 20px;
}
.hero-headline {
  font-size: clamp(2.8rem, 7vw, 5rem);
  font-weight: 900;
  letter-spacing: -0.04em;
  line-height: 0.97;
  margin: 0 0 20px;
}
.hero-sub {
  font-size: 1rem;
  color: rgba(255,255,255,0.65);
  line-height: 1.55;
  margin: 0 0 40px;
  max-width: 520px;
}

/* Billing toggle */
.billing-toggle {
  display: inline-flex;
  border: 1px solid rgba(255,255,255,0.18);
}
.toggle-opt {
  padding: 10px 24px;
  background: transparent;
  border: none;
  color: rgba(255,255,255,0.50);
  font-family: inherit;
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  display: flex;
  align-items: center;
  gap: 8px;
}
.toggle-opt.active {
  background: #fff;
  color: #000;
}
.save-badge {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  background: #000;
  color: #fff;
  padding: 2px 7px;
}
.toggle-opt.active .save-badge {
  background: #000;
  color: #fff;
}

/* PRICING */
.pricing-section {
  padding: 64px 24px;
  background: #F5F5F5;
  border-bottom: 1px solid #E5E5E5;
}
.pricing-inner {
  max-width: 1000px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: #E5E5E5;
  border: 1px solid #E5E5E5;
}

.plan-card {
  background: #fff;
  padding: 40px 32px;
  position: relative;
  display: flex;
  flex-direction: column;
}
.plan-card-pro {
  border: 2px solid #000;
  margin: -1px;
  z-index: 1;
}

.plan-badge {
  position: absolute;
  top: 0;
  left: 0;
  background: #000;
  color: #fff;
  font-size: 0.58rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  padding: 5px 12px;
}
.plan-tier {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.20em;
  text-transform: uppercase;
  color: #767676;
  margin-bottom: 12px;
  margin-top: 20px;
}
.plan-card-pro .plan-tier { margin-top: 28px; }

.plan-price {
  font-size: 2.8rem;
  font-weight: 900;
  letter-spacing: -0.05em;
  line-height: 1;
  margin-bottom: 6px;
}
.plan-per {
  font-size: 1rem;
  font-weight: 400;
  letter-spacing: 0;
  color: #767676;
}
.plan-tagline-sub {
  font-size: 0.72rem;
  color: #767676;
  margin: 0 0 6px;
}
.plan-tagline {
  font-size: 0.85rem;
  color: #767676;
  margin-bottom: 24px;
  line-height: 1.5;
}

.plan-features {
  list-style: none;
  padding: 0;
  margin: 0 0 32px;
  border-top: 1px solid #E5E5E5;
  padding-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}
.plan-features li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 0.85rem;
  color: #000;
}
.plan-features li i { font-size: 0.9rem; flex-shrink: 0; margin-top: 1px; }

.plan-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px 20px;
  font-family: inherit;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.10em;
  text-transform: uppercase;
  text-decoration: none;
  border: 2px solid #000;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.plan-btn-primary { background: #0052FF; color: #fff; }
.plan-btn-primary:hover:not(:disabled) { background: #003ECC; border-color: #003ECC; color: #fff; text-decoration: none; }
.plan-btn-outline { background: #fff; color: #000; }
.plan-btn-outline:hover:not(:disabled) { background: #0052FF; color: #fff; border-color: #0052FF; text-decoration: none; }
.plan-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.plan-fine {
  font-size: 0.68rem;
  color: #767676;
  margin-top: 10px;
  margin-bottom: 0;
  text-align: center;
  letter-spacing: 0.04em;
}

.checkout-error {
  max-width: 1000px;
  margin: 16px auto 0;
  font-size: 0.85rem;
  color: #dc2626;
  text-align: center;
}

/* WHY PRO */
.why-section {
  padding: 80px 24px;
  background: #fff;
  border-bottom: 1px solid #E5E5E5;
}
.why-inner { max-width: 960px; margin: 0 auto; }
.section-kicker {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.20em;
  text-transform: uppercase;
  color: #767676;
  margin-bottom: 48px;
}
.why-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-top: 1px solid #E5E5E5;
}
.why-item {
  padding: 32px 28px;
  border-right: 1px solid #E5E5E5;
}
.why-item:last-child { border-right: none; }
.why-icon {
  font-size: 1.4rem;
  color: #000;
  display: block;
  margin-bottom: 16px;
}
.why-name {
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin-bottom: 10px;
}
.why-desc {
  font-size: 0.83rem;
  color: #767676;
  line-height: 1.65;
}

/* FINAL CTA */
.final-cta {
  background: #000;
  padding: 100px 24px;
  text-align: center;
}
.cta-inner { max-width: 600px; margin: 0 auto; }
.cta-headline {
  font-size: clamp(2.4rem, 6vw, 4rem);
  font-weight: 900;
  letter-spacing: -0.04em;
  line-height: 1;
  color: #fff;
  margin-bottom: 40px;
}
.cta-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 48px;
  background: #0052FF;
  color: #fff;
  font-family: inherit;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  text-decoration: none;
  border: 2px solid #0052FF;
  cursor: pointer;
  transition: background 0.15s;
}
.cta-btn:hover:not(:disabled) { background: #003ECC; border-color: #003ECC; color: #fff; text-decoration: none; }
.cta-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.cta-fine {
  font-size: 0.72rem;
  color: rgba(255,255,255,0.35);
  margin-top: 16px;
  margin-bottom: 0;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

/* Spinners */
.btn-spinner {
  display: inline-block;
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,0.30);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}
.btn-spinner-dark {
  border-color: rgba(0,0,0,0.15);
  border-top-color: #000;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Responsive */
@media (max-width: 900px) {
  .pricing-inner { grid-template-columns: 1fr; }
  .plan-card-pro { margin: 0; border-width: 2px; }
  .why-grid { grid-template-columns: repeat(2, 1fr); }
  .why-item:nth-child(2) { border-right: none; }
  .why-item:nth-child(3) { border-right: 1px solid #E5E5E5; }
  .why-item { border-bottom: 1px solid #E5E5E5; }
  .why-item:nth-child(3), .why-item:nth-child(4) { border-bottom: none; }
}
@media (max-width: 560px) {
  .hero { padding: 56px 24px 48px; }
  .why-grid { grid-template-columns: 1fr; }
  .why-item { border-right: none !important; border-bottom: 1px solid #E5E5E5; }
  .why-item:last-child { border-bottom: none; }
  .billing-toggle { width: 100%; }
  .toggle-opt { flex: 1; justify-content: center; }
}
</style>
