/**
 * useTrainingBlock — detects current training phase from activity volume pattern
 *
 * Phases are computed by comparing rolling 4-week windows:
 *   TAPER  — volume dropped >20% from the prior 4-week peak
 *   PEAK   — current 4-week avg is highest 8-week period
 *   BUILD  — current 4-week avg > prior 4-week avg by >10%
 *   BASE   — low or steady volume (default)
 *
 * Returns { phase, label, color, description, trend, weeklyKms }
 */

const PHASES = {
  PEAK:  { label: 'PEAK',  color: '#16a34a', description: 'Highest training load — race day is close' },
  BUILD: { label: 'BUILD', color: '#0052FF', description: 'Volume rising — fitness is accumulating' },
  TAPER: { label: 'TAPER', color: '#C46A2A', description: 'Load dropping — recover and sharpen' },
  BASE:  { label: 'BASE',  color: '#767676', description: 'Building your aerobic foundation' },
}

function weekStart(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - d.getDay())
  return d
}

export function useTrainingBlock(activitiesInput) {
  const activities = (activitiesInput?.value ?? activitiesInput) || []

  const now = new Date()
  const thisWeek = weekStart(now)

  // Build weekly km map for last 12 weeks
  const weeklyKms = []
  for (let w = 0; w < 12; w++) {
    const wStart = new Date(thisWeek)
    wStart.setDate(wStart.getDate() - w * 7)
    const wEnd = new Date(wStart)
    wEnd.setDate(wEnd.getDate() + 7)
    const km = activities
      .filter(a => {
        const d = new Date(a.startTime || a.createdAt)
        return d >= wStart && d < wEnd
      })
      .reduce((s, a) => s + (a.distanceMeters || 0) / 1000, 0)
    weeklyKms.unshift({ week: w, km: Math.round(km * 10) / 10 })
  }

  // 4-week rolling averages (current = weeks 0-3, prior = weeks 4-7)
  const current4 = weeklyKms.slice(8).reduce((s, w) => s + w.km, 0) / 4
  const prior4   = weeklyKms.slice(4, 8).reduce((s, w) => s + w.km, 0) / 4
  const all8avg  = weeklyKms.slice(4).reduce((s, w) => s + w.km, 0) / 8

  let phase = 'BASE'
  let trend = 0

  if (current4 > 0 || prior4 > 0) {
    trend = prior4 > 0 ? Math.round(((current4 - prior4) / prior4) * 100) : 0

    if (prior4 > 0 && current4 < prior4 * 0.8) {
      phase = 'TAPER'
    } else if (current4 >= all8avg * 1.1 && current4 >= prior4 * 0.95) {
      phase = 'PEAK'
    } else if (current4 > prior4 * 1.1) {
      phase = 'BUILD'
    } else {
      phase = 'BASE'
    }
  }

  return {
    phase,
    ...PHASES[phase],
    trend,
    weeklyKms: weeklyKms.slice(4), // last 8 weeks for sparkline
    current4km: Math.round(current4 * 10) / 10,
    prior4km:   Math.round(prior4 * 10) / 10,
  }
}
