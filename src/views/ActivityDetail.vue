<template>
  <main class="activity-detail-page">
    <div v-if="activity" class="container-xxl">
      <div class="page-header">
        <button class="btn-back" @click="$router.back()"><i class="bi bi-arrow-left"></i></button>
        <div>
          <h1>{{ activity.name }}</h1>
          <p class="activity-date"><i class="bi bi-calendar3"></i> {{ activity.date }} · <i class="bi bi-geo-alt"></i> {{ activity.location }}</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-outline-dark btn-sm"><i class="bi bi-share"></i> Share</button>
          <router-link to="/create-moment" class="btn btn-primary btn-sm"><i class="bi bi-camera-fill"></i> Capture Moment</router-link>
        </div>
      </div>

      <!-- Stats Strip -->
      <div class="stats-strip">
        <div class="stat-box">
          <div class="stat-value">{{ activity.distance }}</div>
          <div class="stat-label">Distance (km)</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">{{ activity.duration }}</div>
          <div class="stat-label">Moving Time</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">{{ activity.avgPace }}</div>
          <div class="stat-label">Avg Pace</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">{{ activity.elevation }}</div>
          <div class="stat-label">Elevation (m)</div>
        </div>
        <div class="stat-box" v-if="activity.avgHR">
          <div class="stat-value">{{ activity.avgHR }}</div>
          <div class="stat-label">Avg HR (bpm)</div>
        </div>
        <div class="stat-box" v-if="activity.calories">
          <div class="stat-value">{{ activity.calories }}</div>
          <div class="stat-label">Calories</div>
        </div>
      </div>

      <!-- Map -->
      <div class="map-card">
        <div ref="mapContainer" class="route-map"></div>
      </div>

      <!-- Charts -->
      <div class="charts-row">
        <div class="chart-card">
          <h3>Pace over Distance</h3>
          <div class="chart-placeholder"><i class="bi bi-graph-up"></i><span>Pace chart</span></div>
        </div>
        <div class="chart-card">
          <h3>Elevation Profile</h3>
          <div class="chart-placeholder"><i class="bi bi-bar-chart-line-fill"></i><span>Elevation chart</span></div>
        </div>
      </div>

      <!-- Splits -->
      <div class="splits-card">
        <h3>Km Splits</h3>
        <div class="splits-table">
          <div class="splits-header">
            <span>KM</span><span>Pace</span><span>HR</span><span>Elev.</span>
          </div>
          <div v-for="split in activity.splits" :key="split.km" class="split-row">
            <span class="split-km">{{ split.km }}</span>
            <span :class="['split-pace', paceClass(split.pace)]">{{ split.pace }}</span>
            <span>{{ split.hr || '—' }}</span>
            <span>{{ split.elev > 0 ? `+${split.elev}` : split.elev }}m</span>
          </div>
        </div>
      </div>

      <!-- Kudos / Comments -->
      <div class="social-card">
        <div class="kudos-row">
          <button class="kudos-btn" @click="toggleKudo">
            <i :class="`bi bi-hand-thumbs-up${kudoed ? '-fill' : ''}`"></i>
            {{ kudoed ? 'Kudos!' : 'Give Kudos' }}
            <span class="kudos-count">{{ kudosCount }}</span>
          </button>
          <button class="comment-btn" @click="focusComment">
            <i class="bi bi-chat"></i> Comment
          </span></button>
        </div>

        <div class="comments-list">
          <div v-for="comment in activity.comments" :key="comment.id" class="comment-item">
            <div class="comment-avatar">{{ comment.author[0] }}</div>
            <div class="comment-body">
              <span class="comment-author">{{ comment.author }}</span>
              <p>{{ comment.text }}</p>
            </div>
          </div>
        </div>

        <div class="comment-input-row">
          <input ref="commentInput" v-model="newComment" placeholder="Add a comment…" class="comment-input" @keydown.enter="postComment" />
          <button class="btn-send" @click="postComment"><i class="bi bi-send-fill"></i></button>
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
const mapContainer = ref(null)
const kudoed = ref(false)
const kudosCount = ref(14)
const newComment = ref('')
const commentInput = ref(null)
const activity = ref(null)

const paceClass = (pace) => {
  const [min] = pace.split(':').map(Number)
  if (min < 5) return 'pace-fast'
  if (min < 6) return 'pace-med'
  return 'pace-slow'
}

const toggleKudo = () => {
  kudoed.value = !kudoed.value
  kudosCount.value += kudoed.value ? 1 : -1
}

const focusComment = () => { commentInput.value?.focus() }

const postComment = () => {
  if (!newComment.value.trim()) return
  activity.value.comments.push({ id: Date.now(), author: 'You', text: newComment.value.trim() })
  newComment.value = ''
}

onMounted(async () => {
  activity.value = {
    id: route.params.id,
    name: 'Sunday Long Run',
    date: 'Sunday, Feb 23 2025',
    location: 'Prospect Park, Brooklyn',
    sport: 'running',
    distance: '22.1',
    duration: '1:59:04',
    avgPace: '5:22',
    elevation: '184',
    avgHR: '152',
    calories: '1,340',
    splits: [
      { km: 1, pace: '5:44', hr: 142, elev: 8 },
      { km: 2, pace: '5:38', hr: 148, elev: -4 },
      { km: 3, pace: '5:30', hr: 150, elev: 12 },
      { km: 4, pace: '5:25', hr: 153, elev: 2 },
      { km: 5, pace: '5:20', hr: 155, elev: -6 },
      { km: 6, pace: '5:18', hr: 156, elev: 15 },
      { km: 7, pace: '5:15', hr: 157, elev: -8 },
      { km: 8, pace: '5:12', hr: 158, elev: 4 },
    ],
    comments: [
      { id: 1, author: 'Marcus T.', text: 'Incredible effort! That negative split is fire 🔥' },
      { id: 2, author: 'Coach Yuki', text: 'Great pacing strategy. You ran the plan perfectly!' },
    ]
  }
})
</script>

<style scoped>
.activity-detail-page { background: #F5F6F3; min-height: 100vh; padding: 100px 0 64px; }

.page-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
.btn-back { width: 40px; height: 40px; border-radius: 50%; background: white; border: 1px solid rgba(15,18,16,.14); display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 1.1rem; flex-shrink: 0; }
.page-header h1 { font-weight: 900; font-size: 1.6rem; margin: 0 0 4px; }
.activity-date { font-size: .85rem; color: #6b7280; margin: 0; }
.header-actions { margin-left: auto; display: flex; gap: 8px; }

.stats-strip { display: flex; overflow-x: auto; gap: 0; background: white; border-radius: 16px; border: 1px solid rgba(15,18,16,.08); margin-bottom: 20px; }
.stat-box { flex: 1; min-width: 100px; text-align: center; padding: 20px 12px; border-right: 1px solid rgba(15,18,16,.06); }
.stat-box:last-child { border-right: none; }
.stat-value { font-weight: 900; font-size: 1.4rem; color: #0F1210; }
.stat-label { font-size: .72rem; color: #9ca3af; font-weight: 600; text-transform: uppercase; letter-spacing: .04em; margin-top: 2px; }

.map-card { background: white; border-radius: 20px; border: 1px solid rgba(15,18,16,.08); overflow: hidden; margin-bottom: 20px; }
.route-map { height: 360px; background: linear-gradient(135deg, rgba(90,107,78,.08), rgba(15,18,16,.04)); display: flex; align-items: center; justify-content: center; color: #d1d5db; font-size: 3rem; }

.charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
.chart-card { background: white; border-radius: 16px; border: 1px solid rgba(15,18,16,.08); padding: 20px; }
.chart-card h3 { font-weight: 800; font-size: .95rem; margin-bottom: 12px; }
.chart-placeholder { height: 120px; background: rgba(15,18,16,.03); border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; color: #d1d5db; font-size: 1.8rem; }
.chart-placeholder span { font-size: .8rem; font-weight: 600; color: #d1d5db; }

.splits-card { background: white; border-radius: 16px; border: 1px solid rgba(15,18,16,.08); padding: 20px; margin-bottom: 20px; }
.splits-card h3 { font-weight: 800; font-size: .95rem; margin-bottom: 16px; }
.splits-table { width: 100%; }
.splits-header { display: grid; grid-template-columns: 60px 1fr 1fr 1fr; gap: 8px; font-size: .75rem; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: .06em; padding-bottom: 8px; border-bottom: 1px solid rgba(15,18,16,.08); margin-bottom: 8px; }
.split-row { display: grid; grid-template-columns: 60px 1fr 1fr 1fr; gap: 8px; padding: 8px 0; border-bottom: 1px solid rgba(15,18,16,.04); font-size: .875rem; }
.split-km { font-weight: 800; color: #6b7280; }
.split-pace { font-weight: 800; }
.pace-fast { color: #10b981; }
.pace-med { color: #f59e0b; }
.pace-slow { color: #6b7280; }

.social-card { background: white; border-radius: 16px; border: 1px solid rgba(15,18,16,.08); padding: 20px; }
.kudos-row { display: flex; gap: 10px; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid rgba(15,18,16,.06); }
.kudos-btn, .comment-btn { padding: 10px 16px; border-radius: 12px; border: 1px solid rgba(15,18,16,.14); background: white; font-weight: 700; font-size: .875rem; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all .2s; }
.kudos-btn:hover, .comment-btn:hover { background: #f9fafb; }
.kudos-count { background: rgba(15,18,16,.08); border-radius: 999px; padding: 2px 8px; font-size: .75rem; }
.comments-list { margin-bottom: 16px; }
.comment-item { display: flex; gap: 10px; margin-bottom: 12px; }
.comment-avatar { width: 32px; height: 32px; border-radius: 50%; background: #5A6B4E; color: white; font-size: .8rem; font-weight: 900; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.comment-author { font-weight: 800; font-size: .85rem; margin-right: 6px; }
.comment-body p { font-size: .875rem; color: #374151; margin: 4px 0 0; }
.comment-input-row { display: flex; gap: 8px; }
.comment-input { flex: 1; border: 1px solid rgba(15,18,16,.14); border-radius: 12px; padding: 10px 14px; font-size: .875rem; outline: none; }
.comment-input:focus { border-color: #5A6B4E; }
.btn-send { width: 40px; height: 40px; border-radius: 12px; background: #5A6B4E; color: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; }

.btn { border-radius: 10px; font-weight: 800; padding: 8px 14px; cursor: pointer; border: none; font-size: .82rem; display: inline-flex; align-items: center; gap: 6px; text-decoration: none; transition: all .2s; }
.btn-primary { background: #C46A2A; color: white; }
.btn-outline-dark { background: white; border: 1px solid rgba(15,18,16,.2); color: #374151; }
.btn-sm { padding: 7px 12px; }

.loading-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; }

@media (max-width: 600px) {
  .charts-row { grid-template-columns: 1fr; }
  .page-header { flex-direction: column; align-items: flex-start; }
  .header-actions { margin-left: 0; }
}
</style>
