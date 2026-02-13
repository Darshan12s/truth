@echo off
echo Vercel Deployment Script
echo ====================

REM Check if VERCEL_TOKEN is set
if defined VERCEL_TOKEN (
    echo Using existing VERCEL_TOKEN
    node deploy.js
) else (
    echo Error: VERCEL_TOKEN environment variable is not set.
    echo.
    echo To deploy, you need a Vercel API token:
    echo.
    echo 1. Go to https://vercel.com/account/tokens
    echo 2. Click "Create Token"
    echo 3. Copy the token
    echo.
    echo Then run this command with your token:
    echo.
    echo    set VERCEL_TOKEN=your-token-here
    echo    node deploy.js
    echo.
    echo Or run this script as:
    echo    set VERCEL_TOKEN=your-token-here && node deploy.js
)
