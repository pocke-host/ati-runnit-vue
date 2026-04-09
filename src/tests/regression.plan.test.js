// src/tests/regression.plan.test.js
// Regression tests for training plan store — creation, persistence, workout completion
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePlanStore } from '@/stores/plan'
import axios from 'axios'

vi.mock('axios')

const MOCK_PLAN = {
  id: 301,
  name: '5K — Beginner',
  sport: 'Running',
  goal: '5K',
  level: 'beginner',
  totalWeeks: 8,
  daysPerWeek: 3,
  startDate: '2026-04-14',
  isActive: true,
  weeks: [
    {
      weekNumber: 1,
      theme: 'Base Building',
      phase: 'BASE',
      workouts: [
        { id: 1001, workoutType: 'EASY', distanceMeters: 5000, durationMinutes: 35, completed: false },
        { id: 1002, workoutType: 'LONG_RUN', distanceMeters: 8000, durationMinutes: 55, completed: false },
      ],
    },
  ],
}

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
  vi.clearAllMocks()
})

afterEach(() => {
  localStorage.clear()
})

describe('Plan Store — createPlan', () => {
  it('adds plan to list and caches it', async () => {
    axios.post.mockResolvedValueOnce({ data: MOCK_PLAN })

    const store = usePlanStore()
    const result = await store.createPlan({ name: '5K — Beginner', sport: 'Running' })

    expect(result.id).toBe(301)
    expect(store.plans.some(p => p.id === 301)).toBe(true)

    const cached = JSON.parse(localStorage.getItem('runnit_plans_cache'))
    expect(Array.isArray(cached)).toBe(true)
  })

  it('rethrows on API error', async () => {
    axios.post.mockRejectedValueOnce({ response: { data: { error: 'Validation failed' } } })

    const store = usePlanStore()
    await expect(store.createPlan({})).rejects.toBeDefined()
  })
})

describe('Plan Store — fetchPlan (detail cache)', () => {
  it('caches full plan detail by ID', async () => {
    axios.get.mockResolvedValueOnce({ data: MOCK_PLAN })

    const store = usePlanStore()
    const result = await store.fetchPlan(301)

    expect(result.id).toBe(301)

    const cached = JSON.parse(localStorage.getItem('runnit_plan_details_cache'))
    expect(cached[301]).toBeDefined()
    expect(cached[301].id).toBe(301)
  })

  it('serves stale detail cache on network error', async () => {
    localStorage.setItem('runnit_plan_details_cache', JSON.stringify({ 301: MOCK_PLAN }))
    axios.get.mockRejectedValueOnce(new Error('Network'))

    const store = usePlanStore()
    const result = await store.fetchPlan(301)

    expect(result.id).toBe(301)
  })

  it('returns cached detail immediately if available', async () => {
    localStorage.setItem('runnit_plan_details_cache', JSON.stringify({ 301: MOCK_PLAN }))
    // Still fires background fetch — mock resolves
    axios.get.mockResolvedValueOnce({ data: MOCK_PLAN })

    const store = usePlanStore()
    const result = await store.fetchPlan(301)

    expect(result.id).toBe(301)
  })
})

describe('Plan Store — completeWorkout', () => {
  beforeEach(() => {
    // Seed detail cache
    localStorage.setItem('runnit_plan_details_cache', JSON.stringify({ 301: MOCK_PLAN }))
    axios.post.mockResolvedValueOnce({
      data: { ...MOCK_PLAN.weeks[0].workouts[0], completed: true }
    })
  })

  it('marks workout as completed in detail cache', async () => {
    const store = usePlanStore()
    await store.fetchPlan(301)
    await store.completeWorkout(301, 1001)

    const cached = JSON.parse(localStorage.getItem('runnit_plan_details_cache'))
    const workout = cached[301].weeks[0].workouts.find(w => w.id === 1001)
    expect(workout?.completed).toBe(true)
  })
})

describe('Plan Store — uncompleteWorkout', () => {
  beforeEach(() => {
    const planWithCompleted = {
      ...MOCK_PLAN,
      weeks: [{ ...MOCK_PLAN.weeks[0], workouts: [
        { ...MOCK_PLAN.weeks[0].workouts[0], completed: true },
        MOCK_PLAN.weeks[0].workouts[1],
      ]}],
    }
    localStorage.setItem('runnit_plan_details_cache', JSON.stringify({ 301: planWithCompleted }))
    axios.post.mockResolvedValueOnce({
      data: { ...MOCK_PLAN.weeks[0].workouts[0], completed: false }
    })
  })

  it('marks workout as not completed in cache', async () => {
    const store = usePlanStore()
    await store.fetchPlan(301)
    await store.uncompleteWorkout(301, 1001)

    const cached = JSON.parse(localStorage.getItem('runnit_plan_details_cache'))
    const workout = cached[301].weeks[0].workouts.find(w => w.id === 1001)
    expect(workout?.completed).toBe(false)
  })
})

describe('Plan Store — list cache', () => {
  it('initializes plans list from cache', () => {
    localStorage.setItem('runnit_plans_cache', JSON.stringify([{ id: 301, name: '5K — Beginner' }]))

    const store = usePlanStore()
    expect(store.plans).toHaveLength(1)
    expect(store.plans[0].id).toBe(301)
  })

  it('handles corrupted plans cache gracefully', () => {
    localStorage.setItem('runnit_plans_cache', 'NOT_JSON{')

    expect(() => usePlanStore()).not.toThrow()
    const store = usePlanStore()
    expect(store.plans).toEqual([])
  })
})
