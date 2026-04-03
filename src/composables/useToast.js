// ========== useToast.js ==========
// Global toast system — singleton state shared across all components.
// Usage: const { showToast } = useToast()
//        showToast('Saved!', 'success')
//        showToast('Something went wrong', 'error')
//        showToast('Activity deleted', 'info')

import { ref } from 'vue'

const toasts = ref([])
let nextId = 0

export function useToast() {
  function showToast(message, type = 'info', duration = 3500) {
    const id = ++nextId
    toasts.value.push({ id, message, type })
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, duration)
  }

  function dismissToast(id) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  return { toasts, showToast, dismissToast }
}
