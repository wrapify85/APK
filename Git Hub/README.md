# Kazderni - Mobile App Wrapper

This project was generated from your configuration and includes automatic app publishing capabilities via CodeMagic.

## 🚀 Getting Started (Development)

### Local Development Setup
1. `npm install`
2. `npx cap add ios && npx cap add android`
3. `npm run setup:perms` (applies native permissions)
4. `npx cap sync`
5. `npx cap run ios` or `npx cap run android`

Your app loads: **https://kazderni.com**

### GitHub Actions (Development Builds)
- Push to `main` or `develop` triggers automatic debug builds
- Manual dispatch allows release builds
- Artifacts are saved for 30 days

## 📱 App Store Publishing with CodeMagic

### Prerequisites
1. **Google Play Console Account** (Android)
2. **Apple Developer Account** (iOS)
3. **CodeMagic Account** (free signup at codemagic.io)

### Step-by-Step Setup

#### 1. CodeMagic Account Setup
1. Sign up at [codemagic.io](https://codemagic.io)
2. Connect your repository (GitHub/GitLab/Bitbucket)
3. Select this project

#### 2. Android Publishing Setup

**A. Create Google Play Service Account**
1. Go to Google Cloud Console
2. Create new project or select existing
3. Enable Google Play Android Developer API
4. Create Service Account with "Editor" role
5. Download JSON key file

**B. Configure CodeMagic Android Variables**
Add these in CodeMagic → App Settings → Environment Variables:

| Variable | Value | Group |
|----------|-------|--------|
| `GCLOUD_SERVICE_ACCOUNT_CREDENTIALS` | [Paste JSON content] | google_play |
| `CM_KEYSTORE` | [Base64 of your keystore] | keystore_reference |
| `CM_KEYSTORE_PASSWORD` | Your keystore password | keystore_reference |
| `CM_KEY_PASSWORD` | Your key password | keystore_reference |
| `CM_KEY_ALIAS` | Your key alias | keystore_reference |

**C. Create Android App in Play Console**
1. Create new app in Google Play Console
2. Complete store listing
3. Set up internal testing track
4. Grant service account "Release Manager" role

#### 3. iOS Publishing Setup

**A. App Store Connect API Setup**
1. Go to App Store Connect → Users and Access → Integrations
2. Generate API Key with "App Manager" role
3. Download .p8 key file

**B. Configure CodeMagic iOS Variables**
| Variable | Value | Group |
|----------|-------|--------|
| `APP_STORE_CONNECT_ISSUER_ID` | Your issuer ID | app_store_credentials |
| `APP_STORE_CONNECT_KEY_IDENTIFIER` | Your key ID | app_store_credentials |
| `APP_STORE_CONNECT_PRIVATE_KEY` | [.p8 file content] | app_store_credentials |
| `CERTIFICATE_PRIVATE_KEY` | [Your cert private key] | app_store_credentials |
| `APP_STORE_APP_ID` | Your app's App Store ID | app_store_credentials |

**C. Create iOS App in App Store Connect**
1. Create new app in App Store Connect
2. Set bundle ID to: `com.kazderni.app`
3. Complete app information

#### 4. Trigger First Build
1. Push changes to your repository
2. In CodeMagic, trigger `android-workflow` or `ios-workflow`
3. Monitor build progress in CodeMagic dashboard

#### 5. Automatic Updates
- Any push to `main` branch triggers new app versions
- Version codes auto-increment
- Apps are automatically published to stores

## 🔧 Configuration

### Permissions Enabled
- push: ✅
- location: ✅
- camera: ❌
- microphone: ❌
- photos: ✅
- requestPushOnStart: ✅

### Build Tracks
- **Android**: Internal track (change `GOOGLE_PLAY_TRACK` to `alpha`, `beta`, or `production`)
- **iOS**: TestFlight (change `submit_to_app_store` to `true` for production)

## 📞 Support
- CodeMagic Documentation: https://docs.codemagic.io
- Capacitor Documentation: https://capacitorjs.com/docs
- Issues with this template: Contact support

## 🎯 Quick Commands
- `npm run setup:perms` - Configure native permissions
- `npx cap sync` - Sync web to native
- `npx cap run ios` - Run on iOS
- `npx cap run android` - Run on Android
