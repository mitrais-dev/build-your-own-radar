# 🚀 Quick Reference - Static Frontend Radar

## Architecture: Static Frontend Only ✅

No backend server needed. All CORS requests use free public proxy.

---

## 📦 Quick Commands

```bash
# Setup
npm install

# Development
npm run dev                    # Start on http://localhost:8080

# Production
npm run build:prod            # Generate dist/ folder
npm run test                  # Run tests
npm run test:coverage        # Coverage report
npm run lint-prettier:fix    # Format code
```

---

## ⚙️ Configuration (.env)

```env
# CORS Proxy Selection
CORS_PROXY=allorigins  # Use: allorigins | corsanywhere | corsninja

# Radar Data
ALLOW_PUBLIC_URLS=true
RADAR_DATA_URL=https://docs.google.com/spreadsheets/d/YOUR_ID_HERE
```

---

## 🔗 Test URLs

```
Google Sheets:
http://localhost:8080/?documentId=YOUR_GOOGLESHEETS_URL

OneDrive:
http://localhost:8080/?documentId=YOUR_ONEDRIVE_URL
```

---

## 📁 Key Files

```
src/util/
├── corsProxy.js          ← CORS proxy handler
├── googleSheetsUtil.js   ← Google Sheets integration
├── oneDriveUtil.js       ← OneDrive/SharePoint integration
└── factory.js            ← Main app logic
```

---

## 🌐 CORS Proxy Options

| Proxy             | URL                                    | Speed  | Reliability |
| ----------------- | -------------------------------------- | ------ | ----------- |
| **allorigins** ⭐ | `https://api.allorigins.win/raw?url=`  | Fast   | High        |
| corsanywhere      | `https://cors-anywhere.herokuapp.com/` | Medium | Medium      |
| corsninja         | `https://corsninja.vercel.app/?url=`   | Medium | Medium      |

---

## 🚨 CORS Proxy Down?

Switch quickly:

```bash
CORS_PROXY=corsanywhere npm run dev
```

---

## 📤 Deploy (Choose One)

### Option 1: Netlify (Recommended)

```bash
npm run build:prod
# Connect to Netlify → auto-deploy on push
```

### Option 2: GitHub Pages

```bash
npm run build:prod
# Push dist/ to gh-pages branch
```

### Option 3: AWS S3

```bash
npm run build:prod
aws s3 sync dist/ s3://your-bucket/
```

### Option 4: Any Static Host

```bash
npm run build:prod
# Upload dist/ folder to hosting
```

---

## 🧪 Verify It Works

1. **Local Development**

   ```bash
   npm run dev
   # Open http://localhost:8080
   # Try loading a Google Sheet
   ```

2. **Network Tab Check**

   - F12 → Network tab
   - Look for requests to `api.allorigins.win`
   - Verify file downloads successfully

3. **Build Check**
   ```bash
   npm run build:prod
   # Check dist/ folder has index.html
   ```

---

## 🔍 Debugging

### Check CORS Proxy

```bash
# Test if proxy works
curl https://api.allorigins.win/raw?url=https://api.github.com
```

### Check Logs

- Open browser console (F12)
- Look for `[GoogleSheets]` or `[OneDrive]` messages
- Check `[CORSProxy]` messages

### Try Different Proxy

```bash
CORS_PROXY=corsanywhere npm run dev
```

---

## 📊 What Changed?

| Before             | After               |
| ------------------ | ------------------- |
| Frontend + Backend | Frontend Only       |
| Backend routes     | CORS proxy          |
| `npm run backend`  | (removed)           |
| Backend URL config | CORS proxy config   |
| Node.js required   | Optional (dev only) |

---

## ✅ Checklist

- ✅ No `src/backend/` calls in frontend
- ✅ CORS proxy configured
- ✅ Google Sheets loads
- ✅ OneDrive loads
- ✅ `npm run build:prod` succeeds
- ✅ `dist/` folder created

---

## 🎯 Common Issues

| Issue           | Solution                             |
| --------------- | ------------------------------------ |
| CORS error      | Switch CORS_PROXY in .env            |
| File won't load | Check URL is public                  |
| Slow loading    | Try different CORS proxy             |
| Build fails     | `rm -rf node_modules && npm install` |

---

## 📚 Full Documentation

- [STATIC_FE_MIGRATION.md](STATIC_FE_MIGRATION.md) - Detailed guide
- [MIGRATION_COMPLETE.md](MIGRATION_COMPLETE.md) - Completion summary
- [README.md](README.md) - Project info

---

## 🚀 Ready to Deploy?

1. ✅ Code complete
2. ✅ Tests passing
3. ✅ Build working
4. Then: `npm run build:prod` → Deploy `dist/`

That's it! No backend needed. 🎉

---

**Last Updated**: February 2026  
**Architecture**: Static Frontend  
**Status**: Production Ready ✅
