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
          <article class="snapshot-card"><p class="snapshot-label">Next race</p><h3>{{ goalRace?.raceName || (activePlan?.targetRaceDate ? 'Target race' : 'No race saved') }}</h3><p>{{ goalRace ? `${formatTarget(goalRace.raceDate)} · ${goalRace.distance || 'Race'}` : activePlan?.targetRaceDate ? formatTarget(activePlan.targetRaceDate) : 'Choose an event to keep the countdown visible.' }}</p><router-link to="/races" class="snapshot-link">{{ goalRace ? 'View races →' : 'Find a race →' }}</router-link></article>
          <article class="snapshot-card"><p class="snapshot-label">Strength journal</p><h3>{{ strengthSummary?.sessionCount || 0 }} sessions</h3><p>{{ strengthSummary?.totalSets || 0 }} working sets in the last 28 days</p><router-link to="/strength" class="snapshot-link">View progress →</router-link></article>
          <article class="snapshot-card"><p class="snapshot-label">Connected context</p><h3>{{ connectedIntegrations }} active</h3><p>{{ integrationsNeedingAttention }} need attention</p><router-link to="/devices" class="snapshot-link">Manage integrations →</router-link></article>
        </div>
      </section>
      <div class="train-section-head"><div><p class="eyebrow">Your toolkit</p><h2>Train with intention.</h2><p class="train-section-copy">Start with the next useful action. The rest stays within reach.</p></div><router-link to="/track" class="train-primary">Record an activity →</router-link></div>
      <div class="train-grid">
        <router-link v-for="tool in tools" :key="tool.path" :to="tool.path" class="train-card"><div class="train-card-icon"><i :class="['bi', tool.icon]"></i></div><div><p class="train-card-kicker">{{ tool.kicker }}</p><h3>{{ tool.title }}</h3><p>{{ tool.copy }}</p></div><span class="train-card-arrow">→</span></router-link>
      </div>
      <div class="train-block" :class="{ 'train-block--empty': !folders.length }"><div><p class="eyebrow">Your goals</p><h2>{{ folders.length ? 'Keep the story together.' : 'Give your next goal a home.' }}</h2><p>{{ folders.length ? 'Open a goal to see the work building toward your event.' : 'Create a named goal for a race, season, or strength focus. Add workouts as you go.' }}</p><router-link v-if="!folders.length" to="/training-folders" class="train-block-cta">Create a training goal →</router-link></div><div v-if="folders.length" class="train-folder-list"><router-link v-for="folder in folders.slice(0,3)" :key="folder.id" :to="`/training-folders/${folder.id}`"><strong>{{ folder.name }}</strong><span>{{ folder.items?.length || 0 }} saved items <b v-if="folder.targetDate">· {{ daysUntil(folder.targetDate) }}</b></span></router-link></div></div>
    </section>
  </main>
</template>
<script setup>
import { computed, onMounted, ref } from 'vue'
import axios from 'axios'
import MotivationalQuote from '@/components/MotivationalQuote.vue'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
const API_URL=import.meta.env.VITE_API_URL||'http://localhost:8080/api'
const headers=()=>({Authorization:`Bearer ${localStorage.getItem('token')}`})
const authStore = useAuthStore()
const { user } = storeToRefs(authStore)
const folders=ref([]), plans=ref([]), nextRace=ref(null), strengthSummary=ref(null), integrationStatuses=ref([]), snapshotLoading=ref(true)
const activePlan=computed(()=>plans.value.find(p=>p.isActive)||plans.value[0]||null)
const goalRace=computed(()=>nextRace.value|| (user.value?.targetEventName&&user.value?.targetEventDate ? {raceName:user.value.targetEventName,raceDate:user.value.targetEventDate,distance:user.value.targetEventSport||'Event'}:null))
const connectedIntegrations=computed(()=>integrationStatuses.value.filter(s=>s.connected).length)
const integrationsNeedingAttention=computed(()=>integrationStatuses.value.filter(s=>s.connected&&(
  s.needsReconnect || (s.provider === 'garmin' ? s.syncState === 'stale' : (!s.lastSync || Date.now()-new Date(s.lastSync).getTime()>72*60*60*1000))
)).length)
const tools=[{path:'/plans',icon:'bi-journal-text',kicker:'Plan',title:'Training plans',copy:'A week that bends around your real life.'},{path:'/races',icon:'bi-flag',kicker:'Goal',title:'Races',copy:'Find a start line and keep your results together.'},{path:'/training-folders',icon:'bi-folder2-open',kicker:'Goal',title:'Training goals',copy:'Group every workout for one race or season.'},{path:'/strength',icon:'bi-lightning-charge',kicker:'Support',title:'Strength journal',copy:'Build the durability behind your distance.'},{path:'/fuel',icon:'bi-lightning-charge',kicker:'Fuel',title:'Fuel journal',copy:'See what supports the work and recovery.'},{path:'/coros-coach',icon:'bi-watch',kicker:'Context',title:'COROS Coach',copy:'Turn recovery and load into your next decision.'},{path:'/calendar',icon:'bi-calendar3',kicker:'Rhythm',title:'Calendar',copy:'See the work, the rest, and what comes next.'}]
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
  integrationStatuses.value=[
    ['garmin', value(4)],
    ['coros', value(5)],
    ['whoop', value(6)],
    ['apple-health', value(7)],
  ].filter(([, status]) => status).map(([provider, status]) => ({ provider, ...status }))
  snapshotLoading.value=false
})
</script>
<style scoped>
.train-hub{min-height:100vh;padding-top:var(--nav-h,66px);background:var(--rk-paper);color:var(--rk-ink)}
.train-hero{display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,400px);gap:clamp(28px,6vw,76px);align-items:end;padding:clamp(44px,7vw,78px) max(24px,calc((100% - 1160px)/2));background:#f1ece2;color:var(--rk-ink)}
.train-hero h1{max-width:700px;margin:10px 0;font-size:clamp(42px,7vw,78px);letter-spacing:-.035em;line-height:.94}
.train-hero>div>p:last-child{max-width:560px;margin:0;color:var(--rk-muted);font-size:1.05rem;line-height:1.55}
.eyebrow{margin:0;color:var(--rk-cobalt);font:700 10px var(--rk-font-mono-gr);letter-spacing:.14em;text-transform:uppercase}
.train-hero :deep(.motivation-card){margin:0;border:1px solid var(--rk-rule);border-radius:var(--rk-radius-lg);box-shadow:0 16px 36px rgba(22,19,15,.08)}
.train-body{max-width:1160px;margin:auto;padding:clamp(32px,5vw,56px) 24px 90px}
.train-section-head,.detail-heading{display:flex;align-items:end;justify-content:space-between;gap:20px;margin-bottom:18px}
.train-section-head h2,.train-block h2{margin:6px 0 0;font-size:clamp(1.8rem,3vw,2.25rem);letter-spacing:-.025em}
.train-section-copy{margin:8px 0 0;color:var(--rk-muted);font-size:.92rem;line-height:1.45}
.train-primary{display:inline-flex;align-items:center;min-height:44px;padding:0 17px;background:var(--rk-cobalt);color:#fff;border:0;border-radius:var(--rk-radius-pill);font:700 10px var(--rk-font-mono-gr);text-transform:uppercase;text-decoration:none;transition:background .15s,transform .15s}
.train-primary:hover{background:var(--rk-cobalt-hover);color:#fff;transform:translateY(-1px)}
.train-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.train-card{position:relative;display:flex;gap:14px;min-height:170px;padding:22px;background:var(--rk-surface);border:1px solid var(--rk-rule);border-radius:var(--rk-radius-md);color:var(--rk-ink);text-decoration:none;transition:transform .18s,box-shadow .18s,border-color .18s}
.train-card:hover{transform:translateY(-2px);border-color:rgba(42,85,245,.4);box-shadow:0 12px 28px rgba(22,19,15,.07);color:var(--rk-ink)}
.train-card-icon{display:grid;place-items:center;flex:0 0 38px;height:38px;background:var(--rk-yellow);border-radius:var(--rk-radius-sm);color:var(--rk-ink)}
.train-card-kicker{margin:0;color:var(--rk-cobalt);font:700 10px var(--rk-font-mono-gr);text-transform:uppercase}
.train-card h3{margin:6px 0;font-size:1.2rem;letter-spacing:-.01em}
.train-card p:last-of-type{margin:0;color:var(--rk-muted);font-size:.85rem;line-height:1.45}
.train-card-arrow{position:absolute;right:18px;bottom:15px;color:var(--rk-cobalt);font-size:1.2rem}
.train-block{display:grid;grid-template-columns:1fr 1.3fr;gap:28px;margin-top:32px;padding:28px;background:var(--rk-yellow);border:0;border-radius:var(--rk-radius-lg)}
.train-block>div>p:last-child{color:#5f4b1b;font-size:.88rem}
.train-folder-list{display:grid;gap:8px}
.train-folder-list a{display:flex;justify-content:space-between;gap:12px;padding:14px 16px;background:rgba(255,255,255,.84);border:1px solid rgba(22,19,15,.12);border-radius:var(--rk-radius-sm);color:var(--rk-ink);text-decoration:none;transition:background .15s,color .15s}
.train-folder-list a:hover{background:#fff;color:var(--rk-cobalt)}
.train-folder-list span{color:var(--rk-muted);font:10px var(--rk-font-mono-gr);text-transform:uppercase}
.train-folder-list b{font-weight:400}
.train-block-cta{display:inline-flex;align-items:center;min-height:44px;margin-top:16px;padding:0 16px;background:var(--rk-ink);color:#fff;border:0;border-radius:var(--rk-radius-pill);font:700 10px var(--rk-font-mono-gr);text-transform:uppercase;text-decoration:none}
.train-block-cta:hover{background:var(--rk-cobalt);color:#fff}
.train-block--empty{grid-template-columns:1fr}
.train-snapshot{margin-bottom:18px}
.snapshot-heading{display:flex;align-items:end;justify-content:space-between;gap:16px;margin-bottom:16px}
.snapshot-heading h2{margin:6px 0 0;font-size:clamp(1.8rem,3vw,2.25rem);letter-spacing:-.025em}
.snapshot-status{color:var(--rk-muted);font:10px var(--rk-font-mono-gr);text-transform:uppercase}
.snapshot-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:32px}
.snapshot-card{min-height:174px;padding:20px;background:var(--rk-surface);border:1px solid var(--rk-rule);border-radius:var(--rk-radius-md);transition:border-color .15s,box-shadow .15s}
.snapshot-card:hover{border-color:rgba(42,85,245,.4);box-shadow:0 10px 24px rgba(22,19,15,.06)}
.snapshot-card--primary{background:#e6edff;border-color:rgba(42,85,245,.16)}
.snapshot-label{margin:0;color:var(--rk-cobalt);font:700 10px var(--rk-font-mono-gr);letter-spacing:.08em;text-transform:uppercase}
.snapshot-card h3{margin:12px 0 7px;font-size:1.15rem;line-height:1.05;letter-spacing:-.01em}
.snapshot-card p:not(.snapshot-label){min-height:36px;margin:0;color:var(--rk-muted);font-size:.84rem;line-height:1.4}
.snapshot-link{display:inline-block;margin-top:16px;color:var(--rk-ink);font:700 10px var(--rk-font-mono-gr);text-transform:uppercase;text-decoration:none}
.snapshot-link:hover{color:var(--rk-cobalt)}
@media(max-width:900px){.snapshot-grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:800px){.train-hero{grid-template-columns:1fr;padding:44px 24px}.train-grid{grid-template-columns:1fr 1fr}.train-block{grid-template-columns:1fr}}
@media(max-width:520px){.train-grid{grid-template-columns:1fr}.train-section-head{align-items:flex-start;flex-direction:column}.train-primary{width:100%;justify-content:center}.train-folder-list a{align-items:flex-start;flex-direction:column}.snapshot-heading{align-items:flex-start;flex-direction:column}.snapshot-grid{grid-template-columns:1fr}}
</style>
