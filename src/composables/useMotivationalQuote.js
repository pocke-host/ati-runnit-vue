import { computed, ref } from 'vue'

const QUOTES = [
  'Start where your feet are. The rest will follow.',
  'Small miles still move the finish line closer.',
  'Your future self is built in ordinary mornings.',
  'Consistency is a quiet kind of courage.',
  'You do not need a perfect day to make progress.',
  'The work counts, especially when nobody is watching.',
  'Keep the promise you made to yourself today.',
  'Strong is what happens when you keep showing up.',
  'Let today be evidence that you are becoming.',
  'There is no wasted effort in a life you are building.',
]

const storageKey = 'runnit-motivational-quote'
const index = ref(0)
const initialized = ref(false)

const todayKey = () => new Date().toISOString().slice(0, 10)
const init = () => {
  if (initialized.value) return
  initialized.value = true
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || 'null')
    if (saved?.date === todayKey() && Number.isInteger(saved.index)) index.value = saved.index % QUOTES.length
    else index.value = Math.floor(Math.random() * QUOTES.length)
    localStorage.setItem(storageKey, JSON.stringify({ date: todayKey(), index: index.value }))
  } catch { index.value = 0 }
}
const shuffle = () => {
  init()
  if (QUOTES.length < 2) return
  let next = index.value
  while (next === index.value) next = Math.floor(Math.random() * QUOTES.length)
  index.value = next
  try { localStorage.setItem(storageKey, JSON.stringify({ date: todayKey(), index: index.value })) } catch { /* storage is optional */ }
}

export function useMotivationalQuote() {
  init()
  return { quote: computed(() => QUOTES[index.value]), shuffle, quotes: QUOTES }
}
