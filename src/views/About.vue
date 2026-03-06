<template>
  <main class="about-page">

    <!-- HERO -->
    <section class="ep-hero">
      <div class="ep-hero-inner">
        <div class="ep-kicker">RUNNIT // ABOUT</div>
        <h1 class="ep-headline">Movement<br>with purpose.</h1>
        <p class="ep-sub">
          RUNNIT is built for the people who show up — even when motivation isn't loud.
          We turn daily training into a moment you can feel, track, and share.
        </p>
        <div class="ep-actions">
          <router-link to="/signup" class="ep-btn">Join RUNNIT</router-link>
          <router-link to="/features" class="ep-btn-ghost">Explore Features →</router-link>
        </div>
      </div>
    </section>

    <!-- MISSION -->
    <section class="ep-section">
      <div class="ep-content">
        <div class="about-split">
          <div class="about-split-text">
            <div class="section-label">Our Mission</div>
            <h2 class="about-h2">Make consistency easier than motivation.</h2>
            <p class="about-p">
              RUNNIT blends community, structure, and reflection so training becomes a habit
              you can sustain — and a story you're proud of.
            </p>
          </div>
          <div class="mission-list">
            <div class="mission-item" v-for="(point, i) in missionPoints" :key="i">
              <i class="bi bi-check2"></i>
              <span>{{ point }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- STATS -->
    <section class="stats-band">
      <div class="ep-content">
        <div class="stats-grid">
          <div class="stat-item" v-for="s in stats" :key="s.label">
            <div class="stat-value">{{ s.value }}</div>
            <div class="stat-label">{{ s.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- STORY + VALUES -->
    <section class="ep-section ep-section--gray">
      <div class="ep-content">
        <div class="about-split">
          <div>
            <div class="section-label">Our Story</div>
            <h2 class="about-h2">Progress built in quiet reps.</h2>
            <p class="about-p">
              RUNNIT started from one belief: progress is built in quiet reps — not highlight reels.
              We wanted a place where training feels meaningful, not noisy.
            </p>
            <p class="about-p">
              Whether you're chasing your first finish line or a new PR, RUNNIT is designed to help you
              keep the loop alive: show up, log the moment, and build momentum.
            </p>
          </div>
          <div>
            <div class="section-label">Our Values</div>
            <div class="values-list">
              <div class="value-row" v-for="(v, i) in values" :key="i">
                <div class="value-title">{{ v.title }}</div>
                <div class="value-body">{{ v.body }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- TEAM -->
    <section class="ep-section">
      <div class="ep-content">
        <div class="section-label">Team</div>
        <h2 class="about-h2">Meet the people behind it.</h2>
        <div class="team-grid">
          <div class="team-card">
            <div class="team-avatar">Q</div>
            <div class="team-name">Quinn</div>
            <div class="team-role">Founder & CEO</div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA BAND -->
    <section class="cta-band">
      <div class="ep-content">
        <div class="cta-grid">
          <div class="cta-card">
            <div class="cta-label">Press</div>
            <div class="cta-title">Media & press</div>
            <p class="cta-body">Media kit, logos, and story inquiries.</p>
            <router-link to="/press" class="cta-link">Press resources →</router-link>
          </div>
          <div class="cta-card">
            <div class="cta-label">Contact</div>
            <div class="cta-title">Get in touch</div>
            <p class="cta-body">We'd love to hear from you. Say hello.</p>
            <router-link to="/support" class="cta-link">Contact us →</router-link>
          </div>
          <div class="cta-card cta-card--dark">
            <div class="cta-label" style="color:rgba(255,255,255,0.40)">Careers</div>
            <div class="cta-title" style="color:#fff">Join the team</div>
            <p class="cta-body" style="color:rgba(255,255,255,0.60)">Small team. Big energy. Meaningful work.</p>
            <router-link to="/careers" class="cta-link" style="color:#fff">See open roles →</router-link>
          </div>
        </div>
      </div>
    </section>

  </main>
</template>

<script setup>
const missionPoints = [
  'Community-first motivation that makes training stick.',
  'Systems that help you build consistency without burnout.',
  'Privacy you control — your data, your rules.',
  'Device-friendly: bring Garmin, Apple Watch, COROS, and more.',
]

const stats = [
  { value: '100M+', label: 'Moments captured' },
  { value: '30B+',  label: 'Miles tracked' },
  { value: '190+',  label: 'Countries moving' },
  { value: '∞',     label: 'Reasons to show up' },
]

const values = [
  { title: 'Build the habit',     body: 'Consistency beats intensity you can't repeat.' },
  { title: 'Earned confidence',   body: 'Progress is proof — stack the days.' },
  { title: 'Better together',     body: 'Community makes hard things easier.' },
  { title: 'Trust always',        body: 'Clear controls and no surprises with your data.' },
]
</script>

<style scoped>
.about-page {
  background: #fff;
  font-family: Futura, "Futura PT", "Futura Std", "Avenir Next", Avenir,
    system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
  padding-top: var(--nav-h, 64px);
}

/* HERO */
.ep-hero {
  background: #000;
  color: #fff;
  padding: 88px 24px 80px;
}
.ep-hero-inner {
  max-width: 900px;
  margin: 0 auto;
}
.ep-kicker {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.40);
  margin-bottom: 28px;
}
.ep-headline {
  font-size: clamp(2.8rem, 8vw, 5.5rem);
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 1.02;
  margin: 0 0 28px;
}
.ep-sub {
  font-size: 1.1rem;
  color: rgba(255,255,255,0.65);
  line-height: 1.65;
  max-width: 520px;
  margin: 0 0 36px;
}
.ep-actions {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}
.ep-btn {
  background: #fff;
  color: #000;
  text-decoration: none;
  padding: 14px 28px;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  transition: opacity 0.15s;
}
.ep-btn:hover { opacity: 0.85; }
.ep-btn-ghost {
  color: rgba(255,255,255,0.72);
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  transition: color 0.15s;
}
.ep-btn-ghost:hover { color: #fff; }

/* SECTIONS */
.ep-section {
  padding: 72px 24px;
  background: #fff;
}
.ep-section--gray {
  background: #F7F7F7;
}
.ep-content {
  max-width: 900px;
  margin: 0 auto;
}

.section-label {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.20em;
  text-transform: uppercase;
  color: rgba(15,18,16,0.35);
  margin-bottom: 16px;
}
.about-h2 {
  font-size: clamp(1.5rem, 4vw, 2.2rem);
  font-weight: 900;
  letter-spacing: -0.02em;
  line-height: 1.15;
  margin: 0 0 20px;
}
.about-p {
  font-size: 0.97rem;
  color: rgba(15,18,16,0.62);
  line-height: 1.7;
  margin: 0 0 16px;
}
.about-p:last-child { margin-bottom: 0; }

/* SPLIT LAYOUT */
.about-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 56px;
  align-items: start;
}

/* MISSION CHECKLIST */
.mission-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 4px;
}
.mission-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 0.92rem;
  color: rgba(15,18,16,0.75);
  line-height: 1.5;
}
.mission-item .bi {
  font-size: 1rem;
  color: #000;
  flex-shrink: 0;
  margin-top: 1px;
}

/* STATS */
.stats-band {
  padding: 40px 24px;
  border-top: 1px solid #E5E5E5;
  border-bottom: 1px solid #E5E5E5;
  background: #fff;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
}
.stat-item {
  text-align: center;
  padding: 24px 16px;
  border-right: 1px solid #E5E5E5;
}
.stat-item:last-child { border-right: none; }
.stat-value {
  font-size: clamp(1.6rem, 4vw, 2.4rem);
  font-weight: 900;
  letter-spacing: -0.02em;
  color: #000;
  margin-bottom: 4px;
}
.stat-label {
  font-size: 0.78rem;
  color: rgba(15,18,16,0.45);
  letter-spacing: 0.04em;
}

/* VALUES */
.values-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}
.value-row {
  padding: 16px 0;
  border-bottom: 1px solid #E5E5E5;
}
.value-row:last-child { border-bottom: none; }
.value-title {
  font-size: 0.92rem;
  font-weight: 900;
  color: #000;
  margin-bottom: 4px;
}
.value-body {
  font-size: 0.83rem;
  color: rgba(15,18,16,0.55);
  line-height: 1.5;
}

/* TEAM */
.team-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background: #E5E5E5;
  border: 1px solid #E5E5E5;
  margin-top: 32px;
}
.team-card {
  background: #fff;
  padding: 24px 20px;
}
.team-avatar {
  width: 56px;
  height: 56px;
  background: #000;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  font-weight: 900;
  margin-bottom: 14px;
}
.team-name {
  font-size: 0.92rem;
  font-weight: 900;
  color: #000;
  margin-bottom: 2px;
}
.team-role {
  font-size: 0.78rem;
  color: rgba(15,18,16,0.45);
  letter-spacing: 0.04em;
}

/* CTA BAND */
.cta-band {
  padding: 72px 24px;
  background: #fff;
  border-top: 1px solid #E5E5E5;
}
.cta-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: #E5E5E5;
  border: 1px solid #E5E5E5;
}
.cta-card {
  background: #fff;
  padding: 32px 28px;
  display: flex;
  flex-direction: column;
}
.cta-card--dark {
  background: #000;
}
.cta-label {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(15,18,16,0.35);
  margin-bottom: 10px;
}
.cta-title {
  font-size: 1.1rem;
  font-weight: 900;
  color: #000;
  margin-bottom: 8px;
}
.cta-body {
  font-size: 0.85rem;
  color: rgba(15,18,16,0.55);
  line-height: 1.6;
  margin: 0 0 20px;
  flex: 1;
}
.cta-link {
  font-size: 0.80rem;
  font-weight: 700;
  color: #000;
  text-decoration: none;
  letter-spacing: 0.04em;
  transition: opacity 0.15s;
}
.cta-link:hover { opacity: 0.65; }

/* RESPONSIVE */
@media (max-width: 768px) {
  .about-split { grid-template-columns: 1fr; gap: 40px; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .stat-item:nth-child(2) { border-right: none; }
  .stat-item:nth-child(3) { border-right: 1px solid #E5E5E5; }
  .stat-item:nth-child(4) { border-right: none; }
  .team-grid { grid-template-columns: repeat(2, 1fr); }
  .cta-grid { grid-template-columns: 1fr; }
}

@media (max-width: 480px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .team-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
