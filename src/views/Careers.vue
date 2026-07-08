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
        <!-- <h2 class="ep-section-title">Open Roles</h2> -->
        <div class="role-list">
          <div class="role-card" v-for="role in roles" :key="role.title">
            <div class="role-top">
              <div>
                <div class="role-title">{{ role.title }}</div>
                <div class="role-meta">{{ role.dept }} · {{ role.type }} · {{ role.location }}</div>
              </div>
              <a href="mailto:quinnhuynh1126@gmail.com" class="btn-apply">Apply</a>
            </div>
            <p class="role-desc">{{ role.desc }}</p>
          </div>
        </div>

        <div class="open-app">
          <h3>Don't see your role?</h3>
          <p>Check out our LinkedIn page for more updates. <a href="https://www.linkedin.com/company/runnit-app/">Runnit LinkedIn Page</a>.</p>
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
import { useHead } from '@unhead/vue'

useHead({
  title: 'Careers — Runnit',
  link: [{ rel: 'canonical', href: 'https://runnit.live/careers' }],
  meta: [
    { name: 'description', content: 'Join the team building the future of endurance training. Open roles in engineering, design, and growth at Runnit.' },
    { property: 'og:title', content: 'Careers — Runnit' },
    { property: 'og:description', content: 'Join the team building the future of endurance training. Open roles in engineering, design, and growth.' },
    { property: 'og:url', content: 'https://runnit.live/careers' },
    { property: 'og:image', content: 'https://runnit.live/og-image.png' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Careers — Runnit' },
    { name: 'twitter:description', content: 'Join the team building the future of endurance training.' },
    { name: 'twitter:image', content: 'https://runnit.live/og-image.png' },
  ]
})

const roles = [
  // {
  //   title: 'UI/UX Designer',
  //   dept: 'Creative',
  //   type: 'Contract',
  //   location: 'Remote (US)',
  //   desc: 'Own the user experience of Runnit.'
  // },
  // {
  //   title: 'Community & Growth Lead',
  //   dept: 'Growth',
  //   type: 'Contract',
  //   location: 'Remote',
  //   desc: 'Grow and nurture our app community. Run ambassador programs, social channels, and local event partnerships.'
  // }
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
  padding-top: var(--nav-h, 66px);
  min-height: 100vh;
  background: #FBF6EC;
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
}

.ep-hero {
  background: #16130F;
  color: #FBF6EC;
  padding: 80px 24px 72px;
}
.ep-hero-inner {
  max-width: 800px;
  margin: 0 auto;
}
.ep-kicker {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.20em;
  text-transform: uppercase;
  color: rgba(251,246,236,0.55);
  margin-bottom: 24px;
}
.ep-headline {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-size: clamp(2.4rem, 7vw, 5rem);
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.01em;
  line-height: 0.88;
  margin: 0 0 24px;
}
.ep-sub {
  font-size: 1.05rem;
  color: rgba(251,246,236,0.72);
  max-width: 540px;
  line-height: 1.6;
  margin: 0;
}

.ep-section {
  padding: 64px 24px;
}
.ep-section-dark {
  background: #16130F;
  color: #FBF6EC;
}
.ep-content {
  max-width: 800px;
  margin: 0 auto;
}
.ep-section-title {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #8A8A8A;
  margin: 0 0 32px;
}
.ep-section-title-light {
  color: rgba(251,246,236,0.45);
}

/* Roles */
.role-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  background: #E7DFCE;
  border: 2px solid #16130F;
  margin-bottom: 40px;
}
.role-card {
  background: #FBF6EC;
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
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-weight: 900;
  font-size: 1.15rem;
  text-transform: uppercase;
  line-height: 0.92;
  margin-bottom: 8px;
  color: #16130F;
}
.role-meta {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  color: #8A8A8A;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.role-desc {
  font-size: 0.92rem;
  color: #5A5348;
  line-height: 1.6;
  margin: 0;
}
.btn-apply {
  display: inline-block;
  background: #2A55F5;
  color: #fff;
  padding: 10px 22px;
  border-radius: 999px;
  border: 2px solid #2A55F5;
  box-shadow: 2px 2px 0 #16130F;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.70rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  text-decoration: none;
  white-space: nowrap;
  transition: background 0.15s;
  flex-shrink: 0;
}
.btn-apply:hover { background: #1E42D6; border-color: #1E42D6; }

.open-app {
  border: 2px solid #16130F;
  box-shadow: 3px 3px 0 #16130F;
  padding: 28px;
  background: #fff;
}
.open-app h3 {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-weight: 900;
  font-size: 1.1rem;
  text-transform: uppercase;
  line-height: 0.92;
  margin: 0 0 10px;
  color: #16130F;
}
.open-app p {
  font-size: 0.92rem;
  color: #5A5348;
  margin: 0;
}
.open-app a { color: #2A55F5; font-weight: 700; text-decoration: none; }
.open-app a:hover { color: #1E42D6; }

/* Values */
.values-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px;
  background: rgba(251,246,236,0.15);
}
.value-item {
  background: #16130F;
  border: 2px solid rgba(251,246,236,0.12);
  padding: 28px 24px;
}
.value-title {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-weight: 900;
  font-size: 1.05rem;
  text-transform: uppercase;
  color: #FBF6EC;
  margin-bottom: 10px;
}
.value-desc {
  font-size: 0.88rem;
  color: rgba(251,246,236,0.62);
  line-height: 1.55;
  margin: 0;
}

@media (max-width: 600px) {
  .role-top { flex-direction: column; }
  .btn-apply { width: 100%; text-align: center; }
  .values-grid { grid-template-columns: 1fr; }
}
</style>
