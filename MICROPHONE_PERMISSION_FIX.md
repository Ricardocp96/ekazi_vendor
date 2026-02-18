# Microphone Permission Fix Guide

## Problem
When trying to make calls, you get "Microphone permission is required" error.

## Root Cause
1. The `strip-media-permissions.js` plugin was removing `RECORD_AUDIO` permission from AndroidManifest.xml
2. Permission handling didn't check existing permission status before requesting
3. No way to retry or open settings if permission was permanently denied

## Fixes Applied

### 1. Plugin Fix ✅
- Updated `plugins/strip-media-permissions.js` to **keep** `RECORD_AUDIO` permission
- Removed it from the `PERMISSIONS_TO_REMOVE` array

### 2. Improved Permission Handling ✅
- Added permission status check before requesting
- Added handling for permanently denied permissions
- Added option to open device settings if permission was denied permanently
- Added retry button when permission error occurs

## What You Need to Do

### Step 1: Rebuild the Android App
The AndroidManifest.xml is a **generated file**. You must rebuild the app for the changes to take effect:

```bash
# For development build
cd vendor_app/ekazi
npx expo prebuild --clean
npx expo run:android

# OR for EAS build
eas build --platform android --profile preview
```

### Step 2: Test the Permission Flow

1. **First Time**: When you make a call, you should see a permission dialog
2. **If Denied**: You'll see an error message with option to retry
3. **If Permanently Denied**: You'll get an alert to open device settings

### Step 3: Verify AndroidManifest
After rebuilding, check that `android/app/src/main/AndroidManifest.xml` contains:
```xml
<uses-permission android:name="android.permission.RECORD_AUDIO"/>
```
(Without `tools:node="remove"`)

## How It Works Now

1. **Permission Check**: App checks if permission is already granted
2. **Request Permission**: If not granted, shows permission dialog
3. **Handle Denial**: 
   - If denied (can ask again): Shows error with retry button
   - If permanently denied: Shows alert to open settings
4. **Retry**: User can tap retry button to request permission again

## Troubleshooting

### Still Getting Permission Error?
1. **Check AndroidManifest**: Make sure `RECORD_AUDIO` is NOT marked with `tools:node="remove"`
2. **Rebuild App**: The manifest is generated, so you must rebuild
3. **Check App Settings**: Go to device Settings > Apps > eKazi Vendor > Permissions and ensure Microphone is enabled
4. **Clear App Data**: Sometimes clearing app data and reinstalling helps

### Permission Dialog Not Showing?
- Make sure you're testing on a real device or emulator with proper Android version
- Check that the permission is declared in `app.json` (it is ✅)
- Verify the app was rebuilt after the plugin change

## Code Changes Summary

### Files Modified:
1. `plugins/strip-media-permissions.js` - Removed RECORD_AUDIO from removal list
2. `app/Screens/CallScreen.tsx` - Improved permission handling with:
   - Permission status check
   - Better error messages
   - Settings link for permanently denied permissions
   - Retry button for permission errors
