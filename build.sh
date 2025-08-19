#!/bin/bash

echo "Building marketing campaign planner..."

# Remove old dist
rm -rf dist

# Create dist directory
mkdir -p dist

# Build with minimal config
NODE_ENV=production ./node_modules/.bin/vite build --mode production

# Check if build succeeded
if [ -f "dist/index.html" ]; then
    echo "✅ Build successful!"
    echo "Files in dist:"
    ls -la dist/
    
    # Create a simple 404.html for GitHub Pages SPA routing
    cp dist/index.html dist/404.html
    
    echo "✅ Ready for deployment to GitHub Pages"
else
    echo "❌ Build failed - no index.html found"
    exit 1
fi