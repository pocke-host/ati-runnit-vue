<template>
  <section class="dashboard-recovery" aria-labelledby="dashboard-recovery-title">
    <div class="recovery-head">
      <div>
        <p class="recovery-kicker">Daily readiness</p>
        <h2 id="dashboard-recovery-title">Recovery</h2>
      </div>
      <div class="recovery-source">
        <span>{{ wellness ? `Today · ${sourceLabel}` : 'No source connected' }}</span>
        <router-link v-if="!wellness && !loading && !error" to="/devices">Connect a device →</router-link>
        <router-link v-else to="/devices">Manage sources →</router-link>
      </div>
    </div>

    <div v-if="loading" class="recovery-state" role="status">Reading your recovery data…</div>
    <div v-else-if="error" class="recovery-state recovery-state--error" role="status">
      Recovery data is temporarily unavailable.
      <button type="button" @click="$emit('retry')">Retry</button>
    </div>
    <div v-else-if="!wellness" class="recovery-state">
      Connect WHOOP, Garmin, Oura, Fitbit, or Apple Health to see recovery, sleep, and readiness here.
    </div>

    <template v-else>
      <div v-if="signalRings.length" class="recovery-rings" aria-label="Recovery signals">
        <div v-for="ring in signalRings" :key="ring.label" class="recovery-ring-cell">
          <div class="recovery-ring" :style="{ borderColor: ring.color, color: ring.color }">
            <span>{{ ring.value }}<small>{{ ring.unit }}</small></span>
          </div>
          <div class="recovery-ring-label">{{ ring.label }}</div>
          <div v-if="ring.detail" class="recovery-ring-detail">{{ ring.detail }}</div>
        </div>
      </div>

      <div v-if="metrics.length" class="recovery-metrics" aria-label="Recovery metrics">
        <div v-for="metric in metrics" :key="metric.label" class="recovery-metric">
          <span>{{ metric.label }}</span>
          <strong>{{ metric.value }}<small>{{ metric.unit }}</small></strong>
        </div>
      </div>

      <div v-if="sleepStageBreakdown" class="recovery-sleep">
        <div class="recovery-sleep-bar" aria-label="Sleep stage breakdown">
          <span class="recovery-sleep-segment recovery-sleep-segment--light" :style="{ width: sleepStageBreakdown.lightPct + '%' }"></span>
          <span class="recovery-sleep-segment recovery-sleep-segment--deep" :style="{ width: sleepStageBreakdown.deepPct + '%' }"></span>
          <span class="recovery-sleep-segment recovery-sleep-segment--rem" :style="{ width: sleepStageBreakdown.remPct + '%' }"></span>
        </div>
        <div class="recovery-sleep-legend">
          <span>Light {{ sleepStageBreakdown.lightPct }}%</span>
          <span>Deep {{ sleepStageBreakdown.deepPct }}%</span>
          <span>REM {{ sleepStageBreakdown.remPct }}%</span>
        </div>
      </div>

      <div v-if="!signalRings.length && !metrics.length && !sleepStageBreakdown" class="recovery-state">
        {{ sourceLabel }} is connected. Recovery data will appear after the next sync.
      </div>
    </template>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  wellness: { type: Object, default: null },
  sourceLabel: { type: String, default: 'connected source' },
  loading: { type: Boolean, default: false },
  error: { type: Boolean, default: false }
})

defineEmits(['retry'])

const scoreColor = (score) => {
  if (score == null) return '#767676'
  if (score >= 67) return '#2A55F5'
  if (score >= 34) return '#B87900'
  return '#C0392B'
}

const strainBand = (strain) => {
  if (strain == null) return ''
  if (strain < 10) return 'Light'
  if (strain < 14) return 'Moderate'
  if (strain < 18) return 'Strenuous'
  return 'All out'
}

const signalRings = computed(() => {
  const wellness = props.wellness
  if (!wellness) return []
  const rings = []
  const recoveryScore = wellness.recoveryScore ?? wellness.readinessScore
  if (recoveryScore != null) {
    rings.push({
      label: wellness.recoveryScore != null ? 'Recovery' : 'Readiness',
      value: recoveryScore,
      unit: '%',
      color: scoreColor(recoveryScore)
    })
  }
  if (wellness.strain != null) {
    rings.push({
      label: 'Strain',
      value: Number(wellness.strain).toFixed(1),
      unit: '',
      color: '#2A55F5',
      detail: strainBand(Number(wellness.strain))
    })
  } else if (wellness.bodyBattery != null) {
    rings.push({
      label: 'Body Battery',
      value: wellness.bodyBattery,
      unit: '/100',
      color: '#2A55F5'
    })
  }
  return rings
})

const metrics = computed(() => {
  const wellness = props.wellness
  if (!wellness) return []
  const values = []
  if (wellness.hrvMilli != null) values.push({ label: 'HRV', value: Math.round(wellness.hrvMilli), unit: ' ms' })
  if (wellness.restingHeartRate != null) values.push({ label: 'Resting HR', value: wellness.restingHeartRate, unit: ' bpm' })
  if (wellness.sleepPerformancePct != null) values.push({ label: 'Sleep', value: wellness.sleepPerformancePct, unit: '%' })
  if (wellness.totalSleepMinutes != null) {
    const minutes = Math.max(0, Math.round(wellness.totalSleepMinutes))
    values.push({ label: 'Time asleep', value: `${Math.floor(minutes / 60)}h ${minutes % 60}m`, unit: '' })
  }
  if (wellness.steps != null) values.push({ label: 'Steps', value: Number(wellness.steps).toLocaleString(), unit: '' })
  if (wellness.averageStress != null) values.push({ label: 'Stress', value: Math.round(wellness.averageStress), unit: '' })
  if (wellness.activeKilocalories != null) values.push({ label: 'Active kcal', value: wellness.activeKilocalories, unit: '' })
  return values
})

const sleepStageBreakdown = computed(() => {
  const wellness = props.wellness
  if (!wellness || wellness.lightSleepMinutes == null || wellness.deepSleepMinutes == null || wellness.remSleepMinutes == null) return null
  const total = wellness.lightSleepMinutes + wellness.deepSleepMinutes + wellness.remSleepMinutes
  if (total <= 0) return null
  return {
    lightPct: Math.round((wellness.lightSleepMinutes / total) * 100),
    deepPct: Math.round((wellness.deepSleepMinutes / total) * 100),
    remPct: Math.round((wellness.remSleepMinutes / total) * 100)
  }
})
</script>

<style scoped>
.dashboard-recovery {
  padding: 22px;
  background: #f8fbff;
  border: 2px solid #16130f;
  border-radius: 22px;
  box-shadow: 5px 5px 0 #2a55f5;
}
.recovery-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 18px; }
.recovery-kicker { margin: 0 0 5px; color: #2a55f5; font: 700 9px 'Spline Sans Mono', ui-monospace, monospace; letter-spacing: .14em; text-transform: uppercase; }
.recovery-head h2 { margin: 0; color: #16130f; font-size: 1.65rem; line-height: 1; }
.recovery-source { display: flex; align-items: flex-end; flex-direction: column; gap: 7px; color: #8a8a8a; font: 700 9px 'Spline Sans Mono', ui-monospace, monospace; letter-spacing: .07em; text-align: right; text-transform: uppercase; }
.recovery-source a { color: #2a55f5; text-decoration: none; }
.recovery-source a:hover { text-decoration: underline; }
.recovery-rings { display: flex; flex-wrap: wrap; gap: 24px; padding: 22px 0 18px; }
.recovery-ring-cell { display: flex; align-items: center; flex-direction: column; gap: 6px; min-width: 82px; }
.recovery-ring { width: 78px; height: 78px; display: flex; align-items: center; justify-content: center; border: 4px solid; border-radius: 999px; font-family: 'Big Shoulders Display', system-ui, sans-serif; font-size: 1.45rem; font-weight: 800; }
.recovery-ring small { margin-left: 1px; font: 700 .58rem 'Spline Sans Mono', ui-monospace, monospace; }
.recovery-ring-label { color: #665f55; font: 700 .58rem 'Spline Sans Mono', ui-monospace, monospace; letter-spacing: .06em; text-align: center; text-transform: uppercase; }
.recovery-ring-detail { color: #8a8a8a; font-size: .68rem; }
.recovery-metrics { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px 18px; padding: 16px 0; border-top: 1px solid #e7dfce; }
.recovery-metric { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.recovery-metric span { color: #8a8a8a; font: 700 .57rem 'Spline Sans Mono', ui-monospace, monospace; letter-spacing: .08em; text-transform: uppercase; }
.recovery-metric strong { color: #16130f; font: 800 1.2rem 'Big Shoulders Display', system-ui, sans-serif; }
.recovery-metric small { margin-left: 2px; color: #8a8a8a; font: 600 .58rem 'Spline Sans Mono', ui-monospace, monospace; }
.recovery-sleep { padding-top: 16px; border-top: 1px solid #e7dfce; }
.recovery-sleep-bar { display: flex; height: 10px; overflow: hidden; border: 2px solid #16130f; border-radius: 999px; }
.recovery-sleep-segment { height: 100%; }
.recovery-sleep-segment--light { background: #c9c2b4; }
.recovery-sleep-segment--deep { background: #16130f; }
.recovery-sleep-segment--rem { background: #2a55f5; }
.recovery-sleep-legend { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 8px; color: #665f55; font: 700 .58rem 'Spline Sans Mono', ui-monospace, monospace; text-transform: uppercase; }
.recovery-state { padding: 22px 0 3px; color: #665f55; font-size: .84rem; line-height: 1.45; }
.recovery-state--error { color: #9d3c32; }
.recovery-state button { margin-left: 5px; padding: 0; border: 0; background: transparent; color: #2a55f5; font: inherit; font-weight: 700; text-decoration: underline; cursor: pointer; }
@media (max-width: 600px) {
  .dashboard-recovery { padding: 18px; border-radius: 18px; box-shadow: 4px 4px 0 #2a55f5; }
  .recovery-head { gap: 10px; }
  .recovery-head h2 { font-size: 1.45rem; }
  .recovery-source { font-size: 8px; }
  .recovery-rings { gap: 16px; }
  .recovery-metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
</style>
