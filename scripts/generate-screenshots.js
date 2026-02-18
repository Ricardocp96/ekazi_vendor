/**
 * Screenshot Generation Script for Google Play Console
 * 
 * This script provides instructions and helper functions for generating
 * app screenshots for Google Play Console submission.
 * 
 * Google Play Console Requirements:
 * - Minimum 2 screenshots (maximum 8)
 * - Recommended: 4 screenshots
 * - Resolution: At least 320px and at most 3840px
 * - Aspect ratio: 16:9 or 9:16 for phones
 * - Format: PNG or JPEG (24-bit or 32-bit PNG, no alpha)
 * 
 * Recommended Screenshots for eKazi Vendor App:
 * 1. Dashboard/Home Screen - Shows metrics and pending requests
 * 2. Services Screen - Shows service management
 * 3. Orders Screen - Shows order management
 * 4. Calendar/Profile Screen - Shows scheduling or profile
 */

const fs = require('fs');
const path = require('path');

console.log(`
╔══════════════════════════════════════════════════════════════╗
║   eKazi Vendor App - Screenshot Generation Guide             ║
╚══════════════════════════════════════════════════════════════╝

📱 GOOGLE PLAY CONSOLE SCREENSHOT REQUIREMENTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Minimum: 2 screenshots
✓ Recommended: 4 screenshots
✓ Format: PNG or JPEG (24-bit or 32-bit PNG, no alpha)
✓ Resolution: 320px - 3840px (width or height)
✓ Aspect Ratio: 16:9 or 9:16 for phones

📸 RECOMMENDED SCREENSHOTS FOR YOUR APP:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Dashboard/Home Screen
   - Shows: Metrics, pending requests, upcoming jobs
   - Route: app/(tabs)/index.js
   - Component: Components/DashboardHome.js

2. Services Management Screen
   - Shows: Service list, categories, add service button
   - Route: app/(tabs)/services.js
   - Component: Components/Services.js

3. Orders/Bookings Screen
   - Shows: Order management, status updates
   - Route: app/orders/index.js

4. Calendar Screen
   - Shows: Scheduled appointments
   - Route: app/calendar/index.js

🔧 METHOD 1: Using ADB (Android Debug Bridge)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Connect your Android device or start an emulator
2. Enable USB debugging on your device
3. Navigate to each screen in the app
4. Run these commands:

   # Take screenshot
   adb shell screencap -p /sdcard/screenshot.png
   
   # Pull screenshot to computer
   adb pull /sdcard/screenshot.png ./screenshots/dashboard.png
   
   # Remove from device
   adb shell rm /sdcard/screenshot.png

5. Repeat for each screen you want to capture

📱 METHOD 2: Using the ScreenshotHelper Component
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Install dependencies:
   npm install

2. Add ScreenshotHelper to each screen temporarily:

   import { useRef } from 'react';
   import { View } from 'react-native';
   import ScreenshotHelper from '../Components/ScreenshotHelper';
   
   export default function YourScreen() {
     const screenshotRef = useRef(null);
     
     return (
       <View ref={screenshotRef} style={{ flex: 1 }}>
         {/* Your screen content */}
         <ScreenshotHelper viewRef={screenshotRef} screenName="Dashboard" />
       </View>
     );
   }

3. Run the app and tap the "Capture Screenshot" button on each screen
4. Screenshots will be saved to the device's document directory
5. Transfer them to your computer using:
   - Android File Transfer (Mac)
   - Windows File Explorer
   - ADB: adb pull /data/data/com.ricardo96.ekazi.vendor/files/screenshots/ ./screenshots/

🖼️ METHOD 3: Manual Screenshot (Easiest)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Run the app on a device or emulator
2. Navigate to each screen
3. Take a screenshot using device buttons:
   - Android: Power + Volume Down
   - Emulator: Click camera icon in toolbar
4. Screenshots are saved to device gallery
5. Transfer to computer and rename appropriately

📁 ORGANIZING SCREENSHOTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create a screenshots folder and organize like this:

screenshots/
  ├── 01-dashboard.png
  ├── 02-services.png
  ├── 03-orders.png
  └── 04-calendar.png

✨ TIPS FOR BEST SCREENSHOTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• Use a device/emulator with good resolution (1080x1920 or higher)
• Ensure screens show meaningful content (not empty states)
• Remove any debug overlays or development tools
• Use consistent device frame if adding frames
• Test screenshots look good at different sizes
• Ensure text is readable
• Show the app's key features clearly

📤 UPLOADING TO GOOGLE PLAY CONSOLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Go to Google Play Console
2. Select your app
3. Go to Store presence > Main store listing
4. Scroll to "Graphics"
5. Upload your screenshots in order
6. Save and publish

Need help? Check the README-SCREENSHOTS.md file for more details.
`);

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(__dirname, '..', 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
  console.log('\n✅ Created screenshots directory:', screenshotsDir);
}

console.log('\n✅ Script completed. Follow the instructions above to generate screenshots.\n');
