<!-- ========== TopNav.vue (Updated) ========== -->
<template>
  <nav class="navbar">
    <div class="navbar-content">
      <router-link to="/" class="navbar-brand">
        <span class="brand-text">RUNNIT</span>
      </router-link>

      <div class="navbar-menu" v-if="isAuthenticated">
        <router-link to="/dashboard" class="nav-link">
          <i class="bi bi-grid-3x3-gap me-2"></i>Dashboard
        </router-link>
        <router-link to="/feed" class="nav-link">
          <i class="bi bi-collection me-2"></i>Feed
        </router-link>
        <router-link to="/track" class="nav-link nav-link-primary">
          <i class="bi bi-play-circle-fill me-2"></i>Track
        </router-link>
        <router-link to="/devices" class="nav-link">
          <i class="bi bi-smartwatch me-2"></i>Devices
        </router-link>
        <button class="nav-link" @click="handleLogout">
          <i class="bi bi-box-arrow-right me-2"></i>Logout
        </button>
      </div>

      <div class="navbar-menu" v-else>
        <router-link to="/login" class="nav-link">Login</router-link>
        <router-link to="/register" class="nav-link nav-link-primary">Join Us</router-link>
      </div>

      <!-- Mobile Menu Toggle -->
      <button class="mobile-menu-toggle" @click="mobileMenuOpen = !mobileMenuOpen">
        <i class="bi bi-list"></i>
      </button>
    </div>

    <!-- Mobile Menu -->
    <div v-if="mobileMenuOpen && isAuthenticated" class="mobile-menu">
      <router-link to="/dashboard" class="mobile-link" @click="mobileMenuOpen = false">
        <i class="bi bi-grid-3x3-gap"></i> Dashboard
      </router-link>
      <router-link to="/feed" class="mobile-link" @click="mobileMenuOpen = false">
        <i class="bi bi-collection"></i> Feed
      </router-link>
      <router-link to="/track" class="mobile-link" @click="mobileMenuOpen = false">
        <i class="bi bi-play-circle-fill"></i> Track Activity
      </router-link>
      <router-link to="/devices" class="mobile-link" @click="mobileMenuOpen = false">
        <i class="bi bi-smartwatch"></i> Devices
      </router-link>
      <button class="mobile-link" @click="handleLogout">
        <i class="bi bi-box-arrow-right"></i> Logout
      </button>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const mobileMenuOpen = ref(false)

const isAuthenticated = computed(() => !!localStorage.getItem('token'))

const handleLogout = () => {
  authStore.logout()
  mobileMenuOpen.value = false
  router.push('/login')
}
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(90, 107, 78, 0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 4px 24px rgba(15, 18, 16, 0.12);
}

.navbar-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.navbar-brand {
  text-decoration: none;
}

.brand-text {
  font-weight: 900;
  font-size: 1.5rem;
  letter-spacing: 0.05em;
  color: white;
}

.navbar-menu {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-link {
  padding: 10px 18px;
  border-radius: 12px;
  border: 1px solid transparent;
  background: transparent;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 700;
  font-size: 0.95rem;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.12);
  color: white;
}

.nav-link-primary {
  background: rgba(196, 106, 42, 0.95);
  color: white;
  border-color: rgba(196, 106, 42, 0.95);
}

.nav-link-primary:hover {
  background: #C46A2A;
  border-color: #C46A2A;
}

.mobile-menu-toggle {
  display: none;
  width: 44px;
  height: 44px;
  border: none;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  align-items: center;
  justify-content: center;
}

.mobile-menu {
  display: none;
  flex-direction: column;
  gap: 4px;
  padding: 12px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
}

.mobile-link {
  padding: 12px 16px;
  border-radius: 12px;
  background: transparent;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 700;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  width: 100%;
  text-align: left;
}

.mobile-link:hover {
  background: rgba(255, 255, 255, 0.12);
  color: white;
}

.me-2 {
  margin-right: 8px;
}

@media (max-width: 768px) {
  .navbar-menu {
    display: none;
  }

  .mobile-menu-toggle {
    display: flex;
  }

  .mobile-menu {
    display: flex;
  }
}
</style>