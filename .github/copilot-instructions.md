# Marketing Campaign Planner - GitHub Copilot Instructions

**Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

## Project Overview

Marketing Campaign Planner is a React 19 + TypeScript web application for planning, tracking, and reporting marketing campaigns across APAC regions. Built with Vite, Tailwind CSS, ShadCN UI components, and optimized localStorage with automatic cleanup to prevent HTTP 431 errors.

## Working Effectively

### Essential Setup Commands
Run these commands in order for a fresh repository clone:

```bash
npm ci                    # Install dependencies - takes 25 seconds
npm run dev              # Start development server on port 5000
```

### Build and Deployment
```bash
# Production build (NEVER CANCEL - set 60+ minute timeout)
npx vite build --mode production  # Takes 6 seconds - NEVER CANCEL, may take longer on slower systems

# Alternative build using script
chmod +x build.sh
./build.sh               # Takes 6 seconds - includes GitHub Pages setup

# Preview built application
npm run preview          # Serves on port 4173
```

**CRITICAL TIMING**: Build times are typically under 10 seconds but **NEVER CANCEL ANY BUILD COMMAND**. Always set timeouts of 60+ minutes for safety.

### Development Server
```bash
npm run dev              # Port 5000, hot reload enabled
```
**Validation**: Server starts successfully with warning about duplicate `skipLibCheck` in tsconfig.json (this is normal and safe to ignore).

## Application Structure

### Core Application Files
- `src/App.tsx` - Main working application component (functional and stable)
- `src/main.tsx` - Application entry point with error boundary
- `src/index.css` - Main styles and theme variables
- `package.json` - Dependencies and scripts

### Key Directories
- `src/components/` - 62 React components including UI, forms, dashboards
- `src/hooks/` - 14 custom hooks for state management and storage
- `src/services/` - 6 service modules for data handling and storage
- `src/types/` - 4 TypeScript type definitions
- `src/lib/` - Utility functions and shared logic
- `dist/` - Build output directory (created by build process)

### Critical Files for Changes
- `src/types/campaign.ts` - Core data type definitions
- `src/hooks/useEnhancedCampaigns.ts` - Campaign state management
- `src/lib/storage-cleanup.ts` - HTTP 431 error prevention
- `src/components/campaign-table.tsx` - Main campaign interface

## Known Issues and Workarounds

### TypeScript Compilation Issues
- **Issue**: `npm run build` (which includes TypeScript check) fails with 282 TypeScript errors
- **Workaround**: Use `npx vite build --mode production` which successfully builds the application
- **Status**: The main `App.tsx` and core functionality work perfectly; errors are in unused/experimental files

### Linting Issues  
- **Issue**: `npm run lint` fails due to missing ESLint v9 configuration
- **Workaround**: No current ESLint setup is functional
- **Status**: Code quality should be maintained manually

### Safe Build Commands
✅ **WORKING**: `npx vite build --mode production`  
✅ **WORKING**: `./build.sh`  
✅ **WORKING**: `npm run dev`  
✅ **WORKING**: `npm run preview`  
❌ **FAILING**: `npm run build` (includes TypeScript check)  
❌ **FAILING**: `npm run lint` (missing ESLint config)

## Manual Validation Requirements

After making any changes, **ALWAYS** perform these validation steps:

### 1. Build Validation
```bash
npx vite build --mode production  # Must complete successfully
```

### 2. Development Server Testing
```bash
npm run dev                       # Start server
# Navigate to http://localhost:5000
```

### 3. Core Functionality Testing
**CRITICAL**: Test these user scenarios manually:

1. **Campaign Planning Tab**:
   - Verify campaign list displays with sample data
   - Check campaign table shows: Name, Type, Region, Owner, Cost, Leads, Pipeline
   - Confirm sample campaign "Q1 Developer Event" appears correctly

2. **Budget Management Tab**:
   - Verify budget overview shows regional allocations
   - Check budget tracking for: Tomoko Tanaka (JP & Korea), Beverly Leung (South APAC), etc.
   - Confirm budget remaining calculations are accurate

3. **Overview Tab**:
   - Verify metrics cards display: Total Campaigns, Forecasted Spend, Pipeline Forecast, ROI Multiple
   - Check auto-calculated metrics explanation is visible
   - Confirm storage status monitor shows current usage

4. **Navigation**:
   - Verify all 4 tabs (Planning, Execution, Budget, Overview) switch correctly
   - Confirm no console errors during navigation

### 4. Storage Management Testing
- Verify storage cleanup functions work (prevent HTTP 431 errors)
- Check storage monitoring displays correctly in Overview tab

## Common Development Tasks

### Adding New Campaigns
- Modify sample data in `src/App.tsx` (line 17-38)
- Follow existing Campaign interface from `src/types/campaign.ts`

### Modifying Budget Allocations
- Update budget data in `SimpleBudgetOverview` component in `src/App.tsx` (line 94-100)

### Styling Changes
- Primary styles: `src/index.css`
- Tailwind configuration: `tailwind.config.js`
- Component-specific styles: inline Tailwind classes

### Adding UI Components
- Use existing ShadCN components from `src/components/ui/`
- Follow patterns in `src/components/` for custom components

## Testing

### Current Test Setup
- **Limited testing**: Only `src/utils/csv-helper.test.ts` exists
- **No test runner**: Jest/Vitest not configured
- **Validation method**: Manual testing required

### Manual Testing Script
```bash
# Test development server startup
npm run dev &
sleep 5
curl -f http://localhost:5000 > /dev/null && echo "✓ Dev server working" || echo "✗ Dev server failed"
pkill -f "vite.*dev"
```

## Deployment

### GitHub Pages (Currently Disabled)
- Workflow file: `.github/workflows/deploy.yml` (disabled)
- Build output: `dist/` directory
- SPA routing: `404.html` created automatically by build script

### Manual Deployment Process
1. Run `./build.sh` or `npx vite build --mode production`
2. Deploy `dist/` directory contents to web server
3. Ensure `404.html` is present for SPA routing

## Repository Navigation Quick Reference

### Important Configuration Files
```
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript config (has duplicate key warning)
├── tailwind.config.js    # Tailwind CSS configuration  
├── vite.config.ts        # Vite build configuration
├── build.sh              # Production build script
└── components.json       # ShadCN UI configuration
```

### Source Code Structure
```
src/
├── App.tsx               # Main application component (WORKING)
├── main.tsx              # Entry point
├── index.css             # Global styles
├── components/           # 62 UI components
│   ├── ui/              # ShadCN base components
│   ├── campaign-table.tsx
│   ├── budget-management.tsx
│   └── storage-cleanup.tsx
├── hooks/                # 14 custom hooks
│   ├── useEnhancedCampaigns.ts
│   └── useStorageMonitor.ts  
├── types/                # TypeScript definitions
│   └── campaign.ts       # Core Campaign interface
├── lib/                  # Utilities
│   └── storage-cleanup.ts
└── services/             # Data services
    └── persistent-storage.ts
```

## Error Prevention

### HTTP 431 Prevention
- **Built-in**: Automatic storage cleanup prevents header size issues
- **Manual**: Storage management UI in Overview tab
- **Emergency**: `src/emergency-cleanup.js` script available

### Common Pitfalls
1. **Don't use** `npm run build` - use `npx vite build --mode production` instead
2. **Don't expect** ESLint to work - maintain code quality manually  
3. **Always test** in browser after changes - no automated testing available
4. **Never cancel** build commands even if they seem slow

## Performance Notes

- **Dependencies**: 592 packages, installs in ~25 seconds
- **Development**: Hot reload works, rebuilds in <1 second
- **Production build**: Typically 5-10 seconds with chunked output
- **Bundle size**: ~470KB total (compressed: ~120KB)

Remember: **ALWAYS** validate changes manually in the browser and **NEVER CANCEL** any build operations.