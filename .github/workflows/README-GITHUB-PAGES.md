# GitHub Pages automatic deployment

## Files to copy

Copy `.github/workflows/deploy-pages.yml` and `.gitignore` into the root of the wedding website repository.

The repository root must contain:

- `index.html`
- `style.css`
- `main.js`
- `config.js`
- `assets/`

## GitHub configuration

1. Open the repository on GitHub.
2. Go to **Settings > Pages**.
3. Under **Build and deployment > Source**, choose **GitHub Actions**.
4. Commit and push to branch `main`.
5. Open the **Actions** tab and select **Deploy wedding website to GitHub Pages**.

The workflow validates required files, creates `.nojekyll`, uploads the static site, and deploys it to GitHub Pages.

## Push commands

```bash
git add .
git commit -m "Add automatic GitHub Pages deployment"
git push origin main
```

## Manual deployment

Open **Actions > Deploy wedding website to GitHub Pages > Run workflow**.

## Important paths

Keep asset paths relative:

```html
assets/images/hero.webp
style.css
main.js
config.js
```

Do not prefix project-site assets with `/` because `/assets/...` points to the GitHub account root instead of the repository path.

## Google Sheets backend

GitHub Pages only hosts the frontend. Keep the Google Apps Script `/exec` URL in `config.js`. Do not store passwords, OTPs, service-account keys, or private credentials in the repository.
