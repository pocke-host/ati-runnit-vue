import { describe, expect, it } from 'vitest'
import { activityTimestamp, dedupeActivities } from '@/composables/useTrainingData'

describe('shared training data rules', () => {
  it('uses performedAt before createdAt for display and period grouping', () => {
    expect(activityTimestamp({ performedAt: '2026-10-04T07:00:00', createdAt: '2026-10-05T12:00:00' }))
      .toBe('2026-10-04T07:00:00')
    expect(activityTimestamp({ createdAt: '2026-10-05T12:00:00' })).toBe('2026-10-05T12:00:00')
  })

  it('removes provider duplicates and hidden canonical rows', () => {
    const activities = [
      { id: 1, source: 'GARMIN', externalId: 'g-1' },
      { id: 2, source: 'GARMIN', externalId: 'g-1' },
      { id: 3, source: 'WHOOP', externalId: 'w-1', canonicalActivityId: 1 },
      { id: 4, source: 'RUNNIT' },
    ]
    expect(dedupeActivities(activities).map(activity => activity.id)).toEqual([1, 4])
  })
})
