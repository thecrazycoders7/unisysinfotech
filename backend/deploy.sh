#!/bin/bash

# AWS Elastic Beanstalk Deployment Script
# Usage: ./deploy.sh [environment-name]

set -e

ENVIRONMENT=${1:-unisys-backend-prod}

echo "🚀 Starting deployment to $ENVIRONMENT..."

# Check if EB CLI is installed
if ! command -v eb &> /dev/null; then
    echo "❌ EB CLI not found. Please install it:"
    echo "   pip install awsebcli --upgrade --user"
    exit 1
fi

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS CLI not configured. Please run: aws configure"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# Deploy to Elastic Beanstalk
echo "🚀 Deploying to Elastic Beanstalk..."
eb deploy $ENVIRONMENT

echo "✅ Deployment complete!"
echo "🌐 Checking status..."
eb status $ENVIRONMENT

echo ""
echo "📋 Next steps:"
echo "   1. Check logs: eb logs"
echo "   2. Open in browser: eb open"
echo "   3. Test health endpoint: curl \$(eb status | grep CNAME | awk '{print \$2}')/api/health"





