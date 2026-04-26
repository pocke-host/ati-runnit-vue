// src/composables/usePullToRefresh.js
// Custom pull-to-refresh for mobile web/Capacitor.
// Returns reactive `refreshing` and `pullY` (current drag offset in px, capped)
// so the caller can show a visual indicator driven by pullY.

import { ref, onMounted, onUnmounted } from 'vue'

const THRESHOLD = 72   // px of pull needed to trigger refresh
const MAX_PULL  = 88   // max visual rubber-band distance
const SETTLE_Y  = 40   // locked position while refresh is in flight

export function usePullToRefresh(onRefresh) {
  const pulling    = ref(false)
  const refreshing = ref(false)
  const pullY      = ref(0)

  let startY = null

  const onTouchStart = (e) => {
    if (refreshing.value) return
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
    if (scrollTop > 4) return          // only fire when already at the top
    startY = e.touches[0].clientY
  }

  const onTouchMove = (e) => {
    if (startY === null || refreshing.value) return
    const delta = e.touches[0].clientY - startY
    if (delta <= 0) { pulling.value = false; pullY.value = 0; return }
    pulling.value = true
    // rubber-band easing: slows down as it approaches MAX_PULL
    pullY.value = Math.min(delta * 0.45, MAX_PULL)
  }

  const onTouchEnd = async () => {
    if (!pulling.value) { startY = null; return }
    pulling.value = false

    if (pullY.value >= THRESHOLD && !refreshing.value) {
      pullY.value = SETTLE_Y
      refreshing.value = true
      try { await onRefresh() } finally {
        refreshing.value = false
        pullY.value = 0
      }
    } else {
      pullY.value = 0
    }
    startY = null
  }

  onMounted(() => {
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove',  onTouchMove,  { passive: true })
    window.addEventListener('touchend',   onTouchEnd)
  })

  onUnmounted(() => {
    window.removeEventListener('touchstart', onTouchStart)
    window.removeEventListener('touchmove',  onTouchMove)
    window.removeEventListener('touchend',   onTouchEnd)
  })

  return { pulling, refreshing, pullY }
}
