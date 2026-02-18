# Verify Permission Removal Before Submitting to Google Play

## Quick Verification Steps

### Step 1: Verify Source Manifest ✅
Your source manifest already has the removal directive:
```xml
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PROJECTION" tools:node="remove"/>
```

This is correct! The `tools:node="remove"` tells Android to remove this permission during manifest merging.

### Step 2: Rebuild Your App

**IMPORTANT**: You MUST rebuild your app for the changes to take effect. The AAB file you uploaded was built BEFORE the plugin fix.

```bash
# Navigate to vendor app directory
cd vendor_app/ekazi

# Clean and rebuild
npx expo prebuild --clean

# Then build your AAB
# Option A: Using EAS Build (Recommended)
eas build --platform android --profile production --clear-cache

# Option B: Local build
cd android
./gradlew bundleRelease
```

### Step 3: Verify Permission is Removed

After building, verify the permission is NOT in your final AAB/APK:

#### Method 1: Using the Verification Script (Easiest)

**On Windows (PowerShell):**
```powershell
.\verify-permissions.ps1
```

**On Mac/Linux:**
```bash
chmod +x verify-permissions.sh
./verify-permissions.sh
```

#### Method 2: Manual Verification

**For AAB files:**

1. Extract the AAB (it's a ZIP file):
   ```bash
   # Rename .aab to .zip and extract
   cp your-app.aab your-app.zip
   unzip your-app.zip -d extracted
   ```

2. Check the manifest:
   ```bash
   # On Windows PowerShell
   Select-String -Path "extracted\base\manifest\AndroidManifest.xml" -Pattern "FOREGROUND_SERVICE_MEDIA_PROJECTION"
   
   # On Mac/Linux
   grep -i "FOREGROUND_SERVICE_MEDIA_PROJECTION" extracted/base/manifest/AndroidManifest.xml
   ```

   **Expected Result**: No matches found (permission removed) ✅
   **If found**: Permission still exists, rebuild needed ❌

**For APK files:**

1. Use aapt2 (Android SDK tool):
   ```bash
   # Find aapt2 in your Android SDK
   # Windows: %LOCALAPPDATA%\Android\Sdk\build-tools\[version]\aapt2.exe
   # Mac/Linux: ~/Library/Android/sdk/build-tools/[version]/aapt2
   
   aapt2 dump badging your-app.apk | grep -i "FOREGROUND_SERVICE_MEDIA_PROJECTION"
   ```

   **Expected Result**: No matches found ✅

#### Method 3: Check Merged Manifest (Most Reliable)

After building locally, check the merged manifest:

```bash
# Windows PowerShell
Select-String -Path "android\app\build\intermediates\merged_manifests\release\AndroidManifest.xml" -Pattern "FOREGROUND_SERVICE_MEDIA_PROJECTION"

# Mac/Linux
grep -i "FOREGROUND_SERVICE_MEDIA_PROJECTION" android/app/build/intermediates/merged_manifests/release/AndroidManifest.xml
```

**Expected Result**: 
- Either no matches found ✅
- OR the permission appears with `tools:node="remove"` (which means it will be removed) ✅

**If permission appears WITHOUT `tools:node="remove"`**: The plugin didn't work, check plugin configuration ❌

### Step 4: Upload to Google Play

**ONLY upload if verification shows the permission is removed!**

1. Upload your new AAB file to Google Play Console
2. If Google Play still flags it, use the declaration form:
   - Select: "No, my app does not use this permission"
   - Explain: "This permission is added by react-native-agora SDK but removed via tools:node='remove'. Our app does not use screen sharing."

## Troubleshooting

### Permission Still Found After Rebuild?

1. **Check plugin is registered** in `app.json`:
   ```json
   "plugins": [
     "./plugins/strip-media-permissions"
   ]
   ```

2. **Verify plugin file** exists at `plugins/strip-media-permissions.js`

3. **Clean rebuild**:
   ```bash
   rm -rf android  # or rmdir /s android on Windows
   npx expo prebuild --clean
   ```

4. **Check merged manifest** to see if removal directive is present

### Still Having Issues?

1. Check the merged manifest location:
   ```
   android/app/build/intermediates/merged_manifests/[variant]/AndroidManifest.xml
   ```

2. Look for the permission - it should either:
   - Not exist at all ✅
   - Exist with `tools:node="remove"` ✅
   - NOT exist without the removal attribute ❌

3. If it exists without removal, the plugin may need adjustment

## Quick Checklist

- [ ] Source manifest has `tools:node="remove"` ✅ (Already done)
- [ ] Rebuilt app with `npx expo prebuild --clean`
- [ ] Built new AAB file
- [ ] Verified permission NOT in AAB (using script or manual check)
- [ ] Ready to upload to Google Play

## Expected Results

✅ **SUCCESS**: Permission not found in final AAB/APK
- Safe to upload to Google Play
- Should not be flagged

❌ **FAILURE**: Permission found in final AAB/APK
- Do NOT upload
- Rebuild and verify again
- Check plugin configuration
