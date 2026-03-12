import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useUnits } from '@/composables/useUnits'

describe('useUnits', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  describe('imperial (default)', () => {
    it('formats distance in miles', () => {
      const { formatDistance } = useUnits()
      // 1609.34 meters = 1 mile
      expect(formatDistance(1609.34)).toBe('1.00 mi')
    })

    it('formats 5km in miles', () => {
      const { formatDistance } = useUnits()
      expect(formatDistance(5000)).toBe('3.11 mi')
    })

    it('returns — for null distance', () => {
      const { formatDistance } = useUnits()
      expect(formatDistance(null)).toBe('—')
    })

    it('returns — for undefined distance', () => {
      const { formatDistance } = useUnits()
      expect(formatDistance(undefined)).toBe('—')
    })

    it('formats elevation in feet', () => {
      const { formatElevation } = useUnits()
      // 100 meters * 3.28084 = 328.084 → 328 ft
      expect(formatElevation(100)).toBe('328 ft')
    })

    it('returns — for null elevation', () => {
      const { formatElevation } = useUnits()
      expect(formatElevation(null)).toBe('—')
    })

    it('returns mi label', () => {
      const { distanceLabel } = useUnits()
      expect(distanceLabel.value).toBe('mi')
    })
  })

  describe('metric', () => {
    beforeEach(() => {
      const authStore = useAuthStore()
      authStore.unitSystem = 'metric'
    })

    it('formats distance in km', () => {
      const { formatDistance } = useUnits()
      expect(formatDistance(5000)).toBe('5.00 km')
    })

    it('formats elevation in meters', () => {
      const { formatElevation } = useUnits()
      expect(formatElevation(100)).toBe('100 m')
    })

    it('returns km label', () => {
      const { distanceLabel } = useUnits()
      expect(distanceLabel.value).toBe('km')
    })
  })

  describe('formatDuration', () => {
    it('formats seconds under 1 hour as minutes', () => {
      const { formatDuration } = useUnits()
      expect(formatDuration(2700)).toBe('45 min')
    })

    it('formats exactly 1 hour', () => {
      const { formatDuration } = useUnits()
      expect(formatDuration(3600)).toBe('1h 0m')
    })

    it('formats 1.5 hours', () => {
      const { formatDuration } = useUnits()
      expect(formatDuration(5400)).toBe('1h 30m')
    })

    it('returns — for null', () => {
      const { formatDuration } = useUnits()
      expect(formatDuration(null)).toBe('—')
    })
  })

  describe('formatDurationClock', () => {
    it('formats under 1 hour as mm:ss', () => {
      const { formatDurationClock } = useUnits()
      expect(formatDurationClock(305)).toBe('5:05')
    })

    it('formats over 1 hour as h:mm:ss', () => {
      const { formatDurationClock } = useUnits()
      expect(formatDurationClock(3661)).toBe('1:01:01')
    })
  })

  describe('metersToDisplay', () => {
    it('converts meters to miles in imperial', () => {
      const { metersToDisplay } = useUnits()
      const miles = metersToDisplay(1609.34)
      expect(miles).toBeCloseTo(1.0, 1)
    })

    it('converts meters to km in metric', () => {
      const authStore = useAuthStore()
      authStore.unitSystem = 'metric'
      const { metersToDisplay } = useUnits()
      expect(metersToDisplay(5000)).toBe(5)
    })
  })
})
