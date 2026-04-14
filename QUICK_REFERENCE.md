# Quick Reference - Static Frontend Radar

## Quick Commands

```bash
npm install
npm run dev
npm run build:prod
npm run test
npm run test:coverage
```

## Required Input Type

- Public Google Sheets URL

Private/authenticated URLs are not supported.

## Minimal .env

```env
ALLOW_PUBLIC_URLS=true
RADAR_DATA_URL=https://docs.google.com/spreadsheets/d/YOUR_ID_HERE
```

## Example URLs

```text
http://localhost:8080/?documentId=YOUR_GOOGLESHEETS_URL
```

## Key Files

```text
src/util/sheet.js
src/util/factory.js
```

## Common Issues

| Issue | Solution |
| --- | --- |
| Google Sheet gagal load | Set sharing jadi Anyone with the link + Viewer |
| Build gagal | Hapus `node_modules`, lalu `npm install` ulang |

## Deploy

```bash
npm run build:prod
```

Upload `dist/` ke static hosting.

## Docs

- [README.md](README.md)
- [STATIC_FE_MIGRATION.md](STATIC_FE_MIGRATION.md)
- [MIGRATION_COMPLETE.md](MIGRATION_COMPLETE.md)
