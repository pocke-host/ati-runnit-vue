<template>
  <div class="feed-container">
    <div class="feed-header">
      <h2>Your Feed</h2>
      <router-link to="/log-activity" class="btn btn-primary">
        <i class="bi bi-plus-circle me-2"></i>Log Activity
      </router-link>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>

    <div v-else-if="feed.length === 0" class="empty-state">
      <i class="bi bi-heart-pulse" style="font-size: 64px; color: #ccc;"></i>
      <p>No moments yet. Follow friends or create your first moment!</p>
      <router-link to="/log-activity" class="btn btn-primary">
        Get Started
      </router-link>
    </div>

    <div v-else class="moments-grid">
      <MomentCard 
        v-for="moment in feed" 
        :key="moment.id" 
        :moment="moment"
        @reaction-changed="handleReactionChanged"
      />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useMomentStore } from '@/stores/moment'
import { storeToRefs } from 'pinia'
import MomentCard from './MomentCard.vue'

const momentStore = useMomentStore()
const { feed, loading } = storeToRefs(momentStore)

onMounted(() => {
  momentStore.fetchFeed()
})

const handleReactionChanged = () => {
  // Refresh feed to get updated reactions
  momentStore.fetchFeed()
}
</script>

<style scoped>
.feed-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.feed-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #6c757d;
}

.empty-state i {
  margin-bottom: 20px;
}

.moments-grid {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.btn-primary {
  background: #800080;
  border-color: #800080;
}

.btn-primary:hover {
  background: #6a006a;
  border-color: #6a006a;
}
</style>