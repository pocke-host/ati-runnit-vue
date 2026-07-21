import { ref } from 'vue'

const GCAL_TOKEN_KEY = 'gcal_token'
const GCAL_CONNECTED_KEY = 'gcal_connected'
const GCAL_LAST_SYNC_KEY = 'gcal_last_sync'
const GCAL_SCOPE = 'https://www.googleapis.com/auth/calendar.events'
const SPORT_COLOR = { Run: '9', Ride: '10', Swim: '1', Hike: '6', Walk: '5', Strength: '3' }

let tokenClient = null
let resolveToken = null
let rejectToken = null

function loadGISScript() {
  if (document.getElementById('gis-script')) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.id = 'gis-script'
    s.src = 'https://accounts.google.com/gsi/client'
    s.async = true
    s.defer = true
    s.onload = resolve
    s.onerror = () => reject(new Error('Failed to load Google Identity Services'))
    document.head.appendChild(s)
  })
}

export function useGoogleCalendar() {
  const connected = ref(localStorage.getItem(GCAL_CONNECTED_KEY) === 'true')
  const syncing = ref(false)
  const error = ref(null)
  const lastSync = ref(localStorage.getItem(GCAL_LAST_SYNC_KEY) || null)
  const importedEvents = ref([])
  const hasLoadedEvents = ref(false)

  async function connect() {
    error.value = null
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (!clientId) {
      error.value = 'Google Calendar is not configured. Add VITE_GOOGLE_CLIENT_ID to your .env file.'
      return
    }

    try {
      await loadGISScript()

      await new Promise((resolve, reject) => {
        resolveToken = resolve
        rejectToken = reject

        tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: GCAL_SCOPE,
          callback: (response) => {
            if (response.error) {
              rejectToken(new Error(response.error_description || response.error))
              return
            }
            localStorage.setItem(GCAL_TOKEN_KEY, response.access_token)
            localStorage.setItem(GCAL_CONNECTED_KEY, 'true')
            connected.value = true
            resolveToken()
          },
        })

        tokenClient.requestAccessToken({ prompt: 'consent' })
      })
    } catch (err) {
      error.value = err.message || 'Failed to connect Google Calendar'
    }
  }

  async function disconnect() {
    error.value = null
    const token = localStorage.getItem(GCAL_TOKEN_KEY)
    if (token && window.google?.accounts?.oauth2) {
      window.google.accounts.oauth2.revoke(token)
    }
    localStorage.removeItem(GCAL_TOKEN_KEY)
    localStorage.removeItem(GCAL_CONNECTED_KEY)
    localStorage.removeItem(GCAL_LAST_SYNC_KEY)
    connected.value = false
    lastSync.value = null
  }

  function buildEventBody(workout) {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone

    // Build start datetime — workout.date is YYYY-MM-DD, workout.startTime is HH:MM (optional)
    const startTime = workout.startTime || '07:00'
    const startISO = `${workout.date}T${startTime}:00`
    const startDate = new Date(startISO)
    const endDate = new Date(startDate.getTime() + (workout.durationMinutes || 60) * 60000)

    const toLocalISO = (d) => {
      const pad = (n) => String(n).padStart(2, '0')
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`
    }

    return {
      summary: workout.title || 'Runnit Workout',
      description: workout.description || '',
      colorId: SPORT_COLOR[workout.sport] || '9',
      start: { dateTime: toLocalISO(startDate), timeZone: tz },
      end: { dateTime: toLocalISO(endDate), timeZone: tz },
    }
  }

  async function gcalFetch(url, options) {
    const token = localStorage.getItem(GCAL_TOKEN_KEY)
    if (!token) throw new Error('Not connected to Google Calendar')

    const res = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(options?.body ? { 'Content-Type': 'application/json' } : {}),
        ...options?.headers,
      },
    })

    if (!res.ok) {
      // Token may have expired — clear it so the user reconnects
      if (res.status === 401) {
        localStorage.removeItem(GCAL_TOKEN_KEY)
        localStorage.removeItem(GCAL_CONNECTED_KEY)
        connected.value = false
      }
      const body = await res.json().catch(() => ({}))
      throw new Error(body?.error?.message || `Google Calendar error: ${res.status}`)
    }

    return res.status === 204 ? null : res.json()
  }

  async function pushEvent(workout) {
    return gcalFetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      body: JSON.stringify(buildEventBody(workout)),
    })
  }

  async function updateEvent(googleEventId, workout) {
    return gcalFetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${googleEventId}`,
      { method: 'PATCH', body: JSON.stringify(buildEventBody(workout)) }
    )
  }

  async function deleteEvent(googleEventId) {
    try {
      await gcalFetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${googleEventId}`,
        { method: 'DELETE' }
      )
    } catch (err) {
      // Google returns 410 Gone if the event was already removed on their side — treat as success
      if (!String(err.message).includes('410')) throw err
    }
  }

  async function syncAll(workouts) {
    syncing.value = true
    error.value = null
    const results = []
    try {
      const upcoming = workouts.filter((w) => w.date >= new Date().toISOString().slice(0, 10))
      for (const w of upcoming) {
        // Already synced (e.g. by real-time sync) — update in place instead of creating a duplicate
        if (w.googleEventId) {
          await updateEvent(w.googleEventId, w)
          results.push({ id: w.id, googleEventId: w.googleEventId })
        } else {
          const created = await pushEvent(w)
          results.push({ id: w.id, googleEventId: created.id })
        }
      }
      lastSync.value = new Date().toISOString()
      localStorage.setItem(GCAL_LAST_SYNC_KEY, lastSync.value)
    } catch (err) {
      error.value = err.message || 'Sync failed'
    } finally {
      syncing.value = false
    }
    return results
  }

  async function listEvents({ timeMin, timeMax } = {}) {
    const token = localStorage.getItem(GCAL_TOKEN_KEY)
    if (!token) throw new Error('Not connected to Google Calendar')

    const params = new URLSearchParams({
      timeMin: timeMin || new Date().toISOString(),
      timeMax: timeMax || new Date(Date.now() + 30 * 86400000).toISOString(),
      singleEvents: 'true',
      orderBy: 'startTime',
      maxResults: '100',
    })

    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )

    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem(GCAL_TOKEN_KEY)
        localStorage.removeItem(GCAL_CONNECTED_KEY)
        connected.value = false
      }
      const body = await res.json().catch(() => ({}))
      throw new Error(body?.error?.message || `Google Calendar error: ${res.status}`)
    }

    const data = await res.json()
    return data.items || []
  }

  async function readAll(range) {
    syncing.value = true
    error.value = null
    try {
      importedEvents.value = await listEvents(range)
      hasLoadedEvents.value = true
    } catch (err) {
      error.value = err.message || 'Failed to load Google Calendar events'
    } finally {
      syncing.value = false
    }
  }

  return {
    connected, syncing, error, lastSync, importedEvents, hasLoadedEvents,
    connect, disconnect, pushEvent, updateEvent, deleteEvent, syncAll, listEvents, readAll,
  }
}
