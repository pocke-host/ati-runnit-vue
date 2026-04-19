<!-- src/components/UserAvatar.vue -->
<!-- Reusable avatar: shows photo if available, falls back to initials -->
<template>
  <div class="ua-wrap" :style="wrapStyle">
    <img v-if="src" :src="src" :alt="name" class="ua-img" loading="lazy" @error="imgError = true" />
    <span v-else class="ua-initials" :style="{ fontSize: fontSize + 'px' }">{{ initials }}</span>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  src:   { type: String,  default: null },
  name:  { type: String,  default: '' },
  size:  { type: Number,  default: 40 },
  round: { type: Boolean, default: true },
})

const imgError = ref(false)

const initials = computed(() => {
  const n = props.name || '?'
  return n.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
})

const wrapStyle = computed(() => ({
  width:  props.size + 'px',
  height: props.size + 'px',
  borderRadius: props.round ? '50%' : '0',
  flexShrink: '0',
}))

const fontSize = computed(() => Math.round(props.size * 0.38))
</script>

<style scoped>
.ua-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #000;
  overflow: hidden;
  flex-shrink: 0;
}
.ua-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.ua-initials {
  color: #fff;
  font-weight: 900;
  line-height: 1;
  font-family: Futura, "Avenir Next", system-ui, sans-serif;
  letter-spacing: 0.03em;
}
</style>
