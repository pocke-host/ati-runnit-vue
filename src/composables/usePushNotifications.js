// src/composables/usePushNotifications.js
// Handles APNs/FCM token registration, permission request, and notification
// tap routing. Safe no-op on web — only activates on native platforms.

import { Capacitor } from '@capacitor/core'
import { PushNotifications } from '@capacitor/push-notifications'
import { useRouter } from 'vue-router'
import { useToast } from '@/composables/useToast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

// Map notification type → Vue Router path
function resolveRoute(notification) {
  const data = notification.data || {}
  const type = data.type || ''

  if (type === 'NEW_FOLLOWER' && data.actorId)    return `/profile/${data.actorId}`
  if (type === 'REACTION'     && data.activityId) return `/activities/${data.activityId}`
  if (type === 'COMMENT'      && data.activityId) return `/activities/${data.activityId}`
  if (type === 'ACHIEVEMENT')                     return '/achievements'
  if (type === 'CHALLENGE')                       return '/challenges'
  if (type === 'PLAN_ASSIGNED')                   return '/plans'
  if (type === 'WORKOUT_REMINDER')                return '/plans'
  if (type === 'PERSONAL_RECORD')                 return '/stats'
  if (type === 'CLUB_INVITE')                     return '/clubs'
  // Generic fallback — go to feed
  return '/feed'
}

async function registerTokenWithBackend(token) {
  const jwt = localStorage.getItem('token')
  if (!jwt) return
  try {
    await fetch(`${API_URL}/users/me/push-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({ token, platform: Capacitor.getPlatform() }),
    })
  } catch {
    // Non-fatal — token will be re-sent on next launch
  }
}

export function usePushNotifications() {
  const router = useRouter()
  const { showToast } = useToast()

  async function init() {
    if (!Capacitor.isNativePlatform()) return

    // 1. Request permission
    let permStatus = await PushNotifications.checkPermissions()
    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions()
    }
    if (permStatus.receive !== 'granted') return

    // 2. Register with APNs / FCM
    await PushNotifications.register()

    // 3. Send token to backend when we get it
    PushNotifications.addListener('registration', ({ value: token }) => {
      registerTokenWithBackend(token)
    })

    PushNotifications.addListener('registrationError', () => {
      // Silent — push notifications just won't work, app still runs fine
    })

    // 4. Foreground notification — show in-app toast (iOS suppresses the banner)
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      const title = notification.title || 'Runnit'
      const body  = notification.body  || ''
      showToast(`${title}${body ? ' — ' + body : ''}`, 'info', 5000)
    })

    // 5. Notification tap — navigate to the right screen
    PushNotifications.addListener('pushNotificationActionPerformed', ({ notification }) => {
      const route = resolveRoute(notification)
      router.push(route)
    })
  }

  async function cleanup() {
    if (!Capacitor.isNativePlatform()) return
    await PushNotifications.removeAllListeners()
  }

  return { init, cleanup }
}
