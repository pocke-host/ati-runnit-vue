<!-- ========== StoriesViewer.vue ========== -->
<template>
    <div class="stories-viewer">
      <!-- Stories Ring (Top Bar) -->
      <div class="stories-ring">
        <div class="stories-scroll">
          <!-- Add Story Button -->
          <div class="story-ring" @click="openCreateStoryModal">
            <div class="ring-avatar ring-add">
              <i class="bi bi-plus-lg"></i>
            </div>
            <div class="ring-name">Your Story</div>
          </div>
  
          <!-- Story Rings -->
          <div 
            v-for="userGroup in storyGroups" 
            :key="userGroup.userId"
            class="story-ring"
            @click="openStoryViewer(userGroup)"
          >
            <div :class="['ring-avatar', { 'has-unviewed': userGroup.hasUnviewed }]">
              <div class="avatar-initial">{{ getUserInitial(userGroup.userDisplayName) }}</div>
            </div>
            <div class="ring-name">{{ userGroup.userDisplayName }}</div>
          </div>
        </div>
      </div>
  
      <!-- Story Viewer Modal -->
      <div v-if="viewingStory" class="story-modal" @click="closeStoryViewer">
        <div class="story-container" @click.stop>
          <!-- Progress Bars -->
          <div class="story-progress">
            <div 
              v-for="(story, index) in currentUserStories" 
              :key="story.id"
              class="progress-segment"
            >
              <div 
                :class="['progress-fill', { 
                  active: index === currentStoryIndex,
                  complete: index < currentStoryIndex
                }]"
                :style="{ width: getProgressWidth(index) }"
              ></div>
            </div>
          </div>
  
          <!-- Story Header -->
          <div class="story-header">
            <div class="story-user">
              <div class="story-avatar">{{ getUserInitial(currentStory.userDisplayName) }}</div>
              <div class="story-user-info">
                <div class="story-username">{{ currentStory.userDisplayName }}</div>
                <div class="story-time">{{ formatTimeAgo(currentStory.createdAt) }}</div>
              </div>
            </div>
  
            <button class="story-close" @click="closeStoryViewer">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
  
          <!-- Story Media -->
          <div class="story-media" @click="nextStory">
            <img 
              v-if="currentStory.mediaType === 'PHOTO'" 
              :src="currentStory.mediaUrl" 
              :alt="currentStory.userDisplayName" 
              @load="onMediaLoad"
            />
            <video 
              v-else-if="currentStory.mediaType === 'VIDEO'"
              :src="currentStory.mediaUrl"
              autoplay
              @ended="nextStory"
              @loadeddata="onMediaLoad"
            ></video>
          </div>
  
          <!-- Caption -->
          <div v-if="currentStory.caption" class="story-caption">
            {{ currentStory.caption }}
          </div>
  
          <!-- Navigation -->
          <button class="story-nav story-nav-prev" @click.stop="previousStory">
            <i class="bi bi-chevron-left"></i>
          </button>
          <button class="story-nav story-nav-next" @click.stop="nextStory">
            <i class="bi bi-chevron-right"></i>
          </button>
  
          <!-- View Count (if owner) -->
          <div v-if="currentStory.isOwner" class="story-views" @click.stop="showViewers">
            <i class="bi bi-eye me-2"></i>{{ currentStory.viewCount }} views
          </div>
        </div>
      </div>
  
      <!-- Create Story Modal -->
      <div v-if="showCreateModal" class="modal-overlay" @click="closeCreateStoryModal">
        <div class="modal-card" @click.stop>
          <div class="modal-header">
            <h3>Create Story</h3>
            <button class="modal-close" @click="closeCreateStoryModal">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
  
          <form @submit.prevent="handleCreateStory" class="modal-body">
            <div class="form-group">
              <label class="form-label">Photo/Video *</label>
              <div v-if="!storyPreview" class="upload-area" @click="triggerFileInput">
                <i class="bi bi-camera" style="font-size: 48px;"></i>
                <p>Tap to take photo or upload</p>
              </div>
              <div v-else class="story-preview">
                <img v-if="storyMediaType === 'PHOTO'" :src="storyPreview" alt="Preview" />
                <video v-else :src="storyPreview" controls></video>
                <button type="button" class="btn btn-sm btn-danger remove-btn" @click="removeStoryMedia">
                  <i class="bi bi-x"></i> Remove
                </button>
              </div>
              <input 
                ref="fileInput"
                type="file" 
                accept="image/*,video/*" 
                @change="handleMediaSelect"
                style="display: none"
              />
            </div>
  
            <div class="form-group">
              <label class="form-label">Caption <span class="optional">(optional)</span></label>
              <textarea 
                v-model="storyCaption" 
                class="form-control"
                placeholder="Add a caption..."
                rows="3"
                maxlength="500"
              ></textarea>
            </div>
  
            <div class="form-group">
              <label class="form-label">Visibility</label>
              <select v-model="storyVisibility" class="form-control">
                <option value="PUBLIC">Everyone</option>
                <option value="CLOSE_FRIENDS">Close Friends</option>
              </select>
            </div>
  
            <div v-if="storyError" class="alert alert-danger">
              {{ storyError }}
            </div>
  
            <div class="modal-actions">
              <button type="button" class="btn btn-outline" @click="closeCreateStoryModal">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" :disabled="storyLoading || !storyPreview">
                <span v-if="storyLoading" class="spinner-border spinner-border-sm me-2"></span>
                {{ storyLoading ? 'Posting...' : 'Post Story' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, onUnmounted } from 'vue'
  import axios from 'axios'
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
  
  const storyGroups = ref([])
  const viewingStory = ref(false)
  const currentUserGroup = ref(null)
  const currentStoryIndex = ref(0)
  const storyProgress = ref(0)
  const progressInterval = ref(null)
  
  const showCreateModal = ref(false)
  const storyPreview = ref(null)
  const storyMediaType = ref(null)
  const storyFile = ref(null)
  const storyCaption = ref('')
  const storyVisibility = ref('PUBLIC')
  const storyLoading = ref(false)
  const storyError = ref('')
  const fileInput = ref(null)
  
  const STORY_DURATION = 5000 // 5 seconds
  
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }
  
  const currentUserStories = computed(() => {
    return currentUserGroup.value?.stories || []
  })
  
  const currentStory = computed(() => {
    return currentUserStories.value[currentStoryIndex.value] || {}
  })
  
  const getUserInitial = (name) => {
    return name?.charAt(0).toUpperCase() || 'U'
  }
  
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const hours = Math.floor(diff / (1000 * 60 * 60))
  
    if (hours < 1) return 'Just now'
    if (hours === 1) return '1h ago'
    return `${hours}h ago`
  }
  
  const fetchStories = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/stories/feed`, {
        headers: getAuthHeaders()
      })
      storyGroups.value = data
    } catch (err) {
      console.error('Failed to fetch stories:', err)
    }
  }
  
  const openStoryViewer = (userGroup) => {
    currentUserGroup.value = userGroup
    currentStoryIndex.value = 0
    viewingStory.value = true
    startProgress()
    markStoryAsViewed()
  }
  
  const closeStoryViewer = () => {
    viewingStory.value = false
    currentUserGroup.value = null
    currentStoryIndex.value = 0
    stopProgress()
  }
  
  const nextStory = () => {
    if (currentStoryIndex.value < currentUserStories.value.length - 1) {
      currentStoryIndex.value++
      resetProgress()
      markStoryAsViewed()
    } else {
      // Move to next user's stories
      const currentUserIndex = storyGroups.value.findIndex(
        g => g.userId === currentUserGroup.value.userId
      )
      if (currentUserIndex < storyGroups.value.length - 1) {
        openStoryViewer(storyGroups.value[currentUserIndex + 1])
      } else {
        closeStoryViewer()
      }
    }
  }
  
  const previousStory = () => {
    if (currentStoryIndex.value > 0) {
      currentStoryIndex.value--
      resetProgress()
    }
  }
  
  const startProgress = () => {
    storyProgress.value = 0
    progressInterval.value = setInterval(() => {
      storyProgress.value += 100 / (STORY_DURATION / 100)
      if (storyProgress.value >= 100) {
        nextStory()
      }
    }, 100)
  }
  
  const stopProgress = () => {
    if (progressInterval.value) {
      clearInterval(progressInterval.value)
      progressInterval.value = null
    }
  }
  
  const resetProgress = () => {
    stopProgress()
    storyProgress.value = 0
    startProgress()
  }
  
  const getProgressWidth = (index) => {
    if (index < currentStoryIndex.value) return '100%'
    if (index === currentStoryIndex.value) return `${storyProgress.value}%`
    return '0%'
  }
  
  const onMediaLoad = () => {
    // Media loaded, ensure progress is running
    if (!progressInterval.value) {
      startProgress()
    }
  }
  
  const markStoryAsViewed = async () => {
    if (!currentStory.value.id || currentStory.value.hasViewed || currentStory.value.isOwner) {
      return
    }
  
    try {
      await axios.post(
        `${API_URL}/stories/${currentStory.value.id}/view`,
        {},
        { headers: getAuthHeaders() }
      )
      currentStory.value.hasViewed = true
    } catch (err) {
      console.error('Failed to mark story as viewed:', err)
    }
  }
  
  const showViewers = () => {
    // TODO: Show viewers modal
    alert(`${currentStory.value.viewCount} people viewed this story`)
  }
  
  // Create Story Functions
  const openCreateStoryModal = () => {
    showCreateModal.value = true
  }
  
  const closeCreateStoryModal = () => {
    showCreateModal.value = false
    storyPreview.value = null
    storyMediaType.value = null
    storyFile.value = null
    storyCaption.value = ''
    storyVisibility.value = 'PUBLIC'
    storyError.value = ''
  }
  
  const triggerFileInput = () => {
    fileInput.value.click()
  }
  
  const handleMediaSelect = (event) => {
    const file = event.target.files[0]
    if (!file) return
  
    storyFile.value = file
    storyMediaType.value = file.type.startsWith('image/') ? 'PHOTO' : 'VIDEO'
  
    const reader = new FileReader()
    reader.onload = (e) => {
      storyPreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
  
  const removeStoryMedia = () => {
    storyFile.value = null
    storyPreview.value = null
    storyMediaType.value = null
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
  
  const handleCreateStory = async () => {
    storyLoading.value = true
    storyError.value = ''
  
    try {
      // Upload media to S3
      const formData = new FormData()
      formData.append('file', storyFile.value)
  
      const uploadRes = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'multipart/form-data'
        }
      })
  
      // Create story
      await axios.post(
        `${API_URL}/stories`,
        {
          mediaUrl: uploadRes.data.url,
          mediaType: storyMediaType.value,
          caption: storyCaption.value || null,
          visibility: storyVisibility.value
        },
        { headers: getAuthHeaders() }
      )
  
      closeCreateStoryModal()
      fetchStories()
    } catch (err) {
      storyError.value = err.response?.data?.error || 'Failed to create story'
    } finally {
      storyLoading.value = false
    }
  }
  
  onMounted(() => {
    fetchStories()
  })
  
  onUnmounted(() => {
    stopProgress()
  })
  </script>
  
  <style scoped>
  .stories-viewer {
    --r-olive: #5A6B4E;
    --r-accent: #C46A2A;
  }
  
  /* Stories Ring */
  .stories-ring {
    background: rgba(255,255,255,0.95);
    border-bottom: 1px solid rgba(15,18,16,0.10);
    padding: 16px 0;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  .stories-scroll {
    display: flex;
    gap: 16px;
    padding: 0 20px;
    min-width: min-content;
  }
  
  .story-ring {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    flex-shrink: 0;
  }
  
  .ring-avatar {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    padding: 3px;
    background: linear-gradient(45deg, #C46A2A, #f59e0b);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s;
  }
  
  .story-ring:hover .ring-avatar {
    transform: scale(1.05);
  }
  
  .ring-avatar.has-unviewed {
    background: linear-gradient(45deg, #C46A2A, #f59e0b);
  }
  
  .ring-avatar:not(.has-unviewed) {
    background: #e5e7eb;
  }
  
  .ring-avatar.ring-add {
    background: var(--r-olive);
  }
  
  .avatar-initial {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 900;
    font-size: 1.5rem;
    color: rgba(15,18,16,0.70);
  }
  
  .ring-add {
    background: white !important;
    border: 2px dashed var(--r-olive);
    color: var(--r-olive);
    font-size: 2rem;
  }
  
  .ring-name {
    font-size: 0.8rem;
    font-weight: 600;
    color: rgba(15,18,16,0.80);
    max-width: 72px;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  /* Story Modal */
  .story-modal {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: rgba(0,0,0,0.95);
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.3s ease;
  }
  
  .story-container {
    position: relative;
    width: 100%;
    max-width: 500px;
    height: 90vh;
    background: black;
    border-radius: 20px;
    overflow: hidden;
  }
  
  .story-progress {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    display: flex;
    gap: 4px;
    padding: 8px;
    z-index: 2;
  }
  
  .progress-segment {
    flex: 1;
    height: 3px;
    background: rgba(255,255,255,0.3);
    border-radius: 2px;
    overflow: hidden;
  }
  
  .progress-fill {
    height: 100%;
    background: white;
    transition: width 0.1s linear;
  }
  
  .progress-fill.complete {
    width: 100% !important;
  }
  
  .story-header {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 48px 16px 16px;
    background: linear-gradient(to bottom, rgba(0,0,0,0.6), transparent);
    z-index: 2;
  }
  
  .story-user {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .story-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--r-olive), var(--r-olive-deep));
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 900;
    color: white;
    font-size: 1rem;
  }
  
  .story-user-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  
  .story-username {
    font-weight: 700;
    color: white;
    font-size: 0.95rem;
  }
  
  .story-time {
    font-size: 0.75rem;
    color: rgba(255,255,255,0.70);
  }
  
  .story-close {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(255,255,255,0.2);
    border: none;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .story-close:hover {
    background: rgba(255,255,255,0.3);
  }
  
  .story-media {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
  
  .story-media img,
  .story-media video {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
  
  .story-caption {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 20px;
    background: linear-gradient(to top, rgba(0,0,0,0.6), transparent);
    color: white;
    font-size: 0.95rem;
    line-height: 1.4;
    z-index: 2;
  }
  
  .story-nav {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: rgba(255,255,255,0.2);
    border: none;
    color: white;
    font-size: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    z-index: 3;
  }
  
  .story-nav:hover {
    background: rgba(255,255,255,0.3);
  }
  
  .story-nav-prev {
    left: 16px;
  }
  
  .story-nav-next {
    right: 16px;
  }
  
  .story-views {
    position: absolute;
    bottom: 20px;
    left: 20px;
    padding: 8px 16px;
    background: rgba(0,0,0,0.6);
    border-radius: 20px;
    color: white;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    z-index: 2;
  }
  
  .story-views:hover {
    background: rgba(0,0,0,0.8);
  }
  
  /* Modal styles (reuse from previous components) */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15,18,16,0.70);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    padding: 20px;
    animation: fadeIn 0.2s ease;
  }
  
  .modal-card {
    background: rgba(255,255,255,0.98);
    border-radius: 24px;
    max-width: 500px;
    width: 100%;
    max-height: 90vh;
    overflow: auto;
    animation: slideUp 0.3s ease;
  }
  
  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    border-bottom: 1px solid rgba(15,18,16,0.10);
  }
  
  .modal-header h3 {
    font-weight: 900;
    font-size: 1.3rem;
    margin: 0;
  }
  
  .modal-close {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 1px solid rgba(15,18,16,0.14);
    background: rgba(255,255,255,0.60);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .modal-close:hover {
    background: rgba(255,255,255,0.90);
    transform: rotate(90deg);
  }
  
  .modal-body {
    padding: 24px;
  }
  
  .form-group {
    margin-bottom: 20px;
  }
  
  .form-label {
    display: block;
    font-weight: 900;
    font-size: 0.9rem;
    margin-bottom: 8px;
  }
  
  .optional {
    font-weight: 500;
    font-size: 0.85rem;
    color: rgba(15,18,16,0.50);
  }
  
  .form-control {
    width: 100%;
    padding: 12px 14px;
    border: 1px solid rgba(15,18,16,0.16);
    border-radius: 12px;
    background: rgba(255,255,255,0.70);
    font-family: inherit;
    font-size: 0.95rem;
    transition: all 0.2s;
  }
  
  .form-control:focus {
    outline: none;
    border-color: var(--r-accent);
    box-shadow: 0 0 0 3px rgba(196,106,42,0.12);
    background: rgba(255,255,255,0.95);
  }
  
  .upload-area {
    border: 2px dashed rgba(15,18,16,0.20);
    border-radius: 16px;
    padding: 60px 20px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s;
    background: rgba(255,255,255,0.50);
  }
  
  .upload-area:hover {
    border-color: var(--r-accent);
    background: rgba(196,106,42,0.08);
  }
  
  .upload-area i {
    color: rgba(15,18,16,0.30);
    margin-bottom: 12px;
  }
  
  .upload-area p {
    color: rgba(15,18,16,0.60);
    margin: 0;
  }
  
  .story-preview {
    position: relative;
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid rgba(15,18,16,0.12);
  }
  
  .story-preview img,
  .story-preview video {
    width: 100%;
    height: auto;
    display: block;
  }
  
  .remove-btn {
    position: absolute;
    top: 12px;
    right: 12px;
  }
  
  .alert {
    padding: 12px 14px;
    border-radius: 12px;
    margin-bottom: 16px;
  }
  
  .alert-danger {
    background: rgba(239,68,68,0.12);
    border: 1px solid rgba(239,68,68,0.30);
    color: #991b1b;
    font-weight: 600;
  }
  
  .modal-actions {
    display: flex;
    gap: 12px;
    margin-top: 24px;
  }
  
  .modal-actions .btn {
    flex: 1;
  }
  
  .btn {
    height: 44px;
    border-radius: 14px;
    font-weight: 900;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid;
    padding: 0 20px;
  }
  
  .btn-primary {
    background: linear-gradient(135deg, var(--r-accent), #a85722);
    border-color: var(--r-accent);
    color: white;
  }
  
  .btn-primary:hover:not(:disabled) {
    background: linear-gradient(135deg, #a85722, #914a1e);
  }
  
  .btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .btn-outline {
    background: transparent;
    border-color: rgba(15,18,16,0.20);
    color: rgba(15,18,16,0.80);
  }
  
  .btn-outline:hover {
    background: rgba(15,18,16,0.05);
  }
  
  .btn-sm {
    height: 36px;
    padding: 0 12px;
    font-size: 0.85rem;
  }
  
  .btn-danger {
    background: #dc3545;
    border-color: #dc3545;
    color: white;
  }
  
  .me-2 {
    margin-right: 8px;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  </style>