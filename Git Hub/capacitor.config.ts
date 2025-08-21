import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.journey1',
  appName: 'Kazderni',
  webDir: 'dist',
  server: {
    url: 'https://kazderni.com',
    cleartext: true
  },
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#ffffff'
    },
    SplashScreen: {
      launchShowDuration: 0,
      backgroundColor: '#ffffff'
    },
    Browser: {
      presentationStyle: 'popover'
    },
    App: {
      intentFilters: [{
        action: 'VIEW',
        category: 'DEFAULT',
        data: {
          scheme: 'app.kazderni.com',
          host: 'kazderni.com'
        }
      }]
    },
    FirebaseAnalytics: {
      enabled: true
    },
    FirebaseMessaging: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    OneSignalPush: {
      appId: '00523b27-01fb-4428-a2fa-0901ee274e69',
      googleProjectNumber: 'AAAARVJhMb8',
      autoRegister: true
    }
  }
}

export default config
