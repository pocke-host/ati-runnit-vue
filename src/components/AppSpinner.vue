<!-- src/components/AppSpinner.vue -->
<template>
  <div :class="['app-spinner', `app-spinner--${size}`]">
    <div class="app-spinner-ring"></div>
    <span v-if="label" class="app-spinner-label">{{ label }}</span>
  </div>
</template>

<script setup>
defineProps({
  label: { type: String, default: '' },
  size: { type: String, default: 'md' } // 'sm' | 'md'
})
</script>

<style scoped>
.app-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px 20px;
}

.app-spinner-ring {
  border-radius: 50%;
  border-style: solid;
  border-color: #E5E5E5;
  border-top-color: var(--rk-signal, #0052FF);
  animation: rk-spin 0.75s linear infinite;
}

.app-spinner--md .app-spinner-ring {
  width: 32px;
  height: 32px;
  border-width: 2px;
}

.app-spinner--sm .app-spinner-ring {
  width: 20px;
  height: 20px;
  border-width: 1px;
}

.app-spinner-label {
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: #767676;
  text-transform: uppercase;
}

@keyframes rk-spin {
  to { transform: rotate(360deg); }
}
</style>
