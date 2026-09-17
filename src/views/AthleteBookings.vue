<template>
  <main class="bookings-page">
    <section class="bookings-hero"><div class="bookings-wrap"><div class="eyebrow">COACHING</div><h1>MY BOOKINGS</h1><p>Keep every coaching session, payment, and next step in one place.</p></div></section>
    <div class="bookings-wrap bookings-content">
      <div v-if="error" class="booking-alert">{{ error }}</div>
      <div v-if="loading" class="booking-empty">Loading your bookings…</div>
      <div v-else-if="!bookings.length" class="booking-empty"><div class="empty-mark">○</div><h2>No bookings yet.</h2><p>Find a coach when you’re ready for a little more structure.</p><router-link class="primary-btn" to="/coaches">Find a Coach →</router-link></div>
      <div v-else class="booking-list">
        <article v-for="booking in bookings" :key="booking.id" class="booking-card">
          <div class="booking-card-top"><div><span class="booking-kicker">BOOKING #{{ booking.id }}</span><h2>{{ serviceTitle(booking.serviceId) || 'Coaching service' }}</h2></div><span class="status-pill" :class="`status-${booking.status.toLowerCase()}`">{{ statusLabel(booking.status) }}</span></div>
          <div class="booking-meta"><div><span>SESSION</span><strong>{{ booking.scheduledStart ? formatDate(booking.scheduledStart) : 'Async / flexible' }}</strong></div><div><span>AMOUNT</span><strong>${{ (booking.amountCents / 100).toFixed(2) }}</strong></div><div><span>PAYMENT</span><strong>{{ paymentLabel(booking.status) }}</strong></div></div>
          <p v-if="booking.status === 'PENDING_PAYMENT'" class="booking-note">Your booking is reserved until payment is completed.</p>
          <p v-if="booking.status === 'CANCELLATION_REQUESTED'" class="booking-note">Cancellation requested. We’ll notify you when it is resolved.</p>
          <div class="booking-actions"><button v-if="booking.scheduledStart && !['CANCELLED','REFUNDED'].includes(booking.status)" class="secondary-btn" @click="downloadCalendar(booking)">{{ downloading === booking.id ? 'Preparing…' : 'Add to calendar' }}</button><button v-if="!['COMPLETED','REFUNDED','CANCELLED','CANCELLATION_REQUESTED'].includes(booking.status)" class="text-btn" @click="cancelBooking(booking)">Request cancellation</button></div>
        </article>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
const bookings = ref([]); const services = ref({}); const loading = ref(true); const error = ref(''); const downloading = ref(null)
const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` })
const serviceTitle = id => services.value[id]
const statusLabel = status => ({ PENDING_PAYMENT:'Awaiting payment', PAID:'Confirmed', COMPLETED:'Completed', REFUNDED:'Refunded', DISPUTED:'Payment disputed', PAYMENT_FAILED:'Payment failed', CANCELLATION_REQUESTED:'Cancellation pending', CANCELLED:'Cancelled' }[status] || status)
const paymentLabel = status => ['PAID','COMPLETED'].includes(status) ? 'Paid' : status === 'REFUNDED' ? 'Refunded' : status === 'PAYMENT_FAILED' ? 'Failed' : 'Pending'
const formatDate = value => new Date(value).toLocaleString([], { weekday:'short', month:'short', day:'numeric', year:'numeric', hour:'numeric', minute:'2-digit' })
const load = async () => { loading.value = true; error.value = ''; try { const res = await fetch(`${API}/athlete/bookings`, { headers: headers() }); if (!res.ok) throw new Error('Bookings could not load.'); bookings.value = await res.json(); await Promise.all([...new Set(bookings.value.map(b => b.coachId))].map(async coachId => { const servicesRes = await fetch(`${API}/coaches/${coachId}/services`, { headers: headers() }); if (servicesRes.ok) (await servicesRes.json()).forEach(service => { services.value[service.id] = service.title }) })) } catch (e) { error.value = e.message } finally { loading.value = false } }
const cancelBooking = async booking => { if (!window.confirm('Request cancellation for this booking?')) return; try { const res = await fetch(`${API}/coach/bookings/${booking.id}/cancel`, { method:'POST', headers:{...headers(),'Content-Type':'application/json'}, body:JSON.stringify({ reason:'Requested by athlete' }) }); const data = await res.json(); if (!res.ok) throw new Error(data.error || 'Cancellation could not be requested.'); booking.status = data.status } catch (e) { error.value = e.message } }
const downloadCalendar = async booking => { downloading.value = booking.id; try { const res = await fetch(`${API}/bookings/${booking.id}/calendar.ics`, { headers: headers() }); if (!res.ok) throw new Error('Calendar invite could not be created.'); const blob = await res.blob(); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `runnit-coaching-${booking.id}.ics`; a.click(); URL.revokeObjectURL(url) } catch (e) { error.value = e.message } finally { downloading.value = null } }
onMounted(load)
</script>

<style scoped>
.bookings-page{min-height:100vh;background:#FBF6EC;padding-top:var(--page-top);font-family:'Hanken Grotesk',system-ui,sans-serif;color:#16130F}.bookings-hero{background:#16130F;color:#FBF6EC;padding:52px 24px 44px}.bookings-wrap{max-width:900px;margin:auto}.eyebrow,.booking-kicker{font:700 .68rem 'Spline Sans Mono',monospace;letter-spacing:.18em;text-transform:uppercase;color:#8A8A8A}.bookings-hero .eyebrow{color:#AAB9FF}.bookings-hero h1{font-size:clamp(2.3rem,6vw,4rem);margin:8px 0 12px;letter-spacing:-.03em}.bookings-hero p{margin:0;color:#C9C3B8}.bookings-content{padding:36px 24px}.booking-alert{border:2px solid #C0392B;color:#C0392B;background:#fff;padding:12px 16px;margin-bottom:18px}.booking-list{display:grid;gap:14px}.booking-card{background:#fff;border:2px solid #E7DFCE;padding:22px}.booking-card-top{display:flex;justify-content:space-between;gap:14px;align-items:flex-start}.booking-card h2{font-size:1.1rem;margin:7px 0 0}.status-pill{font:700 .65rem 'Spline Sans Mono',monospace;text-transform:uppercase;padding:7px 9px;background:#EEF1FF;color:#2A55F5;white-space:nowrap}.status-refunded,.status-cancelled,.status-payment_failed,.status-disputed{background:#F7E9E5;color:#9B2C2C}.status-completed{background:#E8F5EC;color:#257942}.booking-meta{display:grid;grid-template-columns:2fr 1fr 1fr;gap:12px;border-top:1px solid #E7DFCE;border-bottom:1px solid #E7DFCE;margin:20px 0 14px;padding:14px 0}.booking-meta div{display:flex;flex-direction:column;gap:5px}.booking-meta span{font: .62rem 'Spline Sans Mono',monospace;color:#8A8A8A}.booking-meta strong{font-size:.86rem}.booking-note{font-size:.82rem;color:#5A5348}.booking-actions{display:flex;gap:12px;align-items:center;flex-wrap:wrap}.primary-btn,.secondary-btn,.text-btn{font-weight:700;font-size:.75rem;text-transform:uppercase;letter-spacing:.06em;cursor:pointer;text-decoration:none}.primary-btn{display:inline-block;background:#2A55F5;color:#fff;padding:12px 17px}.secondary-btn{border:2px solid #2A55F5;background:#fff;color:#2A55F5;padding:9px 12px}.text-btn{border:0;background:transparent;color:#9B2C2C;padding:9px 0}.booking-empty{text-align:center;padding:80px 20px;color:#5A5348}.booking-empty h2{color:#16130F}.empty-mark{font-size:2.5rem}.booking-empty p{margin-bottom:22px}@media(max-width:600px){.bookings-content{padding:24px 16px}.booking-card-top{flex-direction:column}.booking-meta{grid-template-columns:1fr 1fr}.booking-meta div:first-child{grid-column:1/-1}}
</style>
