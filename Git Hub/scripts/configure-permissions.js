/* eslint-disable */
const fs = require('fs');
const path = require('path');

function readJSON(p) { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; } }
function fileExists(p) { try { fs.accessSync(p); return true; } catch { return false; } }
function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }

const root = process.cwd();
const cfgPath = path.join(root, 'app.config.json');
const cfg = readJSON(cfgPath) || { permissions: {} };

const ANDROID = path.join(root, 'android');
const IOS = path.join(root, 'ios');

console.log('\n[setup:perms] Applying native permission settings...');

// ---- iOS Info.plist ----
try {
  const plistPath = path.join(IOS, 'App', 'App', 'Info.plist');
  if (fileExists(plistPath)) {
    let plist = fs.readFileSync(plistPath, 'utf8');
    const addKey = (key, value) => {
      if (plist.includes('<key>' + key + '</key>')) return;
      plist = plist.replace('</dict>\n</plist>', '  <key>' + key + '</key>\n  <string>' + value + '</string>\n</dict>\n</plist>');
    };
    if (cfg.permissions.location) addKey('NSLocationWhenInUseUsageDescription', 'Location is used to provide location-based features.');
    if (cfg.permissions.camera) addKey('NSCameraUsageDescription', 'Camera access is required to capture photos.');
    if (cfg.permissions.microphone) addKey('NSMicrophoneUsageDescription', 'Microphone access is required to capture audio.');
    if (cfg.permissions.photos) addKey('NSPhotoLibraryUsageDescription', 'Photo library access is required to select images.');
    fs.writeFileSync(plistPath, plist);
    console.log('  ✓ iOS Info.plist updated');
  } else {
    console.log('  • Skipped iOS Info.plist (platform not added yet)');
  }

  // Auto-request push on first launch (iOS)
  if (cfg.permissions.push && cfg.permissions.requestPushOnStart) {
    const appDelegate = path.join(IOS, 'App', 'App', 'AppDelegate.swift');
    if (fileExists(appDelegate)) {
      let swift = fs.readFileSync(appDelegate, 'utf8');
      if (!swift.includes('UNUserNotificationCenter')) {
        if (!swift.includes('import UserNotifications')) {
          swift = swift.replace('import UIKit', 'import UIKit\nimport UserNotifications');
        }
        const inject = "\n    // Auto-request push notifications on first launch\n    UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, error in\n      DispatchQueue.main.async {\n        UIApplication.shared.registerForRemoteNotifications()\n      }\n    }\n";
        // Try to inject inside application(_:didFinishLaunchingWithOptions:)
        const marker = 'func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {';
        if (swift.includes(marker)) {
          swift = swift.replace(marker, marker + inject);
          fs.writeFileSync(appDelegate, swift);
          console.log('  ✓ iOS AppDelegate updated to request push on launch');
        } else {
          console.log('  • Could not find didFinishLaunchingWithOptions in AppDelegate.swift');
        }
      }
    } else {
      console.log('  • Skipped iOS push auto-request (AppDelegate.swift not found)');
    }
  }
} catch (e) {
  console.warn('  ! iOS setup warning:', e?.message || e);
}

// ---- Android AndroidManifest.xml ----
try {
  const manifestPath = path.join(ANDROID, 'app', 'src', 'main', 'AndroidManifest.xml');
  if (fileExists(manifestPath)) {
    let xml = fs.readFileSync(manifestPath, 'utf8');
    const addUsesPerm = (name) => {
      if (xml.includes(name)) return;
      xml = xml.replace('<application', '<uses-permission android:name=' + ''' + name + ''' + '/>\n    <application');
    };
    if (cfg.permissions.push) addUsesPerm('android.permission.POST_NOTIFICATIONS');
    if (cfg.permissions.location) {
      addUsesPerm('android.permission.ACCESS_FINE_LOCATION');
      addUsesPerm('android.permission.ACCESS_COARSE_LOCATION');
    }
    if (cfg.permissions.camera) addUsesPerm('android.permission.CAMERA');
    if (cfg.permissions.microphone) addUsesPerm('android.permission.RECORD_AUDIO');
    if (cfg.permissions.photos) {
      // Android 13+
      addUsesPerm('android.permission.READ_MEDIA_IMAGES');
      // Backwards compatibility
      addUsesPerm('android.permission.READ_EXTERNAL_STORAGE');
    }
    fs.writeFileSync(manifestPath, xml);
    console.log('  ✓ AndroidManifest.xml updated');
  } else {
    console.log('  • Skipped AndroidManifest.xml (platform not added yet)');
  }

  // Auto-request push on first launch (Android 13+)
  if (cfg.permissions.push && cfg.permissions.requestPushOnStart) {
    // Attempt to update MainActivity.kt
    const javaRoot = path.join(ANDROID, 'app', 'src', 'main', 'java');
    function findMainActivity(dir) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const e of entries) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) {
          const res = findMainActivity(p);
          if (res) return res;
        } else if (e.isFile() && e.name === 'MainActivity.kt') {
          return p;
        }
      }
      return null;
    }
    if (fileExists(javaRoot)) {
      const mainActPath = findMainActivity(javaRoot);
      if (mainActPath) {
        let kt = fs.readFileSync(mainActPath, 'utf8');
        if (!kt.includes('Manifest.permission.POST_NOTIFICATIONS')) {
          if (!kt.includes('import android.os.Build')) kt = 'import android.os.Build\n' + kt;
          if (!kt.includes('import android.Manifest')) kt = kt.replace('package', 'import android.Manifest\npackage');
          if (!kt.includes('import android.content.pm.PackageManager')) kt = kt.replace('package', 'import android.content.pm.PackageManager\npackage');
          if (!kt.includes('import androidx.core.app.ActivityCompat')) kt = kt.replace('package', 'import androidx.core.app.ActivityCompat\npackage');
          if (!kt.includes('import androidx.core.content.ContextCompat')) kt = kt.replace('package', 'import androidx.core.content.ContextCompat\npackage');
          const classMarker = /(class\s+MainActivity[\s\S]*?{)/m;
          if (classMarker.test(kt)) {
            const onCreateMarker = /(override fun onCreate(savedInstanceState: Bundle?) {[\s\S]*?super.onCreate(savedInstanceState)[\s\S]*?})/m;
            if (!onCreateMarker.test(kt)) {
              // Inject onCreate
              kt = kt.replace(classMarker, '$1\n    override fun onCreate(savedInstanceState: android.os.Bundle?) {\n        super.onCreate(savedInstanceState)\n        if (Build.VERSION.SDK_INT >= 33) {\n            val perm = Manifest.permission.POST_NOTIFICATIONS\n            val granted = androidx.core.content.ContextCompat.checkSelfPermission(this, perm) == android.content.pm.PackageManager.PERMISSION_GRANTED\n            if (!granted) {\n                androidx.core.app.ActivityCompat.requestPermissions(this, arrayOf(perm), 100)\n            }\n        }\n    }\n');
            } else if (!kt.includes('POST_NOTIFICATIONS')) {
              // Append request inside existing onCreate
              kt = kt.replace('super.onCreate(savedInstanceState)', 'super.onCreate(savedInstanceState)\n        if (Build.VERSION.SDK_INT >= 33) {\n            val perm = Manifest.permission.POST_NOTIFICATIONS\n            val granted = ContextCompat.checkSelfPermission(this, perm) == PackageManager.PERMISSION_GRANTED\n            if (!granted) {\n                ActivityCompat.requestPermissions(this, arrayOf(perm), 100)\n            }\n        }');
            }
            fs.writeFileSync(mainActPath, kt);
            console.log('  ✓ Android MainActivity updated to request push on launch');
          }
        }
      } else {
        console.log('  • Could not find MainActivity.kt for Android push auto-request');
      }
    } else {
      console.log('  • Skipped Android push auto-request (platform not added yet)');
    }
  }
} catch (e) {
  console.warn('  ! Android setup warning:', e?.message || e);
}

console.log('\n[setup:perms] Done. If you run into issues, please check README.md for manual steps.');