# Setting Up GitHub Pages for DocScrub

This guide explains how to set up and deploy DocScrub to GitHub Pages using GitHub Actions.

## Prerequisites

- Your code is in a GitHub repository
- You have owner or admin access to the repository

## Step 1: Configure Repository Settings

1. Go to your GitHub repository page
2. Click on "Settings" tab
3. Scroll down to the "GitHub Pages" section
4. Under "Source", select "GitHub Actions"

## Step 2: Update Your Local Files

The following files have been added or modified in your repository:

1. `.github/workflows/deploy.yml` - GitHub Actions workflow file for automated deployment
2. `astro.config.mjs` - Updated with GitHub Pages configuration
3. `public/.nojekyll` - Added to prevent GitHub Pages from using Jekyll processing
4. `deploy-to-github-pages.bat` - Helper script for development workflow

## Step 3: Update `astro.config.mjs`

The configuration in `astro.config.mjs` has been updated to work with GitHub Pages:

```javascript
export default defineConfig({
  // ...
  site: 'https://YOUR_USERNAME.github.io',
  base: '/DocSrcub',
  // ...
});
```

Before pushing your changes, replace `YOUR_USERNAME` with your actual GitHub username.

## Step 4: Push Your Changes

Use the included `deploy-to-github-pages.bat` script to:
1. Commit your changes
2. Push to the `plan_b` branch
3. Merge changes to the `main` branch (which triggers deployment)
4. Return to the `plan_b` branch for continued development

Alternatively, use standard Git commands:

```bash
# Ensure you're on the plan_b branch
git checkout plan_b

# Add and commit your changes
git add .
git commit -m "Add GitHub Pages configuration"

# Push to the plan_b branch
git push origin plan_b

# Switch to main and merge changes
git checkout main
git merge plan_b
git push origin main

# Return to plan_b for development
git checkout plan_b
```

## Step 5: Monitor Deployment

1. Go to your GitHub repository page
2. Click on the "Actions" tab
3. You should see the "Deploy to GitHub Pages" workflow running
4. Wait for it to complete (should take a few minutes)

## Step 6: Access Your Site

Once deployment is complete, your site will be available at:

```
https://YOUR_USERNAME.github.io/DocScrub
```

Replace `YOUR_USERNAME` with your actual GitHub username.

## Troubleshooting

### 404 Errors or Missing Resources

If your site shows 404 errors or missing resources:

1. Check that the `base` in `astro.config.mjs` matches your repository name exactly
2. Ensure all links in your code are relative and respect the base path
3. Verify that the `.nojekyll` file exists in your repository

### Workflow Failures

If the GitHub Actions workflow fails:

1. Check the error logs in the Actions tab
2. Ensure your repository has GitHub Pages enabled in settings
3. Verify the workflow file `.github/workflows/deploy.yml` is correctly formatted

### Resource Links Not Working

If images, CSS, or other resources aren't loading properly:

1. Make sure all resource paths are prefixed with `import.meta.env.BASE_URL` in your code
2. Or use relative paths that account for the base path

## Automated Deployments

With this setup, any push to the `main` branch will automatically trigger a new deployment to GitHub Pages. The workflow:

1. Checks out your repository code
2. Sets up Node.js and installs dependencies
3. Builds your Astro project
4. Deploys the built files to GitHub Pages

## Development Workflow

To maintain the project workflow:

1. Always develop on the `plan_b` branch
2. When ready to deploy, use the `deploy-to-github-pages.bat` script
3. Or manually merge to `main` when you want to deploy
4. Return to `plan_b` for continued development
