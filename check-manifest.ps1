# Quick script to check AndroidManifest.xml after prebuild
# Run this after: npx expo prebuild --clean

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Checking AndroidManifest.xml" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$manifestPath = "android\app\src\main\AndroidManifest.xml"

if (-not (Test-Path $manifestPath)) {
    Write-Host "[✗] AndroidManifest.xml not found!" -ForegroundColor Red
    Write-Host "   Location: $manifestPath" -ForegroundColor Yellow
    Write-Host "   Run: npx expo prebuild --clean" -ForegroundColor Yellow
    exit 1
}

Write-Host "Manifest location: $manifestPath" -ForegroundColor Gray
Write-Host ""

# Read manifest content
$manifestContent = Get-Content $manifestPath -Raw

# Check for the permission
$permissionLines = Get-Content $manifestPath | Select-String -Pattern "FOREGROUND_SERVICE_MEDIA_PROJECTION"

if ($permissionLines) {
    Write-Host "[!] Permission found in manifest:" -ForegroundColor Yellow
    Write-Host ""
    
    $hasRemoval = $false
    foreach ($line in $permissionLines) {
        Write-Host "  $line" -ForegroundColor White
        
        if ($line -match 'tools:node="remove"') {
            $hasRemoval = $true
        }
    }
    
    Write-Host ""
    
    if ($hasRemoval) {
        Write-Host "[✓] CORRECT: Permission has tools:node='remove'" -ForegroundColor Green
        Write-Host "   This means the permission will be REMOVED during manifest merging" -ForegroundColor Gray
        Write-Host "   This is the expected behavior!" -ForegroundColor Gray
        Write-Host ""
        Write-Host "✅ Safe to proceed with build" -ForegroundColor Green
    } else {
        Write-Host "[✗] WARNING: Permission found but NO removal directive!" -ForegroundColor Red
        Write-Host "   The permission will NOT be removed during build" -ForegroundColor Red
        Write-Host "   Check your plugin configuration" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "❌ Do NOT build - fix plugin first" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "[✓] Permission NOT found in manifest" -ForegroundColor Green
    Write-Host "   This is the best case - permission completely removed" -ForegroundColor Gray
    Write-Host ""
    Write-Host "✅ Safe to proceed with build" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Additional Checks" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if tools namespace is declared
if ($manifestContent -match 'xmlns:tools') {
    Write-Host "[✓] tools namespace is declared" -ForegroundColor Green
} else {
    Write-Host "[!] tools namespace NOT found" -ForegroundColor Yellow
    Write-Host "   This might cause issues with tools:node='remove'" -ForegroundColor Yellow
}

# Check plugin is in app.json
if (Test-Path "app.json") {
    $appJson = Get-Content "app.json" -Raw
    if ($appJson -match "strip-media-permissions") {
        Write-Host "[✓] Plugin 'strip-media-permissions' is registered in app.json" -ForegroundColor Green
    } else {
        Write-Host "[✗] Plugin 'strip-media-permissions' NOT found in app.json!" -ForegroundColor Red
        Write-Host "   Add it to the plugins array" -ForegroundColor Yellow
    }
} else {
    Write-Host "[!] app.json not found" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. If checks passed, build your AAB:" -ForegroundColor White
Write-Host "     eas build --platform android --profile production --clear-cache" -ForegroundColor Gray
Write-Host ""
Write-Host "  2. After build, verify the final AAB:" -ForegroundColor White
Write-Host "     .\verify-permissions.ps1" -ForegroundColor Gray
