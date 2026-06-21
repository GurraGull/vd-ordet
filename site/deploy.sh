#!/usr/bin/env bash
# Publish the latest build to GitHub Pages (manual — deployment is deliberate).
# Usage: bash site/deploy.sh
set -euo pipefail
cd "$(dirname "$0")"   # → site/

echo "Building static export (base path /vd-ordet)…"
rm -rf out .next
BASE_PATH=/vd-ordet npm run build

echo "Pushing out/ to the gh-pages branch…"
cd out
rm -rf .git
git init -q
git checkout -q -b gh-pages
git add -A
git -c user.name='Gustaf Wahlström' -c user.email='gustaf.wahlstrom@gmail.com' commit -q -m "deploy $(date +%F)"
git push -f -q https://github.com/GurraGull/vd-ordet.git gh-pages

echo "Deployed → https://gurragull.github.io/vd-ordet/"
