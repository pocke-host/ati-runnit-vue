import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export const useGroupEventStore = defineStore('groupEvent', () => {
  const events = ref([])

  async function fetchMyEvents() {
    try {
      const { data } = await axios.get('/api/group-events/my')
      events.value = data
    } catch {
      // non-critical
    }
  }

  async function createEvent(payload) {
    const { data } = await axios.post('/api/group-events', payload)
    await fetchMyEvents()
    return data
  }

  async function rsvp(inviteId, status) {
    const { data } = await axios.patch(`/api/group-events/invites/${inviteId}`, { status })
    await fetchMyEvents()
    return data
  }

  async function deleteEvent(id) {
    await axios.delete(`/api/group-events/${id}`)
    await fetchMyEvents()
  }

  return { events, fetchMyEvents, createEvent, rsvp, deleteEvent }
})
