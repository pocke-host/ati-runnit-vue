<!-- src/components/DashChartsSection.vue -->
<!-- Chart cards extracted from AccountDashboard: Weekly, Breakdown, Progress -->
<template>
  <div class="charts-section">

    <!-- Weekly Activity Chart -->
    <div class="chart-card">
      <div class="chart-header">
        <h3 class="chart-title">Weekly Activity</h3>
        <div class="chart-tabs">
          <button :class="['tab', {active: chartView === 'distance'}]" @click="chartView = 'distance'">Distance</button>
          <button :class="['tab', {active: chartView === 'duration'}]" @click="chartView = 'duration'">Duration</button>
        </div>
      </div>
      <div class="chart-body" style="position:relative">
        <canvas ref="weeklyChart"></canvas>
        <div v-if="loading" class="chart-skel-overlay"></div>
      </div>
    </div>

    <!-- Activity Breakdown -->
    <div class="chart-card">
      <div class="chart-header">
        <h3 class="chart-title">Activity Breakdown</h3>
        <select class="period-select" v-model="breakdownPeriod">
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>
      <div class="chart-body chart-body-split" style="position:relative">
        <div class="chart-doughnut">
          <canvas ref="activityPieChart"></canvas>
        </div>
        <div class="chart-legend">
          <template v-if="loading">
            <div v-for="n in 3" :key="n" class="legend-item">
              <div class="skel skel-color"></div>
              <div class="skel skel-legend-text"></div>
            </div>
          </template>
          <template v-else>
            <div v-for="sport in sportBreakdown" :key="sport.type" class="legend-item">
              <div class="legend-color" :style="{background: sport.color}"></div>
              <div class="legend-text">
                <div class="legend-label">{{ sport.type }}</div>
                <div class="legend-value">{{ sport.count }} activities</div>
              </div>
            </div>
          </template>
        </div>
        <div v-if="loading" class="chart-skel-overlay"></div>
      </div>
    </div>

    <!-- Progress Chart -->
    <div class="chart-card">
      <div class="chart-header">
        <h3 class="chart-title">Monthly Progress</h3>
        <div class="chart-metric">
          <template v-if="loading">
            <div class="skel skel-metric"></div>
          </template>
          <template v-else>
            <span class="metric-value">{{ monthlyGoalProgress }}%</span>
            <span class="metric-label">of goal</span>
          </template>
        </div>
      </div>
      <div class="chart-body" style="position:relative">
        <canvas ref="progressChart"></canvas>
        <div v-if="loading" class="chart-skel-overlay"></div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'
import { useActivityStore } from '@/stores/activity'
import { storeToRefs } from 'pinia'
import { useUnits } from '@/composables/useUnits'

Chart.register(...registerables)

const activityStore = useActivityStore()
const { activities, loading } = storeToRefs(activityStore)
const { distanceLabel, metersToDisplay } = useUnits()

const chartView = ref('distance')
const breakdownPeriod = ref('month')

const weeklyChart = ref(null)
const activityPieChart = ref(null)
const progressChart = ref(null)

let weeklyChartInstance = null
let pieChartInstance = null
let progressChartInstance = null

const weeklyChartData = computed(() => {
  const acts = activities.value || []
  const days = [0, 0, 0, 0, 0, 0, 0]
  const now = new Date()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7))
  monday.setHours(0, 0, 0, 0)
  acts.forEach(a => {
    const d = new Date(a.createdAt)
    if (d >= monday) {
      const idx = (d.getDay() + 6) % 7
      days[idx] += chartView.value === 'distance'
        ? metersToDisplay(a.distanceMeters || 0)
        : (a.durationSeconds || 0) / 60
    }
  })
  return days.map(v => parseFloat(v.toFixed(1)))
})

const sportBreakdown = computed(() => {
  const acts = activities.value || []
  const colors = {
    RUN: '#C46A2A', BIKE: '#5A6B4E', SWIM: '#2C3726',
    HIKE: '#A0875A', WALK: '#C8B49A', OTHER: '#E0D5C5'
  }
  const breakdown = {}
  acts.forEach(a => { breakdown[a.sportType] = (breakdown[a.sportType] || 0) + 1 })
  return Object.entries(breakdown).map(([type, count]) => ({
    type, count, color: colors[type] || colors.OTHER
  }))
})

const monthlyDistance = computed(() => {
  const acts = activities.value || []
  return (acts.reduce((sum, a) => sum + (a.distanceMeters || 0), 0) / 1000).toFixed(1)
})

const monthlyGoalProgress = computed(() => {
  return Math.min(Math.round((parseFloat(monthlyDistance.value) / 100) * 100), 100)
})

const initWeeklyChart = () => {
  if (!weeklyChart.value) return
  if (weeklyChartInstance) weeklyChartInstance.destroy()
  const ctx = weeklyChart.value.getContext('2d')
  weeklyChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: chartView.value === 'distance' ? `Distance (${distanceLabel.value})` : 'Duration (min)',
        data: weeklyChartData.value,
        backgroundColor: '#C46A2A',
        borderColor: '#C46A2A',
        borderWidth: 1,
        borderRadius: 0
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, grid: { color: 'rgba(15,18,16,0.05)' } },
        x: { grid: { display: false } }
      }
    }
  })
}

const initPieChart = () => {
  if (!activityPieChart.value) return
  if (pieChartInstance) pieChartInstance.destroy()
  const ctx = activityPieChart.value.getContext('2d')
  pieChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: sportBreakdown.value.map(s => s.type),
      datasets: [{ data: sportBreakdown.value.map(s => s.count), backgroundColor: sportBreakdown.value.map(s => s.color), borderWidth: 0 }]
    },
    options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { display: false } }, cutout: '70%' }
  })
}

const initProgressChart = () => {
  if (!progressChart.value) return
  if (progressChartInstance) progressChartInstance.destroy()
  const ctx = progressChart.value.getContext('2d')
  progressChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      datasets: [{
        label: 'Distance', data: [15, 28, 42, parseFloat(monthlyDistance.value)],
        borderColor: '#C46A2A', backgroundColor: 'rgba(196,106,42,0.07)',
        tension: 0.3, fill: true, borderWidth: 2, pointRadius: 4, pointBackgroundColor: '#C46A2A'
      }, {
        label: 'Goal', data: [25, 50, 75, 100],
        borderColor: 'rgba(107,107,107,0.40)', borderDash: [5, 5],
        borderWidth: 2, pointRadius: 0, fill: false
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, grid: { color: 'rgba(15,18,16,0.05)' } },
        x: { grid: { display: false } }
      }
    }
  })
}

const updateCharts = () => {
  nextTick(() => {
    initWeeklyChart()
    initPieChart()
    initProgressChart()
  })
}

watch(chartView, () => initWeeklyChart())
watch(loading, (val) => { if (!val) updateCharts() })
watch(activities, () => { if (!loading.value) updateCharts() }, { deep: true })

onMounted(() => {
  if (!loading.value && (activities.value?.length ?? 0) > 0) updateCharts()
})

onUnmounted(() => {
  weeklyChartInstance?.destroy()
  pieChartInstance?.destroy()
  progressChartInstance?.destroy()
})
</script>

<style scoped>
.charts-section { display: flex; flex-direction: column; gap: 24px; }
.chart-card { background: #fff; border: 1px solid #E5E5E5; padding: 24px; }
.chart-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.chart-title { font-size: 1.1rem; font-weight: 900; margin: 0; color: rgba(15,18,16,0.92); }
.chart-tabs { display: flex; gap: 8px; }
.tab { padding: 8px 16px; border: 1px solid #E5E5E5; background: #fff; font-weight: 700; font-size: 0.85rem; cursor: pointer; transition: all 0.2s; }
.tab:hover { background: rgba(255,255,255,0.90); }
.tab.active { background: #000; color: white; border-color: #000; }
.period-select { padding: 8px 12px; border: 1px solid rgba(15,18,16,0.12); background: rgba(255,255,255,0.80); font-weight: 600; font-size: 0.85rem; }
.chart-body { height: 280px; position: relative; }
.chart-body-split { display: grid; grid-template-columns: 200px 1fr; gap: 24px; align-items: center; height: auto; }
.chart-doughnut { position: relative; height: 200px; }
.chart-legend { display: flex; flex-direction: column; gap: 12px; }
.legend-item { display: flex; align-items: center; gap: 12px; }
.legend-color { width: 16px; height: 16px; flex-shrink: 0; }
.legend-text { flex: 1; }
.legend-label { font-weight: 700; font-size: 0.9rem; }
.legend-value { font-size: 0.8rem; color: rgba(15,18,16,0.60); }
.chart-metric { text-align: right; }
.metric-value { font-size: 1.8rem; font-weight: 900; color: #C46A2A; }
.metric-label { font-size: 0.75rem; color: rgba(15,18,16,0.60); display: block; margin-top: 2px; }

/* Skeleton */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.chart-skel-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  z-index: 1;
}
.skel {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}
.skel-color { width: 16px; height: 16px; flex-shrink: 0; }
.skel-legend-text { height: 14px; width: 80px; }
.skel-metric { height: 28px; width: 64px; margin-left: auto; }

@media (max-width: 768px) {
  .chart-body-split { grid-template-columns: 1fr; gap: 20px; }
  .chart-doughnut { height: 180px; margin: 0 auto; }
}
</style>
