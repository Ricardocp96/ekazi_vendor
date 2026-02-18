# 🔧 REBUILD REQUIRED - Fix Microphone Permission

## Problem
Settings shows "No permission requested" because `RECORD_AUDIO` is not declared in AndroidManifest.xml.

## Root Cause
The AndroidManifest.xml was generated BEFORE we fixed the plugin. It still has:
```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" tools:node="remove"/>
```

## Solution: Rebuild the App

The AndroidManifest.xml is **auto-generated** during build. You MUST rebuild to regenerate it.

### Step 1: Clean Build (IMPORTANT)
```bash
cd vendor_app/ekazi

# Remove old Android folder
rm -rf android

# Or on Windows:
# rmdir /s android
```

### Step 2: Regenerate Native Code
```bash
# This will regenerate AndroidManifest.xml with the fixed plugin
npx expo prebuild --clean
```

### Step 3: Build and Run
```bash
# For development
npx expo run:android

# OR for EAS build
eas build --platform android --profile preview
```

## Verify It Worked

After rebuilding, check `android/app/src/main/AndroidManifest.xml`:

**✅ CORRECT (should look like this):**
```xml
<uses-permission android:name="android.permission.RECORD_AUDIO"/>
```

**❌ WRONG (current state):**
```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" tools:node="remove"/>
```

## After Rebuild

1. **Install the new APK** on your device
2. **Try making a call** - you should see the permission dialog
3. **Check Settings** - should now show "Microphone" permission option

## Quick Verification Command

After rebuilding, run:
```bash
grep "RECORD_AUDIO" vendor_app/ekazi/android/app/src/main/AndroidManifest.xml
```

Should show:
```xml
<uses-permission android:name="android.permission.RECORD_AUDIO"/>
```

**NOT:**
```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" tools:node="remove"/>
```

## Why This Happens

- `AndroidManifest.xml` is **generated** by Expo during `prebuild`
- The plugin runs during generation
- Your current manifest was generated with the OLD plugin code
- Rebuilding regenerates it with the NEW (fixed) plugin code

## Troubleshooting

### Still shows "remove" after rebuild?
1. Make sure you deleted the `android/` folder first
2. Check that `plugins/strip-media-permissions.js` doesn't have `RECORD_AUDIO` in `PERMISSIONS_TO_REMOVE`
3. Verify `app.json` includes the plugin in the plugins array

### Permission dialog still not showing?
1. Uninstall the old app completely
2. Install the newly built APK
3. Try making a call again
