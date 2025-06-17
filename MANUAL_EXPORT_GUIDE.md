# How to Export the App Files

Since you can't directly download a ZIP file from this environment, here are the steps to manually export all necessary files to your own repository:

## 1. Essential Configuration Files

Copy these files from the root directory to your new repository:

- `index.html` - Main HTML entry point
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `package.json` - Dependencies and scripts
- `package-lock.json` - Exact versions of dependencies
- `vite.config.ts` - Vite build configuration
- `components.json` - shadcn/ui component configuration

## 2. Source Code Directory

The entire `src` directory contains the application code. Copy all files and subdirectories:

```
src/
├── App.tsx - Main application component
├── index.css - CSS styles and theme
├── components/ - UI components
├── hooks/ - Custom React hooks
├── services/ - Data management services
├── lib/ - Utility functions
└── [other directories and files]
```

## 3. Documentation

Copy these documentation files:

- `EXPORT_INSTRUCTIONS.md` - This file
- `src/prd.md` - Product Requirements Document

## 4. Setup Instructions

Once you've copied all files to your new repository:

1. Install dependencies: `npm install`
2. Start the development server: `npm run dev`
3. Build for production: `npm run build`

## 5. Git Repository Setup

```bash
# Initialize a new repository (if needed)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit of Marketing Campaign Calculator"

# Add your remote repository
git remote add origin https://github.com/yourusername/your-repo-name.git

# Push to GitHub
git push -u origin main
```

## 6. Customization

- Edit `src/index.css` to customize colors and theme
- Modify components in `src/components/` to adjust functionality
- Update data models in hooks and services for business logic changes

This manual export process will ensure you have all the necessary files to run the application in your own repository.