<template>
  <div class="admin-page">
    <div class="admin-header">
      <div class="admin-header-inner">
        <div>
          <div class="admin-kicker">Platform</div>
          <h1 class="admin-title">Admin Dashboard</h1>
        </div>
        <div class="admin-search">
          <input v-model="search" type="text" placeholder="Search users…" class="search-input" @input="debouncedSearch" />
        </div>
      </div>
    </div>

    <div class="admin-content">

      <!-- Stats row -->
      <div class="stats-row" v-if="stats">
        <div class="stat-card">
          <div class="stat-value">{{ stats.totalUsers.toLocaleString() }}</div>
          <div class="stat-label">Total Users</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ stats.athletes.toLocaleString() }}</div>
          <div class="stat-label">Athletes</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ stats.coaches.toLocaleString() }}</div>
          <div class="stat-label">Coaches</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ stats.admins.toLocaleString() }}</div>
          <div class="stat-label">Admins</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ stats.totalActivities.toLocaleString() }}</div>
          <div class="stat-label">Activities</div>
        </div>
      </div>

      <!-- Error state -->
      <div v-if="error" class="error-bar">{{ error }}</div>

      <section class="moderation-panel" aria-labelledby="moderation-title">
        <div class="moderation-head"><div><div class="admin-kicker">Trust &amp; safety</div><h2 id="moderation-title">Coach reports</h2></div><button class="page-btn" type="button" @click="fetchReports">Refresh</button></div>
        <div v-if="reportsLoading" class="loading-state">Loading reports…</div>
        <div v-else-if="!reports.length" class="moderation-empty">No open coach reports.</div>
        <div v-else class="report-list">
          <article v-for="report in reports" :key="report.id" class="report-row">
            <div><strong>{{ report.reason }}</strong><span>Coach #{{ report.coachId }} · {{ formatDate(report.createdAt) }}</span><p v-if="report.details">{{ report.details }}</p></div>
            <div class="report-actions"><span class="provider-badge">{{ report.status }}</span><button v-if="report.status === 'OPEN'" class="verify-btn" type="button" @click="resolveReport(report, 'REVIEWED')">Mark reviewed</button><button v-if="report.status !== 'DISMISSED'" class="page-btn" type="button" @click="resolveReport(report, 'DISMISSED')">Dismiss</button></div>
          </article>
        </div>
      </section>

      <!-- Loading -->
      <div v-if="loading && !users.length" class="loading-state">
        <span class="spinner"></span> Loading users…
      </div>

      <!-- User table -->
      <div v-else class="table-wrap">
        <table class="user-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Provider</th>
              <th>Role</th>
              <th>Coach moderation</th>
              <th>Subscription</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td class="col-id">{{ user.id }}</td>
              <td class="col-name">{{ user.displayName || '—' }}</td>
              <td class="col-email">{{ user.email }}</td>
              <td><span class="provider-badge">{{ user.authProvider }}</span></td>
              <td>
                <select
                  class="role-select"
                  :value="user.role"
                  @change="changeRole(user, $event.target.value)"
                  :disabled="updatingId === user.id"
                >
                  <option value="athlete">Athlete</option>
                  <option value="coach">Coach</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td><template v-if="user.role === 'coach'"><button class="verify-btn" @click="toggleVerification(user)" :disabled="updatingId === user.id">{{ user.coachVerified ? '✓ Verified' : 'Verify coach' }}</button><button class="suspend-btn" @click="toggleSuspension(user)" :disabled="updatingId === user.id">{{ user.coachSuspended ? 'Unsuspend' : 'Suspend' }}</button></template><span v-else>—</span></td>
              <td>
                <span :class="['sub-badge', user.subscriptionStatus === 'active' ? 'sub-active' : 'sub-none']">
                  {{ user.subscriptionStatus === 'active' ? 'PRO' : user.subscriptionStatus || 'free' }}
                </span>
              </td>
              <td class="col-date">{{ formatDate(user.createdAt) }}</td>
            </tr>
            <tr v-if="!users.length && !loading">
              <td colspan="8" class="empty-row">No matches.</td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div class="pagination" v-if="totalPages > 1">
          <button class="page-btn" :disabled="page === 0" @click="changePage(page - 1)">←</button>
          <span class="page-info">{{ page + 1 }} / {{ totalPages }}</span>
          <button class="page-btn" :disabled="page >= totalPages - 1" @click="changePage(page + 1)">→</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const users = ref([])
const stats = ref(null)
const loading = ref(false)
const error = ref('')
const search = ref('')
const page = ref(0)
const totalPages = ref(1)
const updatingId = ref(null)
const reports = ref([])
const reportsLoading = ref(false)
let searchTimeout = null

const getHeaders = () => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const fetchStats = async () => {
  try {
    const { data } = await axios.get(`${API_URL}/admin/stats`, { headers: getHeaders() })
    stats.value = data
  } catch (e) {
    if (e?.response?.status === 403) {
      error.value = 'Access denied — admin role required.'
    }
  }
}

const fetchUsers = async () => {
  loading.value = true
  error.value = ''
  try {
    const params = { page: page.value, size: 25 }
    if (search.value.trim()) params.search = search.value.trim()
    const { data } = await axios.get(`${API_URL}/admin/users`, { headers: getHeaders(), params })
    users.value = data.content || []
    totalPages.value = data.totalPages || 1
  } catch (e) {
    error.value = e?.response?.status === 403
      ? 'Access denied — admin role required.'
      : "Users didn't load."
  } finally {
    loading.value = false
  }
}

const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => { page.value = 0; fetchUsers() }, 350)
}

const changePage = (p) => { page.value = p; fetchUsers() }

const changeRole = async (user, newRole) => {
  if (user.role === newRole) return
  updatingId.value = user.id
  try {
    const { data } = await axios.patch(
      `${API_URL}/admin/users/${user.id}/role`,
      { role: newRole },
      { headers: getHeaders() }
    )
    // Update in-place so the table reflects the change without a refetch
    const idx = users.value.findIndex(u => u.id === user.id)
    if (idx !== -1) users.value[idx] = { ...users.value[idx], role: data.role }
    await fetchStats()
  } catch {
    error.value = "Role didn't update."
  } finally {
    updatingId.value = null
  }
}

const toggleVerification = async (user) => {
  updatingId.value = user.id
  try {
    const { data } = await axios.patch(`${API_URL}/admin/coaches/${user.id}/verification`, { verified: !user.coachVerified }, { headers: getHeaders() })
    user.coachVerified = data.coachVerified
  } catch { error.value = 'Verification did not update.' }
  finally { updatingId.value = null }
}

const toggleSuspension = async user => {
  updatingId.value = user.id
  try {
    const { data } = await axios.patch(`${API_URL}/admin/coaches/${user.id}/suspension`, { suspended: !user.coachSuspended }, { headers: getHeaders() })
    user.coachSuspended = data.coachSuspended
  } catch { error.value = 'Coach suspension did not update.' }
  finally { updatingId.value = null }
}

const fetchReports = async () => {
  reportsLoading.value = true
  try { reports.value = (await axios.get(`${API_URL}/admin/coach-reports`, { headers: getHeaders(), params: { status: 'OPEN' } })).data || [] }
  catch { error.value = 'Coach reports did not load.' }
  finally { reportsLoading.value = false }
}

const resolveReport = async (report, status) => {
  try { await axios.patch(`${API_URL}/admin/coach-reports/${report.id}`, { status }, { headers: getHeaders() }); reports.value = reports.value.filter(item => item.id !== report.id) }
  catch { error.value = 'Report status did not update.' }
}

const formatDate = (iso) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

onMounted(async () => {
  await Promise.all([fetchStats(), fetchUsers(), fetchReports()])
})
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
  background: #fff;
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
}
.moderation-panel{max-width:1200px;margin:0 auto;padding:24px;background:#FBF6EC;border:2px solid #16130F}.moderation-head{display:flex;align-items:end;justify-content:space-between;gap:12px;margin-bottom:14px}.moderation-head h2{margin:0;font-size:1.35rem}.moderation-empty{color:#665f55;padding:12px 0}.report-list{display:grid;gap:8px}.report-row{display:flex;justify-content:space-between;gap:16px;padding:13px;background:#fff;border:1px solid #E5E5E5}.report-row span,.report-row p{display:block;color:#665f55;font-size:.8rem;margin:4px 0 0}.report-actions{display:flex;align-items:center;gap:6px;flex-wrap:wrap}.suspend-btn{display:block;margin-top:5px;border:1px solid #C0392B;background:#fff;color:#C0392B;padding:5px 7px;font-size:.7rem}@media(max-width:680px){.report-row{flex-direction:column}.report-actions{justify-content:flex-start}}

/* Header */
.admin-header {
  border-bottom: 1px solid #E5E5E5;
  padding: 32px 0 0;
  background: #fff;
  position: sticky;
  top: var(--nav-h, 64px);
  z-index: 10;
}
.admin-header-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px 24px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}
.admin-kicker {
  font-size: 0.65rem;
  font-weight: 900;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #767676;
  margin-bottom: 6px;
}
.admin-title {
  font-size: 1.8rem;
  font-weight: 900;
  color: #000;
  margin: 0;
  letter-spacing: -0.02em;
}
.search-input {
  height: 40px;
  border: 1px solid #E5E5E5;
  border-radius: 0;
  padding: 0 14px;
  font-size: 0.88rem;
  font-family: inherit;
  width: 240px;
  transition: border-color 0.15s;
}
.search-input:focus { outline: none; border-color: #000; }

/* Content */
.admin-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px 80px;
}

/* Stats row */
.stats-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}
.stat-card {
  border: 1px solid #E5E5E5;
  padding: 20px;
  text-align: center;
}
.stat-value {
  font-size: 1.8rem;
  font-weight: 900;
  color: #000;
  letter-spacing: -0.02em;
}
.stat-label {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #767676;
  margin-top: 4px;
}

/* Error */
.error-bar {
  background: #FEF2F2;
  border: 1px solid #FCA5A5;
  color: #DC2626;
  padding: 12px 16px;
  font-size: 0.88rem;
  font-weight: 600;
  margin-bottom: 20px;
}

/* Loading */
.loading-state {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #767676;
  font-size: 0.88rem;
  padding: 40px 0;
}
.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #E5E5E5;
  border-top-color: #000;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Table */
.table-wrap { overflow-x: auto; }
.user-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;
}
.user-table th {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #767676;
  padding: 10px 12px;
  border-bottom: 2px solid #000;
  text-align: left;
  white-space: nowrap;
}
.user-table td {
  padding: 12px;
  border-bottom: 1px solid #E5E5E5;
  color: #1F2937;
  vertical-align: middle;
}
.user-table tr:hover td { background: #F9F9F9; }

.col-id { color: #767676; font-size: 0.75rem; width: 60px; }
.col-name { font-weight: 600; }
.col-email { color: #555; }
.col-date { color: #767676; white-space: nowrap; }

.provider-badge {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 3px 8px;
  border: 1px solid #E5E5E5;
  color: #555;
}

.role-select {
  border: 1px solid #E5E5E5;
  border-radius: 0;
  padding: 5px 10px;
  font-size: 0.78rem;
  font-family: inherit;
  font-weight: 600;
  background: #fff;
  cursor: pointer;
  transition: border-color 0.15s;
}
.role-select:focus { outline: none; border-color: #000; }
.role-select:disabled { opacity: 0.5; cursor: not-allowed; }
.verify-btn { border:1px solid #2A55F5; background:#fff; color:#2A55F5; padding:5px 8px; font-size:.7rem; cursor:pointer; }
.verify-btn:disabled { opacity:.5; cursor:not-allowed; }

.sub-badge {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 3px 8px;
}
.sub-active { background: #000; color: #fff; }
.sub-none { color: #767676; }

.empty-row { text-align: center; color: #767676; padding: 40px; }

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 24px 0 0;
}
.page-btn {
  height: 36px;
  padding: 0 16px;
  border: 1px solid #E5E5E5;
  background: #fff;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
}
.page-btn:hover:not(:disabled) { border-color: #000; }
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.page-info { font-size: 0.82rem; color: #767676; font-weight: 600; }

/* Responsive */
@media (max-width: 768px) {
  .stats-row { grid-template-columns: repeat(3, 1fr); }
  .search-input { width: 100%; }
  .admin-header-inner { flex-direction: column; align-items: flex-start; }
}
@media (max-width: 480px) {
  .stats-row { grid-template-columns: repeat(2, 1fr); }
  .admin-content { padding: 20px 16px 80px; }
}
</style>
