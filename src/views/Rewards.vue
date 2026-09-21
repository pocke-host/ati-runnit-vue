<template>
  <main class="rewards-page">
    <section class="rewards-hero">
      <div class="rewards-wrap">
        <p class="eyebrow">Runnit rewards</p>
        <div class="hero-row"><div><h1>Put your miles<br>back into you.</h1><p>Earn points from training and turn consistency into useful rewards.</p></div><div class="balance"><span>Your balance</span><strong>{{ balance.toLocaleString() }}</strong><small>points</small></div></div>
      </div>
    </section>
    <section class="rewards-body rewards-wrap">
      <div v-if="loading" class="state">Loading your rewards…</div>
      <div v-else-if="error" class="state state-error">{{ error }} <button @click="load">Retry</button></div>
      <template v-else>
        <div class="section-head"><div><p class="eyebrow">The catalog</p><h2>Choose your reward</h2></div><span class="section-note">Workouts earn points automatically.</span></div>
        <div class="reward-grid">
          <article v-for="reward in catalog" :key="reward.id" class="reward-card">
            <div class="reward-art" :class="`reward-art--${reward.category.toLowerCase()}`"><span>{{ iconFor(reward.category) }}</span></div>
            <div class="reward-copy"><div class="reward-meta"><span>{{ reward.category }}</span><span v-if="reward.inventory !== null && reward.inventory !== undefined">{{ reward.inventory }} left</span></div><h3>{{ reward.title }}</h3><p>{{ reward.description }}</p>
              <div class="reward-action"><button v-if="reward.rewardType !== 'PAID'" class="redeem-btn" :disabled="balance < reward.pointsCost" @click="openRedeem(reward)">{{ balance >= reward.pointsCost ? `Redeem · ${reward.pointsCost.toLocaleString()} pts` : `${(reward.pointsCost - balance).toLocaleString()} pts to go` }}</button><a v-else-if="reward.purchaseUrl" :href="reward.purchaseUrl" target="_blank" rel="noopener" class="buy-btn">Buy from partner · {{ formatPrice(reward.priceCents) }}</a><span v-else class="buy-btn buy-btn--disabled">Partner purchase coming soon</span></div>
            </div>
          </article>
        </div>
        <div class="section-head section-head--history"><div><p class="eyebrow">Your history</p><h2>Recent rewards</h2></div></div>
        <div v-if="!redemptions.length" class="empty-history">Your first reward is waiting. Keep training.</div>
        <div v-else class="history-list"><div v-for="item in redemptions" :key="item.id" class="history-row"><div><strong>{{ item.title }}</strong><span>{{ formatDate(item.createdAt) }}</span></div><b>-{{ item.pointsCost }} pts</b><em>{{ item.status }}</em></div></div>
      </template>
    </section>
    <div v-if="selected" class="modal-backdrop" @click.self="selected = null"><form class="redeem-modal" @submit.prevent="redeem"><button type="button" class="modal-close" @click="selected = null">×</button><p class="eyebrow">Redeem reward</p><h2>{{ selected.title }}</h2><p>{{ selected.description }}</p><template v-if="selected.category !== 'DIGITAL'"><label>Shipping name<input v-model.trim="shipping.shippingName" required maxlength="160"></label><label>Shipping address<textarea v-model.trim="shipping.shippingAddress" required maxlength="1000" rows="3"></textarea></label></template><button class="redeem-btn redeem-btn--full" :disabled="redeeming">{{ redeeming ? 'Submitting…' : `Confirm · ${selected.pointsCost.toLocaleString()} points` }}</button><p v-if="redeemError" class="state-error">{{ redeemError }}</p></form></div>
  </main>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` })
const balance = ref(0), catalog = ref([]), redemptions = ref([]), loading = ref(true), error = ref(''), selected = ref(null), redeeming = ref(false), redeemError = ref('')
const shipping = ref({ shippingName: '', shippingAddress: '' })
const load = async () => { loading.value = true; error.value = ''; try { const { data } = await axios.get(`${API_URL}/rewards`, { headers: headers() }); balance.value = data.balance || 0; catalog.value = data.catalog || []; redemptions.value = data.redemptions || [] } catch (e) { error.value = e.response?.data?.error || 'Rewards are temporarily unavailable.' } finally { loading.value = false } }
const openRedeem = reward => { selected.value = reward; redeemError.value = ''; shipping.value = { shippingName: '', shippingAddress: '' } }
const redeem = async () => { redeeming.value = true; redeemError.value = ''; try { await axios.post(`${API_URL}/rewards/${selected.value.id}/redeem`, shipping.value, { headers: headers() }); selected.value = null; await load() } catch (e) { redeemError.value = e.response?.data?.error || 'Could not redeem this reward.' } finally { redeeming.value = false } }
const iconFor = category => ({ DIGITAL: '✦', PARTNER: '↗', APPAREL: '◒', SUPPLEMENTS: '＋' }[category] || '✦')
const formatPrice = cents => cents == null ? '' : `$${(cents / 100).toFixed(2)}`
const formatDate = value => value ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''
onMounted(load)
</script>
<style scoped>
.rewards-page{min-height:100vh;background:#fbf6ec;color:#16130f;padding-top:var(--page-top)}.rewards-wrap{max-width:1080px;margin:auto}.rewards-hero{background:#16130f;color:#fbf6ec;padding:64px 24px 58px}.eyebrow{font:700 .68rem 'Spline Sans Mono',monospace;letter-spacing:.18em;text-transform:uppercase;color:#8f9fff}.hero-row{display:flex;justify-content:space-between;align-items:end;gap:24px}.rewards-hero h1{font-size:clamp(2.8rem,7vw,5.6rem);line-height:.92;letter-spacing:-.04em;margin:12px 0 18px}.rewards-hero p:not(.eyebrow){max-width:420px;color:#c9c3b8;margin:0}.balance{border:2px solid #ffc53d;background:#ffc53d;color:#16130f;padding:18px 22px;min-width:180px;transform:rotate(2deg);display:flex;flex-direction:column}.balance span,.balance small{font:700 .65rem 'Spline Sans Mono',monospace;text-transform:uppercase}.balance strong{font:800 3rem/1 'Big Shoulders Display',system-ui;margin:6px 0}.rewards-body{padding:42px 24px 80px}.section-head{display:flex;align-items:end;justify-content:space-between;gap:16px;margin-bottom:20px}.section-head h2{font-size:2rem;margin:7px 0 0}.section-note{font:600 .68rem 'Spline Sans Mono',monospace;color:#665f55}.reward-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.reward-card{background:#fff;border:2px solid #16130f;box-shadow:5px 5px 0 #16130f}.reward-art{height:150px;display:grid;place-items:center;border-bottom:2px solid #16130f;font-size:4rem}.reward-art--digital{background:#dce5ff}.reward-art--partner{background:#ffc53d}.reward-art--apparel{background:#d8efe4}.reward-art--supplements{background:#f4d9d1}.reward-copy{padding:18px}.reward-meta{display:flex;justify-content:space-between;color:#665f55;font:700 .62rem 'Spline Sans Mono',monospace;text-transform:uppercase}.reward-copy h3{font-size:1.25rem;margin:10px 0 8px}.reward-copy p{color:#665f55;font-size:.86rem;min-height:58px}.reward-action{margin-top:16px}.redeem-btn,.buy-btn{display:inline-block;border:2px solid #16130f;background:#2a55f5;color:#fff;padding:12px 14px;font:700 .68rem 'Spline Sans Mono',monospace;text-transform:uppercase;text-decoration:none;cursor:pointer}.redeem-btn:disabled{background:#c9c3b8;cursor:not-allowed}.buy-btn{background:#ffc53d;color:#16130f}.section-head--history{margin-top:62px}.empty-history,.history-list{border:2px solid #e7dfce;background:#fff}.empty-history{padding:28px;color:#665f55}.history-row{display:grid;grid-template-columns:1fr auto auto;gap:20px;align-items:center;padding:16px 18px;border-bottom:1px solid #e7dfce}.history-row:last-child{border-bottom:0}.history-row div{display:flex;flex-direction:column;gap:4px}.history-row span,.history-row em{font:600 .65rem 'Spline Sans Mono',monospace;color:#8a8a8a;text-transform:uppercase}.history-row b{font:700 .75rem 'Spline Sans Mono',monospace}.history-row em{font-style:normal;color:#2a55f5}.modal-backdrop{position:fixed;inset:0;background:rgba(22,19,15,.65);display:grid;place-items:center;padding:20px;z-index:50}.redeem-modal{position:relative;max-width:480px;width:100%;background:#fff;border:2px solid #16130f;box-shadow:7px 7px 0 #16130f;padding:28px}.redeem-modal h2{font-size:2rem;margin:8px 0}.redeem-modal label{display:block;font:700 .68rem 'Spline Sans Mono',monospace;text-transform:uppercase;margin:16px 0}.redeem-modal input,.redeem-modal textarea{display:block;width:100%;box-sizing:border-box;border:2px solid #16130f;padding:11px;margin-top:7px;font:14px inherit}.redeem-btn--full{width:100%;margin-top:8px}.modal-close{position:absolute;right:12px;top:8px;border:0;background:none;font-size:28px;cursor:pointer}.state{padding:60px 0;color:#665f55}.state-error{color:#a33b2a}.state-error button{border:0;background:none;color:#2a55f5;text-decoration:underline;cursor:pointer}@media(max-width:800px){.hero-row{align-items:flex-start;flex-direction:column}.balance{align-self:flex-end}.reward-grid{grid-template-columns:1fr 1fr}}@media(max-width:560px){.reward-grid{grid-template-columns:1fr}.section-head{align-items:flex-start;flex-direction:column}.history-row{grid-template-columns:1fr auto}.history-row em{grid-column:1/-1}}
.buy-btn--disabled{background:#e7dfce;color:#665f55;cursor:default}
</style>
