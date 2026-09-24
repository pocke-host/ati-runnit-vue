<template>
  <main class="discovery-page">
    <div class="discovery-wrap">
      <header class="discovery-header">
        <div><p class="discovery-kicker">Find your next move</p><h1>Discover</h1><p>People, training, and places to go further together.</p></div>
      </header>
      <div class="discovery-search">
        <i class="bi bi-search" aria-hidden="true"></i>
        <input v-model.trim="query" aria-label="Search Runnit" placeholder="Search athletes, plans, folders, clubs, or workouts…" @input="debouncedSearch" @keyup.enter="search" />
        <button v-if="query" type="button" @click="query = ''; results = []">Clear</button>
      </div>
      <div v-if="recommendationError" class="discovery-alert" role="status">Personalized recommendations are temporarily unavailable. You can still explore below.</div>
      <section v-if="spotifySummary" class="listening-summary" aria-labelledby="listening-summary-title">
        <div class="discovery-section-head"><div><p class="discovery-kicker">Your soundtrack</p><h2 id="listening-summary-title">{{ summaryPeriod === 'week' ? 'This week' : 'This month' }} on the move</h2></div><div class="summary-tabs" role="group" aria-label="Listening summary period"><button type="button" :class="{active: summaryPeriod === 'week'}" @click="loadListeningSummary('week')">Week</button><button type="button" :class="{active: summaryPeriod === 'month'}" @click="loadListeningSummary('month')">Month</button></div></div>
        <div class="summary-stats"><div><strong>{{ spotifySummary.activitiesWithListening }}</strong><span>workouts with music</span></div><div><strong>{{ spotifySummary.uniqueTracks }}</strong><span>tracks</span></div><div><strong>{{ spotifySummary.workoutMinutes }}</strong><span>minutes moving</span></div></div>
        <div v-if="spotifySummary.topTracks?.length" class="summary-tracks"><div v-for="track in spotifySummary.topTracks" :key="track.track"><span>{{ track.track }}</span><b>{{ track.plays }}×</b></div></div>
        <div class="summary-actions"><button type="button" class="summary-playlist" :disabled="playlistLoading" @click="createHistoryPlaylist">{{ playlistLoading ? 'Creating playlist…' : `Create ${summaryPeriod} playlist` }}</button><span v-if="playlistMessage" role="status">{{ playlistMessage }}</span></div>
      </section>
      <div v-if="loading" class="discovery-state">Personalizing your discovery feed…</div>
      <div v-else-if="query.length >= 2" class="discovery-results">
        <p v-if="!results.length" class="discovery-state">No matches yet. Try a name, sport, or training goal.</p>
        <router-link v-for="item in results" :key="`${item.type}-${item.id}`" :to="item.path" class="discovery-result">
          <div class="discovery-result-icon"><i :class="iconFor(item.type)"></i></div><div><strong>{{ item.title }}</strong><span>{{ item.type }}<template v-if="item.subtitle"> · {{ item.subtitle }}</template></span></div><i class="bi bi-arrow-up-right"></i>
        </router-link>
      </div>
      <template v-else>
        <template v-for="section in sections" :key="section.key">
          <section v-if="section.items?.length" class="discovery-section">
            <div class="discovery-section-head"><div><p class="discovery-kicker">For you</p><h2>{{ section.title }}</h2></div><router-link v-if="section.path" :to="section.path">See all →</router-link></div>
            <div class="discovery-grid">
              <router-link v-for="item in section.items" :key="`${section.key}-${item.id || item.path}`" :to="item.path" class="discovery-card"><div class="discovery-card-icon"><i :class="iconFor(item.type)"></i></div><strong>{{ item.title }}</strong><span>{{ item.subtitle || section.label }}</span></router-link>
            </div>
          </section>
        </template>
        <div v-if="!sections.some(s => s.items?.length) && !loading" class="discovery-empty"><strong>Your discovery feed is getting ready.</strong><p>Complete your profile or record an activity so we can make better recommendations.</p><router-link to="/track" class="discovery-primary">Record an activity →</router-link></div>
      </template>
    </div>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import axios from 'axios'
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
const query = ref(''); const results = ref([]); const recommendations = ref({}); const loading = ref(true); const recommendationError = ref(false); const spotifySummary = ref(null); const summaryPeriod = ref('week'); const playlistLoading = ref(false); const playlistMessage = ref('')
const headers = () => { const token = localStorage.getItem('token'); return token ? { Authorization: `Bearer ${token}` } : {} }
let timer
const search = async () => { if (query.value.length < 2) return; loading.value = true; try { results.value = (await axios.get(`${API_URL}/discovery/search`, { params: { q: query.value }, headers: headers() })).data.results || [] } catch { results.value = [] } finally { loading.value = false } }
const debouncedSearch = () => { clearTimeout(timer); timer = setTimeout(search, 280) }
const loadListeningSummary = async period => { summaryPeriod.value = period; try { spotifySummary.value = (await axios.get(`${API_URL}/spotify/listening-summary`, { params: { period }, headers: headers() })).data } catch { spotifySummary.value = null } }
const createHistoryPlaylist = async () => { playlistLoading.value = true; playlistMessage.value = ''; try { const { data } = await axios.post(`${API_URL}/spotify/playlists/from-history`, { period: summaryPeriod.value }, { headers: headers() }); playlistMessage.value = `Created “${data.name || 'RUNNIT soundtrack'}” in Spotify.` } catch (e) { playlistMessage.value = e.response?.data?.error || 'Connect Spotify and listen during a workout first.' } finally { playlistLoading.value = false } }
const sections = computed(() => [
  { key: 'athletes', title: 'Athletes to follow', path: '/friends', label: 'Athlete', items: recommendations.value.athletes },
  { key: 'plans', title: 'Training plans', path: '/plans', label: 'Plan', items: recommendations.value.plans },
  { key: 'clubs', title: 'Crews to join', path: '/clubs', label: 'Club', items: recommendations.value.clubs },
  { key: 'races', title: 'Next start line', path: '/races', label: 'Race', items: recommendations.value.races },
  { key: 'start', title: 'Start exploring', label: 'Runnit', items: [
    { type: 'RACE', id: 'explore-races', title: 'Find a race', subtitle: 'Browse upcoming events', path: '/races' },
    { type: 'ATHLETE', id: 'find-friends', title: 'Find your people', subtitle: 'Follow athletes and friends', path: '/friends' },
    { type: 'PLAN', id: 'browse-plans', title: 'Browse training', subtitle: 'Choose a plan or folder', path: '/train' },
    { type: 'CLUB', id: 'join-clubs', title: 'Join a crew', subtitle: 'Discover clubs and groups', path: '/clubs' },
  ] },
])
const iconFor = type => ({ ATHLETE: 'bi bi-person', CLUB: 'bi bi-people', PLAN: 'bi bi-calendar-check', FOLDER: 'bi bi-folder', ACTIVITY: 'bi bi-activity', RACE: 'bi bi-flag' }[type] || 'bi bi-compass')
onMounted(async () => {
  try {
    recommendations.value = (await axios.get(`${API_URL}/discovery/recommendations`, { headers: headers() })).data
    await loadListeningSummary('week')
  } catch { recommendationError.value = true }
  finally { loading.value = false }
})
</script>

<style scoped>
.discovery-page{min-height:100vh;background:#FBF6EC;color:#16130F;padding:calc(var(--page-top) + 30px) 20px 80px}.discovery-wrap{max-width:980px;margin:auto}.discovery-header{margin-bottom:24px}.discovery-kicker{margin:0 0 6px;color:#2A55F5;font:700 .65rem 'Spline Sans Mono',monospace;letter-spacing:.14em;text-transform:uppercase}.discovery-header h1{margin:0;font:900 clamp(2.8rem,8vw,5rem)/.85 'Big Shoulders Display',sans-serif;text-transform:uppercase}.discovery-header p:last-child{color:#665f55}.discovery-search{display:flex;align-items:center;gap:12px;padding:4px 14px;background:#fff;border:2px solid #16130F;box-shadow:4px 4px #16130F}.discovery-search input{flex:1;min-width:0;border:0;outline:0;padding:14px 0;background:transparent;font:inherit}.discovery-search button{border:0;background:none;color:#2A55F5;font-weight:800}.discovery-state{padding:28px 0;color:#665f55}.discovery-section{margin-top:38px}.discovery-section-head{display:flex;align-items:end;justify-content:space-between;gap:15px;margin-bottom:14px}.discovery-section-head h2{margin:0;font-size:1.5rem}.discovery-section-head a{color:#2A55F5;font-weight:800}.discovery-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.discovery-card,.discovery-result{background:#fff;border:2px solid #16130F;color:#16130F;text-decoration:none}.discovery-card{display:flex;flex-direction:column;gap:8px;padding:16px;min-height:130px}.discovery-card:hover,.discovery-result:hover{background:#FFF1A8}.discovery-card-icon,.discovery-result-icon{display:grid;place-items:center;width:34px;height:34px;background:#2A55F5;color:#fff}.discovery-card span,.discovery-result span{color:#665f55;font-size:.78rem}.discovery-results{display:grid;gap:8px;margin-top:24px}.discovery-result{display:flex;align-items:center;gap:14px;padding:13px}.discovery-result>i:last-child{margin-left:auto;color:#2A55F5}.discovery-primary{display:inline-block;padding:12px 16px;background:#2A55F5;color:#fff;font-weight:800;text-decoration:none;border:2px solid #16130F;box-shadow:3px 3px #16130F}.discovery-empty{margin-top:40px;padding:26px;background:#fff;border:2px solid #16130F}.discovery-empty p{color:#665f55}@media(max-width:680px){.discovery-grid{grid-template-columns:repeat(2,1fr)}.discovery-card{min-height:110px}}
.discovery-alert{margin-top:18px;padding:12px 14px;background:#FFF1A8;border:1px solid #16130F;font-size:.82rem}
.listening-summary{margin-top:28px;padding:20px;background:#fff;border:2px solid #16130F;box-shadow:4px 4px #16130F}.summary-tabs{display:flex;gap:4px}.summary-tabs button{border:1px solid #16130F;background:#FBF6EC;padding:6px 9px;font:700 .7rem 'Spline Sans Mono',monospace;text-transform:uppercase}.summary-tabs button.active{background:#2A55F5;color:#fff}.summary-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:12px 0 18px}.summary-stats div{display:flex;flex-direction:column;gap:3px}.summary-stats strong{font-size:1.55rem}.summary-stats span{color:#665f55;font-size:.76rem}.summary-tracks{display:grid;gap:7px;border-top:1px solid rgba(22,19,15,.18);padding-top:12px}.summary-tracks div{display:flex;justify-content:space-between;gap:10px}.summary-tracks b{color:#2A55F5}@media(max-width:520px){.summary-stats{gap:6px}.summary-stats strong{font-size:1.2rem}.summary-stats span{font-size:.68rem}}
.summary-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:16px}.summary-playlist{padding:9px 12px;border:2px solid #16130F;background:#F5D547;font-weight:800;cursor:pointer}.summary-playlist:disabled{opacity:.6;cursor:wait}.summary-actions>span{color:#665f55;font-size:.78rem}
</style>
