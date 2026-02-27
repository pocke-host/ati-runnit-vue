<template>
  <main class="plan-detail-page" v-if="plan">
    <!-- Hero -->
    <div class="plan-hero" :style="{ background: sportGradient(plan.sport) }">
      <div class="container-xxl">
        <button class="btn-back" @click="$router.back()"><i class="bi bi-arrow-left"></i></button>
        <div class="coach-info">
          <div class="coach-avatar-lg">{{ plan.coachName?.[0] || 'R' }}</div>
          <div>
            <div class="coach-name">{{ plan.coachName || 'RUNNIT Coach' }}</div>
            <div v-if="plan.coachVerified" class="verified-row"><i class="bi bi-patch-check-fill"></i> Verified Coach</div>
          </div>
        </div>
        <h1>{{ plan.name }}</h1>
        <p class="plan-sub">{{ plan.description }}</p>
        <div class="hero-chips">
          <span class="chip"><i class="bi bi-calendar3"></i> {{ plan.durationWeeks }} weeks</span>
          <span class="chip"><i class="bi bi-person-walking"></i> {{ plan.sport }}</span>
          <span class="chip"><i class="bi bi-bar-chart-fill"></i> {{ plan.level }}</span>
          <span class="chip"><i class="bi bi-people-fill"></i> {{ plan.enrolledCount?.toLocaleString() }} athletes</span>
        </div>
      </div>
    </div>

    <div class="container-xxl content-grid">
      <!-- Left: Schedule -->
      <div class="schedule-col">
        <div class="section-card">
          <h2>Weekly Schedule</h2>
          <p class="ai-note"><i class="bi bi-robot"></i> AI adjusts your workouts each week based on progress</p>

          <div v-for="week in weeks" :key="week.number" class="week-block">
            <div class="week-header" @click="week.open = !week.open">
              <div>
                <span class="week-label">Week {{ week.number }}</span>
                <span class="week-focus">{{ week.focus }}</span>
              </div>
              <div class="week-meta">
                <span>{{ week.totalKm }} km</span>
                <i :class="`bi bi-chevron-${week.open ? 'up' : 'down'}`"></i>
              </div>
            </div>

            <div v-if="week.open" class="workouts-list">
              <div v-for="workout in week.workouts" :key="workout.day" class="workout-row">
                <div class="workout-day">{{ workout.day }}</div>
                <div class="workout-info">
                  <div class="workout-name">{{ workout.name }}</div>
                  <div class="workout-details">{{ workout.details }}</div>
                </div>
                <div :class="['workout-type-badge', workout.type]">{{ workout.type }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tags -->
        <div class="section-card tags-card">
          <h3>Workout Tags</h3>
          <div class="tags-grid">
            <span v-for="tag in plan.tags || defaultTags" :key="tag" class="tag-pill">{{ tag }}</span>
          </div>
        </div>
      </div>

      <!-- Right: Enroll + Reviews -->
      <div class="sidebar-col">
        <!-- Enroll Card -->
        <div class="enroll-card" v-if="!enrolled">
          <div class="price-row">
            <span class="price">{{ plan.price === 0 ? 'Free' : `$${plan.price}/mo` }}</span>
            <span class="trial-note" v-if="plan.price > 0">7-day free trial</span>
          </div>
          <ul class="perks-list">
            <li><i class="bi bi-check-circle-fill"></i> AI-adaptive weekly updates</li>
            <li><i class="bi bi-check-circle-fill"></i> Coach messaging</li>
            <li><i class="bi bi-check-circle-fill"></i> Group community access</li>
            <li><i class="bi bi-check-circle-fill"></i> Progress analytics</li>
          </ul>
          <button class="btn btn-primary btn-full" @click="enroll" :disabled="enrolling">
            <span v-if="enrolling" class="spinner-border spinner-border-sm"></span>
            {{ enrolling ? 'Enrolling…' : plan.price === 0 ? 'Start Free Plan' : 'Start Free Trial' }}
          </button>
          <p class="cancel-note" v-if="plan.price > 0">Cancel anytime. 70% goes to the coach.</p>
        </div>

        <div class="enrolled-card" v-else>
          <i class="bi bi-check-circle-fill"></i>
          <h3>You're enrolled!</h3>
          <router-link to="/dashboard" class="btn btn-primary btn-full">Go to Dashboard</router-link>
        </div>

        <!-- Reviews -->
        <div class="section-card reviews-card">
          <div class="rating-header">
            <span class="big-rating">{{ plan.rating?.toFixed(1) || '4.8' }}</span>
            <div>
              <div class="stars">
                <i v-for="n in 5" :key="n" :class="`bi bi-star${n <= Math.round(plan.rating || 4.8) ? '-fill' : ''}`"></i>
              </div>
              <div class="review-count">{{ plan.reviewCount || 128 }} reviews</div>
            </div>
          </div>
          <div v-for="review in sampleReviews" :key="review.author" class="review-item">
            <div class="review-header">
              <span class="review-author">{{ review.author }}</span>
              <div class="review-stars">
                <i v-for="n in 5" :key="n" class="bi bi-star-fill"></i>
              </div>
            </div>
            <p>"{{ review.text }}"</p>
          </div>
        </div>
      </div>
    </div>
  </main>

  <div v-else class="loading-page">
    <div class="spinner-border text-success"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useTrainingStore } from '@/stores/training'

const route = useRoute()
const trainingStore = useTrainingStore()

const plan = ref(null)
const enrolled = ref(false)
const enrolling = ref(false)

const defaultTags = ['Recovery', 'Tempo', 'Long Run', 'Interval', 'Easy', 'Brick', 'Threshold']
const sampleReviews = [
  { author: 'Marcus T.', text: 'The AI adjustments every week kept me from over-training. PR at my first half marathon!' },
  { author: 'Priya N.', text: 'Best structured plan I have followed. Coach feedback was incredibly helpful.' },
]

const weeks = ref([
  {
    number: 1, focus: 'Base Building', totalKm: 32, open: true,
    workouts: [
      { day: 'Mon', name: 'Easy Run', details: '5 km @ easy pace', type: 'easy' },
      { day: 'Wed', name: 'Tempo Run', details: '8 km with 4 km @ threshold', type: 'tempo' },
      { day: 'Thu', name: 'Recovery Run', details: '4 km very easy', type: 'recovery' },
      { day: 'Sat', name: 'Long Run', details: '15 km steady', type: 'long' },
    ]
  },
  {
    number: 2, focus: 'Aerobic Development', totalKm: 38, open: false,
    workouts: [
      { day: 'Mon', name: 'Easy Run', details: '6 km @ easy pace', type: 'easy' },
      { day: 'Tue', name: 'Intervals', details: '6×800m @ 5K pace', type: 'interval' },
      { day: 'Thu', name: 'Tempo Run', details: '10 km with 5 km @ threshold', type: 'tempo' },
      { day: 'Sat', name: 'Long Run', details: '17 km steady', type: 'long' },
    ]
  },
  {
    number: 3, focus: 'Speed Work', totalKm: 42, open: false,
    workouts: [
      { day: 'Mon', name: 'Easy Run', details: '6 km @ easy pace', type: 'easy' },
      { day: 'Tue', name: 'Track Intervals', details: '8×400m @ 1-mile pace', type: 'interval' },
      { day: 'Thu', name: 'Progression Run', details: '10 km negative split', type: 'tempo' },
      { day: 'Sat', name: 'Long Run', details: '19 km + 5 km marathon pace', type: 'long' },
    ]
  },
])

const sportGradient = (sport) => {
  const map = {
    running: 'linear-gradient(135deg, #2C3726 0%, #5A6B4E 100%)',
    cycling: 'linear-gradient(135deg, #1e3a8a, #1e40af)',
    swimming: 'linear-gradient(135deg, #164e63, #0e7490)',
    triathlon: 'linear-gradient(135deg, #7c2d12, #C46A2A)',
    hiking: 'linear-gradient(135deg, #365314, #4d7c0f)',
  }
  return map[sport] || 'linear-gradient(135deg, #111827, #374151)'
}

const enroll = async () => {
  enrolling.value = true
  try {
    await trainingStore.enrollPlan(plan.value.id)
    enrolled.value = true
  } catch {
    enrolled.value = true // optimistic for demo
  } finally {
    enrolling.value = false
  }
}

onMounted(async () => {
  try {
    plan.value = await trainingStore.fetchPlanById(route.params.id)
  } catch {
    // fallback mock
    plan.value = {
      id: route.params.id,
      name: '10K Improvement Plan',
      sport: 'running',
      level: 'intermediate',
      durationWeeks: 10,
      price: 12,
      enrolledCount: 2800,
      rating: 4.8,
      reviewCount: 128,
      coachName: 'Coach Elena',
      coachVerified: true,
      description: 'Structured sessions to get you faster with tempo runs and intervals. AI adjusts weekly based on your HRV and completed workouts.',
      tags: ['Tempo', 'Intervals', 'Recovery', 'Long Run', 'Easy', 'Threshold', 'Race Pace']
    }
  }
})
</script>

<style scoped>
.plan-detail-page { background: #F5F6F3; min-height: 100vh; }

.plan-hero { padding: 80px 0 40px; color: white; }
.btn-back { width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,.15); border: 1px solid rgba(255,255,255,.25); color: white; font-size: 1.1rem; cursor: pointer; margin-bottom: 24px; display: flex; align-items: center; justify-content: center; }

.coach-info { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
.coach-avatar-lg { width: 44px; height: 44px; border-radius: 50%; background: rgba(255,255,255,.2); color: white; font-weight: 900; font-size: 1.1rem; display: flex; align-items: center; justify-content: center; }
.coach-name { font-weight: 800; font-size: .95rem; }
.verified-row { font-size: .8rem; color: rgba(255,255,255,.75); display: flex; align-items: center; gap: 4px; }
.verified-row i { color: #38bdf8; }

.plan-hero h1 { font-size: 2.5rem; font-weight: 900; margin-bottom: 12px; }
.plan-sub { color: rgba(255,255,255,.78); font-size: 1rem; max-width: 560px; margin-bottom: 20px; }
.hero-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.chip { padding: 6px 14px; border-radius: 999px; background: rgba(255,255,255,.15); border: 1px solid rgba(255,255,255,.2); font-size: .82rem; font-weight: 700; display: flex; align-items: center; gap: 6px; }

.content-grid { display: grid; grid-template-columns: 1fr 340px; gap: 24px; padding: 32px 24px 64px; }

.section-card { background: white; border-radius: 20px; border: 1px solid rgba(15,18,16,.08); padding: 24px; margin-bottom: 20px; }
.section-card h2 { font-weight: 900; font-size: 1.2rem; margin-bottom: 6px; }
.section-card h3 { font-weight: 900; font-size: 1rem; margin-bottom: 14px; }
.ai-note { font-size: .85rem; color: #10b981; font-weight: 600; display: flex; align-items: center; gap: 6px; margin-bottom: 20px; }

.week-block { border: 1px solid rgba(15,18,16,.08); border-radius: 14px; margin-bottom: 10px; overflow: hidden; }
.week-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; cursor: pointer; background: rgba(15,18,16,.02); }
.week-header:hover { background: rgba(15,18,16,.04); }
.week-label { font-weight: 900; font-size: .95rem; margin-right: 10px; }
.week-focus { font-size: .82rem; color: #6b7280; font-weight: 600; }
.week-meta { display: flex; align-items: center; gap: 12px; font-size: .85rem; font-weight: 700; color: #6b7280; }

.workouts-list { border-top: 1px solid rgba(15,18,16,.06); }
.workout-row { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-bottom: 1px solid rgba(15,18,16,.04); }
.workout-row:last-child { border-bottom: none; }
.workout-day { font-weight: 900; font-size: .8rem; width: 36px; color: #9ca3af; }
.workout-info { flex: 1; }
.workout-name { font-weight: 700; font-size: .9rem; }
.workout-details { font-size: .8rem; color: #6b7280; }
.workout-type-badge { padding: 3px 10px; border-radius: 999px; font-size: .7rem; font-weight: 800; text-transform: uppercase; }
.workout-type-badge.easy { background: rgba(16,185,129,.1); color: #047857; }
.workout-type-badge.tempo { background: rgba(245,158,11,.1); color: #b45309; }
.workout-type-badge.interval { background: rgba(239,68,68,.1); color: #b91c1c; }
.workout-type-badge.recovery { background: rgba(99,102,241,.1); color: #4338ca; }
.workout-type-badge.long { background: rgba(15,18,16,.08); color: #374151; }

.tags-card { }
.tags-grid { display: flex; flex-wrap: wrap; gap: 8px; }
.tag-pill { padding: 6px 14px; border-radius: 999px; background: rgba(90,107,78,.1); border: 1px solid rgba(90,107,78,.2); font-size: .8rem; font-weight: 700; color: #2C3726; }

.enroll-card, .enrolled-card { background: white; border-radius: 20px; border: 1px solid rgba(15,18,16,.08); padding: 24px; margin-bottom: 20px; box-shadow: 0 8px 32px rgba(15,18,16,.08); }
.price-row { display: flex; align-items: baseline; gap: 10px; margin-bottom: 16px; }
.price { font-size: 2rem; font-weight: 900; color: #C46A2A; }
.trial-note { font-size: .8rem; color: #6b7280; font-weight: 600; }
.perks-list { list-style: none; padding: 0; margin: 0 0 20px; }
.perks-list li { display: flex; align-items: center; gap: 8px; font-size: .9rem; font-weight: 600; padding: 6px 0; }
.perks-list i { color: #10b981; }
.cancel-note { font-size: .78rem; color: #9ca3af; text-align: center; margin: 12px 0 0; }
.enrolled-card { text-align: center; }
.enrolled-card i { font-size: 2.5rem; color: #10b981; display: block; margin-bottom: 12px; }
.enrolled-card h3 { font-weight: 900; margin-bottom: 16px; }

.reviews-card { }
.rating-header { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid rgba(15,18,16,.06); }
.big-rating { font-size: 3rem; font-weight: 900; }
.stars i { color: #f59e0b; font-size: 1rem; }
.review-count { font-size: .8rem; color: #6b7280; margin-top: 2px; }
.review-item { padding: 14px 0; border-top: 1px solid rgba(15,18,16,.06); }
.review-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.review-author { font-weight: 800; font-size: .9rem; }
.review-stars i { color: #f59e0b; font-size: .75rem; }
.review-item p { font-size: .875rem; color: #4b5563; margin: 0; }

.btn { border-radius: 14px; font-weight: 800; padding: 12px 20px; cursor: pointer; border: none; transition: all .2s; display: inline-flex; align-items: center; justify-content: center; gap: 8px; text-decoration: none; }
.btn-primary { background: #C46A2A; color: white; }
.btn-primary:hover:not(:disabled) { background: #a85722; }
.btn-primary:disabled { opacity: .6; cursor: not-allowed; }
.btn-full { width: 100%; }

.loading-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; }

@media (max-width: 900px) {
  .content-grid { grid-template-columns: 1fr; }
  .sidebar-col { order: -1; }
  .plan-hero h1 { font-size: 1.8rem; }
}
</style>
