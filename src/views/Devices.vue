<!-- ========== views/Devices.vue ========== -->
<template>
    <div class="page-container">
      <div class="page-header">
        <button class="btn-back" @click="$router.back()">
          <i class="bi bi-arrow-left"></i>
        </button>
        <h1>Devices & Integrations</h1>
      </div>
  
      <ConnectDevices />
    </div>
  </template>
  
  <script setup>
  import ConnectDevices from '@/components/ConnectDevices.vue'
  </script>
  
  <style scoped>
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