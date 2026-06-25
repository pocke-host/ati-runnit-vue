<template>
  <div class="moment-tile">
    <img v-if="photo" :src="photo" :alt="handle" class="tile-img" />
    <div v-else class="tile-placeholder"></div>
    <div class="tile-overlay" aria-hidden="true"></div>
    <div class="tile-handle">{{ handle }}</div>
    <div class="tile-data">
      <div class="tile-dist">{{ formatDistance(distanceMeters, 2) }}</div>
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

const { formatDistance, paceLabel } = useUnits()

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
  background: linear-gradient(to top, rgba(0,0,0,0.78), rgba(0,0,0,0) 52%);
  pointer-events: none;
}
.tile-handle {
  position: absolute;
  left: 12px;
  top: 12px;
  font-size: 0.68rem;
  font-weight: 800;
  color: #fff;
  text-shadow: 0 1px 4px rgba(0,0,0,0.6);
  letter-spacing: 0.02em;
}
.tile-data {
  position: absolute;
  left: 12px;
  bottom: 12px;
}
.tile-dist {
  font-size: 1rem;
  font-weight: 900;
  color: #fff;
  letter-spacing: -0.02em;
  line-height: 1.1;
}
.tile-pace {
  font-size: 0.66rem;
  color: rgba(255,255,255,0.75);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-top: 2px;
}
</style>
