<template>
  <main class="cc-page"><section class="cc-hero"><p class="eyebrow">COROS × RUNNIT</p><h1>Your training, with context.</h1><p>Ask your COROS data about recovery, load, fitness, and the work ahead.</p></section>
    <section class="cc-body">
      <div v-if="!connected" class="cc-connect"><div><span class="cc-kicker">Private by default</span><h2>Connect COROS Coach</h2><p>Authorize your COROS account once. RUNNIT will request your training context only when you ask for it.</p></div><button @click="connect" :disabled="loading">{{ loading ? 'Opening COROS…' : 'Connect COROS' }}</button></div>
      <template v-else><div class="cc-toolbar"><div><span class="cc-kicker">Connected</span><h2>Today’s read</h2></div><button @click="loadBrief" :disabled="loading">{{ loading ? 'Reading…' : 'Refresh read' }}</button></div><div v-if="error" class="cc-error">{{ error }}</div><div v-if="brief" class="cc-grid"><article v-for="card in cards" :key="card.key" class="cc-card"><span>{{ card.label }}</span><pre>{{ readable(brief[card.key]) }}</pre></article></div><div v-else class="cc-empty"><strong>Ready when you are.</strong><span>Refresh your COROS read to see recovery, load, and fitness context.</span></div></template>
    </section>
  </main>
</template>
<script setup>
import { ref, onMounted } from 'vue'; import axios from 'axios'
const API_URL=import.meta.env.VITE_API_URL||'http://localhost:8080/api'; const connected=ref(false),loading=ref(false),brief=ref(null),error=ref('')
const cards=[{key:'recovery',label:'Recovery'},{key:'trainingLoad',label:'Training load'},{key:'fitness',label:'Fitness'}]
const auth=()=>({Authorization:`Bearer ${localStorage.getItem('token')}`})
const check=async()=>{try{connected.value=(await axios.get(`${API_URL}/coros-coach/status`,{headers:auth()})).data.connected}catch{}}
const connect=async()=>{loading.value=true;try{window.location.href=(await axios.get(`${API_URL}/coros-coach/connect`,{headers:auth()})).data.url}catch(e){error.value=e.response?.data?.error||'COROS Coach is not configured yet.';loading.value=false}}
const loadBrief=async()=>{loading.value=true;error.value='';try{brief.value=(await axios.get(`${API_URL}/coros-coach/brief`,{headers:auth()})).data}catch(e){error.value=e.response?.data?.error||'Could not read COROS data.'}finally{loading.value=false}}
const readable=v=>{try{const p=JSON.parse(v); return JSON.stringify(p?.result?.structuredContent||p?.result?.content||p,null,2)}catch{return String(v||'No data returned.')}}
onMounted(async()=>{await check();if(new URLSearchParams(location.search).get('connected')) await loadBrief()})
</script>
<style scoped>.cc-page{min-height:100vh;padding-top:var(--nav-h,66px);background:#fbf6ec;color:#16130f}.cc-hero{padding:72px max(24px,calc((100% - 1100px)/2));background:#16130f;color:#fff}.cc-hero h1{font-size:clamp(40px,7vw,76px);max-width:700px;margin:10px 0}.cc-hero p:last-child{max-width:500px;opacity:.75}.eyebrow,.cc-kicker{font:11px 'Spline Sans Mono',monospace;letter-spacing:.14em;text-transform:uppercase}.cc-body{max-width:1100px;margin:auto;padding:36px 24px}.cc-connect,.cc-toolbar{display:flex;justify-content:space-between;gap:24px;align-items:center;border:2px solid #16130f;background:#fff;padding:24px;box-shadow:5px 5px #16130f}.cc-connect h2,.cc-toolbar h2{margin:8px 0}.cc-connect p{max-width:560px;color:#665f55}.cc-connect button,.cc-toolbar button{border:2px solid #16130f;background:#f5d547;padding:13px 18px;font-weight:800;white-space:nowrap}.cc-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:24px}.cc-card{border:2px solid #16130f;background:#fff;padding:20px;min-height:230px}.cc-card>span{font:11px 'Spline Sans Mono',monospace;text-transform:uppercase}.cc-card pre{white-space:pre-wrap;overflow:auto;font-size:12px;line-height:1.5;color:#665f55;margin-top:18px}.cc-empty{margin-top:24px;padding:48px;text-align:center;border:2px dashed #aaa;display:flex;flex-direction:column;gap:8px;color:#665f55}.cc-error{margin-top:18px;color:#b42318}@media(max-width:760px){.cc-connect,.cc-toolbar{align-items:flex-start;flex-direction:column}.cc-grid{grid-template-columns:1fr}}
</style>
