<!-- SportsPicker.vue — sport selector for tracking sessions -->
<template>
  <div class="sports-picker">
    <button
      v-for="sport in sports"
      :key="sport.value"
      :class="['sport-btn', { active: modelValue === sport.value }]"
      @click="$emit('update:modelValue', sport.value)"
      :title="sport.label"
    >
      <i :class="`bi ${sport.icon}`"></i>
      <span>{{ sport.label }}</span>
    </button>
  </div>
</template>

<script setup>
defineProps({ modelValue: { type: String, default: 'running' } })
defineEmits(['update:modelValue'])

const sports = [
  { value: 'running', label: 'Run', icon: 'bi-person-walking' },
  { value: 'cycling', label: 'Ride', icon: 'bi-bicycle' },
  { value: 'swimming', label: 'Swim', icon: 'bi-water' },
  { value: 'hiking', label: 'Hike', icon: 'bi-tree-fill' },
  { value: 'triathlon', label: 'Tri', icon: 'bi-lightning-charge-fill' },
  { value: 'strength', label: 'Strength', icon: 'bi-award-fill' },
  { value: 'yoga', label: 'Yoga', icon: 'bi-stars' },
]
</script>

<style scoped>
.sports-picker {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.sport-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 14px;
  border-radius: 14px;
  border: 1px solid rgba(15,18,16,.14);
  background: rgba(255,255,255,.85);
  cursor: pointer;
  transition: all .2s;
  min-width: 60px;
  white-space: nowrap;
  font-size: .72rem;
  font-weight: 700;
  color: rgba(15,18,16,.65);
}

.sport-btn i { font-size: 1.2rem; }

.sport-btn:hover {
  background: white;
  border-color: rgba(15,18,16,.24);
}

.sport-btn.active {
  background: linear-gradient(135deg, #5A6B4E, #2C3726);
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 16px rgba(44,55,38,.3);
}
</style>
