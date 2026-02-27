<!-- src/pages/Subscribe.vue -->
<template>
  <main class="subscribe-page">
    <!-- HERO -->
    <section class="hero">
      <div class="container-xxl">
        <div class="row align-items-center g-4">
          <div class="col-12 col-lg-7">
            <p class="eyebrow text-uppercase fw-semibold mb-2">Upgrade your loop.</p>
            <h1 class="display-5 fw-bold mb-3">Unlock Premium systems for consistency.</h1>
            <p class="lead text-muted mb-4">
              Better planning, deeper insights, and tools that keep you showing up — so progress feels inevitable.
            </p>

            <!-- Live stat counter -->
            <p class="fw-semibold text-dark mb-4">
              <span class="stat">{{ liveWorkouts }}</span> moments logged today
            </p>

            <!-- Billing toggle -->
            <div class="billing d-inline-flex align-items-center gap-3">
              <span :class="['label', { muted: billing !== 'monthly' }]">Monthly</span>
              <button class="toggle" @click="toggleBilling" :aria-pressed="billing === 'annual'">
                <span :class="['knob', billing]"></span>
              </button>
              <span :class="['label', { muted: billing !== 'annual' }]">
                Annual <small class="save">Save {{ savePct }}%</small>
              </span>
            </div>
          </div>
          <div class="col-12 col-lg-5">
            <div class="hero-art rounded-4 d-flex align-items-center justify-content-center">
              <div class="hero-icon">
                <i class="bi bi-lock-fill"></i>
              </div>
              <div class="hero-copy">
                <div class="hero-kicker">PREMIUM UNLOCK</div>
                <div class="hero-line">Plans • Insights • Safety</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- PRICING CARDS -->
    <section class="pricing">
      <div class="container-xxl">
        <div class="row g-4">
          <!-- Free -->
          <div class="col-12 col-md-6 col-lg-4">
            <div class="card h-100 price-card">
              <div class="card-body d-flex flex-column">
                <h3 class="h4 fw-bold mb-2">Free</h3>
                <p class="text-muted">Log workouts, post moments, and join the community.</p>
                <div class="display-6 fw-bold mb-3">$0</div>
                <ul class="list-unstyled small flex-grow-1">
                  <li class="mb-2"><i class="bi bi-check2-circle me-2 text-success"></i> Record & upload workouts</li>
                  <li class="mb-2"><i class="bi bi-check2-circle me-2 text-success"></i> Basic trends & history</li>
                  <li class="mb-2"><i class="bi bi-check2-circle me-2 text-success"></i> Challenges & community</li>
                </ul>
                <router-link to="/signup" class="btn btn-outline-dark w-100 mt-auto">Create Free Account</router-link>
              </div>
            </div>
          </div>

          <!-- Premium -->
          <div class="col-12 col-md-6 col-lg-4">
            <div class="card h-100 price-card highlight">
              <div class="card-body d-flex flex-column">
                <div class="badge best mb-2">Best Value</div>
                <h3 class="h4 fw-bold mb-1">Premium</h3>
                <p class="text-muted">Unlock systems that accelerate your progress.</p>

                <div class="price mb-1">
                  <span class="display-6 fw-bold">
                    {{ billing === 'monthly' ? priceMonthly : priceAnnual }}
                  </span>
                  <span class="text-muted">/ {{ billing }}</span>
                </div>
                <p class="small text-muted mb-3" v-if="billing === 'annual'">
                  Billed annually at {{ annualTotal }} total
                </p>

                <!-- Unique perks w/ icons -->
                <ul class="list-unstyled small flex-grow-1">
                  <li class="mb-2"><i class="bi bi-map me-2 text-success"></i> Route planning & saved routes</li>
                  <li class="mb-2"><i class="bi bi-bullseye me-2 text-success"></i> Structured goals & plans</li>
                  <li class="mb-2"><i class="bi bi-graph-up-arrow me-2 text-success"></i> Deeper pace/power insights</li>
                  <li class="mb-2"><i class="bi bi-trophy me-2 text-success"></i> Competitive segments (coming soon)</li>
                  <li class="mb-2"><i class="bi bi-shield-check me-2 text-success"></i> Safety tools & live sharing</li>
                </ul>

                <router-link to="/signup" class="btn btn-primary w-100 mt-auto">
                  Start Free Trial
                </router-link>
              </div>
            </div>
          </div>

          <!-- Duo -->
          <div class="col-12 col-md-6 col-lg-4">
            <div class="card h-100 price-card">
              <div class="card-body d-flex flex-column">
                <h3 class="h4 fw-bold mb-2">Duo</h3>
                <p class="text-muted">Two Premium accounts under one plan.</p>
                <div class="display-6 fw-bold mb-3">
                  {{ billing === 'monthly' ? duoMonthly : duoAnnual }}
                </div>
                <ul class="list-unstyled small flex-grow-1">
                  <li class="mb-2"><i class="bi bi-people me-2 text-success"></i> Two Premium seats</li>
                  <li class="mb-2"><i class="bi bi-star me-2 text-success"></i> All Premium systems</li>
                  <li class="mb-2"><i class="bi bi-envelope-open me-2 text-success"></i> Simple invite & manage</li>
                </ul>
                <router-link to="/signup" class="btn btn-outline-dark w-100 mt-auto">
                  Choose Duo
                </router-link>
              </div>
            </div>
          </div>
        </div>

        <p class="small text-muted mt-3 mb-0">
          Prices shown are examples. Taxes may apply. Cancel anytime during the trial.
        </p>
      </div>
    </section>

    <!-- WHY PREMIUM (icon grid) -->
    <section class="why-premium">
      <div class="container-xxl text-center">
        <h2 class="fw-bold mb-4">Why people upgrade</h2>
        <div class="row g-4">
          <div class="col-6 col-md-3">
            <i class="bi bi-map display-5 why-icon"></i>
            <p class="fw-semibold mt-2">Smarter planning</p>
          </div>
          <div class="col-6 col-md-3">
            <i class="bi bi-bullseye display-5 why-icon"></i>
            <p class="fw-semibold mt-2">Clear goals</p>
          </div>
          <div class="col-6 col-md-3">
            <i class="bi bi-graph-up-arrow display-5 why-icon"></i>
            <p class="fw-semibold mt-2">Deeper insights</p>
          </div>
          <div class="col-6 col-md-3">
            <i class="bi bi-shield-check display-5 why-icon"></i>
            <p class="fw-semibold mt-2">More control</p>
          </div>
        </div>
      </div>
    </section>

    <!-- TESTIMONIALS -->
    <section class="testimonials">
      <div class="container-xxl text-center">
        <h2 class="fw-bold mb-4">Used by people who stay consistent</h2>
        <div class="row g-4">
          <div class="col-md-4">
            <blockquote class="blockquote">
              <p>“Premium helped me build a routine that actually stuck.”</p>
              <footer class="blockquote-footer">Maya, Triathlete</footer>
            </blockquote>
          </div>
          <div class="col-md-4">
            <blockquote class="blockquote">
              <p>“The insights made it obvious when to push and when to recover.”</p>
              <footer class="blockquote-footer">Alex, Cyclist</footer>
            </blockquote>
          </div>
          <div class="col-md-4">
            <blockquote class="blockquote">
              <p>“Routes + goals made training feel simple again.”</p>
              <footer class="blockquote-footer">Sam, Runner</footer>
            </blockquote>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta">
      <div class="container-xxl text-center">
        <h2 class="fw-bold mb-2">Upgrade your next 30 days.</h2>
        <p class="text-muted mb-4">Start the trial. Keep the loop alive.</p>
        <router-link to="/signup" class="btn btn-primary btn-lg">Start Free Trial</router-link>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const billing = ref('annual')
const toggleBilling = () => (billing.value = billing.value === 'annual' ? 'monthly' : 'annual')

// Example prices
const priceMonthly = '$11.99'
const priceAnnual = '$7.99'
const annualTotal = '$95.88'
const duoMonthly = '$19.99'
const duoAnnual = '$15.99'
const savePct = computed(() => 33)

// Fake live workout stat
const liveWorkouts = ref(0)
onMounted(() => {
  liveWorkouts.value = (12000 + Math.floor(Math.random() * 500)).toLocaleString()
})
</script>

<style scoped>
.subscribe-page{
  --r-olive:#5A6B4E;
  --r-olive-deep:#2C3726;
  --r-black:#0F1210;
  --r-stone:#A3A69F;
  --r-offwhite:#F5F6F3;
  --r-white:#FFFFFF;
  --r-accent:#C46A2A;

  background: var(--r-offwhite);
  font-family: Futura, "Futura PT", "Futura Std", "Avenir Next", Avenir,
    system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
}

/* HERO */
.hero{
  padding: 64px 0;
  background:
    radial-gradient(900px 420px at 18% 18%, rgba(255,255,255,0.10), rgba(255,255,255,0) 60%),
    radial-gradient(900px 420px at 85% 30%, rgba(196,106,42,0.10), rgba(196,106,42,0) 60%),
    linear-gradient(135deg, var(--r-olive), var(--r-olive-deep));
  color: var(--r-white);
}
.eyebrow{
  letter-spacing:.16em;
  color: rgba(255,255,255,0.82);
}
.hero :deep(.lead),
.hero :deep(.text-muted){
  color: rgba(255,255,255,0.76) !important;
}
.hero :deep(.text-dark){
  color: rgba(255,255,255,0.92) !important;
}
.stat{
  font-variant-numeric: tabular-nums;
  letter-spacing: .06em;
  padding: 4px 10px;
  border-radius: 12px;
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.16);
}

/* Hero art becomes premium glass panel (no “sim” visuals) */
.hero-art{
  height: 340px;
  position: relative;
  overflow: hidden;

  background:
    radial-gradient(700px 260px at 30% 20%, rgba(255,255,255,0.14), rgba(255,255,255,0) 60%),
    radial-gradient(800px 320px at 80% 80%, rgba(15,18,16,0.35), rgba(15,18,16,0) 60%),
    linear-gradient(135deg, rgba(255,255,255,0.09), rgba(255,255,255,0.03));
  border: 1px solid rgba(255,255,255,0.18);
  box-shadow: 0 26px 70px rgba(15,18,16,0.34);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.hero-icon{
  width: 72px;
  height: 72px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.18);
  box-shadow: 0 18px 46px rgba(15,18,16,.26);
  margin-right: 14px;
}
.hero-icon i{
  font-size: 1.8rem;
  color: rgba(255,255,255,0.92);
}
.hero-copy{
  display:flex;
  flex-direction: column;
  gap: 4px;
}
.hero-kicker{
  font-weight: 900;
  letter-spacing: .18em;
  font-size: .78rem;
  color: rgba(255,255,255,0.86);
}
.hero-line{
  font-weight: 700;
  color: rgba(255,255,255,0.78);
}

/* Billing toggle */
.billing .label{ font-weight: 700; color: rgba(255,255,255,0.92); }
.billing .label.muted{ color: rgba(255,255,255,0.55); }
.billing .save{
  margin-left: 6px;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(196,106,42,0.18);
  border: 1px solid rgba(196,106,42,0.28);
  color: rgba(255,255,255,0.92);
  font-weight: 800;
}

.toggle{
  position: relative;
  width: 56px;
  height: 28px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.22);
  background: rgba(255,255,255,0.10);
  padding: 0;
  cursor: pointer;
  box-shadow: 0 16px 34px rgba(15,18,16,0.22);
}
.knob{
  position: absolute;
  top: 3px;
  left: 3px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--r-accent);
  transition: transform .2s ease;
}
.knob.annual{ transform: translateX(26px); }

/* PRICING */
.pricing{ padding: 56px 0; }
.price-card{
  border: 1px solid rgba(15,18,16,0.10);
  border-radius: 16px;
  box-shadow: 0 12px 30px rgba(15,18,16,0.06);
}
.price-card.highlight{
  border-color: rgba(196,106,42,0.55);
  box-shadow: 0 20px 60px rgba(196,106,42,0.14);
}
.badge.best{
  background: rgba(196,106,42,1);
  color: #fff;
  font-weight: 900;
  letter-spacing: .08em;
  text-transform: uppercase;
  border-radius: 999px;
  padding: 8px 12px;
  width: fit-content;
}

/* WHY PREMIUM */
.why-premium{ padding: 56px 0; background: #fff; border-top: 1px solid rgba(15,18,16,0.08); }
.why-icon{ color: var(--r-accent); }

/* TESTIMONIALS */
.testimonials{ padding: 56px 0; background: #fff; }
.blockquote{ font-size: 1rem; font-style: italic; }

/* CTA */
.cta{ padding: 64px 0 80px; border-top: 1px solid rgba(15,18,16,0.08); background:#fff; }

/* Brand button */
.btn-primary{
  --bs-btn-bg: var(--r-accent);
  --bs-btn-border-color: rgba(255,255,255,0.12);
  --bs-btn-hover-bg: #a85722;
  --bs-btn-hover-border-color: rgba(255,255,255,0.12);
}
</style>
