import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'live.runnit.app',
  appName: 'Runnit',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#000000',
      showSpinner: false,
      androidSplashResourceName: 'splash',
      iosSplashResourceName: 'Default',
    },
    StatusBar: {
      style: 'Light',
      backgroundColor: '#000000',
      overlaysWebView: false,
    },
    PushNotifications: {
      // Show badge, play sound, and display alert banner for foreground notifications
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
  // Custom URL scheme for deep links: runnit://activities/123
  // Universal Links (https://runnit.live/...) require Associated Domains in Xcode:
  //   Capability → Associated Domains → applinks:runnit.live
  server: {
    iosScheme: 'runnit',
  },
}

export default config
