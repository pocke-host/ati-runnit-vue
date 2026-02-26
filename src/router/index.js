import { createRouter, createWebHistory } from 'vue-router'

import AccountLogin from '@/components/AccountLogin.vue'
import SportsRunning from '@/components/sports/SportsRunning.vue'
import Features from '@/components/Features.vue'
import Subscribe from '@/components/Subscribe.vue'
import Home from '@/components/Home.vue'
import GlobalHeatMap from '@/components/GlobalHeatmap.vue'
import About from '@/components/About.vue'
import AccountRegister from '@/components/AccountRegister.vue'
import Challenges from '@/components/Challenges.vue'
import Support from '@/components/Support.vue'
import SupportRequest from '@/components/SupportRequest.vue'
import Clubs from '@/components/Clubs.vue'
import SportsRide from '@/components/sports/SportsRide.vue'
import SportsSwim from '@/components/sports/SportsSwim.vue'
import Races from '@/components/Races.vue'
import AccountDashboard from '@/components/AccountDashboard.vue'
import Feed from '@/components/Feed.vue'
import LiveTracker from '@/components/LiveTracker.vue'
import ConnectDevices from '@/components/ConnectDevices.vue'
import CreateMoment from '@/views/CreateMoment.vue'
import PrivacyPolicy from '@/components/PrivacyPolicy.vue'
import TermsOfService from '@/components/TermsOfService.vue'
import CookiePolicy from '@/components/CookiePolicy.vue'

const routes = [
  { path: '/join-us', name: 'Account Login', component: AccountLogin },
  { path: '/sports/running', name: 'SportsRunning', component: SportsRunning },
  { path: '/features', name: 'Features', component: Features },
  { path: '/subscribe', name: 'Subscribe', component: Subscribe },
  { path: '/', name: 'Home', component: Home },
  { path: '/maps', name: 'Map', component: GlobalHeatMap },
  { path: '/about', name: 'About', component: About },
  { path: '/signup', name: 'Signup', component: AccountRegister },
  { path: '/challenges', name: 'Challenges', component: Challenges },
  { path: '/support', name: 'Support', component: Support },
  { path: '/request', name: 'Request', component: SupportRequest },
  { path: '/clubs', name: 'Clubs', component: Clubs },
  { path: '/races', name: 'Races', component: Races },
  { path: '/sports/ride', component: SportsRide },
  { path: '/sports/swim', component: SportsSwim },
  { path: '/dashboard', name: 'Dashboard', component: AccountDashboard },
  { path: '/feed', name: 'Feed', component: Feed },
  {
    path: '/track',
    name: 'LiveTracker',
    component: LiveTracker,
    meta: { requiresAuth: true }
  },
  {
    path: '/devices',
    name: 'ConnectDevices',
    component: ConnectDevices,
    meta: { requiresAuth: true }
  },
  {
    path: '/create-moment',
    name: 'CreateMoment',
    component: CreateMoment,
    meta: { requiresAuth: true }
  },
  { path: '/privacy', name: 'PrivacyPolicy', component: PrivacyPolicy },
  { path: '/terms', name: 'TermsOfService', component: TermsOfService },
  { path: '/cookies', name: 'CookiePolicy', component: CookiePolicy }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
