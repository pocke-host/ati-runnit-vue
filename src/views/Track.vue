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

  @media (max-width: 640px) {
    .page-container {
      padding: calc(var(--nav-h, 56px)) 0 32px;
    }
    .page-header { padding: 14px 16px; }
    .page-header h1 { font-size: 1.3rem; }
  }
  </style>