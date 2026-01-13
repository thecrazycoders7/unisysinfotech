# AWS Elastic Beanstalk Deployment Script for Windows PowerShell
# Usage: .\deploy.ps1 [environment-name]

param(
    [string]$Environment = "unisys-backend-prod"
)

Write-Host "🚀 Starting deployment to $Environment..." -ForegroundColor Cyan

# Check if EB CLI is installed
try {
    $null = Get-Command eb -ErrorAction Stop
} catch {
    Write-Host "❌ EB CLI not found. Please install it:" -ForegroundColor Red
    Write-Host "   pip install awsebcli --upgrade --user" -ForegroundColor Yellow
    exit 1
}

# Check if AWS CLI is configured
try {
    $null = aws sts get-caller-identity 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "AWS CLI not configured"
    }
} catch {
    Write-Host "❌ AWS CLI not configured. Please run: aws configure" -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
npm install --production

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Deploy to Elastic Beanstalk
Write-Host "🚀 Deploying to Elastic Beanstalk..." -ForegroundColor Cyan
eb deploy $Environment

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "🌐 Checking status..." -ForegroundColor Cyan
eb status $Environment

Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Check logs: eb logs"
Write-Host "   2. Open in browser: eb open"
Write-Host "   3. Test health endpoint: curl (eb status | Select-String 'CNAME').ToString().Split()[1]/api/health"



