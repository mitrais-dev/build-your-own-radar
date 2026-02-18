# Frontend-Only Static Architecture Migration

## Overview

This project has been migrated from a backend+frontend architecture to a **static frontend-only** architecture. All backend proxy routes have been replaced with direct frontend calls using a free public CORS proxy.

## What Changed

### Removed

- ❌ Backend Express server (`src/backend/`) - No longer needed
- ❌ `PORT` and `NODE_ENV` environment variables
- ❌ `BACKEND_URL` configuration
- ❌ Backend npm script (`npm run backend`)
- ❌ Backend routes:
  - `GET /api/proxy` (OneDrive/SharePoint proxy)
  - `GET /api/google-sheets-file` (Google Sheets proxy)

### Added

- ✅ `src/util/corsProxy.js` - New utility for CORS proxy handling
- ✅ `CORS_PROXY` environment variable for proxy selection
- ✅ All fetch operations now run on the frontend

### Updated

- 📝 `src/util/googleSheetsUtil.js` - Now uses CORS proxy directly
- 📝 `src/util/oneDriveUtil.js` - Now uses CORS proxy directly
- 📝 `.env` - Backend config removed, CORS proxy config added
- 📝 `.env.example` - Backend config removed, CORS proxy config added
- 📝 `package.json` - Backend script removed

## How It Works

### Before (Backend-Heavy)

```
Frontend → Backend Proxy (/api/proxy) → External URL (OneDrive/Google Sheets)
```

### After (Static Frontend)

```
Frontend → Free CORS Proxy → External URL (OneDrive/Google Sheets)
```

## CORS Proxy Options

The project now uses free public CORS proxies, selected via `CORS_PROXY` environment variable:

### 1. **allorigins** (RECOMMENDED) ⭐

- **URL Pattern**: `https://api.allorigins.win/raw?url=<TARGET_URL>`
- **Pros**: Reliable, fast, no authentication needed
- **Rate Limit**: Generous
- **Status**: Actively maintained

### 2. corsanywhere

- **URL Pattern**: `https://cors-anywhere.herokuapp.com/<TARGET_URL>`
- **Pros**: Popular, well-known
- **Rate Limit**: May have limits
- **Status**: Community maintained

### 3. corsninja

- **URL Pattern**: `https://corsninja.vercel.app/?url=<TARGET_URL>`
- **Pros**: Alternative option
- **Rate Limit**: Unknown
- **Status**: Community maintained

## Configuration

### Set CORS Proxy in .env

```env
# Options: 'allorigins', 'corsanywhere', 'corsninja'
CORS_PROXY=allorigins
```

## Development

### Running Locally

```bash
# Install dependencies
npm install

# Start development server (frontend only)
npm run dev

# Build for production
npm run build:prod
```

### No Backend Required

- Development: `npm run dev` (webpack-dev-server)
- Production: `npm run build:prod` (static files)

## Benefits

✅ **Simpler Deployment**: No Node.js backend needed  
✅ **Easier Hosting**: Can be deployed on static file hosts (AWS S3, GitHub Pages, Netlify, etc.)  
✅ **Lower Costs**: No backend server infrastructure  
✅ **Faster Development**: Fewer moving parts  
✅ **Better Scalability**: No backend bottleneck

## Limitations

⚠️ **Rate Limiting**: Free CORS proxies may have rate limits  
⚠️ **Reliability**: Dependent on third-party CORS proxy availability  
⚠️ **Privacy**: All URLs pass through public CORS proxy (don't use for sensitive data)

## Fallback Strategy

If the primary CORS proxy fails, you can:

1. Switch to an alternative proxy in `.env`:
   ```env
   CORS_PROXY=corsanywhere
   ```
2. Or modify `src/util/corsProxy.js` to add more proxy options

## File Structure Changes

```
src/
├── util/
│   ├── corsProxy.js          ✨ NEW: CORS proxy utility
│   ├── googleSheetsUtil.js   📝 UPDATED: Uses corsProxy
│   ├── oneDriveUtil.js       📝 UPDATED: Uses corsProxy
│   └── ...
├── backend/                   ❌ DEPRECATED: Can be removed
│   └── ...
└── ...
```

## Migration Checklist

- ✅ Remove backend server dependency
- ✅ Update googleSheetsUtil to use CORS proxy
- ✅ Update oneDriveUtil to use CORS proxy
- ✅ Create corsProxy utility
- ✅ Update .env configuration
- ✅ Remove backend npm script
- ✅ Update environment variables

## Testing

```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e-headless
```

## Production Deployment

This is now a **fully static frontend** application:

### Option 1: AWS S3 + CloudFront

```bash
npm run build:prod
# Upload dist/ folder to S3
```

### Option 2: GitHub Pages

```bash
npm run build:prod
# Deploy dist/ folder to GitHub Pages
```

### Option 3: Netlify

```bash
npm run build:prod
# Deploy dist/ folder to Netlify
```

### Option 4: Docker (Static Server)

```dockerfile
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Troubleshooting

### CORS Errors

1. Check network tab in browser DevTools
2. Verify URL formatting
3. Try switching CORS proxy: `CORS_PROXY=corsanywhere`

### File Download Failures

1. Verify the source URL is correct and public
2. Check if the file is accessible directly
3. Try with a different CORS proxy

### Build Errors

```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build:prod
```

## Future Considerations

If you need higher reliability:

- Deploy a custom CORS proxy (simple Node.js service)
- Use a paid CORS proxy service
- Implement backend again (defeats the purpose of this migration)

## Questions?

Refer to:

- [ONEDRIVE_INTEGRATION.md](ONEDRIVE_INTEGRATION.md) - OneDrive/SharePoint integration guide
- [README.md](README.md) - General project documentation
- [src/util/corsProxy.js](src/util/corsProxy.js) - CORS proxy implementation

---

**Migration Date**: February 2026  
**Architect**: Frontend-only conversion  
**Status**: ✅ Complete - Ready for static deployment
