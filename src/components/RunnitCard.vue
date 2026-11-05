<template><section :class="['runnit-card', { 'runnit-card--shadow': shadow }]" v-bind="$attrs"><slot /></section></template>
<script setup>defineProps({ shadow: Boolean })</script>
<style scoped>.runnit-card{border:1px solid var(--rk-rule);border-radius:var(--rk-radius-md);background:var(--rk-surface);padding:24px}.runnit-card--shadow{box-shadow:0 12px 32px rgba(22,19,15,.08)}</style>
