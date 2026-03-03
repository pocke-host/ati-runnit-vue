<template>
  <main class="editorial-page">
    <section class="ep-hero">
      <div class="ep-hero-inner">
        <div class="ep-kicker">RUNNIT // CAREERS</div>
        <h1 class="ep-headline">Build the Future<br>of Movement.</h1>
        <p class="ep-sub">We're a small team obsessed with helping athletes move better. If you care about craft, performance, and community — we want to hear from you.</p>
      </div>
    </section>

    <section class="ep-section">
      <div class="ep-content">
        <h2 class="ep-section-title">Open Roles</h2>
        <div class="role-list">
          <div class="role-card" v-for="role in roles" :key="role.title">
            <div class="role-top">
              <div>
                <div class="role-title">{{ role.title }}</div>
                <div class="role-meta">{{ role.dept }} · {{ role.type }} · {{ role.location }}</div>
              </div>
              <a href="mailto:careers@runnit.co" class="btn-apply">Apply</a>
            </div>
            <p class="role-desc">{{ role.desc }}</p>
          </div>
        </div>

        <div class="open-app">
          <h3>Don't see your role?</h3>
          <p>We always want to meet exceptional people. Send your resume and a note to <a href="mailto:careers@runnit.co">careers@runnit.co</a>.</p>
        </div>
      </div>
    </section>

    <section class="ep-section ep-section-dark">
      <div class="ep-content ep-values">
        <h2 class="ep-section-title ep-section-title-light">Why Runnit</h2>
        <div class="values-grid">
          <div class="value-item" v-for="v in values" :key="v.title">
            <div class="value-title">{{ v.title }}</div>
            <p class="value-desc">{{ v.desc }}</p>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
const roles = [
  {
    title: 'Senior iOS Engineer',
    dept: 'Engineering',
    type: 'Full-time',
    location: 'Remote (US)',
    desc: 'Own the iOS app from GPS tracking to social features. We use Swift, SwiftUI, and MapboxMaps SDK. You\'ll work directly with the founders and ship fast.'
  },
  {
    title: 'Backend Engineer — Java/Spring',
    dept: 'Engineering',
    type: 'Full-time',
    location: 'Remote (US / Europe)',
    desc: 'Build and scale our Spring Boot API: activity ingestion, training load algorithms, real-time features. Strong Java fundamentals required.'
  },
  {
    title: 'Product Designer',
    dept: 'Design',
    type: 'Full-time',
    location: 'Remote',
    desc: 'Shape every surface of the Runnit experience — from onboarding to activity detail. We care deeply about typography, motion, and athlete-first UX.'
  },
  {
    title: 'Community & Growth Lead',
    dept: 'Growth',
    type: 'Full-time',
    location: 'Remote',
    desc: 'Grow and nurture our athlete community. Run ambassador programs, social channels, and local event partnerships. You run (or ride, or swim).'
  }
]

const values = [
  { title: 'Athletes First', desc: 'Every decision starts with "does this make athletes better?" — not "does this grow a metric?"' },
  { title: 'Small Team, Big Scope', desc: 'You\'ll own full features, not tickets. We move quickly and trust each other.' },
  { title: 'Remote-Friendly', desc: 'Work from wherever you train best. We overlap for 4 hours a day and async the rest.' },
  { title: 'Competitive Comp', desc: 'Market salary + equity + full health coverage + a gear allowance so you actually train.' }
]
</script>

<style scoped>
.editorial-page {
  padding-top: var(--nav-h, 64px);
  min-height: 100vh;
  background: #fff;
}

.ep-hero {
  background: #000;
  color: #fff;
  padding: 80px 24px 72px;
}
.ep-hero-inner {
  max-width: 800px;
  margin: 0 auto;
}
.ep-kicker {
  font-size: 0.70rem;
  font-weight: 700;
  letter-spacing: 0.20em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.50);
  margin-bottom: 24px;
}
.ep-headline {
  font-size: clamp(2.2rem, 6vw, 4rem);
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 1.05;
  margin: 0 0 24px;
}
.ep-sub {
  font-size: 1.1rem;
  color: rgba(255,255,255,0.70);
  max-width: 540px;
  line-height: 1.6;
  margin: 0;
}

.ep-section {
  padding: 64px 24px;
}
.ep-section-dark {
  background: #000;
  color: #fff;
}
.ep-content {
  max-width: 800px;
  margin: 0 auto;
}
.ep-section-title {
  font-size: 0.70rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: rgba(15,18,16,0.45);
  margin: 0 0 32px;
}
.ep-section-title-light {
  color: rgba(255,255,255,0.45);
}

/* Roles */
.role-list {
  display: flex;
  flex-direction: column;
  gap: 1px;
  background: #E5E5E5;
  border: 1px solid #E5E5E5;
  margin-bottom: 40px;
}
.role-card {
  background: #fff;
  padding: 24px;
}
.role-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
}
.role-title {
  font-weight: 900;
  font-size: 1.05rem;
  margin-bottom: 4px;
}
.role-meta {
  font-size: 0.82rem;
  color: rgba(15,18,16,0.50);
  font-weight: 600;
  letter-spacing: 0.03em;
}
.role-desc {
  font-size: 0.92rem;
  color: rgba(15,18,16,0.72);
  line-height: 1.6;
  margin: 0;
}
.btn-apply {
  display: inline-block;
  background: #000;
  color: #fff;
  padding: 10px 20px;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.10em;
  text-transform: uppercase;
  text-decoration: none;
  white-space: nowrap;
  transition: opacity 0.15s;
  flex-shrink: 0;
}
.btn-apply:hover { opacity: 0.75; }

.open-app {
  border: 1px solid #E5E5E5;
  padding: 28px;
}
.open-app h3 {
  font-weight: 900;
  font-size: 1rem;
  margin: 0 0 8px;
}
.open-app p {
  font-size: 0.92rem;
  color: rgba(15,18,16,0.70);
  margin: 0;
}
.open-app a { color: #000; font-weight: 700; }

/* Values */
.values-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background: rgba(255,255,255,0.15);
}
.value-item {
  background: #000;
  padding: 28px 24px;
}
.value-title {
  font-weight: 900;
  font-size: 1rem;
  color: #fff;
  margin-bottom: 8px;
}
.value-desc {
  font-size: 0.88rem;
  color: rgba(255,255,255,0.60);
  line-height: 1.55;
  margin: 0;
}

@media (max-width: 600px) {
  .role-top { flex-direction: column; }
  .btn-apply { width: 100%; text-align: center; }
  .values-grid { grid-template-columns: 1fr; }
}
</style>
