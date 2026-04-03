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
        <!-- Photo Upload -->
        <div class="form-group">
          <label class="form-label">Photo *</label>
          <div v-if="!photoPreview" class="upload-area" @click="pickPhoto">
            <i class="bi bi-camera" style="font-size: 48px;"></i>
            <p>Tap to take photo or upload</p>
          </div>
          <div v-else class="photo-preview">
            <img :src="photoPreview" alt="Preview" />
            <button type="button" class="btn btn-sm btn-danger remove-btn" @click="removePhoto">
              <i class="bi bi-x"></i> Remove
            </button>
          </div>
          <input 
            ref="fileInput"
            type="file" 
            accept="image/*" 
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
          class="btn btn-primary btn-full"
          :disabled="uploading || !photoPreview"
        >
          <span v-if="uploading" class="spinner-border spinner-border-sm me-2"></span>
          {{ uploading ? `Uploading ${uploadProgress}%` : 'Post Moment' }}
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
        console.error('Camera error:', err)
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
  background: #fff;
  padding: 40px 20px;
  font-family: Futura, "Futura PT", "Futura Std", "Avenir Next", Avenir, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
}

.moment-card {
  max-width: 600px;
  margin: 0 auto;
  background: #fff;
  border: 1px solid #E5E5E5;
  border-radius: 0;
  border: 1px solid rgba(15,18,16,0.12);
  box-shadow: none;
  padding: 32px;
}

.moment-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
}

.moment-header h2 {
  font-weight: 900;
  font-size: 1.5rem;
  color: rgba(15,18,16,0.92);
  margin: 0;
}

.back-btn {
  width: 40px;
  height: 40px;
  border-radius: 0;
  border: 1px solid rgba(15,18,16,0.14);
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1.2rem;
}

.back-btn:hover {
  background: #fff;
  transform: translateX(-2px);
}

.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  font-weight: 900;
  font-size: 0.95rem;
  margin-bottom: 10px;
  color: rgba(15,18,16,0.80);
}

.optional {
  font-weight: 500;
  font-size: 0.85rem;
  color: rgba(15,18,16,0.50);
}

.upload-area {
  border: 2px dashed rgba(15,18,16,0.20);
  border-radius: 0;
  padding: 60px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: #f9f9f9;
}

.upload-area:hover {
  border-color: #000;
  background: rgba(0,0,0,0.04);
}

.upload-area i {
  color: rgba(15,18,16,0.30);
  margin-bottom: 12px;
}

.upload-area p {
  color: rgba(15,18,16,0.60);
  margin: 0;
  font-weight: 600;
}

.photo-preview {
  position: relative;
  border-radius: 0;
  overflow: hidden;
  border: 1px solid rgba(15,18,16,0.12);
}

.photo-preview img {
  width: 100%;
  height: auto;
  display: block;
}

.remove-btn {
  position: absolute;
  top: 12px;
  right: 12px;
}

.form-control {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid rgba(15,18,16,0.16);
  border-radius: 0;
  background: var(--rk-paper, #ffffff);
  font-family: inherit;
  font-size: 0.95rem;
  transition: all 0.2s;
  color: rgba(15,18,16,0.90);
}

.form-control:focus {
  outline: none;
  border-color: #000;
  box-shadow: none;
  background: #fff;
}

.form-control::placeholder {
  color: rgba(15,18,16,0.40);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.char-count {
  text-align: right;
  font-size: 0.78rem;
  color: rgba(15,18,16,0.40);
  margin-top: 4px;
}

.song-section {
  margin-bottom: 24px;
  border: 1px solid #E5E5E5;
  padding: 16px;
}

.song-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  font-family: inherit;
  font-size: 0.88rem;
  font-weight: 700;
  color: rgba(15,18,16,0.65);
  cursor: pointer;
  padding: 0;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.song-toggle:hover { color: #000; }

.song-fields {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 0;
}
.song-fields .form-group { margin-bottom: 16px; }

.alert {
  padding: 14px 16px;
  border-radius: 0;
  margin-bottom: 20px;
}

.alert-danger {
  background: rgba(239,68,68,0.12);
  border: 1px solid rgba(239,68,68,0.30);
  color: #991b1b;
  font-weight: 600;
}

.btn {
  border: 1px solid rgba(15,18,16,0.14);
  background: #f5f5f5;
  color: rgba(15,18,16,0.78);
  border-radius: 0;
  height: 44px;
  padding: 0 16px;
  font-weight: 900;
  letter-spacing: 0.02em;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:hover {
  border-color: #E5E5E5;
  background: #fff;
}

.btn-primary {
  height: 52px;
  background: #000;
  border-color: rgba(15,18,16,0.12);
  color: rgba(255,255,255,0.96);
}

.btn-primary:hover {
  background: #333;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-full {
  width: 100%;
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

@media (max-width: 600px) {
  .create-moment-page {
    padding: calc(var(--nav-h, 64px) + 12px) 12px 32px;
  }
  .moment-card {
    padding: 20px 16px;
  }
  .upload-area {
    padding: 32px 16px;
  }
  .moment-header h2 {
    font-size: 1.2rem;
  }
}
</style>