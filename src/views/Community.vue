<template>
  <main class="community-page">
    <div class="community-layout">
      <!-- Sidebar: Rooms List -->
      <aside class="rooms-sidebar" :class="{ 'sidebar-open': sidebarOpen }">
        <div class="sidebar-header">
          <h2><i class="bi bi-hash"></i> Communities</h2>
          <button class="sidebar-close" @click="sidebarOpen = false"><i class="bi bi-x-lg"></i></button>
        </div>

        <div class="rooms-section">
          <div class="rooms-label">SPORT CHANNELS</div>
          <button
            v-for="room in sportRooms"
            :key="room.id"
            :class="['room-item', { active: activeRoom?.id === room.id }]"
            @click="selectRoom(room)"
          >
            <span class="room-icon">{{ room.icon }}</span>
            <span class="room-name"># {{ room.name }}</span>
            <span v-if="room.unread" class="unread-dot">{{ room.unread }}</span>
          </button>
        </div>

        <div class="rooms-section">
          <div class="rooms-label">COMMUNITIES</div>
          <button
            v-for="room in communityRooms"
            :key="room.id"
            :class="['room-item', { active: activeRoom?.id === room.id }]"
            @click="selectRoom(room)"
          >
            <span class="room-icon">{{ room.icon }}</span>
            <span class="room-name"># {{ room.name }}</span>
            <span v-if="room.unread" class="unread-dot">{{ room.unread }}</span>
          </button>
        </div>

        <div class="rooms-section">
          <div class="rooms-label">MENTORSHIP</div>
          <button :class="['room-item', { active: activeTab === 'mentorship' }]" @click="activeTab = 'mentorship'; activeRoom = null">
            <span class="room-icon">🏅</span>
            <span class="room-name"># find-a-mentor</span>
          </button>
        </div>
      </aside>

      <!-- Main: Chat / Mentorship -->
      <div class="chat-main">
        <!-- Mobile header -->
        <div class="mobile-header">
          <button @click="sidebarOpen = true" class="btn-menu"><i class="bi bi-list"></i></button>
          <span class="channel-title"># {{ activeRoom?.name || 'find-a-mentor' }}</span>
        </div>

        <!-- Chat View -->
        <template v-if="activeRoom">
          <div class="chat-header">
            <div>
              <h3># {{ activeRoom.name }}</h3>
              <p>{{ activeRoom.description }} · {{ activeRoom.memberCount?.toLocaleString() || 0 }} members</p>
            </div>
            <button
              :class="['btn', activeRoom.isMember ? 'btn-outline-dark' : 'btn-primary']"
              @click="toggleMembership"
            >
              {{ activeRoom.isMember ? 'Leave' : 'Join' }}
            </button>
          </div>

          <div class="messages-area" ref="messagesArea">
            <div class="day-divider">Today</div>
            <div v-for="msg in displayMessages" :key="msg.id" class="message-row">
              <div class="msg-avatar">{{ msg.author[0] }}</div>
              <div class="msg-body">
                <div class="msg-header">
                  <span class="msg-author">{{ msg.author }}</span>
                  <span class="msg-time">{{ msg.time }}</span>
                </div>
                <p class="msg-text">{{ msg.text }}</p>
                <div v-if="msg.activity" class="activity-embed">
                  <i class="bi bi-map-fill"></i>
                  <span>{{ msg.activity.name }} · {{ msg.activity.distance }} km · {{ msg.activity.duration }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="message-input-bar">
            <input
              v-model="newMessage"
              :placeholder="`Message #${activeRoom.name}`"
              class="message-input"
              @keydown.enter="sendMessage"
            />
            <button class="btn-icon" @click="sendMessage" :disabled="!newMessage.trim()">
              <i class="bi bi-send-fill"></i>
            </button>
          </div>
        </template>

        <!-- Mentorship View -->
        <template v-else-if="activeTab === 'mentorship'">
          <div class="mentorship-view">
            <div class="mentorship-hero">
              <h2>Find Your Mentor</h2>
              <p>Get paired with experienced athletes and coaches based on your discipline, schedule, and goals.</p>
            </div>

            <div class="mentor-filters">
              <button
                v-for="s in ['All', 'Running', 'Cycling', 'Triathlon', 'Swimming']"
                :key="s"
                :class="['filter-chip', { active: mentorFilter === s }]"
                @click="mentorFilter = s"
              >{{ s }}</button>
            </div>

            <div class="mentors-grid">
              <div v-for="mentor in filteredMentors" :key="mentor.id" class="mentor-card">
                <div class="mentor-avatar">{{ mentor.name[0] }}</div>
                <div class="mentor-info">
                  <div class="mentor-name">{{ mentor.name }}</div>
                  <div class="mentor-tag">{{ mentor.specialty }}</div>
                  <div class="mentor-stats">
                    <span><i class="bi bi-trophy-fill"></i> {{ mentor.experience }}</span>
                    <span><i class="bi bi-star-fill"></i> {{ mentor.rating }}</span>
                  </div>
                  <p class="mentor-bio">{{ mentor.bio }}</p>
                  <div class="mentor-schedule">
                    <i class="bi bi-clock"></i> Available {{ mentor.availability }}
                  </div>
                </div>
                <button class="btn btn-primary" @click="requestMentor(mentor)">Connect</button>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'

const sidebarOpen = ref(false)
const activeRoom = ref(null)
const activeTab = ref('mentorship')
const newMessage = ref('')
const mentorFilter = ref('All')
const messagesArea = ref(null)

const sportRooms = ref([
  { id: 'r1', name: 'running', icon: '🏃', description: 'Running talk, routes, and race reports', memberCount: 12400, isMember: true, unread: 3 },
  { id: 'r2', name: 'cycling', icon: '🚴', description: 'Road, gravel, and mountain biking', memberCount: 7800, isMember: false, unread: 0 },
  { id: 'r3', name: 'swimming', icon: '🏊', description: 'Pool, open water, and triathlon swim', memberCount: 3200, isMember: false, unread: 0 },
  { id: 'r4', name: 'triathlon', icon: '⚡', description: 'Sprint to Ironman — all things tri', memberCount: 2100, isMember: true, unread: 1 },
])

const communityRooms = ref([
  { id: 'c1', name: 'daily-moments', icon: '📸', description: 'Share your workout moments', memberCount: 18900, isMember: true, unread: 12 },
  { id: 'c2', name: 'gear-talk', icon: '👟', description: 'Shoes, watches, and all the gear', memberCount: 6200, isMember: false, unread: 0 },
  { id: 'c3', name: 'nutrition', icon: '🥗', description: 'Fueling before, during, and after', memberCount: 4100, isMember: false, unread: 0 },
  { id: 'c4', name: 'mindset', icon: '🧠', description: 'Mental training, motivation, recovery', memberCount: 5800, isMember: false, unread: 0 },
  { id: 'c5', name: 'group-streaks', icon: '🔥', description: 'Keep each other accountable', memberCount: 3300, isMember: true, unread: 5 },
])

const mockMessages = [
  { id: 1, author: 'Elena M.', time: '9:12 AM', text: 'Just crushed my long run! 22km with negative splits 🔥' },
  { id: 2, author: 'Marcus T.', time: '9:18 AM', text: 'That is amazing! What pace were you targeting?', activity: null },
  { id: 3, author: 'Elena M.', time: '9:20 AM', text: 'Aimed for 5:30 but averaged 5:22 😊', activity: { name: 'Sunday Long Run', distance: '22.1', duration: '1h 59m' } },
  { id: 4, author: 'Priya N.', time: '9:34 AM', text: 'Anyone racing the downtown 10K next Saturday?' },
  { id: 5, author: 'Coach Yuki', time: '10:02 AM', text: 'Good luck to everyone racing this weekend. Remember: start conservative, finish strong 💪' },
]

const displayMessages = ref([...mockMessages])

const mentors = ref([
  { id: 'm1', name: 'Coach Elena', specialty: 'Running · Marathons', experience: '12 marathons', rating: '4.9', availability: 'weekday evenings', bio: 'Sub-3hr marathoner helping runners of all levels find their stride.', filter: 'Running' },
  { id: 'm2', name: 'Marcus Ortiz', specialty: 'Triathlon · Ironman', experience: '6 Ironman finishes', rating: '4.8', availability: 'weekends', bio: 'Helped 80+ athletes cross their first Ironman finish line.', filter: 'Triathlon' },
  { id: 'm3', name: 'Diane V.', specialty: 'Cycling · Road', experience: '10 yrs racing', rating: '4.9', availability: 'flexible', bio: 'Cat 1 road racer and certified cycling coach. Power-based training.', filter: 'Cycling' },
  { id: 'm4', name: 'Yuki L.', specialty: 'Swimming · Open Water', experience: 'National level swimmer', rating: '4.7', availability: 'mornings', bio: 'Former collegiate swimmer coaching open water and tri swim.', filter: 'Swimming' },
])

const filteredMentors = computed(() =>
  mentorFilter.value === 'All' ? mentors.value : mentors.value.filter(m => m.filter === mentorFilter.value)
)

const selectRoom = (room) => {
  activeRoom.value = room
  activeTab.value = 'chat'
  sidebarOpen.value = false
  room.unread = 0
}

const toggleMembership = () => {
  if (activeRoom.value) activeRoom.value.isMember = !activeRoom.value.isMember
}

const sendMessage = async () => {
  if (!newMessage.value.trim()) return
  displayMessages.value.push({
    id: Date.now(),
    author: 'You',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    text: newMessage.value.trim()
  })
  newMessage.value = ''
  await nextTick()
  if (messagesArea.value) messagesArea.value.scrollTop = messagesArea.value.scrollHeight
}

const requestMentor = (mentor) => {
  alert(`Connection request sent to ${mentor.name}! They will reach out within 48 hours.`)
}
</script>

<style scoped>
.community-page { height: 100vh; padding-top: 64px; overflow: hidden; background: #F5F6F3; }
.community-layout { display: grid; grid-template-columns: 260px 1fr; height: calc(100vh - 64px); }

.rooms-sidebar { background: #1e2421; color: white; display: flex; flex-direction: column; overflow-y: auto; }
.sidebar-header { padding: 20px 16px 12px; border-bottom: 1px solid rgba(255,255,255,.1); display: flex; align-items: center; justify-content: space-between; }
.sidebar-header h2 { font-weight: 900; font-size: 1rem; margin: 0; }
.sidebar-close { display: none; background: none; border: none; color: white; font-size: 1.1rem; cursor: pointer; }
.rooms-section { padding: 16px 8px 0; }
.rooms-label { font-size: .68rem; font-weight: 800; letter-spacing: .1em; color: rgba(255,255,255,.45); padding: 0 8px; margin-bottom: 4px; }
.room-item { width: 100%; background: none; border: none; color: rgba(255,255,255,.65); font-size: .9rem; font-weight: 600; padding: 8px 10px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 8px; text-align: left; transition: all .15s; }
.room-item:hover { background: rgba(255,255,255,.08); color: white; }
.room-item.active { background: rgba(255,255,255,.15); color: white; }
.room-icon { font-size: 1rem; }
.room-name { flex: 1; }
.unread-dot { background: #C46A2A; color: white; font-size: .7rem; font-weight: 900; padding: 2px 7px; border-radius: 999px; }

.chat-main { display: flex; flex-direction: column; overflow: hidden; }
.mobile-header { display: none; }

.chat-header { padding: 16px 24px; border-bottom: 1px solid rgba(15,18,16,.1); background: white; display: flex; align-items: center; justify-content: space-between; }
.chat-header h3 { font-weight: 900; font-size: 1.05rem; margin: 0 0 2px; }
.chat-header p { font-size: .82rem; color: #6b7280; margin: 0; }

.messages-area { flex: 1; overflow-y: auto; padding: 20px 24px; background: #fafafa; }
.day-divider { text-align: center; font-size: .75rem; font-weight: 700; color: #9ca3af; margin-bottom: 16px; position: relative; }
.day-divider::before, .day-divider::after { content: ''; position: absolute; top: 50%; width: calc(50% - 40px); height: 1px; background: rgba(15,18,16,.1); }
.day-divider::before { left: 0; } .day-divider::after { right: 0; }

.message-row { display: flex; gap: 12px; margin-bottom: 16px; }
.msg-avatar { width: 36px; height: 36px; border-radius: 50%; background: #5A6B4E; color: white; font-weight: 900; font-size: .85rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.msg-body { flex: 1; }
.msg-header { display: flex; align-items: baseline; gap: 8px; margin-bottom: 4px; }
.msg-author { font-weight: 800; font-size: .9rem; }
.msg-time { font-size: .75rem; color: #9ca3af; }
.msg-text { font-size: .9rem; color: #374151; margin: 0; line-height: 1.5; }
.activity-embed { margin-top: 8px; background: white; border: 1px solid rgba(15,18,16,.1); border-radius: 10px; padding: 10px 14px; font-size: .82rem; font-weight: 600; color: #5A6B4E; display: flex; align-items: center; gap: 8px; }

.message-input-bar { padding: 12px 16px; background: white; border-top: 1px solid rgba(15,18,16,.1); display: flex; gap: 10px; align-items: center; }
.message-input { flex: 1; border: 1px solid rgba(15,18,16,.14); border-radius: 12px; padding: 10px 16px; font-size: .9rem; outline: none; transition: border-color .2s; }
.message-input:focus { border-color: #5A6B4E; }
.btn-icon { width: 40px; height: 40px; border-radius: 12px; background: #5A6B4E; color: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1rem; }
.btn-icon:disabled { opacity: .5; cursor: not-allowed; }

.mentorship-view { flex: 1; overflow-y: auto; padding: 32px 24px; }
.mentorship-hero { text-align: center; margin-bottom: 32px; }
.mentorship-hero h2 { font-weight: 900; font-size: 2rem; }
.mentorship-hero p { color: #6b7280; max-width: 480px; margin: 0 auto; }

.mentor-filters { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 24px; }
.filter-chip { padding: 8px 16px; border-radius: 999px; border: 1px solid rgba(15,18,16,.14); background: white; font-weight: 700; font-size: .875rem; cursor: pointer; transition: all .2s; }
.filter-chip.active { background: #2C3726; color: white; border-color: #2C3726; }

.mentors-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
.mentor-card { background: white; border-radius: 16px; border: 1px solid rgba(15,18,16,.08); padding: 20px; display: flex; flex-direction: column; gap: 12px; box-shadow: 0 4px 16px rgba(15,18,16,.06); }
.mentor-avatar { width: 52px; height: 52px; border-radius: 50%; background: linear-gradient(135deg, #5A6B4E, #2C3726); color: white; font-weight: 900; font-size: 1.2rem; display: flex; align-items: center; justify-content: center; }
.mentor-name { font-weight: 900; font-size: 1rem; }
.mentor-tag { font-size: .8rem; color: #C46A2A; font-weight: 700; }
.mentor-stats { display: flex; gap: 12px; font-size: .8rem; font-weight: 600; color: #6b7280; }
.mentor-stats i { color: #f59e0b; margin-right: 2px; }
.mentor-bio { font-size: .875rem; color: #4b5563; margin: 0; line-height: 1.5; }
.mentor-schedule { font-size: .8rem; color: #6b7280; display: flex; align-items: center; gap: 6px; }

.btn { border-radius: 12px; font-weight: 800; padding: 10px 18px; cursor: pointer; border: none; transition: all .2s; font-size: .875rem; }
.btn-primary { background: #C46A2A; color: white; }
.btn-primary:hover { background: #a85722; }
.btn-outline-dark { background: white; border: 1px solid rgba(15,18,16,.18); color: #374151; }

@media (max-width: 768px) {
  .community-layout { grid-template-columns: 1fr; }
  .rooms-sidebar { position: fixed; top: 64px; left: 0; bottom: 0; width: 260px; z-index: 200; transform: translateX(-100%); transition: transform .25s; }
  .rooms-sidebar.sidebar-open { transform: translateX(0); }
  .sidebar-close { display: block; }
  .mobile-header { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: white; border-bottom: 1px solid rgba(15,18,16,.1); }
  .btn-menu { background: none; border: none; font-size: 1.3rem; cursor: pointer; }
  .channel-title { font-weight: 800; }
}
</style>
