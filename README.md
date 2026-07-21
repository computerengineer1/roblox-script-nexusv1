# Roblox Script Nexus Ultimate 🚀

A production-ready, full-stack web application designed for organizing, previewing, merging, and publishing free Roblox game scripts. Built with Node.js 22.x, Express 4.21.x, MySQL 8.0, EJS templating, and Bootstrap 5.3.3.

---

## 🌟 Key Features

1. **Homepage Vault**: Dark neon game UI with glassmorphic cards, featured game maps carousel, and a debounced instant visual search bar with full-text MySQL search.
2. **Map Detail Page**: Hero section, map statistics, live script preview canvas simulator, cookie-based map watchlist, and script cards with one-click copy and loadout addition.
3. **5-Second AdSense Interstitial Copy**: Cookie-gated (`ad_shown`) 5-second countdown modal prior to clipboard copying for non-intrusive ad monetization.
4. **Script Playground**: Integrated CodeMirror 6 Lua editor with sandboxed execution simulation console.
5. **Smart Loadout Builder**: Concatenates multiple saved `localStorage` scripts into one master Lua file with formatted section header comments.
6. **Secure Admin Dashboard**: Authenticated control panel to add/edit/delete maps (with image file upload magic bytes validation), add/delete Lua scripts (with automatic malicious pattern security scanner), and view system analytics.

---

## 🔐 Security Features

- **Parameterized Queries**: All database calls use `mysql2/promise` prepared statements (`pool.execute`) preventing SQL injection.
- **Strict Content Security Policy (CSP)**: Configured using `helmet 7.1.0` allowing only necessary CDNs (Bootstrap, FontAwesome, Google Fonts, CodeMirror, Google AdSense).
- **Double-Submit Cookie CSRF Protection**: Implemented with `csrf-csrf` middleware across all state-changing endpoints.
- **Rate Limiting**: Global limiter (100 requests per 15 mins) and strict auth limiter (5 attempts per hour per IP) on admin login.
- **JWT Auth with Refresh Tokens**: Short-lived (15 min) access tokens and 7-day refresh tokens stored in `httpOnly` secure cookies.
- **Lua Code Sanitizer**: Rejects uploaded scripts containing hazardous commands (`os.execute`, `io.popen`, `dofile`, `loadfile`, `loadstring`, `setfenv`, etc.).
- **File Upload Security**: Image file type validation via `multer` and deep magic-bytes validation via `file-type`.

---

## 📁 Project Structure

```
roblox-script-nexus/
├── package.json
├── server.js
├── .env.example
├── .env
├── schema.sql
├── seed.js
├── README.md
├── src/
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── rateLimiter.js
│   │   ├── security.js
│   │   └── upload.js
│   └── utils/
│       └── sanitizeLua.js
├── views/
│   ├── partials/
│   │   ├── header.ejs
│   │   ├── footer.ejs
│   │   └── adsense.ejs
│   ├── index.ejs
│   ├── map.ejs
│   ├── playground.ejs
│   ├── loadout.ejs
│   └── admin/
│       ├── login.ejs
│       └── dashboard.ejs
└── public/
    ├── css/
    │   └── style.css
    ├── js/
    │   ├── main.js
    │   ├── search.js
    │   ├── loadout.js
    │   ├── playground.js
    │   └── copy-ad.js
    └── uploads/
        └── maps/
```

---

## 🛠️ Quick Start Guide

### 1. Prerequisites
- **Node.js**: v22.x LTS installed.
- **MySQL Server**: v8.0.x running locally or remotely.

### 2. Database Creation & Schema Setup
Execute `schema.sql` in your MySQL database instance:

```bash
mysql -u root -p < schema.sql
```

### 3. Environment Configuration
Copy `.env.example` to `.env` and configure your database credentials:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=your_mysql_password
DB_NAME=roblox_scripts
JWT_ACCESS_SECRET=your-secure-access-key
JWT_REFRESH_SECRET=your-secure-refresh-key
COOKIE_SECRET=your-secure-cookie-key
AD_CLIENT_ID=ca-pub-xxxxxxxxxxxxxxxx
AD_SLOT_ID=1234567890
NODE_ENV=development
```

### 4. Install Dependencies & Seed Database

```bash
npm install
npm run seed
```

> **Default Admin Account**:
> - **Username**: `admin`
> - **Password**: `admin123`

### 5. Start Server

```bash
# Production mode
npm start

# Development mode with nodemon
npm run dev
```

Visit the application at: `http://localhost:3000`

---

## 💰 AdSense Integration

Google AdSense ads are placed in 3 strategic spots using `views/partials/adsense.ejs`:
1. **Homepage**: Banner ad unit below featured maps carousel.
2. **Map Detail Page**: Sidebar rectangle ad unit alongside the script list.
3. **Loadout Builder Page & Copy Interstitial Modal**: Banner before merge button and inside the copy interstitial modal.

To deploy live ads, update `AD_CLIENT_ID` and `AD_SLOT_ID` in your `.env` file and set `NODE_ENV=production`.
