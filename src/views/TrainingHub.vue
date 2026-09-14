<template>
  <main class="train-hub">
    <section class="train-hero"><div><p class="eyebrow">Training center</p><h1>Everything behind the miles.</h1><p>One place for your goal, your plan, your strength work, and the context that keeps you moving.</p></div><MotivationalQuote /></section>
    <section class="train-body">
      <section class="train-snapshot" aria-labelledby="snapshot-title">
        <div class="snapshot-heading">
          <div><p class="eyebrow">Your training at a glance</p><h2 id="snapshot-title">Know what matters next.</h2></div>
          <span v-if="snapshotLoading" class="snapshot-status" role="status">Refreshing…</span>
        </div>
        <div class="snapshot-grid">
          <article class="snapshot-card snapshot-card--primary"><p class="snapshot-label">Active plan</p><h3>{{ activePlan?.name || 'No active plan yet' }}</h3><p>{{ activePlan ? `${activePlan.progress || 0}% complete${activePlan.targetRaceDate ? ` · ${formatTarget(activePlan.targetRaceDate)}` : ''}` : 'Choose a plan to give your week a rhythm.' }}</p><router-link :to="activePlan?.id ? `/plans/${activePlan.id}` : '/plans'" class="snapshot-link">{{ activePlan ? 'Open plan →' : 'Find a plan →' }}</router-link></article>
          <article class="snapshot-card"><p class="snapshot-label">Next race</p><h3>{{ nextRace?.raceName || (activePlan?.targetRaceDate ? 'Target race' : 'No race saved') }}</h3><p>{{ nextRace ? `${formatTarget(nextRace.raceDate)} · ${nextRace.distance || 'Race'}` : activePlan?.targetRaceDate ? formatTarget(activePlan.targetRaceDate) : 'Save a race to keep the countdown visible.' }}</p><router-link to="/races" class="snapshot-link">{{ nextRace ? 'View races →' : 'Find a race →' }}</router-link></article>
          <article class="snapshot-card"><p class="snapshot-label">Strength journal</p><h3>{{ strengthSummary?.sessionCount || 0 }} sessions</h3><p>{{ strengthSummary?.totalSets || 0 }} working sets in the last 28 days</p><router-link to="/strength" class="snapshot-link">View progress →</router-link></article>
          <article class="snapshot-card"><p class="snapshot-label">Connected context</p><h3>{{ connectedIntegrations }} active</h3><p>{{ integrationsNeedingAttention }} need attention</p><router-link to="/devices" class="snapshot-link">Manage integrations →</router-link></article>
        </div>
      </section>
      <div class="train-section-head"><div><p class="eyebrow">Your toolkit</p><h2>Train with intention.</h2></div><router-link to="/track" class="train-primary">Record an activity →</router-link></div>
      <div class="train-grid">
        <router-link v-for="tool in tools" :key="tool.path" :to="tool.path" class="train-card"><div class="train-card-icon"><i :class="['bi', tool.icon]"></i></div><div><p class="train-card-kicker">{{ tool.kicker }}</p><h3>{{ tool.title }}</h3><p>{{ tool.copy }}</p></div><span class="train-card-arrow">→</span></router-link>
      </div>
      <div class="train-block" :class="{ 'train-block--empty': !folders.length }"><div><p class="eyebrow">Your blocks</p><h2>{{ folders.length ? 'Keep the story together.' : 'Give your next goal a home.' }}</h2><p>{{ folders.length ? 'Open a folder to see the work building toward your goal.' : 'Create a named block for a race, season, or strength focus. Add workouts as you go.' }}</p><router-link v-if="!folders.length" to="/training-folders" class="train-block-cta">Create a training folder →</router-link></div><div v-if="folders.length" class="train-folder-list"><router-link v-for="folder in folders.slice(0,3)" :key="folder.id" :to="`/training-folders/${folder.id}`"><strong>{{ folder.name }}</strong><span>{{ folder.items?.length || 0 }} saved items <b v-if="folder.targetDate">· {{ daysUntil(folder.targetDate) }}</b></span></router-link></div></div>
    </section>
  </main>
</template>
<script setup>
import { computed, onMounted, ref } from 'vue'
import axios from 'axios'
import MotivationalQuote from '@/components/MotivationalQuote.vue'
const API_URL=import.meta.env.VITE_API_URL||'http://localhost:8080/api'
const headers=()=>({Authorization:`Bearer ${localStorage.getItem('token')}`})
const folders=ref([]), plans=ref([]), nextRace=ref(null), strengthSummary=ref(null), integrationStatuses=ref([]), snapshotLoading=ref(true)
const activePlan=computed(()=>plans.value.find(p=>p.isActive)||plans.value[0]||null)
const connectedIntegrations=computed(()=>integrationStatuses.value.filter(s=>s.connected).length)
const integrationsNeedingAttention=computed(()=>integrationStatuses.value.filter(s=>s.connected&&(!s.lastSync||(Date.now()-new Date(s.lastSync).getTime()>72*60*60*1000))).length)
const tools=[{path:'/plans',icon:'bi-journal-text',kicker:'Plan',title:'Training plans',copy:'A week that bends around your real life.'},{path:'/races',icon:'bi-flag',kicker:'Goal',title:'Races',copy:'Find a start line and keep your results together.'},{path:'/training-folders',icon:'bi-folder2-open',kicker:'Block',title:'Training folders',copy:'Group every workout for one race or season.'},{path:'/strength',icon:'bi-lightning-charge',kicker:'Support',title:'Strength journal',copy:'Build the durability behind your distance.'},{path:'/coros-coach',icon:'bi-watch',kicker:'Context',title:'COROS Coach',copy:'Turn recovery and load into your next decision.'},{path:'/calendar',icon:'bi-calendar3',kicker:'Rhythm',title:'Calendar',copy:'See the work, the rest, and what comes next.'}]
const daysUntil=d=>{const days=Math.ceil((new Date(`${d}T00:00:00`)-new Date())/86400000);return days<0?'past target':days===0?'race day':`${days} days to go`}
const formatTarget=d=>new Date(`${d}T00:00:00`).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})
onMounted(async()=>{
  const results=await Promise.allSettled([
    axios.get(`${API_URL}/training-folders`,{headers:headers()}),
    axios.get(`${API_URL}/plans`,{headers:headers()}),
    axios.get(`${API_URL}/race-bookmarks`,{headers:headers()}),
    axios.get(`${API_URL}/strength/volume`,{params:{days:28},headers:headers()}),
    axios.get(`${API_URL}/integrations/garmin/status`,{headers:headers()}),
    axios.get(`${API_URL}/integrations/coros/status`,{headers:headers()}),
    axios.get(`${API_URL}/integrations/whoop/status`,{headers:headers()}),
    axios.get(`${API_URL}/integrations/apple-health/status`,{headers:headers()}),
  ])
  const value=i=>results[i].status==='fulfilled'?results[i].value.data:null
  folders.value=value(0)||[]
  const planData=value(1); plans.value=Array.isArray(planData)?planData:(planData?.content||[])
  const bookmarks=value(2)||[]; nextRace.value=bookmarks.filter(r=>r.raceDate&&new Date(`${r.raceDate}T00:00:00`)>new Date()).sort((a,b)=>new Date(a.raceDate)-new Date(b.raceDate))[0]||null
  strengthSummary.value=value(3)
  integrationStatuses.value=[value(4),value(5),value(6),value(7)].filter(Boolean)
  snapshotLoading.value=false
})
</script>
<style scoped>
.train-hub{min-height:100vh;padding-top:var(--nav-h,66px);background:#fbf6ec;color:#16130f}.train-hero{display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,440px);gap:34px;align-items:end;padding:62px max(24px,calc((100% - 1100px)/2));background:#16130f;color:#fff}.train-hero h1{max-width:700px;margin:10px 0;font-size:clamp(42px,7vw,78px);line-height:.94}.train-hero>div>p:last-child{max-width:560px;margin:0;opacity:.75}.eyebrow{margin:0;font:11px 'Spline Sans Mono',monospace;letter-spacing:.14em;text-transform:uppercase}.train-hero :deep(.motivation-card){margin:0;border-color:#fff;box-shadow:4px 4px #2a55f5}.train-body{max-width:1100px;margin:auto;padding:40px 24px 90px}.train-section-head,.detail-heading{display:flex;align-items:end;justify-content:space-between;gap:16px;margin-bottom:18px}.train-section-head h2,.train-block h2{margin:6px 0 0;font-size:2rem}.train-primary{padding:11px 14px;background:#2a55f5;color:#fff;border:2px solid #16130f;font:700 10px 'Spline Sans Mono',monospace;text-transform:uppercase;text-decoration:none}.train-primary:hover{background:#1e42d6;color:#fff}.train-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.train-card{position:relative;display:flex;gap:14px;min-height:170px;padding:20px;background:#fff;border:2px solid #16130f;color:#16130f;text-decoration:none;box-shadow:4px 4px #16130f}.train-card:hover{transform:translate(-2px,-2px);color:#16130f}.train-card-icon{display:grid;place-items:center;flex:0 0 36px;height:36px;background:#f5d547;border:2px solid #16130f;color:#16130f}.train-card-kicker{margin:0;color:#2a55f5;font:10px 'Spline Sans Mono',monospace;font-weight:700;text-transform:uppercase}.train-card h3{margin:6px 0;font-size:1.2rem}.train-card p:last-of-type{margin:0;color:#665f55;font-size:.82rem;line-height:1.4}.train-card-arrow{position:absolute;right:16px;bottom:13px;color:#2a55f5;font-size:1.2rem}.train-block{display:grid;grid-template-columns:1fr 1.3fr;gap:28px;margin-top:52px;padding:24px;background:#ffc53d;border:2px solid #16130f;box-shadow:5px 5px #16130f}.train-block>div>p:last-child{color:#665f55;font-size:.84rem}.train-folder-list{display:grid;gap:8px}.train-folder-list a{display:flex;justify-content:space-between;gap:12px;padding:12px;background:#fff;border:2px solid #16130f;color:#16130f;text-decoration:none}.train-folder-list a:hover{color:#2a55f5}.train-folder-list span{color:#665f55;font:10px 'Spline Sans Mono',monospace;text-transform:uppercase}.train-folder-list b{font-weight:400}.train-block-cta{display:inline-block;margin-top:16px;padding:11px 14px;background:#16130f;color:#fff;border:2px solid #16130f;font:700 10px 'Spline Sans Mono',monospace;text-transform:uppercase;text-decoration:none}.train-block-cta:hover{background:#2a55f5;color:#fff}.train-block--empty{grid-template-columns:1fr}@media(max-width:800px){.train-hero{grid-template-columns:1fr;padding:44px 24px}.train-grid{grid-template-columns:1fr 1fr}.train-block{grid-template-columns:1fr}}@media(max-width:520px){.train-grid{grid-template-columns:1fr}.train-section-head{align-items:flex-start;flex-direction:column}.train-primary{width:100%;text-align:center}.train-folder-list a{align-items:flex-start;flex-direction:column}}
.train-snapshot{margin-bottom:18px}.snapshot-heading{display:flex;align-items:end;justify-content:space-between;gap:16px;margin-bottom:16px}.snapshot-heading h2{margin:6px 0 0;font-size:2rem}.snapshot-status{color:#665f55;font:10px 'Spline Sans Mono',monospace;text-transform:uppercase}.snapshot-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:52px}.snapshot-card{min-height:174px;padding:18px;background:#fff;border:2px solid #16130f;box-shadow:4px 4px #16130f}.snapshot-card--primary{background:#e6edff}.snapshot-label{margin:0;color:#2a55f5;font:10px 'Spline Sans Mono',monospace;font-weight:700;letter-spacing:.08em;text-transform:uppercase}.snapshot-card h3{margin:12px 0 7px;font-size:1.15rem;line-height:1.05}.snapshot-card p:not(.snapshot-label){min-height:36px;margin:0;color:#665f55;font-size:.82rem;line-height:1.4}.snapshot-link{display:inline-block;margin-top:16px;color:#16130f;font:700 10px 'Spline Sans Mono',monospace;text-transform:uppercase;text-decoration:none}.snapshot-link:hover{color:#2a55f5}@media(max-width:900px){.snapshot-grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:520px){.snapshot-heading{align-items:flex-start;flex-direction:column}.snapshot-grid{grid-template-columns:1fr}}
</style>
