<template>
  <main class="fuel-page">
    <section class="fuel-hero">
      <div>
        <p class="fuel-eyebrow">Fuel your training</p>
        <h1>Eat for the work ahead.</h1>
        <p class="fuel-hero-copy">A private, simple way to see what supports your sessions, recovery, and next start line.</p>
      </div>
      <div class="fuel-hero-note">
        <span class="fuel-note-label">Today</span>
        <strong>{{ formatDateLabel(selectedDate) }}</strong>
        <span>Manual entries first. Connected food sources can follow.</span>
      </div>
    </section>

    <section class="fuel-body">
      <div class="fuel-toolbar">
        <div>
          <p class="fuel-eyebrow fuel-eyebrow--dark">Your daily view</p>
          <h2>Keep the signal. Skip the guilt.</h2>
        </div>
        <input v-model="selectedDate" type="date" class="fuel-date" aria-label="Choose a date to view nutrition" @change="loadDay" />
      </div>

      <div v-if="error" class="fuel-alert" role="alert">
        <span>{{ error }}</span>
        <button class="fuel-inline-action" @click="loadDay">Retry</button>
      </div>

      <div class="fuel-summary-grid" aria-label="Daily nutrition summary">
        <article class="fuel-summary fuel-summary--primary">
          <span class="fuel-summary-label">Energy logged</span>
          <strong>{{ Math.round(totals.caloriesKcal || 0) }}</strong>
          <small>kcal · add a goal only if it helps</small>
        </article>
        <article class="fuel-summary"><span class="fuel-summary-label">Protein</span><strong>{{ formatNumber(totals.proteinGrams) }}g</strong><small>logged today</small></article>
        <article class="fuel-summary"><span class="fuel-summary-label">Carbs</span><strong>{{ formatNumber(totals.carbsGrams) }}g</strong><small>training fuel</small></article>
        <article class="fuel-summary"><span class="fuel-summary-label">Fat</span><strong>{{ formatNumber(totals.fatGrams) }}g</strong><small>logged today</small></article>
      </div>

      <div class="fuel-layout">
        <section class="fuel-card fuel-card--log" aria-labelledby="add-food-title">
          <div class="fuel-card-heading">
            <div><p class="fuel-eyebrow fuel-eyebrow--dark">Quick add</p><h2 id="add-food-title">Log what you ate.</h2></div>
            <span class="fuel-private">Private by default</span>
          </div>

          <form class="fuel-form" @submit.prevent="saveEntry">
            <label class="fuel-field fuel-field--wide">Food or drink<input v-model.trim="form.foodName" required maxlength="255" placeholder="Oats, coffee, recovery shake…" /></label>
            <label class="fuel-field">Meal<select v-model="form.mealType"><option v-for="meal in mealTypes" :key="meal.value" :value="meal.value">{{ meal.label }}</option></select></label>
            <label class="fuel-field">Time<input v-model="form.loggedAt" type="datetime-local" required /></label>
            <label class="fuel-field">Serving<input v-model.number="form.servingQuantity" type="number" min="0.01" step="0.01" /></label>
            <label class="fuel-field">Unit<input v-model.trim="form.servingUnit" maxlength="50" placeholder="bowl, cup, piece" /></label>
            <div class="fuel-form-rule"><span>Nutrition (optional)</span><small>Add what you know. RUNNIT will never pretend an estimate is exact.</small></div>
            <label class="fuel-field">Calories<input v-model.number="form.caloriesKcal" type="number" min="0" max="100000" placeholder="kcal" /></label>
            <label class="fuel-field">Protein<input v-model.number="form.proteinGrams" type="number" min="0" step="0.1" placeholder="grams" /></label>
            <label class="fuel-field">Carbs<input v-model.number="form.carbsGrams" type="number" min="0" step="0.1" placeholder="grams" /></label>
            <label class="fuel-field">Fat<input v-model.number="form.fatGrams" type="number" min="0" step="0.1" placeholder="grams" /></label>
            <label class="fuel-field fuel-field--wide">Note (optional)<input v-model.trim="form.notes" maxlength="500" placeholder="Before the long run, post-lift, on the road…" /></label>
            <button class="fuel-submit" type="submit" :disabled="saving">{{ saving ? 'Saving…' : 'Add to today →' }}</button>
          </form>
        </section>

        <section class="fuel-card fuel-card--history" aria-labelledby="food-log-title">
          <div class="fuel-card-heading"><div><p class="fuel-eyebrow fuel-eyebrow--dark">Your log</p><h2 id="food-log-title">{{ loading ? 'Loading…' : entries.length ? 'What’s in the day.' : 'Nothing logged yet.' }}</h2></div></div>
          <div v-if="loading" class="fuel-loading" role="status">Loading your fuel log…</div>
          <div v-else-if="!entries.length" class="fuel-empty"><strong>Start with one thing.</strong><p>Log your next meal or snack. A useful pattern beats a perfect day.</p></div>
          <div v-else class="fuel-entry-list">
            <article v-for="entry in entries" :key="entry.id" class="fuel-entry">
              <div class="fuel-entry-main"><span class="fuel-entry-meal">{{ mealLabel(entry.mealType) }}</span><h3>{{ entry.foodName }}</h3><p>{{ formatTime(entry.loggedAt) }} · {{ entry.servingQuantity }}{{ entry.servingUnit ? ` ${entry.servingUnit}` : '' }}</p></div>
              <div class="fuel-entry-metrics"><strong v-if="entry.caloriesKcal">{{ entry.caloriesKcal }} kcal</strong><span v-if="entry.proteinGrams">{{ formatNumber(entry.proteinGrams) }}g protein</span></div>
              <button class="fuel-remove" type="button" :aria-label="`Remove ${entry.foodName}`" @click="removeEntry(entry)">×</button>
            </article>
          </div>
        </section>
      </div>

      <aside class="fuel-next-step"><div><p class="fuel-eyebrow">Next layer</p><h2>Make it useful around your event.</h2><p>Once your log has a rhythm, RUNNIT can connect fueling to long sessions, recovery, and the training block you are building toward.</p></div><router-link to="/devices" class="fuel-next-link">Manage data sources →</router-link></aside>
    </section>
  </main>
</template>

<script setup>
import { onMounted, reactive } from 'vue'
import { useNutritionStore } from '@/stores/nutrition'
import { storeToRefs } from 'pinia'

const nutritionStore = useNutritionStore()
const { entries, totals, loading, saving, error, selectedDate } = storeToRefs(nutritionStore)

const mealTypes = [
  { value: 'BREAKFAST', label: 'Breakfast' },
  { value: 'LUNCH', label: 'Lunch' },
  { value: 'DINNER', label: 'Dinner' },
  { value: 'SNACK', label: 'Snack' },
  { value: 'PRE_WORKOUT', label: 'Pre-workout' },
  { value: 'POST_WORKOUT', label: 'Post-workout' },
]

const localDateTime = () => {
  const date = new Date()
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}
const today = () => new Date().toISOString().slice(0, 10)
const form = reactive({ loggedAt: localDateTime(), mealType: 'BREAKFAST', foodName: '', servingQuantity: 1, servingUnit: '', caloriesKcal: null, proteinGrams: null, carbsGrams: null, fatGrams: null, notes: '' })

const formatDateLabel = date => date ? new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : 'Today'
const formatNumber = value => Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 1 })
const formatTime = value => value ? new Date(value).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : ''
const mealLabel = value => mealTypes.find(meal => meal.value === value)?.label || 'Meal'

const loadDay = async () => {
  try { await nutritionStore.fetchDay(selectedDate.value || today()) } catch {}
}

const resetForm = () => Object.assign(form, { loggedAt: localDateTime(), mealType: 'BREAKFAST', foodName: '', servingQuantity: 1, servingUnit: '', caloriesKcal: null, proteinGrams: null, carbsGrams: null, fatGrams: null, notes: '' })

const saveEntry = async () => {
  try {
    await nutritionStore.addEntry({ ...form, loggedAt: form.loggedAt.length === 16 ? `${form.loggedAt}:00` : form.loggedAt, source: 'MANUAL' })
    resetForm()
  } catch {}
}

const removeEntry = async entry => {
  try { await nutritionStore.removeEntry(entry.id) } catch {}
}

onMounted(() => { selectedDate.value = today(); loadDay() })
</script>

<style scoped>
.fuel-page{min-height:100vh;padding-top:var(--nav-h,66px);background:#fbf6ec;color:#16130f}.fuel-hero{display:grid;grid-template-columns:minmax(0,1fr) 330px;gap:32px;align-items:end;padding:64px max(24px,calc((100% - 1100px)/2));background:#16130f;color:#fbf6ec}.fuel-hero h1{max-width:650px;margin:9px 0 14px;font:900 clamp(48px,7vw,82px)/.88 'Big Shoulders Display',sans-serif;text-transform:uppercase}.fuel-hero-copy{max-width:550px;margin:0;color:rgba(251,246,236,.72);font-size:1rem;line-height:1.5}.fuel-eyebrow{margin:0;color:#2a55f5;font:700 10px 'Spline Sans Mono',monospace;letter-spacing:.14em;text-transform:uppercase}.fuel-eyebrow--dark{color:#2a55f5}.fuel-hero-note{display:grid;gap:7px;padding:18px;background:#ffc53d;border:2px solid #16130f;box-shadow:5px 5px #2a55f5;color:#16130f}.fuel-note-label,.fuel-summary-label,.fuel-entry-meal{font:700 10px 'Spline Sans Mono',monospace;letter-spacing:.12em;text-transform:uppercase}.fuel-hero-note strong{font:900 2rem/.9 'Big Shoulders Display',sans-serif;text-transform:uppercase}.fuel-hero-note span:last-child{font-size:.82rem;line-height:1.35}.fuel-body{max-width:1100px;margin:auto;padding:42px 24px 90px}.fuel-toolbar,.fuel-card-heading{display:flex;align-items:end;justify-content:space-between;gap:18px}.fuel-toolbar h2,.fuel-card-heading h2,.fuel-next-step h2{margin:7px 0 0;font-size:2rem}.fuel-date{min-height:44px;padding:9px 12px;background:#fff;border:2px solid #16130f;font:700 11px 'Spline Sans Mono',monospace;text-transform:uppercase}.fuel-alert{display:flex;justify-content:space-between;gap:16px;margin-top:20px;padding:12px 14px;background:#fff3f0;border:2px solid #c0392b;color:#8f2d23;font-size:.9rem}.fuel-inline-action{border:0;background:transparent;color:#8f2d23;font:700 10px 'Spline Sans Mono',monospace;text-transform:uppercase;text-decoration:underline}.fuel-summary-grid{display:grid;grid-template-columns:1.45fr repeat(3,1fr);gap:12px;margin:24px 0 34px}.fuel-summary{display:grid;gap:9px;min-height:126px;padding:17px;background:#fff;border:2px solid #16130f;box-shadow:4px 4px #16130f}.fuel-summary--primary{background:#e6edff}.fuel-summary strong{font:900 2.9rem/.8 'Big Shoulders Display',sans-serif}.fuel-summary small{color:#665f55;font-size:.75rem}.fuel-layout{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(340px,.9fr);gap:18px}.fuel-card{padding:22px;background:#fff;border:2px solid #16130f}.fuel-card--log{box-shadow:5px 5px #16130f}.fuel-private{padding:5px 8px;border:1px solid #16130f;background:#f1eadc;font:700 9px 'Spline Sans Mono',monospace;text-transform:uppercase}.fuel-form{display:grid;grid-template-columns:1fr 1fr;gap:13px;margin-top:24px}.fuel-field{display:grid;gap:6px;color:#665f55;font:700 10px 'Spline Sans Mono',monospace;letter-spacing:.06em;text-transform:uppercase}.fuel-field--wide,.fuel-form-rule,.fuel-submit{grid-column:1/-1}.fuel-field input,.fuel-field select{width:100%;min-height:44px;padding:10px 11px;background:#fbf6ec;border:2px solid #16130f;color:#16130f;font:400 .92rem 'Hanken Grotesk',sans-serif;letter-spacing:0;text-transform:none}.fuel-field input:focus,.fuel-field select:focus,.fuel-date:focus{outline:3px solid #2a55f5;outline-offset:2px}.fuel-form-rule{display:flex;align-items:end;justify-content:space-between;gap:14px;padding-top:7px;border-top:2px solid #e7dfce;color:#16130f;font:700 10px 'Spline Sans Mono',monospace;text-transform:uppercase}.fuel-form-rule small{max-width:250px;color:#665f55;font:400 .75rem/1.3 'Hanken Grotesk',sans-serif;text-transform:none}.fuel-submit{min-height:46px;padding:11px 16px;background:#2a55f5;color:#fff;border:2px solid #16130f;box-shadow:3px 3px #16130f;font:700 10px 'Spline Sans Mono',monospace;letter-spacing:.1em;text-transform:uppercase;cursor:pointer}.fuel-submit:hover{background:#1e42d6}.fuel-submit:disabled{opacity:.6;cursor:wait}.fuel-loading,.fuel-empty{padding:36px 0;color:#665f55;font-size:.9rem}.fuel-empty strong{color:#16130f;font:900 1.8rem/.9 'Big Shoulders Display',sans-serif;text-transform:uppercase}.fuel-empty p{max-width:280px;line-height:1.5}.fuel-entry-list{display:grid;margin-top:22px}.fuel-entry{position:relative;display:grid;grid-template-columns:1fr auto auto;gap:12px;align-items:center;padding:14px 0;border-top:2px solid #e7dfce}.fuel-entry-main h3{margin:4px 0;font-size:1.05rem}.fuel-entry-main p{margin:0;color:#665f55;font-size:.78rem}.fuel-entry-meal{color:#2a55f5}.fuel-entry-metrics{display:grid;gap:3px;text-align:right;color:#665f55;font:10px 'Spline Sans Mono',monospace;text-transform:uppercase}.fuel-entry-metrics strong{color:#16130f}.fuel-remove{width:30px;height:30px;border:2px solid #16130f;background:#fff;color:#16130f;font-size:1.2rem;line-height:1;cursor:pointer}.fuel-remove:hover{background:#ffc53d}.fuel-next-step{display:flex;align-items:end;justify-content:space-between;gap:24px;margin-top:36px;padding:24px;background:#ffc53d;border:2px solid #16130f;box-shadow:5px 5px #16130f}.fuel-next-step p:last-child{max-width:620px;margin:8px 0 0;color:#665f55;line-height:1.45}.fuel-next-link{flex-shrink:0;padding:11px 14px;background:#16130f;color:#fff;border:2px solid #16130f;font:700 10px 'Spline Sans Mono',monospace;text-transform:uppercase;text-decoration:none}.fuel-next-link:hover{background:#2a55f5;color:#fff}@media(max-width:850px){.fuel-hero{grid-template-columns:1fr;padding:48px 24px}.fuel-summary-grid{grid-template-columns:repeat(2,1fr)}.fuel-layout{grid-template-columns:1fr}.fuel-next-step{align-items:flex-start;flex-direction:column}}@media(max-width:520px){.fuel-body{padding:32px 18px 72px}.fuel-toolbar{align-items:flex-start;flex-direction:column}.fuel-date{width:100%}.fuel-summary-grid{grid-template-columns:1fr 1fr;gap:9px}.fuel-summary{min-height:114px;padding:13px}.fuel-summary strong{font-size:2.25rem}.fuel-form{grid-template-columns:1fr}.fuel-field--wide,.fuel-form-rule,.fuel-submit{grid-column:auto}.fuel-form-rule{align-items:flex-start;flex-direction:column}.fuel-entry{grid-template-columns:1fr auto}.fuel-entry-metrics{grid-column:1;text-align:left}.fuel-remove{grid-column:2;grid-row:1;align-self:start}.fuel-next-step{padding:18px}}
</style>
