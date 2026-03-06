<!-- src/components/DMDrawer.vue -->
<template>
  <Teleport to="body">
    <Transition name="dm-fade">
      <div v-if="dmStore.isOpen" class="dm-overlay" @click="dmStore.close()"></div>
    </Transition>

    <Transition name="dm-slide">
      <div v-if="dmStore.isOpen" class="dm-drawer" @click.stop>
        <!-- Header -->
        <div class="dm-header">
          <button v-if="dmStore.view !== 'list'" class="dm-back" @click="dmStore.backToList()" title="Back">
            <i class="bi bi-arrow-left"></i>
          </button>
          <span class="dm-title">
            {{ dmStore.view === 'thread' ? dmStore.activeUserName : dmStore.view === 'compose' ? 'NEW MESSAGE' : 'MESSAGES' }}
          </span>
          <button v-if="dmStore.view === 'list'" class="dm-compose-btn" @click="dmStore.openCompose()" title="New message">
            <i class="bi bi-pencil-square"></i>
          </button>
          <button class="dm-close" @click="dmStore.close()" title="Close">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <!-- LIST VIEW -->
        <div v-if="dmStore.view === 'list'" class="dm-body">
          <div v-if="dmStore.loading" class="dm-loading">
            <div class="dm-spinner"></div>
            <span>Loading…</span>
          </div>

          <div v-else-if="dmStore.conversations.length === 0" class="dm-empty">
            <i class="bi bi-chat-dots"></i>
            <p>No conversations yet.</p>
            <button class="dm-new-btn" @click="dmStore.openCompose()">
              <i class="bi bi-pencil-square me-2"></i>Start a conversation
            </button>
          </div>

          <div v-else class="dm-list">
            <button
              v-for="c in dmStore.conversations"
              :key="c.userId"
              class="dm-conv-item"
              @click="dmStore.openThread(c.userId, c.displayName)"
            >
              <div class="dm-avatar">{{ c.displayName?.charAt(0).toUpperCase() || '?' }}</div>
              <div class="dm-conv-info">
                <div class="dm-conv-top">
                  <span class="dm-conv-name">{{ c.displayName }}</span>
                  <span class="dm-conv-time">{{ formatTime(c.lastMessageAt) }}</span>
                </div>
                <div class="dm-conv-preview">{{ c.lastMessage }}</div>
              </div>
              <div v-if="c.unread" class="dm-unread-dot"></div>
            </button>
          </div>
        </div>

        <!-- COMPOSE VIEW -->
        <div v-else-if="dmStore.view === 'compose'" class="dm-body">
          <div class="dm-compose-search">
            <div class="dm-search-wrap">
              <i class="bi bi-search dm-search-icon"></i>
              <input
                v-model="composeQuery"
                class="dm-search-input"
                placeholder="Search people…"
                autocomplete="off"
                @input="onComposeSearch"
              />
            </div>
          </div>

          <div v-if="dmStore.composeLoading" class="dm-loading">
            <div class="dm-spinner"></div>
          </div>

          <div v-else-if="composeQuery && dmStore.composeResults.length === 0" class="dm-empty">
            <i class="bi bi-person-x"></i>
            <p>No users found.</p>
          </div>

          <div v-else class="dm-list">
            <button
              v-for="u in dmStore.composeResults"
              :key="u.id"
              class="dm-conv-item"
              @click="dmStore.openThread(u.id, u.displayName)"
            >
              <div class="dm-avatar">{{ u.displayName?.charAt(0).toUpperCase() || '?' }}</div>
              <div class="dm-conv-info">
                <div class="dm-conv-name">{{ u.displayName }}</div>
                <div class="dm-conv-preview">{{ u.email || '' }}</div>
              </div>
            </button>
          </div>
        </div>

        <!-- THREAD VIEW -->
        <div v-else class="dm-thread-wrap">
          <div class="dm-messages" ref="messagesEl">
            <div v-if="dmStore.loading" class="dm-loading">
              <div class="dm-spinner"></div>
            </div>

            <div v-else-if="dmStore.messages.length === 0" class="dm-empty">
              <i class="bi bi-chat"></i>
              <p>Start the conversation.</p>
            </div>

            <div
              v-for="msg in dmStore.messages"
              :key="msg.id"
              :class="['dm-bubble-wrap', isSent(msg) ? 'sent' : 'received']"
            >
              <div class="dm-bubble">{{ msg.text }}</div>
              <div class="dm-bubble-time">{{ formatTime(msg.createdAt) }}</div>
            </div>
          </div>

          <!-- Input -->
          <form class="dm-input-bar" @submit.prevent="handleSend">
            <input
              v-model="draftText"
              class="dm-input"
              placeholder="Message…"
              autocomplete="off"
            />
            <button type="submit" class="dm-send-btn" :disabled="!draftText.trim()">
              <i class="bi bi-send-fill"></i>
            </button>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { useDMStore } from '@/stores/dm'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

const dmStore = useDMStore()
const authStore = useAuthStore()
const { user } = storeToRefs(authStore)

const draftText = ref('')
const messagesEl = ref(null)
const composeQuery = ref('')
let composeDebounce = null

const onComposeSearch = () => {
  clearTimeout(composeDebounce)
  composeDebounce = setTimeout(() => dmStore.searchUsers(composeQuery.value), 300)
}

const isSent = (msg) => msg.senderId === user.value?.id

const formatTime = (d) => {
  if (!d) return ''
  const diff = Date.now() - new Date(d)
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'now'
  if (mins < 60) return `${mins}m`
  if (hours < 24) return `${hours}h`
  return `${days}d`
}

const handleSend = async () => {
  const text = draftText.value.trim()
  if (!text) return
  draftText.value = ''
  await dmStore.sendMessage(text)
  await nextTick()
  if (messagesEl.value) messagesEl.value.scrollTop = messagesEl.value.scrollHeight
}

// Auto-scroll to bottom when messages load/change
watch(() => dmStore.messages.length, async () => {
  await nextTick()
  if (messagesEl.value) messagesEl.value.scrollTop = messagesEl.value.scrollHeight
})
</script>

<style scoped>
.dm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.50);
  z-index: 9998;
}

.dm-drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 380px;
  max-width: 100vw;
  background: #ffffff;
  border-left: 1px solid #E5E5E5;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  font-family: Futura, 'Avenir Next', system-ui, sans-serif;
}

/* Header */
.dm-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px;
  height: 60px;
  border-bottom: 1px solid #E5E5E5;
  flex-shrink: 0;
}
.dm-title {
  flex: 1;
  font-weight: 700;
  font-size: 0.82rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #000;
}
.dm-back,
.dm-close {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: #767676;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  border-radius: 0;
  transition: color 0.15s;
}
.dm-back:hover,
.dm-close:hover { color: #000; }

/* Loading */
.dm-loading {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 40px 20px;
  color: #767676;
  font-size: 0.85rem;
  justify-content: center;
}
.dm-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid #E5E5E5;
  border-top-color: #000;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Empty state */
.dm-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  color: #767676;
  text-align: center;
}
.dm-empty i { font-size: 2.5rem; margin-bottom: 16px; }
.dm-empty-sub { font-size: 0.78rem; color: #9ca3af; margin: 0; }

/* Compose button in header */
.dm-compose-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: #767676;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  border-radius: 0;
  transition: color 0.15s;
  margin-left: auto;
}
.dm-compose-btn:hover { color: #000; }

/* New conversation button in empty state */
.dm-new-btn {
  margin-top: 16px;
  height: 40px;
  padding: 0 20px;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 0;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  transition: background 0.15s;
}
.dm-new-btn:hover { background: #222; }

/* Compose search */
.dm-compose-search {
  padding: 16px 20px 8px;
  border-bottom: 1px solid #E5E5E5;
}
.dm-search-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.dm-search-icon {
  position: absolute;
  left: 12px;
  color: #767676;
  font-size: 0.85rem;
  pointer-events: none;
}
.dm-search-input {
  width: 100%;
  height: 40px;
  border: 1px solid #E5E5E5;
  border-radius: 0;
  padding: 0 12px 0 36px;
  font-size: 0.88rem;
  color: #000;
  outline: none;
  background: #f9f9f9;
  font-family: inherit;
}
.dm-search-input:focus { border-color: #000; background: #fff; }
.dm-empty p { margin: 0 0 4px; font-size: 0.9rem; font-weight: 500; color: #000; }
.dm-empty-sub { font-size: 0.8rem !important; font-weight: 400 !important; color: #767676 !important; }

/* Body (list) */
.dm-body { flex: 1; overflow-y: auto; }
.dm-list { display: flex; flex-direction: column; }

/* Conversation item */
.dm-conv-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  border: none;
  background: transparent;
  border-bottom: 1px solid #E5E5E5;
  cursor: pointer;
  text-align: left;
  transition: background 0.1s;
  position: relative;
}
.dm-conv-item:hover { background: #f9f9f9; }

.dm-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #000;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.dm-conv-info { flex: 1; min-width: 0; }
.dm-conv-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}
.dm-conv-name {
  font-weight: 600;
  font-size: 0.88rem;
  color: #000;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dm-conv-time { font-size: 0.72rem; color: #767676; flex-shrink: 0; }
.dm-conv-preview {
  font-size: 0.8rem;
  color: #767676;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dm-unread-dot {
  width: 8px;
  height: 8px;
  border-radius: 0;
  background: #000;
  flex-shrink: 0;
}

/* Thread view */
.dm-thread-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.dm-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Bubbles */
.dm-bubble-wrap { display: flex; flex-direction: column; }
.dm-bubble-wrap.sent { align-items: flex-end; }
.dm-bubble-wrap.received { align-items: flex-start; }

.dm-bubble {
  max-width: 75%;
  padding: 10px 14px;
  font-size: 0.88rem;
  line-height: 1.4;
  border-radius: 0;
}
.sent .dm-bubble { background: #000; color: white; }
.received .dm-bubble { background: #f5f5f5; color: #000; }

.dm-bubble-time {
  font-size: 0.68rem;
  color: #767676;
  margin-top: 4px;
  padding: 0 2px;
}

/* Input bar */
.dm-input-bar {
  display: flex;
  align-items: center;
  gap: 0;
  border-top: 1px solid #E5E5E5;
  padding: 12px 16px;
  flex-shrink: 0;
}
.dm-input {
  flex: 1;
  border: 1px solid #E5E5E5;
  border-right: none;
  padding: 10px 14px;
  font-size: 0.88rem;
  outline: none;
  border-radius: 0;
  font-family: inherit;
  background: #fff;
  color: #000;
}
.dm-input:focus { border-color: #000; }
.dm-send-btn {
  border: 1px solid #000;
  background: #000;
  color: white;
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.9rem;
  border-radius: 0;
  transition: background 0.15s;
  flex-shrink: 0;
}
.dm-send-btn:hover:not(:disabled) { background: #333; border-color: #333; }
.dm-send-btn:disabled { background: #E5E5E5; border-color: #E5E5E5; color: #767676; cursor: not-allowed; }

/* Transitions */
.dm-fade-enter-active, .dm-fade-leave-active { transition: opacity 0.20s ease; }
.dm-fade-enter-from, .dm-fade-leave-to { opacity: 0; }
.dm-slide-enter-active, .dm-slide-leave-active { transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
.dm-slide-enter-from, .dm-slide-leave-to { transform: translateX(100%); }
</style>
