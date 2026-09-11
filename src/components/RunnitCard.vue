<template><section :class="['runnit-card', { 'runnit-card--shadow': shadow }]" v-bind="$attrs"><slot /></section></template>
<script setup>defineProps({ shadow: Boolean })</script>
<style scoped>.runnit-card{border:2px solid var(--rk-ink);background:#fff;padding:20px}.runnit-card--shadow{box-shadow:5px 5px 0 var(--rk-ink)}</style>
