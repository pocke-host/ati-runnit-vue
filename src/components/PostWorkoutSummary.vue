<template><div class="post-workout-summary" aria-labelledby="post-workout-title"><p class="post-workout-summary__eyebrow">SESSION COMPLETE</p><h3 id="post-workout-title">That one counts.</h3><div class="post-workout-summary__stats"><div><span>TIME</span><strong>{{ formatDurationClock(duration) }}</strong></div><div><span>DISTANCE</span><strong>{{ formatDistance(distance) }}</strong></div><div><span>PACE</span><strong>{{ formatPace(pace) }}</strong></div></div><p class="post-workout-summary__suggestion">{{ suggestion }}</p></div></template>
<script setup>
import { computed } from 'vue'
import { useUnits } from '@/composables/useUnits'
const props = defineProps({ duration: { type: Number, default: 0 }, distance: { type: Number, default: 0 }, pace: { type: Number, default: 0 } })
const { formatDistance, formatPace, formatDurationClock } = useUnits()
const suggestion = computed(() => props.distance > 0 ? 'Add how it felt while it is still fresh. Future-you will thank you.' : 'Add a note about the work so your training story stays useful.')
</script>
<style scoped>
.post-workout-summary{margin:0 0 18px;padding:16px;background:#e6edff;border:2px solid #16130f;box-shadow:4px 4px #2a55f5}.post-workout-summary__eyebrow{margin:0;color:#2a55f5;font:700 .62rem 'Spline Sans Mono',monospace;letter-spacing:.14em}.post-workout-summary h3{margin:5px 0 14px;font:900 1.8rem/1 'Big Shoulders Display',system-ui,sans-serif;text-transform:uppercase}.post-workout-summary__stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.post-workout-summary__stats div{display:flex;flex-direction:column;gap:3px}.post-workout-summary__stats span{font:700 .58rem 'Spline Sans Mono',monospace;color:#5a5348}.post-workout-summary__stats strong{font-size:1.05rem}.post-workout-summary__suggestion{margin:14px 0 0;color:#5a5348;font-size:.8rem;line-height:1.45}@media(max-width:380px){.post-workout-summary__stats strong{font-size:.9rem}}
</style>
