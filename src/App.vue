<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import TopNav from './components/TopNav.vue'
import BottomNav from './components/BottomNav.vue'
import Footer from './components/Footer.vue'

const route = useRoute()
const showChrome = computed(() => route.path !== '/onboard')
</script>

<template>
  <TopNav v-if="showChrome" />
  <BottomNav v-if="showChrome" />
  <router-view />
  <Footer v-if="showChrome" />
</template>

<style>
/* ── Scroll Reveal ── */
[data-reveal] {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.65s cubic-bezier(0.16, 1, 0.3, 1);
}
[data-reveal].is-visible {
  opacity: 1;
  transform: translateY(0);
}

/* ── Stagger children ── */
[data-stagger] > * {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.55s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.55s cubic-bezier(0.16, 1, 0.3, 1);
}
[data-stagger].is-visible > *:nth-child(1) { opacity: 1; transform: translateY(0); transition-delay: 0s; }
[data-stagger].is-visible > *:nth-child(2) { opacity: 1; transform: translateY(0); transition-delay: 0.08s; }
[data-stagger].is-visible > *:nth-child(3) { opacity: 1; transform: translateY(0); transition-delay: 0.16s; }
[data-stagger].is-visible > *:nth-child(4) { opacity: 1; transform: translateY(0); transition-delay: 0.24s; }
[data-stagger].is-visible > *:nth-child(5) { opacity: 1; transform: translateY(0); transition-delay: 0.32s; }
[data-stagger].is-visible > *:nth-child(6) { opacity: 1; transform: translateY(0); transition-delay: 0.40s; }
[data-stagger].is-visible > *:nth-child(7) { opacity: 1; transform: translateY(0); transition-delay: 0.48s; }
[data-stagger].is-visible > *:nth-child(8) { opacity: 1; transform: translateY(0); transition-delay: 0.56s; }
</style>
