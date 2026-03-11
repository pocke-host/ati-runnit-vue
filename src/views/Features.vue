<!-- src/views/Features.vue -->
<template>
  <main class="features-page">

    <!-- HERO -->
    <section class="hero">
      <div class="hero-inner">
        <div class="hero-kicker">RUNNIT // PLATFORM</div>
        <h1 class="hero-headline">Everything you need<br>to train, connect,<br>and improve.</h1>
        <p class="hero-sub">
          Activity tracking. Training plans. Coaching. Community. All in one place — built for athletes who show up.
        </p>
        <div class="hero-ctas">
          <router-link to="/signup" class="btn-cta-primary">Get Started Free</router-link>
          <router-link to="/join-us" class="btn-cta-ghost">Sign In</router-link>
        </div>
      </div>
    </section>

    <!-- FEATURE GRID: Core -->
    <section class="feature-section">
      <div class="section-inner">
        <div class="section-kicker">CORE FEATURES</div>
        <h2 class="section-headline">Built for how you actually train.</h2>
        <div class="feature-grid">
          <div v-for="f in coreFeatures" :key="f.title" class="feature-card">
            <div class="feature-icon-wrap">
              <i :class="f.icon + ' feature-icon'"></i>
            </div>
            <div class="feature-body">
              <h3 class="feature-title">{{ f.title }}</h3>
              <p class="feature-desc">{{ f.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- EDITORIAL STRIP: Live Tracker -->
    <section class="editorial-strip editorial-strip--dark">
      <div class="editorial-inner">
        <div class="editorial-text">
          <div class="editorial-kicker">LIVE TRACKING</div>
          <h2 class="editorial-headline">GPS tracking that stays out of the way.</h2>
          <p class="editorial-body">
            Start a run, ride, swim, or hike — and RUNNIT records every split, elevation change, and heart rate beat in real time. Auto-pauses, live pacing, and GPS route maps included.
          </p>
          <ul class="editorial-list">
            <li>GPS route recording with elevation profile</li>
            <li>Real-time pace, distance, and duration</li>
            <li>Multi-sport: Running, Cycling, Swimming, Hiking</li>
            <li>Auto-sync to your activity feed on save</li>
          </ul>
        </div>
        <div class="editorial-visual">
          <div class="tracker-mock">
            <div class="tracker-mock-kicker">LIVE</div>
            <div class="tracker-stat-row">
              <div class="tracker-stat">
                <div class="tracker-val">3.2</div>
                <div class="tracker-label">MILES</div>
              </div>
              <div class="tracker-stat">
                <div class="tracker-val">8:42</div>
                <div class="tracker-label">PACE</div>
              </div>
              <div class="tracker-stat">
                <div class="tracker-val">24:10</div>
                <div class="tracker-label">TIME</div>
              </div>
            </div>
            <div class="tracker-route-preview">
              <div class="route-line"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- EDITORIAL STRIP: Training Plans -->
    <section class="editorial-strip editorial-strip--light">
      <div class="editorial-inner editorial-inner--reversed">
        <div class="editorial-text">
          <div class="editorial-kicker">TRAINING PLANS</div>
          <h2 class="editorial-headline">Week-by-week plans built for your goal.</h2>
          <p class="editorial-body">
            Choose a plan by sport, level, and goal. Each plan breaks your training into structured weeks with daily workouts, distance targets, and recovery days. Follow your coach's plan or pick from the library.
          </p>
          <ul class="editorial-list">
            <li>Plans for running, cycling, swimming, and triathlon</li>
            <li>Beginner to advanced levels</li>
            <li>Week-by-week workout schedule</li>
            <li>Coach-assigned plans with inline editing</li>
          </ul>
        </div>
        <div class="editorial-visual">
          <div class="plan-mock">
            <div class="plan-mock-header">
              <span class="plan-mock-title">5K Race Plan</span>
              <span class="plan-mock-badge">WEEK 3 / 8</span>
            </div>
            <div class="plan-mock-bar-wrap">
              <div class="plan-mock-bar">
                <div class="plan-mock-fill" style="width: 37%"></div>
              </div>
              <span class="plan-mock-pct">37%</span>
            </div>
            <div class="plan-mock-workouts">
              <div v-for="w in planPreview" :key="w.day" class="plan-mock-row">
                <span class="plan-mock-day">{{ w.day }}</span>
                <span class="plan-mock-workout">{{ w.workout }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FEATURE GRID: Social -->
    <section class="feature-section feature-section--gray">
      <div class="section-inner">
        <div class="section-kicker">COMMUNITY</div>
        <h2 class="section-headline">Train with people who get it.</h2>
        <div class="feature-grid feature-grid--2">
          <div v-for="f in communityFeatures" :key="f.title" class="feature-card feature-card--large">
            <div class="feature-icon-wrap">
              <i :class="f.icon + ' feature-icon'"></i>
            </div>
            <div class="feature-body">
              <h3 class="feature-title">{{ f.title }}</h3>
              <p class="feature-desc">{{ f.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- EDITORIAL STRIP: Coaching -->
    <section class="editorial-strip editorial-strip--dark">
      <div class="editorial-inner">
        <div class="editorial-text">
          <div class="editorial-kicker">COACHING</div>
          <h2 class="editorial-headline">Coach and athlete, in one platform.</h2>
          <p class="editorial-body">
            Coaches get a full dashboard to manage their roster, review athlete progress, build and assign custom training plans, and message athletes directly. Athletes can browse the coach directory and request to join.
          </p>
          <ul class="editorial-list">
            <li>Coach dashboard with athlete roster</li>
            <li>Inline plan editor — edit workouts by week</li>
            <li>Approve/reject athlete requests</li>
            <li>Direct messaging between coach and athlete</li>
          </ul>
        </div>
        <div class="editorial-visual">
          <div class="coaching-mock">
            <div class="coaching-mock-label">COACHING HUB</div>
            <div class="coaching-mock-stats">
              <div class="coaching-stat">
                <div class="coaching-val">12</div>
                <div class="coaching-stat-label">Athletes</div>
              </div>
              <div class="coaching-stat">
                <div class="coaching-val">3</div>
                <div class="coaching-stat-label">Pending</div>
              </div>
              <div class="coaching-stat">
                <div class="coaching-val">9</div>
                <div class="coaching-stat-label">Plans</div>
              </div>
            </div>
            <div class="coaching-roster">
              <div v-for="a in coachPreview" :key="a.name" class="coaching-athlete">
                <div class="coaching-avatar">{{ a.name[0] }}</div>
                <div class="coaching-info">
                  <div class="coaching-name">{{ a.name }}</div>
                  <div class="coaching-plan">{{ a.plan }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- STATS + ACHIEVEMENTS -->
    <section class="feature-section">
      <div class="section-inner">
        <div class="section-kicker">STATS & ACHIEVEMENTS</div>
        <h2 class="section-headline">See exactly where you're growing.</h2>
        <div class="feature-grid">
          <div v-for="f in statsFeatures" :key="f.title" class="feature-card">
            <div class="feature-icon-wrap">
              <i :class="f.icon + ' feature-icon'"></i>
            </div>
            <div class="feature-body">
              <h3 class="feature-title">{{ f.title }}</h3>
              <p class="feature-desc">{{ f.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- COMPATIBLE DEVICES -->
    <section class="devices-strip">
      <div class="devices-inner">
        <div class="devices-label">COMPATIBLE DEVICES</div>
        <div class="devices-list">
          <span v-for="d in devices" :key="d" class="device-pill">{{ d }}</span>
        </div>
      </div>
    </section>

    <!-- FINAL CTA -->
    <section class="cta-section">
      <div class="cta-inner">
        <h2 class="cta-headline">Ready to start training?</h2>
        <p class="cta-sub">Create your account. Log your first activity. Build the habit.</p>
        <router-link to="/signup" class="btn-cta-primary">Create Free Account</router-link>
        <p class="cta-fine">No credit card required. Free to get started.</p>
      </div>
    </section>

  </main>
</template>

<script setup>
const coreFeatures = [
  {
    icon: 'bi bi-activity',
    title: 'Activity Tracking',
    desc: 'Log runs, rides, swims, and hikes. Track distance, pace, elevation, heart rate, and calories in one place.',
  },
  {
    icon: 'bi bi-map',
    title: 'GPS Route Maps',
    desc: 'Every workout records a GPS route. View your path, elevation profile, and split breakdowns after each session.',
  },
  {
    icon: 'bi bi-camera-fill',
    title: 'Workout Moments',
    desc: 'Capture the moment — photo, song, and a note about why you showed up. Share to your feed or keep it private.',
  },
  {
    icon: 'bi bi-calendar3',
    title: 'Training Plans',
    desc: 'Structured week-by-week plans for every sport and level. Follow a library plan or get one assigned by your coach.',
  },
  {
    icon: 'bi bi-bar-chart-line-fill',
    title: 'Stats & Analytics',
    desc: 'Weekly distance charts, activity breakdowns by sport, monthly progress, and all your key metrics in one view.',
  },
  {
    icon: 'bi bi-trophy-fill',
    title: 'Achievements',
    desc: 'Earn 20+ badges as you hit milestones — first run, century ride, streak goals, and sport-specific records.',
  },
]

const communityFeatures = [
  {
    icon: 'bi bi-people-fill',
    title: 'Clubs',
    desc: 'Join sport-specific clubs with group chat, member rosters, and invite links. Train with people who share your goals.',
  },
  {
    icon: 'bi bi-flag-fill',
    title: 'Challenges',
    desc: 'Enter monthly challenges — distance targets, streak goals, elevation climbs. Leaderboards show where you rank.',
  },
  {
    icon: 'bi bi-collection-fill',
    title: 'Social Feed',
    desc: 'Follow athletes you respect and see their activities and moments in a clean, chronological feed. No algorithmic noise.',
  },
  {
    icon: 'bi bi-chat-dots-fill',
    title: 'Direct Messages',
    desc: 'Message teammates, coaches, or anyone you follow directly in the app. Stay connected without leaving RUNNIT.',
  },
]

const statsFeatures = [
  {
    icon: 'bi bi-lightning-charge-fill',
    title: 'Personal Records',
    desc: 'Automatically tracks your fastest 5K, 10K, half marathon, marathon, and more across every activity you log.',
  },
  {
    icon: 'bi bi-fire',
    title: 'Streaks',
    desc: 'Track your daily training streak. Consistency is the edge — see how many days in a row you\'ve shown up.',
  },
  {
    icon: 'bi bi-graph-up-arrow',
    title: 'Monthly Progress',
    desc: 'Distance, duration, and activity count tracked month over month. See your training volume trend at a glance.',
  },
  {
    icon: 'bi bi-smartwatch',
    title: 'Device Sync',
    desc: 'Connect Garmin, Zwift, Apple Watch, and more to automatically import your workouts without manual logging.',
  },
]

const planPreview = [
  { day: 'MON', workout: 'Easy Run — 3 mi' },
  { day: 'WED', workout: 'Tempo — 4 mi' },
  { day: 'SAT', workout: 'Long Run — 7 mi' },
]

const coachPreview = [
  { name: 'Sarah Chen', plan: '10K Peak Plan' },
  { name: 'Marcus R.', plan: 'Base Builder 12W' },
  { name: 'Priya K.', plan: 'Marathon Prep' },
]

const devices = ['Garmin', 'Apple Watch', 'COROS', 'Wahoo', 'Suunto', 'Zwift', 'Fitbit']
</script>

<style scoped>
.features-page {
  min-height: 100vh;
  background: var(--rk-paper, #ffffff);
  font-family: "Futura PT", Futura, "Century Gothic", "Trebuchet MS", system-ui, sans-serif;
  overflow-x: hidden;
}

/* ── HERO ── */
.hero {
  background: #000;
  color: #fff;
  padding: calc(var(--nav-h, 64px) + 64px) 24px 80px;
}
.hero-inner { max-width: 760px; margin: 0 auto; }
.hero-kicker {
  font-size: 0.68rem;
  letter-spacing: 0.22em;
  font-weight: 700;
  color: rgba(255,255,255,0.45);
  text-transform: uppercase;
  margin-bottom: 20px;
}
.hero-headline {
  font-size: clamp(2.4rem, 6vw, 4.5rem);
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 1.05;
  margin: 0 0 24px;
}
.hero-sub {
  font-size: 1.05rem;
  color: rgba(255,255,255,0.65);
  max-width: 520px;
  line-height: 1.6;
  margin: 0 0 36px;
}
.hero-ctas { display: flex; gap: 12px; flex-wrap: wrap; }
.btn-cta-primary {
  display: inline-block;
  padding: 14px 28px;
  background: #fff; color: #000;
  font-size: 0.82rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
  text-decoration: none; border: none; cursor: pointer;
}
.btn-cta-primary:hover { background: #e5e5e5; }
.btn-cta-ghost {
  display: inline-block;
  padding: 14px 28px;
  background: transparent; color: rgba(255,255,255,0.75);
  font-size: 0.82rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase;
  text-decoration: none; border: 1px solid rgba(255,255,255,0.25);
}
.btn-cta-ghost:hover { color: #fff; border-color: rgba(255,255,255,0.6); }

/* ── SECTION BASE ── */
.feature-section { padding: 80px 24px; background: #fff; }
.feature-section--gray { background: #f5f5f5; }
.section-inner { max-width: 1100px; margin: 0 auto; }
.section-kicker {
  font-size: 0.65rem; font-weight: 700; letter-spacing: 0.20em;
  color: #767676; text-transform: uppercase; margin-bottom: 12px;
}
.section-headline {
  font-size: clamp(1.6rem, 3.5vw, 2.4rem);
  font-weight: 900; letter-spacing: -0.02em;
  color: #000; margin: 0 0 48px;
}

/* ── FEATURE GRID ── */
.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1px;
  background: #E5E5E5;
  border: 1px solid #E5E5E5;
}
.feature-grid--2 {
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
}
.feature-card {
  display: flex; gap: 20px; padding: 28px 24px;
  background: #fff;
}
.feature-card--large { padding: 32px 28px; }
.feature-icon-wrap {
  width: 40px; height: 40px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.feature-icon { font-size: 1.4rem; color: #000; }
.feature-body { flex: 1; }
.feature-title { font-size: 0.95rem; font-weight: 700; color: #000; margin: 0 0 6px; }
.feature-desc { font-size: 0.85rem; color: #767676; line-height: 1.55; margin: 0; }

/* ── EDITORIAL STRIPS ── */
.editorial-strip { padding: 80px 24px; }
.editorial-strip--dark { background: #000; color: #fff; }
.editorial-strip--light { background: #fff; color: #000; }
.editorial-inner {
  max-width: 1100px; margin: 0 auto;
  display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center;
}
.editorial-inner--reversed { direction: rtl; }
.editorial-inner--reversed > * { direction: ltr; }
.editorial-kicker {
  font-size: 0.65rem; font-weight: 700; letter-spacing: 0.20em; text-transform: uppercase;
  margin-bottom: 12px;
}
.editorial-strip--dark .editorial-kicker { color: rgba(255,255,255,0.45); }
.editorial-strip--light .editorial-kicker { color: #767676; }
.editorial-headline {
  font-size: clamp(1.6rem, 3vw, 2.4rem);
  font-weight: 900; letter-spacing: -0.02em; line-height: 1.1; margin: 0 0 20px;
}
.editorial-body {
  font-size: 0.95rem; line-height: 1.65; margin: 0 0 24px;
}
.editorial-strip--dark .editorial-body { color: rgba(255,255,255,0.65); }
.editorial-strip--light .editorial-body { color: #767676; }
.editorial-list {
  list-style: none; padding: 0; margin: 0;
  display: flex; flex-direction: column; gap: 10px;
}
.editorial-list li {
  font-size: 0.88rem; padding-left: 16px; position: relative;
}
.editorial-list li::before {
  content: "—"; position: absolute; left: 0; font-weight: 700;
}
.editorial-strip--dark .editorial-list li { color: rgba(255,255,255,0.75); }
.editorial-strip--dark .editorial-list li::before { color: rgba(255,255,255,0.35); }
.editorial-strip--light .editorial-list li { color: #555; }
.editorial-strip--light .editorial-list li::before { color: #BDBDBD; }

/* ── TRACKER MOCK ── */
.editorial-visual { display: flex; align-items: center; justify-content: center; }
.tracker-mock {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
  padding: 28px;
  width: 100%; max-width: 380px;
}
.tracker-mock-kicker {
  font-size: 0.6rem; font-weight: 700; letter-spacing: 0.20em;
  color: #4ade80; margin-bottom: 24px;
}
.tracker-stat-row { display: flex; gap: 0; margin-bottom: 24px; }
.tracker-stat {
  flex: 1; padding: 0 16px 0 0;
  border-right: 1px solid rgba(255,255,255,0.10);
}
.tracker-stat:last-child { border-right: none; padding-right: 0; padding-left: 16px; }
.tracker-stat:first-child { padding-left: 0; }
.tracker-val { font-size: 2rem; font-weight: 900; color: #fff; line-height: 1; }
.tracker-label { font-size: 0.6rem; font-weight: 700; letter-spacing: 0.12em; color: rgba(255,255,255,0.4); margin-top: 4px; }
.tracker-route-preview { height: 80px; position: relative; overflow: hidden; background: rgba(255,255,255,0.03); }
.route-line {
  position: absolute; top: 40%; left: 0; right: 0; height: 2px; background: rgba(255,255,255,0.2);
}
.route-line::before {
  content: "";
  position: absolute; top: -15px; left: 20%; right: 20%; height: 32px;
  border: 2px solid rgba(255,255,255,0.35); border-radius: 50% 50% 0 0; border-bottom: none;
}

/* ── PLAN MOCK ── */
.plan-mock {
  background: #fff; border: 1px solid #E5E5E5; padding: 24px; width: 100%; max-width: 380px;
}
.plan-mock-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.plan-mock-title { font-size: 0.9rem; font-weight: 700; color: #000; }
.plan-mock-badge { font-size: 0.62rem; font-weight: 700; letter-spacing: 0.10em; color: #767676; text-transform: uppercase; }
.plan-mock-bar-wrap { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
.plan-mock-bar { flex: 1; height: 2px; background: #E5E5E5; }
.plan-mock-fill { height: 100%; background: #000; }
.plan-mock-pct { font-size: 0.72rem; font-weight: 700; color: #767676; }
.plan-mock-workouts { display: flex; flex-direction: column; gap: 10px; }
.plan-mock-row { display: flex; align-items: center; gap: 12px; padding: 10px; background: #f9f9f9; }
.plan-mock-day { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.10em; color: #767676; width: 32px; flex-shrink: 0; }
.plan-mock-workout { font-size: 0.82rem; font-weight: 600; color: #000; }

/* ── COACHING MOCK ── */
.coaching-mock {
  background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);
  padding: 28px; width: 100%; max-width: 380px;
}
.coaching-mock-label { font-size: 0.6rem; font-weight: 700; letter-spacing: 0.20em; color: rgba(255,255,255,0.45); text-transform: uppercase; margin-bottom: 20px; }
.coaching-mock-stats { display: flex; gap: 24px; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.10); }
.coaching-stat { }
.coaching-val { font-size: 1.8rem; font-weight: 900; color: #fff; line-height: 1; }
.coaching-stat-label { font-size: 0.6rem; font-weight: 700; letter-spacing: 0.10em; color: rgba(255,255,255,0.4); margin-top: 4px; }
.coaching-roster { display: flex; flex-direction: column; gap: 12px; }
.coaching-athlete { display: flex; align-items: center; gap: 12px; }
.coaching-avatar { width: 32px; height: 32px; background: rgba(255,255,255,0.15); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; flex-shrink: 0; }
.coaching-name { font-size: 0.82rem; font-weight: 600; color: #fff; }
.coaching-plan { font-size: 0.72rem; color: rgba(255,255,255,0.45); margin-top: 1px; }

/* ── DEVICES STRIP ── */
.devices-strip { background: #f5f5f5; padding: 40px 24px; }
.devices-inner { max-width: 1100px; margin: 0 auto; }
.devices-label { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.20em; color: #767676; text-transform: uppercase; margin-bottom: 16px; }
.devices-list { display: flex; flex-wrap: wrap; gap: 8px; }
.device-pill {
  display: inline-block; padding: 7px 16px;
  background: #fff; border: 1px solid #E5E5E5;
  font-size: 0.78rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #000;
}

/* ── CTA ── */
.cta-section { background: #000; color: #fff; padding: 100px 24px; text-align: center; }
.cta-inner { max-width: 560px; margin: 0 auto; }
.cta-headline { font-size: clamp(1.8rem, 4vw, 3rem); font-weight: 900; letter-spacing: -0.02em; margin: 0 0 16px; }
.cta-sub { font-size: 1rem; color: rgba(255,255,255,0.65); margin: 0 0 36px; line-height: 1.5; }
.cta-fine { font-size: 0.75rem; color: rgba(255,255,255,0.35); margin-top: 16px; }

/* ── RESPONSIVE ── */
@media (max-width: 900px) {
  .editorial-inner { grid-template-columns: 1fr; gap: 40px; }
  .editorial-inner--reversed { direction: ltr; }
  .editorial-visual { order: -1; }
  .tracker-mock, .plan-mock, .coaching-mock { max-width: 100%; }
}
@media (max-width: 600px) {
  .feature-grid, .feature-grid--2 { grid-template-columns: 1fr; }
  .hero { padding-top: calc(var(--nav-h, 64px) + 40px); }
  .tracker-stat-row { gap: 0; }
}
</style>
