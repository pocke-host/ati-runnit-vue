<template>
  <main class="admin-page"><div class="admin-wrap">
    <p class="eyebrow">Operations</p><h1>Rewards fulfillment</h1><p class="lede">Review redemptions, update delivery status, and watch the rewards loop.</p>
    <div v-if="error" class="error">{{ error }} <button @click="load">Retry</button></div>
    <div class="metrics"><div v-for="(value,key) in analytics" :key="key"><span>{{ key.replaceAll('_',' ') }}</span><strong>{{ value }}</strong></div></div>
    <section class="panel"><div class="panel-head"><h2>Recent redemptions</h2><span>{{ redemptions.length }} shown</span></div><div v-if="!redemptions.length" class="empty">No redemptions yet.</div><div v-for="item in redemptions" :key="item.id" class="order"><div><strong>#{{ item.id }} · {{ item.title }}</strong><span>{{ item.status }} · {{ item.createdAt ? new Date(item.createdAt).toLocaleString() : '' }}</span><small v-if="item.apparelSize">Size {{ item.apparelSize }}</small><small v-if="item.shippingName">Ship to {{ item.shippingName }} · {{ item.shippingAddress }}</small></div><div class="actions"><select :value="item.status" @change="updateStatus(item,$event.target.value)"><option v-for="status in statuses" :key="status" :value="status">{{ status }}</option></select><button @click="updateStatus(item,'FULFILLED')">Mark fulfilled</button></div></div></section>
  </div></main>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` })
const redemptions=ref([]), analytics=ref({}), error=ref(''), statuses=['REQUESTED','SHIPPED','FULFILLED','CANCELLED','REFUNDED']
const load=async()=>{error.value='';try{const {data}=await axios.get(`${API_URL}/admin/rewards`,{headers:headers()});redemptions.value=data.redemptions||[];analytics.value=data.analytics||{}}catch(e){error.value=e.response?.data?.error||'Admin rewards could not be loaded.'}}
const updateStatus=async(item,status)=>{const note=window.prompt(`Optional note for ${status.toLowerCase()}:`,'')??'';try{await axios.patch(`${API_URL}/admin/rewards/redemptions/${item.id}/status`,{status,note},{headers:headers()});await load()}catch(e){error.value=e.response?.data?.error||'Could not update redemption.'}}
onMounted(load)
</script>
<style scoped>
.admin-page{min-height:100vh;background:#fbf6ec;color:#16130f;padding:calc(var(--page-top) + 48px) 24px 80px}.admin-wrap{max-width:1080px;margin:auto}.eyebrow{font:700 .68rem 'Spline Sans Mono',monospace;letter-spacing:.18em;text-transform:uppercase;color:#2a55f5}h1{font-size:clamp(2.8rem,7vw,5rem);line-height:.9;margin:10px 0}.lede{color:#665f55}.error{margin:24px 0;border:2px solid #a33b2a;padding:16px;color:#a33b2a}.error button{margin-left:12px}.metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:36px 0}.metrics div,.panel{border:2px solid #16130f;background:#fff;box-shadow:4px 4px 0 #16130f}.metrics div{padding:18px}.metrics span,.panel-head span,.order span,.order small{display:block;font:600 .65rem 'Spline Sans Mono',monospace;text-transform:uppercase;color:#665f55}.metrics strong{font-size:2.1rem}.panel{box-shadow:none}.panel-head{display:flex;justify-content:space-between;align-items:center;padding:18px;border-bottom:2px solid #16130f}.panel h2{margin:0}.order{display:flex;justify-content:space-between;gap:20px;padding:18px;border-bottom:1px solid #e7dfce}.order:last-child{border-bottom:0}.order div:first-child{display:flex;flex-direction:column;gap:6px}.actions{display:flex;align-items:center;gap:8px}.actions select,.actions button{border:2px solid #16130f;background:#fff;padding:9px;font:700 .65rem 'Spline Sans Mono',monospace;text-transform:uppercase}.actions button{background:#2a55f5;color:#fff}@media(max-width:700px){.metrics{grid-template-columns:1fr 1fr}.order{flex-direction:column}.actions{align-self:flex-start}}
</style>
