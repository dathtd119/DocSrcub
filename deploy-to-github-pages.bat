@echo off
echo === DocScrub GitHub Pages Deployment Helper ===
echo This script will:
echo 1. Ensure you're on the plan_b branch
echo 2. Commit your changes
echo 3. Push to the plan_b branch
echo 4. Merge changes to main (which will trigger GitHub Pages deployment)
echo 5. Return to plan_b branch for further development

REM Check current branch
git branch --show-current > temp_branch.txt
set /p CURRENT_BRANCH=<temp_branch.txt
del temp_branch.txt

REM If not on plan_b, switch to it
if not "%CURRENT_BRANCH%"=="plan_b" (
    echo You are currently on branch %CURRENT_BRANCH%
    echo Switching to plan_b branch...
    git checkout plan_b || (
        echo Failed to switch to plan_b branch.
        exit /b 1
    )
)

REM Prompt for commit message
set /p COMMIT_MESSAGE=Enter commit message: 

REM Add changes and commit
git add .
git commit -m "%COMMIT_MESSAGE%" || (
    echo No changes to commit or commit failed.
    exit /b 1
)

REM Push to plan_b
git push origin plan_b || (
    echo Failed to push to plan_b branch.
    exit /b 1
)

REM Switch to main
git checkout main || (
    echo Failed to switch to main branch.
    exit /b 1
)

REM Merge changes from plan_b
git merge plan_b || (
    echo Merge conflict detected. Please resolve conflicts manually.
    exit /b 1
)

REM Push main to trigger GitHub Pages deployment
git push origin main || (
    echo Failed to push to main branch.
    exit /b 1
)

REM Return to plan_b branch
git checkout plan_b || (
    echo Failed to return to plan_b branch.
    exit /b 1
)

echo === Deployment process completed successfully! ===
echo Your changes have been pushed to both plan_b and main branches.
echo GitHub Actions will now build and deploy your site to GitHub Pages.
echo You're now back on the plan_b branch for continued development.
