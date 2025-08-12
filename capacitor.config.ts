import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.journey.com',
  appName: 'Kazderni',
  webDir: 'dist',
  server: {
    url: 'https://kazderni.com',
    cleartext: true
  },
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#19D7C0'
    },
    SplashScreen: {
      launchShowDuration: 0,
      backgroundColor: '#F1F5F9'
    }
  }
}

export default config
