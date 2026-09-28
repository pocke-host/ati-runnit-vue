import { describe, expect, it } from 'vitest'
import { useFitnessLoad } from '../composables/useFitnessLoad'

describe('stats fitness load regression', () => {
  it('exposes CTL and ATL for the performance summary', () => {
    const result = useFitnessLoad([{
      sportType: 'RUN',
      durationSeconds: 3600,
      performedAt: new Date().toISOString(),
    }])

    expect(result.ctl).toBeTypeOf('number')
    expect(result.atl).toBeTypeOf('number')
    expect(result.fitnessScore).toBeGreaterThanOrEqual(0)
    expect(result.fatigueScore).toBeGreaterThanOrEqual(0)
  })
})
