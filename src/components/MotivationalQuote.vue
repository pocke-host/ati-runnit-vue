<template>
  <aside class="motivation-card" aria-live="polite">
    <div><p class="motivation-kicker">A note for today</p><p class="motivation-quote">“{{ quote }}”</p></div>
    <button type="button" class="motivation-shuffle" @click="shuffle" aria-label="Shuffle motivational quote">Shuffle <span aria-hidden="true">↻</span></button>
  </aside>
</template>
<script setup>
import { useMotivationalQuote } from '@/composables/useMotivationalQuote'
const { quote, shuffle } = useMotivationalQuote()
</script>
<style scoped>
.motivation-card{display:flex;align-items:center;justify-content:space-between;gap:18px;margin:0 0 18px;padding:16px 20px;background:#FFC53D;border:2px solid #16130F;box-shadow:4px 4px #16130F}.motivation-kicker{margin:0 0 5px;font:10px 'Spline Sans Mono',monospace;font-weight:700;letter-spacing:.14em;text-transform:uppercase}.motivation-quote{margin:0;max-width:690px;font-size:1.02rem;font-weight:800;line-height:1.35}.motivation-shuffle{flex-shrink:0;border:2px solid #16130F;background:#fff;padding:9px 11px;font:700 10px 'Spline Sans Mono',monospace;text-transform:uppercase;cursor:pointer}.motivation-shuffle:hover{background:#e6edff}@media(max-width:600px){.motivation-card{align-items:flex-start;flex-direction:column;gap:12px;padding:15px 16px}.motivation-shuffle{width:100%}}
</style>
