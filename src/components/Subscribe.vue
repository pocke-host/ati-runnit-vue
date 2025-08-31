<!-- src/pages/Subscribe.vue -->
<template>
    <main class="subscribe-page">
      <!-- HERO -->
      <section class="hero">
        <div class="container-xxl">
          <div class="row align-items-center g-4">
            <div class="col-12 col-lg-7">
              <h1 class="display-5 fw-bold mb-3">Subscribe to unlock everything</h1>
              <p class="lead text-muted mb-4">
                Advanced training, routes, segment leaderboards, and more. Try it free—cancel anytime.
              </p>
  
              <!-- Billing toggle -->
              <div class="billing d-inline-flex align-items-center gap-3">
                <span :class="['label', {muted: billing !== 'monthly'}]">Monthly</span>
                <button class="toggle" @click="toggleBilling" :aria-pressed="billing==='annual'">
                  <span :class="['knob', billing]"></span>
                </button>
                <span :class="['label', {muted: billing !== 'annual'}]">Annual <small class="save">Save {{savePct}}%</small></span>
              </div>
            </div>
            <div class="col-12 col-lg-5">
              <div class="hero-art rounded-4"></div>
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
                  <p class="small text-muted mb-3" v-if="billing==='annual'">
                    Billed annually at {{ annualTotal }} total
                  </p>
  
                  <ul class="list-unstyled small flex-grow-1">
                    <li class="mb-2"><i class="bi bi-check2-circle me-2 text-success"></i> Full route planner & heatmaps</li>
                    <li class="mb-2"><i class="bi bi-check2-circle me-2 text-success"></i> Segments & leaderboards</li>
                    <li class="mb-2"><i class="bi bi-check2-circle me-2 text-success"></i> Training plans & goals</li>
                    <li class="mb-2"><i class="bi bi-check2-circle me-2 text-success"></i> Advanced pace/power analysis</li>
                    <li class="mb-2"><i class="bi bi-check2-circle me-2 text-success"></i> Beacon safety & live tracking</li>
                  </ul>
  
                  <router-link to="/signup" class="btn btn-primary w-100 mt-auto">
                    Start Free Trial
                  </router-link>
                </div>
              </div>
            </div>
  
            <!-- Family / Duo (optional alt) -->
            <div class="col-12 col-md-6 col-lg-4">
              <div class="card h-100 price-card">
                <div class="card-body d-flex flex-column">
                  <h3 class="h4 fw-bold mb-2">Duo</h3>
                  <p class="text-muted">Two Premium accounts under one plan.</p>
                  <div class="display-6 fw-bold mb-3">
                    {{ billing === 'monthly' ? duoMonthly : duoAnnual }}
                  </div>
                  <ul class="list-unstyled small flex-grow-1">
                    <li class="mb-2"><i class="bi bi-check2-circle me-2 text-success"></i> Two Premium seats</li>
                    <li class="mb-2"><i class="bi bi-check2-circle me-2 text-success"></i> All Premium features</li>
                    <li class="mb-2"><i class="bi bi-check2-circle me-2 text-success"></i> Easy invite & manage</li>
                  </ul>
                  <router-link to="/signup" class="btn btn-outline-dark w-100 mt-auto">
                    Choose Duo
                  </router-link>
                </div>
              </div>
            </div>
          </div>
  
          <!-- small legal -->
          <p class="small text-muted mt-3 mb-0">
            Prices shown are examples. Taxes may apply. Cancel anytime during the trial.
          </p>
        </div>
      </section>
  
      <!-- FEATURE COMPARISON -->
      <section class="compare">
        <div class="container-xxl">
          <h2 class="fw-bold text-center mb-4">Compare plans</h2>
          <div class="table-responsive">
            <table class="table align-middle">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Free</th>
                  <th>Premium</th>
                </tr>
              </thead>
              <tbody class="small">
                <tr>
                  <td>Record & upload activities</td>
                  <td><i class="bi bi-check2 text-success"></i></td>
                  <td><i class="bi bi-check2 text-success"></i></td>
                </tr>
                <tr>
                  <td>Route planner & heatmaps</td>
                  <td><i class="bi bi-x text-muted"></i></td>
                  <td><i class="bi bi-check2 text-success"></i></td>
                </tr>
                <tr>
                  <td>Segments & leaderboards</td>
                  <td><i class="bi bi-x text-muted"></i></td>
                  <td><i class="bi bi-check2 text-success"></i></td>
                </tr>
                <tr>
                  <td>Advanced analysis</td>
                  <td><i class="bi bi-x text-muted"></i></td>
                  <td><i class="bi bi-check2 text-success"></i></td>
                </tr>
                <tr>
                  <td>Beacon live tracking</td>
                  <td><i class="bi bi-x text-muted"></i></td>
                  <td><i class="bi bi-check2 text-success"></i></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
  
      <!-- CTA -->
      <section class="cta">
        <div class="container-xxl text-center">
          <h2 class="fw-bold mb-2">Ready to go Premium?</h2>
          <p class="text-muted mb-4">Join free today and start your trial.</p>
          <router-link to="/signup" class="btn btn-primary btn-lg">Start Free Trial</router-link>
        </div>
      </section>
    </main>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  
  const billing = ref('annual') // 'monthly' | 'annual'
  const toggleBilling = () => (billing.value = billing.value === 'annual' ? 'monthly' : 'annual')
  
  // Example prices (replace with your real values)
  const priceMonthly = '$11.99'
  const priceAnnual = '$7.99'
  const annualTotal = '$95.88'
  const duoMonthly = '$19.99'
  const duoAnnual = '$15.99'
  const savePct = computed(() => 33) // example savings %
  </script>
  
  <style scoped>
  /* Page baseline */
  .subscribe-page {
    min-height: 100vh;
    width: 100%;
    background: #fff;
    overflow-x: hidden;
  }
  
  /* HERO (fills between fixed nav/footer) */
  .hero {
    --nav-h: 72px;   /* adjust to your fixed top nav height */
    --footer-h: 40px;/* adjust to your fixed footer height */
    min-height: calc(100vh - var(--nav-h) - var(--footer-h));
    display: flex;
    align-items: center;
    background: #f7f5f2;
    padding: 64px 0;
  }
  .hero-art {
    height: 340px;
    border-radius: 16px;
    background: linear-gradient(135deg, #d7dadf, #aeb4bd);
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
  .price .display-6 { line-height: 1; }
  
  /* COMPARE */
  .compare { padding: 56px 0; background: #fff; }
  .table thead th { border-bottom: 1px solid #e5e7eb; }
  .table td, .table th { border-color: #eee; }
  
  /* CTA */
  .cta { padding: 64px 0 80px; background: #fff; border-top: 1px solid #eee; }
  
  /* Strava-ish orange button */
  .btn-primary {
    --bs-btn-bg: #AA0505;
    --bs-btn-border-color: #AA0505;
    --bs-btn-hover-bg: #6a006a;
    --bs-btn-hover-border-color: #6a006a;
  }
  </style>
  