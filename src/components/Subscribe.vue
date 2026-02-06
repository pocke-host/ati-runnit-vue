<!-- src/pages/Subscribe.vue -->
<template>
  <main class="subscribe-page">
    <!-- HERO -->
    <section class="hero">
      <div class="container-xxl">
        <div class="row align-items-center g-4">
          <div class="col-12 col-lg-7">
            <h1 class="display-5 fw-bold mb-3">Go farther. Go faster. Go Premium.</h1>
            <p class="lead text-muted mb-4">
              Smarter training, advanced analysis, and a community that fuels your journey.
            </p>

            <!-- Live stat counter -->
            <p class="fw-semibold text-dark mb-4">
              <span class="stat">{{ liveWorkouts }}</span> workouts logged today 🚀
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
              <i class="bi bi-graph-up-arrow display-3 text-white"></i>
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
                <p class="text-muted">Track activities, give kudos, and join clubs.</p>
                <div class="display-6 fw-bold mb-3">$0</div>
                <ul class="list-unstyled small flex-grow-1">
                  <li class="mb-2"><i class="bi bi-check2-circle me-2 text-success"></i> Record & upload activities</li>
                  <li class="mb-2"><i class="bi bi-check2-circle me-2 text-success"></i> Basic stats & feed</li>
                  <li class="mb-2"><i class="bi bi-check2-circle me-2 text-success"></i> Clubs & kudos</li>
                </ul>
                <router-link to="/signup" class="btn btn-outline-dark w-100 mt-auto">Create Free Account</router-link>
              </div>
            </div>
          </div>

          <!-- Premium -->
          <div class="col-12 col-md-6 col-lg-4">
            <div class="card h-100 price-card highlight">
              <div class="card-body d-flex flex-column">
                <div class="badge best mb-2">Most Popular</div>
                <h3 class="h4 fw-bold mb-1">Premium</h3>
                <p class="text-muted">All features for training, routes, and analysis.</p>

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
                  <li class="mb-2"><i class="bi bi-map me-2 text-success"></i> Full route planner & heatmaps</li>
                  <li class="mb-2"><i class="bi bi-trophy me-2 text-success"></i> Segments & leaderboards</li>
                  <li class="mb-2"><i class="bi bi-bullseye me-2 text-success"></i> Training plans & goals</li>
                  <li class="mb-2"><i class="bi bi-activity me-2 text-success"></i> Advanced pace/power analysis</li>
                  <li class="mb-2"><i class="bi bi-shield-check me-2 text-success"></i> Beacon safety & live tracking</li>
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
                  <li class="mb-2"><i class="bi bi-star me-2 text-success"></i> All Premium features</li>
                  <li class="mb-2"><i class="bi bi-envelope-open me-2 text-success"></i> Easy invite & manage</li>
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
        <h2 class="fw-bold mb-4">Why athletes upgrade</h2>
        <div class="row g-4">
          <div class="col-6 col-md-3">
            <i class="bi bi-map display-5 text-danger"></i>
            <p class="fw-semibold mt-2">Smarter routes</p>
          </div>
          <div class="col-6 col-md-3">
            <i class="bi bi-trophy display-5 text-danger"></i>
            <p class="fw-semibold mt-2">Compete globally</p>
          </div>
          <div class="col-6 col-md-3">
            <i class="bi bi-activity display-5 text-danger"></i>
            <p class="fw-semibold mt-2">Deeper insights</p>
          </div>
          <div class="col-6 col-md-3">
            <i class="bi bi-shield-check display-5 text-danger"></i>
            <p class="fw-semibold mt-2">Stay safer</p>
          </div>
        </div>
      </div>
    </section>

    <!-- TESTIMONIALS -->
    <section class="testimonials">
      <div class="container-xxl text-center">
        <h2 class="fw-bold mb-4">Loved by athletes worldwide</h2>
        <div class="row g-4">
          <div class="col-md-4">
            <blockquote class="blockquote">
              <p>“Premium helped me crush my half marathon PR by 6 minutes.”</p>
              <footer class="blockquote-footer">Maya, Triathlete</footer>
            </blockquote>
          </div>
          <div class="col-md-4">
            <blockquote class="blockquote">
              <p>“The live tracking gave my family peace of mind on long rides.”</p>
              <footer class="blockquote-footer">Alex, Cyclist</footer>
            </blockquote>
          </div>
          <div class="col-md-4">
            <blockquote class="blockquote">
              <p>“Heatmaps are game-changing for discovering hidden trails.”</p>
              <footer class="blockquote-footer">Sam, Trail Runner</footer>
            </blockquote>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta">
      <div class="container-xxl text-center">
        <h2 class="fw-bold mb-2">Your best race starts here</h2>
        <p class="text-muted mb-4">Join today and unlock your potential.</p>
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
.subscribe-page { background: #fff; }

/* HERO */
.hero { background: #f7f5f2; padding: 64px 0; }
.hero-art {
  height: 340px; background: linear-gradient(135deg, #AA0505, #d33d3d);
  display: flex; align-items: center; justify-content: center;
}

/* Billing toggle */
.billing .label { font-weight: 600; }
.billing .label.muted { color: #6b7280; }
.toggle {
  position: relative; width: 56px; height: 28px; border-radius: 999px;
  border: 1px solid #e5e7eb; background: #fff; padding: 0; cursor: pointer;
}
.knob {
  position: absolute; top: 3px; left: 3px; width: 22px; height: 22px; border-radius: 50%;
  background: #AA0505; transition: transform .2s ease;
}
.knob.annual { transform: translateX(26px); }

/* PRICING */
.pricing { padding: 56px 0; }
.price-card { border: 1px solid #eee; border-radius: 12px; }
.price-card.highlight { border-color: #AA0505; box-shadow: 0 8px 24px rgba(252,76,2,.12); }
.badge.best { background: #AA0505; color: #fff; font-weight: 700; }

/* WHY PREMIUM */
.why-premium { padding: 56px 0; background: #fafafa; }

/* TESTIMONIALS */
.testimonials { padding: 56px 0; background: #fff; }
.blockquote { font-size: 1rem; font-style: italic; }

/* CTA */
.cta { padding: 64px 0 80px; border-top: 1px solid #eee; }

/* Brand button */
.btn-primary {
  --bs-btn-bg: #AA0505;
  --bs-btn-border-color: #AA0505;
  --bs-btn-hover-bg: #7a0202;
  --bs-btn-hover-border-color: #7a0202;
}
</style>
