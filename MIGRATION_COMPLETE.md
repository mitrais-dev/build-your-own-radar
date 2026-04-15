# Static Frontend Migration - Completion Summary

## Status

Complete.

## Final Architecture

- Static frontend only
- No backend request forwarding path
- Public URL data loading in browser

## Implemented Changes

1. Google Sheets flow moved to public-only loading in `src/util/sheet.js`.
2. Factory flow uses `GoogleSheet` public path and no auth popup path.
3. Private Google Sheet support removed.
4. Documentation updated for Google Sheets URL only usage.

## What Users Need

- Public Google Sheet URL

Private/authenticated sources are out of scope for the current app mode.

## Validation

- Unit tests for `sheet.js` updated and passing
- Frontend flow aligned with no-auth public inputs

## Run Commands

```bash
npm install
npm run dev
npm run build:prod
npm run test
```

## Deployment

Deploy `dist/` to any static host.

---

Migration completed: February 2026
