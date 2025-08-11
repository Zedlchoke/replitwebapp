#!/bin/bash

# Deploy script for the web application
set -e

echo "🚀 Starting deployment process..."

# Check if required environment variables are set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL environment variable is not set"
    exit 1
fi

if [ -z "$GOOGLE_CLOUD_PROJECT" ]; then
    echo "❌ Error: GOOGLE_CLOUD_PROJECT environment variable is not set"
    exit 1
fi

if [ -z "$GOOGLE_CLOUD_STORAGE_BUCKET" ]; then
    echo "❌ Error: GOOGLE_CLOUD_STORAGE_BUCKET environment variable is not set"
    exit 1
fi

echo "✅ Environment variables check passed"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build the application
echo "🔨 Building the application..."
npm run build

# Run database migrations
echo "🗄️ Running database migrations..."
npm run db:push

# Start the application
echo "🚀 Starting the application..."
npm start
