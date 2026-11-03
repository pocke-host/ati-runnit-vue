/** Shared client-side rules for athlete data. */
export const activityTimestamp = (activity) => activity?.performedAt || activity?.createdAt || null

export const activitySourceKey = (activity) => {
  const source = activity?.source || activity?.provider || 'RUNNIT'
  const externalId = activity?.externalId || activity?.providerActivityId
  return externalId ? `${source}:${externalId}` : `runnit:${activity?.id}`
}

export const dedupeActivities = (activities = []) => {
  const seen = new Set()
  return activities.filter((activity) => {
    if (!activity || activity.canonicalActivityId != null) return false
    const key = activitySourceKey(activity)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export const localTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
