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
