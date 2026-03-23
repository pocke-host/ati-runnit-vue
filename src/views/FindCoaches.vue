<template>
  <main class="find-coaches">
    <!-- Hero -->
    <section class="hero">
      <div class="hero-inner">
        <div class="hero-kicker">RUNNIT COACHING</div>
        <h1 class="hero-title">FIND A COACH</h1>
        <p class="hero-sub">Connect with expert coaches who'll take your training to the next level.</p>
      </div>
    </section>

    <div class="content-wrap">
      <!-- My Coach Banner -->
      <div v-if="myCoach" class="my-coach-banner">
        <div class="banner-label">YOUR COACH</div>
        <div class="banner-body">
          <div class="coach-avatar-sm">{{ (myCoach.displayName || '?')[0].toUpperCase() }}</div>
          <span class="banner-name">{{ myCoach.displayName }}</span>
          <button class="btn-dm" @click="openDM">Message →</button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="empty-state">
        <div class="spinner-border spinner-border-sm me-2"></div> Loading coaches...
      </div>

      <!-- Empty -->
      <div v-else-if="coaches.length === 0" class="empty-state">
        <i class="bi bi-person-badge empty-icon"></i>
        <p>No coaches available yet. Check back soon.</p>
      </div>

      <!-- Coach Grid -->
      <div v-else class="coach-grid">
        <div v-for="coach in coaches" :key="coach.id" class="coach-card">
          <div class="coach-avatar">{{ (coach.displayName || '?')[0].toUpperCase() }}</div>
          <div class="coach-info">
            <div class="coach-name">{{ coach.displayName }}</div>
            <div class="coach-meta">
              <span class="coach-ath-count">{{ coach.athleteCount || 0 }} athletes</span>
            </div>
            <div class="sports-chips">
              <span v-for="sport in (coach.sportsCoached || [])" :key="sport" class="sport-chip">{{ sport }}</span>
            </div>
          </div>
          <div class="coach-action">
            <template v-if="myCoach">
              <!-- Already has a coach, hide request buttons -->
            </template>
            <button
              v-else-if="requestSentToId === coach.id"
              class="btn-requested"
              disabled
            >Request Sent</button>
            <button
              v-else
              class="btn-request"
              @click="sendRequest(coach.id)"
              :disabled="actionLoading === coach.id"
            >
              <span v-if="actionLoading === coach.id" class="spinner-border spinner-border-sm"></span>
              <span v-else>Request to Join</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAthleteStore } from '@/stores/athlete'
import { useDMStore } from '@/stores/dm'

const athleteStore = useAthleteStore()
const dmStore = useDMStore()
const { coaches, myCoach, requestSentToId, loading } = storeToRefs(athleteStore)

const actionLoading = ref(null)

const sendRequest = async (coachId) => {
  actionLoading.value = coachId
  try {
    await athleteStore.sendRequest(coachId)
  } catch {}
  actionLoading.value = null
}

const openDM = () => {
  if (myCoach.value) dmStore.openConversation?.(myCoach.value)
  else dmStore.open()
}

onMounted(() => {
  athleteStore.fetchCoaches()
  athleteStore.fetchMyCoach()
})
</script>

<style scoped>
.find-coaches {
  min-height: 100vh;
  background: #fff;
  padding-top: var(--nav-h, 64px);
  font-family: "Futura PT", Futura, "Century Gothic", system-ui, sans-serif;
}

.hero { background: #000; color: #fff; padding: 56px 24px 48px; }
.hero-inner { max-width: 900px; margin: 0 auto; }
.hero-kicker { font-size: 0.7rem; letter-spacing: 0.20em; color: rgba(255,255,255,0.5); text-transform: uppercase; margin-bottom: 8px; }
.hero-title { font-size: clamp(2.2rem, 6vw, 4rem); font-weight: 900; letter-spacing: -0.02em; margin: 0 0 16px; }
.hero-sub { font-size: 1rem; color: rgba(255,255,255,0.65); max-width: 480px; line-height: 1.5; margin: 0; }

.content-wrap { max-width: 900px; margin: 0 auto; padding: 40px 24px; }

/* My Coach Banner */
.my-coach-banner {
  padding: 20px 24px;
  border: 2px solid #000;
  margin-bottom: 32px;
}
.banner-label { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.14em; color: #767676; text-transform: uppercase; margin-bottom: 10px; }
.banner-body { display: flex; align-items: center; gap: 12px; }
.coach-avatar-sm { width: 36px; height: 36px; background: #000; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.95rem; }
.banner-name { font-weight: 700; font-size: 0.95rem; flex: 1; }
.btn-dm { padding: 8px 18px; background: #0052FF; color: #fff; border: none; font-size: 0.78rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer; }
.btn-dm:hover { background: #003ECC; }

/* Coach grid */
.coach-grid { display: flex; flex-direction: column; gap: 12px; }
.coach-card { display: flex; align-items: flex-start; gap: 16px; padding: 20px; border: 1px solid #E5E5E5; }
.coach-avatar { width: 52px; height: 52px; background: #000; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.4rem; flex-shrink: 0; }
.coach-info { flex: 1; min-width: 0; }
.coach-name { font-weight: 700; font-size: 1rem; margin-bottom: 4px; }
.coach-meta { font-size: 0.78rem; color: #767676; margin-bottom: 10px; }
.sports-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.sport-chip { padding: 3px 10px; border: 1px solid #E5E5E5; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: #000; }
.coach-action { display: flex; align-items: center; padding-top: 4px; }
.btn-request {
  padding: 10px 20px; background: #0052FF; color: #fff; border: none;
  font-size: 0.78rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
  cursor: pointer; white-space: nowrap;
}
.btn-request:hover { background: #003ECC; }
.btn-request:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-requested {
  padding: 10px 20px; background: #fff; color: #767676;
  border: 1px solid #E5E5E5; font-size: 0.78rem; font-weight: 600; cursor: not-allowed;
}

.empty-state { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 60px 24px; color: #767676; text-align: center; }
.empty-icon { font-size: 2.5rem; }
.empty-state p { font-size: 0.9rem; margin: 0; }

.spinner-border { width: 1rem; height: 1rem; border: 2px solid rgba(0,0,0,0.10); border-top-color: #000; border-radius: 50%; animation: spin 0.75s linear infinite; display: inline-block; }
.spinner-border-sm { width: 0.85rem; height: 0.85rem; }
.me-2 { margin-right: 8px; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
