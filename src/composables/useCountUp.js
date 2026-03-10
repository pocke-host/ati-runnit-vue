// src/composables/useCountUp.js
// Animates a numeric display value from 0 → target with cubic ease-out.
// Usage:
//   const { animate } = useCountUp()
//   animate(displayRef, 14235, n => Math.round(n).toLocaleString() + '+')
//   // displayRef.value will animate from "0" → "14,235+"

import { onUnmounted } from 'vue'

export function useCountUp({ duration = 1300 } = {}) {
  const rafIds = []

  /**
   * @param {import('vue').Ref<string>} displayRef  - reactive ref that drives the template
   * @param {number}                    target       - final numeric value
   * @param {(n: number) => string}     formatFn     - how to format the intermediate value
   */
  const animate = (displayRef, target, formatFn) => {
    if (!target || target <= 0) return
    const fmt = formatFn || (n => Math.round(n).toLocaleString('en-US'))
    const startTime = performance.now()

    const tick = (now) => {
      const t = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3) // cubic ease-out
      displayRef.value = fmt(target * eased)
      if (t < 1) rafIds.push(requestAnimationFrame(tick))
    }
    rafIds.push(requestAnimationFrame(tick))
  }

  onUnmounted(() => rafIds.forEach(id => cancelAnimationFrame(id)))

  return { animate }
}
