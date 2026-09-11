<template><span :class="['runnit-badge', `runnit-badge--${tone}`]"><slot /></span></template>
<script setup>defineProps({ tone: { type: String, default: 'blue' } })</script>
<style scoped>.runnit-badge{display:inline-flex;align-items:center;padding:5px 8px;border:2px solid var(--rk-ink);font:700 10px var(--rk-font-mono-gr);letter-spacing:.08em;text-transform:uppercase}.runnit-badge--blue{background:var(--rk-cobalt);color:#fff}.runnit-badge--yellow{background:var(--rk-yellow);color:var(--rk-ink)}.runnit-badge--muted{background:var(--rk-smoke);color:var(--rk-muted)}</style>
