/**
 * useGrowthTimeline — Compute an athlete's personal milestone history.
 *
 * Scans the activity array chronologically and emits a milestone event
 * each time the athlete hits a career first or volume marker.
 *
 * @param {Array|Ref<Array>} activities — plain array or Vue ref
 * @returns {Array<{ icon, label, date, sub }>}  ordered oldest → newest
 */
export function useGrowthTimeline(activities) {
  const arr = activities?.value ?? activities
  if (!arr || arr.length === 0) return []

  const getTime = (a) => new Date(a.startTime || a.activityDate || 0).getTime()

  // Sort oldest first
  const sorted = [...arr].sort((a, b) => getTime(a) - getTime(b))

  const fmt = (t) =>
    new Date(t).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })

  const milestones = []
  const seen = new Set()  // prevent duplicate milestone types

  const add = (key, icon, label, date, sub) => {
    if (!seen.has(key)) {
      seen.add(key)
      milestones.push({ icon, label, date: fmt(date), sub })
    }
  }

  let totalMeters = 0
  let count = 0

  for (const act of sorted) {
    const dist  = act.distanceMeters || 0
    const sport = (act.activityType || '').toLowerCase()
    const name  = (act.name || '').toLowerCase()
    const t     = getTime(act)

    count++
    totalMeters += dist
    const totalMiles = totalMeters / 1609.34
    const actMiles   = dist / 1609.34

    // ── Activity firsts ──────────────────────────────────────────────────────
    if (count === 1) {
      add('first-act', '🏁', 'First Activity', t, act.name || 'Your very first logged workout')
    }

    // ── Distance PRs (running) ───────────────────────────────────────────────
    // 1 mile
    if (actMiles >= 0.9 && actMiles <= 1.2 &&
        (sport === 'run' || sport === 'running' || sport === 'trail')) {
      add('first-mile', '1M', 'First Mile', t, act.name)
    }

    // 5K (4.8–5.4 km)
    if (dist >= 4800 && dist <= 5400) {
      add('first-5k', '5K', 'First 5K', t, act.name)
    }

    // 10K (9.5–10.6 km)
    if (dist >= 9500 && dist <= 10600) {
      add('first-10k', '10K', 'First 10K', t, act.name)
    }

    // Half Marathon (20.5–22 km)
    if (dist >= 20500 && dist <= 22000) {
      add('first-half', '½', 'First Half Marathon', t, act.name)
    }

    // Marathon (41.5–43.5 km)
    if (dist >= 41500 && dist <= 43500) {
      add('first-marathon', '26.2', 'First Marathon', t, act.name)
    }

    // Ultra (>50 km)
    if (dist > 50000 &&
        (sport === 'run' || sport === 'running' || sport === 'trail' ||
         name.includes('ultra') || name.includes('trail'))) {
      add('first-ultra', '🏔️', 'First Ultra', t, act.name)
    }

    // ── Sport firsts ─────────────────────────────────────────────────────────
    if (sport === 'cycling' || sport === 'ride' || sport === 'bike') {
      add('first-ride', '🚴', 'First Ride', t, act.name)
    }

    if (sport === 'swim' || sport === 'swimming' || sport === 'pool' || sport === 'openwater') {
      add('first-swim', '🏊', 'First Swim', t, act.name)
    }

    if (sport === 'triathlon' || sport === 'tri' ||
        name.includes('triathlon') || name.includes('ironman') || name.includes('70.3')) {
      add('first-tri', '🏅', 'First Triathlon', t, act.name)
    }

    if (sport === 'trail' || name.includes('trail run')) {
      add('first-trail', '🌲', 'First Trail Run', t, act.name)
    }

    if (sport === 'hike' || sport === 'hiking') {
      add('first-hike', '⛰️', 'First Hike', t, act.name)
    }

    // ── Activity count milestones ─────────────────────────────────────────────
    if (count === 10)  add('act-10',  '10',  '10 Activities',   t, 'Just getting started')
    if (count === 50)  add('act-50',  '50',  '50 Activities',   t, 'Fifty workouts logged')
    if (count === 100) add('act-100', '💯',  '100 Activities',  t, 'Triple digits')
    if (count === 200) add('act-200', '200', '200 Activities',  t, 'Undeniable consistency')
    if (count === 500) add('act-500', '500', '500 Activities',  t, 'A lifestyle, not a hobby')

    // ── Volume milestones (cumulative) ────────────────────────────────────────
    if (totalMiles >= 100  && !seen.has('vol-100'))  add('vol-100',  '📍', '100 Miles',   t, `${Math.round(totalMiles)} total miles`)
    if (totalMiles >= 500  && !seen.has('vol-500'))  add('vol-500',  '⭐', '500 Miles',   t, `${Math.round(totalMiles)} total miles`)
    if (totalMiles >= 1000 && !seen.has('vol-1k'))   add('vol-1k',   '🏆', '1,000 Miles', t, `${Math.round(totalMiles)} total miles`)
    if (totalMiles >= 2500 && !seen.has('vol-2500')) add('vol-2500', '🌍', '2,500 Miles', t, `${Math.round(totalMiles)} total miles`)
  }

  return milestones
}
