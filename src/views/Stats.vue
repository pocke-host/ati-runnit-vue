<!-- src/views/Stats.vue -->
<template>
  <div class="stats-page">

    <!-- HERO -->
    <section class="hero">
      <div class="hero-inner">
        <h1 class="hero-title">📊 Your Stats</h1>
        <div class="hero-chips">
          <div class="hero-chip">
            <span class="chip-val">{{ formatDistance(careerMeters) }}</span>
            <span class="chip-label">Total Distance</span>
          </div>
          <div class="hero-chip">
            <span class="chip-val">{{ activities.length }}</span>
            <span class="chip-label">Activities</span>
          </div>
          <div class="hero-chip">
            <span class="chip-val">{{ formatDuration(careerSeconds) }}</span>
            <span class="chip-label">Total Time</span>
          </div>
        </div>
      </div>
    </section>

    <div class="stats-content">

      <!-- PERFORMANCE INTELLIGENCE -->
      <section class="section" v-if="performanceMetrics">
        <h2 class="section-title">Performance Intelligence</h2>

        <!-- 4-metric grid -->
        <div class="perf-grid">
          <div class="perf-card">
            <div class="perf-label">Fitness</div>
            <div class="perf-val">{{ performanceMetrics.fitnessScore }}</div>
            <div class="perf-sub">Chronic Training Load</div>
            <div class="perf-bar-bg">
              <div class="perf-bar" :style="{ width: performanceMetrics.fitnessScore + '%', background: '#22c55e' }"></div>
            </div>
          </div>
          <div class="perf-card">
            <div class="perf-label">Fatigue</div>
            <div class="perf-val">{{ performanceMetrics.fatigueScore }}</div>
            <div class="perf-sub">Acute Training Load</div>
            <div class="perf-bar-bg">
              <div class="perf-bar" :style="{ width: performanceMetrics.fatigueScore + '%', background: '#ef4444' }"></div>
            </div>
          </div>
          <div class="perf-card">
            <div class="perf-label">Form</div>
            <div class="perf-val" :style="{ color: formColor }">{{ performanceMetrics.formScore > 0 ? '+' : '' }}{{ performanceMetrics.formScore }}</div>
            <div class="perf-sub">{{ formLabel }}</div>
            <div class="perf-bar-bg">
              <div class="perf-bar" :style="{
                width: Math.min(100, Math.abs(performanceMetrics.formScore)) + '%',
                background: formColor
              }"></div>
            </div>
          </div>
          <div class="perf-card">
            <div class="perf-label">VO2max</div>
            <div class="perf-val" style="color:#3b82f6">{{ performanceMetrics.vo2max ?? '—' }}</div>
            <div class="perf-sub">ml/kg/min estimate</div>
            <div class="perf-bar-bg" v-if="performanceMetrics.vo2max">
              <div class="perf-bar" :style="{ width: ((performanceMetrics.vo2max - 25) / 60 * 100) + '%', background: '#3b82f6' }"></div>
            </div>
          </div>
        </div>

        <!-- Consistency + Race Predictions -->
        <div class="perf-bottom-row">
          <div class="perf-consistency">
            <div class="perf-consistency-head">
              <span class="perf-label">Consistency</span>
              <span class="perf-val-sm">{{ performanceMetrics.consistency }}%</span>
            </div>
            <div class="perf-sub">{{ consistencyLabel }} — last 12 weeks</div>
            <div class="perf-bar-bg" style="margin-top:10px">
              <div class="perf-bar" :style="{ width: performanceMetrics.consistency + '%', background: '#0052FF' }"></div>
            </div>
          </div>

          <div class="perf-preds" v-if="performanceMetrics.racePreds">
            <div class="perf-label" style="margin-bottom:12px">Race Predictions</div>
            <div class="pred-grid">
              <div class="pred-item" v-for="(time, dist) in performanceMetrics.racePreds" :key="dist">
                <div class="pred-dist">{{ dist }}</div>
                <div class="pred-time">{{ time }}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- DISCIPLINE SCORE -->
      <section class="section disc-section">
        <h2 class="section-title">Discipline Score</h2>
        <div class="disc-card">
          <div class="disc-card-left">
            <div class="disc-big-num" :style="{ color: disciplineData.levelColor }">{{ disciplineData.score }}</div>
            <div class="disc-big-label" :style="{ color: disciplineData.levelColor }">{{ disciplineData.level }}</div>
            <div class="disc-big-sub">out of 100</div>
          </div>
          <div class="disc-card-right">
            <div v-for="(item, key) in disciplineData.breakdown" :key="key" class="disc-row">
              <div class="disc-row-top">
                <span class="disc-row-label">{{ item.label }}</span>
                <span class="disc-row-pts">{{ item.score }}<span class="disc-row-max">/{{ item.max }}</span></span>
              </div>
              <div class="disc-row-track">
                <div class="disc-row-fill" :style="{ width: (item.score / item.max * 100) + '%' }"></div>
              </div>
              <div class="disc-row-detail">{{ item.detail }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- TRAINING LOG HEATMAP -->
      <section class="section" v-if="heatmapData.length">
        <h2 class="section-title">Training Log</h2>
        <div class="heatmap-card">
          <div class="heatmap-scroll">
            <!-- Month labels -->
            <div class="heatmap-months">
              <span
                v-for="m in heatmapMonths"
                :key="m.col"
                class="heatmap-month"
                :style="{ gridColumn: m.col + 1 }"
              >{{ m.label }}</span>
            </div>
            <!-- Week columns -->
            <div class="heatmap-grid">
              <div v-for="(week, wi) in heatmapData" :key="wi" class="heatmap-week">
                <div
                  v-for="day in week"
                  :key="day.date"
                  :class="['heatmap-cell', `heatmap-l${day.level < 0 ? 'x' : day.level}`]"
                  @mouseenter="showHeatmapTooltip(day, $event)"
                  @mouseleave="hideHeatmapTooltip"
                ></div>
              </div>
            </div>
          </div>
          <!-- Legend -->
          <div class="heatmap-legend">
            <span class="heatmap-legend-label">Less</span>
            <div class="heatmap-cell heatmap-l0"></div>
            <div class="heatmap-cell heatmap-l1"></div>
            <div class="heatmap-cell heatmap-l2"></div>
            <div class="heatmap-cell heatmap-l3"></div>
            <div class="heatmap-cell heatmap-l4"></div>
            <span class="heatmap-legend-label">More</span>
          </div>
        </div>
        <!-- Tooltip (fixed position) -->
        <Teleport to="body">
          <div
            v-if="heatmapTooltip"
            class="heatmap-tooltip"
            :style="{ left: heatmapTooltip.x + 'px', top: (heatmapTooltip.y - 44) + 'px' }"
          >{{ heatmapTooltip.text }}</div>
        </Teleport>
      </section>

      <!-- TRAINING INSIGHTS -->
      <section class="section" v-if="acwrInfo || weeklyTargetKm">
        <h2 class="section-title">Training Insights</h2>
        <div class="insights-row">

          <!-- ACWR Card -->
          <div class="insight-card" v-if="acwrInfo">
            <div class="insight-head">
              <span class="insight-label">Injury Risk (ACWR)</span>
              <span class="insight-badge" :style="{ background: acwrInfo.color }">{{ acwrInfo.label }}</span>
            </div>
            <div class="insight-val" :style="{ color: acwrInfo.color }">{{ acwrScore }}</div>
            <div class="insight-sub">{{ acwrInfo.desc }}</div>
            <!-- Visual gauge bar -->
            <div class="acwr-gauge">
              <div class="acwr-zone" style="width:40%; background:#3b82f6"></div>
              <div class="acwr-zone" style="width:10%; background:#86efac"></div>
              <div class="acwr-zone" style="width:15%; background:#22c55e"></div>
              <div class="acwr-zone" style="width:10%; background:#0052FF"></div>
              <div class="acwr-zone" style="width:25%; background:#ef4444"></div>
              <div class="acwr-needle" :style="{ left: Math.min(98, (acwrScore / 2) * 100) + '%' }"></div>
            </div>
            <div class="acwr-ticks">
              <span>0</span><span>0.8</span><span>1.0</span><span>1.3</span><span>1.5</span><span>2.0</span>
            </div>
          </div>

          <!-- Weekly Target Card -->
          <div class="insight-card" v-if="weeklyTargetKm">
            <div class="insight-head">
              <span class="insight-label">This Week's Target</span>
            </div>
            <div class="insight-val">{{ weeklyTargetKm }} <span class="insight-unit">{{ distanceLabel }}</span></div>
            <div class="insight-sub">Based on your current fitness base (+5% progression)</div>
            <div class="insight-tip">
              <i class="bi bi-lightbulb-fill"></i>
              Staying in this range keeps ACWR in the 0.8–1.3 safe zone.
            </div>
          </div>

          <!-- Days Since Last Activity -->
          <div class="insight-card" v-if="daysSinceLastActivity !== null">
            <div class="insight-head">
              <span class="insight-label">Last Activity</span>
              <span
                class="insight-badge"
                :style="{ background: daysSinceLastActivity === 0 ? '#22c55e' : daysSinceLastActivity <= 2 ? '#0052FF' : '#ef4444' }"
              >
                {{ daysSinceLastActivity === 0 ? 'Today' : daysSinceLastActivity === 1 ? 'Yesterday' : `${daysSinceLastActivity}d ago` }}
              </span>
            </div>
            <div class="insight-val" :style="{ color: daysSinceLastActivity <= 1 ? '#22c55e' : daysSinceLastActivity <= 3 ? '#0052FF' : '#ef4444' }">
              {{ daysSinceLastActivity }}
              <span class="insight-unit">{{ daysSinceLastActivity === 1 ? 'day' : 'days' }}</span>
            </div>
            <div class="insight-sub">
              {{ daysSinceLastActivity === 0 ? 'Great — you trained today!'
                : daysSinceLastActivity <= 2 ? 'Normal recovery window'
                : daysSinceLastActivity <= 5 ? 'Getting a bit long — consider a short run'
                : 'Extended gap detected — ease back in gradually' }}
            </div>
          </div>

        </div>
      </section>

      <!-- PERSONAL RECORDS -->
      <section class="section">
        <h2 class="section-title">Personal Records</h2>
        <AppSpinner v-if="prStore.loading" label="Loading records…" />
        <EmptyState
          v-else-if="!prStore.allPRs.some(pr => pr.data)"
          icon="bi-trophy"
          title="No records yet"
          message="Log your first activity to start tracking PRs."
          action-to="/track"
          action-label="Track a Run"
        />
        <div v-else class="pr-grid">
          <div
            v-for="pr in prStore.allPRs"
            :key="pr.id"
            :class="['pr-card', { 'pr-card-set': pr.data }]"
          >
            <div class="pr-icon-wrap">
              <i :class="`bi ${pr.icon}`"></i>
            </div>
            <div class="pr-label">{{ pr.label }}</div>
            <template v-if="pr.data">
              <div class="pr-value">{{ formatPRValue(pr) }}</div>
              <router-link :to="`/activities/${pr.data.id}`" class="pr-link">View activity →</router-link>
            </template>
            <template v-else>
              <div class="pr-empty">No record yet</div>
            </template>
          </div>
        </div>
      </section>

      <!-- DISTANCE CHART (weekly / monthly toggle) -->
      <section class="section">
        <div class="section-header-row">
          <h2 class="section-title">
            {{ chartPeriod === 'monthly' ? 'Monthly Distance' : 'Weekly Distance (Last 12 Weeks)' }}
          </h2>
          <div class="period-toggle">
            <button :class="['period-btn', { active: chartPeriod === 'monthly' }]" @click="setPeriod('monthly')">Monthly</button>
            <button :class="['period-btn', { active: chartPeriod === 'weekly' }]" @click="setPeriod('weekly')">Weekly</button>
          </div>
        </div>
        <div class="chart-card">
          <canvas ref="weeklyChartRef"></canvas>
        </div>
      </section>

      <!-- SPORT BREAKDOWN -->
      <section class="section section-split">
        <div class="split-left">
          <h2 class="section-title">Sport Breakdown</h2>
          <div class="chart-card chart-card-doughnut">
            <canvas ref="pieChartRef"></canvas>
          </div>
        </div>
        <div class="split-right">
          <h2 class="section-title">Breakdown</h2>
          <div class="legend-list">
            <div v-for="s in sportBreakdown" :key="s.type" class="legend-row">
              <div class="legend-dot" :style="{ background: s.color }"></div>
              <div class="legend-info">
                <span class="legend-type">{{ s.type }}</span>
                <span class="legend-count">{{ s.count }} activit{{ s.count === 1 ? 'y' : 'ies' }}</span>
              </div>
            </div>
            <div v-if="!sportBreakdown.length" class="legend-empty">No activities yet</div>
          </div>
        </div>
      </section>

      <!-- CAREER MILESTONES -->
      <section class="section">
        <h2 class="section-title">Career Milestones</h2>
        <div class="milestone-grid">
          <div class="milestone-card">
            <div class="milestone-icon">🗺️</div>
            <div class="milestone-val">{{ formatDistance(careerMeters) }}</div>
            <div class="milestone-label">Total Distance</div>
          </div>
          <div class="milestone-card">
            <div class="milestone-icon">⏱️</div>
            <div class="milestone-val">{{ formatDuration(careerSeconds) }}</div>
            <div class="milestone-label">Total Time</div>
          </div>
          <div class="milestone-card">
            <div class="milestone-icon">⛰️</div>
            <div class="milestone-val">{{ formatElevation(careerElevation) }}</div>
            <div class="milestone-label">Total Elevation</div>
          </div>
          <div class="milestone-card">
            <div class="milestone-icon">🏅</div>
            <div class="milestone-val">{{ activities.length }}</div>
            <div class="milestone-label">Total Activities</div>
          </div>
        </div>
      </section>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useActivityStore } from '@/stores/activity'
import { usePRStore } from '@/stores/pr'
import { storeToRefs } from 'pinia'
import { Chart, registerables } from 'chart.js'
import { useUnits } from '@/composables/useUnits'
import { useDisciplineScore } from '@/composables/useDisciplineScore'
import AppSpinner from '@/components/AppSpinner.vue'
import EmptyState from '@/components/EmptyState.vue'
import { useWorkoutClassifier } from '@/composables/useWorkoutClassifier'

Chart.register(...registerables)

const { classifyActivity } = useWorkoutClassifier()

const activityStore = useActivityStore()
const prStore = usePRStore()
const { activities } = storeToRefs(activityStore)

const {
  isImperial,
  distanceLabel,
  formatDistance,
  formatDuration,
  formatDurationClock,
  formatPace,
  formatElevation,
  metersToDisplay,
} = useUnits()

const weeklyChartRef = ref(null)
const pieChartRef = ref(null)
let weeklyChartInstance = null
let pieChartInstance = null

const chartPeriod = ref('monthly') // 'monthly' | 'weekly'

function setPeriod(p) {
  chartPeriod.value = p
  nextTick(initWeeklyChart)
}

// Career totals
const careerMeters = computed(() =>
  (activities.value || []).reduce((s, a) => s + (a.distanceMeters || 0), 0)
)
const careerSeconds = computed(() =>
  (activities.value || []).reduce((s, a) => s + (a.durationSeconds || 0), 0)
)
const careerElevation = computed(() =>
  (activities.value || []).reduce((s, a) => s + (a.elevationMeters ?? a.elevationGain ?? 0), 0)
)

// ── Performance Intelligence ──────────────────────

const performanceMetrics = computed(() => {
  const acts = activities.value || []
  if (!acts.length) return null

  const today = new Date()
  today.setHours(23, 59, 59, 999)
  const dayMs = 86400000
  const DAYS = 90

  // Daily training load (km) for last 90 days
  const dailyLoad = new Array(DAYS).fill(0)
  for (const a of acts) {
    const daysAgo = Math.floor((today - new Date(a.createdAt)) / dayMs)
    if (daysAgo >= 0 && daysAgo < DAYS) {
      dailyLoad[DAYS - 1 - daysAgo] += (a.distanceMeters || 0) / 1000
    }
  }

  // EMA — CTL (42d) and ATL (7d)
  let ctl = 0, atl = 0
  const ctlK = 1 / 42, atlK = 1 / 7
  for (let i = 0; i < DAYS; i++) {
    ctl = ctl * (1 - ctlK) + dailyLoad[i] * ctlK
    atl = atl * (1 - atlK) + dailyLoad[i] * atlK
  }

  // Scale to 0-100 scores (10 km/day max = 100)
  const fitnessScore  = Math.min(100, Math.round(ctl * 10))
  const fatigueScore  = Math.min(100, Math.round(atl * 10))
  const formScore     = Math.round(fitnessScore - fatigueScore)

  // VO2max estimate from recent runs (best pace → 85% VO2max effort)
  const recentRuns = acts
    .filter(a => ['RUN', 'Running'].includes(a.sportType) && (a.distanceMeters || 0) > 2000 && (a.durationSeconds || 0) > 600)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 15)

  let vo2max = null
  if (recentRuns.length > 0) {
    const bestPaceSkm = Math.min(...recentRuns.map(r => r.durationSeconds / r.distanceMeters * 1000))
    const speedKmh = 3600 / bestPaceSkm
    vo2max = Math.min(85, Math.max(25, Math.round(3.5 * speedKmh / 0.85)))
  }

  // Race time predictions — Riegel formula from best recent effort
  let racePreds = null
  if (recentRuns.length > 0) {
    // Choose the run with highest speed × distance score
    const bestRun = recentRuns.reduce((best, r) => {
      const s = r.distanceMeters / r.durationSeconds
      return s > best.s ? { r, s } : best
    }, { r: recentRuns[0], s: 0 }).r

    const knownKm  = bestRun.distanceMeters / 1000
    const knownMin = bestRun.durationSeconds / 60

    const riegel = (targetKm) => {
      const t = knownMin * Math.pow(targetKm / knownKm, 1.06)
      const h = Math.floor(t / 60)
      const m = Math.floor(t % 60)
      const s = Math.round((t * 60) % 60)
      return h > 0
        ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
        : `${m}:${String(s).padStart(2, '0')}`
    }

    // Only show predictions for distances longer than known
    racePreds = {}
    if (knownKm <= 5.5)  racePreds['5K']       = riegel(5)
    if (knownKm <= 11)   racePreds['10K']      = riegel(10)
    if (knownKm <= 22)   racePreds['Half']     = riegel(21.0975)
    if (knownKm <= 43)   racePreds['Marathon'] = riegel(42.195)
    if (!Object.keys(racePreds).length) racePreds = null
  }

  // Consistency: % of last 12 weeks with ≥ 3 activities
  let activeWeeks = 0
  const now = new Date()
  for (let i = 0; i < 12; i++) {
    const wEnd = new Date(now.getTime() - i * 7 * dayMs)
    const wStart = new Date(wEnd.getTime() - 6 * dayMs)
    const count = acts.filter(a => {
      const d = new Date(a.createdAt)
      return d >= wStart && d <= wEnd
    }).length
    if (count >= 3) activeWeeks++
  }
  const consistency = Math.round((activeWeeks / 12) * 100)

  return { fitnessScore, fatigueScore, formScore, vo2max, racePreds, consistency, ctl, atl }
})

const formColor = computed(() => {
  const f = performanceMetrics.value?.formScore ?? 0
  if (f > 10)  return '#22c55e'
  if (f > -5)  return '#0052FF'
  return '#ef4444'
})

const formLabel = computed(() => {
  const f = performanceMetrics.value?.formScore ?? 0
  if (f > 15)  return 'Fresh — ready to race'
  if (f > 5)   return 'Good form'
  if (f > -5)  return 'Neutral'
  if (f > -20) return 'Building load'
  return 'High fatigue'
})

const consistencyLabel = computed(() => {
  const c = performanceMetrics.value?.consistency ?? 0
  if (c >= 90) return 'Elite consistency'
  if (c >= 70) return 'Strong habit'
  if (c >= 50) return 'Building routine'
  if (c >= 30) return 'Inconsistent'
  return 'Just getting started'
})

// ACWR (Acute:Chronic Workload Ratio)
const disciplineData = computed(() => useDisciplineScore(activities.value))

const acwrScore = computed(() => {
  const m = performanceMetrics.value
  if (!m || m.ctl === 0) return null
  return Math.round((m.atl / m.ctl) * 100) / 100
})

const acwrInfo = computed(() => {
  const a = acwrScore.value
  if (a === null) return null
  if (a < 0.8)  return { label: 'Undertraining', color: '#3b82f6', desc: 'Gradually increase volume to build fitness' }
  if (a < 1.0)  return { label: 'Optimal Base', color: '#22c55e', desc: 'Solid aerobic foundation, safe to add load' }
  if (a < 1.3)  return { label: 'Productive Load', color: '#22c55e', desc: 'Good training stimulus, manage recovery' }
  if (a < 1.5)  return { label: 'Caution Zone', color: '#0052FF', desc: 'Monitor fatigue — consider an easy day' }
  return           { label: 'High Injury Risk', color: '#ef4444', desc: 'Reduce load or take a rest day now' }
})

const weeklyTargetKm = computed(() => {
  const m = performanceMetrics.value
  if (!m || m.ctl === 0) return null
  const km = m.ctl * 7 * 1.05
  if (isImperial.value) return Math.round(km * 0.621371 * 10) / 10
  return Math.round(km * 10) / 10
})

const daysSinceLastActivity = computed(() => {
  const acts = activities.value || []
  if (!acts.length) return null
  const latest = acts.reduce((max, a) => {
    const d = new Date(a.createdAt)
    return d > max ? d : max
  }, new Date(0))
  return Math.floor((Date.now() - latest.getTime()) / 86400000)
})

// 52-week training heatmap
const heatmapData = computed(() => {
  const acts = activities.value || []
  const today = new Date()
  today.setHours(23, 59, 59, 999)

  const dailyKm = {}
  for (const a of acts) {
    if (!a.createdAt) continue
    const key = new Date(a.createdAt).toISOString().slice(0, 10)
    dailyKm[key] = (dailyKm[key] || 0) + (a.distanceMeters || 0) / 1000
  }

  const start = new Date(today)
  start.setDate(start.getDate() - 363)
  start.setDate(start.getDate() - start.getDay()) // align to Sunday

  const weeks = []
  const cur = new Date(start)
  while (cur <= today) {
    const week = []
    for (let d = 0; d < 7; d++) {
      const isFuture = new Date(cur) > today
      const key = new Date(cur).toISOString().slice(0, 10)
      const km = isFuture ? 0 : (dailyKm[key] || 0)
      week.push({
        date: key,
        km,
        level: isFuture ? -1 : km === 0 ? 0 : km < 5 ? 1 : km < 10 ? 2 : km < 20 ? 3 : 4,
        dateLabel: new Date(cur).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      })
      cur.setDate(cur.getDate() + 1)
    }
    weeks.push(week)
  }
  return weeks
})

const heatmapMonths = computed(() => {
  const months = []
  let last = -1
  heatmapData.value.forEach((week, i) => {
    if (!week[0]) return
    const m = new Date(week[0].date).getMonth()
    if (m !== last) {
      months.push({ col: i, label: new Date(week[0].date).toLocaleDateString('en-US', { month: 'short' }) })
      last = m
    }
  })
  return months
})

const heatmapTooltip = ref(null)

function showHeatmapTooltip(day, event) {
  if (day.level === -1) return
  const dist = day.km === 0 ? 'rest' : isImperial.value
    ? `${(day.km * 0.621371).toFixed(1)} mi`
    : `${day.km.toFixed(1)} km`
  heatmapTooltip.value = { text: `${day.dateLabel} — ${dist}`, x: event.clientX, y: event.clientY }
}

function hideHeatmapTooltip() { heatmapTooltip.value = null }

// ── Sport breakdown for doughnut
const SPORT_COLORS = {
  RUN: '#0C0C0C', Running: '#0C0C0C',
  BIKE: '#404040', Cycling: '#404040',
  SWIM: '#707070', Swimming: '#707070',
  HIKE: '#A0A0A0', Hiking: '#A0A0A0',
  WALK: '#C8C8C8', Walking: '#C8C8C8',
  OTHER: '#E0E0E0',
}
const sportBreakdown = computed(() => {
  const map = {}
  for (const a of (activities.value || [])) {
    map[a.sportType] = (map[a.sportType] || 0) + 1
  }
  return Object.entries(map).map(([type, count]) => ({
    type, count, color: SPORT_COLORS[type] || SPORT_COLORS.OTHER
  }))
})

// Weekly distance — last 12 weeks bucketed
const weeklyData = computed(() => {
  const now = new Date()
  const weeks = []
  for (let i = 11; i >= 0; i--) {
    const end = new Date(now)
    end.setDate(now.getDate() - i * 7)
    const start = new Date(end)
    start.setDate(end.getDate() - 6)
    const label = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const meters = (activities.value || [])
      .filter(a => {
        const d = new Date(a.createdAt)
        return d >= start && d <= end
      })
      .reduce((s, a) => s + (a.distanceMeters || 0), 0)
    const dist = isImperial.value
      ? parseFloat((meters / 1000 * 0.621371).toFixed(2))
      : parseFloat((meters / 1000).toFixed(2))
    weeks.push({ label, dist })
  }
  return weeks
})

// Monthly distance — last 12 calendar months
const monthlyData = computed(() => {
  const now = new Date()
  const months = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const start = new Date(d.getFullYear(), d.getMonth(), 1)
    const end   = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)
    const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    const meters = (activities.value || [])
      .filter(a => {
        const ad = new Date(a.createdAt)
        return ad >= start && ad <= end
      })
      .reduce((s, a) => s + (a.distanceMeters || 0), 0)
    const dist = isImperial.value
      ? parseFloat((meters / 1000 * 0.621371).toFixed(2))
      : parseFloat((meters / 1000).toFixed(2))
    months.push({ label, dist })
  }
  return months
})

// Active chart data based on period toggle
const activeChartData = computed(() =>
  chartPeriod.value === 'monthly' ? monthlyData.value : weeklyData.value
)

// Format a PR's primary value for display
function formatPRValue(pr) {
  const d = pr.data
  if (!d) return ''
  switch (pr.id) {
    case 'best_5k':
    case 'best_10k':
    case 'best_half':
    case 'best_marathon':
      return formatDurationClock(d.estTime)
    case 'fastest_pace':
      return formatPace(d.pace / 60)   // pace stored as sec/km → convert to min/km
    case 'longest_run':
    case 'longest_ride':
      return formatDistance(d.distanceMeters)
    case 'most_elevation':
      return formatElevation(d.elevationMeters)
    default:
      return ''
  }
}

// Charts
function initWeeklyChart() {
  if (!weeklyChartRef.value) return
  if (weeklyChartInstance) { weeklyChartInstance.destroy() }
  const ctx = weeklyChartRef.value.getContext('2d')
  weeklyChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: activeChartData.value.map(w => w.label),
      datasets: [{
        label: `Distance (${distanceLabel.value})`,
        data: activeChartData.value.map(w => w.dist),
        backgroundColor: 'rgba(196,106,42,0.80)',
        borderColor: 'rgba(196,106,42,1)',
        borderWidth: 2,
        borderRadius: 0,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(15,18,16,0.05)' },
          title: { display: true, text: distanceLabel.value },
          ticks: { maxTicksLimit: 6 }
        },
        x: { grid: { display: false } }
      }
    }
  })
}

function initPieChart() {
  if (!pieChartRef.value) return
  if (pieChartInstance) { pieChartInstance.destroy() }
  const ctx = pieChartRef.value.getContext('2d')
  const bd = sportBreakdown.value
  if (!bd.length) return
  pieChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: bd.map(s => s.type),
      datasets: [{
        data: bd.map(s => s.count),
        backgroundColor: bd.map(s => s.color),
        borderWidth: 0,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: { legend: { display: false } },
      cutout: '68%',
    }
  })
}

onMounted(async () => {
  if (!activities.value.length) await activityStore.fetchActivities()
  await prStore.fetchPRs(activities.value)
  await nextTick()
  initWeeklyChart()
  initPieChart()
})
</script>

<style scoped>
.stats-page {
  min-height: 100vh;
  padding-top: var(--nav-h, 64px);
  background: #fff;
  font-family: Futura, "Futura PT", "Futura Std", "Avenir Next", Avenir, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
}

/* HERO */
.hero {
  background: #000;
  color: white;
  padding: 52px 24px 44px;
}
.hero-inner {
  max-width: 900px;
  margin: 0 auto;
  text-align: center;
}
.hero-title {
  font-size: 2.6rem;
  font-weight: 900;
  margin: 0 0 28px;
  line-height: 1.1;
}
.hero-chips {
  display: flex;
  justify-content: center;
  gap: 24px;
  flex-wrap: wrap;
}
.hero-chip {
  background: rgba(255,255,255,0.14);
  border: 1px solid rgba(255,255,255,0.22);
  border-radius: 0;
  padding: 14px 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 130px;
}
.chip-val {
  font-size: 1.5rem;
  font-weight: 900;
  color: white;
  line-height: 1;
}
.chip-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: rgba(255,255,255,0.70);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

/* CONTENT */
.stats-content {
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px 24px 80px;
}

.section {
  margin-bottom: 52px;
}
.section-title {
  font-size: 1.1rem;
  font-weight: 900;
  color: rgba(15,18,16,0.85);
  margin: 0 0 20px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.section-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.section-header-row .section-title {
  margin: 0;
}
.period-toggle {
  display: flex;
  border: 1px solid #E5E5E5;
}
.period-btn {
  padding: 6px 14px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: #fff;
  border: none;
  cursor: pointer;
  color: #767676;
  transition: background 0.15s, color 0.15s;
}
.period-btn + .period-btn {
  border-left: 1px solid #E5E5E5;
}
.period-btn.active {
  background: #000;
  color: #fff;
}

/* PERFORMANCE INTELLIGENCE */
.perf-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}
.perf-card {
  background: white;
  border: 1px solid #E5E5E5;
  border-radius: 0;
  padding: 20px 18px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.perf-label {
  font-size: 0.72rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(15,18,16,0.50);
}
.perf-val {
  font-size: 2rem;
  font-weight: 900;
  color: #000;
  line-height: 1.1;
}
.perf-val-sm {
  font-size: 1.25rem;
  font-weight: 900;
  color: #000;
}
.perf-sub {
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(15,18,16,0.50);
  margin-bottom: 6px;
}
.perf-bar-bg {
  height: 4px;
  background: #F0F0F0;
  border-radius: 0;
  margin-top: auto;
}
.perf-bar {
  height: 100%;
  border-radius: 0;
  transition: width 0.6s ease;
}
.perf-bottom-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.perf-consistency {
  background: white;
  border: 1px solid #E5E5E5;
  border-radius: 0;
  padding: 20px 18px 16px;
}
.perf-consistency-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 4px;
}
.perf-preds {
  background: white;
  border: 1px solid #E5E5E5;
  border-radius: 0;
  padding: 20px 18px 16px;
}
.pred-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
.pred-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.pred-dist {
  font-size: 0.72rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(15,18,16,0.50);
}
.pred-time {
  font-size: 1.1rem;
  font-weight: 900;
  color: #000;
}

/* TRAINING LOG HEATMAP */
.disc-card {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 32px;
  border: 1px solid #E5E5E5;
  padding: 24px;
  background: #fff;
}
.disc-card-left {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  border-right: 1px solid #E5E5E5;
  padding-right: 32px;
}
.disc-big-num {
  font-size: 3.5rem;
  font-weight: 900;
  line-height: 1;
  margin-bottom: 4px;
}
.disc-big-label {
  font-size: 0.75rem;
  font-weight: 900;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.disc-big-sub {
  font-size: 0.65rem;
  color: #767676;
  margin-top: 4px;
}
.disc-card-right {
  display: flex;
  flex-direction: column;
  gap: 14px;
  justify-content: center;
}
.disc-row-top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 4px;
}
.disc-row-label {
  font-size: 0.78rem;
  font-weight: 700;
  color: #000;
}
.disc-row-pts {
  font-size: 0.85rem;
  font-weight: 900;
  color: #000;
}
.disc-row-max {
  font-size: 0.68rem;
  font-weight: 400;
  color: #767676;
}
.disc-row-track {
  height: 5px;
  background: #E5E5E5;
  overflow: hidden;
  margin-bottom: 3px;
}
.disc-row-fill {
  height: 100%;
  background: #000;
  transition: width 0.4s ease;
}
.disc-row-detail {
  font-size: 0.67rem;
  color: #767676;
}
.heatmap-card {
  background: white;
  border: 1px solid #E5E5E5;
  padding: 20px 20px 16px;
}
.heatmap-scroll {
  overflow-x: auto;
  padding-bottom: 4px;
}
.heatmap-months {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 14px;
  gap: 2px;
  margin-bottom: 4px;
  padding-left: 0;
  min-width: max-content;
}
.heatmap-month {
  font-size: 0.68rem;
  font-weight: 700;
  color: rgba(15,18,16,0.45);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
}
.heatmap-grid {
  display: flex;
  gap: 2px;
  min-width: max-content;
}
.heatmap-week {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.heatmap-cell {
  width: 12px;
  height: 12px;
  border-radius: 0;
  flex-shrink: 0;
}
.heatmap-l0  { background: #F0F0F0; }
.heatmap-l1  { background: #bbf7d0; }
.heatmap-l2  { background: #4ade80; }
.heatmap-l3  { background: #16a34a; }
.heatmap-l4  { background: #064e3b; }
.heatmap-lx  { background: transparent; }
.heatmap-legend {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 12px;
  justify-content: flex-end;
}
.heatmap-legend-label {
  font-size: 0.70rem;
  color: rgba(15,18,16,0.45);
  font-weight: 700;
}
.heatmap-tooltip {
  position: fixed;
  z-index: 9999;
  background: #000;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 5px 10px;
  pointer-events: none;
  white-space: nowrap;
  transform: translateX(-50%);
}

/* TRAINING INSIGHTS */
.insights-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 16px;
}
.insight-card {
  background: white;
  border: 1px solid #E5E5E5;
  padding: 20px 18px 18px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.insight-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.insight-label {
  font-size: 0.72rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(15,18,16,0.50);
}
.insight-badge {
  font-size: 0.65rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: white;
  padding: 2px 8px;
  border-radius: 0;
}
.insight-val {
  font-size: 2rem;
  font-weight: 900;
  color: #000;
  line-height: 1;
}
.insight-unit {
  font-size: 1rem;
  font-weight: 700;
  color: rgba(15,18,16,0.50);
}
.insight-sub {
  font-size: 0.75rem;
  color: rgba(15,18,16,0.55);
  font-weight: 600;
  line-height: 1.4;
  margin-top: 2px;
}
.insight-tip {
  font-size: 0.72rem;
  color: rgba(15,18,16,0.45);
  margin-top: 8px;
  display: flex;
  align-items: flex-start;
  gap: 6px;
  line-height: 1.4;
}
.insight-tip i { flex-shrink: 0; margin-top: 1px; }
/* ACWR gauge */
.acwr-gauge {
  display: flex;
  height: 6px;
  margin-top: 10px;
  position: relative;
  overflow: visible;
}
.acwr-zone { height: 100%; }
.acwr-needle {
  position: absolute;
  top: -4px;
  width: 2px;
  height: 14px;
  background: #000;
  transform: translateX(-50%);
  border-radius: 1px;
}
.acwr-ticks {
  display: flex;
  justify-content: space-between;
  font-size: 0.62rem;
  color: rgba(15,18,16,0.40);
  font-weight: 700;
  margin-top: 6px;
}

/* LOADING */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 60px 20px;
  color: rgba(15,18,16,0.55);
}

/* PR GRID */
.pr-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
}
.pr-card {
  background: white;
  border: 1.5px solid rgba(15,18,16,0.09);
  border-radius: 0;
  padding: 22px 16px 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
  transition: transform 0.2s, box-shadow 0.2s;
  opacity: 0.65;
}
.pr-card.pr-card-set {
  opacity: 1;
  box-shadow: none;
  border-color: #000;
  border-left: 3px solid #000;
}
.pr-card.pr-card-set:hover { transform: none; }

.pr-icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.35rem;
  color: #767676;
  margin-bottom: 2px;
}
.pr-card.pr-card-set .pr-icon-wrap {
  background: #000;
  color: white;
}
.pr-label {
  font-weight: 900;
  font-size: 0.88rem;
  color: rgba(15,18,16,0.85);
  line-height: 1.25;
}
.pr-value {
  font-size: 1.25rem;
  font-weight: 900;
  color: #000;
}
.pr-link {
  font-size: 0.75rem;
  font-weight: 700;
  color: #767676;
  text-decoration: none;
}
.pr-link:hover { text-decoration: underline; }
.pr-empty {
  font-size: 0.78rem;
  color: rgba(15,18,16,0.40);
  font-weight: 600;
}

/* CHART CARDS */
.chart-card {
  background: white;
  border: 1px solid #E5E5E5;
  border-radius: 0;
  padding: 24px;
  height: 280px;
  position: relative;
}
.chart-card canvas {
  width: 100% !important;
  height: 100% !important;
}
.chart-card-doughnut {
  height: 260px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.chart-card-doughnut canvas {
  max-width: 200px;
  max-height: 200px;
}

/* SPLIT SECTION */
.section-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  align-items: start;
}
.split-left, .split-right { }

/* LEGEND */
.legend-list {
  background: white;
  border: 1px solid #E5E5E5;
  border-radius: 0;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.legend-row {
  display: flex;
  align-items: center;
  gap: 14px;
}
.legend-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  flex-shrink: 0;
}
.legend-info {
  display: flex;
  justify-content: space-between;
  flex: 1;
  align-items: center;
}
.legend-type { font-weight: 900; font-size: 0.9rem; color: rgba(15,18,16,0.85); }
.legend-count { font-size: 0.80rem; font-weight: 700; color: rgba(15,18,16,0.50); }
.legend-empty { font-size: 0.85rem; color: rgba(15,18,16,0.40); text-align: center; padding: 20px; }

/* MILESTONE GRID */
.milestone-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
}
.milestone-card {
  background: white;
  border: 1px solid #E5E5E5;
  border-radius: 0;
  padding: 28px 16px 22px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
  box-shadow: none;
  transition: transform 0.2s;
}
.milestone-card:hover { transform: none; }
.milestone-icon { font-size: 2rem; line-height: 1; }
.milestone-val {
  font-size: 1.4rem;
  font-weight: 900;
  color: #000;
}
.milestone-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: rgba(15,18,16,0.50);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

/* SPINNER */
.spinner-border {
  width: 2rem;
  height: 2rem;
  border: 3px solid rgba(15,18,16,0.12);
  border-top-color: #767676;
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* RESPONSIVE */
@media (max-width: 900px) {
  .pr-grid { grid-template-columns: repeat(2, 1fr); }
  .milestone-grid { grid-template-columns: repeat(2, 1fr); }
  .section-split { grid-template-columns: 1fr; }
  .perf-grid { grid-template-columns: repeat(2, 1fr); }
  .perf-bottom-row { grid-template-columns: 1fr; }
  .insights-row { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 600px) {
  .insights-row { grid-template-columns: 1fr; }
}
@media (max-width: 768px) {
  .pr-grid { grid-template-columns: repeat(2, 1fr); }
  .milestone-grid { grid-template-columns: repeat(2, 1fr); }
  .hero-chips { flex-wrap: wrap; gap: 8px; }
  .hero-chip { font-size: 0.8rem; padding: 8px 14px; }
  .chart-card canvas { max-height: 200px; }
  .stats-content { padding: 28px 16px 64px; }
}
@media (max-width: 600px) {
  .hero-title { font-size: 2rem; }
  .hero-chips { gap: 12px; }
  .hero-chip { min-width: 100px; padding: 12px 18px; }
  .stats-content { padding: 28px 16px 64px; }
}
@media (max-width: 480px) {
  .pr-grid { grid-template-columns: 1fr; }
  .milestone-grid { grid-template-columns: repeat(2, 1fr); }
  .hero-title { font-size: 1.8rem; }
  .section-title { font-size: 1.1rem; }
  .pr-card { padding: 16px; }
  .pr-value { font-size: 1.3rem; }
}
</style>
