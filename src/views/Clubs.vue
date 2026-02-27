<!-- src/pages/Clubs.vue -->
<template>
    <main class="clubs-page">
      <!-- HERO -->
      <section class="hero">
        <div class="container-xxl text-center">
          <h1 class="fw-bold mb-2">Clubs</h1>
          <p class="lead text-muted">
            Connect with athletes who share your passions. Join a club and train together.
          </p>
        </div>
      </section>
  
      <!-- SEARCH + FILTERS -->
      <section class="controls">
        <div class="container-xxl">
          <div class="row g-2 align-items-center">
            <div class="col-12 col-md">
              <input v-model.trim="q" class="form-control" placeholder="Search clubs…" />
            </div>
            <div class="col-6 col-md-auto">
              <select v-model="sport" class="form-select">
                <option value="All">All Sports</option>
                <option v-for="s in sports" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>
            <div class="col-6 col-md-auto">
              <select v-model="sortBy" class="form-select">
                <option value="popular">Most popular</option>
                <option value="new">Newest</option>
                <option value="nearby">Nearby</option>
              </select>
            </div>
          </div>
        </div>
      </section>
  
      <!-- CLUB GRID -->
      <section class="list">
        <div class="container-xxl">
          <div class="row g-4">
            <div
              class="col-12 col-sm-6 col-lg-4"
              v-for="club in filtered"
              :key="club.id"
            >
              <article class="club-card h-100">
                <div class="thumb" :style="{ backgroundImage: `url(${club.image})` }"></div>
                <div class="body">
                  <h5 class="title mb-1">{{ club.name }}</h5>
                  <p class="text-muted small mb-2">{{ club.sport }} • {{ club.location }}</p>
                  <p class="small mb-3">{{ club.description }}</p>
                  <div class="d-flex justify-content-between align-items-center">
                    <span class="text-muted small">{{ formatK(club.members) }} members</span>
                    <button class="btn btn-primary btn-sm">Join</button>
                  </div>
                </div>
              </article>
            </div>
  
            <!-- Empty -->
            <div class="col-12" v-if="filtered.length === 0">
              <div class="empty">
                <h5 class="mb-1">No clubs found</h5>
                <p class="text-muted m-0">Try another sport or search term.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
  
      <!-- CTA -->
      <section class="cta">
        <div class="container-xxl text-center">
          <h2 class="fw-bold mb-2">Start your own club</h2>
          <p class="text-muted mb-3">Bring athletes together, create events, and build community.</p>
          <button class="btn btn-primary btn-lg">Create a Club</button>
        </div>
      </section>
    </main>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  
  // Mock data
  const clubs = ref([
    {
      id: 1,
      name: 'Purple Runners LA',
      sport: 'Running',
      location: 'Los Angeles, CA',
      description: 'Weekly runs on the beach and downtown routes.',
      members: 1234,
      image: 'https://images.unsplash.com/photo-1599058917212-d750089bc07c?q=80&w=1200&auto=format&fit=crop'
    },
    {
      id: 2,
      name: 'Cycling Crew SF',
      sport: 'Cycling',
      location: 'San Francisco, CA',
      description: 'Climbs, coffee rides, and weekend epics.',
      members: 2840,
      image: 'https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf?q=80&w=1200&auto=format&fit=crop'
    },
    {
      id: 3,
      name: 'Swim Strong OC',
      sport: 'Swimming',
      location: 'Orange County, CA',
      description: 'Pool and open water training with friendly vibes.',
      members: 640,
      image: 'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?q=80&w=1200&auto=format&fit=crop'
    }
  ])
  
  const sports = ['Running', 'Cycling', 'Swimming', 'Hiking', 'Walking']
  const q = ref('')
  const sport = ref('All')
  const sortBy = ref('popular')
  
  const filtered = computed(() => {
    let list = clubs.value.slice()
    if (sport.value !== 'All') {
      list = list.filter(c => c.sport === sport.value)
    }
    if (q.value) {
      const t = q.value.toLowerCase()
      list = list.filter(c =>
        c.name.toLowerCase().includes(t) ||
        c.description.toLowerCase().includes(t)
      )
    }
    if (sortBy.value === 'popular') {
      list.sort((a, b) => b.members - a.members)
    } else if (sortBy.value === 'new') {
      list.reverse()
    }
    return list
  })
  
  function formatK(n) {
    if (n >= 1000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'k'
    return '' + n
  }
  </script>
  
  <style scoped>
  .clubs-page{
    --nav-h: 60px;
    padding-top: var(--nav-h);  
    --footer-h:40px;
    min-height: calc(100vh - var(--nav-h) - var(--footer-h));
    background:#fff; display:flex; flex-direction:column;
  }
  
  /* Hero */
  .hero{ padding:48px 0 32px; background:#f7f5f2; border-bottom:1px solid #eee; }
  
  /* Controls */
  .controls{ padding:16px 0; border-bottom:1px solid #f0f0f0; background:#fff; }
  
  /* Club cards */
  .club-card{
    border:1px solid #eee; border-radius:16px; overflow:hidden; background:#fff;
    display:flex; flex-direction:column;
  }
  .club-card .thumb{ height:160px; background:#e9ecef center/cover no-repeat; }
  .club-card .body{ padding:14px; }
  
  /* Empty */
  .empty{ text-align:center; padding:48px; border:1px dashed #e5e7eb; border-radius:16px; background:#fafafa; }
  
  /* CTA */
  .cta{ padding:56px 0 72px; background:#f7f5f2; border-top:1px solid #eee; }
  
  /* Purple buttons */
  .btn-primary{
    --bs-btn-bg:#AA0505; --bs-btn-border-color:#AA0505;
    --bs-btn-hover-bg:#6a006a; --bs-btn-hover-border-color:#6a006a;
  }
  
  /* Responsive */
  @media (max-width: 768px){
    .club-card .thumb{ height:140px; }
  }
  </style>
  