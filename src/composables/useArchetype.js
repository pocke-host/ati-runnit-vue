/**
 * useArchetype — Detect an athlete's training archetype from their activity history.
 *
 * Five archetypes, each scored independently from the activities array.
 * The highest scorer wins. Falls back to THE EXPLORER when data is sparse.
 *
 * @param {Array|Ref<Array>} activities  — plain array or Vue ref
 * @returns {{ key, label, tagline, traits, color, icon }}
 */
export function useArchetype(activities) {
  const arr = activities?.value ?? activities
  if (!arr || arr.length === 0) {
    return {
      key: 'unknown', label: 'UNCHARTED',
      tagline: 'Log activities to discover your archetype.',
      traits: [], color: '#767676', icon: 'bi-question-circle',
    }
  }

  const now = Date.now()
  const cutoff90 = now - 90 * 86400000
  const cutoff8w  = now - 8 * 7 * 86400000

  // Use createdAt as the activity timestamp (the actual field returned by the API)
  const getTime = (a) => new Date(a.createdAt || 0).getTime()

  const recent = arr.filter(a => getTime(a) >= cutoff90)

  // ── Sport diversity in last 90 days ─────────────────────────────────────
  const recentSports = new Set(
    recent.map(a => (a.sportType || '').toUpperCase()).filter(Boolean)
  )

  // ── Average distance (miles) ──────────────────────────────────────────────
  const distMiles = arr
    .map(a => (a.distanceMeters || 0) / 1609.34)
    .filter(d => d > 0.5)
  const avgDist = distMiles.length
    ? distMiles.reduce((s, d) => s + d, 0) / distMiles.length
    : 0
  const hasLongRun = distMiles.some(d => d >= 15)

  // ── Average pace on recent runs (secs/mile) ──────────────────────────────
  const runPaces = recent
    .filter(a => a.sportType === 'RUN')
    .map(a => {
      const miles = (a.distanceMeters || 0) / 1609.34
      return miles >= 0.5 && a.durationSeconds
        ? a.durationSeconds / miles
        : null
    })
    .filter(p => p !== null)
  const avgPace = runPaces.length
    ? runPaces.reduce((s, p) => s + p, 0) / runPaces.length
    : 999 // unknown = slow default

  // ── Early-morning ratio (4–8 AM) ─────────────────────────────────────────
  const earlyCount = arr.filter(a => {
    const h = new Date(getTime(a)).getHours()
    return h >= 4 && h < 8
  }).length
  const earlyPct = arr.length ? earlyCount / arr.length : 0

  // ── 8-week consistency (weeks with ≥1 activity) ──────────────────────────
  const last8 = arr.filter(a => getTime(a) >= cutoff8w)
  const activeWeeks = new Set(last8.map(a => {
    const d = new Date(getTime(a))
    const startOfYear = new Date(d.getFullYear(), 0, 1)
    return `${d.getFullYear()}-W${Math.floor((d - startOfYear) / (7 * 86400000))}`
  })).size
  const consistencyPct = activeWeeks / 8

  // ── Trail / outdoor presence (HIKE sport type) ────────────────────────────
  const hasTrail = arr.some(a => a.sportType === 'HIKE')

  // ── Unique sport type count (all-time) ───────────────────────────────────
  const allSports = new Set(
    arr.map(a => (a.sportType || '').toUpperCase()).filter(Boolean)
  ).size

  // ── Score each archetype ─────────────────────────────────────────────────
  const scores = { grinder: 0, endurance: 0, speed: 0, explorer: 0, hybrid: 0 }

  // HYBRID — multi-sport participation
  if (recentSports.size >= 3)      scores.hybrid += 55
  else if (recentSports.size >= 2) scores.hybrid += 25
  if (allSports >= 3)              scores.hybrid += 15

  // ENDURANCE BEAST — volume and distance
  if (avgDist >= 10)      scores.endurance += 50
  else if (avgDist >= 7)  scores.endurance += 30
  else if (avgDist >= 5)  scores.endurance += 15
  if (hasLongRun)         scores.endurance += 25
  if (distMiles.length > 50 && avgDist >= 6) scores.endurance += 10

  // THE GRINDER — consistency + early mornings
  if (consistencyPct >= 0.75)      scores.grinder += 45
  else if (consistencyPct >= 0.5)  scores.grinder += 28
  else if (consistencyPct >= 0.38) scores.grinder += 15
  if (earlyPct >= 0.40)      scores.grinder += 35
  else if (earlyPct >= 0.25) scores.grinder += 20
  else if (earlyPct >= 0.15) scores.grinder += 10

  // SPEED DEMON — fast pace, shorter runs
  if (avgPace < 480)       scores.speed += 55 // < 8:00/mi
  else if (avgPace < 540)  scores.speed += 35 // < 9:00/mi
  else if (avgPace < 600)  scores.speed += 15 // < 10:00/mi
  if (avgDist < 5 && avgPace < 540) scores.speed += 20

  // THE EXPLORER — variety + trail
  if (hasTrail)        scores.explorer += 35
  if (allSports >= 3)  scores.explorer += 20
  else if (allSports >= 2) scores.explorer += 10
  if (recent.length > 0 && recentSports.size >= 2) scores.explorer += 15

  // Break tie toward grinder if high consistency
  if (scores.grinder > 0 && consistencyPct >= 0.75) scores.grinder += 5

  const winner = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0]

  const ARCHETYPES = {
    grinder: {
      key: 'grinder', label: 'THE GRINDER',
      tagline: 'Built on discipline and dark mornings.',
      traits: ['High Consistency', 'Early Riser', 'Never Misses'],
      color: '#000', icon: 'bi-alarm-fill',
    },
    endurance: {
      key: 'endurance', label: 'ENDURANCE BEAST',
      tagline: 'Distance is your currency.',
      traits: ['Long Distance', 'High Volume', 'Iron Will'],
      color: '#16a34a', icon: 'bi-infinity',
    },
    speed: {
      key: 'speed', label: 'SPEED DEMON',
      tagline: 'Fast by default. Faster by choice.',
      traits: ['Explosive Pace', 'Short & Sharp', 'Race-Ready'],
      color: '#0052FF', icon: 'bi-lightning-fill',
    },
    explorer: {
      key: 'explorer', label: 'THE EXPLORER',
      tagline: 'Every route is a new discovery.',
      traits: ['Sport Variety', 'Trail Runner', 'Route Diversity'],
      color: '#00B4D8', icon: 'bi-compass-fill',
    },
    hybrid: {
      key: 'hybrid', label: 'HYBRID ATHLETE',
      tagline: 'No single discipline can contain you.',
      traits: ['Multi-Sport', 'Versatile', 'Well-Rounded'],
      color: '#6366f1', icon: 'bi-arrows-angle-expand',
    },
  }

  return ARCHETYPES[winner] || ARCHETYPES.explorer
}
