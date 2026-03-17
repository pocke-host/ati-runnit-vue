/**
 * useDisciplineScore — composite training discipline metric (0–100)
 *
 * Sub-metrics:
 *   Consistency    30 pts  weeks in last 8 with ≥1 activity
 *   Frequency      25 pts  avg activities/week in last 4 weeks (target ≥4/wk)
 *   Early Commitment 20 pts % of last-30-day activities before 9 am (target ≥50%)
 *   Volume Trend   25 pts  this week km vs 4-week avg km
 *
 * Levels:  0–24 BEGINNER  25–49 CONSISTENT  50–74 DISCIPLINED  75–100 ELITE
 */

const LEVELS = [
  { min: 75, label: 'ELITE',       color: '#000000' },
  { min: 50, label: 'DISCIPLINED', color: '#16a34a' },
  { min: 25, label: 'CONSISTENT',  color: '#0052FF' },
  { min: 0,  label: 'BEGINNER',    color: '#767676' },
]

function startOfWeek(date) {
  const d = new Date(date)
  const day = d.getDay() // 0=Sun
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - day)
  return d
}

export function useDisciplineScore(activitiesInput) {
  const activities = (activitiesInput?.value ?? activitiesInput) || []

  const now = new Date()

  // ── Consistency (30 pts) ─────────────────────────────────────────────────
  // Count weeks in last 8 that have ≥1 activity
  const week8Ago = new Date(now)
  week8Ago.setDate(week8Ago.getDate() - 56) // 8 * 7

  const weeksActive = new Set()
  for (const act of activities) {
    const d = new Date(act.startTime || act.createdAt)
    if (d < week8Ago) continue
    // ISO week key: year + week-start date string
    const ws = startOfWeek(d)
    weeksActive.add(ws.toISOString().slice(0, 10))
  }
  const consistencyScore = Math.round((Math.min(weeksActive.size, 8) / 8) * 30)

  // ── Frequency (25 pts) ───────────────────────────────────────────────────
  // Avg activities/week in last 4 weeks; target ≥4/wk
  const week4Ago = new Date(now)
  week4Ago.setDate(week4Ago.getDate() - 28)
  const last4Count = activities.filter(a => new Date(a.startTime || a.createdAt) >= week4Ago).length
  const avgPerWeek = last4Count / 4
  const frequencyScore = Math.round(Math.min(1, avgPerWeek / 4) * 25)

  // ── Early Commitment (20 pts) ────────────────────────────────────────────
  // % of activities in last 30 days that started before 9 am; target ≥50%
  const day30Ago = new Date(now)
  day30Ago.setDate(day30Ago.getDate() - 30)
  const last30 = activities.filter(a => new Date(a.startTime || a.createdAt) >= day30Ago)
  let earlyCommitmentScore = 0
  if (last30.length > 0) {
    const earlyCount = last30.filter(a => {
      const d = new Date(a.startTime || a.createdAt)
      return d.getHours() < 9
    }).length
    const pct = earlyCount / last30.length
    earlyCommitmentScore = Math.round(Math.min(1, pct / 0.5) * 20)
  }

  // ── Volume Trend (25 pts) ────────────────────────────────────────────────
  // This week's km vs 4-week avg km
  const thisWeekStart = startOfWeek(now)
  const thisWeekKm = activities
    .filter(a => new Date(a.startTime || a.createdAt) >= thisWeekStart)
    .reduce((s, a) => s + (a.distanceMeters || 0) / 1000, 0)

  // 4-week average (excluding current week for fairness, use prior 4 full weeks)
  let weeklyKms = []
  for (let w = 1; w <= 4; w++) {
    const wStart = new Date(thisWeekStart)
    wStart.setDate(wStart.getDate() - w * 7)
    const wEnd = new Date(wStart)
    wEnd.setDate(wEnd.getDate() + 7)
    const km = activities
      .filter(a => {
        const d = new Date(a.startTime || a.createdAt)
        return d >= wStart && d < wEnd
      })
      .reduce((s, a) => s + (a.distanceMeters || 0) / 1000, 0)
    weeklyKms.push(km)
  }
  const avgKm = weeklyKms.reduce((s, k) => s + k, 0) / 4

  let volumeTrendScore = 0
  if (avgKm > 0) {
    const ratio = thisWeekKm / avgKm
    if (ratio >= 1.0) volumeTrendScore = 25
    else if (ratio >= 0.75) volumeTrendScore = 18
    else if (ratio >= 0.5) volumeTrendScore = 12
    else if (ratio >= 0.25) volumeTrendScore = 6
  } else if (thisWeekKm > 0) {
    // Has activity this week but no prior 4-week data → reward them
    volumeTrendScore = 12
  }

  const score = consistencyScore + frequencyScore + earlyCommitmentScore + volumeTrendScore

  const levelInfo = LEVELS.find(l => score >= l.min) || LEVELS[LEVELS.length - 1]

  return {
    score,
    level: levelInfo.label,
    levelColor: levelInfo.color,
    breakdown: {
      consistency:     { score: consistencyScore,     max: 30, label: 'Consistency',   detail: `${weeksActive.size}/8 weeks active` },
      frequency:       { score: frequencyScore,        max: 25, label: 'Frequency',     detail: `${avgPerWeek.toFixed(1)}/wk avg` },
      earlyCommitment: { score: earlyCommitmentScore,  max: 20, label: 'Early Bird',    detail: last30.length ? `${last30.filter(a => new Date(a.startTime || a.createdAt).getHours() < 9).length}/${last30.length} before 9am` : 'No data' },
      volumeTrend:     { score: volumeTrendScore,      max: 25, label: 'Volume Trend',  detail: avgKm > 0 ? `${thisWeekKm.toFixed(1)}km vs ${avgKm.toFixed(1)}km avg` : 'Building baseline' },
    },
  }
}
