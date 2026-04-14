# Frontend-Only Static Architecture Migration

## Overview

This project has been migrated from a backend+frontend architecture to a static frontend-only architecture.

The app now loads data directly in the browser from a public Google Sheets URL.

## What Changed

### Removed

- Backend Express server dependency for data loading
- Backend routes for external data sources
- Backend-only configuration for request forwarding
- OneDrive/SharePoint URL support
- Non-Google Sheets data source support in documentation

### Updated

- `src/util/sheet.js` now loads Google Sheets via public XLSX export flow
- `src/util/factory.js` uses a public-only Google Sheets flow
- Authentication popup flow for private Google Sheets is removed

## Current Data Access Model

- Google Sheets: public sheet URL only (Anyone with the link + Viewer)

Private or authenticated sources are not supported in this mode.

## Development

```bash
npm install
npm run dev
npm run build:prod
```

## Deployment

This app is fully static and can be deployed to:

- Netlify
- GitHub Pages
- AWS S3/CloudFront
- Any static file host
- Docker + nginx

## Testing

```bash
npm run test
npm run test:coverage
npm run test:e2e-headless
```

E2E tests should use public Google Sheets data sources.

## Troubleshooting

### Google Sheet does not load

- Ensure the sheet is shared as Anyone with the link + Viewer
- Verify the URL format: `https://docs.google.com/spreadsheets/d/<ID>/...`

### Build fails

```bash
rm -rf node_modules package-lock.json
npm install
npm run build:prod
```

## References

- [README.md](README.md)

---

Migration status: complete
