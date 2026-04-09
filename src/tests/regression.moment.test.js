// src/tests/regression.moment.test.js
// Regression tests for moment capture (photo moments) flow
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useMomentStore } from '@/stores/moment'
import axios from 'axios'

vi.mock('axios')

const MOCK_MOMENT = {
  id: 201,
  caption: 'Great run today!',
  photoUrl: 'https://cdn.runnit.app/moments/201.jpg',
  createdAt: '2026-04-08T11:00:00Z',
  user: { id: 1, displayName: 'Quinn Test' },
  reactions: [],
  commentCount: 0,
}

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
  vi.clearAllMocks()
})

afterEach(() => {
  localStorage.clear()
})

describe('Moment Store — createMoment', () => {
  it('prepends moment to feed and writes to cache', async () => {
    axios.post.mockResolvedValueOnce({ data: MOCK_MOMENT })

    const store = useMomentStore()
    const result = await store.createMoment({
      caption: 'Great run today!',
      photoUrl: 'https://cdn.runnit.app/moments/201.jpg',
    })

    expect(result.id).toBe(201)
    expect(store.feed[0].id).toBe(201)

    const cached = JSON.parse(localStorage.getItem('runnit_moments_feed_cache'))
    expect(cached[0].id).toBe(201)
  })

  it('rethrows and sets error on failure', async () => {
    axios.post.mockRejectedValueOnce({ response: { data: { error: 'Upload failed' } } })

    const store = useMomentStore()
    await expect(store.createMoment({ caption: 'test' })).rejects.toBeDefined()
    expect(store.error).toBe('Upload failed')
  })

  it('clears loading flag after success', async () => {
    axios.post.mockResolvedValueOnce({ data: MOCK_MOMENT })

    const store = useMomentStore()
    await store.createMoment({ caption: 'test' })
    expect(store.loading).toBe(false)
  })

  it('clears loading flag after failure', async () => {
    axios.post.mockRejectedValueOnce(new Error('Network'))

    const store = useMomentStore()
    try { await store.createMoment({}) } catch { /* expected */ }
    expect(store.loading).toBe(false)
  })
})

describe('Moment Store — fetchFeed', () => {
  it('fetches feed and caches it', async () => {
    axios.get.mockResolvedValueOnce({ data: { content: [MOCK_MOMENT], totalPages: 1 } })

    const store = useMomentStore()
    await store.fetchFeed()

    expect(store.feed).toHaveLength(1)
    expect(store.feed[0].id).toBe(201)

    const cached = JSON.parse(localStorage.getItem('runnit_moments_feed_cache'))
    expect(cached[0].id).toBe(201)
  })

  it('handles plain array response (no pagination wrapper)', async () => {
    axios.get.mockResolvedValueOnce({ data: [MOCK_MOMENT] })

    const store = useMomentStore()
    await store.fetchFeed()

    expect(store.feed).toHaveLength(1)
  })
})

describe('Moment Store — reactions', () => {
  it('addReaction sets currentUserReaction and increments reactionCount in feed', async () => {
    axios.post.mockResolvedValueOnce({ data: {} })
    localStorage.setItem('runnit_moments_feed_cache', JSON.stringify([{ ...MOCK_MOMENT, reactionCount: 0, currentUserReaction: null }]))

    const store = useMomentStore()
    await store.addReaction(201, 'LIKE')

    const updated = store.feed.find(m => m.id === 201)
    expect(updated?.currentUserReaction).toBe('LIKE')
    expect(updated?.reactionCount).toBe(1)

    // Verify cache written
    const cached = JSON.parse(localStorage.getItem('runnit_moments_feed_cache'))
    expect(cached.find(m => m.id === 201)?.currentUserReaction).toBe('LIKE')
  })

  it('removeReaction clears currentUserReaction and decrements reactionCount', async () => {
    axios.delete.mockResolvedValueOnce({ data: {} })
    localStorage.setItem('runnit_moments_feed_cache', JSON.stringify([{ ...MOCK_MOMENT, reactionCount: 1, currentUserReaction: 'LIKE' }]))

    const store = useMomentStore()
    await store.removeReaction(201)

    const updated = store.feed.find(m => m.id === 201)
    expect(updated?.currentUserReaction).toBeNull()
    expect(updated?.reactionCount).toBe(0)

    // Verify cache written
    const cached = JSON.parse(localStorage.getItem('runnit_moments_feed_cache'))
    expect(cached.find(m => m.id === 201)?.currentUserReaction).toBeNull()
  })
})

describe('Moment Store — cache initialization', () => {
  it('restores feed from cache on init', () => {
    localStorage.setItem('runnit_moments_feed_cache', JSON.stringify([MOCK_MOMENT]))

    const store = useMomentStore()
    expect(store.feed).toHaveLength(1)
    expect(store.feed[0].id).toBe(201)
  })

  it('handles corrupted feed cache gracefully', () => {
    localStorage.setItem('runnit_moments_feed_cache', '{{INVALID')

    expect(() => useMomentStore()).not.toThrow()
    const store = useMomentStore()
    expect(store.feed).toEqual([])
  })
})
