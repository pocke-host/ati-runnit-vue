<!-- src/components/EmptyState.vue -->
<template>
  <div class="empty-state">
    <i :class="`bi ${icon} empty-state-icon`"></i>
    <div class="empty-state-title">{{ title }}</div>
    <p v-if="message" class="empty-state-message">{{ message }}</p>
    <template v-if="actionLabel">
      <router-link v-if="actionTo" :to="actionTo" class="empty-state-btn">
        {{ actionLabel }}
      </router-link>
      <button v-else class="empty-state-btn" @click="$emit('action')">
        {{ actionLabel }}
      </button>
    </template>
  </div>
</template>

<script setup>
defineProps({
  icon: { type: String, default: 'bi-inbox' },
  title: { type: String, required: true },
  message: { type: String, default: '' },
  actionLabel: { type: String, default: '' },
  actionTo: { type: String, default: '' }
})
defineEmits(['action'])
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 72px 24px;
  text-align: center;
}

.empty-state-icon {
  font-size: 3rem;
  color: var(--rk-ash, #B0A8C0);
  margin-bottom: 16px;
}

.empty-state-title {
  font-size: 1.1rem;
  font-weight: 900;
  letter-spacing: -0.01em;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.empty-state-message {
  font-size: 0.88rem;
  color: #767676;
  line-height: 1.6;
  max-width: 320px;
  margin: 0 0 24px;
}

.empty-state-btn {
  display: inline-flex;
  align-items: center;
  height: 40px;
  padding: 0 24px;
  border: 1px solid var(--rk-signal, #8B2BE2);
  background: transparent;
  color: var(--rk-signal, #8B2BE2);
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  cursor: pointer;
  text-decoration: none;
  border-radius: 0;
  transition: background 0.15s, color 0.15s;
  font-family: inherit;
}

.empty-state-btn:hover {
  background: var(--rk-signal, #8B2BE2);
  color: #fff;
}
</style>
