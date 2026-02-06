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
    </div>
  </template>
  
  <script setup>
  import { useRouter } from 'vue-router'
  import LiveTracker from '@/components/LiveTracker.vue'
  
  const router = useRouter()
  
  const handleBack = () => {
    if (confirm('Stop tracking and return to dashboard?')) {
      router.push('/dashboard')
    }
  }
  </script>
  
  <style scoped>
  .tracker-page {
    background: radial-gradient(900px 420px at 50% 20%, rgba(16,185,129,0.12), transparent),
                #F5F6F3;
  }
  
  .page-container {
    min-height: 100vh;
    padding: 100px 20px 40px;
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
    border-radius: 50%;
    border: 1px solid rgba(15,18,16,0.14);
    background: rgba(255,255,255,0.90);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 1.2rem;
  }
  
  .btn-back:hover {
    background: white;
    transform: translateX(-2px);
  }
  
  .page-header h1 {
    font-weight: 900;
    font-size: 2rem;
    margin: 0;
  }
  </style>