<template>
  <div class="moment-tile">
    <img v-if="photo" :src="photo" :alt="handle" class="tile-img" />
    <div v-else class="tile-placeholder"></div>
    <div class="tile-overlay" aria-hidden="true"></div>
    <div class="tile-handle">{{ handle }}</div>
    <div class="tile-data">
      <div class="tile-dist">
        {{ distDisplay }}<span class="tile-unit">{{ distUnit }}</span>
      </div>
      <div class="tile-pace">{{ formattedPace }} {{ paceLabel }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUnits } from '@/composables/useUnits'

const props = defineProps({
  photo:          { type: String, default: null },
  handle:         { type: String, required: true },
  distanceMeters: { type: Number, required: true },
  paceSecPerKm:   { type: Number, required: true },
})

const { formatDistance, paceLabel, unitSystem } = useUnits()

const distDisplay = computed(() => {
  const d = formatDistance(props.distanceMeters, 2)
  return d.replace(/\s*(km|mi)$/i, '')
})

const distUnit = computed(() => {
  return unitSystem?.value === 'imperial' ? 'MI' : 'KM'
})

const formattedPace = computed(() => {
  const minPerKm = props.paceSecPerKm / 60
  if (!minPerKm || minPerKm === Infinity || isNaN(minPerKm)) return '--:--'
  const mins = Math.floor(minPerKm)
  const secs = Math.round((minPerKm - mins) * 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
})
</script>

<style scoped>
.moment-tile {
  position: relative;
  aspect-ratio: 4 / 5;
  background: #111;
  overflow: hidden;
  display: block;
}
.tile-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.tile-placeholder {
  position: absolute;
  inset: 0;
  background: #1a1a1a;
}
.tile-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.82), rgba(0,0,0,0) 54%);
  pointer-events: none;
}
.tile-handle {
  position: absolute;
  left: 11px;
  top: 11px;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 0.62rem;
  font-weight: 500;
  letter-spacing: 0.06em;
  color: rgba(255,255,255,0.85);
}
.tile-data {
  position: absolute;
  left: 11px;
  bottom: 11px;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-variant-numeric: tabular-nums;
}
.tile-dist {
  font-size: 1.15rem;
  font-weight: 600;
  color: #fff;
  letter-spacing: -0.01em;
}
.tile-unit {
  font-size: 0.6rem;
  font-weight: 500;
  color: rgba(255,255,255,0.7);
  margin-left: 3px;
}
.tile-pace {
  font-size: 0.62rem;
  color: rgba(255,255,255,0.7);
  margin-top: 1px;
  text-transform: uppercase;
}
</style>
