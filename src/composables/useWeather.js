import { ref } from 'vue'

// Module-level cache keyed by "lat,lng"
const cache = {}
export const weatherLoading = ref(false)

// WMO weather code helpers
function wmoIcon(code) {
  if (code >= 95 && code <= 99) return '⛈️'
  if (code >= 71 && code <= 77) return '❄️'
  if (code >= 61 && code <= 67) return '🌧️'
  if (code >= 51 && code <= 57) return '🌦️'
  if (code >= 45 && code <= 48) return '🌫️'
  if (code >= 80 && code <= 82) return '🌦️'
  return null
}

function wmoLabel(code) {
  if (code >= 95 && code <= 99) return 'Thunderstorm'
  if (code >= 71 && code <= 77) return 'Snow'
  if (code >= 61 && code <= 67) return 'Rain'
  if (code >= 51 && code <= 57) return 'Drizzle'
  if (code >= 80 && code <= 82) return 'Showers'
  if (code >= 45 && code <= 48) return 'Fog'
  return null
}

export async function initWeather(lat, lng) {
  const key = `${lat.toFixed(4)},${lng.toFixed(4)}`
  if (cache[key]) return

  weatherLoading.value = true
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${lat}&longitude=${lng}` +
      `&daily=precipitation_probability_max,windspeed_10m_max,weathercode` +
      `&timezone=auto&forecast_days=14`

    const res = await fetch(url)
    if (!res.ok) throw new Error('Weather fetch failed')
    const data = await res.json()

    const byDate = {}
    const dates = data.daily?.time || []
    dates.forEach((date, i) => {
      const rain = data.daily.precipitation_probability_max[i] ?? 0
      const wind = data.daily.windspeed_10m_max[i] ?? 0
      const code = data.daily.weathercode[i] ?? 0

      const severe = (code >= 95 && code <= 99) || (code >= 71 && code <= 77)
      const codeIcon = wmoIcon(code)
      const hasRainWarn = rain >= 60
      const hasWindWarn = wind >= 40

      // Only store if something noteworthy
      if (severe || hasRainWarn || hasWindWarn || codeIcon) {
        let icon = codeIcon
        let label = wmoLabel(code)
        if (!icon && hasRainWarn) { icon = '🌧️'; label = `${rain}% rain` }
        if (!icon && hasWindWarn) { icon = '💨'; label = `${Math.round(wind)} kph wind` }

        const parts = []
        if (label) parts.push(label)
        if (hasRainWarn && !wmoLabel(code)) parts.push(`${rain}% rain`)
        if (hasWindWarn) parts.push(`${Math.round(wind)} kph wind`)

        byDate[date] = { icon, label: parts.join(' · '), rain, wind, code, severe }
      }
    })

    cache[key] = byDate
  } catch (e) {
    console.warn('[useWeather] fetch error:', e)
    cache[key] = {} // mark as attempted so we don't retry
  } finally {
    weatherLoading.value = false
  }
}

export function getWeatherForDate(dateStr) {
  for (const key in cache) {
    const entry = cache[key][dateStr]
    if (entry) return entry
  }
  return null
}
