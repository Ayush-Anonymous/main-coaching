# 🎯 HOSTINGER BUSINESS WEB HOSTING - LIMITATIONS & BOUNDARIES

> **IMPORTANT**: This project is configured for Hostinger Business Web Hosting. Always follow these rules when making changes.

## 📊 KEY LIMITATIONS & BOUNDARIES

| Limit | Value |
|-------|-------|
| **Node.js Apps** | Up to 5 per account |
| **RAM** | 3 GB |
| **Storage** | 50 GB SSD |
| **Inodes** | 600,000 files/folders |
| **CPU** | Shared resources |

## ⚠️ RESTRICTIONS

1. **No Root Access** - Cannot install system-wide packages or modify server OS settings
2. **Environment Variables** - Must be set through hPanel; `.env` files may NOT work as expected
3. **No Custom Daemons** - Only web-facing apps (HTTP/HTTPS); background daemons or persistent workers NOT allowed
4. **Limited Module Support** - Only npm packages that don't require native system dependencies
5. **Process Management** - Platform manages app restarts; PM2 or custom process managers NOT supported
6. **Network Restrictions** - Outbound networking may be limited for security
7. **No SSH Root** - SSH available but NOT with root privileges

## ✅ DEPLOYMENT RULES (ALREADY IMPLEMENTED)

1. ✅ **Renamed `build` script** → Using `client:build` (Hostinger reacts to "build" keyword)
2. ✅ **Entry point**: `server.js` at root with `"main": "server.js"` in package.json
3. ✅ **Pre-built frontend** → `dist/` folder is committed
4. ✅ **No PORT fallback** → Hostinger auto-injects PORT
5. ✅ **MySQL with fallbacks** → Database config has hardcoded fallbacks for Hostinger ENV issues
6. ✅ **Health endpoint** → `/health` returns SERVER ALIVE status
7. ✅ **DB test endpoint** → `/api/db-test` for debugging database connections

## ✅ ALLOWED STACK
- **Frontend**: React + Vite + TailwindCSS + TypeScript
- **Backend**: Express.js
- **Database**: MySQL only (using mysql2 package)

## ❌ NEVER USE
- Firebase, Supabase, MongoDB, PostgreSQL
- PM2 or custom process managers
- Background daemons/workers
- Native modules needing OS dependencies

## 🔧 MYSQL CONFIGURATION (in server.js)
```javascript
const DB_CONFIG = {
  host: process.env.DB_HOST || 'YOUR_HOSTINGER_HOST',
  user: process.env.DB_USER || 'YOUR_USER',
  password: process.env.DB_PASSWORD || 'YOUR_PASS',
  database: process.env.DB_NAME || 'YOUR_DB',
  port: Number(process.env.DB_PORT) || 3306
};
```

## 📋 DEPLOYMENT CHECKLIST

- [x] `server.js` at root
- [x] `"main": "server.js"` in package.json
- [x] `"start": "node server.js"` script
- [x] No `build` script (using `client:build`)
- [x] `dist/` folder committed to Git
- [x] MySQL with hardcoded fallbacks
- [x] `/health` endpoint
- [x] `/api/db-test` endpoint
- [x] CORS configured
- [x] Error handling middleware
- [ ] **ENV set in hPanel** (do this before deployment)

## 🚀 DEPLOYMENT STEPS

1. **Build frontend locally**:
   ```bash
   npm run client:build
   ```

2. **Commit dist folder**:
   ```bash
   git add dist/
   git commit -m "Add production build"
   ```

3. **Push to GitHub**:
   ```bash
   git push origin main
   ```

4. **In Hostinger hPanel**:
   - Go to Website → Node.js
   - Connect your GitHub repository
   - Set environment variables:
     - `DB_HOST`
     - `DB_USER`
     - `DB_PASSWORD`
     - `DB_NAME`
     - `JWT_SECRET`
     - `NODE_ENV=production`
   - **DO NOT set PORT** (Hostinger injects it automatically)

5. **Deploy and verify**:
   - Visit `https://yourdomain.com/health` → Should return `SERVER ALIVE`
   - Visit `https://yourdomain.com/api/db-test` → Should return database status

## 💡 FOR ADVANCED NEEDS → UPGRADE TO VPS
- Custom builds, background jobs, heavy processing
- PM2 or custom process managers
- Native module dependencies
- More than 5 Node.js apps
