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
  padding: 64px 24px;
  text-align: center;
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
}

.empty-state-icon {
  font-size: 2.6rem;
  color: #5A5348;
  margin-bottom: 18px;
}

.empty-state-title {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-size: clamp(1.6rem, 5vw, 2rem);
  font-weight: 900;
  text-transform: uppercase;
  line-height: 0.88;
  color: #16130F;
  margin-bottom: 10px;
}

.empty-state-message {
  font-size: 0.9rem;
  color: #5A5348;
  line-height: 1.6;
  max-width: 300px;
  margin: 0 0 28px;
}

.empty-state-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 13px 28px;
  border: 2px solid #16130F;
  background: #2A55F5;
  color: #fff;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  cursor: pointer;
  text-decoration: none;
  border-radius: 999px;
  box-shadow: 3px 3px 0 #16130F;
  transition: background 0.15s, box-shadow 0.15s;
}
.empty-state-btn:hover {
  background: #1E42D6;
}
</style>
