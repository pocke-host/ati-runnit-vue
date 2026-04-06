<!-- ========== views/Track.vue ========== -->
<template>
    <div class="page-container tracker-page">
      <div class="page-header">
        <button class="btn-back" @click="handleBack">
          <i class="bi bi-arrow-left"></i>
        </button>
        <h1>Live Tracking</h1>
      </div>
  
      <LiveTracker />

      <ConfirmModal
        v-model="showStopConfirm"
        title="Stop Tracking?"
        body="Your current session will end and you'll return to the dashboard. Any unsaved data will be lost."
        confirm-label="Stop & Exit"
        :danger="true"
        @confirm="doGoBack"
      />
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import LiveTracker from '@/components/LiveTracker.vue'
  import ConfirmModal from '@/components/ConfirmModal.vue'

  const router = useRouter()
  const showStopConfirm = ref(false)

  const handleBack = () => { showStopConfirm.value = true }
  const doGoBack = () => { showStopConfirm.value = false; router.push('/dashboard') }
  </script>
  
  <style scoped>
  .tracker-page {
    background: #fff;
  }
  
  .page-container {
    min-height: 100vh;
    padding: calc(var(--nav-h, 64px) + 24px) 20px 40px;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .page-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 32px;
  }
  
  .btn-back {
    width: 44px;
    height: 44px;
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
  
  .btn-back:hover {
    background: #eee;
  }
  
  .page-header h1 {
    font-weight: 900;
    font-size: 2rem;
    margin: 0;
  }

  @media (max-width: 600px) {
    .page-container {
      padding: calc(var(--nav-h, 64px) + 12px) 16px 32px;
    }
    .page-header h1 {
      font-size: 1.4rem;
    }
    .page-header {
      margin-bottom: 20px;
    }
  }
  </style>