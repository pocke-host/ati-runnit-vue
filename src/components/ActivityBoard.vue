<template>
  <div class="board">
    <div class="board-header">
      <div class="col-rank">#</div>
      <div class="col-athlete">Athlete</div>
      <div class="col-dist">Distance</div>
      <div class="col-pace">Pace</div>
      <div class="col-fire">Fire</div>
    </div>
    <div v-for="(row, i) in rows" :key="row.handle" class="board-row">
      <div class="col-rank rank-num">{{ String(i + 1).padStart(2, '0') }}</div>
      <div class="col-athlete athlete-cell">
        <div class="avatar">{{ initials(row.name) }}</div>
        <div class="athlete-info">
          <div class="athlete-name">{{ row.name }}</div>
          <div class="athlete-club">{{ row.club }}</div>
        </div>
      </div>
      <div class="col-dist dist-val">{{ formatDistance(row.distanceMeters, 1) }}</div>
      <div class="col-pace pace-val">{{ formattedPace(row.paceSecPerKm) }} {{ paceLabel }}</div>
      <div class="col-fire fire-val">{{ row.fire }}</div>
    </div>
  </div>
</template>

<script setup>
import { useUnits } from '@/composables/useUnits'

defineProps({
  rows: { type: Array, required: true },
})

const { formatDistance, paceLabel } = useUnits()

function initials(name) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
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

.board-header,
.board-row {
  display: grid;
  grid-template-columns: 44px 1fr 120px 110px 80px;
  gap: 16px;
  align-items: center;
}

.board-header {
  padding: 0 0 12px;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #767676;
}

.board-row {
  background: #fff;
  border-top: 1px solid #E5E5E5;
  padding: 16px 0;
}
.board-row:last-child { border-bottom: 1px solid #E5E5E5; }

.rank-num { font-weight: 900; font-size: 1rem; }

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
.athlete-name { font-weight: 800; font-size: 0.9rem; }
.athlete-club {
  font-size: 0.62rem;
  color: #767676;
  text-transform: uppercase;
  letter-spacing: 0.10em;
  margin-top: 2px;
}

.dist-val { font-weight: 800; }
.pace-val { color: #767676; font-size: 0.9rem; }
.fire-val { text-align: right; font-weight: 800; }

/* Mobile: collapse to name + distance + fire */
@media (max-width: 640px) {
  .board-header,
  .board-row {
    grid-template-columns: 44px 1fr 80px 60px;
  }
  .col-pace { display: none; }
  .athlete-club { display: none; }
}
@media (max-width: 480px) {
  .board-header,
  .board-row {
    grid-template-columns: 32px 1fr 70px 48px;
    gap: 10px;
  }
}
</style>
