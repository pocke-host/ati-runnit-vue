// src/composables/useAiWorkout.js
// Client-side AI workout generator — no external API needed.
// Uses CTL/ATL/ACWR, recent history, day-of-week, and training plan phase
// to produce personalized, context-aware workout prescriptions.

const TYPE_COLORS = {
  EASY:     '#22c55e',
  TEMPO:    '#f97316',
  INTERVAL: '#ef4444',
  LONG_RUN: '#8b5cf6',
  RECOVERY: '#06b6d4',
  REST:     '#9ca3af',
}

export function useAiWorkout() {

  function typeColor(type) {
    return TYPE_COLORS[type] || '#767676'
  }

  /**
   * Generate a single workout suggestion.
   * @param {string} dateStr - 'YYYY-MM-DD'
   * @param {object} ctx - { recentActivities, fitnessMetrics, activePlan, variant }
   *   fitnessMetrics: { ctl, atl, acwr, formScore, fitnessScore }
   *   activePlan: { currentPhase } or null
   *   variant: 0|1|2 — cycle for regenerate
   */
  function generateWorkout(dateStr, ctx = {}) {
    const { recentActivities = [], fitnessMetrics = {}, activePlan = null, variant = 0 } = ctx
    const date = new Date(dateStr + 'T12:00:00')
    const dow  = date.getDay() // 0=Sun, 1=Mon … 6=Sat

    const ctl      = fitnessMetrics.ctl      ?? 0
    const atl      = fitnessMetrics.atl      ?? 0
    const acwr     = fitnessMetrics.acwr     ?? (ctl > 0 ? atl / ctl : 1)
    const formScore= fitnessMetrics.formScore?? 0

    const dayMs = 86400000
    const now   = Date.now()

    // Activities in last N days
    const last2 = recentActivities.filter(a => (now - new Date(a.createdAt)) / dayMs <= 2)
    const last5 = recentActivities.filter(a => (now - new Date(a.createdAt)) / dayMs <= 5)
    const last7 = recentActivities.filter(a => (now - new Date(a.createdAt)) / dayMs <= 7)

    const recentTypes = last5.map(a => a.workoutType || _classifyBasic(a))
    const hadQuality  = recentTypes.some(t => ['INTERVAL', 'TEMPO', 'RACE'].includes(t))
    const hadLong     = recentTypes.some(t => t === 'LONG_RUN')
    const last2Types  = last2.map(a => a.workoutType || _classifyBasic(a))
    const freshAfterHard = last2Types.some(t => ['INTERVAL', 'RACE', 'LONG_RUN'].includes(t))

    const phase = activePlan?.currentPhase || 'BASE'
    const weekVol = last7.reduce((s, a) => s + (a.distanceMeters || 0) / 1000, 0)

    // --- Determine workout type ---
    let wType

    if (acwr > 1.45 || formScore < -25) {
      wType = 'RECOVERY'
    } else if (freshAfterHard && dow !== 6) {
      wType = 'EASY'
    } else if (dow === 0) {
      // Sunday — rest unless low fitness
      wType = ctl < 1.5 ? 'EASY' : 'REST'
    } else if (dow === 6) {
      // Saturday — long run
      wType = hadLong ? 'EASY' : 'LONG_RUN'
    } else if ([3, 4].includes(dow) && !hadQuality && acwr < 1.3) {
      // Wed/Thu quality window
      if (phase === 'BASE') {
        wType = variant % 2 === 0 ? 'TEMPO' : 'EASY'
      } else if (phase === 'BUILD' || phase === 'PEAK') {
        wType = variant % 2 === 0 ? 'INTERVAL' : 'TEMPO'
      } else {
        wType = 'TEMPO'
      }
    } else if ([1, 2].includes(dow)) {
      // Mon/Tue — easy base work
      wType = 'EASY'
    } else {
      wType = 'EASY'
    }

    // Variant-based type rotation when regenerating
    if (variant === 1 && wType === 'EASY' && acwr < 1.2) {
      wType = [3, 4, 5].includes(dow) ? 'TEMPO' : 'EASY'
    }
    if (variant === 2 && ['EASY', 'TEMPO'].includes(wType) && acwr < 1.15 && phase !== 'BASE') {
      wType = 'INTERVAL'
    }

    // --- Distance based on CTL + type ---
    const baseKm = Math.max(4, Math.min(18, ctl * 1.6))
    let distKm
    switch (wType) {
      case 'RECOVERY':  distKm = Math.max(3, baseKm * 0.45); break
      case 'EASY':      distKm = baseKm;                       break
      case 'TEMPO':     distKm = Math.max(6, baseKm * 0.7);   break
      case 'INTERVAL':  distKm = Math.max(6, baseKm * 0.6);   break
      case 'LONG_RUN':  distKm = Math.min(32, baseKm * 1.9);  break
      case 'REST':      distKm = 0;                            break
      default:          distKm = baseKm
    }
    distKm = Math.round(distKm * 10) / 10

    return _build(wType, distKm, { ctl, acwr, formScore, phase, variant, weekVol, dow })
  }

  /**
   * Generate a full week of suggestions (Mon–Sat, skip days that already have events).
   * Returns array of { dateStr, workout }.
   */
  function generateWeek(weekMondayStr, ctx = {}) {
    const existingDates = new Set((ctx.existingEvents || []).map(e => e.plannedDate))
    const results = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekMondayStr + 'T12:00:00')
      d.setDate(d.getDate() + i)
      const dateStr = d.toISOString().slice(0, 10)
      if (existingDates.has(dateStr)) continue
      const workout = generateWorkout(dateStr, ctx)
      results.push({ dateStr, workout })
    }
    // Filter out REST suggestions — user can decide rest days
    return results.filter(r => r.workout.workoutType !== 'REST')
  }

  // ── Private helpers ──────────────────────────────────────────

  function _build(wType, distKm, { ctl, acwr, formScore, phase, variant, weekVol, dow }) {
    const v = variant % 3
    const builders = {
      EASY: () => {
        const titles  = ['Easy Aerobic Run', 'Base Building Run', 'Comfortable Distance', 'Aerobic Foundation Run']
        const descs   = [
          `Run ${distKm} km at a fully conversational pace — you should be able to speak in full sentences. Heart rate under 75% max. Focus on relaxed form, not speed.`,
          `${distKm} km easy run. Nasal breathing is a reliable pacing guide today. This session builds mitochondrial density and fat-burning capacity without stressing your system.`,
          `${distKm} km of aerobic maintenance. Keep effort light — this is not a workout to push. Consistent easy mileage is the foundation every fast runner is built on.`,
        ]
        const reasons = [
          `Your CTL is ${ctl.toFixed(1)} km/day. Building this aerobic base consistently is the single highest-ROI training habit.`,
          `Form score: ${formScore > 0 ? '+' : ''}${formScore}. ${formScore > 0 ? 'You\'re fresh — bank this easy mileage before your next quality session.' : 'A bit fatigued. Easy mileage accelerates recovery without adding stress.'}`,
          `${weekVol.toFixed(0)} km logged this week. Adding an easy run maintains your aerobic signal without risking overtraining.`,
        ]
        return { workoutType: 'EASY', title: titles[v], description: descs[v], reasoning: reasons[v], distanceMeters: Math.round(distKm * 1000), durationMinutes: Math.round(distKm * 7) }
      },
      TEMPO: () => {
        const tempoKm  = Math.round(distKm * 0.6 * 10) / 10
        const titles   = ['Threshold Run', 'Tempo Effort', 'Lactate Threshold Session']
        const descs    = [
          `Warm up 10–12 min easy, then ${tempoKm} km at threshold pace (comfortably hard — "7/10" effort, can say 3–4 words but not a sentence), cool down 10 min easy. Total ~${distKm} km.`,
          `15 min easy warm-up → ${tempoKm} km at your lactate threshold (half-marathon effort) → 10 min cool-down. Control the middle — don't sprint the first km.`,
          `10 min easy → 2 × ${Math.round(tempoKm / 2 * 10) / 10} km tempo with 2 min float recovery → 10 min easy. This broken-tempo format is easier to execute than a continuous block.`,
        ]
        const reasons = [
          `Phase: ${phase}. Tempo runs are the most direct way to raise your lactate threshold and improve your race pace.`,
          `ACWR ${acwr.toFixed(2)} — you're in the productive loading zone. A threshold session now produces maximum adaptation.`,
          `Your CTL of ${ctl.toFixed(1)} supports tempo work. This is the effort level that bridges easy aerobic running and race intensity.`,
        ]
        return { workoutType: 'TEMPO', title: titles[v], description: descs[v], reasoning: reasons[v], distanceMeters: Math.round(distKm * 1000), durationMinutes: Math.round(distKm * 5.5) }
      },
      INTERVAL: () => {
        const reps    = ctl > 5 ? 6 : ctl > 3 ? 5 : 4
        const repKm   = phase === 'PEAK' ? 1.2 : 1.0
        const titles  = [`${reps}×${repKm}km Intervals`, `Track Session — ${reps}×${repKm}K`, `Speed Work: ${reps}×${repKm}km`]
        const descs   = [
          `Warm up 15 min easy. Run ${reps} × ${repKm} km at your 5K race effort (8/10 — controlled hard). Take 90-second jog recovery between each. Cool down 10–15 min. Total ~${distKm} km.`,
          `Easy 15 min → ${reps} × ${repKm} km at 5K pace with 90s jog recovery → 10 min easy. Run each rep at the same pace — if the last rep is slower, you started too fast.`,
          `15 min warm-up → ${reps} × ${repKm} km hard (not sprint, race-pace) with 2 min easy jog recovery → 15 min cool-down. This session is the most potent VO2max stimulus you can run.`,
        ]
        const reasons = [
          `${phase} phase. Intervals are the primary VO2max driver — each rep puts your cardiovascular system at near-maximum, signaling adaptation.`,
          `ACWR ${acwr.toFixed(2)} — load is manageable. ${reps} reps at your CTL level (${ctl.toFixed(1)}) is the right dose.`,
          `Your easy mileage has been consistent. Now it's time to sharpen. Intervals build speed you'll carry into race day.`,
        ]
        return { workoutType: 'INTERVAL', title: titles[v], description: descs[v], reasoning: reasons[v], distanceMeters: Math.round(distKm * 1000), durationMinutes: Math.round(distKm * 5 + reps * 2 + 25) }
      },
      LONG_RUN: () => {
        const titles = ['Long Run', 'Weekend Long Run', 'Long Slow Distance']
        const descs  = [
          `${distKm} km long run at an easy, aerobic effort (65–70% max HR). Take fluids every 20 min and fuel every 45 min if running over 75 minutes. Don't race this — save it for the final few km.`,
          `${distKm} km long run. Target a pace 75–90 seconds per km slower than your 5K pace. The goal is time on feet, not speed. Your mitochondria multiply most when you run far and slow.`,
          `${distKm} km easy long run. Include a progressive finish: last 3 km at marathon effort. This builds fatigue resistance — the ability to run well when tired.`,
        ]
        const reasons = [
          `Long runs are the single most important session of the week. They develop aerobic infrastructure that speed work alone can\'t build.`,
          `Phase ${phase}. At your current CTL (${ctl.toFixed(1)}), ${distKm} km is the optimal stimulus — enough stress to drive adaptation, not so much you need a week to recover.`,
          `Consistent long runs over weeks and months are what separate recreational runners from competitive ones. This is your most valuable session.`,
        ]
        return { workoutType: 'LONG_RUN', title: titles[v], description: descs[v], reasoning: reasons[v], distanceMeters: Math.round(distKm * 1000), durationMinutes: Math.round(distKm * 7.5) }
      },
      RECOVERY: () => {
        const recKm = distKm
        return {
          workoutType: 'RECOVERY',
          title: 'Recovery Run',
          description: `Very easy ${recKm} km recovery run. Keep heart rate below 65% max — genuinely easy. Walk breaks are fine. This flushes metabolic byproducts without adding training stress. You should feel better at the end than at the start.`,
          reasoning: `ACWR ${acwr.toFixed(2)} ${acwr > 1.45 ? '— elevated. Active recovery now prevents deeper fatigue from compounding.' : ''}. Form score ${formScore > 0 ? '+' : ''}${formScore}. Protect your fitness with smart recovery.`,
          distanceMeters: Math.round(recKm * 1000),
          durationMinutes: Math.round(recKm * 9),
        }
      },
      REST: () => ({
        workoutType: 'REST',
        title: 'Rest Day',
        description: 'Complete rest, stretching, foam rolling, or light yoga. Sleep and nutrition are training. Adaptations happen during recovery, not during the workout itself.',
        reasoning: 'Rest days are not wasted days. This is when your body rebuilds stronger. Protect them.',
        distanceMeters: 0,
        durationMinutes: 0,
      }),
    }

    return (builders[wType] || builders.EASY)()
  }

  function _classifyBasic(activity) {
    if (!activity) return 'EASY'
    const { distanceMeters = 0, durationSeconds = 0 } = activity
    if (distanceMeters < 100) return 'REST'
    const paceSkm = (durationSeconds / distanceMeters) * 1000
    const distKm  = distanceMeters / 1000
    if (distKm > 15) return 'LONG_RUN'
    if (paceSkm < 270) return 'INTERVAL'
    if (paceSkm < 330) return 'TEMPO'
    if (paceSkm > 420) return 'RECOVERY'
    return 'EASY'
  }

  return { generateWorkout, generateWeek, typeColor, TYPE_COLORS }
}
