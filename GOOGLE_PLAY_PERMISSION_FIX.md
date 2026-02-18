# Fixing FOREGROUND_SERVICE_MEDIA_PROJECTION Permission Issue

## Problem
Google Play Console is flagging the `FOREGROUND_SERVICE_MEDIA_PROJECTION` permission and asking you to declare where it's used.

## Root Cause
This permission is automatically added by the `react-native-agora` SDK (used for video/voice calls), even though your app **does not use screen sharing features**. The permission is included in Agora's manifest but not actually needed for your use case.

## Solution Steps

### Step 1: Clean and Rebuild Your App

The plugin has been updated to properly remove this permission. You need to rebuild your app:

```bash
# Navigate to vendor app directory
cd vendor_app/ekazi

# Clean previous builds
npx expo prebuild --clean

# Or if using EAS Build
eas build --platform android --profile production --clear-cache
```

### Step 2: Verify the Permission is Removed

After rebuilding, check the generated AndroidManifest.xml:

```bash
# Check the merged manifest
cat android/app/src/main/AndroidManifest.xml | grep -i "FOREGROUND_SERVICE_MEDIA_PROJECTION"
```

You should see the permission with `tools:node="remove"` attribute, which tells Android to remove it during manifest merging.

### Step 3: If Google Play Still Detects It

If Google Play Console still detects the permission after rebuilding, you have two options:

#### Option A: Fill Out the Declaration Form (Recommended)

1. Go to Google Play Console → Your App → Policy → App content
2. Find "Sensitive permissions and APIs"
3. When asked about `FOREGROUND_SERVICE_MEDIA_PROJECTION`, select:
   - **"No, my app does not use this permission"**
   - In the explanation field, write:
     ```
     This permission is automatically added by the react-native-agora SDK 
     (version 4.2.0) which we use for voice and video calls. However, our app 
     does not implement screen sharing functionality and does not use this 
     permission. We have configured our build to remove this permission using 
     tools:node="remove" in our AndroidManifest.xml, but it may still appear 
     in the merged manifest due to library dependencies.
     ```

#### Option B: Verify and Remove Manually (Advanced)

If the permission still appears in your final AAB, you can manually verify:

1. Extract your AAB file:
   ```bash
   # Install bundletool if needed
   # Download from: https://github.com/google/bundletool/releases
   
   bundletool build-apks --bundle=your-app.aab --output=app.apks
   bundletool extract-apks --apks=app.apks --output-dir=extracted --device-spec=device.json
   ```

2. Check the manifest in the extracted APK:
   ```bash
   # Extract AndroidManifest.xml from APK
   aapt dump xmltree your-app.apk AndroidManifest.xml | grep -i "FOREGROUND_SERVICE_MEDIA_PROJECTION"
   ```

3. If it's still there, the plugin may need adjustment. Contact support or check the Expo config plugins documentation.

## Technical Details

### What the Plugin Does

The `strip-media-permissions.js` plugin:
1. Adds `tools:node="remove"` to the permission in AndroidManifest.xml
2. Removes the permission from the uses-permission array before manifest merging
3. Ensures the tools namespace is properly declared

### Why It Might Still Appear

- Library manifests are merged AFTER your app's manifest
- Some build tools may not respect `tools:node="remove"` in all cases
- The permission might be declared in a library's AAR file

### Verification

To verify the plugin is working:

1. Check `android/app/src/main/AndroidManifest.xml` - should have:
   ```xml
   <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PROJECTION" tools:node="remove"/>
   ```

2. After building, check the merged manifest in:
   ```
   android/app/build/intermediates/merged_manifests/[variant]/AndroidManifest.xml
   ```

## Alternative: Update Agora SDK

If the issue persists, consider:
1. Updating `react-native-agora` to the latest version (may have fixed this)
2. Using a different video calling SDK that doesn't include this permission
3. Contacting Agora support about removing unnecessary permissions

## References

- [Android Manifest Merge Rules](https://developer.android.com/studio/build/manifest-merge)
- [Google Play Sensitive Permissions](https://support.google.com/googleplay/android-developer/answer/9888170)
- [Expo Config Plugins](https://docs.expo.dev/config-plugins/introduction/)
