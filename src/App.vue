<script setup>
import TopNav from './components/TopNav.vue'
import Footer from './components/Footer.vue'
</script>

<template>
  <TopNav />
  <router-view />
  <Footer />
</template>

<style scoped>
.navbar{ min-height:64px; }
.nav-link{ font-weight:500; color:#333333; }
.nav-link:hover{ color:#000; }
.btn-outline-dark{ border-radius:1000px; }

.footer-link{ color:#aaa; text-decoration:none; font-size:.9rem; }

/* remove this: it was forcing a huge canvas
.homepage-marquee-wrapper{ height:1000vh; } */
</style>
