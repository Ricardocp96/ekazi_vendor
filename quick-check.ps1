# Quick check after npx expo prebuild --clean
$manifest = "android\app\src\main\AndroidManifest.xml"

if (-not (Test-Path $manifest)) {
    Write-Host "❌ Manifest not found. Run: npx expo prebuild --clean" -ForegroundColor Red
    exit
}

Write-Host "`nChecking manifest..." -ForegroundColor Cyan
$lines = Get-Content $manifest | Select-String "FOREGROUND_SERVICE_MEDIA_PROJECTION"

if ($lines) {
    Write-Host "`nFound permission line:" -ForegroundColor Yellow
    Write-Host $lines.Line -ForegroundColor White
    
    if ($lines.Line -match 'tools:node="remove"') {
        Write-Host "`n✅ CORRECT: Has tools:node='remove' - will be removed during build!" -ForegroundColor Green
    } else {
        Write-Host "`n❌ WARNING: No removal directive found!" -ForegroundColor Red
    }
} else {
    Write-Host "`n✅ Permission not found (best case)" -ForegroundColor Green
}

Write-Host ""
