// src/tests/setup.js
// Global test setup for Vitest + Vue Test Utils

import { config } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'

// Stub heavy third-party modules that don't run in jsdom
vi.mock('mapbox-gl', () => ({
  default: { Map: vi.fn(), NavigationControl: vi.fn(), GeolocateControl: vi.fn() },
  Map: vi.fn(),
}))

vi.mock('chart.js', () => ({
  Chart: { register: vi.fn() },
  registerables: [],
}))

// Provide a minimal router so router-link doesn't blow up
const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: '/:pathMatch(.*)*', component: { template: '<div/>' } }],
})

config.global.plugins = [router]
config.global.stubs = {
  'router-link': { template: '<a><slot /></a>' },
  'router-view': { template: '<div/>' },
  'AppSpinner': { template: '<div class="stub-spinner"/>' },
  'EmptyState': { template: '<div class="stub-empty-state"/>' },
  'SkeletonCard': { template: '<div class="stub-skeleton"/>' },
}
