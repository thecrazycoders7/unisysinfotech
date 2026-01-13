# AWS S3 + CloudFront Deployment Script for Windows PowerShell
# Usage: .\deploy.ps1 [bucket-name]

param(
    [string]$BucketName = "unisys-frontend-prod"
)

Write-Host "🚀 Starting frontend deployment to $BucketName..." -ForegroundColor Cyan

# Check if AWS CLI is installed
try {
    $null = Get-Command aws -ErrorAction Stop
} catch {
    Write-Host "❌ AWS CLI not found. Please install it:" -ForegroundColor Red
    Write-Host "   https://aws.amazon.com/cli/" -ForegroundColor Yellow
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

# Check if .env.production exists
if (-not (Test-Path ".env.production")) {
    Write-Host "⚠️  Warning: .env.production not found" -ForegroundColor Yellow
    if (Test-Path ".env.production.example") {
        Write-Host "   Creating from .env.production.example..." -ForegroundColor Yellow
        Copy-Item ".env.production.example" ".env.production"
        Write-Host "   Please update .env.production with your backend URL" -ForegroundColor Yellow
        exit 1
    } else {
        Write-Host "   Please create .env.production with VITE_API_URL" -ForegroundColor Yellow
        exit 1
    }
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Build for production
Write-Host "🔨 Building for production..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}

# Check if build was successful
if (-not (Test-Path "dist")) {
    Write-Host "❌ Build failed - dist folder not found" -ForegroundColor Red
    exit 1
}

# Deploy to S3
Write-Host "☁️  Uploading to S3..." -ForegroundColor Cyan
aws s3 sync dist/ "s3://$BucketName/" --delete --cache-control "public, max-age=31536000, immutable"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ S3 upload failed" -ForegroundColor Red
    exit 1
}

# Upload index.html with no cache
Write-Host "📄 Uploading index.html (no cache)..." -ForegroundColor Cyan
aws s3 cp dist/index.html "s3://$BucketName/index.html" --cache-control "no-cache, no-store, must-revalidate"

Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Check S3 bucket: aws s3 ls s3://$BucketName/"
Write-Host "   2. Invalidate CloudFront cache if needed"
Write-Host "   3. Test your frontend URL"





