<!-- ConfirmModal.vue — reusable confirm dialog, replaces all browser confirm() calls -->
<template>
  <Teleport to="body">
    <Transition name="confirm-fade">
      <div v-if="modelValue" class="confirm-overlay" @click.self="cancel">
        <div class="confirm-modal" role="dialog" aria-modal="true" :aria-label="title">
          <div class="confirm-title">{{ title }}</div>
          <p v-if="body" class="confirm-body">{{ body }}</p>
          <div class="confirm-actions">
            <button class="confirm-btn-cancel" type="button" @click="cancel">Cancel</button>
            <button
              :class="['confirm-btn-action', danger ? 'confirm-btn-danger' : 'confirm-btn-primary']"
              type="button"
              @click="$emit('confirm')"
            >
              {{ confirmLabel || 'Confirm' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
defineProps({
  modelValue:   { type: Boolean, required: true },
  title:        { type: String,  required: true },
  body:         { type: String,  default: '' },
  confirmLabel: { type: String,  default: 'Confirm' },
  danger:       { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const cancel = () => emit('update:modelValue', false)
</script>

<style scoped>
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 9100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.confirm-modal {
  background: #fff;
  width: 100%;
  max-width: 400px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
}

.confirm-title {
  font-size: 1rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #000;
}

.confirm-body {
  font-size: 0.88rem;
  color: #555;
  margin: 0;
  line-height: 1.5;
}

.confirm-actions {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}

.confirm-btn-cancel {
  flex: 1;
  height: 44px;
  border: 2px solid #E7DFCE;
  background: #fff;
  color: #767676;
  font-family: inherit;
  font-weight: 700;
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  cursor: pointer;
  transition: background 0.15s;
}
.confirm-btn-cancel:hover { background: #FBF6EC; }

.confirm-btn-action {
  flex: 1;
  height: 44px;
  border: none;
  font-family: inherit;
  font-weight: 700;
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  cursor: pointer;
  transition: background 0.15s;
}

.confirm-btn-danger  { background: #dc2626; color: #fff; }
.confirm-btn-danger:hover  { background: #b91c1c; }
.confirm-btn-primary { background: #2A55F5; color: #fff; }
.confirm-btn-primary:hover { background: #1E42D6; }

/* Transition */
.confirm-fade-enter-active,
.confirm-fade-leave-active { transition: opacity 0.18s ease; }
.confirm-fade-enter-from,
.confirm-fade-leave-to    { opacity: 0; }
</style>
