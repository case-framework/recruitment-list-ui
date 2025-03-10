#!/bin/bash

# Script to sync changes from upstream repository while preserving local customizations
# For my-org/recruitment-list-ui forked from case-framework/recruitment-list-ui

# Exit on error
set -e

echo "Starting sync process with upstream repository..."

# Make sure we're on the main branch
git checkout main
echo "✓ Checked out main branch"

# Add the upstream remote if it doesn't exist
if ! git remote | grep -q "upstream"; then
  # Using HTTPS URL for the public upstream repository
  git remote add upstream https://github.com/case-framework/recruitment-list-ui.git
  echo "✓ Added upstream remote (public repository)"
else
  echo "✓ Upstream remote already exists"
fi

# Verify origin remote is using appropriate authentication method for private repo
ORIGIN_URL=$(git remote get-url origin)
if [[ "$ORIGIN_URL" != ssh* ]] && [[ "$ORIGIN_URL" != https://.*@github.com* ]]; then
  echo "⚠️ Warning: Your origin remote may not be configured with authentication."
  echo "    For a private repository, consider using SSH or HTTPS with token:"
  echo "    - SSH:   git remote set-url origin git@github.com:my-org/recruitment-list-ui.git"
  echo "    - HTTPS: git remote set-url origin https://username:token@github.com/my-org/recruitment-list-ui.git"
fi

# Fetch the latest changes from upstream
git fetch upstream
echo "✓ Fetched latest changes from upstream"

# Make sure upstream branch exists locally
if ! git show-ref --verify --quiet refs/heads/upstream; then
  # Create upstream branch tracking the upstream repo's main branch
  git checkout -b upstream upstream/main
  echo "✓ Created local upstream branch"
else
  # Update the upstream branch with the latest changes
  git checkout upstream
  git pull upstream main
  echo "✓ Updated local upstream branch"
fi

# Return to main branch
git checkout main
echo "✓ Switched back to main branch"

# Merge changes from upstream branch
echo "Merging changes from upstream..."
git merge upstream --no-commit

# Check for conflicts
if [ $? -ne 0 ]; then
  echo "⚠️ Merge conflicts detected."
  echo "Please resolve conflicts manually, then commit the changes."
  echo "Files with customizations (like favicon, app name) may need special attention."
  exit 1
fi

echo "Ready to commit merged changes."
echo "Review the changes before committing:"
echo "  git diff --staged"
echo ""
echo "To commit the changes:"
echo "  git commit -m 'Merge upstream changes'"
echo "  git push origin main"
