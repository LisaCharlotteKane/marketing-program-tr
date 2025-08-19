#!/bin/bash

echo "Checking TypeScript compilation..."

# Try to compile the app
echo "Building the app..."
npm run build 2>&1

echo "Done."