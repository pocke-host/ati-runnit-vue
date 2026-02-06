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
          <div v-if="!photoPreview" class="upload-area" @click="triggerFileInput">
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

        <!-- Song Info -->
        <div class="form-group">
          <label class="form-label">Song Title *</label>
          <input 
            v-model="form.songTitle" 
            type="text" 
            class="form-control"
            placeholder="What's your workout song?"
            required 
          />
        </div>

        <div class="form-group">
          <label class="form-label">Artist *</label>
          <input 
            v-model="form.songArtist" 
            type="text" 
            class="form-control"
            placeholder="Artist name"
            required 
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
import { storeToRefs } from 'pinia'

const router = useRouter()
const route = useRoute()
const momentStore = useMomentStore()
const uploadStore = useUploadStore()

const { uploading, progress: uploadProgress } = storeToRefs(uploadStore)

const form = ref({
  activityId: route.query.activityId || null,
  photoUrl: '',
  routeSnapshotUrl: '',
  songTitle: '',
  songArtist: '',
  songLink: ''
})

const photoFile = ref(null)
const photoPreview = ref(null)
const routeFile = ref(null)
const error = ref('')
const fileInput = ref(null)

const triggerFileInput = () => {
  fileInput.value.click()
}

const handlePhotoSelect = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  photoFile.value = file
  
  const reader = new FileReader()
  reader.onload = (e) => {
    photoPreview.value = e.target.result
  }
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
    router.push('/feed')
    
  } catch (err) {
    error.value = err.message || 'Failed to create moment'
  }
}
</script>

<style scoped>
.create-moment-page {
  --r-olive: #5A6B4E;
  --r-olive-deep: #2C3726;
  --r-accent: #C46A2A;
  --r-offwhite: #F5F6F3;
  
  min-height: 100vh;
  background: radial-gradient(900px 420px at 18% 12%, rgba(90,107,78,0.18), rgba(90,107,78,0) 60%),
              radial-gradient(900px 420px at 85% 20%, rgba(196,106,42,0.10), rgba(196,106,42,0) 60%),
              var(--r-offwhite);
  padding: 40px 20px;
  font-family: Futura, "Futura PT", "Futura Std", "Avenir Next", Avenir, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
}

.moment-card {
  max-width: 600px;
  margin: 0 auto;
  background: radial-gradient(700px 220px at 30% 0%, rgba(196,106,42,0.08), rgba(196,106,42,0) 60%),
              linear-gradient(135deg, rgba(255,255,255,0.98), rgba(255,255,255,0.95));
  border-radius: 24px;
  border: 1px solid rgba(15,18,16,0.12);
  box-shadow: 0 20px 60px rgba(15,18,16,0.15);
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
  border-radius: 50%;
  border: 1px solid rgba(15,18,16,0.14);
  background: rgba(255,255,255,0.60);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1.2rem;
}

.back-btn:hover {
  background: rgba(255,255,255,0.90);
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
  font-weight: 600;
}

.photo-preview {
  position: relative;
  border-radius: 16px;
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
  border-radius: 12px;
  background: rgba(255,255,255,0.70);
  font-family: inherit;
  font-size: 0.95rem;
  transition: all 0.2s;
  color: rgba(15,18,16,0.90);
}

.form-control:focus {
  outline: none;
  border-color: var(--r-accent);
  box-shadow: 0 0 0 3px rgba(196,106,42,0.12);
  background: rgba(255,255,255,0.95);
}

.form-control::placeholder {
  color: rgba(15,18,16,0.40);
}

.alert {
  padding: 14px 16px;
  border-radius: 12px;
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
  background: rgba(255,255,255,0.60);
  color: rgba(15,18,16,0.78);
  border-radius: 14px;
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
  transform: translateY(-1px);
  border-color: rgba(15,18,16,0.18);
  background: rgba(255,255,255,0.72);
}

.btn-primary {
  height: 52px;
  background: radial-gradient(700px 220px at 30% 0%, rgba(255,255,255,0.18), rgba(255,255,255,0) 60%),
              linear-gradient(135deg, var(--r-accent), #a85722);
  border-color: rgba(15,18,16,0.12);
  color: rgba(255,255,255,0.96);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #a85722, #914a1e);
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
</style>