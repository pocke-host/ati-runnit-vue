<template>
  <main class="training-page">
    <div class="page-hero">
      <div class="container-xxl">
        <p class="eyebrow">Adaptive Training</p>
        <h1>Plans built around <span class="accent">you</span></h1>
        <p class="sub">AI adjusts volume, intensity, and recovery every week based on your progress and goals.</p>
      </div>
    </div>

    <!-- Active Plan Banner -->
    <div v-if="activePlan" class="active-plan-banner container-xxl">
      <div class="active-plan-card">
        <div>
          <div class="badge-label">Your Active Plan</div>
          <h3>{{ activePlan.name }}</h3>
          <p>Week {{ activePlan.currentWeek }} of {{ activePlan.totalWeeks }} · {{ activePlan.sport }}</p>
        </div>
        <router-link :to="`/training/${activePlan.id}`" class="btn btn-primary">Continue</router-link>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-bar container-xxl">
      <button
        v-for="sport in sports"
        :key="sport.value"
        :class="['filter-chip', { active: selectedSport === sport.value }]"
        @click="selectedSport = sport.value; loadPlans()"
      >
        <i :class="`bi ${sport.icon}`"></i> {{ sport.label }}
      </button>

      <div class="filter-sep"></div>

      <select v-model="selectedLevel" class="filter-select" @change="loadPlans">
        <option value="">All Levels</option>
        <option value="beginner">Beginner</option>
        <option value="intermediate">Intermediate</option>
        <option value="advanced">Advanced</option>
      </select>

      <select v-model="selectedDuration" class="filter-select" @change="loadPlans">
        <option value="">Any Length</option>
        <option value="4">4 Weeks</option>
        <option value="8">8 Weeks</option>
        <option value="12">12 Weeks</option>
        <option value="16">16+ Weeks</option>
      </select>
    </div>

    <!-- Plans Grid -->
    <div class="container-xxl plans-section">
      <div v-if="loading" class="loading-grid">
        <div v-for="n in 6" :key="n" class="plan-skeleton"></div>
      </div>

      <div v-else-if="displayPlans.length" class="plans-grid">
        <article
          v-for="plan in displayPlans"
          :key="plan.id"
          class="plan-card"
          @click="$router.push(`/training/${plan.id}`)"
        >
          <div class="plan-art" :style="{ background: sportGradient(plan.sport) }">
            <i :class="`bi ${sportIcon(plan.sport)} plan-sport-icon`"></i>
            <div v-if="plan.coachVerified" class="verified-badge">
              <i class="bi bi-patch-check-fill"></i> Verified Coach
            </div>
          </div>
          <div class="plan-body">
            <div class="plan-meta">
              <span class="level-chip" :class="plan.level">{{ plan.level }}</span>
              <span class="sport-chip">{{ plan.sport }}</span>
            </div>
            <h3>{{ plan.name }}</h3>
            <p class="plan-desc">{{ plan.description }}</p>
            <div class="plan-stats">
              <span><i class="bi bi-calendar3"></i> {{ plan.durationWeeks }} wks</span>
              <span><i class="bi bi-person-fill"></i> {{ plan.enrolledCount?.toLocaleString() || 0 }} athletes</span>
              <span><i class="bi bi-star-fill"></i> {{ plan.rating?.toFixed(1) || '4.8' }}</span>
            </div>
            <div class="plan-footer">
              <div class="coach-row">
                <div class="coach-avatar">{{ plan.coachName?.[0] || 'R' }}</div>
                <span class="coach-name">{{ plan.coachName || 'RUNNIT Coach' }}</span>
              </div>
              <div class="plan-price">
                <span v-if="plan.price === 0">Free</span>
                <span v-else>${{ plan.price }}/mo</span>
              </div>
            </div>
          </div>
        </article>
      </div>

      <div v-else class="empty-state">
        <i class="bi bi-clipboard-x"></i>
        <p>No plans match your filters</p>
        <button class="btn btn-outline-dark" @click="selectedSport = ''; selectedLevel = ''; loadPlans()">Clear Filters</button>
      </div>
    </div>

    <!-- Become a Coach CTA -->
    <section class="coach-cta container-xxl">
      <div class="cta-card">
        <div>
          <h3>Are you a verified coach or athlete?</h3>
          <p>Host your training plans and earn 70% of every subscription on RUNNIT.</p>
        </div>
        <router-link to="/coaches/apply" class="btn btn-primary">Apply to Coach</router-link>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTrainingStore } from '@/stores/training'

const trainingStore = useTrainingStore()

const selectedSport = ref('')
const selectedLevel = ref('')
const selectedDuration = ref('')
const loading = ref(false)

const activePlan = ref(null)

const sports = [
  { value: '', label: 'All', icon: 'bi-grid-fill' },
  { value: 'running', label: 'Running', icon: 'bi-person-walking' },
  { value: 'cycling', label: 'Cycling', icon: 'bi-bicycle' },
  { value: 'swimming', label: 'Swimming', icon: 'bi-water' },
  { value: 'triathlon', label: 'Triathlon', icon: 'bi-lightning-charge-fill' },
  { value: 'hiking', label: 'Hiking', icon: 'bi-tree-fill' },
]

const mockPlans = [
  { id: '1', name: 'Beginner 5K', sport: 'running', level: 'beginner', durationWeeks: 8, price: 0, enrolledCount: 4200, rating: 4.9, coachName: 'RUNNIT Coach', coachVerified: false, description: 'Go from couch to your first 5K with a proven, progressive plan.' },
  { id: '2', name: '10K Improvement Plan', sport: 'running', level: 'intermediate', durationWeeks: 10, price: 12, enrolledCount: 2800, rating: 4.8, coachName: 'Coach Elena', coachVerified: true, description: 'Structured sessions to get you faster with tempo runs and intervals.' },
  { id: '3', name: 'Half Marathon Performance', sport: 'running', level: 'intermediate', durationWeeks: 12, price: 15, enrolledCount: 1900, rating: 4.7, coachName: 'Marcus Ortiz', coachVerified: true, description: 'Balance volume and recovery across 12 weeks to nail your half.' },
  { id: '4', name: 'Marathon 3:30 Target', sport: 'running', level: 'advanced', durationWeeks: 16, price: 20, enrolledCount: 980, rating: 4.9, coachName: 'Coach Yuki', coachVerified: true, description: 'Periodized marathon training for runners targeting sub 3:30.' },
  { id: '5', name: 'Sprint Triathlon Prep', sport: 'triathlon', level: 'beginner', durationWeeks: 12, price: 18, enrolledCount: 650, rating: 4.6, coachName: 'RUNNIT Coach', coachVerified: false, description: 'Swim, bike, run — all three disciplines covered in one adaptive plan.' },
  { id: '6', name: 'Ironman Base Build', sport: 'triathlon', level: 'advanced', durationWeeks: 20, price: 25, enrolledCount: 310, rating: 4.9, coachName: 'Coach Diane', coachVerified: true, description: 'Build your aerobic engine for Ironman distance with structured periodization.' },
]

const displayPlans = computed(() => {
  let result = trainingStore.plans.length ? trainingStore.plans : mockPlans
  if (selectedSport.value) result = result.filter(p => p.sport === selectedSport.value)
  if (selectedLevel.value) result = result.filter(p => p.level === selectedLevel.value)
  if (selectedDuration.value) result = result.filter(p => p.durationWeeks <= parseInt(selectedDuration.value) + 4)
  return result
})

const sportGradient = (sport) => {
  const map = {
    running: 'linear-gradient(135deg, #5A6B4E, #2C3726)',
    cycling: 'linear-gradient(135deg, #1e40af, #1e3a8a)',
    swimming: 'linear-gradient(135deg, #0e7490, #164e63)',
    triathlon: 'linear-gradient(135deg, #C46A2A, #7c2d12)',
    hiking: 'linear-gradient(135deg, #4d7c0f, #365314)',
  }
  return map[sport] || 'linear-gradient(135deg, #374151, #111827)'
}

const sportIcon = (sport) => {
  const map = { running: 'bi-person-walking', cycling: 'bi-bicycle', swimming: 'bi-water', triathlon: 'bi-lightning-charge-fill', hiking: 'bi-tree-fill' }
  return map[sport] || 'bi-trophy-fill'
}

const loadPlans = async () => {
  loading.value = true
  await trainingStore.fetchPlans({ sport: selectedSport.value, level: selectedLevel.value })
  loading.value = false
}

onMounted(async () => {
  await trainingStore.fetchActivePlan()
  activePlan.value = trainingStore.activePlan
})
</script>

<style scoped>
.training-page { background: #F5F6F3; min-height: 100vh; padding-bottom: 80px; }

.page-hero {
  background: linear-gradient(135deg, #2C3726, #5A6B4E);
  padding: 100px 0 56px;
  color: white;
}
.eyebrow { font-size: .85rem; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; color: rgba(190,231,194,.8); margin-bottom: 8px; }
.page-hero h1 { font-size: 3rem; font-weight: 900; margin-bottom: 12px; }
.accent { color: #BEE7C2; }
.sub { font-size: 1.1rem; color: rgba(255,255,255,.75); max-width: 520px; }

.active-plan-banner { margin: -24px auto 0; padding: 0 24px; position: relative; z-index: 2; }
.active-plan-card {
  background: white;
  border-radius: 16px;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 8px 32px rgba(15,18,16,.12);
  border: 1px solid rgba(15,18,16,.08);
}
.active-plan-card h3 { font-weight: 900; font-size: 1.1rem; margin: 4px 0; }
.active-plan-card p { color: #6b7280; font-size: .9rem; margin: 0; }
.badge-label { font-size: .75rem; font-weight: 800; color: #10b981; letter-spacing: .08em; text-transform: uppercase; }

.filters-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  padding: 28px 24px 8px;
}
.filter-chip {
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid rgba(15,18,16,.14);
  background: white;
  font-weight: 700;
  font-size: .875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all .2s;
}
.filter-chip.active, .filter-chip:hover { background: #2C3726; color: white; border-color: #2C3726; }
.filter-sep { flex: 1; }
.filter-select {
  padding: 8px 14px;
  border-radius: 12px;
  border: 1px solid rgba(15,18,16,.14);
  background: white;
  font-weight: 700;
  font-size: .875rem;
  cursor: pointer;
}

.plans-section { padding: 24px; }
.plans-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
.loading-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
.plan-skeleton { height: 380px; border-radius: 20px; background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%); animation: shimmer 1.5s infinite; }
@keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }

.plan-card {
  background: white;
  border-radius: 20px;
  border: 1px solid rgba(15,18,16,.08);
  overflow: hidden;
  cursor: pointer;
  transition: all .2s;
  box-shadow: 0 4px 16px rgba(15,18,16,.06);
}
.plan-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(15,18,16,.14); }

.plan-art { height: 140px; position: relative; display: flex; align-items: flex-end; padding: 16px; }
.plan-sport-icon { font-size: 2.5rem; color: rgba(255,255,255,.4); margin-left: auto; }
.verified-badge { position: absolute; top: 12px; left: 12px; background: rgba(255,255,255,.15); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,.25); border-radius: 999px; padding: 4px 10px; font-size: .75rem; font-weight: 700; color: white; display: flex; align-items: center; gap: 4px; }
.verified-badge i { color: #38bdf8; }

.plan-body { padding: 20px; }
.plan-meta { display: flex; gap: 6px; margin-bottom: 10px; }
.level-chip { padding: 3px 10px; border-radius: 999px; font-size: .72rem; font-weight: 800; text-transform: uppercase; letter-spacing: .06em; }
.level-chip.beginner { background: rgba(16,185,129,.12); color: #047857; }
.level-chip.intermediate { background: rgba(245,158,11,.12); color: #b45309; }
.level-chip.advanced { background: rgba(239,68,68,.12); color: #b91c1c; }
.sport-chip { padding: 3px 10px; border-radius: 999px; font-size: .72rem; font-weight: 800; background: rgba(15,18,16,.06); color: rgba(15,18,16,.65); text-transform: capitalize; }

.plan-card h3 { font-weight: 900; font-size: 1.05rem; margin-bottom: 6px; }
.plan-desc { color: #6b7280; font-size: .875rem; margin-bottom: 12px; line-height: 1.5; }
.plan-stats { display: flex; gap: 12px; font-size: .8rem; color: #9ca3af; font-weight: 600; margin-bottom: 14px; }
.plan-stats i { color: #C46A2A; margin-right: 3px; }

.plan-footer { display: flex; align-items: center; justify-content: space-between; border-top: 1px solid rgba(15,18,16,.06); padding-top: 12px; }
.coach-row { display: flex; align-items: center; gap: 8px; }
.coach-avatar { width: 28px; height: 28px; border-radius: 50%; background: #5A6B4E; color: white; font-weight: 900; font-size: .75rem; display: flex; align-items: center; justify-content: center; }
.coach-name { font-size: .8rem; font-weight: 700; color: rgba(15,18,16,.70); }
.plan-price { font-weight: 900; font-size: .95rem; color: #C46A2A; }

.empty-state { text-align: center; padding: 80px 20px; color: #9ca3af; }
.empty-state i { font-size: 3rem; display: block; margin-bottom: 16px; }

.coach-cta { padding: 0 24px 40px; }
.cta-card { background: linear-gradient(135deg, #2C3726, #5A6B4E); border-radius: 20px; padding: 32px; display: flex; align-items: center; justify-content: space-between; gap: 20px; color: white; }
.cta-card h3 { font-weight: 900; font-size: 1.2rem; margin-bottom: 6px; }
.cta-card p { color: rgba(255,255,255,.75); margin: 0; font-size: .9rem; }

.btn { border-radius: 14px; font-weight: 800; padding: 10px 20px; cursor: pointer; border: none; transition: all .2s; display: inline-flex; align-items: center; gap: 6px; text-decoration: none; white-space: nowrap; }
.btn-primary { background: #C46A2A; color: white; }
.btn-primary:hover { background: #a85722; }
.btn-outline-dark { background: white; color: #0F1210; border: 1px solid rgba(15,18,16,.18); }
.btn-outline-dark:hover { background: #f9fafb; }

@media (max-width: 768px) {
  .page-hero { padding: 80px 0 40px; }
  .page-hero h1 { font-size: 2rem; }
  .active-plan-card { flex-direction: column; align-items: flex-start; gap: 12px; }
  .cta-card { flex-direction: column; align-items: flex-start; }
  .filter-sep { display: none; }
}
</style>
