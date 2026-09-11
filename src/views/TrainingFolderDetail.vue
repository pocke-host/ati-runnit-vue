<template>
  <main class="folder-detail-page">
    <section class="folder-detail-hero">
      <router-link to="/training-folders" class="back-link">← All folders</router-link>
      <p class="eyebrow">Training block</p>
      <h1>{{ folder?.name || 'Training folder' }}</h1>
      <p>{{ folder?.description || 'A focused place for the work behind your goal.' }}</p>
    </section>
    <section class="folder-detail-body">
      <div v-if="loading" class="detail-state" role="status">Loading training block…</div>
      <div v-else-if="error" class="detail-state detail-error" role="alert">{{ error }}<button @click="load">Try again</button></div>
      <template v-else-if="folder">
        <div class="detail-summary">
          <div><span>Workouts saved</span><strong>{{ items.length }}</strong></div>
          <div><span>Target date</span><strong>{{ folder.targetDate ? formatDate(folder.targetDate) : 'Not set' }}</strong></div>
          <div><span>Time remaining</span><strong>{{ daysRemaining }}</strong></div>
        </div>
        <div class="detail-heading"><div><p class="eyebrow">Your work</p><h2>Block activity</h2></div><router-link to="/training-folders" class="secondary-link">Manage folders →</router-link></div>
        <div v-if="items.length" class="item-list">
          <article v-for="item in items" :key="item.id" class="item-row">
            <div class="item-mark">{{ item.itemType === 'ACTIVITY' ? 'RUN' : item.itemType }}</div>
            <div class="item-copy"><strong>{{ item.itemType === 'ACTIVITY' ? `Activity #${item.itemId}` : `${item.itemType} #${item.itemId}` }}</strong><span>{{ item.itemType === 'ACTIVITY' ? 'Logged workout' : 'Saved training item' }}</span></div>
            <router-link v-if="item.itemType === 'ACTIVITY'" :to="`/activities/${item.itemId}`" class="item-open">Open →</router-link>
            <button class="item-remove" type="button" @click="removeItem(item)">Remove</button>
          </article>
        </div>
        <div v-else class="detail-state"><strong>No workouts in this block yet.</strong><span>Open an activity and choose “Save to training folder” to start building the story.</span></div>
      </template>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
const route = useRoute(); const folder = ref(null); const loading = ref(true); const error = ref('')
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` })
const items = computed(() => folder.value?.items || [])
const daysRemaining = computed(() => { if (!folder.value?.targetDate) return '—'; const days = Math.ceil((new Date(`${folder.value.targetDate}T00:00:00`) - new Date()) / 86400000); return days < 0 ? 'Past target' : `${days} day${days === 1 ? '' : 's'}` })
const load = async () => { loading.value = true; error.value = ''; try { const { data } = await axios.get(`${API_URL}/training-folders`, { headers: auth() }); folder.value = (Array.isArray(data) ? data : []).find(f => String(f.id) === String(route.params.id)); if (!folder.value) error.value = 'That training folder could not be found.' } catch { error.value = 'This training block did not load. Try again.' } finally { loading.value = false } }
const removeItem = async item => { try { await axios.delete(`${API_URL}/training-folders/${folder.value.id}/items/${item.itemType}/${item.itemId}`, { headers: auth() }); folder.value.items = folder.value.items.filter(i => i.id !== item.id) } catch { error.value = 'Could not remove that item.' } }
const formatDate = d => new Date(`${d}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
onMounted(load)
</script>

<style scoped>
.folder-detail-page{min-height:100vh;padding-top:var(--nav-h,66px);background:#fbf6ec;color:#16130f}.folder-detail-hero{padding:32px max(24px,calc((100% - 1100px)/2)) 60px;background:#2a55f5;color:#fff}.back-link{display:inline-block;margin-bottom:46px;color:#fff;font:11px 'Spline Sans Mono',monospace;text-transform:uppercase;text-decoration:none}.folder-detail-hero h1{max-width:760px;margin:10px 0;font-size:clamp(42px,7vw,76px);line-height:.95}.folder-detail-hero p:last-child{max-width:560px;margin:0;opacity:.86}.eyebrow{margin:0;font:11px 'Spline Sans Mono',monospace;letter-spacing:.14em;text-transform:uppercase}.folder-detail-body{max-width:1100px;margin:auto;padding:36px 24px 80px}.detail-summary{display:grid;grid-template-columns:repeat(3,1fr);border:2px solid #16130f;background:#fff;box-shadow:5px 5px #16130f}.detail-summary div{padding:18px}.detail-summary div+div{border-left:1px solid #ddd4c5}.detail-summary span{display:block;color:#665f55;font:10px 'Spline Sans Mono',monospace;text-transform:uppercase}.detail-summary strong{display:block;margin-top:8px;font-size:1.35rem}.detail-heading{display:flex;align-items:end;justify-content:space-between;gap:16px;margin:48px 0 16px}.detail-heading h2{margin:6px 0 0;font-size:2rem}.secondary-link{color:#2a55f5;font:11px 'Spline Sans Mono',monospace;font-weight:700;text-transform:uppercase;text-decoration:none}.item-list{display:grid;gap:8px}.item-row{display:flex;align-items:center;gap:14px;padding:14px;background:#fff;border:2px solid #16130f}.item-mark{min-width:52px;padding:8px 5px;text-align:center;background:#f5d547;border:2px solid #16130f;font:10px 'Spline Sans Mono',monospace;font-weight:700}.item-copy{flex:1;min-width:0}.item-copy strong,.item-copy span{display:block}.item-copy span{margin-top:3px;color:#665f55;font-size:.8rem}.item-open,.item-remove{border:0;background:none;color:#2a55f5;font:11px 'Spline Sans Mono',monospace;font-weight:700;text-transform:uppercase;text-decoration:none;cursor:pointer}.item-remove{color:#8a8174}.detail-state{display:flex;flex-direction:column;align-items:center;gap:8px;padding:56px 20px;border:2px dashed #aaa;text-align:center;color:#665f55}.detail-state strong{color:#16130f}.detail-state button{margin-top:8px;border:2px solid #16130f;background:#f5d547;padding:10px 16px;font-weight:700}.detail-error{color:#b42318}@media(max-width:700px){.detail-summary{grid-template-columns:1fr}.detail-summary div+div{border-left:0;border-top:1px solid #ddd4c5}.detail-heading{align-items:flex-start;flex-direction:column}.item-row{align-items:flex-start;flex-wrap:wrap}.item-open{margin-left:auto}.item-remove{width:100%;text-align:right}}
</style>
