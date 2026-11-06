<!-- ========== views/Track.vue ========== -->
<template>
  <div class="page-container tracker-page">
    <header class="record-header">
      <button class="record-back" type="button" @click="handleBack" aria-label="Back to dashboard">
        <i class="bi bi-arrow-left"></i>
      </button>
      <div class="record-header-copy">
        <span>RUNNIT / RECORD</span>
        <h1>Record</h1>
      </div>
      <span class="record-header-status"><i class="bi bi-shield-check"></i> Private by default</span>
    </header>

    <section v-if="!recordMode" class="record-start" aria-labelledby="record-title">
      <div class="record-start-inner">
        <div class="record-intro">
          <p class="record-kicker">Your next mile starts here</p>
          <h2 id="record-title">Record the work.<br><em>Keep the story.</em></h2>
          <p class="record-copy">Track a workout live, start from your plan, or bring in a session from a connected device. Runnit keeps the useful details together after you finish.</p>
        </div>

        <div v-if="activeWorkout" class="planned-record-card">
          <div class="planned-record-eyebrow"><i class="bi bi-calendar-check"></i> Up next from your plan</div>
          <strong>{{ activeWorkout.title || activeWorkout.name || 'Today’s workout' }}</strong>
          <span>{{ activeWorkout.description || 'Follow the workout while Runnit records the session.' }}</span>
        </div>

        <div class="record-action-card">
          <div class="record-action-heading">
            <span class="record-step">01</span>
            <div><strong>Start with your phone</strong><small>GPS route, distance, time, pace, and elevation</small></div>
          </div>
          <button class="record-primary" type="button" @click="beginLive">
            <span class="record-primary-icon"><i class="bi bi-play-fill"></i></span>
            <span>Start recording</span>
            <i class="bi bi-arrow-up-right"></i>
          </button>
          <p class="record-action-note"><i class="bi bi-info-circle"></i> You can pause, resume, and add music or notes when you finish.</p>
        </div>

        <div class="record-secondary-grid" aria-label="Other ways to record">
          <router-link to="/plans" class="record-secondary-card">
            <i class="bi bi-journal-check"></i>
            <span><strong>Follow a plan</strong><small>Choose today’s workout</small></span>
            <i class="bi bi-chevron-right"></i>
          </router-link>
          <router-link to="/devices" class="record-secondary-card">
            <i class="bi bi-link-45deg"></i>
            <span><strong>Connect a device</strong><small>Import Garmin, WHOOP, and more</small></span>
            <i class="bi bi-chevron-right"></i>
          </router-link>
          <router-link to="/dashboard?log=1" class="record-secondary-card">
            <i class="bi bi-pencil-square"></i>
            <span><strong>Log manually</strong><small>Add a finished workout</small></span>
            <i class="bi bi-chevron-right"></i>
          </router-link>
        </div>

        <div class="record-trust-row">
          <span><i class="bi bi-geo-alt"></i> GPS permission is only used while recording</span>
          <span><i class="bi bi-cloud-check"></i> Saved to your training history</span>
        </div>
      </div>
    </section>

      <!-- Workout step guide — only shown when launched from a plan workout -->
      <WorkoutStepGuide
        v-if="recordMode && activeWorkout"
        :workout="activeWorkout"
        :elapsedSeconds="trackingSeconds"
      />

    <LiveTracker
      v-if="recordMode"
      @elapsed="trackingSeconds = $event"
      @discarded="recordMode = ''"
    />

      <ConfirmModal
        v-model="showStopConfirm"
        title="Stop Tracking?"
        body="This ends the session and drops whatever hasn't been saved. No coming back from this one."
        confirm-label="Stop & Exit"
        :danger="true"
        @confirm="doGoBack"
      />
  </div>
</template>

  <script setup>
  import { ref, onMounted } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import LiveTracker from '@/components/LiveTracker.vue'
  import ConfirmModal from '@/components/ConfirmModal.vue'
  import WorkoutStepGuide from '@/components/WorkoutStepGuide.vue'
  import { usePlanStore } from '@/stores/plan'

  const router = useRouter()
  const route = useRoute()
  const planStore = usePlanStore()

  const showStopConfirm = ref(false)
  const recordMode = ref(route.query.workoutId ? 'live' : '')
  // Elapsed seconds forwarded up from LiveTracker via the 'elapsed' emit
  const trackingSeconds = ref(0)
  // The workout object fetched from the plan store, null if not launched from a plan
  const activeWorkout = ref(null)
  const beginLive = () => { recordMode.value = 'live' }

  // On mount, check for workoutId/planId query params and fetch the workout
  onMounted(async () => {
    const { workoutId, planId } = route.query
    if (!workoutId || !planId) return

    try {
      const plan = await planStore.fetchPlan(planId)
      if (!plan) return

      // Walk the weeks → workouts tree to find the matching workout by id
      for (const week of (plan.weeks || [])) {
        const found = (week.workouts || []).find(w => String(w.id) === String(workoutId))
        if (found) {
          activeWorkout.value = found
          break
        }
      }
    } catch {
      // If fetch fails we simply don't show the guide — tracking still works normally
    }
  })

  const handleBack = () => { showStopConfirm.value = true }
  const doGoBack = () => { showStopConfirm.value = false; router.push('/dashboard') }
  </script>
  
  <style scoped>
  .tracker-page {
    background: #FBF6EC;
    font-family: 'Hanken Grotesk', system-ui, sans-serif;
  }

  .page-container {
    min-height: 100vh;
    padding: calc(var(--nav-h, 64px)) 0 40px;
    max-width: 640px;
    margin: 0 auto;
  }

  .page-header {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 20px;
    border-bottom: 2px solid #16130F;
    background: #FBF6EC;
    margin-bottom: 0;
  }

  .btn-back {
    width: 40px;
    height: 40px;
    border-radius: 0;
    border: 2px solid #16130F;
    background: #FBF6EC;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.15s;
    font-size: 1.1rem;
    color: #16130F;
    flex-shrink: 0;
  }

  .btn-back:hover {
    background: #E7DFCE;
  }

  .page-header h1 {
    font-family: 'Big Shoulders Display', system-ui, sans-serif;
    font-weight: 900;
    font-size: 1.6rem;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    margin: 0;
    color: #16130F;
    line-height: 1;
  }

  .record-start { padding: 30px 20px 26px; background: #16130F; color: #FBF6EC; }
  .record-kicker { margin: 0 0 8px; color: #FFC53D; font: 10px 'Spline Sans Mono', monospace; letter-spacing: .14em; text-transform: uppercase; }
  .record-start h2 { margin: 0; font-size: clamp(2rem, 7vw, 3rem); line-height: .95; }
  .record-copy { max-width: 500px; margin: 12px 0 22px; color: rgba(251,246,236,.72); font-size: .86rem; line-height: 1.45; }
  .record-option { display: flex; align-items: center; gap: 12px; width: 100%; margin-top: 9px; padding: 14px; color: #16130F; background: #FBF6EC; border: 2px solid #FBF6EC; text-decoration: none; }
  .record-option:hover { color: #16130F; background: #E6EDFF; text-decoration: none; }
  .record-option--primary { color: #16130F; background: #FFC53D; border-color: #16130F; cursor: pointer; }
  .record-option--primary:hover { background: #F5D547; }
  .record-option i { color: #2A55F5; font-size: 1.3rem; }
  .record-option span { display: flex; flex: 1; flex-direction: column; gap: 3px; text-align: left; }
  .record-option strong { font-size: .88rem; }
  .record-option small { color: #665F55; font-size: .74rem; }
  .record-option b { font-size: 1.1rem; }

  @media (max-width: 640px) {
    .page-container {
      padding: calc(var(--nav-h, 56px)) 0 32px;
    }
    .page-header { padding: 14px 16px; }
    .page-header h1 { font-size: 1.3rem; }
  }

  /* Record flow refinement: one confident start action, quieter secondary paths. */
  .tracker-page.page-container {
    max-width: none;
    padding-bottom: 0;
  }
  .record-header {
    display: flex;
    align-items: center;
    gap: 14px;
    max-width: 1120px;
    margin: 0 auto;
    padding: 18px 28px;
    background: #FBF6EC;
    border-bottom: 1px solid #DED5C4;
  }
  .record-back {
    width: 42px;
    height: 42px;
    border: 1px solid #DED5C4;
    border-radius: 999px;
    background: #fff;
    color: #16130F;
    display: grid;
    place-items: center;
    cursor: pointer;
    transition: background .15s, transform .15s;
  }
  .record-back:hover { background: #EEF1FF; transform: translateX(-2px); }
  .record-header-copy { display: grid; gap: 2px; }
  .record-header-copy > span,
  .record-header-status {
    color: #6B6358;
    font: 700 .6rem/1.2 'Spline Sans Mono', ui-monospace, monospace;
    letter-spacing: .12em;
    text-transform: uppercase;
  }
  .record-header-copy h1 {
    margin: 0;
    color: #16130F;
    font: 900 1.55rem/.9 'Big Shoulders Display', system-ui, sans-serif;
    letter-spacing: .02em;
    text-transform: uppercase;
  }
  .record-header-status {
    margin-left: auto;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    letter-spacing: .03em;
    text-transform: none;
  }
  .record-header-status i { color: #2A55F5; font-size: .9rem; }
  .record-start {
    min-height: calc(100svh - 112px);
    padding: 56px 24px 72px;
    background: #FBF6EC;
    color: #16130F;
  }
  .record-start-inner { max-width: 720px; margin: 0 auto; }
  .record-intro { margin-bottom: 28px; }
  .record-kicker {
    margin: 0 0 14px;
    color: #2A55F5;
    font: 700 .66rem/1.2 'Spline Sans Mono', ui-monospace, monospace;
    letter-spacing: .14em;
    text-transform: uppercase;
  }
  .record-start h2 {
    max-width: 660px;
    margin: 0;
    color: #16130F;
    font: 900 clamp(3.8rem, 9vw, 7rem)/.82 'Big Shoulders Display', system-ui, sans-serif;
    letter-spacing: -.02em;
    text-transform: uppercase;
  }
  .record-start h2 em { color: #2A55F5; font-style: normal; }
  .record-copy {
    max-width: 540px;
    margin: 22px 0 0;
    color: #6B6358;
    font-size: 1rem;
    line-height: 1.55;
  }
  .planned-record-card {
    display: grid;
    gap: 7px;
    margin: 0 0 14px;
    padding: 18px 20px;
    border: 1px solid #C9D3FF;
    border-radius: 18px;
    background: #EEF1FF;
  }
  .planned-record-eyebrow {
    color: #2A55F5;
    font: 700 .62rem/1.2 'Spline Sans Mono', ui-monospace, monospace;
    letter-spacing: .1em;
    text-transform: uppercase;
  }
  .planned-record-card strong { font-size: 1.05rem; }
  .planned-record-card > span { color: #5A6385; font-size: .84rem; line-height: 1.4; }
  .record-action-card {
    padding: 22px;
    border: 1px solid #DED5C4;
    border-radius: 24px;
    background: #fff;
    box-shadow: 0 18px 48px rgba(22,19,15,.09);
  }
  .record-action-heading { display: flex; align-items: center; gap: 12px; margin-bottom: 18px; }
  .record-step {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: #16130F;
    color: #FFC53D;
    display: grid;
    place-items: center;
    font: 800 .7rem/1 'Spline Sans Mono', ui-monospace, monospace;
  }
  .record-action-heading div { display: grid; gap: 3px; }
  .record-action-heading strong { font-size: 1rem; }
  .record-action-heading small { color: #756D62; font-size: .8rem; }
  .record-primary {
    width: 100%;
    min-height: 66px;
    padding: 10px 14px 10px 10px;
    border: 0;
    border-radius: 999px;
    background: #2A55F5;
    color: #fff;
    display: flex;
    align-items: center;
    gap: 12px;
    font: 800 1rem/1 'Hanken Grotesk', system-ui, sans-serif;
    cursor: pointer;
    box-shadow: 0 10px 24px rgba(42,85,245,.24);
    transition: background .15s, transform .15s, box-shadow .15s;
  }
  .record-primary:hover { background: #1E42D6; transform: translateY(-2px); box-shadow: 0 14px 28px rgba(42,85,245,.3); }
  .record-primary > span:nth-child(2) { flex: 1; text-align: left; }
  .record-primary > i { margin-right: 7px; font-size: 1.15rem; }
  .record-primary-icon {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: #fff;
    color: #2A55F5;
    display: grid;
    place-items: center;
    font-size: 1.25rem;
  }
  .record-action-note { display: flex; align-items: center; gap: 6px; margin: 14px 2px 0; color: #756D62; font-size: .76rem; }
  .record-action-note i { color: #2A55F5; }
  .record-secondary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 14px; }
  .record-secondary-card {
    min-height: 112px;
    padding: 16px;
    border: 1px solid #DED5C4;
    border-radius: 18px;
    background: rgba(255,255,255,.62);
    color: #16130F;
    display: flex;
    flex-direction: column;
    gap: 10px;
    text-decoration: none;
    transition: background .15s, transform .15s, box-shadow .15s;
  }
  .record-secondary-card:hover { color: #16130F; background: #fff; transform: translateY(-3px); box-shadow: 0 12px 28px rgba(22,19,15,.08); }
  .record-secondary-card > i:first-child { color: #2A55F5; font-size: 1.1rem; }
  .record-secondary-card span { display: grid; gap: 3px; flex: 1; }
  .record-secondary-card strong { font-size: .85rem; }
  .record-secondary-card small { color: #756D62; font-size: .7rem; line-height: 1.3; }
  .record-secondary-card > i:last-child { align-self: flex-end; color: #AAA091; font-size: .75rem; }
  .record-trust-row { display: flex; flex-wrap: wrap; gap: 12px 22px; margin-top: 22px; color: #81786B; font-size: .72rem; }
  .record-trust-row span { display: inline-flex; align-items: center; gap: 6px; }
  .record-trust-row i { color: #2A55F5; }
  @media (max-width: 640px) {
    .record-header { padding: 14px 16px; }
    .record-header-status { display: none; }
    .record-start { min-height: calc(100svh - 80px); padding: 42px 16px 54px; }
    .record-start h2 { font-size: clamp(3.35rem, 18vw, 5rem); }
    .record-copy { font-size: .9rem; }
    .record-action-card { padding: 16px; border-radius: 20px; }
    .record-secondary-grid { grid-template-columns: 1fr; }
    .record-secondary-card { min-height: 0; flex-direction: row; align-items: center; padding: 14px 16px; }
    .record-secondary-card > i:last-child { align-self: center; }
    .record-trust-row { display: grid; gap: 8px; }
  }
  </style>
