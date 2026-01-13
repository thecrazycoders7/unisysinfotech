#!/bin/bash

# AWS S3 + CloudFront Deployment Script
# Usage: ./deploy.sh [bucket-name]

set -e

BUCKET_NAME=${1:-unisys-frontend-prod}

echo "🚀 Starting frontend deployment to $BUCKET_NAME..."

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Please install it:"
    echo "   https://aws.amazon.com/cli/"
    exit 1
fi

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS CLI not configured. Please run: aws configure"
    exit 1
fi

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "⚠️  Warning: .env.production not found"
    echo "   Creating from .env.production.example..."
    if [ -f .env.production.example ]; then
        cp .env.production.example .env.production
        echo "   Please update .env.production with your backend URL"
        exit 1
    else
        echo "   Please create .env.production with VITE_API_URL"
        exit 1
    fi
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build for production
echo "🔨 Building for production..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist folder not found"
    exit 1
fi

# Deploy to S3
echo "☁️  Uploading to S3..."
aws s3 sync dist/ s3://$BUCKET_NAME/ --delete --cache-control "public, max-age=31536000, immutable"

# Upload index.html with no cache
echo "📄 Uploading index.html (no cache)..."
aws s3 cp dist/index.html s3://$BUCKET_NAME/index.html --cache-control "no-cache, no-store, must-revalidate"

echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Check S3 bucket: aws s3 ls s3://$BUCKET_NAME/"
echo "   2. Invalidate CloudFront cache if needed"
echo "   3. Test your frontend URL"



