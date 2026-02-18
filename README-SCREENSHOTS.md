# Screenshot Generation Guide for Google Play Console

This guide will help you generate the required screenshots for your eKazi Vendor app submission to Google Play Console.

## Requirements

- **Minimum**: 2 screenshots
- **Recommended**: 4 screenshots
- **Format**: PNG or JPEG (24-bit or 32-bit PNG, no alpha)
- **Resolution**: 320px - 3840px (width or height)
- **Aspect Ratio**: 16:9 or 9:16 for phones

## Recommended Screenshots

For the best representation of your app, capture these 4 screens:

1. **Dashboard/Home Screen** - Shows metrics, pending requests, and upcoming jobs
2. **Services Management Screen** - Shows service list and management features
3. **Orders/Bookings Screen** - Shows order management and status updates
4. **Calendar Screen** - Shows scheduled appointments

## Method 1: Using ADB (Recommended for Development)

### Prerequisites
- Android device connected via USB or Android emulator running
- ADB installed and in your PATH
- USB debugging enabled on device

### Steps

1. **Start your app** on the device/emulator:
   ```bash
   npm run android
   ```

2. **Navigate to the first screen** (Dashboard)

3. **Capture screenshot**:
   ```bash
   adb shell screencap -p /sdcard/screenshot.png
   adb pull /sdcard/screenshot.png ./screenshots/01-dashboard.png
   adb shell rm /sdcard/screenshot.png
   ```

4. **Repeat for each screen**:
   - Navigate to Services tab → Capture → Save as `02-services.png`
   - Navigate to Orders screen → Capture → Save as `03-orders.png`
   - Navigate to Calendar screen → Capture → Save as `04-calendar.png`

### Batch Script (Windows)

Create `capture-screenshots.bat`:
```batch
@echo off
echo Capturing Dashboard...
adb shell screencap -p /sdcard/screenshot.png
adb pull /sdcard/screenshot.png screenshots\01-dashboard.png
adb shell rm /sdcard/screenshot.png
timeout /t 3

echo Capturing Services...
adb shell screencap -p /sdcard/screenshot.png
adb pull /sdcard/screenshot.png screenshots\02-services.png
adb shell rm /sdcard/screenshot.png
timeout /t 3

echo Capturing Orders...
adb shell screencap -p /sdcard/screenshot.png
adb pull /sdcard/screenshot.png screenshots\03-orders.png
adb shell rm /sdcard/screenshot.png
timeout /t 3

echo Capturing Calendar...
adb shell screencap -p /sdcard/screenshot.png
adb pull /sdcard/screenshot.png screenshots\04-calendar.png
adb shell rm /sdcard/screenshot.png

echo Done! Check the screenshots folder.
pause
```

## Method 2: Using ScreenshotHelper Component

### Steps

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Temporarily add ScreenshotHelper to each screen**:

   Example for Dashboard (`app/(tabs)/index.js`):
   ```javascript
   import { useRef } from 'react';
   import { View } from 'react-native';
   import DashboardHome from '../../Components/DashboardHome';
   import ScreenshotHelper from '../../Components/ScreenshotHelper';
   
   export default function HomeTab() {
     const screenshotRef = useRef(null);
     return (
       <View ref={screenshotRef} style={{ flex: 1 }}>
         <DashboardHome />
         <ScreenshotHelper viewRef={screenshotRef} screenName="Dashboard" />
       </View>
     );
   }
   ```

3. **Run the app** and tap the "Capture Screenshot" button on each screen

4. **Retrieve screenshots** from device:
   ```bash
   adb pull /data/data/com.ricardo96.ekazi.vendor/files/screenshots/ ./screenshots/
   ```

5. **Remove ScreenshotHelper** from all screens before production build

## Method 3: Manual Screenshot (Easiest)

### Steps

1. **Run the app** on a device or emulator:
   ```bash
   npm run android
   ```

2. **Navigate to each screen** in the app

3. **Take screenshot**:
   - **Android Device**: Press Power + Volume Down buttons simultaneously
   - **Android Emulator**: Click the camera icon in the emulator toolbar
   - **iOS Simulator**: Cmd + S (or File > Save Screen)

4. **Transfer screenshots** to your computer:
   - Use Android File Transfer (Mac)
   - Use Windows File Explorer
   - Or use ADB: `adb pull /sdcard/Pictures/Screenshots/ ./screenshots/`

5. **Rename files** appropriately:
   - `01-dashboard.png`
   - `02-services.png`
   - `03-orders.png`
   - `04-calendar.png`

## Organizing Screenshots

Create a `screenshots` folder in your project root and organize files:

```
vendor_app/ekazi/
  └── screenshots/
      ├── 01-dashboard.png
      ├── 02-services.png
      ├── 03-orders.png
      └── 04-calendar.png
```

## Tips for Best Screenshots

1. **Use high resolution**: 1080x1920 or higher for best quality
2. **Show meaningful content**: Ensure screens have data, not empty states
3. **Remove debug tools**: Hide any development overlays or debug menus
4. **Consistent styling**: Use the same device frame if adding frames
5. **Readable text**: Ensure all text is clear and readable
6. **Key features**: Highlight the app's main functionality
7. **Clean UI**: Make sure the UI looks polished and professional

## Image Optimization

Before uploading, you may want to optimize images:

### Using ImageMagick (if installed):
```bash
# Resize to 1080x1920 (9:16 aspect ratio)
magick convert screenshot.png -resize 1080x1920 -quality 95 optimized.png

# Or maintain aspect ratio
magick convert screenshot.png -resize 1080x optimized.png
```

### Using Online Tools:
- [TinyPNG](https://tinypng.com/) - Compress PNG files
- [Squoosh](https://squoosh.app/) - Optimize and resize images

## Uploading to Google Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Select your app (eKazi Vendor)
3. Navigate to **Store presence** > **Main store listing**
4. Scroll to the **Graphics** section
5. Click **Add** under "Phone screenshots"
6. Upload your screenshots in order (1-4)
7. Click **Save** and then **Review** to publish

## Troubleshooting

### ADB not found
- Install Android SDK Platform Tools
- Add to PATH: `C:\Users\YourName\AppData\Local\Android\Sdk\platform-tools`

### Screenshots are too large
- Use image optimization tools to reduce file size
- Google Play accepts up to 8MB per image

### Screenshots look blurry
- Use a device/emulator with higher resolution
- Ensure you're capturing at native resolution
- Avoid scaling images up

### Can't find screenshots on device
- Check: `/sdcard/Pictures/Screenshots/` (Android)
- Use file manager app to locate screenshots
- Check device gallery app

## Need Help?

- Check the script output: `npm run screenshots`
- Review Google Play Console [screenshot requirements](https://support.google.com/googleplay/android-developer/answer/9866151)
- Contact support if you encounter issues
