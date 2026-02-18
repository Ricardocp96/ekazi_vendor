# ⚠️ REBUILD REQUIRED - Microphone Permission

## Current Issue
The AndroidManifest.xml still has `RECORD_AUDIO` permission marked for removal:
```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" tools:node="remove"/>
```

This means the permission **cannot be requested** because it's not actually declared in the app.

## Why This Happened
The `AndroidManifest.xml` is a **generated file** created by Expo during the build process. Even though we fixed the plugin (`strip-media-permissions.js`), the manifest file hasn't been regenerated yet.

## Solution: Rebuild the App

### Option 1: Development Build (Recommended for Testing)
```bash
cd vendor_app/ekazi

# Clean and regenerate native folders
npx expo prebuild --clean

# Run on Android
npx expo run:android
```

### Option 2: EAS Build (For Production/Preview)
```bash
cd vendor_app/ekazi

# Build with EAS
eas build --platform android --profile preview
```

## After Rebuilding

1. **Verify the Manifest**: Check `android/app/src/main/AndroidManifest.xml` and ensure line 14 shows:
   ```xml
   <uses-permission android:name="android.permission.RECORD_AUDIO"/>
   ```
   (Without `tools:node="remove"`)

2. **Test the Permission**: 
   - Make a call
   - You should see the permission dialog
   - Grant permission
   - Call should proceed

## How to Verify It's Fixed

After rebuilding, check the logs when making a call. You should see:
```
[Permission] Starting permission request flow
[Permission] Checking current permission status...
[Permission] Current permission status: false
[Permission] Permission not granted, requesting...
[Permission] Permission request result: granted
[Permission] ✅ Microphone permission granted by user
```

If you see an error about permission not found, the rebuild didn't work correctly.

## Quick Check Command

After rebuilding, you can quickly verify:
```bash
grep -A 1 "RECORD_AUDIO" vendor_app/ekazi/android/app/src/main/AndroidManifest.xml
```

Should show:
```xml
<uses-permission android:name="android.permission.RECORD_AUDIO"/>
```

NOT:
```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" tools:node="remove"/>
```
