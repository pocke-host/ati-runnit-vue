// ========== CreateMoment.vue ==========
<template>
  <div class="create-moment-container">
    <div class="card">
      <div class="card-body">
        <h2 class="mb-4">Share Your Workout Moment</h2>
        
        <form @submit.prevent="handleSubmit">
          <!-- Photo Upload -->
          <div class="mb-4">
            <label class="form-label">Photo *</label>
            <div v-if="!photoPreview" class="upload-area" @click="triggerFileInput">
              <i class="bi bi-camera" style="font-size: 48px;"></i>
              <p>Tap to take photo or upload</p>
            </div>
            <div v-else class="photo-preview">
              <img :src="photoPreview" alt="Preview" />
              <button type="button" class="btn btn-sm btn-danger" @click="removePhoto">
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
          <div class="mb-3">
            <label class="form-label">Route Snapshot (Optional)</label>
            <input 
              type="file"
              accept="image/*"
              @change="handleRouteSelect"
              class="form-control"
            />
          </div>

          <!-- Song Info -->
          <div class="mb-3">
            <label class="form-label">Song Title *</label>
            <input 
              v-model="form.songTitle" 
              type="text" 
              class="form-control"
              placeholder="What's your workout song?"
              required 
            />
          </div>

          <div class="mb-3">
            <label class="form-label">Artist *</label>
            <input 
              v-model="form.songArtist" 
              type="text" 
              class="form-control"
              placeholder="Artist name"
              required 
            />
          </div>

          <div class="mb-3">
            <label class="form-label">Song Link (Optional)</label>
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
            class="btn btn-primary w-100"
            :disabled="uploading || !photoPreview"
          >
            <span v-if="uploading" class="spinner-border spinner-border-sm me-2"></span>
            {{ uploading ? `Uploading ${uploadProgress}%` : 'Post Moment' }}
          </button>
        </form>
      </div>
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
  
  // Create preview
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
    // Upload photo
    form.value.photoUrl = await uploadStore.uploadImage(photoFile.value)
    
    // Upload route snapshot if provided
    if (routeFile.value) {
      form.value.routeSnapshotUrl = await uploadStore.uploadImage(routeFile.value)
    }
    
    // Create moment
    await momentStore.createMoment(form.value)
    
    // Redirect to feed
    router.push('/feed')
    
  } catch (err) {
    error.value = err.message || 'Failed to create moment'
  }
}
</script>

<style scoped>
.create-moment-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.upload-area {
  border: 2px dashed #ccc;
  border-radius: 12px;
  padding: 60px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.upload-area:hover {
  border-color: #800080;
  background: #f9f9f9;
}

.upload-area i {
  color: #ccc;
  margin-bottom: 12px;
}

.photo-preview {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
}

.photo-preview img {
  width: 100%;
  height: auto;
  display: block;
}

.photo-preview button {
  position: absolute;
  top: 12px;
  right: 12px;
}

.form-control:focus {
  border-color: #800080;
  box-shadow: 0 0 0 3px rgba(128,0,128,.22);
}

.btn-primary {
  height: 48px;
  background: #800080;
  border-color: #800080;
  font-weight: 600;
}

.btn-primary:hover {
  background: #6a006a;
  border-color: #6a006a;
}
</style>