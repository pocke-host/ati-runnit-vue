<!-- src/views/Stats.vue -->
<template>
  <div class="stats-page">

    <!-- HERO — THIS WEEK AT A GLANCE -->
    <section class="hero">
      <div class="hero-inner">
        <div class="hero-kicker">RUNNIT // PERFORMANCE</div>
        <h1 class="hero-title">YOUR STATS</h1>

        <!-- 7-day activity dots -->
        <div class="hero-dots" v-if="!loading && hasActivities">
          <div v-for="dot in thisWeek.dots" :key="dot.label" class="hero-dot-col">
            <div :class="['hero-dot', { 'hero-dot-active': dot.active }]"></div>
            <span class="hero-dot-label">{{ dot.label }}</span>
          </div>
        </div>

        <div class="hero-chips">
          <template v-if="loading">
            <div class="hero-chip" v-for="n in 4" :key="n">
              <span class="chip-val chip-skeleton"></span>
              <span class="chip-label chip-skeleton chip-skeleton-sm"></span>
            </div>
          </template>
          <template v-else>
            <div class="hero-chip">
              <span class="chip-val">{{ formatDistance(thisWeek.distMeters) }}</span>
              <span class="chip-label">This Week</span>
              <span v-if="thisWeek.priorDistMeters > 0"
                :class="['chip-delta', thisWeek.distDelta >= 0 ? 'delta-up' : 'delta-down']">
                {{ thisWeek.distDelta >= 0 ? '▲' : '▼' }} {{ formatDistance(Math.abs(thisWeek.distDelta)) }} vs last wk
              </span>
            </div>
            <div class="hero-chip">
              <span class="chip-val">{{ thisWeek.count }}</span>
              <span class="chip-label">Activities</span>
              <span v-if="thisWeek.priorCount > 0"
                :class="['chip-delta', (thisWeek.count - thisWeek.priorCount) >= 0 ? 'delta-up' : 'delta-down']">
                {{ (thisWeek.count - thisWeek.priorCount) >= 0 ? '▲' : '▼' }} {{ Math.abs(thisWeek.count - thisWeek.priorCount) }} vs last wk
              </span>
            </div>
            <div class="hero-chip">
              <span class="chip-val">{{ formatDuration(thisWeek.durationSeconds) }}</span>
              <span class="chip-label">Time This Week</span>
            </div>
            <div class="hero-chip">
              <span class="chip-val">{{ streak.current }}<span class="chip-val-unit"> wk</span></span>
              <span class="chip-label">Active Streak</span>
              <span class="chip-delta" style="color:rgba(255,255,255,0.45)" v-if="streak.best >= 2">Best: {{ streak.best }}wk</span>
            </div>
          </template>
        </div>
      </div>
    </section>

    <!-- JUMP NAV -->
    <nav class="stats-jumpnav">
      <div class="jumpnav-inner">
        <button v-for="s in [
          { id: 'records',  label: 'Records'     },
          { id: 'races',    label: 'Predictions' },
          { id: 'fitness',  label: 'Fitness'     },
          { id: 'load',     label: 'Load'        },
          { id: 'log',      label: 'Log'         },
          { id: 'style',    label: 'Style'       },
          { id: 'journey',  label: 'Journey'     },
          { id: 'totals',   label: 'All-Time'    },
        ]" :key="s.id"
          :class="['jumpnav-btn', { active: activeSection === s.id }]"
          @click="jumpTo(s.id)"
        >{{ s.label }}</button>
      </div>
    </nav>

    <div class="stats-content">

      <!-- EMPTY STATE -->
      <EmptyState
        v-if="!hasActivities"
        icon="bi-lightning-charge"
        title="No activities yet"
        message="Log your first run, ride, or workout to unlock your full stats dashboard."
        actionLabel="Log Activity"
        actionTo="/activities/new"
      />

      <template v-if="hasActivities">

      <!-- PERSONAL RECORDS -->
      <section id="stats-records" class="section">
        <div class="section-header">
          <span class="section-kicker">Personal Records</span>
        </div>
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
              <router-link v-if="pr.data.id" :to="`/activities/${pr.data.id}`" class="pr-link">View activity →</router-link>
            </template>
            <template v-else>
              <div class="pr-empty">No record yet</div>
            </template>
          </div>
        </div>
      </section>

      <!-- RACE PREDICTIONS -->
      <section id="stats-races" class="section" v-if="performanceMetrics?.racePreds">
        <div class="section-header">
          <span class="section-kicker">Race Predictions</span>
        </div>
        <div class="race-pred-grid">
          <div v-for="(time, dist) in performanceMetrics.racePreds" :key="dist" class="race-pred-card">
            <div class="race-pred-dist">{{ dist }}</div>
            <div class="race-pred-time">{{ time }}</div>
            <div class="race-pred-sub">Riegel estimate</div>
          </div>
        </div>
        <p class="race-pred-note">Based on your fastest recent effort — actual race times depend on conditions and fitness level.</p>
      </section>

      <!-- FITNESS -->
      <section id="stats-fitness" class="section">
        <div class="section-header">
          <span class="section-kicker">Fitness</span>
        </div>

        <!-- VO2max trend chart -->
        <div class="fitness-chart-card" v-if="vo2maxTrend.length >= 2">
          <div class="fitness-chart-header">
            <div>
              <div class="fitness-chart-title">VO2max Trend</div>
              <div class="fitness-chart-sub">Aerobic capacity estimate per run · Jack Daniels formula</div>
            </div>
            <div class="fitness-vo2-badge" v-if="performanceMetrics?.vo2max">
              <span class="fitness-vo2-val">{{ performanceMetrics.vo2max }}</span>
              <span class="fitness-vo2-unit">ml/kg/min</span>
            </div>
          </div>
          <div class="fitness-chart-wrap">
            <canvas ref="vo2maxChartRef"></canvas>
          </div>
        </div>
        <div class="fitness-empty-note" v-else>
          Log at least 2 runs over 2 km to unlock your VO2max trend.
        </div>

        <!-- Fitness metric row -->
        <div class="fitness-metric-row" v-if="performanceMetrics">
          <div class="fitness-metric-card">
            <div class="fm-label">Form</div>
            <div class="fm-val" :style="{ color: formColor }">{{ performanceMetrics.formScore > 0 ? '+' : '' }}{{ performanceMetrics.formScore }}</div>
            <div class="fm-sub">{{ formLabel }}</div>
          </div>
          <div class="fitness-metric-card">
            <div class="fm-label">Consistency</div>
            <div class="fm-val">{{ performanceMetrics.consistency }}<span class="fm-unit">%</span></div>
            <div class="fm-sub">{{ consistencyLabel }}</div>
            <div class="perf-bar-bg">
              <div class="perf-bar" :style="{ width: performanceMetrics.consistency + '%', background: '#0052FF' }"></div>
            </div>
          </div>
          <div class="fitness-metric-card">
            <div class="fm-label">Fitness Base</div>
            <div class="fm-val">{{ performanceMetrics.fitnessScore }}</div>
            <div class="fm-sub">Chronic Training Load</div>
            <div class="perf-bar-bg">
              <div class="perf-bar" :style="{ width: performanceMetrics.fitnessScore + '%', background: '#0052FF' }"></div>
            </div>
          </div>
          <div class="fitness-metric-card">
            <div class="fm-label">Fatigue</div>
            <div class="fm-val">{{ performanceMetrics.fatigueScore }}</div>
            <div class="fm-sub">Acute Training Load</div>
            <div class="perf-bar-bg">
              <div class="perf-bar" :style="{ width: performanceMetrics.fatigueScore + '%', background: '#000' }"></div>
            </div>
          </div>
        </div>
      </section>

      <!-- TRAINING LOAD -->
      <section id="stats-load" class="section">
        <div class="section-header-row" style="margin-bottom:20px">
          <span class="section-kicker" style="border:none;padding-bottom:0">Training Load</span>
          <div class="period-toggle">
            <button :class="['period-btn', { active: chartPeriod === 'monthly' }]" @click="setPeriod('monthly')">Monthly</button>
            <button :class="['period-btn', { active: chartPeriod === 'weekly' }]" @click="setPeriod('weekly')">Weekly</button>
          </div>
        </div>
        <div class="chart-card" style="margin-bottom:16px">
          <canvas ref="weeklyChartRef"></canvas>
        </div>
        <div class="insights-row" v-if="acwrInfo || weeklyTargetKm || daysSinceLastActivity !== null">
          <div class="insight-card" v-if="acwrInfo">
            <div class="insight-head">
              <span class="insight-label">Injury Risk (ACWR)</span>
              <span class="insight-badge" :style="{ background: acwrInfo.color }">{{ acwrInfo.label }}</span>
            </div>
            <div class="insight-val" :style="{ color: acwrInfo.color }">{{ acwrScore }}</div>
            <div class="insight-sub">{{ acwrInfo.desc }}</div>
            <div class="acwr-gauge">
              <div class="acwr-zone" style="width:40%; background:#E5E5E5"></div>
              <div class="acwr-zone" style="width:10%; background:#EBF0FF"></div>
              <div class="acwr-zone" style="width:15%; background:#0052FF"></div>
              <div class="acwr-zone" style="width:10%; background:#111111"></div>
              <div class="acwr-zone" style="width:25%; background:#ef4444"></div>
              <div class="acwr-needle" :style="{ left: Math.min(98, (acwrScore / 2) * 100) + '%' }"></div>
            </div>
            <div class="acwr-ticks">
              <span>0</span><span>0.8</span><span>1.0</span><span>1.3</span><span>1.5</span><span>2.0</span>
            </div>
          </div>
          <div class="insight-card" v-if="weeklyTargetKm">
            <div class="insight-head">
              <span class="insight-label">This Week's Target</span>
            </div>
            <div class="insight-val">{{ weeklyTargetKm }} <span class="insight-unit">{{ distanceLabel }}</span></div>
            <div class="insight-sub">Based on your last 4 weeks (+5% progression)</div>
            <div class="insight-tip">
              <i class="bi bi-lightbulb-fill"></i>
              Staying in this range keeps ACWR in the 0.8–1.3 safe zone.
            </div>
          </div>
          <div class="insight-card" v-if="daysSinceLastActivity !== null">
            <div class="insight-head">
              <span class="insight-label">Last Activity</span>
              <span class="insight-badge" :style="{ background: daysSinceLastActivity === 0 ? '#0052FF' : daysSinceLastActivity <= 2 ? '#767676' : '#ef4444' }">
                {{ daysSinceLastActivity === 0 ? 'Today' : daysSinceLastActivity === 1 ? 'Yesterday' : `${daysSinceLastActivity}d ago` }}
              </span>
            </div>
            <div class="insight-val" :style="{ color: daysSinceLastActivity <= 1 ? '#0052FF' : daysSinceLastActivity <= 3 ? '#767676' : '#ef4444' }">
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

      <!-- TRAINING LOG -->
      <section id="stats-log" class="section" v-if="heatmapData.length">
        <div class="section-header">
          <span class="section-kicker">Training Log</span>
        </div>
        <div class="heatmap-card">
          <div class="heatmap-scroll">
            <div class="heatmap-months">
              <span v-for="m in heatmapMonths" :key="m.col" class="heatmap-month" :style="{ gridColumn: m.col + 1 }">{{ m.label }}</span>
            </div>
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
        <Teleport to="body">
          <div v-if="heatmapTooltip" class="heatmap-tooltip" :style="{ left: heatmapTooltip.x + 'px', top: (heatmapTooltip.y - 44) + 'px' }">{{ heatmapTooltip.text }}</div>
        </Teleport>
      </section>

      <!-- RUNNING STYLE -->
      <section id="stats-style" class="section">
        <div class="section-header">
          <span class="section-kicker">Your Running Style</span>
        </div>
        <div class="archetype-card">
          <div class="arch-card-left">
            <i :class="['bi', archetypeData.icon, 'arch-big-icon']" :style="{ color: archetypeData.color }"></i>
            <div class="arch-label" :style="{ color: archetypeData.color }">{{ archetypeData.label }}</div>
            <div class="arch-tagline">{{ archetypeData.tagline }}</div>
          </div>
          <div class="arch-card-right">
            <div class="arch-traits-label">DEFINING TRAITS</div>
            <div class="arch-traits">
              <div v-for="trait in archetypeData.traits" :key="trait" class="arch-trait-row">
                <span class="arch-trait-dot" :style="{ background: archetypeData.color }"></span>
                <span class="arch-trait-text">{{ trait }}</span>
              </div>
            </div>
            <div class="arch-how-label">HOW IT'S COMPUTED</div>
            <p class="arch-how-text">Based on your pace profile, activity frequency, early-morning ratio, sport diversity, and long-run history from your last 90 days of training.</p>
          </div>
        </div>
      </section>

      <!-- YOUR JOURNEY -->
      <section id="stats-journey" class="section" v-if="growthTimeline.length">
        <div class="section-header">
          <span class="section-kicker">Your Journey</span>
        </div>
        <div class="journey-scroll-wrap">
          <div class="journey-track">
            <div v-for="(m, i) in growthTimeline" :key="i" class="journey-node">
              <div class="jnode-icon">{{ m.icon }}</div>
              <div class="jnode-line" v-if="i < growthTimeline.length - 1"></div>
              <div class="jnode-label">{{ m.label }}</div>
              <div class="jnode-date">{{ m.date }}</div>
            </div>
          </div>
        </div>
        <div class="journey-empty-cta" v-if="growthTimeline.length < 3">
          <p>Keep logging — more milestones unlock as you train.</p>
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

      <!-- ALL-TIME TOTALS -->
      <section id="stats-totals" class="section">
        <div class="section-header">
          <span class="section-kicker">All-Time Totals</span>
        </div>
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

      </template><!-- end v-if="hasActivities" -->

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useActivityStore } from '@/stores/activity'
import { usePRStore } from '@/stores/pr'
import { storeToRefs } from 'pinia'
import { Chart, registerables } from 'chart.js'
import { useUnits } from '@/composables/useUnits'
import { useArchetype } from '@/composables/useArchetype'
import { useGrowthTimeline } from '@/composables/useGrowthTimeline'
import AppSpinner from '@/components/AppSpinner.vue'
import EmptyState from '@/components/EmptyState.vue'
import { useWorkoutClassifier } from '@/composables/useWorkoutClassifier'

Chart.register(...registerables)

const { classifyActivity } = useWorkoutClassifier()

const activityStore = useActivityStore()
const prStore = usePRStore()
const { activities, loading } = storeToRefs(activityStore)
const initializing = ref(true)
const hasActivities = computed(() => initializing.value || loading.value || activities.value.length > 0)

const {
  isImperial,
  distanceLabel,
  formatDistance,
  formatDuration,
  formatDurationClock,
  formatPace,
  formatElevation,
} = useUnits()

const weeklyChartRef  = ref(null)
const pieChartRef     = ref(null)
const vo2maxChartRef  = ref(null)
let weeklyChartInstance  = null
let pieChartInstance     = null
let vo2maxChartInstance  = null

const chartPeriod = ref('monthly') // 'monthly' | 'weekly'

function setPeriod(p) {
  chartPeriod.value = p
  nextTick(initWeeklyChart)
}

// ── Career totals ─────────────────────────────────
const careerMeters = computed(() =>
  (activities.value || []).reduce((s, a) => s + (a.distanceMeters || 0), 0)
)
const careerSeconds = computed(() =>
  (activities.value || []).reduce((s, a) => s + (a.durationSeconds || 0), 0)
)
const careerElevation = computed(() =>
  (activities.value || []).reduce((s, a) => s + (a.elevationMeters ?? a.elevationGain ?? 0), 0)
)

// ── This Week ─────────────────────────────────────
const thisWeek = computed(() => {
  const acts = activities.value || []
  const now = new Date()
  now.setHours(23, 59, 59, 999)
  const dayMs = 86400000

  // Rolling 7-day window for "this week", prior 7 days for comparison
  const weekStart = new Date(now.getTime() - 6 * dayMs)
  weekStart.setHours(0, 0, 0, 0)
  const priorStart = new Date(weekStart.getTime() - 7 * dayMs)

  const thisActs  = acts.filter(a => new Date(a.createdAt) >= weekStart)
  const priorActs = acts.filter(a => { const d = new Date(a.createdAt); return d >= priorStart && d < weekStart })

  const sumDist = arr => arr.reduce((s, a) => s + (a.distanceMeters || 0), 0)
  const sumDur  = arr => arr.reduce((s, a) => s + (a.durationSeconds || 0), 0)

  const distMeters      = sumDist(thisActs)
  const priorDistMeters = sumDist(priorActs)

  // 7-day dot indicators — oldest on left, today on right
  const dots = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * dayMs)
    d.setHours(0, 0, 0, 0)
    const dEnd = new Date(d); dEnd.setHours(23, 59, 59, 999)
    const active = acts.some(a => { const ad = new Date(a.createdAt); return ad >= d && ad <= dEnd })
    dots.push({ label: d.toLocaleDateString('en-US', { weekday: 'short' })[0], active })
  }

  return {
    count: thisActs.length,
    priorCount: priorActs.length,
    distMeters,
    priorDistMeters,
    distDelta: distMeters - priorDistMeters,
    durationSeconds: sumDur(thisActs),
    dots,
  }
})

// ── Active Streak (consecutive weeks with ≥1 activity) ───────────
const streak = computed(() => {
  const acts = activities.value || []
  if (!acts.length) return { current: 0, best: 0 }

  const dayMs  = 86400000
  const weekMs = 7 * dayMs
  const now    = new Date(); now.setHours(23, 59, 59, 999)

  // Normalize to the Sunday of a given date
  const toSunday = (d) => {
    const s = new Date(d); s.setDate(s.getDate() - s.getDay()); s.setHours(0, 0, 0, 0); return s
  }
  const hasAct = (wStart) => {
    const wEnd = new Date(wStart.getTime() + weekMs - 1)
    return acts.some(a => { const d = new Date(a.createdAt); return d >= wStart && d <= wEnd })
  }

  // Current streak — walk backwards from this week
  let current = 0
  for (let i = 0; i < 104; i++) {
    if (hasAct(toSunday(new Date(now.getTime() - i * weekMs)))) current++
    else break
  }

  // Best streak ever — walk forward from first activity's week
  const firstDate = acts.reduce((min, a) => { const d = new Date(a.createdAt); return d < min ? d : min }, new Date())
  const firstWk   = toSunday(firstDate)
  const numWeeks  = Math.ceil((now - firstWk) / weekMs) + 2

  let best = 0, temp = 0
  for (let i = 0; i < numWeeks; i++) {
    if (hasAct(new Date(firstWk.getTime() + i * weekMs))) { temp++; best = Math.max(best, temp) }
    else temp = 0
  }

  return { current, best }
})

// ── Performance Intelligence ──────────────────────
const performanceMetrics = computed(() => {
  const acts = activities.value || []
  if (!acts.length) return null

  const today = new Date()
  today.setHours(23, 59, 59, 999)
  const dayMs = 86400000
  const DAYS  = 90

  const IF_BY_TYPE = {
    RUN: 0.85, Running: 0.85,
    BIKE: 0.75, Cycling: 0.75,
    SWIM: 0.70, Swimming: 0.70,
  }

  // Daily TSS proxy: (hours × IF²) × 100
  const dailyTss = new Array(DAYS).fill(0)
  for (const a of acts) {
    const daysAgo = Math.floor((today - new Date(a.createdAt)) / dayMs)
    if (daysAgo >= 0 && daysAgo < DAYS) {
      const ifFactor = IF_BY_TYPE[a.sportType] || 0.75
      const tss = ((a.durationSeconds || 0) / 3600) * (ifFactor * ifFactor) * 100
      dailyTss[DAYS - 1 - daysAgo] += tss
    }
  }

  // EMA — CTL (42d) and ATL (7d) using industry-standard 2/(τ+1) smoothing
  let ctl = 0, atl = 0
  const ctlK = 2 / 43, atlK = 2 / 8
  for (let i = 0; i < DAYS; i++) {
    ctl = ctl * (1 - ctlK) + dailyTss[i] * ctlK
    atl = atl * (1 - atlK) + dailyTss[i] * atlK
  }

  const fitnessScore = Math.min(100, Math.round(ctl))
  const fatigueScore = Math.min(100, Math.round(atl))
  const formScore    = Math.round(fitnessScore - fatigueScore)

  // Recent runs for VO2max + race predictions
  const recentRuns = acts
    .filter(a => ['RUN', 'Running'].includes(a.sportType) && (a.distanceMeters || 0) > 2000 && (a.durationSeconds || 0) > 600)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 15)

  // VO2max — Jack Daniels formula with distance-appropriate effort utilization
  let vo2max = null
  for (const r of recentRuns) {
    const v           = r.distanceMeters / (r.durationSeconds / 60) // m/min
    const utilization = r.distanceMeters < 5500  ? 0.985
                      : r.distanceMeters < 11000 ? 0.952
                      : r.distanceMeters < 22000 ? 0.901
                      : 0.83
    const daniels  = -4.60 + 0.182258 * v + 0.000104 * v * v
    const estimate = daniels / utilization
    if (estimate > 25 && (vo2max === null || estimate > vo2max)) vo2max = estimate
  }
  if (vo2max !== null) vo2max = Math.min(85, Math.round(vo2max * 10) / 10)

  // Race predictions — Riegel formula from fastest recent effort, all 4 distances always shown
  let racePreds = null
  if (recentRuns.length > 0) {
    const bestRun  = recentRuns.reduce((best, r) => {
      const s = r.distanceMeters / r.durationSeconds
      return s > best.s ? { r, s } : best
    }, { r: recentRuns[0], s: 0 }).r
    const knownKm  = bestRun.distanceMeters / 1000
    const knownMin = bestRun.durationSeconds / 60
    const riegel   = (targetKm) => {
      const t = knownMin * Math.pow(targetKm / knownKm, 1.06)
      const h = Math.floor(t / 60)
      const m = Math.floor(t % 60)
      const s = Math.round((t * 60) % 60)
      return h > 0
        ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
        : `${m}:${String(s).padStart(2, '0')}`
    }
    racePreds = { '5K': riegel(5), '10K': riegel(10), 'Half': riegel(21.0975), 'Marathon': riegel(42.195) }
  }

  // Consistency: % of last 12 weeks with ≥1 activity
  let activeWeeks = 0
  const now = new Date()
  for (let i = 0; i < 12; i++) {
    const wEnd   = new Date(now.getTime() - i * 7 * dayMs)
    const wStart = new Date(wEnd.getTime() - 6 * dayMs)
    if (acts.some(a => { const d = new Date(a.createdAt); return d >= wStart && d <= wEnd })) activeWeeks++
  }
  const consistency = Math.round((activeWeeks / 12) * 100)

  return { fitnessScore, fatigueScore, formScore, vo2max, racePreds, consistency, ctl, atl }
})

const formColor = computed(() => {
  const f = performanceMetrics.value?.formScore ?? 0
  if (f > 10)  return '#0052FF'
  if (f > -5)  return '#767676'
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

// ── VO2max Trend ──────────────────────────────────
// Compute a per-run VO2max estimate for up to the last 30 qualifying runs
const vo2maxTrend = computed(() => {
  return (activities.value || [])
    .filter(a =>
      ['RUN', 'Running'].includes(a.sportType) &&
      (a.distanceMeters || 0) > 2000 &&
      (a.durationSeconds || 0) > 600
    )
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .slice(-30)
    .map(r => {
      const v    = r.distanceMeters / (r.durationSeconds / 60)
      const util = r.distanceMeters < 5500  ? 0.985
                 : r.distanceMeters < 11000 ? 0.952
                 : r.distanceMeters < 22000 ? 0.901
                 : 0.83
      const est  = (-4.60 + 0.182258 * v + 0.000104 * v * v) / util
      return {
        date:   new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        vo2max: Math.min(85, Math.max(25, Math.round(est * 10) / 10)),
      }
    })
})

const archetypeData  = computed(() => useArchetype(activities.value))
const growthTimeline = computed(() => useGrowthTimeline(activities.value))

const activeSection = ref('records')

const jumpTo = (id) => {
  activeSection.value = id
  const el = document.getElementById(`stats-${id}`)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// ── ACWR ──────────────────────────────────────────
const acwrScore = computed(() => {
  const m = performanceMetrics.value
  if (!m || m.ctl === 0) return null
  return Math.round((m.atl / m.ctl) * 100) / 100
})

const acwrInfo = computed(() => {
  const a = acwrScore.value
  if (a === null) return null
  if (a < 0.8)  return { label: 'Undertraining',    color: '#767676', desc: 'Gradually increase volume to build fitness' }
  if (a < 1.0)  return { label: 'Optimal Base',     color: '#0052FF', desc: 'Solid aerobic foundation, safe to add load' }
  if (a < 1.3)  return { label: 'Productive Load',  color: '#0052FF', desc: 'Good training stimulus, manage recovery' }
  if (a < 1.5)  return { label: 'Caution Zone',     color: '#000000', desc: 'Monitor fatigue — consider an easy day' }
  return           { label: 'High Injury Risk',  color: '#ef4444', desc: 'Reduce load or take a rest day now' }
})

// ── Weekly distance data (used for target calc + chart) ───────────
const weeklyData = computed(() => {
  const now = new Date()
  const weeks = []
  for (let i = 11; i >= 0; i--) {
    const end   = new Date(now); end.setDate(now.getDate() - i * 7)
    const start = new Date(end); start.setDate(end.getDate() - 6)
    const label = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const meters = (activities.value || [])
      .filter(a => { const d = new Date(a.createdAt); return d >= start && d <= end })
      .reduce((s, a) => s + (a.distanceMeters || 0), 0)
    const dist = isImperial.value
      ? parseFloat((meters / 1000 * 0.621371).toFixed(2))
      : parseFloat((meters / 1000).toFixed(2))
    weeks.push({ label, dist })
  }
  return weeks
})

const monthlyData = computed(() => {
  const now    = new Date()
  const months = []
  for (let i = 11; i >= 0; i--) {
    const d     = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const start = new Date(d.getFullYear(), d.getMonth(), 1)
    const end   = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)
    const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    const meters = (activities.value || [])
      .filter(a => { const ad = new Date(a.createdAt); return ad >= start && ad <= end })
      .reduce((s, a) => s + (a.distanceMeters || 0), 0)
    const dist = isImperial.value
      ? parseFloat((meters / 1000 * 0.621371).toFixed(2))
      : parseFloat((meters / 1000).toFixed(2))
    months.push({ label, dist })
  }
  return months
})

const activeChartData = computed(() =>
  chartPeriod.value === 'monthly' ? monthlyData.value : weeklyData.value
)

const weeklyTargetKm = computed(() => {
  // Average of last 4 weeks of actual distance, suggest +5% progression
  const recent = weeklyData.value.slice(-4)
  if (!recent.length) return null
  const avg = recent.reduce((s, w) => s + w.dist, 0) / recent.length
  if (avg === 0) return null
  return Math.round(avg * 1.05 * 10) / 10
})

const daysSinceLastActivity = computed(() => {
  const acts = activities.value || []
  if (!acts.length) return null
  const latest = acts.reduce((max, a) => { const d = new Date(a.createdAt); return d > max ? d : max }, new Date(0))
  return Math.floor((Date.now() - latest.getTime()) / 86400000)
})

// ── 52-week heatmap ───────────────────────────────
const heatmapData = computed(() => {
  const acts  = activities.value || []
  const today = new Date(); today.setHours(23, 59, 59, 999)

  const dailyKm = {}
  for (const a of acts) {
    if (!a.createdAt) continue
    const key = new Date(a.createdAt).toISOString().slice(0, 10)
    dailyKm[key] = (dailyKm[key] || 0) + (a.distanceMeters || 0) / 1000
  }

  const start = new Date(today)
  start.setDate(start.getDate() - 363)
  start.setDate(start.getDate() - start.getDay())

  const weeks = []
  const cur   = new Date(start)
  while (cur <= today) {
    const week = []
    for (let d = 0; d < 7; d++) {
      const isFuture = new Date(cur) > today
      const key = new Date(cur).toISOString().slice(0, 10)
      const km  = isFuture ? 0 : (dailyKm[key] || 0)
      week.push({
        date:      key,
        km,
        level:     isFuture ? -1 : km === 0 ? 0 : km < 5 ? 1 : km < 10 ? 2 : km < 20 ? 3 : 4,
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

// ── Sport breakdown ───────────────────────────────
const SPORT_COLORS = {
  RUN: '#0C0C0C',      Running: '#0C0C0C',
  BIKE: '#404040',     Cycling: '#404040',
  SWIM: '#707070',     Swimming: '#707070',
  HIKE: '#A0A0A0',     Hiking: '#A0A0A0',
  WALK: '#C8C8C8',     Walking: '#C8C8C8',
  OTHER: '#E0E0E0',
}
const sportBreakdown = computed(() => {
  const map = {}
  for (const a of (activities.value || [])) map[a.sportType] = (map[a.sportType] || 0) + 1
  return Object.entries(map).map(([type, count]) => ({ type, count, color: SPORT_COLORS[type] || SPORT_COLORS.OTHER }))
})

// Format a PR value for display
function formatPRValue(pr) {
  const d = pr.data
  if (!d) return ''
  switch (pr.id) {
    case 'best_5k': case 'best_10k': case 'best_half': case 'best_marathon':
      return formatDurationClock(d.estTime)
    case 'fastest_pace':
      return formatPace(d.pace / 60)
    case 'longest_run': case 'longest_ride':
      return formatDistance(d.distanceMeters)
    case 'most_elevation':
      return formatElevation(d.elevationMeters)
    default:
      return ''
  }
}

// ── Charts ────────────────────────────────────────
function initWeeklyChart() {
  if (!weeklyChartRef.value) return
  if (weeklyChartInstance) weeklyChartInstance.destroy()
  weeklyChartInstance = new Chart(weeklyChartRef.value.getContext('2d'), {
    type: 'bar',
    data: {
      labels: activeChartData.value.map(w => w.label),
      datasets: [{
        label: `Distance (${distanceLabel.value})`,
        data: activeChartData.value.map(w => w.dist),
        backgroundColor: 'rgba(0,82,255,0.75)',
        borderColor: '#0052FF',
        borderWidth: 0,
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
          grid: { color: 'rgba(0,0,0,0.04)' },
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
  if (pieChartInstance) pieChartInstance.destroy()
  const bd = sportBreakdown.value
  if (!bd.length) return
  pieChartInstance = new Chart(pieChartRef.value.getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: bd.map(s => s.type),
      datasets: [{ data: bd.map(s => s.count), backgroundColor: bd.map(s => s.color), borderWidth: 0 }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: { legend: { display: false } },
      cutout: '68%',
    }
  })
}

function initVo2maxChart() {
  if (!vo2maxChartRef.value || vo2maxTrend.value.length < 2) return
  if (vo2maxChartInstance) { vo2maxChartInstance.destroy(); vo2maxChartInstance = null }
  const pts = vo2maxTrend.value
  vo2maxChartInstance = new Chart(vo2maxChartRef.value.getContext('2d'), {
    type: 'line',
    data: {
      labels: pts.map(p => p.date),
      datasets: [{
        label: 'VO2max estimate',
        data: pts.map(p => p.vo2max),
        borderColor: '#0052FF',
        backgroundColor: 'rgba(0,82,255,0.06)',
        fill: true,
        tension: 0.35,
        borderWidth: 2.5,
        pointRadius: pts.length > 15 ? 0 : 3,
        pointBackgroundColor: '#0052FF',
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: { label: (item) => `VO2max: ${item.parsed.y} ml/kg/min` }
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 10 }, maxTicksLimit: 8, maxRotation: 0 } },
        y: { beginAtZero: false, grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { maxTicksLimit: 5 } }
      }
    }
  })
}

onMounted(async () => {
  initializing.value = true
  await activityStore.fetchActivities()
  initializing.value = false
  await prStore.fetchPRs(activities.value)
  await nextTick()
  initWeeklyChart()
  initPieChart()
  initVo2maxChart()
})

onUnmounted(() => {
  if (weeklyChartInstance) { weeklyChartInstance.destroy();  weeklyChartInstance  = null }
  if (pieChartInstance)    { pieChartInstance.destroy();     pieChartInstance     = null }
  if (vo2maxChartInstance) { vo2maxChartInstance.destroy();  vo2maxChartInstance  = null }
})
</script>

<style scoped>
.stats-page {
  min-height: 100vh;
  padding-top: var(--nav-h, 64px);
  background: #fff;
  font-family: Futura, "Futura PT", "Futura Std", "Avenir Next", Avenir, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
}

/* ── HERO ───────────────────────────────────────── */
.hero {
  background: #000;
  color: white;
  padding: 48px 24px 44px;
}
.hero-inner {
  max-width: 900px;
  margin: 0 auto;
  text-align: center;
}
.hero-kicker {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  color: rgba(255,255,255,0.45);
  text-transform: uppercase;
  margin-bottom: 12px;
}
.hero-title {
  font-size: clamp(2.4rem, 5vw, 4rem);
  font-weight: 900;
  margin: 0 0 28px;
  line-height: 1;
  letter-spacing: -0.02em;
}

/* 7-day dots */
.hero-dots {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 28px;
}
.hero-dot-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.hero-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255,255,255,0.18);
  border: 1px solid rgba(255,255,255,0.25);
  transition: background 0.2s;
}
.hero-dot-active {
  background: #0052FF;
  border-color: #0052FF;
  box-shadow: 0 0 6px rgba(0,82,255,0.6);
}
.hero-dot-label {
  font-size: 0.60rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: rgba(255,255,255,0.35);
  text-transform: uppercase;
}

/* Chips */
.hero-chips {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}
.hero-chip {
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.18);
  border-radius: 0;
  padding: 16px 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 120px;
}
.chip-val {
  font-size: 1.5rem;
  font-weight: 900;
  color: white;
  line-height: 1;
}
.chip-val-unit {
  font-size: 1rem;
  font-weight: 700;
}
.chip-label {
  font-size: 0.68rem;
  font-weight: 700;
  color: rgba(255,255,255,0.55);
  text-transform: uppercase;
  letter-spacing: 0.10em;
}
.chip-delta {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  margin-top: 2px;
}
.delta-up   { color: #4ade80; }
.delta-down { color: #f87171; }

.chip-skeleton {
  display: block;
  background: linear-gradient(90deg, rgba(255,255,255,0.08) 25%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0.08) 75%);
  background-size: 400px 100%;
  animation: chip-shimmer 1.4s infinite;
  border-radius: 0;
  width: 80px;
  height: 1.6rem;
}
.chip-skeleton-sm { width: 60px; height: 0.75rem; margin-top: 4px; }
@keyframes chip-shimmer {
  from { background-position: -400px 0; }
  to   { background-position:  400px 0; }
}

/* ── JUMP NAV ──────────────────────────────────── */
.stats-jumpnav {
  position: sticky;
  top: var(--nav-h, 64px);
  z-index: 50;
  background: #fff;
  border-bottom: 1px solid #E5E5E5;
  -webkit-mask-image: linear-gradient(to right, #000 85%, transparent 100%);
          mask-image: linear-gradient(to right, #000 85%, transparent 100%);
}
@media (min-width: 900px) {
  .stats-jumpnav { -webkit-mask-image: none; mask-image: none; }
}
.jumpnav-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 24px 0 24px;
  padding-right: 48px;
  display: flex;
  gap: 0;
  overflow-x: auto;
  scrollbar-width: none;
}
.jumpnav-inner::-webkit-scrollbar { display: none; }
.jumpnav-btn {
  padding: 14px 20px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #767676;
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.15s, border-color 0.15s;
  font-family: inherit;
}
.jumpnav-btn:hover { color: #000; }
.jumpnav-btn.active { color: #000; border-bottom-color: #000; }

/* ── SECTION SHARED ────────────────────────────── */
.stats-content {
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px 24px 80px;
}
.section { margin-bottom: 52px; }
.section-header {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}
.section-kicker {
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(15,18,16,0.40);
  display: block;
  padding-bottom: 12px;
  border-bottom: 1px solid #E5E5E5;
  width: 100%;
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
}
.period-toggle { display: flex; border: 1px solid #E5E5E5; }
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
  font-family: inherit;
}
.period-btn + .period-btn { border-left: 1px solid #E5E5E5; }
.period-btn.active { background: #000; color: #fff; }

/* ── RACE PREDICTIONS ──────────────────────────── */
.race-pred-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 12px;
}
.race-pred-card {
  border: 1px solid #E5E5E5;
  padding: 24px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.race-pred-dist {
  font-size: 0.70rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: rgba(15,18,16,0.45);
}
.race-pred-time {
  font-size: 1.8rem;
  font-weight: 900;
  color: #000;
  line-height: 1.1;
}
.race-pred-sub {
  font-size: 0.68rem;
  color: #767676;
  font-weight: 600;
}
.race-pred-note {
  font-size: 0.72rem;
  color: #767676;
  margin: 0;
}

/* ── FITNESS ───────────────────────────────────── */
.fitness-chart-card {
  border: 1px solid #E5E5E5;
  padding: 24px;
  margin-bottom: 16px;
}
.fitness-chart-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 16px;
}
.fitness-chart-title {
  font-size: 0.85rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #000;
  margin-bottom: 4px;
}
.fitness-chart-sub {
  font-size: 0.72rem;
  color: #767676;
}
.fitness-vo2-badge {
  text-align: right;
  flex-shrink: 0;
}
.fitness-vo2-val {
  display: block;
  font-size: 2rem;
  font-weight: 900;
  color: #0052FF;
  line-height: 1;
}
.fitness-vo2-unit {
  font-size: 0.68rem;
  font-weight: 700;
  color: #767676;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.fitness-chart-wrap {
  height: 200px;
  position: relative;
}
.fitness-chart-wrap canvas {
  width: 100% !important;
  height: 100% !important;
}
.fitness-empty-note {
  border: 1px solid #E5E5E5;
  padding: 20px 24px;
  font-size: 0.80rem;
  color: #767676;
  margin-bottom: 16px;
}
.fitness-metric-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.fitness-metric-card {
  border: 1px solid #E5E5E5;
  padding: 20px 18px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.fm-label {
  font-size: 0.70rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(15,18,16,0.45);
}
.fm-val {
  font-size: 2rem;
  font-weight: 900;
  color: #000;
  line-height: 1.1;
}
.fm-unit {
  font-size: 1.1rem;
  font-weight: 700;
}
.fm-sub {
  font-size: 0.72rem;
  color: rgba(15,18,16,0.50);
  font-weight: 600;
  margin-bottom: 4px;
}
.perf-bar-bg {
  height: 4px;
  background: #F0F0F0;
  margin-top: auto;
}
.perf-bar {
  height: 100%;
  transition: width 0.6s ease;
}

/* ── TRAINING LOG HEATMAP ──────────────────────── */
.heatmap-card {
  background: white;
  border: 1px solid #E5E5E5;
  padding: 20px 20px 16px;
}
.heatmap-scroll { overflow-x: auto; padding-bottom: 4px; }
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
.heatmap-grid   { display: flex; gap: 2px; min-width: max-content; }
.heatmap-week   { display: flex; flex-direction: column; gap: 2px; }
.heatmap-cell   { width: 12px; height: 12px; border-radius: 0; flex-shrink: 0; }
.heatmap-l0 { background: #F0F0F0; }
.heatmap-l1 { background: #bbf7d0; }
.heatmap-l2 { background: #4ade80; }
.heatmap-l3 { background: #0052FF; }
.heatmap-l4 { background: #064e3b; }
.heatmap-lx { background: transparent; }
.heatmap-legend {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 12px;
  justify-content: flex-end;
}
.heatmap-legend-label { font-size: 0.70rem; color: rgba(15,18,16,0.45); font-weight: 700; }
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

/* ── TRAINING INSIGHTS ─────────────────────────── */
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
.insight-val  { font-size: 2rem; font-weight: 900; color: #000; line-height: 1; }
.insight-unit { font-size: 1rem; font-weight: 700; color: rgba(15,18,16,0.50); }
.insight-sub  { font-size: 0.75rem; color: rgba(15,18,16,0.55); font-weight: 600; line-height: 1.4; margin-top: 2px; }
.insight-tip  {
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
.acwr-zone   { height: 100%; }
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

/* ── PERSONAL RECORDS ──────────────────────────── */
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
  opacity: 0.65;
}
.pr-card.pr-card-set {
  opacity: 1;
  border-color: #000;
  border-left: 3px solid #000;
}
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
.pr-card.pr-card-set .pr-icon-wrap { background: #000; color: white; }
.pr-label  { font-weight: 900; font-size: 0.88rem; color: rgba(15,18,16,0.85); line-height: 1.25; }
.pr-value  { font-size: 1.25rem; font-weight: 900; color: #000; }
.pr-link   { font-size: 0.75rem; font-weight: 700; color: #767676; text-decoration: none; }
.pr-link:hover { text-decoration: underline; }
.pr-empty  { font-size: 0.78rem; color: rgba(15,18,16,0.40); font-weight: 600; }

/* ── CHART CARDS ───────────────────────────────── */
.chart-card {
  background: white;
  border: 1px solid #E5E5E5;
  border-radius: 0;
  padding: 24px;
  height: 280px;
  position: relative;
}
.chart-card canvas { width: 100% !important; height: 100% !important; }
.chart-card-doughnut {
  height: 260px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.chart-card-doughnut canvas { max-width: 200px; max-height: 200px; }

/* ── SPLIT SECTION ─────────────────────────────── */
.section-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  align-items: start;
}
.legend-list {
  background: white;
  border: 1px solid #E5E5E5;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.legend-row   { display: flex; align-items: center; gap: 14px; }
.legend-dot   { width: 14px; height: 14px; border-radius: 50%; flex-shrink: 0; }
.legend-info  { display: flex; justify-content: space-between; flex: 1; align-items: center; }
.legend-type  { font-weight: 900; font-size: 0.9rem; color: rgba(15,18,16,0.85); }
.legend-count { font-size: 0.80rem; font-weight: 700; color: rgba(15,18,16,0.50); }
.legend-empty { font-size: 0.85rem; color: rgba(15,18,16,0.40); text-align: center; padding: 20px; }

/* ── ALL-TIME TOTALS ───────────────────────────── */
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
}
.milestone-icon  { font-size: 2rem; line-height: 1; }
.milestone-val   { font-size: 1.4rem; font-weight: 900; color: #000; }
.milestone-label { font-size: 0.75rem; font-weight: 700; color: rgba(15,18,16,0.50); text-transform: uppercase; letter-spacing: 0.06em; }

/* ── ATHLETE ARCHETYPE ─────────────────────────── */
.archetype-card {
  display: grid;
  grid-template-columns: 200px 1fr;
  border: 1px solid #E5E5E5;
}
.arch-card-left {
  padding: 28px 24px;
  background: #000;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
}
.arch-big-icon  { font-size: 2.2rem; margin-bottom: 6px; }
.arch-label     { font-size: 0.82rem; font-weight: 900; letter-spacing: 0.14em; text-transform: uppercase; line-height: 1.2; }
.arch-tagline   { font-size: 0.78rem; color: rgba(255,255,255,0.65); font-style: italic; line-height: 1.4; }
.arch-card-right { padding: 24px 28px; }
.arch-traits-label,
.arch-how-label {
  font-size: 0.64rem;
  font-weight: 900;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #767676;
  margin-bottom: 10px;
}
.arch-traits      { display: flex; flex-direction: column; gap: 6px; margin-bottom: 20px; }
.arch-trait-row   { display: flex; align-items: center; gap: 8px; }
.arch-trait-dot   { width: 7px; height: 7px; flex-shrink: 0; }
.arch-trait-text  { font-size: 0.82rem; font-weight: 700; color: #000; }
.arch-how-text    { font-size: 0.78rem; color: #767676; line-height: 1.55; margin: 0; }

/* ── JOURNEY ───────────────────────────────────── */
.journey-scroll-wrap {
  overflow-x: auto;
  padding-bottom: 8px;
  scrollbar-width: thin;
  scrollbar-color: #E5E5E5 transparent;
}
.journey-track {
  display: flex;
  align-items: flex-start;
  gap: 0;
  min-width: max-content;
  padding: 8px 0;
}
.journey-node    { display: flex; flex-direction: column; align-items: center; position: relative; min-width: 90px; }
.jnode-icon      { width: 44px; height: 44px; border: 2px solid #000; background: #fff; display: flex; align-items: center; justify-content: center; font-size: 0.72rem; font-weight: 900; letter-spacing: 0.04em; z-index: 1; position: relative; flex-shrink: 0; }
.jnode-line      { position: absolute; top: 22px; left: calc(50% + 22px); width: calc(100% - 22px); height: 2px; background: #E5E5E5; z-index: 0; }
.jnode-label     { font-size: 0.68rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; color: #000; margin-top: 10px; text-align: center; line-height: 1.3; max-width: 80px; }
.jnode-date      { font-size: 0.64rem; color: #767676; margin-top: 2px; text-align: center; }
.journey-empty-cta { margin-top: 16px; font-size: 0.80rem; color: #767676; text-align: center; }
.journey-empty-cta p { margin: 0; }

/* ── LOADING ───────────────────────────────────── */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 60px 20px;
  color: rgba(15,18,16,0.55);
}

/* ── RESPONSIVE ────────────────────────────────── */
@media (max-width: 900px) {
  .pr-grid              { grid-template-columns: repeat(2, 1fr); }
  .milestone-grid       { grid-template-columns: repeat(2, 1fr); }
  .section-split        { grid-template-columns: 1fr; }
  .fitness-metric-row   { grid-template-columns: repeat(2, 1fr); }
  .race-pred-grid       { grid-template-columns: repeat(2, 1fr); }
  .insights-row         { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 768px) {
  .pr-grid              { grid-template-columns: repeat(2, 1fr); }
  .milestone-grid       { grid-template-columns: repeat(2, 1fr); }
  .hero-chips           { flex-wrap: wrap; gap: 8px; }
  .hero-chip            { font-size: 0.8rem; padding: 8px 14px; }
  .chart-card canvas    { max-height: 200px; }
  .stats-content        { padding: 28px 16px 64px; }
  .jumpnav-inner        { padding: 0 16px; }
  .archetype-card       { grid-template-columns: 1fr; }
  .arch-card-left       { flex-direction: row; flex-wrap: wrap; align-items: center; gap: 12px; }
  .arch-big-icon        { font-size: 1.6rem; margin-bottom: 0; }
}
@media (max-width: 600px) {
  .hero-title           { font-size: 2rem; }
  .hero-chips           { gap: 12px; }
  .hero-chip            { min-width: 100px; padding: 12px 18px; }
  .stats-content        { padding: 28px 16px 64px; }
  .insights-row         { grid-template-columns: 1fr; }
  .race-pred-grid       { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 480px) {
  .pr-grid              { grid-template-columns: 1fr; }
  .milestone-grid       { grid-template-columns: repeat(2, 1fr); }
  .hero-title           { font-size: 1.8rem; }
  .section-title        { font-size: 1.2rem; }
  .pr-card              { padding: 16px; }
  .pr-value             { font-size: 1.3rem; }
  .fitness-metric-row   { grid-template-columns: 1fr 1fr; }
  .race-pred-grid       { grid-template-columns: 1fr 1fr; }
  .hero                 { padding: 32px 16px 28px; }
  .stats-content        { padding: 20px 12px 80px; }
  .jumpnav-inner        { padding: 0 12px; }
  .heatmap-cell         { width: 8px; height: 8px; }
  .heatmap-months       { grid-auto-columns: 10px; }
  .heatmap-grid         { gap: 1px; }
  .heatmap-week         { gap: 1px; }
}
</style>
