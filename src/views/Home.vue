<template>
  <main class="home-page">

    <!-- ── HERO ── -->
    <section class="hero">
      <div class="hero-inner container-xxl">
        <p class="hero-overline">Movement, redefined</p>
        <h1 class="hero-headline">
          Move further.<br>
          Train smarter.<br>
          Go together.
        </h1>
        <div class="hero-actions">
          <router-link to="/signup" class="btn-cta">Join for free</router-link>
          <router-link to="/join-us" class="btn-cta-ghost">Sign in</router-link>
        </div>
        <p class="hero-fine">Free forever · No credit card · Cancel anytime</p>
      </div>
    </section>

    <!-- ── MANIFESTO STRIP ── -->
    <section class="manifesto">
      <div class="container-xxl">
        <p class="manifesto-text">
          Most apps track what you did.<br>
          RUNNIT helps you figure out what's next.
        </p>
      </div>
    </section>

    <!-- ── PILLARS ── -->
    <section class="pillars">
      <div class="container-xxl">
        <div class="pillars-grid">
          <div class="pillar">
            <div class="pillar-num">01</div>
            <div class="pillar-body">
              <h3 class="pillar-title">Track</h3>
              <p class="pillar-desc">Log every run, ride, swim, or hike. GPS routes, splits, heart rate — all in one place. Syncs with Garmin, Apple Watch and Coros.</p>
            </div>
          </div>
          <div class="pillar-divider"></div>
          <div class="pillar">
            <div class="pillar-num">02</div>
            <div class="pillar-body">
              <h3 class="pillar-title">Train</h3>
              <p class="pillar-desc">AI-powered plans built around your goals and schedule — not the other way around. 5K to ultra. Beginner to elite. Every plan adapts as you do.</p>
            </div>
          </div>
          <div class="pillar-divider"></div>
          <div class="pillar">
            <div class="pillar-num">03</div>
            <div class="pillar-body">
              <h3 class="pillar-title">Connect</h3>
              <p class="pillar-desc">Join clubs, enter challenges, follow athletes you admire. Share a daily moment — one photo, one song. Community without the noise.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── STATEMENT ── -->
    <section class="statement">
      <div class="container-xxl">
        <div class="statement-inner">
          <blockquote class="statement-quote">
            "Every distance has a story.<br>
            Yours deserves to be told."
          </blockquote>
          <router-link to="/signup" class="btn-cta">Start your story</router-link>
        </div>
      </div>
    </section>

    <!-- ── CAPABILITIES ── -->
    <section class="capabilities">
      <div class="container-xxl">
        <div class="cap-header">
          <p class="section-overline">What's inside</p>
          <h2 class="cap-title">Built different</h2>
        </div>
        <div class="cap-list">
          <div class="cap-item">
            <span class="cap-icon"><i class="bi bi-robot"></i></span>
            <div class="cap-content">
              <div class="cap-name">AI and Coach Training Plans</div>
              <div class="cap-desc">Adapts to your fitness, schedule, and fatigue — not a generic template.</div>
            </div>
          </div>
          <div class="cap-item">
            <span class="cap-icon"><i class="bi bi-activity"></i></span>
            <div class="cap-content">
              <div class="cap-name">Live Activity Tracker</div>
              <div class="cap-desc">GPS tracking with real-time pace, heart rate, route mapping and personal safety.</div>
            </div>
          </div>
          <div class="cap-item">
            <span class="cap-icon"><i class="bi bi-camera-reels-fill"></i></span>
            <div class="cap-content">
              <div class="cap-name">Daily Moments</div>
              <div class="cap-desc">One photo, one song. Share your workout or thoughts.</div>
            </div>
          </div>
          <div class="cap-item">
            <span class="cap-icon"><i class="bi bi-people-fill"></i></span>
            <div class="cap-content">
              <div class="cap-name">Clubs & Challenges</div>
              <div class="cap-desc">Find your crew. Weekly meet-ups, group goals, and group chat.</div>
            </div>
          </div>
          <div class="cap-item">
            <span class="cap-icon"><i class="bi bi-trophy-fill"></i></span>
            <div class="cap-content">
              <div class="cap-name">Personal Records</div>
              <div class="cap-desc">PRs automatically detected across all distances.</div>
            </div>
          </div>
          <div class="cap-item">
            <span class="cap-icon"><i class="bi bi-smartwatch"></i></span>
            <div class="cap-content">
              <div class="cap-name">Device Compability</div>
              <div class="cap-desc">Connects with Garmin, Apple Watch, and COROS seamlessly.</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── FINAL CTA ── -->
    <section class="final-cta">
      <div class="container-xxl text-center">
        <p class="section-overline" style="color:rgba(255,255,255,0.45)">Get started</p>
        <h2 class="cta-title">Your next session<br>starts here.</h2>
        <router-link to="/signup" class="btn-cta btn-cta-light">
          Join RUNNIT — Free
        </router-link>
        <p class="cta-fine">Free to use. No credit card needed.</p>
      </div>
    </section>

  </main>
</template>

<script setup>
// Static content — no data needed
</script>

<style scoped>
.home-page {
  background: #fff;
  color: #000;
  padding-top: var(--nav-h, 64px);
}

/* ── HERO ── */
.hero {
  padding: 140px 0 120px;
  background: #fff;
  border-bottom: 1px solid #E5E5E5;
}

.hero-inner { }

.hero-overline {
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.20em;
  text-transform: uppercase;
  color: #767676;
  margin-bottom: 28px;
}

.hero-headline {
  font-size: clamp(4.5rem, 11vw, 8rem);
  font-weight: 900;
  letter-spacing: -0.05em;
  line-height: 0.95;
  color: #000;
  margin-bottom: 52px;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.hero-fine {
  font-size: 0.72rem;
  font-weight: 400;
  color: #767676;
  letter-spacing: 0.04em;
  margin-bottom: 0;
}

/* CTAs */
.btn-cta {
  display: inline-flex;
  align-items: center;
  padding: 16px 48px;
  border-radius: 0;
  background: #000;
  color: #fff;
  font-weight: 600;
  font-size: 0.78rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  text-decoration: none;
  transition: background 0.15s;
  border: 2px solid #000;
  cursor: pointer;
}
.btn-cta:hover {
  background: #333;
  border-color: #333;
  color: #fff;
  text-decoration: none;
}

.btn-cta-ghost {
  display: inline-flex;
  align-items: center;
  padding: 16px 48px;
  border-radius: 0;
  background: transparent;
  color: #000;
  font-weight: 600;
  font-size: 0.78rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  text-decoration: none;
  transition: background 0.15s;
  border: 2px solid #000;
  cursor: pointer;
}
.btn-cta-ghost:hover {
  background: #000;
  color: #fff;
  text-decoration: none;
}

.btn-cta-light {
  background: #fff;
  color: #000;
  border: 2px solid #fff;
}
.btn-cta-light:hover {
  background: #e5e5e5;
  border-color: #e5e5e5;
  color: #000;
}

/* ── MANIFESTO STRIP ── */
.manifesto {
  background: #000;
  padding: 80px 0;
  border-bottom: 1px solid #111;
}

.manifesto-text {
  font-size: clamp(1.4rem, 3.5vw, 2.4rem);
  font-weight: 300;
  color: #fff;
  letter-spacing: -0.02em;
  line-height: 1.45;
  margin: 0;
  max-width: 700px;
}

/* ── PILLARS ── */
.pillars {
  padding: 0;
  background: #fff;
  border-bottom: 1px solid #E5E5E5;
}

.pillars-grid {
  display: flex;
  align-items: stretch;
}

.pillar {
  flex: 1;
  padding: 72px 48px;
  display: flex;
  gap: 24px;
}

.pillar-divider {
  width: 1px;
  background: #E5E5E5;
  flex-shrink: 0;
}

.pillar-num {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: #C5C5C5;
  margin-top: 4px;
  flex-shrink: 0;
}

.pillar-body { flex: 1; }

.pillar-title {
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #000;
  margin-bottom: 12px;
}

.pillar-desc {
  font-size: 0.88rem;
  font-weight: 300;
  color: #767676;
  line-height: 1.7;
  margin: 0;
}

/* ── STATEMENT ── */
.statement {
  background: #fff;
  border-bottom: 1px solid #E5E5E5;
  padding: 100px 0;
}

.statement-inner {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 48px;
}

.statement-quote {
  font-size: clamp(2rem, 4.5vw, 3.5rem);
  font-weight: 900;
  letter-spacing: -0.04em;
  line-height: 1.1;
  color: #000;
  margin: 0;
  border: none;
  padding: 0;
  font-style: normal;
  max-width: 700px;
}

/* ── CAPABILITIES ── */
.capabilities {
  padding: 100px 0;
  background: #fff;
  border-bottom: 1px solid #E5E5E5;
}

.cap-header {
  margin-bottom: 56px;
}

.section-overline {
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.20em;
  text-transform: uppercase;
  color: #767676;
  margin-bottom: 12px;
}

.cap-title {
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 900;
  letter-spacing: -0.04em;
  line-height: 1.05;
  color: #000;
  margin: 0;
}

.cap-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border-top: 1px solid #E5E5E5;
}

.cap-item {
  display: flex;
  gap: 20px;
  padding: 36px 32px;
  border-bottom: 1px solid #E5E5E5;
  border-right: 1px solid #E5E5E5;
}
.cap-item:nth-child(3n) { border-right: none; }

.cap-icon {
  font-size: 1.1rem;
  color: #000;
  flex-shrink: 0;
  margin-top: 2px;
}

.cap-name {
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #000;
  margin-bottom: 8px;
}

.cap-desc {
  font-size: 0.83rem;
  font-weight: 300;
  color: #767676;
  line-height: 1.65;
  margin: 0;
}

/* ── FINAL CTA ── */
.final-cta {
  padding: 140px 0;
  background: #000;
  color: white;
}

.cta-title {
  font-size: clamp(3rem, 7vw, 5.5rem);
  font-weight: 900;
  letter-spacing: -0.05em;
  line-height: 0.95;
  color: white;
  margin-bottom: 48px;
}

.cta-fine {
  font-size: 0.72rem;
  font-weight: 400;
  color: rgba(255,255,255,0.35);
  margin-top: 20px;
  margin-bottom: 0;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

/* ── RESPONSIVE ── */
@media (max-width: 991px) {
  .hero { padding: 100px 0 80px; }
  .pillars-grid { flex-direction: column; }
  .pillar { padding: 48px 32px; }
  .pillar-divider { width: 100%; height: 1px; }
  .statement-inner { flex-direction: column; align-items: flex-start; }
  .cap-list { grid-template-columns: repeat(2, 1fr); }
  .cap-item:nth-child(3n) { border-right: 1px solid #E5E5E5; }
  .cap-item:nth-child(2n) { border-right: none; }
}

@media (max-width: 768px) {
  .hero { padding: 72px 0 56px; }
  .hero-headline { font-size: 3.5rem; margin-bottom: 36px; }
  .manifesto { padding: 56px 0; }
  .pillar { padding: 36px 24px; flex-direction: column; gap: 12px; }
  .statement { padding: 72px 0; }
  .statement-quote { font-size: 2rem; }
  .capabilities { padding: 64px 0; }
  .cap-list { grid-template-columns: 1fr; }
  .cap-item { border-right: none !important; }
  .final-cta { padding: 80px 0; }
  .cta-title { font-size: 3rem; }
}

@media (max-width: 480px) {
  .hero { padding: 56px 0 40px; }
  .hero-headline { font-size: 2.6rem; }
  .hero-actions { flex-direction: column; align-items: flex-start; }
  .btn-cta, .btn-cta-ghost { padding: 14px 32px; width: 100%; justify-content: center; }
  .manifesto-text { font-size: 1.2rem; }
  .final-cta { padding: 64px 0; }
  .cta-title { font-size: 2.4rem; }
}
</style>
