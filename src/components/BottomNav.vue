<template>
  <nav class="bottom-nav" v-if="isAuthenticated">
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

    <router-link to="/stats" class="tab-item" active-class="tab-active">
      <i class="bi bi-bar-chart-fill tab-icon"></i>
      <span class="tab-label">Stats</span>
    </router-link>

    <router-link :to="userId ? `/profile/${userId}` : '/dashboard'" class="tab-item" active-class="tab-active">
      <i class="bi bi-person-fill tab-icon"></i>
      <span class="tab-label">Me</span>
    </router-link>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

const authStore = useAuthStore()
const { isAuthenticated, user } = storeToRefs(authStore)
const userId = computed(() => user.value?.id)
</script>

<style scoped>
.bottom-nav {
  display: none; /* hidden on desktop */
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: var(--tab-h, 64px);
  z-index: 900;
  background: var(--rk-surface, #FDFAF5);
  border-top: 1px solid var(--rk-rule, #DDD7CC);
  box-shadow: none;
  align-items: center;
  justify-content: space-around;
  padding: 0 8px;
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
  gap: 3px;
  flex: 1;
  padding: 8px 4px;
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
  font-size: 0.55rem;
  font-weight: 600;
  letter-spacing: 0.10em;
  text-transform: uppercase;
  line-height: 1;
}

/* Active state — deep indigo */
.tab-active {
  color: var(--rk-void, #14102A);
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
  background: var(--rk-signal, #C8872A);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--rk-void, #14102A);
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
