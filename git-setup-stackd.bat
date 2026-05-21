@echo off
setlocal
:: ─────────────────────────────────────────────────────────
::  Stackd — Git + GitHub Setup
::  Run this AFTER installing Git and creating a GitHub account
::  Run this from inside your stackd-site\ folder OR anywhere
:: ─────────────────────────────────────────────────────────

set SITE_PATH=%USERPROFILE%\Documents\Corezality\stackd-site

echo.
echo  Stackd — Git Setup
echo  ─────────────────────────────────────────────
echo.

:: ── Check Git is installed ────────────────────────────────
where git >nul 2>&1
if %errorlevel% neq 0 (
    echo  ERROR: Git is not installed.
    echo  Download it from: https://git-scm.com/download/win
    echo  Install with all defaults, then re-run this file.
    echo.
    pause
    exit /b 1
)
echo  Git found. Continuing...
echo.

:: ── Ask for GitHub details ────────────────────────────────
set /p GH_USER=  Enter your GitHub username: 
set /p GH_EMAIL=  Enter your GitHub email address: 

echo.
echo  Configuring Git identity...
git config --global user.name "%GH_USER%"
git config --global user.email "%GH_EMAIL%"
git config --global core.autocrlf true
git config --global init.defaultBranch main

:: ── Move into stackd-site ─────────────────────────────────
cd /d "%SITE_PATH%"

if not exist "index.html" (
    echo.
    echo  WARNING: index.html not found in stackd-site\
    echo  Make sure you have moved your files before continuing.
    echo  Expected location: %SITE_PATH%\index.html
    echo.
    pause
)

:: ── Init repo ─────────────────────────────────────────────
echo  Initialising Git repository...
git init

:: ── Create .gitignore ─────────────────────────────────────
echo  Creating .gitignore...
(
echo # OS
echo .DS_Store
echo Thumbs.db
echo desktop.ini
echo.
echo # Editor
echo .vscode\
echo .idea\
echo *.suo
echo *.user
echo.
echo # Logs
echo *.log
echo npm-debug.log*
echo.
echo # Secrets — never commit these
echo .env
echo .env.local
echo *.env
echo secrets.json
) > .gitignore

:: ── First commit ──────────────────────────────────────────
echo  Staging files...
git add .

echo  Creating first commit...
git commit -m "Initial commit — Stackd marketing site"

:: ── Instructions for GitHub push ─────────────────────────
echo.
echo  ─────────────────────────────────────────────────────
echo   Local Git repo ready. Now do this in your browser:
echo  ─────────────────────────────────────────────────────
echo.
echo   1. Go to https://github.com/new
echo   2. Repository name: stackd-site
echo   3. Set to PRIVATE
echo   4. Do NOT tick "Add README" or "Add .gitignore"
echo   5. Click "Create repository"
echo   6. Copy the two lines GitHub shows under:
echo      "...or push an existing repository from the command line"
echo      They will look like:
echo.
echo        git remote add origin https://github.com/%GH_USER%/stackd-site.git
echo        git push -u origin main
echo.
echo   7. Paste those two lines into a new CMD window
echo      opened at: %SITE_PATH%
echo      (Shift + Right-click in the folder → Open in Terminal)
echo.
echo  ─────────────────────────────────────────────────────
echo   After pushing, come back and do Netlify setup:
echo.
echo   1. Go to https://app.netlify.com
echo   2. Add new site → Import from Git → GitHub
echo   3. Authorise Netlify to access your GitHub
echo   4. Select stackd-site repo
echo   5. Build settings:
echo        Branch: main
echo        Build command: (leave empty)
echo        Publish directory: .
echo   6. Click Deploy site
echo   7. Go to Site settings → Domain management
echo      → Add custom domain → stackd.co.za
echo      Netlify will give you 2 DNS records to add at HostAfrica
echo  ─────────────────────────────────────────────────────
echo.
pause
