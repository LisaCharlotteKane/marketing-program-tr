#!/bin/bash

echo "🚀 Setting up Marketing Campaign Planner for GitHub Pages deployment..."

# Ensure we're in the right directory
cd "$(dirname "$0")"

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building the application..."
npm run build

echo "📄 Creating 404.html for SPA routing..."
cp ./dist/index.html ./dist/404.html

echo "✅ Build complete! Files are ready in ./dist/"
echo ""
echo "📋 Next steps:"
echo "1. Commit and push your changes to the main branch"
echo "2. Go to your repository Settings → Pages"
echo "3. Set Source to 'GitHub Actions'"
echo "4. The deployment workflow will run automatically"
echo ""
echo "🌐 Your app will be available at: https://[username].github.io/[repository-name]/"