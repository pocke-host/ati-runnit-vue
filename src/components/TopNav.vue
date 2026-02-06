<template>
  <nav class="navbar navbar-expand-lg fixed-top runnit-nav shadow-0">
    <div class="container-xxl position-relative align-items-center">

      <!-- Brand -->
      <router-link to="/" class="navbar-brand fw-bold">
        RUNNIT
      </router-link>

      <!-- Toggler (mobile) -->
      <button class="navbar-toggler ms-2" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav"
              aria-controls="mainNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- Centered Nav -->
      <ul class="navbar-nav align-items-center gap-3 mx-auto">
        <!-- Activities dropdown -->
        <li class="nav-item dropdown hover-dropdown">
          <a class="nav-link dropdown-toggle" href="#" role="button">
            Activities
          </a>
          <ul class="dropdown-menu shadow activity-menu">
            <li>
              <router-link to="/sports/running" class="dropdown-item d-flex align-items-center">
                <i class="bi bi-speedometer2 me-2"></i> Run
              </router-link>
            </li>
            <li>
              <router-link to="/sports/ride" class="dropdown-item d-flex align-items-center">
                <i class="bi bi-bicycle me-2"></i> Ride
              </router-link>
            </li>
            <li>
              <router-link to="/sports/swim" class="dropdown-item d-flex align-items-center">
                <i class="bi bi-droplet me-2"></i> Swim
              </router-link>
            </li>
            <li>
              <router-link to="/sports/hike" class="dropdown-item d-flex align-items-center">
                <i class="bi bi-signpost-2 me-2"></i> Hike
              </router-link>
            </li>
          </ul>
        </li>

        <!-- Standard nav links -->
        <li class="nav-item"><router-link to="/features" class="nav-link">Features</router-link></li>
        <li class="nav-item"><router-link to="/challenges" class="nav-link">Challenges</router-link></li>
        <li class="nav-item"><router-link to="/races" class="nav-link">Races</router-link></li>
        <li class="nav-item"><router-link to="/subscribe" class="nav-link">Subscription</router-link></li>

        <!-- Show different buttons based on auth state -->
        <template v-if="!isAuthenticated">
          <!-- CTA button - only show when NOT logged in -->
          <li class="nav-item">
            <router-link class="btn btn-outline-light rounded-pill px-4 py-1" to="/join-us">
              Join Us
            </router-link>
          </li>
        </template>
        
        <template v-else>
          <!-- Show when logged in -->
          <li class="nav-item">
            <router-link class="btn btn-primary rounded-pill px-4 py-1" to="/dashboard">
              Dashboard
            </router-link>
          </li>
          <li class="nav-item">
            <button class="btn btn-outline-light rounded-pill px-4 py-1" @click="handleLogout">
              Logout
            </button>
          </li>
        </template>
      </ul>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

const router = useRouter()
const authStore = useAuthStore()
const { isAuthenticated } = storeToRefs(authStore)

const handleLogout = () => {
  authStore.logout()
  router.push('/')
}
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: 72px;
  padding: 0 24px;
  
  /* Glass olive green effect */
  background: rgba(90, 107, 78, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 4px 24px rgba(15, 18, 16, 0.12);
}

/* Optional: lighter text for contrast */
.navbar a,
.navbar .nav-link {
  color: rgba(255, 255, 255, 0.95) !important;
  font-weight: 600;
}

.navbar a:hover,
.navbar .nav-link:hover {
  color: rgba(255, 255, 255, 1) !important;
}

/* Logo/brand styling */
.navbar-brand {
  color: white !important;
  font-weight: 900;
  letter-spacing: 0.1em;
}

/* Button styling */
.btn-outline-light {
  color: rgba(255, 255, 255, 0.95);
  border-color: rgba(255, 255, 255, 0.3);
  background: transparent;
}

.btn-outline-light:hover {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border-color: rgba(255, 255, 255, 0.5);
}

.btn-primary {
  background: #C46A2A;
  border-color: #C46A2A;
  color: white;
}

.btn-primary:hover {
  background: #a85722;
  border-color: #a85722;
}
</style>