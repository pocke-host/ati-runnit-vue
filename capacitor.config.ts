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
      style: 'Light',        // white icons on dark nav
      backgroundColor: '#000000',
      overlaysWebView: false,
    },
  },
}

export default config
