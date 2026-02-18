# Vendor App - Current Permissions Summary

## ✅ Active Permissions (Will be in Final AAB)

These permissions are **ACTIVE** and will appear in your final AAB file:

### 1. **INTERNET** ✅
- **Status:** Active
- **Sensitivity:** Low
- **Google Play Review:** ❌ No declaration needed
- **Purpose:** Network connectivity for API calls

### 2. **ACCESS_NETWORK_STATE** ✅
- **Status:** Active
- **Sensitivity:** Low
- **Google Play Review:** ❌ No declaration needed
- **Purpose:** Check network connectivity status

### 3. **ACCESS_WIFI_STATE** ✅
- **Status:** Active
- **Sensitivity:** Low
- **Google Play Review:** ❌ No declaration needed
- **Purpose:** Check WiFi connection status

### 4. **CAMERA** ✅ ⚠️
- **Status:** Active
- **Sensitivity:** **HIGH**
- **Google Play Review:** ✅ **YES - Declaration Required**
- **Purpose:** Take photos of services for upload
- **Declaration:** "Photo capture" - Service providers use camera to take photos of their services

### 5. **ACCESS_FINE_LOCATION** ✅ ⚠️
- **Status:** Active
- **Sensitivity:** **HIGH**
- **Google Play Review:** ✅ **YES - Declaration Required**
- **Purpose:** Set service provider location, location-based matching
- **Declaration:** "App functionality" - Used for service area and location-based matching

### 6. **RECORD_AUDIO** ✅ ⚠️
- **Status:** Active
- **Sensitivity:** **HIGH**
- **Google Play Review:** ✅ **YES - Declaration Required**
- **Purpose:** Voice/video calls with customers
- **Declaration:** "Voice or video calls" - Real-time communication feature

### 7. **MODIFY_AUDIO_SETTINGS** ✅
- **Status:** Active
- **Sensitivity:** Medium
- **Google Play Review:** ⚠️ May require explanation
- **Purpose:** Optimize audio routing during calls
- **Declaration:** Usually not required, but be prepared to explain if asked

### 8. **VIBRATE** ✅
- **Status:** Active
- **Sensitivity:** Low
- **Google Play Review:** ❌ No declaration needed
- **Purpose:** Haptic feedback for notifications

---

## ❌ Removed Permissions (NOT in Final AAB)

These permissions are marked with `tools:node="remove"` and will **NOT** appear in your final AAB:

1. ❌ `ACCESS_COARSE_LOCATION` - Removed (using FINE_LOCATION instead)
2. ❌ `FOREGROUND_SERVICE_MEDIA_PROJECTION` - Removed (not needed, was causing issues)
3. ❌ `READ_EXTERNAL_STORAGE` - Removed (not needed with Photo Picker API)
4. ❌ `READ_MEDIA_AUDIO` - Removed (not needed)
5. ❌ `READ_MEDIA_IMAGES` - Removed (not needed with Photo Picker API)
6. ❌ `READ_MEDIA_VIDEO` - Removed (not needed)
7. ❌ `READ_MEDIA_VISUAL_USER_SELECTED` - Removed (not needed)
8. ❌ `SYSTEM_ALERT_WINDOW` - Removed (not needed)
9. ❌ `WRITE_EXTERNAL_STORAGE` - Removed (not needed)

---

## 📊 Summary Table

| Permission | Status | In Final AAB? | Google Play Declaration? |
|------------|--------|---------------|-------------------------|
| INTERNET | ✅ Active | ✅ Yes | ❌ No |
| ACCESS_NETWORK_STATE | ✅ Active | ✅ Yes | ❌ No |
| ACCESS_WIFI_STATE | ✅ Active | ✅ Yes | ❌ No |
| CAMERA | ✅ Active | ✅ Yes | ✅ **YES** |
| ACCESS_FINE_LOCATION | ✅ Active | ✅ Yes | ✅ **YES** |
| RECORD_AUDIO | ✅ Active | ✅ Yes | ✅ **YES** |
| MODIFY_AUDIO_SETTINGS | ✅ Active | ✅ Yes | ⚠️ Maybe |
| VIBRATE | ✅ Active | ✅ Yes | ❌ No |
| READ_MEDIA_IMAGES | ❌ Removed | ❌ No | N/A |
| READ_MEDIA_VIDEO | ❌ Removed | ❌ No | N/A |
| READ_MEDIA_AUDIO | ❌ Removed | ❌ No | N/A |
| FOREGROUND_SERVICE_MEDIA_PROJECTION | ❌ Removed | ❌ No | N/A |

---

## ⚠️ Permissions Requiring Google Play Declaration

### 1. **CAMERA** 🔴
- **Declaration Required:** ✅ Yes
- **Category:** Photo capture
- **Explanation:** "Service providers use the camera to take photos of their services for upload to their service listings."

### 2. **ACCESS_FINE_LOCATION** 🔴
- **Declaration Required:** ✅ Yes
- **Category:** App functionality
- **Explanation:** "Location is used to allow service providers to set their service area and for customers to find nearby services."

### 3. **RECORD_AUDIO** 🔴
- **Declaration Required:** ✅ Yes
- **Category:** Voice or video calls
- **Explanation:** "Our app enables real-time voice and video communication between service providers and customers using the Agora SDK."

### 4. **MODIFY_AUDIO_SETTINGS** 🟡
- **Declaration Required:** ⚠️ Usually not, but be prepared
- **Category:** Audio optimization
- **Explanation:** "Used to optimize audio routing during voice and video calls for proper speaker/earpiece switching."

---

## ✅ Safe Permissions (No Declaration Needed)

These permissions are standard and won't trigger Google Play review:

- ✅ `INTERNET` - Standard network access
- ✅ `ACCESS_NETWORK_STATE` - Network status check
- ✅ `ACCESS_WIFI_STATE` - WiFi status check
- ✅ `VIBRATE` - Haptic feedback

---

## 📋 Google Play Compliance Checklist

**Before submitting vendor app:**

- [ ] Declare **CAMERA** for photo capture
- [ ] Declare **ACCESS_FINE_LOCATION** for location services
- [ ] Declare **RECORD_AUDIO** for voice/video calls
- [ ] Prepare explanation for **MODIFY_AUDIO_SETTINGS** (if asked)
- [ ] Verify **READ_MEDIA_IMAGES** is removed ✅ (Already done)
- [ ] Verify **FOREGROUND_SERVICE_MEDIA_PROJECTION** is removed ✅ (Already done)

---

## 🎯 Total Active Permissions: 8

**All are necessary for app functionality:**
- 3 for network connectivity
- 1 for camera (service photos)
- 1 for location (service area)
- 2 for audio (voice/video calls)
- 1 for haptics (notifications)

**All properly configured!** ✅
