import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'Home', component: () => import('@/views/Home.vue') },
  { path: '/join-us', name: 'Login', component: () => import('@/views/AccountLogin.vue') },
  { path: '/signup', name: 'Signup', component: () => import('@/views/AccountRegister.vue') },
  { path: '/features', name: 'Features', component: () => import('@/views/Features.vue') },
  { path: '/subscribe', name: 'Subscribe', component: () => import('@/views/Subscribe.vue') },
  { path: '/about', name: 'About', component: () => import('@/views/About.vue') },
  { path: '/maps', name: 'Map', component: () => import('@/views/GlobalHeatmap.vue') },
  { path: '/challenges', name: 'Challenges', component: () => import('@/views/Challenges.vue') },
  { path: '/clubs', name: 'Clubs', component: () => import('@/views/Clubs.vue') },
  { path: '/races', name: 'Races', component: () => import('@/views/Races.vue') },
  { path: '/support', name: 'Support', component: () => import('@/views/Support.vue') },
  { path: '/request', name: 'Request', component: () => import('@/views/SupportRequest.vue') },
  { path: '/sports/running', name: 'SportsRunning', component: () => import('@/views/sports/SportsRunning.vue') },
  { path: '/sports/ride', name: 'SportsRide', component: () => import('@/views/sports/SportsRide.vue') },
  { path: '/sports/swim', name: 'SportsSwim', component: () => import('@/views/sports/SportsSwim.vue') },
  { path: '/sports/hike', name: 'SportsHike', component: () => import('@/views/sports/SportsHike.vue') },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/AccountDashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/feed',
    name: 'Feed',
    component: () => import('@/views/Feed.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/track',
    name: 'Track',
    component: () => import('@/views/Track.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/devices',
    name: 'Devices',
    component: () => import('@/views/Devices.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/create-moment',
    name: 'CreateMoment',
    component: () => import('@/views/CreateMoment.vue'),
    meta: { requiresAuth: true }
  },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('@/views/NotFound.vue') }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  }
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')

  if (to.meta.requiresAuth && !token) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router
