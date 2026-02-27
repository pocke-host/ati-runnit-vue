import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.runnit.app',
  appName: 'RUNNIT',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    Camera: {
      permissions: true
    },
    Geolocation: {
      permissions: true
    }
  }
}

export default config
