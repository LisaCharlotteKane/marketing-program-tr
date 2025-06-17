# Marketing Campaign Calculator - Export Instructions

This document provides detailed instructions for exporting the Marketing Campaign Calculator app to your own GitHub repository.

## Step 1: Create a New Repository

1. Go to GitHub and create a new repository
2. Clone the repository to your local machine
3. Navigate to the repository directory

## Step 2: Copy Application Files

### Essential Files

Copy the following files from this project to your new repository:

```
index.html
tsconfig.json
tailwind.config.js
package.json
package-lock.json
vite.config.ts
components.json
```

### Source Code Directory

Copy the entire `src` directory to your new repository. This contains:

- React components in `src/components/`
- Custom hooks in `src/hooks/`
- Services in `src/services/`
- Utility functions in `src/lib/` and `src/utils/`
- Assets in `src/assets/`
- Data models and configuration in `src/data/`

### Documentation

Create these documentation files in your new repository:

```
README.md - Basic project information
LICENSE - Project license (MIT recommended)
.gitignore - Git ignore configuration
```

## Step 3: Install Dependencies

Run the following commands in your repository:

```bash
npm install
```

## Step 4: Test Your Application

Start the development server:

```bash
npm run dev
```

## Step 5: Commit and Push

```bash
git add .
git commit -m "Initial commit of Marketing Campaign Calculator"
git push origin main
```

## File Structure Overview

Here's the complete file structure for reference:

```
marketing-campaign-calculator/
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
├── components.json
├── public/
└── src/
    ├── App.tsx
    ├── index.css
    ├── assets/
    │   └── github-logo.svg
    ├── components/
    │   ├── auto-save-indicator.tsx
    │   ├── budget-lock-info.tsx
    │   ├── budget-save-indicator.tsx
    │   ├── campaign-table.tsx
    │   ├── csv-uploader.tsx
    │   ├── data-loading-error.tsx
    │   ├── execution-tracking.tsx
    │   ├── export-code.tsx
    │   ├── github-sync.tsx
    │   ├── persistent-storage-info.tsx
    │   ├── reporting-dashboard.tsx
    │   ├── roi-dashboard.tsx
    │   ├── storage-error-handler.tsx
    │   └── ui/
    │       └── [shadcn components]
    ├── data/
    │   ├── campaigns.json
    │   └── countries.json
    ├── hooks/
    │   ├── use-mobile.ts
    │   ├── useAutoSave.ts
    │   ├── useAutoSaveStatus.ts
    │   ├── useEnhancedCampaigns.ts
    │   ├── useLocalCampaigns.ts
    │   └── useRegionalBudgets.ts
    ├── lib/
    │   ├── dashboard-utils.ts
    │   └── utils.ts
    ├── services/
    │   ├── auto-github-sync.ts
    │   ├── budget-service.ts
    │   ├── github-api.ts
    │   ├── migration-service.ts
    │   ├── persistent-storage.ts
    │   └── storage-recovery.ts
    └── utils/
        └── auto-save.ts
```

## Customization Options

### Theme Customization

Edit `src/index.css` to customize the color scheme and theme variables.

### Data Models

The key data models are:

1. **Campaign**: Defined in `src/components/campaign-table.tsx`
2. **RegionalBudget**: Defined in `src/hooks/useRegionalBudgets.ts`

### GitHub Integration

The GitHub integration is implemented in:
- `src/services/github-api.ts`
- `src/services/auto-github-sync.ts`
- `src/components/github-sync.tsx`

## Deployment Options

You can deploy this application to various platforms:

1. **GitHub Pages**: Build with `npm run build` and enable GitHub Pages
2. **Vercel**: Connect your GitHub repository to Vercel for automatic deployment
3. **Netlify**: Connect your GitHub repository to Netlify for automatic deployment

## Support

If you need assistance, the PRD file (`src/prd.md`) contains detailed information about the application's design and functionality.