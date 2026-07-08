<template>
  <div class="create-moment-page">
    <div class="moment-card">
      <div class="moment-header">
        <h2>Share Your Workout Moment</h2>
        <button class="back-btn" @click="$router.back()">
          <i class="bi bi-arrow-left"></i>
        </button>
      </div>
      
      <form @submit.prevent="handleSubmit">
        <!-- Media Upload (photo or video) -->
        <div class="form-group">
          <label class="form-label">Photo or Video *</label>

          <div v-if="!photoPreview" class="upload-area" @click="pickPhoto">
            <i class="bi bi-camera" style="font-size: 48px;"></i>
            <p>Tap to add a photo or video</p>
            <span class="upload-hint">Max 50 MB · JPG, PNG, MP4, MOV</span>
          </div>

          <!-- Video preview -->
          <div v-else-if="photoPreview.startsWith('data:video')" class="media-preview media-preview--video">
            <video :src="photoPreview" controls playsinline class="video-preview"></video>
            <button type="button" class="remove-btn" @click="removePhoto">
              <i class="bi bi-x"></i>
            </button>
          </div>

          <!-- Image preview -->
          <div v-else class="media-preview">
            <img :src="photoPreview" alt="Preview" />
            <button type="button" class="remove-btn" @click="removePhoto">
              <i class="bi bi-x"></i>
            </button>
          </div>

          <input
            ref="fileInput"
            type="file"
            accept="image/*,video/*"
            @change="handlePhotoSelect"
            style="display: none"
          />
        </div>

        <!-- Route Snapshot (Optional) -->
        <div class="form-group">
          <label class="form-label">Route Snapshot <span class="optional">(optional)</span></label>
          <input 
            type="file"
            accept="image/*"
            @change="handleRouteSelect"
            class="form-control"
          />
        </div>

        <!-- Caption -->
        <div class="form-group">
          <label class="form-label">Caption <span class="optional">(optional)</span></label>
          <textarea
            v-model="form.caption"
            class="form-control form-textarea"
            placeholder="What's on your mind?"
            maxlength="500"
            rows="3"
          ></textarea>
          <div class="char-count">{{ form.caption?.length ?? 0 }} / 500</div>
        </div>

        <!-- Song Info (optional) -->
        <div class="song-section">
          <button type="button" class="song-toggle" @click="showSong = !showSong">
            <i :class="showSong ? 'bi bi-chevron-up' : 'bi bi-music-note-beamed'"></i>
            {{ showSong ? 'Hide song info' : 'Add a song' }}
          </button>

          <div v-if="showSong" class="song-fields">
            <div class="form-group">
              <label class="form-label">Song Title</label>
              <input
                v-model="form.songTitle"
                type="text"
                class="form-control"
                placeholder="What's your workout song?"
                maxlength="255"
              />
            </div>
            <div class="form-group">
              <label class="form-label">Artist</label>
              <input
                v-model="form.songArtist"
                type="text"
                class="form-control"
                placeholder="Artist name"
                maxlength="255"
              />
            </div>
            <div class="form-group">
              <label class="form-label">Song Link <span class="optional">(optional)</span></label>
              <input
                v-model="form.songLink"
                type="url"
                class="form-control"
                placeholder="https://spotify.com/..."
              />
            </div>
          </div>
        </div>

        <!-- Error Display -->
        <div v-if="error" class="alert alert-danger">{{ error }}</div>

        <!-- Submit Button -->
        <button
          type="submit"
          class="btn-post"
          :disabled="uploading || !photoPreview"
        >
          <span v-if="uploading" class="spinner-border spinner-border-sm me-2"></span>
          {{ uploading ? `Uploading... ${uploadProgress}%` : 'Post Moment' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMomentStore } from '@/stores/moment'
import { useUploadStore } from '@/stores/upload'
import { useToast } from '@/composables/useToast'
import { storeToRefs } from 'pinia'
import { Capacitor } from '@capacitor/core'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'

const isNative = Capacitor.isNativePlatform()

const router = useRouter()
const route = useRoute()
const momentStore = useMomentStore()
const uploadStore = useUploadStore()
const { showToast } = useToast()

const { uploading, progress: uploadProgress } = storeToRefs(uploadStore)

const showSong = ref(false)

const form = ref({
  activityId: route.query.activityId || null,
  photoUrl: '',
  routeSnapshotUrl: '',
  caption: '',
  songTitle: '',
  songArtist: '',
  songLink: ''
})

const photoFile = ref(null)
const photoPreview = ref(null)
const routeFile = ref(null)
const error = ref('')
const fileInput = ref(null)

// Convert a base64 data URI to a File object for the upload store
const base64ToFile = (base64, mimeType = 'image/jpeg') => {
  const byteString = atob(base64)
  const ab = new ArrayBuffer(byteString.length)
  const ia = new Uint8Array(ab)
  for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i)
  const ext = mimeType.split('/')[1] || 'jpg'
  return new File([ab], `moment_${Date.now()}.${ext}`, { type: mimeType })
}

const pickPhoto = async () => {
  if (isNative) {
    // Native iOS/Android: show action sheet — camera or library
    try {
      const photo = await Camera.getPhoto({
        quality: 85,
        resultType: CameraResultType.Base64,
        source: CameraSource.Prompt,   // prompts: Take Photo / Choose Photo
        correctOrientation: true,
        width: 1080,
      })
      const mimeType = `image/${photo.format}`
      const file = base64ToFile(photo.base64String, mimeType)
      photoFile.value = file
      photoPreview.value = `data:${mimeType};base64,${photo.base64String}`
    } catch (err) {
      if (!err.message?.includes('cancelled')) {
        showToast('Camera failed to open. Please try again.', 'error')
      }
    }
  } else {
    // Reset so re-selecting the same file fires @change
    if (fileInput.value) fileInput.value.value = ''
    fileInput.value.click()
  }
}

const handlePhotoSelect = (event) => {
  const file = event.target.files[0]
  if (!file) return
  photoFile.value = file
  const reader = new FileReader()
  reader.onload = (e) => { photoPreview.value = e.target.result }
  reader.readAsDataURL(file)
}

const removePhoto = () => {
  photoFile.value = null
  photoPreview.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const handleRouteSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    routeFile.value = file
  }
}

const handleSubmit = async () => {
  error.value = ''

  try {
    form.value.photoUrl = await uploadStore.uploadImage(photoFile.value)

    if (routeFile.value) {
      form.value.routeSnapshotUrl = await uploadStore.uploadImage(routeFile.value)
    }

    await momentStore.createMoment(form.value)
    showToast('Moment shared!', 'success')
    router.push('/feed')
  } catch (err) {
    const msg = err.response?.data?.error || err.message || 'Failed to share moment'
    error.value = msg
    showToast(msg, 'error')
  }
}
</script>

<style scoped>
.create-moment-page {
  min-height: 100vh;
  background: #FBF6EC;
  padding-top: var(--nav-h, 66px);
  padding-bottom: 80px;
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
}

.moment-card {
  max-width: 600px;
  margin: 32px auto 0;
  background: #fff;
  border: 2px solid #16130F;
  box-shadow: 6px 6px 0 #16130F;
  padding: 32px;
}

.moment-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 2px solid #E7DFCE;
}

.moment-header h2 {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-weight: 900;
  font-size: clamp(1.4rem, 4vw, 1.8rem);
  text-transform: uppercase;
  line-height: 0.9;
  color: #16130F;
  margin: 0;
}

.back-btn {
  width: 40px;
  height: 40px;
  border: 2px solid #16130F;
  background: #FBF6EC;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.1rem;
  color: #16130F;
  transition: background 0.15s;
}
.back-btn:hover { background: #F1EADC; }

.form-group { margin-bottom: 24px; }

.form-label {
  display: block;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-weight: 700;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #5A5348;
  margin-bottom: 10px;
}

.optional {
  font-weight: 500;
  font-size: 0.85rem;
  color: #8A8A8A;
  text-transform: none;
  letter-spacing: 0;
}

.upload-area {
  border: 2px dashed #16130F;
  padding: 56px 20px;
  text-align: center;
  cursor: pointer;
  background: #FBF6EC;
  transition: background 0.15s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.upload-area:hover { background: #F1EADC; }
.upload-area i { color: #5A5348; }
.upload-area p { color: #16130F; font-weight: 700; margin: 0; font-size: 0.95rem; }
.upload-hint {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #8A8A8A;
}

.media-preview {
  position: relative;
  border: 2px solid #16130F;
  overflow: hidden;
}
.media-preview img {
  width: 100%;
  height: auto;
  display: block;
}
.media-preview--video { background: #16130F; }
.video-preview {
  width: 100%;
  max-height: 400px;
  display: block;
  background: #000;
}

.remove-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 32px;
  height: 32px;
  background: #16130F;
  color: #FBF6EC;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1rem;
}
.remove-btn:hover { background: #C0392B; }

.form-control {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #16130F;
  background: #fff;
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
  font-size: 0.95rem;
  color: #16130F;
  transition: border-color 0.15s;
}
.form-control:focus {
  outline: none;
  border-color: #2A55F5;
}
.form-control::placeholder { color: #8A8A8A; }
.form-textarea { resize: vertical; min-height: 80px; }

.char-count {
  text-align: right;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #8A8A8A;
  margin-top: 4px;
}

.song-section {
  margin-bottom: 24px;
  border: 2px solid #E7DFCE;
  padding: 16px;
}
.song-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.72rem;
  font-weight: 700;
  color: #5A5348;
  cursor: pointer;
  padding: 0;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.song-toggle:hover { color: #16130F; }
.song-fields { margin-top: 16px; display: flex; flex-direction: column; gap: 0; }
.song-fields .form-group { margin-bottom: 16px; }

.alert { padding: 14px 16px; margin-bottom: 20px; }
.alert-danger {
  background: rgba(192,57,43,0.08);
  border: 2px solid #C0392B;
  color: #C0392B;
  font-weight: 600;
}

.btn-post {
  display: block;
  width: 100%;
  padding: 16px 24px;
  background: #2A55F5;
  color: #fff;
  border: 2px solid #16130F;
  border-radius: 999px;
  box-shadow: 4px 4px 0 #16130F;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-post:hover:not(:disabled) { background: #1E42D6; }
.btn-post:disabled { opacity: 0.45; cursor: not-allowed; box-shadow: none; }

.me-2 { margin-right: 8px; }

@media (max-width: 600px) {
  .create-moment-page {
    padding: calc(var(--nav-h, 66px) + 12px) 0 80px;
  }
  .moment-card {
    margin: 0;
    border-left: none;
    border-right: none;
    box-shadow: none;
    padding: 20px 16px;
  }
  .upload-area { padding: 32px 16px; }
  .moment-header h2 { font-size: 1.2rem; }
}
</style>