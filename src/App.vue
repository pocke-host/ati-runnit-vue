<script setup>
import TopNav from './components/TopNav.vue'
import BottomNav from './components/BottomNav.vue'
import Footer from './components/Footer.vue'
</script>

<template>
  <TopNav />
  <BottomNav />
  <router-view />
  <Footer />
</template>
