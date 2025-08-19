#!/bin/bash

echo "Testing app functionality..."

# Test if we can start the dev server
echo "Attempting to start dev server..."
timeout 10 npm run dev &
DEV_PID=$!

# Wait a moment
sleep 3

# Check if the process is still running
if kill -0 $DEV_PID 2>/dev/null; then
    echo "✓ Dev server started successfully"
    kill $DEV_PID
else
    echo "❌ Dev server failed to start"
fi

echo "Test completed."