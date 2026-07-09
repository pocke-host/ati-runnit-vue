<!-- ========== views/Track.vue ========== -->
<template>
    <div class="page-container tracker-page">
      <div class="page-header">
        <button class="btn-back" @click="handleBack">
          <i class="bi bi-arrow-left"></i>
        </button>
        <h1>Live Tracking</h1>
      </div>

      <!-- Workout step guide — only shown when launched from a plan workout -->
      <WorkoutStepGuide
        v-if="activeWorkout"
        :workout="activeWorkout"
        :elapsedSeconds="trackingSeconds"
      />

      <LiveTracker @elapsed="trackingSeconds = $event" />

      <ConfirmModal
        v-model="showStopConfirm"
        title="Stop Tracking?"
        body="Your current session will end and you'll return to the dashboard. Any unsaved data will be lost."
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
  // Elapsed seconds forwarded up from LiveTracker via the 'elapsed' emit
  const trackingSeconds = ref(0)
  // The workout object fetched from the plan store, null if not launched from a plan
  const activeWorkout = ref(null)

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
    background: #16130F;
  }

  .page-container {
    min-height: 100vh;
    padding: var(--nav-h, 66px) 0 0;
    max-width: 600px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
  }

  .page-header {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 20px;
    background: #16130F;
    border-bottom: 1px solid rgba(251,246,236,0.1);
    flex-shrink: 0;
  }

  .btn-back {
    width: 40px;
    height: 40px;
    border: 2px solid rgba(251,246,236,0.25);
    background: transparent;
    color: #FBF6EC;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 1.1rem;
    transition: border-color 0.15s;
    flex-shrink: 0;
  }
  .btn-back:hover { border-color: #FBF6EC; }

  .page-header h1 {
    font-family: 'Big Shoulders Display', system-ui, sans-serif;
    font-weight: 900;
    font-size: 1.5rem;
    text-transform: uppercase;
    letter-spacing: 0.02em;
    margin: 0;
    color: #FBF6EC;
    line-height: 1;
  }

  @media (max-width: 600px) {
    .page-header h1 { font-size: 1.2rem; }
  }
  </style>