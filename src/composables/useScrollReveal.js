// src/composables/useScrollReveal.js
// Shared IntersectionObserver — fires `is-visible` on elements as they enter viewport.
// Usage in component:
//   const { reveal } = useScrollReveal()
//   <section :ref="el => reveal(el)" data-reveal>
//   <div :ref="el => reveal(el)" data-stagger> ← children animate with delay
//
// Optional onVisible callback:
//   reveal(el, () => startCountUp())   ← fires once when element enters view

import { onUnmounted } from 'vue'

let sharedObserver = null
const onVisibleCallbacks = new Map()

const getObserver = () => {
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            const cb = onVisibleCallbacks.get(entry.target)
            if (cb) {
              cb()
              onVisibleCallbacks.delete(entry.target)
            }
          }
        })
      },
      { threshold: 0.10, rootMargin: '0px 0px -56px 0px' }
    )
  }
  return sharedObserver
}

export function useScrollReveal() {
  const observed = []

  const reveal = (el, onVisible) => {
    if (!el) return
    const obs = getObserver()
    obs.observe(el)
    observed.push(el)
    if (onVisible) onVisibleCallbacks.set(el, onVisible)
  }

  onUnmounted(() => {
    const obs = getObserver()
    observed.forEach(el => {
      obs.unobserve(el)
      onVisibleCallbacks.delete(el)
    })
    observed.length = 0
  })

  return { reveal }
}
