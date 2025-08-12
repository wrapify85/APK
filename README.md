# Kazderni (Capacitor Wrapper)

This project was generated from your Wizard settings.

## Quickstart
1. npm install
2. npx cap add ios && npx cap add android
3. npm run setup:perms  # applies Info.plist/AndroidManifest and optional push auto-request
4. npm run build
5. npx cap sync
6. npx cap run ios --target "Your Device" or npx cap run android

The app loads your site at: https://kazderni.com

Notes:
- If the site blocks iframes or has strict CSP, this "Direct Mode" still works on device.
- Adjust StatusBar and SplashScreen in capacitor.config.ts.
- Re-run `npm run setup:perms` after `npx cap sync` if files are regenerated.
