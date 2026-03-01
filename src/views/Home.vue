<template>
  <main class="home-page">
    <!-- HERO: Simple & Clear Value Prop -->
    <section class="hero">
      <div class="container-xxl">
        <div class="row align-items-center g-5">
          <div class="col-12 col-lg-6">
            <h1 class="display-3 fw-bold mb-4">
              Your fitness,<br>simplified.
            </h1>
            <p class="lead mb-4">
              Track every workout. Get AI-powered training plans. Share your journey. 
              All in one beautifully simple app.
            </p>
            <div class="d-flex flex-wrap gap-3 mb-4">
              <router-link to="/join-us" class="btn btn-primary btn-lg px-5">
                Get Started Free
              </router-link>
            </div>
            <p class="small text-muted mb-0">
              <i class="bi bi-check-circle-fill text-success me-2"></i>No credit card required
              <i class="bi bi-check-circle-fill text-success ms-3 me-2"></i>Free forever
            </p>
          </div>
          
          <div class="col-12 col-lg-6">
            <div class="hero-visual">
              <div class="phone-mockup">
                <div class="phone-screen">
                  <!-- Activity Summary -->
                  <div class="demo-card activity-card">
                    <div class="stat-row">
                      <div class="stat">
                        <div class="stat-value">5.2</div>
                        <div class="stat-label">miles</div>
                      </div>
                      <div class="stat">
                        <div class="stat-value">34:12</div>
                        <div class="stat-label">time</div>
                      </div>
                      <div class="stat">
                        <div class="stat-value">156</div>
                        <div class="stat-label">bpm</div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Route Preview -->
                  <div class="demo-card route-card">
                    <div class="route-preview"></div>
                  </div>
                </div>
              </div>
              
              <!-- Floating Feature Pills -->
              <div class="floating-pill pill-1">
                <i class="bi bi-lightning-charge-fill"></i> AI Plans
              </div>
              <div class="floating-pill pill-2">
                <i class="bi bi-people-fill"></i> Clubs
              </div>
              <div class="floating-pill pill-3">
                <i class="bi bi-camera-fill"></i> Stories
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FEATURES: 3-Column Grid (Full Vision) -->
    <section class="features">
      <div class="container-xxl">
        <div class="text-center mb-5">
          <h2 class="h1 fw-bold mb-3">Everything you need</h2>
          <p class="lead text-muted">No bloat. Just the tools that actually matter.</p>
        </div>

        <div class="row g-4">
          <!-- AI Training Plans -->
          <div class="col-12 col-md-6 col-lg-4">
            <div class="feature-card">
              <div class="feature-icon">
                <i class="bi bi-robot"></i>
              </div>
              <h3 class="h4 fw-bold mb-2">AI Training Plans</h3>
              <p class="text-muted mb-0">
                Get a personalized plan that adapts to your schedule, fitness level, and goals. 
                5K to marathon—all auto-adjusted.
              </p>
            </div>
          </div>

          <!-- Activity Tracking -->
          <div class="col-12 col-md-6 col-lg-4">
            <div class="feature-card">
              <div class="feature-icon">
                <i class="bi bi-activity"></i>
              </div>
              <h3 class="h4 fw-bold mb-2">Smart Activity Logs</h3>
              <p class="text-muted mb-0">
                Sync from Garmin, Strava, Apple Watch—or log manually. See stats, routes, 
                and progress all in one place.
              </p>
            </div>
          </div>

          <!-- Daily Stories -->
          <div class="col-12 col-md-6 col-lg-4">
            <div class="feature-card">
              <div class="feature-icon">
                <i class="bi bi-camera-reels-fill"></i>
              </div>
              <h3 class="h4 fw-bold mb-2">Daily Stories</h3>
              <p class="text-muted mb-0">
                Share your run with a photo and song. One story per day. 
                See what your friends are up to—no scrolling spam.
              </p>
            </div>
          </div>

          <!-- Clubs & Community -->
          <div class="col-12 col-md-6 col-lg-4">
            <div class="feature-card">
              <div class="feature-icon">
                <i class="bi bi-people-fill"></i>
              </div>
              <h3 class="h4 fw-bold mb-2">Clubs</h3>
              <p class="text-muted mb-0">
                Join clubs by location or interest. Weekly leaderboards, group challenges, 
                and a feed of your crew's activities.
              </p>
            </div>
          </div>

          <!-- Challenges -->
          <div class="col-12 col-md-6 col-lg-4">
            <div class="feature-card">
              <div class="feature-icon">
                <i class="bi bi-trophy-fill"></i>
              </div>
              <h3 class="h4 fw-bold mb-2">Challenges</h3>
              <p class="text-muted mb-0">
                Monthly distance goals, streak challenges, and club competitions. 
                Stay motivated with real-time progress tracking.
              </p>
            </div>
          </div>

          <!-- Privacy First -->
          <div class="col-12 col-md-6 col-lg-4">
            <div class="feature-card">
              <div class="feature-icon">
                <i class="bi bi-shield-lock-fill"></i>
              </div>
              <h3 class="h4 fw-bold mb-2">Privacy Controls</h3>
              <p class="text-muted mb-0">
                Your data, your rules. Hide routes, go private, or share with close friends only. 
                No ads, no creepy tracking.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- HOW IT WORKS: 3 Simple Steps -->
    <section class="how-it-works">
      <div class="container-xxl">
        <div class="text-center mb-5">
          <h2 class="h1 fw-bold mb-3">Get started in 60 seconds</h2>
        </div>

        <div class="row g-4 justify-content-center">
          <div class="col-12 col-md-4">
            <div class="step-card">
              <div class="step-number">1</div>
              <h3 class="h5 fw-bold mb-2">Sign up free</h3>
              <p class="text-muted small mb-0">
                Create your account. No credit card, no trial limits.
              </p>
            </div>
          </div>

          <div class="col-12 col-md-4">
            <div class="step-card">
              <div class="step-number">2</div>
              <h3 class="h5 fw-bold mb-2">Connect your device</h3>
              <p class="text-muted small mb-0">
                Link Garmin, Strava, or Apple Watch—or log manually.
              </p>
            </div>
          </div>

          <div class="col-12 col-md-4">
            <div class="step-card">
              <div class="step-number">3</div>
              <h3 class="h5 fw-bold mb-2">Start training</h3>
              <p class="text-muted small mb-0">
                Pick a goal, get your AI plan, and hit the ground running.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- INTEGRATIONS: Device Trust Bar -->
    <section class="integrations">
      <div class="container-xxl">
        <div class="text-center mb-4">
          <p class="text-muted mb-3">Works with</p>
          <div class="d-flex flex-wrap justify-content-center gap-3">
            <div class="integration-pill">
              <i class="bi bi-smartwatch"></i> Garmin
            </div>
            <div class="integration-pill">
              <i class="bi bi-apple"></i> Apple Watch
            </div>
            <div class="integration-pill">
              <i class="bi bi-activity"></i> Strava
            </div>
            <div class="integration-pill">
              <i class="bi bi-music-note-beamed"></i> Spotify
            </div>
            <div class="integration-pill">
              <i class="bi bi-heart-pulse"></i> COROS
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FINAL CTA -->
    <section class="final-cta">
      <div class="container-xxl text-center">
        <h2 class="display-5 fw-bold mb-3">
          Ready to simplify your training?
        </h2>
        <p class="lead text-muted mb-4">
          Join thousands of runners who track, train, and connect on RUNNIT.
        </p>
        <router-link to="/join-us" class="btn btn-primary btn-lg px-5">
          Start Free Today
        </router-link>
        <p class="small text-muted mt-3">
          Free forever. No credit card. Cancel anytime.
        </p>
      </div>
    </section>
  </main>
</template>

<script setup>
// No data needed - all static content
</script>

<style scoped>
/* ===== Design Tokens ===== */
.home-page {
  --r-olive: #5A6B4E;
  --r-olive-deep: #2C3726;
  --r-accent: #C46A2A;
  --r-offwhite: #F5F6F3;
  --r-white: #FFFFFF;

  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  background: var(--r-white);
  color: #1a1a1a;
  padding-top: var(--nav-h, 64px);
}

/* ===== HERO ===== */
.hero {
  background: linear-gradient(180deg, var(--r-offwhite) 0%, var(--r-white) 100%);
  padding: 100px 0 80px;
  min-height: 85vh;
  display: flex;
  align-items: center;
}

.hero h1 {
  color: var(--r-olive-deep);
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.hero .lead {
  color: #525252;
  font-size: 1.25rem;
  font-weight: 400;
  line-height: 1.6;
}

.btn-primary {
  background: var(--r-accent);
  border: none;
  border-radius: 12px;
  font-weight: 600;
  letter-spacing: -0.01em;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(196, 106, 42, 0.2);
}

.btn-primary:hover {
  background: #a85722;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(196, 106, 42, 0.3);
}

/* ===== HERO VISUAL ===== */
.hero-visual {
  position: relative;
  height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.phone-mockup {
  width: 280px;
  height: 580px;
  border-radius: 40px;
  background: linear-gradient(135deg, var(--r-olive) 0%, var(--r-olive-deep) 100%);
  box-shadow: 0 30px 80px rgba(15, 18, 16, 0.3);
  padding: 12px;
  position: relative;
}

.phone-screen {
  background: #FAFAFA;
  border-radius: 28px;
  height: 100%;
  padding: 20px 16px;
  overflow: hidden;
}

/* Activity Card */
.demo-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 12px;
}

.activity-card {
  padding: 20px;
}

.stat-row {
  display: flex;
  justify-content: space-around;
}

.stat {
  text-align: center;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--r-olive-deep);
  line-height: 1;
}

.stat-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #999;
  margin-top: 4px;
}

/* Route Card */
.route-card {
  padding: 12px;
  height: 140px;
}

.route-preview {
  width: 100%;
  height: 100%;
  border-radius: 12px;
  background: 
    linear-gradient(135deg, rgba(90, 107, 78, 0.3) 0%, rgba(196, 106, 42, 0.2) 100%),
    repeating-linear-gradient(
      0deg,
      rgba(90, 107, 78, 0.1) 0px,
      transparent 1px,
      transparent 10px
    ),
    repeating-linear-gradient(
      90deg,
      rgba(90, 107, 78, 0.1) 0px,
      transparent 1px,
      transparent 10px
    );
}

/* Floating Pills */
.floating-pill {
  position: absolute;
  background: white;
  border-radius: 20px;
  padding: 10px 18px;
  font-size: 14px;
  font-weight: 600;
  color: var(--r-olive-deep);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  display: flex;
  align-items: center;
  gap: 6px;
  animation: float 3s ease-in-out infinite;
}

.pill-1 {
  top: 10%;
  left: -40px;
  animation-delay: 0s;
}

.pill-2 {
  top: 50%;
  right: -30px;
  animation-delay: 1s;
}

.pill-3 {
  bottom: 15%;
  left: -30px;
  animation-delay: 2s;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* ===== FEATURES SECTION ===== */
.features {
  padding: 100px 0;
  background: white;
}

.feature-card {
  padding: 32px 24px;
  border-radius: 16px;
  border: 1px solid #E5E5E5;
  height: 100%;
  transition: all 0.3s ease;
}

.feature-card:hover {
  border-color: var(--r-olive);
  box-shadow: 0 8px 24px rgba(90, 107, 78, 0.1);
  transform: translateY(-4px);
}

.feature-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: linear-gradient(135deg, var(--r-olive) 0%, var(--r-olive-deep) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  font-size: 24px;
  color: white;
}

/* ===== HOW IT WORKS ===== */
.how-it-works {
  padding: 80px 0;
  background: var(--r-offwhite);
}

.step-card {
  text-align: center;
  padding: 32px 20px;
}

.step-number {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--r-accent);
  color: white;
  font-size: 24px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

/* ===== INTEGRATIONS ===== */
.integrations {
  padding: 60px 0;
  background: white;
  border-top: 1px solid #E5E5E5;
  border-bottom: 1px solid #E5E5E5;
}

.integration-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 12px;
  background: #F5F5F5;
  font-weight: 600;
  color: var(--r-olive-deep);
  font-size: 14px;
}

/* ===== FINAL CTA ===== */
.final-cta {
  padding: 100px 0;
  background: linear-gradient(135deg, var(--r-olive) 0%, var(--r-olive-deep) 100%);
  color: white;
}

.final-cta h2 {
  color: white;
}

.final-cta .lead {
  color: rgba(255, 255, 255, 0.9);
}

/* ===== RESPONSIVE ===== */
@media (max-width: 991px) {
  .hero {
    padding: 60px 0;
    min-height: auto;
  }
  .hero-visual { height: 400px; }
  .phone-mockup { transform: scale(0.85); }
  .floating-pill { display: none; }
}

@media (max-width: 768px) {
  .hero {
    padding: 40px 0 36px;
    text-align: center;
  }
  .hero h1 {
    font-size: 2.2rem;
  }
  .hero .lead {
    font-size: 1.05rem;
  }
  .hero .d-flex {
    justify-content: center;
  }
  .hero-visual {
    height: 300px;
    margin-top: 12px;
  }
  .phone-mockup {
    width: 200px;
    height: 420px;
    transform: none;
  }
  .features { padding: 60px 0; }
  .how-it-works { padding: 52px 0; }
  .integrations { padding: 40px 0; }
  .final-cta { padding: 60px 0; }
  .final-cta h2 { font-size: 1.8rem; }
}

@media (max-width: 480px) {
  .hero { padding: 28px 0 24px; }
  .hero h1 { font-size: 1.85rem; }
  .hero-visual { display: none; }
  .feature-card { padding: 24px 18px; }
  .step-card { padding: 24px 12px; }
  .integration-pill { padding: 10px 14px; font-size: 13px; }
  .final-cta { padding: 48px 0; }
  .final-cta h2 { font-size: 1.5rem; }
  .final-cta .lead { font-size: 1rem; }
}
</style>