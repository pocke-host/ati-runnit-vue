<!-- ========== FitnessGauge.vue ========== -->
<!-- Hand-built SVG ring gauge — matches the codebase's existing gauge precedent
     (the hand-built ACWR bar gauge in Stats.vue) rather than reaching for a
     Chart.js doughnut, which this app reserves for real charts. -->
<template>
  <div class="fg-gauge">
    <div class="fg-ring-wrap">
      <svg viewBox="0 0 120 120" class="fg-ring">
        <circle class="fg-track" cx="60" cy="60" r="50" />
        <circle
          class="fg-fill"
          cx="60" cy="60" r="50"
          :stroke="accent"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="dashOffset"
        />
      </svg>
      <div class="fg-center">
        <div class="fg-score">{{ Math.round(score) }}</div>
        <div class="fg-label">{{ label }}</div>
      </div>
    </div>
    <div v-if="statLabel" class="fg-stat">
      <span class="fg-stat-val">{{ statValue }}</span>
      <span class="fg-stat-lbl">{{ statLabel }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  score:     { type: Number, required: true }, // 0-100
  label:     { type: String, required: true },
  statLabel: { type: String, default: '' },
  statValue: { type: String, default: '' },
  accent:    { type: String, default: '#2A55F5' },
})

const RADIUS = 50
const circumference = 2 * Math.PI * RADIUS
const dashOffset = computed(() => {
  const pct = Math.max(0, Math.min(100, props.score)) / 100
  return circumference * (1 - pct)
})
</script>

<style scoped>
.fg-gauge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.fg-ring-wrap {
  position: relative;
  width: 120px;
  height: 120px;
}
.fg-ring {
  width: 120px;
  height: 120px;
  transform: rotate(-90deg);
}
.fg-track {
  fill: none;
  stroke: #E7DFCE;
  stroke-width: 10;
}
.fg-fill {
  fill: none;
  stroke-width: 10;
  stroke-linecap: butt;
  transition: stroke-dashoffset 0.6s ease-out;
}
.fg-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.fg-score {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-weight: 900;
  font-size: 2.2rem;
  line-height: 1;
  color: #16130F;
  font-variant-numeric: tabular-nums;
}
.fg-label {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #5A5348;
  margin-top: 2px;
}
.fg-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.fg-stat-val {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-weight: 700;
  font-size: 0.85rem;
  color: #16130F;
  font-variant-numeric: tabular-nums;
}
.fg-stat-lbl {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.58rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #8A8A8A;
  margin-top: 2px;
}
</style>
