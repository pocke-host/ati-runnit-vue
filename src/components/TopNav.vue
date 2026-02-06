<template>
    <nav class="navbar navbar-expand-lg fixed-top bg-white border-bottom shadow-0">
      <div class="container-xxl position-relative align-items-center">
  
        <!-- Brand -->
        <router-link to="/" class="navbar-brand fw-bold" style="color: darkred;">
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
                <router-link to="/sports/triathlon" class="dropdown-item d-flex align-items-center">
                  <i class="bi bi-signpost-2 me-2"></i> Triathlon
                </router-link>
              </li>
              <li>
                <router-link to="/sports/walk" class="dropdown-item d-flex align-items-center">
                  <i class="bi bi-person-walking me-2"></i> Walk
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
          <li class="nav-item"><router-link to="/maps" class="nav-link">Maps</router-link></li>
          <li class="nav-item"><router-link to="/challenges" class="nav-link">Challenges</router-link></li>
          <li class="nav-item"><router-link to="/races" class="nav-link">Races</router-link></li>
          <li class="nav-item"><router-link to="/subscribe" class="nav-link">Subscription</router-link></li>

          <!-- CTA button -->
          <li class="nav-item">
            <router-link class="btn btn-outline-dark rounded-pill px-4 py-1" to="/join-us">
              Join Us
            </router-link>
          </li>
        </ul>
      </div>
    </nav>
  </template>
  
  <style scoped>
  /* Strava-style dropdown */
  .activity-menu {
    min-width: 200px;
    padding: .5rem 0;
  }
  .activity-menu .dropdown-item {
    font-weight: 500;
    font-size: 0.95rem;
  }
  .activity-menu .dropdown-item i {
    font-size: 1rem;
    color: #AA0505; /* orange accent */
  }
  .activity-menu .dropdown-item:hover {
    background-color: #f8f9fa;
  }
  
  /* Hover open only on desktops */
  @media (min-width: 992px) {
    .hover-dropdown:hover > .dropdown-menu {
      display: block;
      margin-top: 0; /* align under link */
    }
  }
  </style>