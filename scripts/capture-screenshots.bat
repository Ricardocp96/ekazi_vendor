@echo off
REM Screenshot Capture Script for Google Play Console
REM This script helps capture screenshots from Android device/emulator using ADB

echo.
echo ========================================
echo   eKazi Vendor - Screenshot Capture
echo ========================================
echo.

REM Check if ADB is available
where adb >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: ADB not found in PATH
    echo Please install Android SDK Platform Tools and add to PATH
    echo.
    pause
    exit /b 1
)

REM Check if device is connected
adb devices | findstr "device$" >nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: No Android device or emulator detected
    echo Please connect a device or start an emulator
    echo.
    pause
    exit /b 1
)

REM Create screenshots directory if it doesn't exist
if not exist "..\screenshots" mkdir "..\screenshots"

echo.
echo Instructions:
echo 1. Make sure your app is running on the device/emulator
echo 2. Navigate to each screen when prompted
echo 3. Press any key when ready to capture
echo.
pause

REM Dashboard Screenshot
echo.
echo ========================================
echo Step 1/4: Dashboard Screen
echo ========================================
echo Please navigate to the Dashboard/Home screen in your app
echo Press any key when ready to capture...
pause >nul
echo Capturing Dashboard screenshot...
adb shell screencap -p /sdcard/screenshot.png
adb pull /sdcard/screenshot.png "..\screenshots\01-dashboard.png" 2>nul
adb shell rm /sdcard/screenshot.png
if exist "..\screenshots\01-dashboard.png" (
    echo ✓ Dashboard screenshot saved!
) else (
    echo ✗ Failed to capture Dashboard screenshot
)

timeout /t 2 >nul

REM Services Screenshot
echo.
echo ========================================
echo Step 2/4: Services Screen
echo ========================================
echo Please navigate to the Services screen in your app
echo Press any key when ready to capture...
pause >nul
echo Capturing Services screenshot...
adb shell screencap -p /sdcard/screenshot.png
adb pull /sdcard/screenshot.png "..\screenshots\02-services.png" 2>nul
adb shell rm /sdcard/screenshot.png
if exist "..\screenshots\02-services.png" (
    echo ✓ Services screenshot saved!
) else (
    echo ✗ Failed to capture Services screenshot
)

timeout /t 2 >nul

REM Orders Screenshot
echo.
echo ========================================
echo Step 3/4: Orders Screen
echo ========================================
echo Please navigate to the Orders/Bookings screen in your app
echo Press any key when ready to capture...
pause >nul
echo Capturing Orders screenshot...
adb shell screencap -p /sdcard/screenshot.png
adb pull /sdcard/screenshot.png "..\screenshots\03-orders.png" 2>nul
adb shell rm /sdcard/screenshot.png
if exist "..\screenshots\03-orders.png" (
    echo ✓ Orders screenshot saved!
) else (
    echo ✗ Failed to capture Orders screenshot
)

timeout /t 2 >nul

REM Calendar Screenshot
echo.
echo ========================================
echo Step 4/4: Calendar Screen
echo ========================================
echo Please navigate to the Calendar screen in your app
echo Press any key when ready to capture...
pause >nul
echo Capturing Calendar screenshot...
adb shell screencap -p /sdcard/screenshot.png
adb pull /sdcard/screenshot.png "..\screenshots\04-calendar.png" 2>nul
adb shell rm /sdcard/screenshot.png
if exist "..\screenshots\04-calendar.png" (
    echo ✓ Calendar screenshot saved!
) else (
    echo ✗ Failed to capture Calendar screenshot
)

echo.
echo ========================================
echo Screenshot Capture Complete!
echo ========================================
echo.
echo Screenshots saved to: ..\screenshots\
echo.
echo Files created:
dir /b "..\screenshots\*.png" 2>nul
echo.
echo Next steps:
echo 1. Review the screenshots in the screenshots folder
echo 2. Optimize images if needed (resize, compress)
echo 3. Upload to Google Play Console
echo.
pause
