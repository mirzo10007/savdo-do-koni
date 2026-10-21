@echo off
rem Savdo do'koni dasturini ishga tushirish (chek oynasiz, to'g'ridan-to'g'ri printerga)
cd /d "%~dp0"
set "BR=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
if not exist "%BR%" set "BR=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
if not exist "%BR%" set "BR=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if not exist "%BR%" set "BR=%LocalAppData%\Google\Chrome\Application\chrome.exe"
if not exist "%BR%" (
  echo Microsoft Edge yoki Google Chrome topilmadi.
  pause
  exit /b
)
start "" "%BR%" --kiosk-printing --user-data-dir="%~dp0profil" --no-first-run --app="file:///%~dp0Savdo_dokoni.html"
