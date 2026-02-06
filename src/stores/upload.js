// ========== upload.js ==========
import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

export const useUploadStore = defineStore('upload', () => {
  const uploading = ref(false)
  const progress = ref(0)
  const error = ref(null)
  
  async function uploadImage(file) {
    uploading.value = true
    progress.value = 0
    error.value = null
    
    try {
      // Step 1: Get presigned URL from backend
      const { data: signData } = await axios.post(`${API_URL}/uploads/sign`, {
        fileName: file.name,
        contentType: file.type
      })
      
      // Step 2: Upload directly to S3
      await axios.put(signData.uploadUrl, file, {
        headers: {
          'Content-Type': file.type
        },
        onUploadProgress: (progressEvent) => {
          progress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        }
      })
      
      // Return the public file URL
      return signData.fileUrl
      
    } catch (err) {
      error.value = err.response?.data?.error || 'Upload failed'
      throw err
    } finally {
      uploading.value = false
      progress.value = 0
    }
  }
  
  return { uploading, progress, error, uploadImage }
})