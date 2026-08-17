// ========== useFitnessLoad.js ==========
// Shared CTL/ATL (fitness/fatigue) load model, extracted from Stats.vue so the
// same math can be reused per-sport (Sport Fitness gauges) without inlining it
// a second time. Pass a sportFilter array (matching Activity.sportType values,
// including both API-enum and legacy string forms, e.g. ['RUN','Running']) to
// scope the calculation to one sport; omit it for the blended all-sports score.

const IF_BY_TYPE = {
  RUN: 0.85, Running: 0.85,
  BIKE: 0.75, Cycling: 0.75,
  SWIM: 0.70, Swimming: 0.70,
}

export function useFitnessLoad(activities, sportFilter = null) {
  const acts = (activities || []).filter(a => !sportFilter || sportFilter.includes(a.sportType))
  if (!acts.length) return { fitnessScore: 0, fatigueScore: 0, formScore: 0 }

  const today = new Date()
  today.setHours(23, 59, 59, 999)
  const dayMs = 86400000
  const DAYS = 90

  // Daily TSS proxy: (hours × IF²) × 100
  const dailyTss = new Array(DAYS).fill(0)
  for (const a of acts) {
    const daysAgo = Math.floor((today - new Date(a.performedAt)) / dayMs)
    if (daysAgo >= 0 && daysAgo < DAYS) {
      const ifFactor = IF_BY_TYPE[a.sportType] || 0.75
      const tss = ((a.durationSeconds || 0) / 3600) * (ifFactor * ifFactor) * 100
      dailyTss[DAYS - 1 - daysAgo] += tss
    }
  }

  // EMA — CTL (42d) and ATL (7d) using industry-standard 2/(τ+1) smoothing
  let ctl = 0, atl = 0
  const ctlK = 2 / 43, atlK = 2 / 8
  for (let i = 0; i < DAYS; i++) {
    ctl = ctl * (1 - ctlK) + dailyTss[i] * ctlK
    atl = atl * (1 - atlK) + dailyTss[i] * atlK
  }

  const fitnessScore = Math.min(100, Math.round(ctl))
  const fatigueScore = Math.min(100, Math.round(atl))
  const formScore = Math.round(fitnessScore - fatigueScore)

  return { fitnessScore, fatigueScore, formScore }
}
