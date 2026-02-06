<template>
    <div class="p-6 max-w-5xl mx-auto">
      <header class="mb-8 text-center">
        <h1 class="text-3xl font-bold">Zwift Activity Summary</h1>
        <p class="text-gray-500">{{ user.name }}</p>
      </header>
  
      <div v-if="activities.length" class="grid gap-8 md:grid-cols-2">
        <ActivityCard
          v-for="(activity, index) in activities"
          :key="index"
          :title="activity.title"
          :distance="activity.distance"
          :elevation="activity.elevation"
          :time="activity.time"
          :achievements="activity.achievements"
          :mapImage="activity.mapImage"
          :rideImage="activity.rideImage"
        />
      </div>
  
      <div v-else class="text-center text-gray-500">
        <p>No activities found. Connect your Zwift or Strava account to get started!</p>
      </div>
  
      <aside v-if="events.length" class="mt-12 border-t pt-6">
        <h2 class="text-xl font-semibold mb-4">Upcoming Events</h2>
        <div v-for="(event, index) in events" :key="index" class="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-3">
          <p class="font-medium">{{ event.name }}</p>
          <p class="text-gray-600 text-sm">{{ event.date }} — {{ event.time }}</p>
        </div>
      </aside>
    </div>
  </template>
  
  <script setup>
  import { ref, defineComponent } from 'vue'
  
  const user = ref({
    name: 'Loading user...',
  })
  
  const activities = ref([])
  const events = ref([])
  
  // Example: Fetch user activities dynamically from API
  async function fetchUserData() {
    try {
      const res = await fetch('/api/user')
      const data = await res.json()
      user.value = data.user
      activities.value = data.activities
      events.value = data.events
    } catch (error) {
      console.error('Failed to fetch user data:', error)
    }
  }
  
  fetchUserData()
  
  const ActivityCard = defineComponent({
    props: {
      title: String,
      distance: Number,
      elevation: Number,
      time: String,
      achievements: Number,
      mapImage: String,
      rideImage: String
    },
    template: `
      <div class='bg-white shadow-md rounded-2xl overflow-hidden border border-gray-100'>
        <div class='p-5'>
          <h3 class='text-lg font-semibold mb-2'>{{ title }}</h3>
          <div class='grid grid-cols-3 text-center mb-4'>
            <div>
              <p class='text-2xl font-bold'>{{ distance.toFixed(2) }}</p>
              <p class='text-sm text-gray-500'>mi</p>
            </div>
            <div>
              <p class='text-2xl font-bold'>{{ elevation }}</p>
              <p class='text-sm text-gray-500'>ft gain</p>
            </div>
            <div>
              <p class='text-2xl font-bold'>{{ time }}</p>
              <p class='text-sm text-gray-500'>total</p>
            </div>
          </div>
          <div class='flex gap-2'>
            <img :src="mapImage" alt='map' class='w-1/2 rounded-lg' />
            <img :src="rideImage" alt='ride' class='w-1/2 rounded-lg' />
          </div>
          <div class='mt-3 flex justify-between text-sm text-gray-500'>
            <span>{{ achievements }} Achievements</span>
            <span>Virtual</span>
          </div>
        </div>
      </div>`
  })
  </script>
  
  <style scoped>
  body {
    font-family: 'Inter', sans-serif;
    background-color: #f9fafb;
  }
  </style>
  