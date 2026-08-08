<!-- src/views/StrengthProgress.vue -->
<template>
  <div class="strength-page">

    <div class="sp-header">
      <div class="sp-header-inner">
        <p class="sp-eyebrow">Strength</p>
        <h1 class="sp-title">Progress</h1>
      </div>
    </div>

    <div class="sp-body">

      <AppSpinner v-if="loadingExercises" label="Loading exercises…" />

      <EmptyState
        v-else-if="exercises.length === 0"
        icon="bi-graph-up"
        title="No strength sessions logged yet"
        message="Log a strength workout with sets and reps, then come back here to see your progress."
        action-label="Log a workout"
        @action="router.push('/dashboard')"
      />

      <template v-else>
        <div class="sp-picker-row">
          <select v-model="selectedExercise" class="sp-picker">
            <option v-for="ex in exercises" :key="ex" :value="ex">{{ ex }}</option>
          </select>
        </div>

        <AppSpinner v-if="loadingData" label="Loading history…" />

        <template v-else-if="history.length">
          <!-- PR stat strip -->
          <div class="gr-stat-strip">
            <div class="gr-stat-strip-cell">
              <div class="gr-stat-strip-num">{{ formatWeight(prs?.heaviestWeight?.value) }}</div>
              <div class="gr-stat-strip-lbl">Heaviest</div>
            </div>
            <div class="gr-stat-strip-cell gr-stat-strip-cell--div">
              <div class="gr-stat-strip-num">{{ prs?.bestRepsAtHeaviestWeight?.reps ?? '—' }}</div>
              <div class="gr-stat-strip-lbl">Reps @ Heaviest</div>
            </div>
            <div class="gr-stat-strip-cell gr-stat-strip-cell--div">
              <div class="gr-stat-strip-num">{{ formatWeight(prs?.estimatedOneRepMax?.value) }}</div>
              <div class="gr-stat-strip-lbl">Est. 1RM</div>
            </div>
            <div class="gr-stat-strip-cell gr-stat-strip-cell--div">
              <div class="gr-stat-strip-num">{{ formatWeight(prs?.mostVolumeInSession?.value) }}</div>
              <div class="gr-stat-strip-lbl">Best Session Volume</div>
            </div>
          </div>

          <!-- Chart -->
          <div class="sp-card">
            <div class="sp-card-top">
              <h3 class="sp-section-title">Trend</h3>
              <div class="sp-metric-toggle">
                <button
                  v-for="m in metrics"
                  :key="m.key"
                  :class="['sp-metric-btn', { 'sp-metric-btn--active': activeMetric === m.key }]"
                  @click="activeMetric = m.key"
                >{{ m.label }}</button>
              </div>
            </div>
            <div class="sp-chart-wrap">
              <canvas ref="chartRef"></canvas>
            </div>
          </div>

          <!-- Session history -->
          <div class="sp-card">
            <h3 class="sp-section-title">Sessions</h3>
            <div class="sp-table-wrap">
              <table class="sp-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Sets</th>
                    <th>Top Weight</th>
                    <th>Volume</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="pt in reversedHistory"
                    :key="pt.activityId"
                    class="sp-row"
                    @click="router.push(`/activities/${pt.activityId}`)"
                  >
                    <td class="sp-date">{{ formatDate(pt.performedAt) }}</td>
                    <td>{{ pt.setCount }}</td>
                    <td class="sp-weight">{{ formatWeight(pt.topWeightKg) }}</td>
                    <td class="sp-weight">{{ formatWeight(pt.totalVolumeKg) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </template>

        <EmptyState
          v-else
          icon="bi-graph-up"
          title="No history yet for this exercise"
          message="Log another session with this exercise to start building a trend."
        />
      </template>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useUnits } from '@/composables/useUnits'
import { useToast } from '@/composables/useToast'
import AppSpinner from '@/components/AppSpinner.vue'
import EmptyState from '@/components/EmptyState.vue'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const router = useRouter()
const { formatWeight } = useUnits()
const { showToast } = useToast()

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const exercises = ref([])
const selectedExercise = ref(null)
const prs = ref(null)
const history = ref([])
const loadingExercises = ref(true)
const loadingData = ref(false)
const activeMetric = ref('weight')

const metrics = [
  { key: 'weight', label: 'Weight' },
  { key: 'volume', label: 'Volume' },
  { key: 'onerm', label: 'Est. 1RM' },
]

const reversedHistory = computed(() => [...history.value].reverse())

const formatDate = (d) => {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const metricField = { weight: 'topWeightKg', volume: 'totalVolumeKg', onerm: 'estimatedOneRepMax' }

const fetchExercises = async () => {
  loadingExercises.value = true
  try {
    const { data } = await axios.get(`${API_URL}/strength/exercises`, { headers: getAuthHeaders() })
    // Backend returns these alphabetically (matches the logging form's autocomplete order) —
    // picking the first just avoids landing on a blank page, not a "most recent" claim.
    exercises.value = Array.isArray(data) ? data : []
    if (exercises.value.length) selectedExercise.value = exercises.value[0]
  } catch {
    showToast('Failed to load exercises. Try again.', 'error')
  } finally {
    loadingExercises.value = false
  }
}

const fetchExerciseData = async (exercise) => {
  if (!exercise) return
  loadingData.value = true
  try {
    const [prsRes, historyRes] = await Promise.all([
      axios.get(`${API_URL}/strength/prs`, { params: { exercise }, headers: getAuthHeaders() }),
      axios.get(`${API_URL}/strength/history`, { params: { exercise }, headers: getAuthHeaders() }),
    ])
    prs.value = prsRes.data
    history.value = Array.isArray(historyRes.data) ? historyRes.data : []
    await nextTick()
    renderChart()
  } catch {
    showToast('Failed to load exercise history. Try again.', 'error')
  } finally {
    loadingData.value = false
  }
}

watch(selectedExercise, (ex) => { if (ex) fetchExerciseData(ex) })

const chartRef = ref(null)
let chartInstance = null

const renderChart = () => {
  if (!chartRef.value || !history.value.length) return
  if (chartInstance) { chartInstance.destroy(); chartInstance = null }
  const field = metricField[activeMetric.value]
  const pts = history.value

  chartInstance = new Chart(chartRef.value, {
    type: 'line',
    data: {
      labels: pts.map(p => formatDate(p.performedAt)),
      datasets: [{
        data: pts.map(p => p[field]),
        fill: true,
        borderColor: '#2A55F5',
        backgroundColor: 'rgba(42,85,245,0.10)',
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 3,
        pointBackgroundColor: '#2A55F5',
        pointBorderColor: '#FBF6EC',
        pointBorderWidth: 1.5,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#16130F',
          titleFont: { family: "'Spline Sans Mono', ui-monospace, monospace", size: 11 },
          bodyFont: { family: "'Spline Sans Mono', ui-monospace, monospace", size: 12, weight: '700' },
          padding: 10,
          displayColors: false,
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { size: 10 }, color: 'rgba(22,19,15,0.45)', maxRotation: 0, autoSkipPadding: 16 },
          border: { color: 'rgba(22,19,15,0.15)' },
        },
        y: {
          grid: { color: 'rgba(22,19,15,0.06)', drawBorder: false },
          ticks: { font: { size: 10 }, color: 'rgba(22,19,15,0.45)', maxTicksLimit: 5 },
          border: { display: false },
        }
      }
    }
  })
}

watch(activeMetric, renderChart)

onMounted(fetchExercises)
</script>

<style scoped>
.strength-page {
  min-height: 100vh;
  padding-top: var(--nav-h, 66px);
  background: #FBF6EC;
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
  color: #16130F;
}

.sp-header {
  padding: 32px 40px 24px;
  border-bottom: 2px solid #16130F;
}
.sp-eyebrow {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #2A55F5;
  margin: 0 0 6px;
}
.sp-title {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-weight: 900;
  font-size: 2.4rem;
  line-height: 0.9;
  text-transform: uppercase;
  margin: 0;
}

.sp-body {
  max-width: 900px;
  margin: 0 auto;
  padding: 28px 40px 64px;
}

.sp-picker-row { margin-bottom: 24px; }
.sp-picker {
  width: 100%;
  max-width: 360px;
  border: 2px solid #16130F;
  background: #fff;
  padding: 12px 16px;
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
  font-weight: 700;
  font-size: 1rem;
  color: #16130F;
  outline: none;
}
.sp-picker:focus { border-color: #2A55F5; }

/* GR 4-cell stat strip (matches ActivityDetail.vue) */
.gr-stat-strip {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border: 2px solid #16130F;
  background: #fff;
  margin-bottom: 24px;
}
.gr-stat-strip-cell { padding: 20px 14px; text-align: center; }
.gr-stat-strip-cell--div { border-left: 2px solid #16130F; }
.gr-stat-strip-num {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-size: 1.7rem;
  font-weight: 900;
  line-height: 0.9;
  text-transform: uppercase;
  font-variant-numeric: tabular-nums;
  color: #16130F;
}
.gr-stat-strip-lbl {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.54rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #5A5348;
  margin-top: 6px;
}

.sp-card {
  background: #fff;
  border: 2px solid #16130F;
  padding: 24px;
  margin-bottom: 20px;
}
.sp-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
  flex-wrap: wrap;
  gap: 12px;
}
.sp-section-title {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-weight: 700;
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: #5A5348;
  margin: 0;
}

.sp-metric-toggle {
  display: flex;
  border: 2px solid #16130F;
}
.sp-metric-btn {
  background: #fff;
  border: none;
  border-right: 2px solid #16130F;
  padding: 6px 14px;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  color: #5A5348;
  transition: background 0.15s, color 0.15s;
}
.sp-metric-btn:last-child { border-right: none; }
.sp-metric-btn:hover { background: #F0E8D8; color: #16130F; }
.sp-metric-btn--active { background: #2A55F5; color: #fff; }

.sp-chart-wrap { height: 260px; position: relative; }

.sp-table-wrap { overflow-x: auto; }
.sp-table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
.sp-table th {
  text-align: left;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #8A8A8A;
  padding: 8px 12px;
  border-bottom: 2px solid #E7DFCE;
}
.sp-table td {
  padding: 10px 12px;
  border-bottom: 1.5px solid #E7DFCE;
  font-variant-numeric: tabular-nums;
}
.sp-row { cursor: pointer; transition: background 0.12s; }
.sp-row:hover { background: #F1EADC; }
.sp-row:last-child td { border-bottom: none; }
.sp-date { color: #5A5348; }
.sp-weight { font-weight: 700; }

@media (max-width: 600px) {
  .sp-header { padding: 24px 20px 20px; }
  .sp-body { padding: 20px 16px 48px; }
  .gr-stat-strip { grid-template-columns: repeat(2, 1fr); }
  .gr-stat-strip-cell--div:nth-child(3) { border-left: none; border-top: 2px solid #16130F; }
}
</style>
