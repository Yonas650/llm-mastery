# LLM Mastery

Local-first personal study app for mastering the LLM lifecycle. The app has no backend, no auth, and no database server. Study progress is stored in the browser with `localStorage`.

## Local Development

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

The default dev command binds to `0.0.0.0`, so another device on the same Wi-Fi can use the Mac's LAN URL while the server is running.

## Static GitHub Pages Deployment

This project is configured for static export with Next.js:

```bash
npm run build
```

The static site is emitted to:

```text
out/
```

The included workflow at `.github/workflows/deploy-pages.yml` builds and deploys the `out/` directory to GitHub Pages.

For GitHub Pages:

1. Create a GitHub repo.
2. Push this project to `main`.
3. In the repo settings, enable Pages with GitHub Actions as the source.
4. Run the deployment workflow or push to `main`.

The source code is static and client-side only. Do not commit private study notes or personal data unless you are comfortable with them being visible in the deployed site.

## Phone Usage

After GitHub Pages deploys, open the Pages URL on iPhone Safari and use **Add to Home Screen**. Progress is stored in iPhone Safari's `localStorage`, so it is separate from the Mac browser unless an export/import feature is added later.
