<template>
  <main class="race-detail-page">
    <div v-if="race" class="container-xxl">
      <button class="btn-back" @click="$router.back()"><i class="bi bi-arrow-left"></i></button>

      <!-- Hero -->
      <div class="race-hero">
        <div class="race-type-badge">{{ race.type }}</div>
        <h1>{{ race.name }}</h1>
        <div class="race-meta-row">
          <span><i class="bi bi-calendar3"></i> {{ race.date }}</span>
          <span><i class="bi bi-geo-alt-fill"></i> {{ race.location }}</span>
          <span><i class="bi bi-people-fill"></i> {{ race.participants?.toLocaleString() }} registered</span>
        </div>
      </div>

      <div class="race-layout">
        <!-- Left -->
        <div class="race-main">
          <div class="section-card">
            <h2>About This Race</h2>
            <p>{{ race.description }}</p>
          </div>

          <div class="section-card">
            <h2>Distances</h2>
            <div class="distances-list">
              <div v-for="d in race.distances" :key="d.name" class="distance-item">
                <div class="distance-name">{{ d.name }}</div>
                <div class="distance-meta">
                  <span><i class="bi bi-trophy-fill"></i> Prize: {{ d.prize }}</span>
                  <span><i class="bi bi-people-fill"></i> {{ d.spots }} spots</span>
                </div>
                <div :class="['distance-status', d.status]">{{ d.status === 'open' ? 'Registration Open' : d.status === 'full' ? 'Sold Out' : 'Coming Soon' }}</div>
              </div>
            </div>
          </div>

          <div class="section-card">
            <h2><i class="bi bi-map-fill"></i> Course Map</h2>
            <div class="course-map-placeholder">
              <i class="bi bi-geo-alt-fill"></i>
              <span>Course map will display here</span>
            </div>
          </div>

          <div class="section-card">
            <h2>Key Dates</h2>
            <div class="timeline">
              <div v-for="event in race.timeline" :key="event.label" class="timeline-item">
                <div class="timeline-dot" :class="{ past: event.past }"></div>
                <div class="timeline-content">
                  <div class="timeline-label">{{ event.label }}</div>
                  <div class="timeline-date">{{ event.date }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="race-sidebar">
          <div class="register-card">
            <div class="reg-price">
              From <span>{{ race.entryFee }}</span>
            </div>
            <div class="spots-bar">
              <div class="spots-fill" :style="{ width: `${race.fillPercent}%` }"></div>
            </div>
            <p class="spots-text">{{ 100 - race.fillPercent }}% spots remaining</p>
            <a :href="race.registrationUrl" target="_blank" rel="noopener" class="btn btn-primary btn-full">
              Register Now <i class="bi bi-box-arrow-up-right"></i>
            </a>
            <p class="external-note">Registration handled by {{ race.organizer }}</p>
          </div>

          <div class="org-card">
            <h3>Organizer</h3>
            <div class="org-row">
              <div class="org-avatar">{{ race.organizer[0] }}</div>
              <div>
                <div class="org-name">{{ race.organizer }}</div>
                <div class="org-events">{{ race.pastEvents }} events hosted</div>
              </div>
            </div>
            <div class="org-actions">
              <a :href="`mailto:${race.contactEmail}`" class="btn btn-outline-dark btn-sm">Contact Organizer</a>
            </div>
          </div>

          <div class="weather-card">
            <h3><i class="bi bi-cloud-sun-fill"></i> Race Day Forecast</h3>
            <p class="weather-note">Forecast available 7 days before race day</p>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="loading-page"><div class="spinner-border text-success"></div></div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const race = ref(null)

onMounted(async () => {
  race.value = {
    id: route.params.id,
    name: 'Brooklyn Half Marathon 2025',
    type: 'Half Marathon',
    date: 'Saturday, May 17, 2025',
    location: 'Prospect Park, Brooklyn, NY',
    participants: 12400,
    entryFee: '$65',
    fillPercent: 73,
    organizer: 'NYRR',
    pastEvents: 48,
    contactEmail: 'info@nyrr.org',
    registrationUrl: 'https://www.nyrr.org',
    description: 'One of New York\'s most iconic half marathons, starting in Prospect Park and finishing along the Brooklyn waterfront with stunning views of lower Manhattan. A fast, scenic course beloved by runners of all levels.',
    distances: [
      { name: 'Half Marathon (21.1km)', prize: '$1,000', spots: 1200, status: 'open' },
      { name: '5K Fun Run', prize: 'Finisher Medal', spots: 400, status: 'open' },
    ],
    timeline: [
      { label: 'Registration Opens', date: 'Jan 15, 2025', past: true },
      { label: 'Early Bird Deadline', date: 'Feb 28, 2025', past: true },
      { label: 'Regular Registration Closes', date: 'May 10, 2025', past: false },
      { label: 'Packet Pickup', date: 'May 15–16, 2025', past: false },
      { label: 'Race Day', date: 'May 17, 2025', past: false },
    ]
  }
})
</script>

<style scoped>
.race-detail-page { background: #F5F6F3; min-height: 100vh; padding: 100px 0 64px; }
.btn-back { width: 40px; height: 40px; border-radius: 50%; background: white; border: 1px solid rgba(15,18,16,.14); display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 1.1rem; margin-bottom: 20px; }

.race-hero { margin-bottom: 28px; }
.race-type-badge { display: inline-block; padding: 4px 12px; border-radius: 999px; background: rgba(196,106,42,.12); color: #C46A2A; font-weight: 800; font-size: .8rem; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 10px; }
.race-hero h1 { font-weight: 900; font-size: 2.2rem; margin-bottom: 12px; }
.race-meta-row { display: flex; flex-wrap: wrap; gap: 16px; font-size: .875rem; font-weight: 600; color: #6b7280; }
.race-meta-row i { color: #C46A2A; margin-right: 4px; }

.race-layout { display: grid; grid-template-columns: 1fr 320px; gap: 24px; }
.section-card { background: white; border-radius: 20px; border: 1px solid rgba(15,18,16,.08); padding: 24px; margin-bottom: 20px; }
.section-card h2 { font-weight: 900; font-size: 1.1rem; margin-bottom: 14px; }
.section-card p { color: #4b5563; line-height: 1.6; }

.distances-list { display: flex; flex-direction: column; gap: 12px; }
.distance-item { border: 1px solid rgba(15,18,16,.08); border-radius: 14px; padding: 14px 16px; }
.distance-name { font-weight: 800; font-size: .95rem; margin-bottom: 6px; }
.distance-meta { display: flex; gap: 14px; font-size: .8rem; color: #6b7280; font-weight: 600; margin-bottom: 8px; }
.distance-meta i { color: #C46A2A; margin-right: 3px; }
.distance-status { font-size: .75rem; font-weight: 800; padding: 3px 10px; border-radius: 999px; display: inline-block; }
.distance-status.open { background: rgba(16,185,129,.1); color: #047857; }
.distance-status.full { background: rgba(239,68,68,.1); color: #b91c1c; }

.course-map-placeholder { height: 200px; background: rgba(15,18,16,.04); border-radius: 14px; border: 1px dashed rgba(15,18,16,.14); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; color: #d1d5db; font-size: 2rem; }
.course-map-placeholder span { font-size: .875rem; font-weight: 600; }

.timeline { display: flex; flex-direction: column; gap: 0; }
.timeline-item { display: flex; gap: 14px; padding-bottom: 16px; position: relative; }
.timeline-item::before { content: ''; position: absolute; left: 7px; top: 16px; bottom: 0; width: 2px; background: rgba(15,18,16,.08); }
.timeline-item:last-child::before { display: none; }
.timeline-dot { width: 16px; height: 16px; border-radius: 50%; background: rgba(15,18,16,.15); border: 2px solid white; flex-shrink: 0; margin-top: 2px; }
.timeline-dot.past { background: #10b981; }
.timeline-label { font-weight: 800; font-size: .9rem; }
.timeline-date { font-size: .82rem; color: #6b7280; }

.register-card, .org-card, .weather-card { background: white; border-radius: 20px; border: 1px solid rgba(15,18,16,.08); padding: 22px; margin-bottom: 16px; }
.reg-price { font-size: 1rem; color: #6b7280; margin-bottom: 14px; }
.reg-price span { font-size: 1.8rem; font-weight: 900; color: #C46A2A; }
.spots-bar { height: 6px; background: rgba(15,18,16,.08); border-radius: 999px; margin-bottom: 6px; overflow: hidden; }
.spots-fill { height: 100%; background: linear-gradient(90deg, #10b981, #f59e0b); border-radius: 999px; }
.spots-text { font-size: .8rem; color: #6b7280; margin-bottom: 16px; }
.external-note { font-size: .75rem; color: #9ca3af; text-align: center; margin-top: 10px; }

.org-card h3, .weather-card h3 { font-weight: 900; font-size: .95rem; margin-bottom: 14px; }
.org-row { display: flex; gap: 12px; align-items: center; margin-bottom: 14px; }
.org-avatar { width: 44px; height: 44px; border-radius: 50%; background: #5A6B4E; color: white; font-size: 1.1rem; font-weight: 900; display: flex; align-items: center; justify-content: center; }
.org-name { font-weight: 800; font-size: .95rem; }
.org-events { font-size: .8rem; color: #6b7280; }
.weather-note { font-size: .82rem; color: #9ca3af; }

.btn { border-radius: 12px; font-weight: 800; padding: 12px 18px; cursor: pointer; border: none; font-size: .9rem; display: inline-flex; align-items: center; justify-content: center; gap: 6px; text-decoration: none; transition: all .2s; }
.btn-primary { background: #C46A2A; color: white; }
.btn-primary:hover { background: #a85722; }
.btn-outline-dark { background: white; border: 1px solid rgba(15,18,16,.2); color: #374151; }
.btn-sm { padding: 8px 14px; font-size: .82rem; }
.btn-full { width: 100%; }

.loading-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; }

@media (max-width: 900px) { .race-layout { grid-template-columns: 1fr; } }
</style>
