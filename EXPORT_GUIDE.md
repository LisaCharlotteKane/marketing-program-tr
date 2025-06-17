# Marketing Campaign Calculator - Export Guide

This document provides instructions for exporting the Marketing Campaign Calculator app to your own GitHub repository.

## Project Structure

The application consists of the following key components:

- React frontend built with Vite
- Tailwind CSS for styling
- shadcn/ui components
- Recharts for data visualization
- Local storage and GitHub API integration for data persistence

## Files to Copy

### Core Files

- `index.html` - Main HTML entry point
- `src/` - Source directory containing all application code
- `public/` - Public assets
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `package.json` and `package-lock.json` - Dependencies

### Configuration Files

- `components.json` - shadcn/ui component configuration
- `vite.config.ts` - Vite build configuration

## Step-by-Step Export Guide

1. **Create a new repository on GitHub**

   Go to GitHub and create a new repository to host your application.

2. **Clone the new repository**

   ```bash
   git clone https://github.com/yourusername/your-repo-name.git
   cd your-repo-name
   ```

3. **Copy the application files**

   You have several options to copy the files:

   a) **Manual Download**: Download each file individually from the current repository.
   
   b) **Archive Download**: If you have access to download a ZIP of the entire application, extract it and copy the files to your new repository.
   
   c) **Clone the Template**: If the Spark template is publicly accessible:
   ```bash
   git clone https://github.com/github/spark-template.git temp-dir
   cp -r temp-dir/* your-repo-name/
   cp -r temp-dir/.* your-repo-name/
   rm -rf temp-dir
   ```

4. **Install dependencies**

   Navigate to your new repository directory and install the dependencies:

   ```bash
   npm install
   ```

5. **Test the application locally**

   ```bash
   npm run dev
   ```

6. **Commit and push to your repository**

   ```bash
   git add .
   git commit -m "Initial commit of Marketing Campaign Calculator"
   git push origin main
   ```

## Key Components

### Main Application Structure

- `App.tsx`: Main application component with tabs for Planning, Execution, Budget Management, and Reporting
- `components/campaign-table.tsx`: Campaign planning table component
- `components/execution-tracking.tsx`: Execution tracking interface
- `components/reporting-dashboard.tsx`: Data visualization and reporting
- `hooks/useEnhancedCampaigns.ts`: Custom hook for campaign data management
- `hooks/useRegionalBudgets.ts`: Custom hook for budget management
- `services/auto-github-sync.ts`: GitHub integration for data persistence

### Data Models

- `Campaign`: Core data model for campaign information
- `RegionalBudget`: Data model for regional budget tracking

## GitHub Persistence

To use GitHub persistence:

1. Create a Personal Access Token with repository access
2. Configure the token in the application settings
3. Use the GitHub Sync tab to manage data persistence

## Customization

You can customize the application by:

1. Modifying the color scheme in `index.css`
2. Adding or removing campaign fields in `components/campaign-table.tsx`
3. Extending the reporting dashboard in `components/reporting-dashboard.tsx`
4. Adjusting budget management logic in `hooks/useRegionalBudgets.ts`

## Support

If you need assistance with the application:

1. Refer to the PRD (`src/prd.md`) for design decisions and functionality
2. Check component documentation for shadcn/ui and Recharts
3. Review React hooks documentation for state management patterns

---

This export guide provides the essential information needed to migrate the Marketing Campaign Calculator to your own repository and continue development or deployment.