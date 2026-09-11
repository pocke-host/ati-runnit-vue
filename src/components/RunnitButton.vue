<template>
  <button :type="type" :class="['runnit-button', `runnit-button--${variant}`, { 'runnit-button--block': block } ]" :disabled="disabled">
    <slot />
  </button>
</template>
<script setup>
defineProps({ type: { type: String, default: 'button' }, variant: { type: String, default: 'primary' }, disabled: Boolean, block: Boolean })
</script>
<style scoped>
.runnit-button{border:2px solid var(--rk-ink);padding:10px 16px;background:var(--rk-cobalt);color:#fff;font:700 11px var(--rk-font-mono-gr);letter-spacing:.08em;text-transform:uppercase;cursor:pointer;transition:background .15s,opacity .15s}.runnit-button:hover{background:var(--rk-cobalt-hover)}.runnit-button:disabled{opacity:.55;cursor:wait}.runnit-button--secondary{background:var(--rk-yellow);color:var(--rk-ink)}.runnit-button--secondary:hover{background:#e9b52f}.runnit-button--quiet{background:transparent;color:var(--rk-ink)}.runnit-button--quiet:hover{background:var(--rk-smoke)}.runnit-button--block{width:100%}
</style>
