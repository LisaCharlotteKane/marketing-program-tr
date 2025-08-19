# GitHub Pages Deployment Disabled

This project has been configured to **NOT** deploy to GitHub Pages automatically.

## What Was Changed

1. **GitHub Actions Workflow**: The `.github/workflows/deploy.yml` workflow has been disabled by:
   - Adding `if: false` condition to prevent the job from running
   - Commenting out all triggers (push events and workflow_dispatch)
   - Adding clear comments indicating the deployment is disabled

2. **Vite Configuration**: Removed the GitHub Pages-specific base path configuration to use standard root path (`/`) instead of relative paths (`./`)

## Current State

- ✅ The application runs locally with `npm run dev`
- ✅ The application can be built with `npm run build`
- ❌ No automatic deployment to GitHub Pages occurs
- ❌ Manual deployment workflows are disabled

## If You Want to Re-enable Deployment

To re-enable GitHub Pages deployment:

1. Edit `.github/workflows/deploy.yml`:
   - Remove the `if: false` condition
   - Uncomment the `on:` triggers
   - Update the workflow name to remove "(DISABLED)"

2. Update `vite.config.ts`:
   - Change `base: '/'` back to `base: process.env.NODE_ENV === 'production' ? './' : '/'`

3. Ensure GitHub Pages is enabled in your repository settings under Pages > Source > GitHub Actions

## Alternative Deployment Options

If you need to deploy elsewhere:
- **Vercel**: Connect your GitHub repo to Vercel
- **Netlify**: Connect your GitHub repo to Netlify  
- **Manual**: Run `npm run build` and upload the `dist` folder to any static hosting service