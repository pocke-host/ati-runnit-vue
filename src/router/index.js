import { createRouter, createWebHistory } from 'vue-router'

// Legal pages (stay in components)
import PrivacyPolicy from '@/components/PrivacyPolicy.vue'
import TermsOfService from '@/components/TermsOfService.vue'
import CookiePolicy from '@/components/CookiePolicy.vue'

const routes = [
  // Public pages
  { path: '/',               name: 'Home',          component: () => import('@/views/Home.vue') },
  { path: '/join-us',        name: 'Login',         component: () => import('@/views/AccountLogin.vue') },
  { path: '/signup',         name: 'Signup',        component: () => import('@/views/AccountRegister.vue') },
  { path: '/features',       name: 'Features',      component: () => import('@/views/Features.vue') },
  { path: '/about',          name: 'About',         component: () => import('@/views/About.vue') },
  { path: '/subscribe',      name: 'Subscribe',     component: () => import('@/views/Subscribe.vue') },
  { path: '/maps',           name: 'Map',           component: () => import('@/views/GlobalHeatmap.vue') },
  { path: '/races',          name: 'Races',         component: () => import('@/views/Races.vue') },
  { path: '/support',        name: 'Support',       component: () => import('@/views/Support.vue') },
  { path: '/request',        name: 'Request',       component: () => import('@/views/SupportRequest.vue') },
  { path: '/sports/running', name: 'SportsRunning', component: () => import('@/views/sports/SportsRunning.vue') },
  { path: '/sports/ride',    name: 'SportsRide',    component: () => import('@/views/sports/SportsRide.vue') },
  { path: '/sports/swim',    name: 'SportsSwim',    component: () => import('@/views/sports/SportsSwim.vue') },

  // Legal (components/)
  { path: '/privacy',  name: 'PrivacyPolicy',   component: PrivacyPolicy },
  { path: '/terms',    name: 'TermsOfService',  component: TermsOfService },
  { path: '/cookies',  name: 'CookiePolicy',    component: CookiePolicy },

  // Auth-required app pages
  { path: '/dashboard',           name: 'Dashboard',      component: () => import('@/views/AccountDashboard.vue'), meta: { requiresAuth: true } },
  { path: '/feed',                name: 'Feed',           component: () => import('@/views/Feed.vue'),             meta: { requiresAuth: true } },
  { path: '/clubs',               name: 'Clubs',          component: () => import('@/views/Clubs.vue'),            meta: { requiresAuth: true } },
  { path: '/challenges',          name: 'Challenges',     component: () => import('@/views/Challenges.vue'),       meta: { requiresAuth: true } },
  { path: '/track',               name: 'Track',          component: () => import('@/views/Track.vue'),            meta: { requiresAuth: true } },
  { path: '/devices',             name: 'Devices',        component: () => import('@/views/Devices.vue'),          meta: { requiresAuth: true } },
  { path: '/create-moment',       name: 'CreateMoment',   component: () => import('@/views/CreateMoment.vue'),     meta: { requiresAuth: true } },
  { path: '/settings',            name: 'Settings',       component: () => import('@/views/AccountSettings.vue'),  meta: { requiresAuth: true } },
  { path: '/plans',               name: 'Plans',          component: () => import('@/views/TrainingPlans.vue'),    meta: { requiresAuth: true } },
  { path: '/plans/:id',           name: 'PlanDetail',     component: () => import('@/views/PlanDetail.vue'),       meta: { requiresAuth: true } },
  { path: '/activities/:id',      name: 'ActivityDetail', component: () => import('@/views/ActivityDetail.vue'),   meta: { requiresAuth: true } },
  { path: '/profile/:id',         name: 'UserProfile',    component: () => import('@/views/UserProfile.vue'),      meta: { requiresAuth: true } },
  { path: '/achievements',        name: 'Achievements',   component: () => import('@/views/Achievements.vue'),     meta: { requiresAuth: true } },
  { path: '/stats',               name: 'Stats',          component: () => import('@/views/Stats.vue'),            meta: { requiresAuth: true } },

  // Catch-all
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('@/views/NotFound.vue') },
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
    next('/join-us')
  } else {
    next()
  }
})

export default router
