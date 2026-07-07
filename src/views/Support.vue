<template>
  <main class="support-page">

    <!-- INK HERO -->
    <section class="sp-hero">
      <div class="sp-hero-inner">
        <span class="sp-hero-badge">Help Center</span>
        <h1 class="sp-hero-headline">How can we help?</h1>
        <p class="sp-hero-sub">Answers on tracking, syncing, plans, and your account.</p>
        <div class="sp-search-bar">
          <span class="sp-search-placeholder">Search help articles…</span>
          <button class="sp-search-btn">Search</button>
        </div>
      </div>
    </section>

    <!-- CATEGORIES -->
    <section class="sp-section">
      <div class="sp-content">
        <div class="sp-eyebrow">Browse by topic</div>
        <div class="sp-categories-grid">
          <a href="#" class="sp-cat-tile" v-for="cat in categories" :key="cat.title">
            <div class="sp-cat-title">{{ cat.title }}</div>
            <div class="sp-cat-desc">{{ cat.desc }}</div>
          </a>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="sp-section sp-section--faq">
      <div class="sp-content">
        <div class="sp-eyebrow">Common questions</div>
        <div class="sp-faq-list">
          <div
            v-for="(faq, i) in faqs"
            :key="faq.q"
            class="sp-faq-item"
            :class="{ 'sp-faq-item--open': openFaq === i }"
            @click="openFaq = openFaq === i ? null : i"
          >
            <div class="sp-faq-q">
              <span>{{ faq.q }}</span>
              <span class="sp-faq-toggle">{{ openFaq === i ? '–' : '+' }}</span>
            </div>
            <div v-if="openFaq === i" class="sp-faq-a">{{ faq.a }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- CONTACT -->
    <section class="sp-section">
      <div class="sp-content">
        <div class="sp-contact-card">
          <div class="sp-contact-left">
            <h2 class="sp-contact-title">Still stuck?</h2>
            <p class="sp-contact-sub">We're a small team of runners — real humans, usually back to you within a day.</p>
          </div>
          <div class="sp-contact-right">
            <a href="mailto:support@runnit.live" class="sp-contact-btn sp-contact-btn--primary">Email Support</a>
            <a href="#" class="sp-contact-btn sp-contact-btn--outline">Live Chat</a>
          </div>
        </div>
      </div>
    </section>

  </main>
</template>

<script setup>
import { ref } from 'vue'
import { useHead } from '@unhead/vue'
useHead({
  title: 'Support — Runnit',
  link: [{ rel: 'canonical', href: 'https://runnit.live/support' }],
  meta: [
    { name: 'description', content: 'Get help with Runnit. Browse help articles on GPS tracking, Garmin sync, training plans, billing, and more — or submit a support request.' },
    { property: 'og:title', content: 'Support — Runnit' },
    { property: 'og:description', content: 'Find answers to common questions about Runnit, or contact our support team directly.' },
    { property: 'og:url', content: 'https://runnit.live/support' },
    { property: 'og:image', content: 'https://runnit.live/og-image.png' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Support — Runnit' },
    { name: 'twitter:description', content: 'Find answers to common questions about Runnit, or contact our support team directly.' },
    { name: 'twitter:image', content: 'https://runnit.live/og-image.png' },
  ]
})

const openFaq = ref(0)

const categories = [
  { title: 'Getting Started', desc: 'Create an account, log your first run, set up your profile.' },
  { title: 'Tracking & GPS', desc: 'Recording activities, routes, splits, and accuracy.' },
  { title: 'Syncing Apps', desc: 'Strava, Garmin, and Apple Health connections.' },
  { title: 'Training Plans', desc: 'Adaptive plans, workouts, and rescheduling.' },
  { title: 'Crews & Social', desc: 'Clubs, following, kudos, and privacy.' },
  { title: 'Account & Billing', desc: 'Plans, upgrades, and managing your subscription.' },
]

const faqs = [
  { q: 'How do I connect Garmin or Strava?', a: 'Head to Profile → Connected Apps and tap Connect next to your service. You\'ll authorize once, and activities sync automatically from then on — usually within a minute of finishing a run.' },
  { q: 'Why is my GPS distance slightly off?', a: 'GPS accuracy depends on signal quality, tree cover, and device hardware. For best results, calibrate your device before heading out and give it 30–60 seconds to lock signal.' },
  { q: 'Can I reschedule a workout in my plan?', a: 'Yes — open the workout in your Training Plans tab, tap the three-dot menu, and choose Reschedule. The plan adapts automatically around your new date.' },
  { q: 'How do I join or start a crew?', a: 'Go to Clubs in the main nav, browse or search for your crew, and tap Join. To create one, tap the + button and set your privacy and invite settings.' },
  { q: 'How do I cancel or change my plan?', a: 'Go to Settings → Billing → Manage Subscription. Changes take effect at the end of your current billing cycle.' },
]
</script>

<style scoped>
.support-page {
  background: #FBF6EC;
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
  padding-top: calc(var(--nav-h, 66px) + 20px);
  min-height: 100vh;
  color: #16130F;
}

/* HERO */
.sp-hero {
  background: #16130F;
  color: #FBF6EC;
  padding: 72px 24px 56px;
  text-align: center;
}
.sp-hero-inner {
  max-width: 700px;
  margin: 0 auto;
}
.sp-hero-badge {
  display: inline-block;
  background: #2A55F5;
  color: #fff;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.64rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  padding: 6px 12px;
  transform: rotate(-2deg);
  margin-bottom: 20px;
}
.sp-hero-headline {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-weight: 900;
  font-size: clamp(2.8rem, 7vw, 4.8rem);
  line-height: 0.82;
  text-transform: uppercase;
  margin: 0 0 16px;
}
.sp-hero-sub {
  font-size: 1.02rem;
  color: rgba(251,246,236,0.68);
  margin: 0 0 26px;
  line-height: 1.55;
}
.sp-search-bar {
  display: flex;
  max-width: 560px;
  margin: 0 auto;
  border: 2px solid #FBF6EC;
}
.sp-search-placeholder {
  flex: 1;
  padding: 15px 18px;
  font-size: 0.95rem;
  color: #8a8a8a;
  text-align: left;
  background: #FBF6EC;
  color: #8a8a8a;
}
.sp-search-btn {
  background: #2A55F5;
  color: #fff;
  border: none;
  padding: 15px 24px;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.15s;
}
.sp-search-btn:hover { background: #1E42D6; }

/* SECTIONS */
.sp-section { padding: 40px 24px; }
.sp-section--faq { padding-top: 20px; }
.sp-content { max-width: 1060px; margin: 0 auto; }
.sp-eyebrow {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #2A55F5;
  margin-bottom: 18px;
}

/* CATEGORIES */
.sp-categories-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border: 2px solid #16130F;
}
.sp-cat-tile {
  padding: 26px 24px;
  border-right: 2px solid #16130F;
  border-bottom: 2px solid #16130F;
  text-decoration: none;
  color: #16130F;
  transition: background 0.12s;
  display: block;
}
.sp-cat-tile:nth-child(3n) { border-right: none; }
.sp-cat-tile:nth-child(4), .sp-cat-tile:nth-child(5), .sp-cat-tile:nth-child(6) { border-bottom: none; }
.sp-cat-tile:hover { background: #F1EADC; }
.sp-cat-title {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-weight: 800;
  font-size: 1.4rem;
  text-transform: uppercase;
  line-height: 1;
}
.sp-cat-desc {
  color: #5a5348;
  font-size: 0.86rem;
  line-height: 1.5;
  margin-top: 6px;
}

/* FAQ */
.sp-faq-list {
  border: 2px solid #16130F;
  background: #fff;
}
.sp-faq-item {
  border-bottom: 2px solid #16130F;
  cursor: pointer;
}
.sp-faq-item:last-child { border-bottom: none; }
.sp-faq-q {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 22px;
  font-weight: 800;
  font-size: 1rem;
  gap: 16px;
}
.sp-faq-item--open .sp-faq-q { background: #F1EADC; }
.sp-faq-toggle {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-size: 1.6rem;
  font-weight: 800;
  color: #2A55F5;
  line-height: 0.7;
  flex-shrink: 0;
}
.sp-faq-item:not(.sp-faq-item--open) .sp-faq-toggle { color: #16130F; }
.sp-faq-a {
  padding: 0 22px 18px;
  color: #5a5348;
  line-height: 1.65;
  font-size: 0.92rem;
  border-top: none;
}

/* CONTACT */
.sp-contact-card {
  border: 2px solid #16130F;
  background: #2A55F5;
  color: #fff;
  box-shadow: 6px 6px 0 #16130F;
  display: grid;
  grid-template-columns: 1.3fr 0.7fr;
  align-items: center;
}
.sp-contact-left { padding: 32px; }
.sp-contact-title {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-weight: 900;
  font-size: 2.8rem;
  line-height: 0.85;
  text-transform: uppercase;
  margin: 0;
}
.sp-contact-sub {
  font-size: 1rem;
  opacity: 0.9;
  margin: 12px 0 0;
  max-width: 400px;
  line-height: 1.55;
}
.sp-contact-right {
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.sp-contact-btn {
  display: block;
  text-align: center;
  padding: 14px 0;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-decoration: none;
  border: 2px solid;
  cursor: pointer;
  transition: opacity 0.15s;
}
.sp-contact-btn:hover { opacity: 0.85; }
.sp-contact-btn--primary { background: #FBF6EC; color: #16130F; border-color: #16130F; }
.sp-contact-btn--outline { background: transparent; color: #fff; border-color: #fff; }

@media (max-width: 768px) {
  .sp-categories-grid { grid-template-columns: 1fr 1fr; }
  .sp-cat-tile:nth-child(2n) { border-right: none; }
  .sp-cat-tile:nth-child(n+5) { border-bottom: none; }
  .sp-contact-card { grid-template-columns: 1fr; }
  .sp-contact-right { padding-top: 0; }
}

@media (max-width: 480px) {
  .sp-categories-grid { grid-template-columns: 1fr; }
  .sp-cat-tile { border-right: none; }
  .sp-cat-tile:last-child { border-bottom: none; }
}
</style>
