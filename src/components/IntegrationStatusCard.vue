<template>
  <article class="integration-card" :class="{ 'integration-card--attention': needsReconnect || stale }">
    <div class="integration-card__icon"><i :class="icon" aria-hidden="true"></i></div>
    <div class="integration-card__copy"><strong>{{ name }}</strong><span>{{ needsReconnect ? 'Needs reconnect' : connected ? (stale ? 'Needs a sync' : 'Connected') : 'Not connected' }}</span><small>{{ connected && lastSync ? `Last sync ${relativeTime(lastSync)}` : connected ? 'Waiting for first sync' : 'Permission not granted' }}</small></div>
    <router-link v-if="needsReconnect || !connected" to="/devices" class="integration-card__action">{{ needsReconnect ? 'Reconnect' : 'Connect' }}</router-link><span v-else class="integration-card__ok" aria-label="Connected">✓</span>
  </article>
</template>
<script setup>
defineProps({ name: { type: String, required: true }, icon: { type: String, default: 'bi bi-link-45deg' }, connected: Boolean, needsReconnect: Boolean, stale: Boolean, lastSync: { type: [String, Number], default: '' } })
const relativeTime = value => { const minutes = Math.max(1, Math.round((Date.now() - new Date(value).getTime()) / 60000)); if (minutes < 60) return `${minutes}m ago`; const hours = Math.round(minutes / 60); if (hours < 48) return `${hours}h ago`; return `${Math.round(hours / 24)}d ago` }
</script>
<style scoped>
.integration-card{display:flex;align-items:center;gap:10px;min-width:0;padding:12px;background:#24211c;border:1px solid #4a453c;color:#fbf6ec}.integration-card--attention{border-color:#ffc53d}.integration-card__icon{display:grid;place-items:center;flex:0 0 30px;width:30px;height:30px;background:#2a55f5;color:#fff}.integration-card__copy{display:flex;flex:1;min-width:0;flex-direction:column;gap:2px}.integration-card__copy strong{font-size:.82rem}.integration-card__copy span,.integration-card__copy small{color:#c7bfae;font-size:.68rem}.integration-card__copy small{color:#938b7c}.integration-card__action{color:#ffc53d;font:700 .62rem 'Spline Sans Mono',monospace;text-transform:uppercase;white-space:nowrap}.integration-card__ok{color:#7be495;font:700 .9rem 'Spline Sans Mono',monospace}
</style>
