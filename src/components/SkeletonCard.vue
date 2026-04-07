<!-- src/components/SkeletonCard.vue — shimmer skeleton placeholders -->
<template>
  <!-- FEED VARIANT: tall card matching feed-card layout -->
  <div v-if="variant === 'feed'" class="sk-card sk-feed">
    <div class="sk-image sk-feed-image"></div>
    <div class="sk-body">
      <div class="sk-row">
        <div class="sk-avatar"></div>
        <div class="sk-lines">
          <div class="sk-line sk-line--60"></div>
          <div class="sk-line sk-line--40"></div>
        </div>
      </div>
      <div class="sk-line sk-line--80 mt"></div>
      <div class="sk-line sk-line--50 mt-sm"></div>
    </div>
  </div>

  <!-- CHALLENGE VARIANT: fixed-height card matching challenge-card -->
  <div v-else-if="variant === 'challenge'" class="sk-card sk-challenge">
    <div class="sk-image sk-challenge-image"></div>
    <div class="sk-body">
      <div class="sk-line sk-line--30 sk-badge"></div>
      <div class="sk-line sk-line--80 mt"></div>
      <div class="sk-line sk-line--60 mt-sm"></div>
      <div class="sk-line sk-line--40 mt-sm"></div>
      <div class="sk-btn mt"></div>
    </div>
  </div>

  <!-- ACTIVITY ROW VARIANT: compact horizontal row -->
  <div v-else-if="variant === 'activity-row'" class="sk-card sk-activity-row">
    <div class="sk-icon"></div>
    <div class="sk-lines sk-lines--full">
      <div class="sk-line sk-line--60"></div>
      <div class="sk-line sk-line--40 mt-sm"></div>
    </div>
    <div class="sk-stat-block">
      <div class="sk-line sk-line--full"></div>
      <div class="sk-line sk-line--full mt-sm"></div>
    </div>
  </div>

  <!-- MOMENT TILE VARIANT: square grid thumbnail -->
  <div v-else-if="variant === 'moment-tile'" class="sk-card sk-moment-tile"></div>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'feed', // 'feed' | 'challenge' | 'activity-row' | 'moment-tile'
  },
})
</script>

<style scoped>
/* ── Shimmer animation ── */
@keyframes sk-shimmer {
  from { background-position: -400px 0; }
  to   { background-position:  400px 0; }
}

.sk-card {
  border: 1px solid #E5E5E5;
  background: #fff;
  overflow: hidden;
}

/* All shimmered elements share this */
.sk-image,
.sk-line,
.sk-btn,
.sk-icon,
.sk-avatar,
.sk-badge {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 800px 100%;
  animation: sk-shimmer 1.4s ease-in-out infinite;
}

/* ── Feed variant ── */
.sk-feed { display: flex; flex-direction: column; }
.sk-feed-image { width: 100%; padding-top: 75%; }

/* ── Challenge variant ── */
.sk-challenge { display: flex; flex-direction: column; height: 100%; }
.sk-challenge-image { width: 100%; height: 200px; }

/* ── Activity row variant ── */
.sk-activity-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-left: none;
  border-right: none;
  border-top: none;
}
.sk-activity-row + .sk-activity-row { border-top: 1px solid #E5E5E5; }
.sk-icon {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
}
.sk-stat-block {
  margin-left: auto;
  width: 64px;
  flex-shrink: 0;
}

/* ── Moment tile variant ── */
.sk-moment-tile {
  aspect-ratio: 1 / 1;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 800px 100%;
  animation: sk-shimmer 1.4s ease-in-out infinite;
  border: none;
}

/* ── Shared body / line styles ── */
.sk-body { padding: 14px 16px; flex: 1; }
.sk-row  { display: flex; align-items: center; gap: 10px; }
.sk-avatar { width: 32px; height: 32px; flex-shrink: 0; border-radius: 50%; }
.sk-lines { flex: 1; display: flex; flex-direction: column; gap: 6px; }
.sk-lines--full { flex: 1; }

.sk-line { height: 10px; }
.sk-line--30  { width: 30%; }
.sk-line--40  { width: 40%; }
.sk-line--50  { width: 50%; }
.sk-line--60  { width: 60%; }
.sk-line--80  { width: 80%; }
.sk-line--full { width: 100%; }
.sk-badge { height: 8px; width: 30%; }
.sk-btn   { height: 36px; width: 100%; }

.mt    { margin-top: 10px; }
.mt-sm { margin-top: 6px; }
</style>
