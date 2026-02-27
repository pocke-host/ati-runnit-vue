<!-- MusicPlayer.vue — persistent mini-player bar shown during tracking -->
<template>
  <div class="music-player">
    <template v-if="musicStore.provider">
      <!-- Connected: show controls -->
      <div class="track-info" v-if="musicStore.currentTrack">
        <div class="track-art">
          <img v-if="musicStore.currentTrack.artUrl" :src="musicStore.currentTrack.artUrl" alt="Album art" />
          <i v-else class="bi bi-music-note-beamed"></i>
        </div>
        <div class="track-text">
          <div class="track-name">{{ musicStore.currentTrack.name }}</div>
          <div class="track-artist">{{ musicStore.currentTrack.artist }}</div>
        </div>
      </div>

      <div v-else class="track-info no-track">
        <i class="bi bi-music-note-beamed"></i>
        <span>No track playing</span>
      </div>

      <div class="controls">
        <button class="ctrl-btn" @click="musicStore.previous()"><i class="bi bi-skip-backward-fill"></i></button>
        <button class="ctrl-btn play-btn" @click="togglePlay">
          <i :class="`bi bi-${musicStore.isPlaying ? 'pause-fill' : 'play-fill'}`"></i>
        </button>
        <button class="ctrl-btn" @click="musicStore.next()"><i class="bi bi-skip-forward-fill"></i></button>
      </div>

      <div class="provider-badge" :class="musicStore.provider">
        <i :class="musicStore.provider === 'spotify' ? 'bi bi-spotify' : 'bi bi-apple'"></i>
      </div>
    </template>

    <!-- Not connected: connect prompt -->
    <template v-else>
      <div class="connect-row">
        <i class="bi bi-music-note-beamed"></i>
        <span>Connect music for in-run playback</span>
        <button class="btn-connect spotify" @click="musicStore.connectSpotify()">
          <i class="bi bi-spotify"></i> Spotify
        </button>
        <button class="btn-connect apple" @click="musicStore.connectAppleMusic()">
          <i class="bi bi-apple"></i> Apple Music
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useMusicStore } from '@/stores/music'

const musicStore = useMusicStore()

const togglePlay = () => {
  if (musicStore.isPlaying) musicStore.pause()
  else musicStore.play()
}

onMounted(async () => {
  await musicStore.checkConnection()
})
</script>

<style scoped>
.music-player {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(15,18,16,.90);
  backdrop-filter: blur(12px);
  border-radius: 16px;
  padding: 10px 14px;
  border: 1px solid rgba(255,255,255,.1);
  color: white;
}

.track-info { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
.track-art { width: 36px; height: 36px; border-radius: 8px; background: rgba(255,255,255,.12); display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; }
.track-art img { width: 100%; height: 100%; object-fit: cover; }
.track-art i { font-size: 1.1rem; color: rgba(255,255,255,.5); }
.track-text { min-width: 0; }
.track-name { font-weight: 800; font-size: .85rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.track-artist { font-size: .75rem; color: rgba(255,255,255,.6); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.no-track { color: rgba(255,255,255,.5); font-size: .85rem; gap: 8px; }

.controls { display: flex; align-items: center; gap: 6px; }
.ctrl-btn { width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,.1); border: none; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: .85rem; transition: background .15s; }
.ctrl-btn:hover { background: rgba(255,255,255,.2); }
.play-btn { width: 40px; height: 40px; font-size: 1rem; background: rgba(255,255,255,.2); }

.provider-badge { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1rem; }
.provider-badge.spotify { background: #1DB954; }
.provider-badge.apple { background: #fc3c44; }

.connect-row { display: flex; align-items: center; gap: 10px; flex: 1; flex-wrap: wrap; }
.connect-row i { font-size: 1.2rem; color: rgba(255,255,255,.6); }
.connect-row span { flex: 1; font-size: .82rem; color: rgba(255,255,255,.7); }
.btn-connect { padding: 7px 12px; border-radius: 999px; border: none; font-size: .78rem; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 5px; transition: opacity .2s; }
.btn-connect:hover { opacity: .85; }
.btn-connect.spotify { background: #1DB954; color: white; }
.btn-connect.apple { background: #fc3c44; color: white; }
</style>
