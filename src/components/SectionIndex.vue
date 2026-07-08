<template>
  <div :class="['section-index', onDark ? 'section-index--dark' : '']">
    <span class="si-num">{{ paddedNum }}</span>
    <span class="si-dash">&mdash;</span>
    <span class="si-label">{{ label }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  num:    { type: Number, required: true },
  label:  { type: String, required: true },
  onDark: { type: Boolean, default: false },
})

const paddedNum = computed(() => String(props.num).padStart(3, '0'))
</script>

<style scoped>
.section-index {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 0.66rem;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #767676;
}
.si-num  { color: #2A55F5; }
.si-dash { color: inherit; }
.si-label { color: inherit; }

.section-index--dark { color: rgba(255,255,255,0.55); }
.section-index--dark .si-num { color: #2A55F5; }
</style>
