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
      
      // Step 2: Upload directly to S3.
      // Must use XHR (not axios) — axios sends the global Authorization header,
      // which causes S3 to reject the presigned URL with SignatureDoesNotMatch.
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            progress.value = Math.round((e.loaded / e.total) * 100)
          }
        })
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve()
          else reject(new Error(`S3 upload failed: ${xhr.status} ${xhr.statusText}`))
        })
        xhr.addEventListener('error', () => reject(new Error('S3 upload network error')))
        xhr.addEventListener('abort', () => reject(new Error('S3 upload cancelled')))
        xhr.open('PUT', signData.uploadUrl)
        xhr.setRequestHeader('Content-Type', file.type)
        xhr.send(file)
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