<template>
  <div class="board">
    <div class="board-tick"></div>
    <div class="board-header">
      <div class="col-pos">Pos</div>
      <div class="col-athlete">Athlete</div>
      <div class="col-dist">Dist</div>
      <div class="col-pace">Pace</div>
      <div class="col-fire">Fire</div>
    </div>
    <div
      v-for="(row, i) in rows"
      :key="row.handle || i"
      class="board-row"
      :style="{ animationDelay: `${i * 0.06}s` }"
    >
      <div class="col-pos pos-num">{{ String(i + 1).padStart(3, '0') }}</div>
      <div class="col-athlete athlete-cell">
        <div class="avatar">{{ initials(row.name) }}</div>
        <div class="athlete-info">
          <div class="athlete-name">{{ row.name }}</div>
          <div class="athlete-club">{{ row.club }}</div>
        </div>
      </div>
      <div class="col-dist dist-val">
        {{ distDisplay(row.distanceMeters) }}<span class="dist-unit">{{ distUnit }}</span>
      </div>
      <div class="col-pace pace-val">{{ formattedPace(row.paceSecPerKm) }}</div>
      <div class="col-fire fire-val">{{ row.fire }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUnits } from '@/composables/useUnits'

defineProps({
  rows: { type: Array, required: true },
})

const { formatDistance, paceLabel, unitSystem } = useUnits()

const distUnit = computed(() => unitSystem?.value === 'imperial' ? 'MI' : 'KM')

function initials(name) {
  return (name || '').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

function distDisplay(meters) {
  const s = formatDistance(meters, 1)
  return s.replace(/\s*(km|mi)$/i, '')
}

function formattedPace(secPerKm) {
  const minPerKm = secPerKm / 60
  if (!minPerKm || isNaN(minPerKm)) return '--:--'
  const mins = Math.floor(minPerKm)
  const secs = Math.round((minPerKm - mins) * 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.board { width: 100%; }

.board-tick {
  height: 9px;
  background-image: repeating-linear-gradient(90deg, #000 0 1.5px, transparent 1.5px 13px);
  margin-bottom: 0;
}

.board-header {
  display: grid;
  grid-template-columns: 60px 1fr 130px 120px 70px;
  gap: 16px;
  align-items: center;
  padding: 14px 0;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #767676;
  border-bottom: 1px solid #E5E5E5;
}

.board-row {
  display: grid;
  grid-template-columns: 60px 1fr 130px 120px 70px;
  gap: 16px;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #E5E5E5;
  background: #fff;
  animation: rkRise 0.5s ease-out both;
}

.pos-num {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 1rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.athlete-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}
.avatar {
  width: 34px;
  height: 34px;
  background: #000;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.74rem;
  flex-shrink: 0;
}
.athlete-name {
  font-weight: 800;
  font-size: 0.95rem;
}
.athlete-club {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 0.58rem;
  color: #767676;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-top: 2px;
}

.dist-val {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 0.95rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.dist-unit {
  font-size: 0.62rem;
  color: #767676;
  margin-left: 3px;
}
.pace-val {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 0.95rem;
  color: #767676;
  font-variant-numeric: tabular-nums;
}
.fire-val {
  text-align: right;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 0.95rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.col-fire { text-align: right; }

@media (max-width: 640px) {
  .board-header,
  .board-row {
    grid-template-columns: 48px 1fr 90px 56px;
    gap: 10px;
  }
  .col-pace { display: none; }
  .athlete-club { display: none; }
}
@media (max-width: 400px) {
  .board-header,
  .board-row {
    grid-template-columns: 36px 1fr 72px 44px;
    gap: 8px;
  }
}
</style>
