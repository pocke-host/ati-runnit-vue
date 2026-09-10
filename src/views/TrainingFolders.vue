<template>
  <main class="folders-page">
    <section class="folders-hero"><p class="eyebrow">Training archive</p><h1>Folders</h1><p>Keep every workout for a race or season in one place.</p></section>
    <section class="folders-body">
      <form class="folder-create" @submit.prevent="createFolder">
        <input v-model.trim="draft.name" required maxlength="120" placeholder="London Marathon" aria-label="Folder name">
        <input v-model.trim="draft.description" maxlength="240" placeholder="Spring build · April 26" aria-label="Folder description">
        <input v-model="draft.targetDate" type="date" aria-label="Target date">
        <button :disabled="saving">{{ saving ? 'Saving…' : 'Create folder' }}</button>
      </form>
      <p v-if="error" class="folder-error">{{ error }}</p>
      <div v-if="loading" class="folder-empty">Loading folders…</div>
      <div v-else-if="!folders.length" class="folder-empty"><strong>Your training blocks live here.</strong><span>Create a folder above, then add workouts from a plan or activity.</span></div>
      <div v-else class="folder-grid">
        <article v-for="folder in folders" :key="folder.id" class="folder-card">
          <div class="folder-card-top"><span class="folder-mark">{{ folder.name.slice(0, 1).toUpperCase() }}</span><button class="delete-btn" @click="removeFolder(folder)">Delete</button></div>
          <h2>{{ folder.name }}</h2><p>{{ folder.description || 'A focused training block.' }}</p>
          <div class="folder-meta"><span>{{ folder.items?.length || 0 }} items</span><span v-if="folder.targetDate">Target {{ formatDate(folder.targetDate) }}</span></div>
          <div v-if="folder.items?.length" class="folder-items"><span v-for="item in folder.items" :key="item.id">{{ item.itemType.toLowerCase() }} #{{ item.itemId }}</span></div>
        </article>
      </div>
    </section>
  </main>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` })
const folders = ref([]), loading = ref(true), saving = ref(false), error = ref('')
const draft = ref({ name: '', description: '', targetDate: '' })
const load = async () => { loading.value = true; try { folders.value = (await axios.get(`${API_URL}/training-folders`, { headers: headers() })).data } catch { error.value = "Folders didn't load. Try again." } finally { loading.value = false } }
const createFolder = async () => { saving.value = true; error.value = ''; try { const { data } = await axios.post(`${API_URL}/training-folders`, draft.value, { headers: headers() }); folders.value.unshift(data); draft.value = { name: '', description: '', targetDate: '' } } catch (e) { error.value = e.response?.data?.error || "Couldn't create that folder." } finally { saving.value = false } }
const removeFolder = async (folder) => { if (!window.confirm(`Delete ${folder.name}?`)) return; try { await axios.delete(`${API_URL}/training-folders/${folder.id}`, { headers: headers() }); folders.value = folders.value.filter(f => f.id !== folder.id) } catch { error.value = "Couldn't delete that folder." } }
const formatDate = d => new Date(`${d}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
onMounted(load)
</script>
<style scoped>
.folders-page{min-height:100vh;padding-top:var(--nav-h,66px);background:#fbf6ec;color:#16130f}.folders-hero{padding:72px max(24px,calc((100% - 1100px)/2));background:#2a55f5;color:#fff}.folders-hero h1{font-size:clamp(42px,7vw,76px);margin:8px 0}.folders-hero p:last-child{margin:0;opacity:.86}.eyebrow{font:11px/1 'Spline Sans Mono',monospace;text-transform:uppercase;letter-spacing:.14em}.folders-body{max-width:1100px;margin:auto;padding:36px 24px}.folder-create{display:grid;grid-template-columns:1.2fr 1.6fr 180px auto;gap:10px;margin-bottom:28px}.folder-create input{border:2px solid #16130f;background:#fff;padding:14px;font:14px inherit}.folder-create button{border:2px solid #16130f;background:#f5d547;padding:0 18px;font-weight:700}.folder-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.folder-card{border:2px solid #16130f;background:#fff;padding:22px;min-height:210px;box-shadow:5px 5px 0 #16130f}.folder-card-top{display:flex;justify-content:space-between;align-items:center}.folder-mark{display:grid;place-items:center;width:42px;height:42px;border:2px solid #16130f;background:#f5d547;font-weight:800;font-size:20px}.delete-btn{border:0;background:none;text-decoration:underline;font-size:12px}.folder-card h2{margin:22px 0 8px;font-size:24px}.folder-card p{color:#665f55;min-height:40px}.folder-meta{display:flex;justify-content:space-between;border-top:1px solid #ddd4c5;padding-top:12px;font:11px 'Spline Sans Mono',monospace;text-transform:uppercase}.folder-items{display:flex;flex-wrap:wrap;gap:6px;margin-top:14px}.folder-items span{background:#e6edff;padding:5px 7px;font-size:11px}.folder-empty{display:flex;flex-direction:column;gap:8px;padding:60px 20px;border:2px dashed #aaa;text-align:center;color:#665f55}.folder-error{color:#b42318}@media(max-width:800px){.folder-create{grid-template-columns:1fr}.folder-create button{padding:14px}.folder-grid{grid-template-columns:1fr}}
</style>
