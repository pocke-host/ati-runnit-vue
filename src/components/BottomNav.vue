<template>
  <nav class="bottom-nav" v-if="isAuthenticated">
    <!-- Coach tabs — 4 items max -->
    <template v-if="role === 'coach'">
      <router-link to="/coach/dashboard" class="tab-item" active-class="tab-active">
        <i class="bi bi-grid-3x3-gap-fill tab-icon"></i>
        <span class="tab-label">Hub</span>
      </router-link>
      <router-link to="/coach/athletes" class="tab-item" active-class="tab-active">
        <i class="bi bi-people-fill tab-icon"></i>
        <span class="tab-label">Roster</span>
      </router-link>
      <router-link to="/coach/library" class="tab-item tab-track">
        <div class="track-circle">
          <i class="bi bi-collection-fill"></i>
        </div>
        <span class="tab-label">Library</span>
      </router-link>
      <router-link to="/calendar" class="tab-item" active-class="tab-active">
        <i class="bi bi-calendar3 tab-icon"></i>
        <span class="tab-label">Calendar</span>
      </router-link>
    </template>

    <!-- Athlete tabs — 5 items, Track centered -->
    <template v-else>
      <router-link to="/dashboard" class="tab-item" active-class="tab-active">
        <i class="bi bi-grid-3x3-gap-fill tab-icon"></i>
        <span class="tab-label">Home</span>
      </router-link>
      <router-link to="/feed" class="tab-item" active-class="tab-active">
        <i class="bi bi-collection-fill tab-icon"></i>
        <span class="tab-label">Feed</span>
      </router-link>
      <router-link to="/track" class="tab-item tab-track">
        <div class="track-circle">
          <i class="bi bi-play-fill"></i>
        </div>
        <span class="tab-label">Track</span>
      </router-link>
      <router-link to="/plans" class="tab-item" active-class="tab-active">
        <i class="bi bi-calendar-week-fill tab-icon"></i>
        <span class="tab-label">Plans</span>
      </router-link>
      <router-link v-if="userId" :to="`/profile/${userId}`" class="tab-item" active-class="tab-active">
        <i class="bi bi-person-fill tab-icon"></i>
        <span class="tab-label">Profile</span>
      </router-link>
      <button v-else class="tab-item" disabled style="opacity:0.4; background:none; border:none; cursor:default">
        <i class="bi bi-person-fill tab-icon"></i>
        <span class="tab-label">Profile</span>
      </button>
    </template>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

const authStore = useAuthStore()
const { isAuthenticated, user, role } = storeToRefs(authStore)
const userId = computed(() => user.value?.id)
</script>

<style scoped>
.bottom-nav {
  display: none; /* hidden on desktop */
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: auto;
  padding-bottom: env(safe-area-inset-bottom, 0px);
  z-index: 900;
  background: #fff;
  border-top: 1px solid #E5E5E5;
  box-shadow: none;
  align-items: center;
  justify-content: space-around;
  padding: 0 8px env(safe-area-inset-bottom, 0px);
  font-family: Futura, "Avenir Next", system-ui, sans-serif;
}

@media (max-width: 768px) {
  .bottom-nav { display: flex; }
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  flex: 1;
  padding: 6px 2px;
  min-height: var(--tab-h, 64px);
  text-decoration: none;
  color: #A3A69F;
  transition: color 0.15s;
  min-width: 0;
}

.tab-item:hover { text-decoration: none; }

.tab-icon {
  font-size: 1.2rem;
  line-height: 1;
}

.tab-label {
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  line-height: 1;
}

.tab-active {
  color: #0052FF;
}

/* Track center tab */
.tab-track {
  color: #767676;
  flex-shrink: 0;
}

.track-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #0052FF;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 1.3rem;
  margin-top: -16px; /* rises above bar */
  box-shadow: none;
  transition: transform 0.15s;
  flex-shrink: 0;
}

.tab-track:hover .track-circle,
.tab-track.router-link-active .track-circle {
  transform: scale(1.06);
}

.tab-track .tab-label {
  margin-top: 2px;
}
</style>
