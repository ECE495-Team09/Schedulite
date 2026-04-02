# How-To Schedulite

---

## How to sign in with Google and recover access if you cannot sign in

**Purpose:** Use Schedulite with your Google account, and get back in if sign-in fails.

**Preconditions:** You have a Google account. Schedulite does not use a separate password. Authentication is **Sign in with Google** only.

**Step-by-step instructions**

1. Open the Schedulite app (web or mobile) and go to the sign-in screen.
2. Choose **Continue with Google**.
3. Pick the Google account you want to use.
4. If you **forgot your Google password** or are locked out of Google, use Google’s account recovery: follow Google’s steps to reset your password or verify your identity. Schedulite is not able to reset your Google password for you.
5. If sign-in works but you see errors about the app or “something went wrong,” try signing out of Google in the browser (web) or updating the app (mobile), then try again.

**Expected result:** You are signed in and see your home dashboard with your groups and events. If you recovered your Google account, the same Google sign-in should work in Schedulite.

---

## How to update your profile name and profile photo

**Purpose:** Keep your display name and avatar up to date in Schedulite.

**Preconditions:** You are signed in.

**Step-by-step instructions (web)**

1. Open **Settings** from the navigation.
2. Under **Profile**, click **Edit** to change your **name**.
3. Save your changes when prompted.
4. To change your photo, use **Change photo**, choose an image (supported types such as JPEG, PNG, WebP, or GIF).

**Step-by-step instructions (mobile)**

1. Open the main screen after sign-in and use the account area to reach profile-related actions.
2. Update name and save.
3. Upload or change a profile photo.

**Expected result:** Your profile shows the new name, and your avatar updates after a successful photo upload.

---

## How to create a group or join a group with a join code

**Purpose:** Work in shared **groups** so you and others can organize **events** together.

**Preconditions:** You are signed in.

**Step-by-step instructions — create a group**

1. From **Home**, click **Create group**.
2. Fill in the group details as shown on the form (name and description).
3. Submit the form. Keep track of the **join code** the app shows so you can share it with members.

**Step-by-step instructions — join a group**

1. From **Home**, click **Join group**.
2. Enter the **6-character join code** your organizer shared.
3. Submit.

**Expected result:** **Create** adds a new group you manage. **Join** adds you to an existing group and opens its group view.

---

## How to create an event and open it from a group

**Purpose:** Schedule **events** inside a group and open an event’s details.

**Preconditions:** You are signed in and are a member of at least one group.

**Step-by-step instructions**

1. Open a **group** from Home (click the group) so you are on the group page.
2. Click **Create Event** to create an event.
3. Complete the event form (title, time, etc.) and save.
4. From Home or the group, open an event to see its **event page**. Use **event settings** if you need to edit the event.

**Expected result:** The new event appears in your lists, and you can open it to view or manage details.

---

*The following secions are for developers.*

---

## How to set up the local development environment

**Purpose:** Run the backend API and at least one client (web and/or mobile) on your machine for development.

**Preconditions:** Node.js and npm installed; MongoDB available (local or Atlas). For web login, a **Google Cloud OAuth** “Web client” ID configured for your local origin (for example `http://localhost:5173`).

**Step-by-step instructions**

1. **MongoDB:** Create a database and obtain a connection string (**MONGO_URI**).

2. **Backend** (`backend/`):  
   - `npm install`  
   - Set environment variables (if you are confused, go to *How to configure environment variables*). You need at least the following: **MONGO_URI**, **JWT_SECRET**, **GOOGLE_CLIENT_ID**.
   - Run `npm run dev` (or `npm start`) so the API listens on port **5000** by default.

3. **Web client** (`clients/web/`):  
   - `npm install`
   - Configure **VITE_GOOGLE_CLIENT_ID** (using the same web client ID as the backend).
   - Run `npm run dev` — Vite serves the app (typically port **5173**) and proxies **`/api`** to `http://localhost:5000`.

4. **Mobile** (`clients/mobile/`, optional):  
   - `npm install`  
   - Set **EXPO_PUBLIC_API_URL** (`http://localhost:5000` for example; use LAN IP or Android emulator host as seen in `clients/mobile/README.md`).  
   - Set **EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID**.
   - Run `npx expo start`. Google Sign-In requires a **development build**, not Expo Go alone.

**Expected result:** Backend responds, web app loads and can authenticate the backend, and mobile can reach the API when the device and network settings allow.

---

## How to configure environment variables

**Purpose:** Point each part of the system at the right API, OAuth client, and DB.

**Preconditions:** You have access to your MongoDB URI and Google OAuth Web client ID.

**Step-by-step instructions — backend**

Set (either in `.env` or your chosen host’s dashboard):

| Variable | What it does (and whether you need it or not)|
|----------|------|
| **MONGO_URI** | MongoDB connection string (required). |
| **JWT_SECRET** | Secret for signing JWTs (required). |
| **GOOGLE_CLIENT_ID** | Google OAuth Web client ID (required). |
| **PORT** | Listen port (default often 5000). |
| **CORS_ORIGINS** | Comma-separated allowed browser origins for production. |
| **CORS_ALLOW_ANY_ORIGIN** | `true` only for local/mobile demos, **not** for production. |
| **BODY_LIMIT** | Request body size limit. |

**Step-by-step instructions — web (`clients/web`)**

- **VITE_GOOGLE_CLIENT_ID** — must match the backend’s **GOOGLE_CLIENT_ID**.  
- **VITE_DEV_MOCK_AUTH=true** — optional; uses a fake user so you can open protected routes **without** the backend for UI checks only. Set to `false` for real auth.

**Step-by-step instructions — mobile (`clients/mobile`)**

- **EXPO_PUBLIC_API_URL** — backend base URL.  
- **EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID** — same Web client ID as the backend for `idToken` verification.

**Expected result:** Clients authenticate against Google and talk to the correct API; CORS errors disappear when **CORS_ORIGINS** includes your deployed web origin.

---

## How to deploy the backend (and connect clients)

**Purpose:** Run the API on a public URL so hosted web and mobile builds can use it.

**Preconditions:** MongoDB Atlas, secrets (**JWT_SECRET**, **GOOGLE_CLIENT_ID**), and a Git-connected host (Render is what we use).

**Step-by-step instructions**

1. Follow **[DEPLOY_BACKEND.md]** for Atlas, env vars, and platform-specific steps.  
2. Set the service **root directory** to **`backend`**, with start command **`npm start`** (or `node src/server.js`).  
3. After deploy, verify **`GET /health`**.  
4. Set the web app’s API base (and **CORS_ORIGINS** on the backend) to your production web URL.  
5. For mobile EAS builds, set **EXPO_PUBLIC_API_URL** to the same backend URL.

**Expected result:** `https://your-backend/health` returns success JSON; web and mobile clients can call the API when CORS and env vars match.

---

## How to work on the web UI without the backend

**Purpose:** Quickly review protected pages when the API is not running.

**Preconditions:** Web client dependencies installed.
**Step-by-step instructions**

1. In `clients/web`, add the following to `.env`: `VITE_DEV_MOCK_AUTH=true`
2. Restart `npm run dev`.
3. Open protected routes such as `/home` and `/settings`. A **fake user** is used so API calls from those pages might not work.

**Expected result:** You can navigate protected screens for design and accessibility checks. Set **`VITE_DEV_MOCK_AUTH`** to **`false`** or remove it when testing real sign-in.
