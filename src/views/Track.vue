<!-- ========== views/Track.vue ========== -->
<template>
    <div class="page-container tracker-page">
      <div class="page-header">
        <button class="btn-back" @click="handleBack">
          <i class="bi bi-arrow-left"></i>
        </button>
        <h1>Live Tracking</h1>
      </div>

      <section v-if="!recordMode" class="record-start" aria-labelledby="record-title">
        <p class="record-kicker">Start a session</p>
        <h2 id="record-title">How do you want to record today?</h2>
        <p class="record-copy">Choose the path that matches where your workout lives. You can add notes, effort, and a training folder after you finish.</p>
        <button class="record-option record-option--primary" type="button" @click="beginLive">
          <i class="bi bi-play-circle"></i><span><strong>Start GPS tracking</strong><small>Record this activity live with your phone</small></span><b>→</b>
        </button>
        <router-link to="/devices" class="record-option">
          <i class="bi bi-cloud-arrow-down"></i><span><strong>Import from a device</strong><small>Connect Garmin, COROS, WHOOP, or import a file</small></span><b>→</b>
        </router-link>
        <router-link to="/plans" class="record-option">
          <i class="bi bi-journal-check"></i><span><strong>Start from a plan</strong><small>Choose today’s scheduled workout</small></span><b>→</b>
        </router-link>
        <router-link to="/dashboard?log=1" class="record-option">
          <i class="bi bi-pencil-square"></i><span><strong>Log manually</strong><small>Add an activity from your watch, memory, or notes</small></span><b>→</b>
        </router-link>
      </section>

      <!-- Workout step guide — only shown when launched from a plan workout -->
      <WorkoutStepGuide
        v-if="recordMode && activeWorkout"
        :workout="activeWorkout"
        :elapsedSeconds="trackingSeconds"
      />

      <LiveTracker v-if="recordMode" @elapsed="trackingSeconds = $event" />

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
  </style>
