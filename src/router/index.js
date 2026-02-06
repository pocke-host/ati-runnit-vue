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
import SportsWalk from '@/components/sports/SportsWalk.vue'
import SportsHike from '@/components/sports/SportsHike.vue'
import Races from '@/components/Races.vue'
import AccountDashboard from '@/components/AccountDashboard.vue'

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
  { path: '/sports/walk', component: SportsWalk },
  { path: '/sports/hike', component: SportsHike },
  { path: '/dashboard', name: 'Dashboard', component: AccountDashboard },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
