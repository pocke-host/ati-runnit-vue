<template>
  <main class="home-page">

    <!-- HERO -->
    <section class="hero">
      <div class="home-inner">
        <div class="hero-grid">
          <!-- LEFT: copy -->
          <div class="hero-copy">
            <span class="sticker sticker--yellow sticker--rot-neg">Early Access · Summer '26</span>
            <h1 class="hero-h1">Run it.<br>Log it.<br><span class="hero-accent">Brag a little.</span></h1>
            <p class="hero-sub">The training app for athletes who'd rather be outside — with the crew that drags them out at dawn. Log every session, find your people, and celebrate the wins that don't fit on a medal.</p>
            <div class="hero-actions">
              <router-link to="/waitlist" class="btn-pill-primary">Get early access</router-link>
              <a href="#track" class="hero-link" @click.prevent="scrollTo('track')">Watch a run →</a>
            </div>
            <div class="syncs-row">
              <span class="syncs-label">Syncs</span>
              <span class="syncs-app">Garmin</span>
              <span class="syncs-slash">/</span>
              <span class="syncs-app">Apple&nbsp;Health</span>
              <span class="syncs-slash">/</span>
              <span class="syncs-app">COROS</span>
            </div>
          </div>
          <!-- RIGHT: tilted photo stack -->
          <div class="hero-stack">
            <div class="hero-card hero-card--back">
              <div class="hero-card-placeholder"></div>
              <div class="hero-card-overlay"></div>
              <div class="hero-card-handle">@maya.k</div>
              <div class="hero-card-stats">
                <div class="hcs-val">21.1<span class="hcs-unit">KM</span></div>
                <div class="hcs-pace">4:38 /KM · SUB-3 PREP</div>
              </div>
            </div>
            <div class="hero-card hero-card--front">
              <div class="hero-card-placeholder"></div>
              <div class="hero-card-overlay"></div>
              <div class="hero-card-handle">@theo</div>
              <div class="hero-card-stats">
                <div class="hcs-val">8.0<span class="hcs-unit">KM</span></div>
                <div class="hcs-pace">3:58 /KM</div>
              </div>
            </div>
            <span class="sticker sticker--yellow sticker--badge sticker--pr">New PR!</span>
            <span class="sticker sticker--cobalt sticker--badge sticker--kudos">+24 kudos</span>
          </div>
        </div>
      </div>
    </section>

    <!-- TRACK -->
    <section id="track" class="content-section">
      <div class="home-inner">
        <div class="two-col two-col--text-left">
          <div class="col-copy">
            <div class="rk-eyebrow">Track</div>
            <h2 class="section-h2">Every step,<br>on the record.</h2>
            <p class="section-body">Watch, phone, or a shoelace and a dream — it all lands in one place. Splits, route, elevation, heart rate. Then your crew piles on the kudos.</p>
            <!-- Animated flow steps -->
            <div class="track-steps">
              <div class="track-step">
                <div class="ts-dot ts-dot--done"></div>
                <div class="ts-body">
                  <div class="ts-num">01 — GPS locks in</div>
                  <div class="ts-desc">Position confirmed. You're on the clock.</div>
                </div>
              </div>
              <div class="ts-connector"></div>
              <div class="track-step">
                <div class="ts-dot ts-dot--active"></div>
                <div class="ts-body">
                  <div class="ts-num">02 — Route records</div>
                  <div class="ts-desc">Every turn, split, and elevation change logged.</div>
                </div>
              </div>
              <div class="ts-connector"></div>
              <div class="track-step">
                <div class="ts-dot"></div>
                <div class="ts-body">
                  <div class="ts-num">03 — Crew reacts</div>
                  <div class="ts-desc">Post the moment. Kudos flood in.</div>
                </div>
              </div>
            </div>
          </div>
          <div class="activity-card">
            <div class="ac-header">
              <div class="ac-avatar">MK</div>
              <div class="ac-info">
                <div class="ac-name">Morning Long Run</div>
                <div class="ac-meta">@maya.k · 06:12</div>
              </div>
              <div class="ac-rec-badge">
                <span class="ac-rec-dot"></span>REC
              </div>
            </div>
            <div class="ac-map">
              <!-- Phase 1: GPS chip fades in first -->
              <div class="ac-gps-chip">
                <span class="ac-gps-dot"></span>GPS Locked
              </div>
              <!-- Phase 2: live pace appears as route draws -->
              <div class="ac-live-pace">4:38 /KM LIVE</div>
              <svg viewBox="0 0 600 200" preserveAspectRatio="none" class="ac-route-svg">
                <!-- start dot -->
                <circle cx="30" cy="160" r="6" fill="#FBF6EC" stroke="#2A55F5" stroke-width="2" class="route-start-dot"></circle>
                <!-- route draws after GPS lock -->
                <path d="M30,160 C120,90 150,150 240,110 C330,70 380,130 470,70 C520,40 560,80 580,55"
                  fill="none" stroke="#2A55F5" stroke-width="3"
                  stroke-dasharray="1000" stroke-dashoffset="1000" class="route-draw"></path>
                <!-- end dot pulses after route finishes -->
                <circle cx="580" cy="55" r="5" fill="#2A55F5" class="route-end-dot"></circle>
                <circle cx="580" cy="55" r="5" fill="none" stroke="#2A55F5" stroke-width="3" class="route-end-ping"></circle>
              </svg>
            </div>
            <!-- Phase 3: stats and reactions stagger in -->
            <div class="ac-stats">
              <div class="ac-stat ac-stat--s1"><div class="ac-stat-label">DIST</div><div class="ac-stat-val">21.1</div></div>
              <div class="ac-stat ac-stat--s2"><div class="ac-stat-label">PACE</div><div class="ac-stat-val">4:38</div></div>
              <div class="ac-stat ac-stat--s3"><div class="ac-stat-label">TIME</div><div class="ac-stat-val">1:37</div></div>
              <div class="ac-reactions ac-reactions--pop">
                <span class="reaction-pill reaction-pill--cobalt">↑ 41</span>
                <span class="reaction-pill reaction-pill--yellow">👏 12</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CREWS -->
    <section class="content-section">
      <div class="home-inner">
        <div class="crews-header">
          <div>
            <div class="rk-eyebrow">Crews</div>
            <h2 class="section-h2">Find your people.<br>Or start your own.</h2>
          </div>
          <router-link to="/clubs" class="btn-pill-ghost">Browse all →</router-link>
        </div>
        <div class="crews-grid">
          <div class="crew-card">
            <div class="crew-avatar crew-avatar--cobalt">ES</div>
            <div class="crew-name">East Side Run Club</div>
            <div class="crew-meta">BK, NY · 1,240</div>
          </div>
          <div class="crew-card">
            <div class="crew-avatar crew-avatar--yellow">DP</div>
            <div class="crew-name">Dawn Patrol</div>
            <div class="crew-meta">Austin, TX · 860</div>
          </div>
          <div class="crew-card">
            <div class="crew-avatar crew-avatar--ink">BR</div>
            <div class="crew-name">Bridgerunners</div>
            <div class="crew-meta">NYC · 3,100</div>
          </div>
          <div class="crew-card crew-card--start">
            <div class="crew-avatar crew-avatar--plus">＋</div>
            <div class="crew-name">Start your own</div>
            <div class="crew-meta">Free · 2 min</div>
          </div>
        </div>
      </div>
    </section>

    <!-- CHALLENGES (ink bg) -->
    <section class="content-section content-section--ink">
      <div class="home-inner">
        <div class="two-col two-col--text-left">
          <div class="col-copy">
            <div class="rk-eyebrow rk-eyebrow--yellow">Challenges</div>
            <h2 class="section-h2 section-h2--cream">Chase crowns.<br>Defend your block.</h2>
            <p class="section-body section-body--muted">Monthly distance races, segment crowns, silly streaks. Every stretch of road is a contest — a little friendly heat to get you out on the days you'd rather not.</p>
            <router-link to="/challenges" class="btn-pill-yellow">See this month's</router-link>
          </div>
          <div class="leaderboard">
            <div class="lb-header">
              <span class="lb-title">JUNE DISTANCE DASH</span>
              <span class="lb-meta">4 DAYS LEFT</span>
            </div>
            <div class="lb-row lb-row--gold">
              <span class="lb-rank">🥇</span>
              <div class="lb-avatar lb-avatar--yellow">TA</div>
              <span class="lb-name">Theo Albright</span>
              <span class="lb-dist">312 KM</span>
            </div>
            <div class="lb-row lb-row--default">
              <span class="lb-rank lb-rank--muted">02</span>
              <div class="lb-avatar lb-avatar--cobalt">MK</div>
              <span class="lb-name">Maya Kessler</span>
              <span class="lb-dist">298 KM</span>
            </div>
            <div class="lb-row lb-row--default">
              <span class="lb-rank lb-rank--muted">03</span>
              <div class="lb-avatar lb-avatar--sand">PN</div>
              <span class="lb-name">Priya Nair</span>
              <span class="lb-dist">254 KM</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- TRAIN + LIVE -->
    <section class="content-section">
      <div class="home-inner">
        <div class="two-up-grid">
          <!-- Train -->
          <div class="feature-box">
            <div class="rk-eyebrow">Train</div>
            <h2 class="feature-box-h2">A plan that<br>actually listens.</h2>
            <p class="section-body">Sleep in? It reshuffles, no guilt trip. Crush a tempo? It pushes. Your plan bends around your week — not the other way round.</p>
            <div class="week-strip">
              <div class="week-day">
                <div class="wd-label">MON</div>
                <div class="wd-val">Easy 6</div>
              </div>
              <div class="week-day week-day--active">
                <div class="wd-label">TUE</div>
                <div class="wd-val">Tempo 8</div>
              </div>
              <div class="week-day">
                <div class="wd-label">WED</div>
                <div class="wd-val">Rest</div>
              </div>
              <div class="week-day week-day--long">
                <div class="wd-label">SUN</div>
                <div class="wd-val">Long 21</div>
              </div>
            </div>
          </div>
          <!-- Live -->
          <div class="feature-box">
            <div class="rk-eyebrow">Live</div>
            <h2 class="feature-box-h2">Cheer them on,<br>live.</h2>
            <div class="live-map">
              <svg viewBox="0 0 500 200" preserveAspectRatio="none" class="live-svg">
                <path d="M40,160 C120,110 110,60 200,80 C300,102 280,40 380,58 C430,66 450,110 470,92" fill="none" stroke="#c9bfa9" stroke-width="4"></path>
                <circle cx="300" cy="64" r="7" fill="#2A55F5"></circle>
                <circle cx="300" cy="64" r="7" fill="none" stroke="#2A55F5" stroke-width="2" class="live-ping"></circle>
              </svg>
              <div class="live-badge">
                <span class="live-dot"></span>Maya's running now
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- DATA TRANSPARENCY -->
    <section class="content-section content-section--cream-border">
      <div class="home-inner">
        <div class="data-section">
          <div class="data-header">
            <div class="rk-eyebrow">Your Data</div>
            <h2 class="section-h2">What we ask for.<br>Why we ask for it.</h2>
          </div>
          <div class="data-grid">
            <div class="data-card">
              <div class="data-card-icon">@</div>
              <div class="data-card-label">Email address</div>
              <div class="data-card-why">Used to create and manage your Runnit account. We send transactional emails only — no marketing spam.</div>
            </div>
            <div class="data-card">
              <div class="data-card-icon">◎</div>
              <div class="data-card-label">Name &amp; profile photo</div>
              <div class="data-card-why">Used to set up your public athlete profile. You can change or remove these at any time from Settings.</div>
            </div>
            <div class="data-card">
              <div class="data-card-icon">⊞</div>
              <div class="data-card-label">Activity &amp; GPS data</div>
              <div class="data-card-why">Used to track your training, display stats, and build your personalized training plan. Never shared without your permission.</div>
            </div>
            <div class="data-card data-card--pledge">
              <div class="pledge-line">We do not sell your data.</div>
              <div class="pledge-line">We do not serve you third-party ads.</div>
              <div class="pledge-line">You can delete your account and all data at any time.</div>
              <router-link to="/privacy" class="pledge-link">Read the full Privacy Policy →</router-link>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- MOMENTS -->
    <section class="content-section">
      <div class="home-inner">
        <div class="two-col two-col--photo-left">
          <div class="moment-photo">
            <div class="moment-placeholder"></div>
            <div class="moment-overlay"></div>
            <div class="moment-stamp">
              <div class="stamp-cell"><div class="stamp-lbl">DIST</div><div class="stamp-val">8.0</div></div>
              <div class="stamp-cell"><div class="stamp-lbl">PACE</div><div class="stamp-val">3:58</div></div>
              <div class="stamp-cell"><div class="stamp-lbl">TIME</div><div class="stamp-val">31:44</div></div>
            </div>
            <span class="sticker sticker--cobalt sticker--badge sticker--posted">Posted ✓</span>
          </div>
          <div class="col-copy">
            <div class="rk-eyebrow">Moments</div>
            <h2 class="section-h2">Stop. Snap.<br>It's posted.</h2>
            <p class="section-body">One photo. Distance and pace stamp themselves on like a timing-mat receipt. No filters, no second takes — straight to the crew that ran it with you.</p>
          </div>
        </div>
      </div>
    </section>

  </main>
</template>

<script setup>
import { computed } from 'vue'
import { useHead } from '@unhead/vue'

useHead({
  title: 'Runnit — The Training App for Endurance Athletes',
  link: [{ rel: 'canonical', href: 'https://runnit.live' }],
  meta: [
    { name: 'description', content: 'Log every session, find your crew, and celebrate every mile. GPS tracking, run clubs, live sharing, and race challenges for runners, cyclists, and triathletes — all in one app.' },
    { property: 'og:title', content: 'Runnit — The Training App for Endurance Athletes' },
    { property: 'og:description', content: 'Log every session, find your crew, and celebrate every mile. GPS tracking, run clubs, live sharing, and race challenges — all in one app.' },
    { property: 'og:url', content: 'https://runnit.live' },
    { property: 'og:image', content: 'https://runnit.live/og-image.png' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:site', content: '@runnitapp' },
    { name: 'twitter:title', content: 'Runnit — The Training App for Endurance Athletes' },
    { name: 'twitter:description', content: 'Log every session, find your crew, and celebrate every mile. GPS tracking, run clubs, live sharing.' },
    { name: 'twitter:image', content: 'https://runnit.live/og-image.png' },
  ]
})

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<style scoped>
/* ── BASE ── */
.home-page {
  min-height: 100vh;
  background: #FBF6EC;
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
  color: #16130F;
  padding-top: var(--nav-h, 66px);
}
.home-inner {
  max-width: 1040px;
  margin: 0 auto;
  padding: 0 32px;
}

/* ── HERO ── */
.hero {
  background: #FBF6EC;
  border-bottom: 2px solid #16130F;
  padding: 72px 0 0;
}
.hero-grid {
  display: grid;
  grid-template-columns: 1.12fr 0.88fr;
  gap: 40px;
  align-items: center;
  padding-bottom: 52px;
}
.hero-copy { display: flex; flex-direction: column; gap: 0; }
.hero-h1 {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-weight: 900;
  font-size: clamp(64px, 9vw, 116px);
  line-height: 0.82;
  letter-spacing: 0.005em;
  text-transform: uppercase;
  margin: 22px 0 0;
  animation: rkRise 0.6s ease-out both;
}
.hero-accent { color: #2A55F5; }
.hero-sub {
  font-size: 1.08rem;
  line-height: 1.55;
  color: #5A5348;
  max-width: 450px;
  margin: 26px 0 0;
}
.hero-actions {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-top: 32px;
  flex-wrap: wrap;
}
.hero-link {
  font-weight: 800;
  font-size: 1rem;
  color: #16130F;
  text-decoration: none;
}
.hero-link:hover { color: #2A55F5; text-decoration: none; }

.syncs-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 28px;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}
.syncs-label { color: #8a8a8a; }
.syncs-app { color: #16130F; }
.syncs-slash { color: #8a8a8a; }

/* ── HERO STACK ── */
.hero-stack {
  position: relative;
  height: 470px;
}
.hero-card {
  position: absolute;
  background: #EDE5D5;
  border: 2px solid #16130F;
  overflow: hidden;
}
.hero-card--back {
  right: 0;
  top: 0;
  width: 300px;
  height: 390px;
  transform: rotate(3deg);
}
.hero-card--front {
  left: 0;
  bottom: 6px;
  width: 220px;
  height: 280px;
  transform: rotate(-4deg);
  z-index: 2;
}
.hero-card-placeholder {
  position: absolute;
  inset: 0;
  background: #D5C9B5;
  background-size: cover;
  background-position: center;
}
.hero-card--back .hero-card-placeholder {
  background-image: url('https://images.unsplash.com/photo-1571019613914-85f342c6a11e?w=600&fit=crop&q=80');
}
.hero-card--front .hero-card-placeholder {
  background-image: url('https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=440&fit=crop&q=80');
}
.hero-card-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.78), rgba(0,0,0,0) 55%);
}
.hero-card-handle {
  position: absolute;
  left: 12px;
  top: 12px;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: #FBF6EC;
}
.hero-card-stats {
  position: absolute;
  left: 12px;
  bottom: 12px;
}
.hcs-val {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 1.5rem;
  font-weight: 600;
  color: #fff;
  font-variant-numeric: tabular-nums;
}
.hero-card--front .hcs-val { font-size: 1.2rem; }
.hcs-unit {
  font-size: 0.7rem;
  color: rgba(255,255,255,0.7);
  margin-left: 3px;
}
.hcs-pace {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.7rem;
  color: rgba(255,255,255,0.7);
  margin-top: 2px;
}
.hero-card--front .hcs-pace { font-size: 0.62rem; }

/* ── STICKERS ── */
.sticker {
  display: inline-block;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 7px 12px;
  border: 2px solid #16130F;
}
.sticker--yellow { background: #FFC53D; color: #16130F; }
.sticker--cobalt { background: #2A55F5; color: #fff; }
.sticker--rot-neg { transform: rotate(-2deg); }
.sticker--badge {
  position: absolute;
  z-index: 3;
}
.sticker--pr {
  right: 2px;
  top: -14px;
  transform: rotate(7deg);
  --r: 7deg;
  animation: rkFloat 5s ease-in-out infinite;
}
.sticker--kudos {
  right: 10px;
  bottom: 30px;
  transform: rotate(-5deg);
  --r: -5deg;
  animation: rkFloat 4.4s ease-in-out 0.5s infinite;
}
.sticker--posted {
  position: absolute;
  right: 14px;
  top: 14px;
  transform: rotate(5deg);
  font-size: 0.68rem;
  padding: 7px 11px;
}

/* ── BUTTONS ── */
.btn-pill-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #2A55F5;
  color: #fff;
  border: 2px solid #16130F;
  border-radius: 999px;
  padding: 14px 26px;
  font-weight: 800;
  font-size: 1rem;
  text-decoration: none;
  box-shadow: 4px 4px 0 #16130F;
  transition: background 0.15s;
  cursor: pointer;
}
.btn-pill-primary:hover { background: #1E42D6; color: #fff; text-decoration: none; }

.btn-pill-ghost {
  display: inline-flex;
  align-items: center;
  border: 2px solid #16130F;
  border-radius: 999px;
  padding: 11px 16px;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #16130F;
  text-decoration: none;
  white-space: nowrap;
  transition: background 0.15s;
}
.btn-pill-ghost:hover { background: rgba(22,19,15,0.06); text-decoration: none; }

.btn-pill-yellow {
  display: inline-flex;
  align-items: center;
  background: #FFC53D;
  color: #16130F;
  border-radius: 999px;
  padding: 12px 18px;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-decoration: none;
  transition: opacity 0.15s;
}
.btn-pill-yellow:hover { opacity: 0.85; text-decoration: none; }

/* ── SECTION LAYOUT ── */
.content-section {
  background: #FBF6EC;
  border-bottom: 2px solid #16130F;
  padding: 52px 0;
}
.content-section--ink {
  background: #16130F;
  color: #FBF6EC;
}
.two-col {
  display: grid;
  gap: 36px;
  align-items: center;
}
.two-col--text-left { grid-template-columns: 0.9fr 1.1fr; }
.two-col--photo-left { grid-template-columns: 1.1fr 0.9fr; }

/* ── EYEBROW + TYPOGRAPHY ── */
.rk-eyebrow {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #2A55F5;
}
.rk-eyebrow--yellow { color: #FFC53D; }
.section-h2 {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-weight: 800;
  font-size: clamp(40px, 5vw, 60px);
  line-height: 0.88;
  letter-spacing: 0.01em;
  text-transform: uppercase;
  margin: 8px 0 14px;
}
.section-h2--cream { color: #FBF6EC; }
.section-body {
  font-size: 1.02rem;
  line-height: 1.6;
  color: #5A5348;
  max-width: 420px;
}
.section-body--muted { color: rgba(251,246,236,0.72); }

/* ── ACTIVITY CARD ── */
.activity-card {
  background: #16130F;
  color: #FBF6EC;
  border: 2px solid #16130F;
  box-shadow: 6px 6px 0 #2A55F5;
}
.ac-header {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 16px 18px;
  border-bottom: 1px solid rgba(251,246,236,0.2);
}
.ac-avatar {
  width: 30px;
  height: 30px;
  border-radius: 999px;
  background: #2A55F5;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.72rem;
  flex-shrink: 0;
}
.ac-info { flex: 1; }
.ac-name { font-weight: 800; font-size: 0.9rem; }
.ac-meta {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.66rem;
  color: rgba(251,246,236,0.55);
  margin-top: 2px;
}
.ac-ago {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: rgba(251,246,236,0.55);
}
.ac-map {
  height: 150px;
  background: #0c0a08;
  position: relative;
  overflow: hidden;
  border-bottom: 1px solid rgba(251,246,236,0.2);
}
.ac-route-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.route-draw {
  animation: rkDraw 2.4s ease-out 0.9s forwards;
}
/* start dot fades in before route draws */
.route-start-dot {
  opacity: 0;
  animation: rkFadeUp 0.4s ease-out 0.5s forwards;
}
/* end dot appears after route finishes, then pulses */
.route-end-dot {
  opacity: 0;
  animation: rkFadeUp 0.3s ease-out 3.3s forwards;
}
.route-end-ping {
  opacity: 0;
  animation: rkEndPing 1.4s ease-out 3.4s infinite;
}

/* GPS chip — phase 1 */
.ac-gps-chip {
  position: absolute;
  left: 14px;
  top: 14px;
  display: flex;
  align-items: center;
  gap: 7px;
  background: rgba(22,19,15,0.82);
  color: #FBF6EC;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.64rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 7px 12px;
  border: 1px solid rgba(251,246,236,0.25);
  opacity: 0;
  animation: rkFadeUp 0.4s ease-out 0.1s forwards;
}
.ac-gps-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: #2A55F5;
  display: inline-block;
  flex-shrink: 0;
  animation: rkBlink 1.2s ease-in-out 0.1s infinite;
}

/* Live pace chip — phase 2 (appears as route draws) */
.ac-live-pace {
  position: absolute;
  right: 14px;
  top: 14px;
  background: #2A55F5;
  color: #fff;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.64rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 7px 11px;
  border: 1px solid #16130F;
  opacity: 0;
  animation: rkFadeUp 0.4s ease-out 1.4s forwards;
}

/* Recording badge in header */
.ac-rec-badge {
  display: flex;
  align-items: center;
  gap: 5px;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  color: #C0392B;
  margin-left: auto;
}
.ac-rec-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: #C0392B;
  display: inline-block;
  flex-shrink: 0;
  animation: rkBlink 0.9s ease-in-out infinite;
}

/* Phase 3: stats stagger in after route finishes */
.ac-stat--s1 {
  opacity: 0;
  animation: rkStepIn 0.35s ease-out 3.4s forwards;
}
.ac-stat--s2 {
  opacity: 0;
  animation: rkStepIn 0.35s ease-out 3.6s forwards;
}
.ac-stat--s3 {
  opacity: 0;
  animation: rkStepIn 0.35s ease-out 3.8s forwards;
}
/* Phase 3: reactions pop in last */
.ac-reactions--pop {
  opacity: 0;
  animation: rkPopIn 0.4s cubic-bezier(0.34,1.56,0.64,1) 4.2s forwards;
}

/* Track flow steps (left copy) */
.track-steps {
  display: flex;
  flex-direction: column;
  margin-top: 28px;
  gap: 0;
}
.track-step {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}
.ts-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  border: 2px solid #E7DFCE;
  background: transparent;
  flex-shrink: 0;
  margin-top: 3px;
}
.ts-dot--done {
  background: #2A55F5;
  border-color: #2A55F5;
}
.ts-dot--active {
  border-color: #2A55F5;
  background: transparent;
  box-shadow: 0 0 0 3px rgba(42,85,245,0.2);
  animation: rkBlink 1.4s ease-in-out infinite;
}
.ts-connector {
  width: 2px;
  height: 24px;
  background: #E7DFCE;
  margin-left: 4px;
}
.ts-body { padding-bottom: 0; }
.ts-num {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #16130F;
}
.ts-desc {
  font-size: 0.82rem;
  color: #5A5348;
  line-height: 1.4;
  margin-top: 2px;
}

@keyframes rkFadeUp {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes rkStepIn {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes rkPopIn {
  from { opacity: 0; transform: scale(0.8); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes rkEndPing {
  0%   { opacity: 0.8; transform: scale(1); }
  100% { opacity: 0;   transform: scale(3); }
}

.ac-stats {
  display: flex;
  align-items: center;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-variant-numeric: tabular-nums;
}
.ac-stat {
  flex: 1;
  padding: 14px 16px;
  border-right: 1px solid rgba(251,246,236,0.2);
}
.ac-stat-label {
  font-size: 0.54rem;
  letter-spacing: 0.12em;
  color: rgba(251,246,236,0.5);
}
.ac-stat-val { font-size: 1.15rem; font-weight: 600; }
.ac-reactions {
  display: flex;
  gap: 6px;
  padding: 0 14px;
}
.reaction-pill {
  border-radius: 999px;
  padding: 6px 11px;
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
  font-weight: 800;
  font-size: 0.72rem;
}
.reaction-pill--cobalt { background: #2A55F5; color: #fff; }
.reaction-pill--yellow { background: #FFC53D; color: #16130F; }

/* ── CREWS ── */
.crews-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 26px;
}
.crews-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}
.crew-card {
  border: 2px solid #16130F;
  padding: 18px;
  background: #fff;
}
.crew-card--start {
  background: #2A55F5;
  color: #fff;
}
.crew-avatar {
  width: 44px;
  height: 44px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.86rem;
  margin-bottom: 14px;
}
.crew-avatar--cobalt { background: #2A55F5; color: #fff; }
.crew-avatar--yellow { background: #FFC53D; color: #16130F; }
.crew-avatar--ink { background: #16130F; color: #fff; }
.crew-avatar--plus { background: #16130F; color: #2A55F5; font-size: 1.1rem; }
.crew-name { font-weight: 800; font-size: 0.95rem; }
.crew-meta {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.66rem;
  color: #8a8a8a;
  margin-top: 4px;
}
.crew-card--start .crew-meta { color: rgba(255,255,255,0.8); }

/* ── CHALLENGES LEADERBOARD ── */
.leaderboard {
  border: 2px solid #FBF6EC;
  background: #1f1b16;
}
.lb-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid rgba(251,246,236,0.15);
}
.lb-title {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-weight: 800;
  font-size: 0.92rem;
}
.lb-meta {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.66rem;
  color: rgba(251,246,236,0.55);
}
.lb-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 15px 18px;
}
.lb-row--gold {
  background: #FFC53D;
  color: #16130F;
  border-bottom: 1px solid #16130F;
}
.lb-row--default { border-bottom: 1px solid rgba(251,246,236,0.12); }
.lb-row--default:last-child { border-bottom: none; }
.lb-rank {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-weight: 700;
  font-size: 1.1rem;
  width: 30px;
}
.lb-rank--muted { color: rgba(251,246,236,0.55); }
.lb-avatar {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.7rem;
  flex-shrink: 0;
}
.lb-avatar--yellow { background: #16130F; color: #FFC53D; }
.lb-avatar--cobalt { background: #2A55F5; color: #fff; }
.lb-avatar--sand { background: #EDE5D5; color: #16130F; }
.lb-name { flex: 1; font-weight: 800; font-size: 0.92rem; }
.lb-dist {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

/* ── TRAIN + LIVE ── */
.two-up-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 22px;
}
.feature-box {
  border: 2px solid #16130F;
  padding: 26px;
  background: #fff;
  display: flex;
  flex-direction: column;
}
.feature-box-h2 {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-weight: 800;
  font-size: 46px;
  line-height: 0.9;
  text-transform: uppercase;
  margin: 8px 0 12px;
}
.week-strip {
  display: flex;
  gap: 8px;
  margin-top: 18px;
}
.week-day {
  flex: 1;
  border: 2px solid #16130F;
  padding: 12px 8px;
  text-align: center;
}
.week-day--active {
  background: #2A55F5;
  color: #fff;
}
.week-day--long { background: #FFF3D6; }
.wd-label {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.58rem;
  font-weight: 600;
  color: #8a8a8a;
}
.week-day--active .wd-label { color: rgba(255,255,255,0.8); }
.wd-val { font-weight: 800; font-size: 0.8rem; margin-top: 6px; }

.live-map {
  border: 2px solid #16130F;
  position: relative;
  height: 150px;
  overflow: hidden;
  background: #EDE5D5;
  margin-top: 14px;
}
.live-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.live-ping { animation: rkBlink 1.4s ease-in-out infinite; }
.live-badge {
  position: absolute;
  left: 12px;
  top: 12px;
  display: flex;
  align-items: center;
  gap: 7px;
  background: #fff;
  padding: 6px 11px;
  border: 2px solid #16130F;
  font-size: 0.68rem;
  font-weight: 800;
}
.live-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: #2A55F5;
  display: inline-block;
  animation: rkBlink 1.4s infinite;
  flex-shrink: 0;
}

/* ── DATA TRANSPARENCY ── */
.data-section {
  display: flex;
  flex-direction: column;
  gap: 28px;
}
.data-header { max-width: 520px; }
.data-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}
.data-card {
  border: 2px solid #16130F;
  padding: 22px 18px;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.data-card-icon {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 1.3rem;
  font-weight: 700;
  color: #2A55F5;
  line-height: 1;
}
.data-card-label {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #16130F;
}
.data-card-why {
  font-size: 0.84rem;
  line-height: 1.5;
  color: #5A5348;
}
.data-card--pledge {
  background: #16130F;
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: center;
}
.pledge-line {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #FBF6EC;
  line-height: 1.4;
}
.pledge-link {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #2A55F5;
  text-decoration: none;
  margin-top: 6px;
}
.pledge-link:hover { text-decoration: underline; }

@media (max-width: 860px) {
  .data-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 480px) {
  .data-grid { grid-template-columns: 1fr; }
}

/* ── MOMENTS ── */
.moment-photo {
  position: relative;
  height: 340px;
  background: #EDE5D5;
  border: 2px solid #16130F;
}
.moment-placeholder {
  position: absolute;
  inset: 0;
  background: #D5C9B5;
  background-image: url('https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&fit=crop&q=80');
  background-size: cover;
  background-position: center top;
}
.moment-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.72), rgba(0,0,0,0) 50%);
}
.moment-stamp {
  position: absolute;
  left: 16px;
  bottom: 16px;
  display: flex;
  border: 1px solid rgba(255,255,255,0.35);
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-variant-numeric: tabular-nums;
}
.stamp-cell {
  padding: 8px 13px;
  border-right: 1px solid rgba(255,255,255,0.35);
}
.stamp-cell:last-child { border-right: none; }
.stamp-lbl { font-size: 0.5rem; letter-spacing: 0.12em; color: rgba(255,255,255,0.6); }
.stamp-val { font-size: 0.95rem; font-weight: 600; color: #fff; }

/* ── RESPONSIVE ── */
@media (max-width: 860px) {
  .hero-grid { grid-template-columns: 1fr; gap: 24px; }
  .hero-stack { display: none; }
  .two-col--text-left,
  .two-col--photo-left { grid-template-columns: 1fr; gap: 24px; }
  .two-col--photo-left .moment-photo { height: 240px; }
  .crews-grid { grid-template-columns: repeat(2, 1fr); }
  .two-up-grid { grid-template-columns: 1fr; gap: 16px; }
  .section-body { max-width: 100%; }
}
@media (max-width: 640px) {
  .home-page { padding-top: 56px; }
  .home-inner { padding: 0 18px; }
  .hero { padding: 32px 0 0; }
  .hero-grid { padding-bottom: 40px; }
  .hero-h1 { font-size: clamp(44px, 13vw, 52px) !important; line-height: 0.84; }
  .hero-sub { font-size: 0.95rem; max-width: 100%; }
  .hero-actions { flex-direction: column; align-items: stretch; gap: 12px; }
  .btn-pill-primary { width: 100%; text-align: center; justify-content: center; }
  .hero-link { text-align: center; }
  .content-section { padding: 36px 0; }
  .section-h2 { font-size: clamp(34px, 10vw, 40px) !important; }
  .feature-box-h2 { font-size: clamp(28px, 9vw, 34px); }
  .feature-box { padding: 20px; }
  .crews-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .crew-card { padding: 14px; }
  .two-col--photo-left .moment-photo { height: 200px; }
  .leaderboard .lb-name { font-size: 0.82rem; }
  .leaderboard .lb-dist { font-size: 0.82rem; }
  .syncs-row { flex-wrap: wrap; gap: 6px 10px; }
  .crews-header { flex-direction: column; align-items: flex-start; gap: 12px; }
  .track-steps { display: none; }
}
</style>
