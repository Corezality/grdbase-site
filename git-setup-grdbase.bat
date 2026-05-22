@echo off
setlocal
:: ─────────────────────────────────────────────────────────
::  Grdbase — Git + GitHub Setup
::  Corezality PTY Ltd
::
::  INSTRUCTIONS:
::  1. Place this file inside your grdbase-site\ folder
::  2. Double-click to run
::  3. Delete this file after you've pushed to GitHub
::
::  BEFORE RUNNING:
::  - Git must be installed (git-scm.com)
::  - You must have a GitHub account
::  - index.html, start.html, thank-you.html and netlify.toml
::    must already be in this folder
:: ─────────────────────────────────────────────────────────

:: Work from the folder this bat file lives in
cd /d "%~dp0"

echo.
echo  Grdbase — Git Setup
echo  ─────────────────────────────────────────
echo  Working folder: %~dp0
echo.

:: ── Check Git is installed ────────────────────────────────
where git >nul 2>&1
if %errorlevel% neq 0 (
    echo  ERROR: Git is not installed.
    echo  Download: https://git-scm.com/download/win
    echo  Install with all defaults then re-run this file.
    echo.
    pause
    exit /b 1
)
echo  Git found. Good.
echo.

:: ── Ask for GitHub details ────────────────────────────────
set /p GH_USER=  Enter your GitHub username: 
set /p GH_EMAIL=  Enter your GitHub email address: 
echo.

:: ── Configure Git identity ────────────────────────────────
git config --global user.name "%GH_USER%"
git config --global user.email "%GH_EMAIL%"
git config --global core.autocrlf true
git config --global init.defaultBranch main
echo  Git identity set.

:: ── Check key files exist ─────────────────────────────────
echo.
echo  Checking files...
if not exist "index.html"      echo  WARNING: index.html not found
if not exist "start.html"      echo  WARNING: start.html not found
if not exist "thank-you.html"  echo  WARNING: thank-you.html not found
if not exist "netlify.toml"    echo  WARNING: netlify.toml not found
if not exist "netlify\functions\claude-intake.js" echo  WARNING: claude-intake.js not found

:: ── Create .gitignore ─────────────────────────────────────
echo  Creating .gitignore...
(
echo # OS files
echo .DS_Store
echo Thumbs.db
echo desktop.ini
echo.
echo # Editor
echo .vscode\
echo .idea\
echo.
echo # Logs
echo *.log
echo.
echo # NEVER commit secrets
echo .env
echo .env.local
echo *.env
echo secrets.json
echo.
echo # This setup file — delete it after use
echo git-setup-grdbase.bat
) > .gitignore

:: ── Init repo and first commit ────────────────────────────
echo  Initialising Git repo...
git init

echo  Staging all files...
git add .

echo  Creating first commit...
git commit -m "Initial commit — Grdbase marketing site + AI intake agent"

:: ── Done — manual steps ───────────────────────────────────
echo.
echo  ─────────────────────────────────────────────────────
echo   Local repo ready. Now do these steps in your browser:
echo  ─────────────────────────────────────────────────────
echo.
echo   STEP 1 — Create repo on GitHub
echo   Go to: https://github.com/new
echo   Name: grdbase-site
echo   Visibility: Private
echo   Do NOT tick Add README, .gitignore or license
echo   Click: Create repository
echo.
echo   STEP 2 — Push your code
echo   GitHub will show you two commands under:
echo   "...or push an existing repository from the command line"
echo   They look like this (yours will have your username):
echo.
echo     git remote add origin https://github.com/%GH_USER%/grdbase-site.git
echo     git push -u origin main
echo.
echo   Right-click inside this folder, Open in Terminal
echo   Paste those two commands and press Enter after each
echo.
echo   STEP 3 — Connect Netlify
echo   Go to: https://app.netlify.com
echo   Log into your existing account
echo   Add new site - Import from Git - GitHub
echo   Select: grdbase-site
echo   Build command: (leave empty)
echo   Publish directory: .
echo   Click: Deploy site
echo.
echo   STEP 4 — Add your API key
echo   Netlify dashboard - your site
echo   Site configuration - Environment variables
echo   Add variable:
echo     Key:   ANTHROPIC_API_KEY
echo     Value: (from console.anthropic.com)
echo.
echo   STEP 5 — Add your domain
echo   Netlify - Site configuration - Domain management
echo   Add custom domain: grdbase.co.za
echo   Copy the two DNS records Netlify gives you
echo   Go to HostAfrica - Manage DNS - add both records
echo.
echo  ─────────────────────────────────────────────────────
echo   DELETE this bat file once you have pushed to GitHub.
echo   It is not part of your site.
echo  ─────────────────────────────────────────────────────
echo.
pause
