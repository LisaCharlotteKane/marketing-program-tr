#!/bin/bash

# Script to export the Marketing Campaign Calculator app to a ZIP file

# Set variables
EXPORT_FILENAME="marketing-campaign-calculator.zip"
WORKSPACE_DIR="/workspaces/spark-template"
TEMP_DIR="/tmp/export-app"

# Create temporary directory
mkdir -p $TEMP_DIR

# Copy essential files
echo "Copying project files..."
cp $WORKSPACE_DIR/index.html $TEMP_DIR/
cp $WORKSPACE_DIR/tsconfig.json $TEMP_DIR/
cp $WORKSPACE_DIR/tailwind.config.js $TEMP_DIR/
cp $WORKSPACE_DIR/package.json $TEMP_DIR/
cp $WORKSPACE_DIR/package-lock.json $TEMP_DIR/
cp $WORKSPACE_DIR/vite.config.ts $TEMP_DIR/
cp $WORKSPACE_DIR/components.json $TEMP_DIR/
cp $WORKSPACE_DIR/EXPORT_GUIDE.md $TEMP_DIR/

# Copy directories
echo "Copying source code..."
mkdir -p $TEMP_DIR/src
cp -r $WORKSPACE_DIR/src/* $TEMP_DIR/src/

# Create necessary directories if they don't exist
mkdir -p $TEMP_DIR/public

# Create README
cat > $TEMP_DIR/README.md << 'EOF'
# Marketing Campaign Calculator

A comprehensive marketing campaign planning, tracking, and reporting tool for regional teams.

## Features

- Campaign Planning Table
- Budget Management by Region
- Execution Tracking
- Performance Reporting
- Data Persistence with GitHub Integration

## Getting Started

1. Clone this repository
2. Install dependencies with `npm install`
3. Start the development server with `npm run dev`

## Documentation

See the `EXPORT_GUIDE.md` file for detailed documentation on the application structure and how to customize it.

## Project Structure

- `src/App.tsx` - Main application component
- `src/components/` - UI components
- `src/hooks/` - Custom React hooks
- `src/services/` - Data management services

## Technologies Used

- React
- TypeScript
- Tailwind CSS
- shadcn/ui Components
- Recharts
- GitHub API Integration

## License

MIT
EOF

# Create .gitignore
cat > $TEMP_DIR/.gitignore << 'EOF'
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
EOF

# Create ZIP file
echo "Creating ZIP archive..."
cd $TEMP_DIR
zip -r $EXPORT_FILENAME *
zip -r $EXPORT_FILENAME .gitignore # Add hidden files

# Move ZIP to workspace
mv $EXPORT_FILENAME $WORKSPACE_DIR/

# Clean up
echo "Cleaning up temporary files..."
rm -rf $TEMP_DIR

echo "Export complete: $WORKSPACE_DIR/$EXPORT_FILENAME"
echo "You can now download this file to your local machine and extract it to your new repository."