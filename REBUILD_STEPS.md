# How to Rebuild Your Vendor App

## Quick Steps to Rebuild

### Option 1: Using EAS Build (Recommended for Production)

This builds your app in the cloud and produces a production-ready AAB file.

```powershell
# 1. Navigate to vendor app directory
cd "c:\Users\User\Desktop\Ekazi\ekazi_mobile\vendor_app\ekazi"

# 2. Clean previous build artifacts
npx expo prebuild --clean

# 3. Build with EAS (this will upload to Google Play)
eas build --platform android --profile production --clear-cache
```

**What this does:**
- Cleans old Android native code
- Regenerates AndroidManifest.xml with the updated plugin
- Builds a new AAB file in the cloud
- Downloads the AAB when complete

**After build completes:**
- The AAB file will be downloaded automatically
- Upload it to Google Play Console
- Run `.\verify-permissions.ps1` to verify permission is removed

---

### Option 2: Local Build (Faster for Testing)

Build on your local machine (requires Android SDK).

```powershell
# 1. Navigate to vendor app directory
cd "c:\Users\User\Desktop\Ekazi\ekazi_mobile\vendor_app\ekazi"

# 2. Clean and regenerate native code
npx expo prebuild --clean

# 3. Build AAB locally
cd android
.\gradlew bundleRelease

# 4. Find your AAB file
# Location: android\app\build\outputs\bundle\release\app-release.aab
```

**What this does:**
- Cleans old Android native code
- Regenerates AndroidManifest.xml with the updated plugin
- Builds AAB file locally
- AAB will be at: `android\app\build\outputs\bundle\release\app-release.aab`

**After build completes:**
- Check the AAB location above
- Run `.\verify-permissions.ps1` to verify permission is removed
- Upload to Google Play Console

---

## Step-by-Step Guide (EAS Build)

### Step 1: Open PowerShell/Terminal

Navigate to your vendor app:
```powershell
cd "c:\Users\User\Desktop\Ekazi\ekazi_mobile\vendor_app\ekazi"
```

### Step 2: Clean Previous Build

This removes the old Android folder and regenerates it with the fixed plugin:
```powershell
npx expo prebuild --clean
```

**Expected output:**
```
✔ Created native project
✔ Android project created
```

### Step 3: Verify Plugin is Applied

Check that the manifest has the removal directive:
```powershell
Get-Content android\app\src\main\AndroidManifest.xml | Select-String "FOREGROUND_SERVICE_MEDIA_PROJECTION"
```

**Should show:**
```xml
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PROJECTION" tools:node="remove"/>
```

### Step 4: Build AAB

**For EAS Build:**
```powershell
eas build --platform android --profile production --clear-cache
```

**For Local Build:**
```powershell
cd android
.\gradlew bundleRelease
```

### Step 5: Verify Permission is Removed

After build completes, verify:
```powershell
# Run verification script
.\verify-permissions.ps1

# OR manually check (if you have aapt2)
# Extract AAB, check manifest, etc.
```

### Step 6: Upload to Google Play

Only upload if verification shows permission is removed!

1. Go to Google Play Console
2. Upload the new AAB file
3. Submit for review

---

## Troubleshooting

### "Command not found: eas"

Install EAS CLI:
```powershell
npm install -g eas-cli
```

### "Command not found: gradlew"

Make sure you're in the `android` directory and the file exists:
```powershell
cd android
ls gradlew  # Should show the file
```

If missing, run `npx expo prebuild` first.

### Build Fails

1. **Clean everything:**
   ```powershell
   rm -r android  # or rmdir /s android on Windows
   npx expo prebuild --clean
   ```

2. **Check for errors** in the build output

3. **Verify plugin file exists:**
   ```powershell
   Test-Path plugins\strip-media-permissions.js
   ```

### Permission Still Found After Build

1. **Double-check plugin is in app.json:**
   ```powershell
   Get-Content app.json | Select-String "strip-media-permissions"
   ```
   Should show: `"./plugins/strip-media-permissions"`

2. **Verify plugin file content:**
   ```powershell
   Get-Content plugins\strip-media-permissions.js | Select-String "FOREGROUND_SERVICE_MEDIA_PROJECTION"
   ```
   Should show the permission in the removal list

3. **Rebuild with clean:**
   ```powershell
   rm -r android
   npx expo prebuild --clean
   eas build --platform android --profile production --clear-cache
   ```

---

## Quick Reference

| Task | Command |
|------|---------|
| Clean & regenerate | `npx expo prebuild --clean` |
| EAS Build | `eas build --platform android --profile production --clear-cache` |
| Local Build | `cd android && .\gradlew bundleRelease` |
| Verify permission | `.\verify-permissions.ps1` |
| Check manifest | `Get-Content android\app\src\main\AndroidManifest.xml \| Select-String "FOREGROUND_SERVICE_MEDIA_PROJECTION"` |

---

## Expected Build Time

- **EAS Build**: 10-20 minutes (cloud build)
- **Local Build**: 5-10 minutes (depends on your machine)

---

## After Rebuild Checklist

- [ ] Build completed successfully
- [ ] Verified permission removal in source manifest
- [ ] Ran verification script on AAB file
- [ ] Permission NOT found in final AAB ✅
- [ ] Ready to upload to Google Play
