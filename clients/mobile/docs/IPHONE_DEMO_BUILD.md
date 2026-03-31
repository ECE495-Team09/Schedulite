# iPhone demo / test build (current backend)

You already have an **Expo (React Native) mobile app** in `clients/mobile` that uses the same backend as the web app. Here’s what you need for a **simple test build on iPhone** (no App Store release).

---

## Important: you can’t use Expo Go

The app uses **Google Sign-In** with custom native code, so it does **not** run in Expo Go. You need a **development build** (custom client binary).

---

## Option 1: Local build on a Mac (simulator or device)

**Best for:** Quick demo on your own Mac + iPhone, no cloud or paid account required for simulator.

### Prerequisites

- **Mac** with Xcode installed.
- For **iOS Simulator**: nothing else.
- For **physical iPhone**: Apple ID (free). A free account lets you install on your device for 7 days; you may need to reinstall after that. For longer use, Apple Developer Program ($99/year) is required.

### Steps

1. **Backend**
   - Run the backend (e.g. `npm start` in `backend`) on port 5000.
   - If the iPhone will use your computer’s IP (e.g. `http://192.168.1.x:5000`), ensure CORS allows that or use the dev CORS setting (see repo: backend only allows web origins by default; a change is documented below).

2. **Mobile app env**
   - In `clients/mobile`, create a `.env` (copy from `.env.example` if it exists) with:
     - `EXPO_PUBLIC_API_URL` = backend URL:
       - Simulator: `http://localhost:5000`
       - Physical iPhone: `http://YOUR_MAC_LAN_IP:5000` (e.g. `http://192.168.1.10:5000`). iPhone and Mac must be on the same Wi‑Fi.
     - `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` = same **Web** client ID as the backend (required for Google Sign-In).

3. **Google Sign-In (iOS)**
   - In Google Cloud Console, create an **iOS** OAuth client and get the iOS client ID.
   - In `clients/mobile/app.json`, set the plugin’s `iosUrlScheme` to your reversed iOS client ID, e.g. `com.googleusercontent.apps.123456789-xxxxxxxx.app` (replace `YOUR_IOS_CLIENT_ID`).

4. **Build and run**
   ```bash
   cd clients/mobile
   npm install
   npx expo prebuild
   npx expo run:ios
   ```
   - Choose **simulator** or **connected iPhone** when prompted.
   - First run may take a while (native build).

Result: a **test build** of the app running in the simulator or on your iPhone, using your current backend.

---

## Option 2: Cloud build with EAS (installable .ipa)

**Best for:** Sharing one installable link with testers, or building without a Mac. Requires **Apple Developer Program** and a **deployed backend** the app can reach from the internet.

The repo includes `eas.json` with a `preview` profile set to `"distribution": "internal"` (ad hoc). Follow these steps in order.

### Step 1: Deploy your backend (if not already)

The installed app must call a **public URL** (e.g. `https://your-backend.railway.app` or your own domain). Localhost won’t work from a real device. Deploy the backend somewhere (Railway, Render, Fly.io, etc.) and note the base URL. Ensure CORS on the backend allows requests from the app (or use a permissive CORS for demo).

### Step 2: Google Sign-In iOS config

1. In **Google Cloud Console** → APIs & Services → Credentials, create or use an **iOS** OAuth 2.0 Client and note the **iOS client ID** (e.g. `123456789-xxxx.apps.googleusercontent.com`).
2. In `clients/mobile/app.json`, replace the placeholder in the Google Sign-In plugin:
   - Change `"iosUrlScheme": "com.googleusercontent.apps.YOUR_IOS_CLIENT_ID"` to your **reversed** iOS client ID, e.g. `com.googleusercontent.apps.123456789-xxxxxxxx` (the part before `.apps.googleusercontent.com`, with dots instead of hyphens if needed — see [Expo Google Sign-In docs](https://react-native-google-signin.github.io/docs/setting-up/expo)).
3. The **Web** client ID (same as the backend) will be provided to the app via EAS env (next step).

### Step 3: EAS CLI and project link

```bash
npm i -g eas-cli
eas login
cd clients/mobile
eas build:configure
```

If prompted, link to an existing Expo project or create one. This writes/updates the project ID in `app.json`.

### Step 4: Set EAS environment variables

Build-time env vars are read from EAS (so the .ipa is built with the right backend URL and Google Web client ID). Set them in the EAS dashboard or via CLI.

**Option A — EAS dashboard (recommended for secrets)**  
1. Go to [expo.dev](https://expo.dev) → your project → **Environment variables**.  
2. Add for **preview** (or “All”):
   - `EXPO_PUBLIC_API_URL` = your deployed backend URL (e.g. `https://your-backend.railway.app`).
   - `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` = your Google OAuth **Web** client ID (same as the backend).

**Option B — CLI**

```bash
cd clients/mobile
eas env:create --name EXPO_PUBLIC_API_URL --value "https://your-backend.railway.app" --type string --environment preview
eas env:create --name EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID --value "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com" --type string --environment preview
```

### Step 5: Register your iPhone (internal distribution)

Internal builds can only be installed on **registered** devices. Register your phone:

```bash
cd clients/mobile
eas device:create
```

Follow the prompts and select **iOS**. You’ll get a link to register by UDID (or scan a QR code from your iPhone). Add any other test devices the same way.

### Step 6: Build and install

```bash
cd clients/mobile
eas build --platform ios --profile preview
```

When the build finishes, open the build page in the EAS dashboard. Use **Install** (or the build link) on your registered iPhone to install the .ipa. You may need to trust the developer in Settings → General → VPN & Device Management.

**Summary:** Deploy backend → set `app.json` iOS URL scheme → `eas build:configure` + login → set `EXPO_PUBLIC_API_URL` and `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` in EAS → `eas device:create` → `eas build --platform ios --profile preview` → install from the build link.

---

## Backend CORS (for Option 1 with physical iPhone)

The backend allows only the web app origins by default. When testing on a **physical iPhone** (using your Mac’s LAN IP as `EXPO_PUBLIC_API_URL`), the app may send a different `Origin` and get blocked.

For a **local demo only**, run the backend with:

```bash
CORS_ALLOW_ANY_ORIGIN=true npm start
```

(in the `backend` folder). This allows any origin so the mobile app can reach the API. Do not use this in production.

---

## Summary

| Goal                         | Approach                                      |
|-----------------------------|-----------------------------------------------|
| Demo on your Mac + iPhone   | Option 1: `npx expo run:ios` (local build)   |
| Share test build via link   | Option 2: EAS Build with internal distribution |

In both cases you use the **same backend**; only `EXPO_PUBLIC_API_URL` (and optionally CORS) change so the iPhone build can reach it.
