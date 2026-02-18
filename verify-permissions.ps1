# PowerShell script to verify FOREGROUND_SERVICE_MEDIA_PROJECTION permission is removed
# Run this after building your AAB file

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Permission Verification Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if bundletool is available
$bundletoolPath = "bundletool"
$bundletoolAvailable = $false

try {
    $null = Get-Command bundletool -ErrorAction Stop
    $bundletoolAvailable = $true
    Write-Host "[✓] bundletool is installed" -ForegroundColor Green
} catch {
    Write-Host "[✗] bundletool is not installed" -ForegroundColor Yellow
    Write-Host "   Download from: https://github.com/google/bundletool/releases" -ForegroundColor Yellow
    Write-Host "   Or install via: choco install bundletool" -ForegroundColor Yellow
}

# Check if aapt2 is available (part of Android SDK)
$aapt2Path = "$env:LOCALAPPDATA\Android\Sdk\build-tools\*\aapt2.exe"
$aapt2Available = $false

if (Test-Path $aapt2Path) {
    $aapt2Available = $true
    Write-Host "[✓] aapt2 is available" -ForegroundColor Green
} else {
    Write-Host "[✗] aapt2 not found in default location" -ForegroundColor Yellow
    Write-Host "   Make sure Android SDK Build Tools are installed" -ForegroundColor Yellow
}

Write-Host ""

# Function to check manifest in AAB
function Check-AABManifest {
    param([string]$aabPath)
    
    if (-not (Test-Path $aabPath)) {
        Write-Host "[✗] AAB file not found: $aabPath" -ForegroundColor Red
        return $false
    }
    
    Write-Host "Checking AAB file: $aabPath" -ForegroundColor Cyan
    Write-Host ""
    
    # Extract AAB to check manifest
    $tempDir = New-TemporaryFile | ForEach-Object { Remove-Item $_; New-Item -ItemType Directory -Path $_ }
    Write-Host "Extracting AAB to temporary directory..." -ForegroundColor Yellow
    
    try {
        # AAB is just a ZIP file
        Expand-Archive -Path $aabPath -DestinationPath $tempDir -Force
        
        # Check base manifest
        $manifestPath = Join-Path $tempDir "base\manifest\AndroidManifest.xml"
        
        if (Test-Path $manifestPath) {
            Write-Host "Found manifest in AAB" -ForegroundColor Green
            
            # Read and check for permission
            $manifestContent = Get-Content $manifestPath -Raw
            
            if ($manifestContent -match "FOREGROUND_SERVICE_MEDIA_PROJECTION") {
                Write-Host "[✗] PERMISSION FOUND IN AAB!" -ForegroundColor Red
                Write-Host ""
                Write-Host "Lines containing the permission:" -ForegroundColor Yellow
                $manifestContent -split "`n" | Select-String "FOREGROUND_SERVICE_MEDIA_PROJECTION" | ForEach-Object {
                    Write-Host "  $_" -ForegroundColor Red
                }
                Remove-Item $tempDir -Recurse -Force
                return $false
            } else {
                Write-Host "[✓] Permission NOT found in AAB manifest" -ForegroundColor Green
                Remove-Item $tempDir -Recurse -Force
                return $true
            }
        } else {
            Write-Host "[!] Could not find manifest in expected location" -ForegroundColor Yellow
            Write-Host "   Trying alternative method..." -ForegroundColor Yellow
            
            # Try using bundletool if available
            if ($bundletoolAvailable) {
                $apksPath = Join-Path $tempDir "app.apks"
                & bundletool build-apks --bundle=$aabPath --output=$apksPath --mode=universal
                
                if (Test-Path $apksPath) {
                    $universalApk = Join-Path $tempDir "universal.apk"
                    Expand-Archive -Path $apksPath -DestinationPath $tempDir -Force
                    
                    # Find APK in extracted files
                    $apkFiles = Get-ChildItem -Path $tempDir -Filter "*.apk" -Recurse
                    if ($apkFiles) {
                        $apkPath = $apkFiles[0].FullName
                        Check-APKManifest -apkPath $apkPath
                    }
                }
            }
            
            Remove-Item $tempDir -Recurse -Force
            return $false
        }
    } catch {
        Write-Host "[✗] Error extracting AAB: $_" -ForegroundColor Red
        Remove-Item $tempDir -Recurse -Force -ErrorAction SilentlyContinue
        return $false
    }
}

# Function to check manifest in APK
function Check-APKManifest {
    param([string]$apkPath)
    
    if (-not (Test-Path $apkPath)) {
        Write-Host "[✗] APK file not found: $apkPath" -ForegroundColor Red
        return $false
    }
    
    Write-Host "Checking APK file: $apkPath" -ForegroundColor Cyan
    Write-Host ""
    
    if ($aapt2Available) {
        try {
            $aapt2Exe = (Get-ChildItem $aapt2Path | Sort-Object LastWriteTime -Descending | Select-Object -First 1).FullName
            Write-Host "Using aapt2: $aapt2Exe" -ForegroundColor Gray
            
            $output = & $aapt2Exe dump badging $apkPath 2>&1
            
            if ($output -match "FOREGROUND_SERVICE_MEDIA_PROJECTION") {
                Write-Host "[✗] PERMISSION FOUND IN APK!" -ForegroundColor Red
                Write-Host ""
                Write-Host "Permission details:" -ForegroundColor Yellow
                $output | Select-String "FOREGROUND_SERVICE_MEDIA_PROJECTION" | ForEach-Object {
                    Write-Host "  $_" -ForegroundColor Red
                }
                return $false
            } else {
                Write-Host "[✓] Permission NOT found in APK" -ForegroundColor Green
                return $true
            }
        } catch {
            Write-Host "[✗] Error running aapt2: $_" -ForegroundColor Red
            return $false
        }
    } else {
        # Fallback: extract APK and check manifest
        Write-Host "Extracting APK to check manifest..." -ForegroundColor Yellow
        $tempDir = New-TemporaryFile | ForEach-Object { Remove-Item $_; New-Item -ItemType Directory -Path $_ }
        
        try {
            Expand-Archive -Path $apkPath -DestinationPath $tempDir -Force
            $manifestPath = Join-Path $tempDir "AndroidManifest.xml"
            
            if (Test-Path $manifestPath) {
                $manifestContent = Get-Content $manifestPath -Raw
                
                if ($manifestContent -match "FOREGROUND_SERVICE_MEDIA_PROJECTION") {
                    Write-Host "[✗] PERMISSION FOUND IN APK!" -ForegroundColor Red
                    Remove-Item $tempDir -Recurse -Force
                    return $false
                } else {
                    Write-Host "[✓] Permission NOT found in APK" -ForegroundColor Green
                    Remove-Item $tempDir -Recurse -Force
                    return $true
                }
            }
        } catch {
            Write-Host "[✗] Error extracting APK: $_" -ForegroundColor Red
            Remove-Item $tempDir -Recurse -Force -ErrorAction SilentlyContinue
            return $false
        }
    }
}

# Function to check source manifest
function Check-SourceManifest {
    $manifestPath = "android\app\src\main\AndroidManifest.xml"
    
    if (-not (Test-Path $manifestPath)) {
        Write-Host "[✗] Source manifest not found: $manifestPath" -ForegroundColor Red
        return $false
    }
    
    Write-Host "Checking source manifest: $manifestPath" -ForegroundColor Cyan
    Write-Host ""
    
    $manifestContent = Get-Content $manifestPath -Raw
    
    # Check if removal directive exists
    if ($manifestContent -match 'FOREGROUND_SERVICE_MEDIA_PROJECTION.*tools:node="remove"') {
        Write-Host "[✓] Removal directive found in source manifest" -ForegroundColor Green
        Write-Host "   The permission should be removed during build" -ForegroundColor Gray
        return $true
    } elseif ($manifestContent -match "FOREGROUND_SERVICE_MEDIA_PROJECTION") {
        Write-Host "[!] Permission found but removal directive may be missing" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Lines containing the permission:" -ForegroundColor Yellow
        $manifestContent -split "`n" | Select-String "FOREGROUND_SERVICE_MEDIA_PROJECTION" | ForEach-Object {
            Write-Host "  $_" -ForegroundColor Yellow
        }
        return $false
    } else {
        Write-Host "[✓] Permission not found in source manifest" -ForegroundColor Green
        return $true
    }
}

# Main execution
Write-Host "Step 1: Checking source AndroidManifest.xml" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan
$sourceOk = Check-SourceManifest
Write-Host ""

if (-not $sourceOk) {
    Write-Host "[!] Source manifest needs fixing. Run: npx expo prebuild --clean" -ForegroundColor Yellow
    Write-Host ""
}

# Check for AAB or APK files
Write-Host "Step 2: Checking built files" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan

$builtFiles = @()
$builtFiles += Get-ChildItem -Path "." -Filter "*.aab" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
$builtFiles += Get-ChildItem -Path "android\app\build\outputs\bundle\release" -Filter "*.aab" -ErrorAction SilentlyContinue | Select-Object -First 1
$builtFiles += Get-ChildItem -Path "android\app\build\outputs\apk\release" -Filter "*.apk" -ErrorAction SilentlyContinue | Select-Object -First 1

if ($builtFiles.Count -eq 0) {
    Write-Host "[!] No AAB or APK files found" -ForegroundColor Yellow
    Write-Host "   Build your app first, then run this script again" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   To build:" -ForegroundColor Cyan
    Write-Host "   - EAS: eas build --platform android --profile production" -ForegroundColor Gray
    Write-Host "   - Local: cd android && .\gradlew bundleRelease" -ForegroundColor Gray
} else {
    foreach ($file in $builtFiles) {
        Write-Host ""
        if ($file.Extension -eq ".aab") {
            Check-AABManifest -aabPath $file.FullName
        } else {
            Check-APKManifest -apkPath $file.FullName
        }
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Verification Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "If permission was found:" -ForegroundColor Yellow
Write-Host "  1. Run: npx expo prebuild --clean" -ForegroundColor White
Write-Host "  2. Rebuild your AAB/APK" -ForegroundColor White
Write-Host "  3. Run this script again to verify" -ForegroundColor White
Write-Host ""
Write-Host "If permission was NOT found:" -ForegroundColor Green
Write-Host "  ✓ Safe to upload to Google Play Console" -ForegroundColor Green
