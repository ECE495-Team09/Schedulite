# Deploying the Schedulite backend

The backend is a Node.js (Express) app that needs **MongoDB** and a few env vars. These steps get it running on a public URL so the web and mobile (e.g. iPhone EAS) clients can use it.

---

## 1. MongoDB in the cloud (required)

The app uses MongoDB. Use **MongoDB Atlas** (free tier is enough).

### If you already have a cluster

1. In Atlas, open your cluster → **Connect** → **Drivers** and copy the connection string.
2. Replace `<password>` (or `USER`/`PASSWORD`) with your database user’s password. Optionally set the database name (e.g. `schedulite`). That string is your **MONGO_URI**.
3. Under **Network Access**, ensure your deploy host can connect: add **0.0.0.0/0** for Railway/Render (or your host’s outbound IPs if you restrict later).
4. Skip to [§ 2. Environment variables](#2-environment-variables) and then [§ 3. Deploy on Railway](#3-deploy-on-railway) or [§ 4. Deploy on Render](#4-deploy-on-render).

### If you’re creating a new cluster

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and create an account or log in.
2. Create a **free cluster** (e.g. M0).
3. Under **Database Access** → Add Database User: create a user and password (save them).
4. Under **Network Access** → Add IP Address: add **0.0.0.0/0** so the hosted backend can connect (or restrict later to your host’s IPs).
5. In **Database** → Connect → **Drivers**: copy the connection string. It looks like:
   ```text
   mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/DATABASE?retryWrites=true&w=majority
   ```
   Replace `USER`, `PASSWORD`, and optionally `DATABASE` (e.g. `schedulite`). This is your **MONGO_URI**.

---

## 2. Environment variables

Set these wherever you deploy (Railway, Render, etc.):

| Variable | Required | Description |
|----------|----------|-------------|
| **MONGO_URI** | Yes | MongoDB connection string from Atlas. |
| **JWT_SECRET** | Yes | Random secret for signing tokens (e.g. `openssl rand -hex 32`). |
| **GOOGLE_CLIENT_ID** | Yes | Google OAuth **Web** client ID (same as in your web/mobile apps). |
| **PORT** | No | Server port; host usually sets this (e.g. `5000` or `PORT`). |
| **CORS_ORIGINS** | For production | Comma-separated allowed origins, e.g. `https://yourapp.vercel.app,https://yourapp.com`. Omit to allow only localhost. |
| **CORS_ALLOW_ANY_ORIGIN** | No | Set to `true` only for local mobile demo; do **not** use in production. |
| **BODY_LIMIT** | No | Default `100kb`. |

For the **iPhone app** to call this backend, either:

- Set **CORS_ORIGINS** to your deployed web URL(s) and rely on your mobile app’s requests (some hosts send a consistent origin), or  
- For a **quick demo only**, you can set **CORS_ALLOW_ANY_ORIGIN=true** (not recommended for production).

---

## 3. Deploy on Railway

1. Go to [railway.app](https://railway.app) and sign in (e.g. GitHub).
2. **New Project** → **Deploy from GitHub repo** and select your Schedulite repo.
3. Set **Root Directory** to `backend` (or add a `railway.toml` / `nixpacks.toml` in `backend` if you prefer).
4. In the service → **Variables**, add:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `GOOGLE_CLIENT_ID`
   - `CORS_ORIGINS` = your deployed web URL (and any other allowed origins).
5. Under **Settings** → **Networking** → **Generate Domain**. Note the URL (e.g. `https://backend-xxxx.up.railway.app`).
6. Railway runs `npm install` and uses the **start** script (`node src/server.js`). No extra config needed if the repo root for the service is `backend`.

**If your repo root is the project root:** In Railway, set **Root Directory** to `backend`. Or add a `railway.json` at repo root:

```json
{ "build": { "builder": "nixpacks" }, "deploy": { "startCommand": "cd backend && npm install && node src/server.js", "restartPolicyType": "on_failure", "restartPolicyMaxRetries": 10 } }
```

Prefer setting **Root Directory** to `backend` so the working directory is `backend` and `npm start` works.

---

## 4. Deploy on Render

1. Go to [render.com](https://render.com) and sign in.
2. **New** → **Web Service** and connect your repo.
3. Configure:
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Under **Environment**, add:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `GOOGLE_CLIENT_ID`
   - `CORS_ORIGINS` (your deployed web URL(s), comma-separated)
5. Create the service. Render assigns a URL like `https://your-service.onrender.com`.

**Note:** On the free tier, the filesystem is ephemeral. Avatar uploads under `uploads/` may be lost on restart. For a demo this is usually acceptable; for production you’d use a persistent volume or object storage (e.g. S3).

---

## 5. After deploy

1. **Health check:** Open `https://your-backend-url/health`. You should see something like `{"ok":true,"version":"..."}`.
2. **Mobile app:** Use this URL as **EXPO_PUBLIC_API_URL** in EAS (and in the web app if you deploy the frontend).
3. **Web app:** If you deploy the web client (e.g. Vercel), set its API base URL to this backend and add that frontend URL to **CORS_ORIGINS** (e.g. `https://schedulite.vercel.app`).

---

## 6. Uploads (avatars)

The app stores avatar files in `backend/uploads/avatars/`. On **Render’s free tier** (and similar), the disk is ephemeral, so uploads can disappear on redeploy or restart. For a demo that’s often fine. For a permanent setup, use a **persistent volume** (Railway/Render paid) or switch avatar storage to **cloud storage** (e.g. S3, Cloudinary) and serve URLs from there.

---

## Quick checklist

- [ ] MongoDB Atlas cluster + user + connection string (**MONGO_URI**).
- [ ] **JWT_SECRET** (random string).
- [ ] **GOOGLE_CLIENT_ID** (Web client ID from Google Cloud).
- [ ] **CORS_ORIGINS** set to your deployed web URL(s) (and optionally allow any for mobile demo only).
- [ ] Deploy with **Root Directory** = `backend`, **Start** = `npm start`.
- [ ] Test `https://your-backend-url/health`, then set that URL as **EXPO_PUBLIC_API_URL** for the iPhone build.
