// ========== useSportIcon.js ==========
// Central sport-type icon mapping. Bootstrap Icons only — no emoji as UI,
// per the Good Record design system. Bootstrap Icons has no dedicated
// running/swimming/hiking/dumbbell glyphs, so these are the closest
// reasonable stand-ins from the installed set (checked against the actual
// bootstrap-icons package, not guessed): speed for running, a water drop
// for swimming, a tree for hiking/trail, explosive power for strength.

const SPORT_ICONS = {
  RUN: 'bi-speedometer2',
  BIKE: 'bi-bicycle',
  SWIM: 'bi-droplet-fill',
  HIKE: 'bi-tree-fill',
  WALK: 'bi-person-walking',
  STRENGTH: 'bi-lightning-charge-fill',
  OTHER: 'bi-activity',
}

const SPORT_LABELS = {
  RUN: 'Run',
  BIKE: 'Ride',
  SWIM: 'Swim',
  HIKE: 'Hike',
  WALK: 'Walk',
  STRENGTH: 'Strength',
  OTHER: 'Workout',
}

export function useSportIcon() {
  function sportIconClass(sportType) {
    return SPORT_ICONS[sportType] || SPORT_ICONS.OTHER
  }

  function sportLabel(sportType) {
    return SPORT_LABELS[sportType] || SPORT_LABELS.OTHER
  }

  return { sportIconClass, sportLabel }
}
