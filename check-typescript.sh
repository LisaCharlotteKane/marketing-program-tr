#!/bin/bash

# TypeScript verification script
echo "🔍 Checking TypeScript compilation..."

# Try to find TypeScript executable
if command -v npx >/dev/null 2>&1; then
    echo "✅ npx found, running TypeScript check..."
    npx tsc --noEmit --project /workspaces/spark-template
elif command -v tsc >/dev/null 2>&1; then
    echo "✅ tsc found, running TypeScript check..."
    tsc --noEmit --project /workspaces/spark-template
else
    echo "❌ TypeScript compiler not found. Please install TypeScript globally or run npm install."
    exit 1
fi

echo "🎉 TypeScript check completed!"