<template>
  <div class="stat-value">
    <div v-if="label" class="sv-label">{{ label }}</div>
    <div class="sv-row">
      <span class="sv-num">{{ value }}</span>
      <span v-if="unit" class="sv-unit">{{ unit }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  label: { type: String, default: '' },
  value: { type: [String, Number], required: true },
  unit:  { type: String, default: '' },
  size:  { type: String, default: 'md' }, /* sm | md | lg */
})
</script>

<style scoped>
.stat-value {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-variant-numeric: tabular-nums;
}
.sv-label {
  font-size: 0.58rem;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #767676;
  margin-bottom: 4px;
}
.sv-row {
  display: flex;
  align-items: baseline;
  gap: 3px;
}
.sv-num {
  font-size: 1.4rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: inherit;
}
.sv-unit {
  font-size: 0.7rem;
  font-weight: 500;
  color: #767676;
}
</style>
