// ========== MomentCard.vue ==========
<template>
  <div class="moment-card">
    <!-- User Header -->
    <div class="moment-header">
      <div class="user-info">
        <img 
          :src="moment.userAvatarUrl || '/default-avatar.png'" 
          :alt="moment.userDisplayName"
          class="user-avatar"
        />
        <div>
          <h5 class="mb-0">{{ moment.userDisplayName }}</h5>
          <small class="text-muted">{{ formatDate(moment.createdAt) }}</small>
        </div>
      </div>
    </div>

    <!-- Media (photo or video) -->
    <div class="moment-media">
      <video
        v-if="moment.videoUrl || (moment.photoUrl && (moment.photoUrl.includes('.mp4') || moment.photoUrl.includes('.mov') || moment.photoUrl.includes('.webm')))"
        :src="moment.videoUrl || moment.photoUrl"
        controls
        playsinline
        preload="metadata"
        class="moment-video"
      ></video>
      <img
        v-else-if="moment.photoUrl"
        :src="moment.photoUrl"
        :alt="`${moment.userDisplayName}'s moment`"
        loading="lazy"
        class="moment-img"
      />
    </div>

    <!-- Song Info (only when present) -->
    <div class="moment-content">
      <div v-if="moment.songTitle" class="song-info">
        <i class="bi bi-music-note-beamed me-2"></i>
        <strong>{{ moment.songTitle }}</strong>
        <span v-if="moment.songArtist"> - {{ moment.songArtist }}</span>
        <a v-if="moment.songLink" :href="moment.songLink" target="_blank" class="ms-2">
          <i class="bi bi-spotify"></i>
        </a>
      </div>

      <!-- Reactions -->
      <div class="reactions">
        <button 
          @click="handleReaction('LIKE')"
          :class="{ active: moment.currentUserReaction === 'LIKE' }"
          class="reaction-btn"
        >
          ❤️
        </button>
        <button 
          @click="handleReaction('FIRE')"
          :class="{ active: moment.currentUserReaction === 'FIRE' }"
          class="reaction-btn"
        >
          🔥
        </button>
        <button 
          @click="handleReaction('CLAP')"
          :class="{ active: moment.currentUserReaction === 'CLAP' }"
          class="reaction-btn"
        >
          👏
        </button>
        <span class="reaction-count">{{ moment.reactionCount }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useMomentStore } from '@/stores/moment'

const props = defineProps({
  moment: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['reaction-changed'])

const momentStore = useMomentStore()

const handleReaction = async (type) => {
  if (props.moment.currentUserReaction === type) {
    // Remove reaction if clicking same one
    await momentStore.removeReaction(props.moment.id)
  } else {
    // Add or update reaction
    await momentStore.addReaction(props.moment.id, type)
  }
  emit('reaction-changed')
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  const hours = Math.floor(diff / (1000 * 60 * 60))
  
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  return date.toLocaleDateString()
}
</script>

<style scoped>
.moment-card {
  background: white;
  border-radius: 0;
  overflow: hidden;
  box-shadow: none;
  border: 2px solid #E7DFCE;
}

.moment-header {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.moment-media {
  width: 100%;
  background: #16130F;
  border-top: 2px solid #16130F;
  border-bottom: 2px solid #16130F;
}
.moment-img {
  width: 100%;
  height: auto;
  max-height: 600px;
  object-fit: cover;
  display: block;
}
.moment-video {
  width: 100%;
  max-height: 480px;
  display: block;
  background: #000;
}

.moment-content {
  padding: 16px;
}

.song-info {
  margin-bottom: 16px;
  font-size: 14px;
}

.reactions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.reaction-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  opacity: 0.5;
  transition: all 0.2s;
  padding: 4px 8px;
}

.reaction-btn:hover {
  opacity: 1;
  transform: scale(1.2);
}

.reaction-btn.active {
  opacity: 1;
  transform: scale(1.1);
}

.reaction-count {
  margin-left: 8px;
  color: #6c757d;
  font-weight: 600;
}
</style>