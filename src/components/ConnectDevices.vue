<!-- ========== ConnectDevices.vue ========== -->
<template>
    <div class="connect-devices">
      <h2>Connect Your Devices</h2>
      <p>Automatically sync your workouts from your favorite fitness platforms</p>
  
      <div class="devices-grid">
        <!-- Garmin -->
        <div class="device-card">
          <div class="device-icon">🏃</div>
          <h3>Garmin</h3>
          <p>Sync runs, rides, and more</p>
          
          <button 
            v-if="!garminConnected" 
            class="btn btn-primary"
            @click="connectGarmin"
            :disabled="loading"
          >
            Connect Garmin
          </button>
          <button 
            v-else 
            class="btn btn-outline"
            @click="disconnectGarmin"
          >
            <i class="bi bi-check-circle me-2"></i>Connected
          </button>
        </div>
  
        <!-- Strava -->
        <div class="device-card">
          <div class="device-icon">🚴</div>
          <h3>Strava</h3>
          <p>Sync activities from Strava</p>
          
          <button 
            v-if="!stravaConnected" 
            class="btn btn-primary"
            @click="connectStrava"
            :disabled="loading"
          >
            Connect Strava
          </button>
          <button 
            v-else 
            class="btn btn-outline"
            @click="disconnectStrava"
          >
            <i class="bi bi-check-circle me-2"></i>Connected
          </button>
        </div>
  
        <!-- Apple Watch (Coming Soon) -->
        <div class="device-card device-disabled">
          <div class="device-icon">⌚</div>
          <h3>Apple Watch</h3>
          <p>Coming soon</p>
          <button class="btn btn-outline" disabled>
            Coming Soon
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import axios from 'axios'
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
  
  const garminConnected = ref(false)
  const stravaConnected = ref(false)
  const loading = ref(false)
  
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }
  
  const checkConnectionStatus = async () => {
    try {
      const [garminRes, stravaRes] = await Promise.all([
        axios.get(`${API_URL}/integrations/garmin/status`, { headers: getAuthHeaders() }),
        axios.get(`${API_URL}/integrations/strava/status`, { headers: getAuthHeaders() })
      ])
      
      garminConnected.value = garminRes.data.connected
      stravaConnected.value = stravaRes.data.connected
    } catch (err) {
      console.error('Failed to check connection status:', err)
    }
  }
  
  const connectGarmin = async () => {
    loading.value = true
    try {
      const { data } = await axios.get(`${API_URL}/integrations/garmin/connect`, {
        headers: getAuthHeaders()
      })
      
      // Redirect to Garmin authorization page
      window.location.href = data.authorizationUrl
    } catch (err) {
      console.error('Failed to connect Garmin:', err)
      alert('Failed to connect Garmin')
    } finally {
      loading.value = false
    }
  }
  
  const disconnectGarmin = async () => {
    if (!confirm('Are you sure you want to disconnect Garmin?')) return
    
    try {
      await axios.delete(`${API_URL}/integrations/garmin/disconnect`, {
        headers: getAuthHeaders()
      })
      garminConnected.value = false
    } catch (err) {
      console.error('Failed to disconnect Garmin:', err)
      alert('Failed to disconnect Garmin')
    }
  }
  
  const connectStrava = async () => {
    loading.value = true
    try {
      const { data } = await axios.get(`${API_URL}/integrations/strava/connect`, {
        headers: getAuthHeaders()
      })
      
      // Redirect to Strava authorization page
      window.location.href = data.authorizationUrl
    } catch (err) {
      console.error('Failed to connect Strava:', err)
      alert('Failed to connect Strava')
    } finally {
      loading.value = false
    }
  }
  
  const disconnectStrava = async () => {
    if (!confirm('Are you sure you want to disconnect Strava?')) return
    
    try {
      await axios.delete(`${API_URL}/integrations/strava/disconnect`, {
        headers: getAuthHeaders()
      })
      stravaConnected.value = false
    } catch (err) {
      console.error('Failed to disconnect Strava:', err)
      alert('Failed to disconnect Strava')
    }
  }
  
  onMounted(() => {
    checkConnectionStatus()
    
    // Check for connection success/error from callback
    const params = new URLSearchParams(window.location.search)
    if (params.get('garmin') === 'connected') {
      garminConnected.value = true
      alert('Garmin connected successfully!')
    } else if (params.get('strava') === 'connected') {
      stravaConnected.value = true
      alert('Strava connected successfully!')
    }
  })
  </script>
  
  <style scoped>
  .connect-devices {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 20px;
  }
  
  .connect-devices h2 {
    font-weight: 900;
    font-size: 2rem;
    margin-bottom: 12px;
  }
  
  .connect-devices > p {
    color: rgba(15,18,16,0.60);
    margin-bottom: 40px;
  }
  
  .devices-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
  }
  
  .device-card {
    background: linear-gradient(135deg, rgba(255,255,255,0.98), rgba(255,255,255,0.92));
    border: 1px solid rgba(15,18,16,0.10);
    border-radius: 20px;
    padding: 32px;
    text-align: center;
    transition: all 0.3s;
    box-shadow: 0 8px 32px rgba(15,18,16,0.08);
  }
  
  .device-card:hover:not(.device-disabled) {
    transform: translateY(-4px);
    box-shadow: 0 12px 48px rgba(15,18,16,0.15);
  }
  
  .device-disabled {
    opacity: 0.6;
  }
  
  .device-icon {
    font-size: 4rem;
    margin-bottom: 16px;
  }
  
  .device-card h3 {
    font-weight: 900;
    font-size: 1.3rem;
    margin-bottom: 8px;
  }
  
  .device-card p {
    color: rgba(15,18,16,0.60);
    margin-bottom: 24px;
  }
  
  .btn {
    width: 100%;
    height: 48px;
    border-radius: 14px;
    font-weight: 900;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid;
  }
  
  .btn-primary {
    background: linear-gradient(135deg, #C46A2A, #a85722);
    border-color: #C46A2A;
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
  
  .btn-outline:hover:not(:disabled) {
    background: rgba(15,18,16,0.05);
  }
  </style>