# ============================================================
#  Resume Analyzer — Android Local Dev Launcher
#  Run this script to start everything needed to test the
#  Flutter Android app against your local backend.
# ============================================================

$ProjectRoot = "C:\Users\lvish\Downloads\29752835-0400-467d-9963-386d7b517de0"
$ADB = "C:\Users\lvish\AppData\Local\Android\Sdk\platform-tools\adb.exe"

Write-Host ""
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "  Resume Analyzer - Android Dev Launcher" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""

# ── 1. ADB reverse tunnels ────────────────────────────────────────────────────
Write-Host "[1/4] Setting up ADB reverse tunnels..." -ForegroundColor Yellow
if (Test-Path $ADB) {
    & $ADB reverse tcp:5173 tcp:5173   # Vite dev server
    & $ADB reverse tcp:5000 tcp:5000   # Flask backend
    Write-Host "      adb reverse OK (ports 5173 + 5000)" -ForegroundColor Green
    & $ADB reverse --list
} else {
    Write-Host "      WARNING: adb.exe not found at: $ADB" -ForegroundColor Red
    Write-Host "      Make sure Android SDK platform-tools is installed." -ForegroundColor Red
}

Write-Host ""

# ── 2. Start Flask backend in a new window ────────────────────────────────────
Write-Host "[2/4] Starting Flask backend (port 5000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command",
    "Set-Location '$ProjectRoot'; .\.venv\Scripts\python.exe backend\app.py"
Write-Host "      Flask backend window opened." -ForegroundColor Green

Start-Sleep -Seconds 2

# ── 3. Start Vite dev server in a new window ─────────────────────────────────
Write-Host "[3/4] Starting Vite dev server (port 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command",
    "Set-Location '$ProjectRoot\frontend'; npx vite --host"
Write-Host "      Vite dev server window opened." -ForegroundColor Green

Start-Sleep -Seconds 3

# ── 4. Run Flutter on Android ─────────────────────────────────────────────────
Write-Host "[4/4] Launching Flutter app on connected Android device..." -ForegroundColor Yellow
Write-Host ""
Set-Location "$ProjectRoot\mobile_flutter"
flutter run

Write-Host ""
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "  Done! Close the Flask and Vite windows when finished." -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
