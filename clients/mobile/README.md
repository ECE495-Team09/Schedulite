# Schedulite Mobile

React Native (Expo) frontend for Schedulite, aligned with the web app: same auth flow, API, and screens (Login, Dashboard with profile, Sign out).

## Setup

1. Copy `.env.example` to `.env` and set:
   - **EXPO_PUBLIC_API_URL** – backend base URL (e.g. `http://localhost:5000`). Use `http://10.0.2.2:5000` for Android emulator, or your machine’s LAN IP for a physical device.
   - **EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID** – same Google OAuth **Web** client ID as the backend (required for Google Sign-In `idToken`).

2. Install and run:

   ```bash
   npm install
   npx expo start
   ```

3. Run the backend on port 5000. If using a device or emulator, ensure CORS allows your origin or use a permissive CORS config for development.

## Google Sign-In

Google Sign-In uses `@react-native-google-signin/google-signin` and needs **custom native code**, so it does **not** work in Expo Go. Use a [development build](https://docs.expo.dev/develop/development-builds/introduction/):

```bash
npx expo prebuild
npx expo run:android
# or
npx expo run:ios
```

Configure the Google project (Android/iOS client IDs, SHA-1 for Android, URL scheme for iOS) as in the [library’s Expo setup guide](https://react-native-google-signin.github.io/docs/setting-up/expo). Ensure the **Web** client ID is set in `.env` as `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` (same value as the backend).

## Scripts

- `npm start` / `npx expo start` – start Expo dev server
- `npx expo start --android` – open on Android
- `npx expo start --ios` – open on iOS

## Structure

- **App.js** – Navigation, Google Sign-In config, auth-based routing (Login vs Main).
- **src/api/client.js** – API client (token from AsyncStorage, same endpoints as web).
- **src/context/AuthContext.jsx** – Auth state and persistence (mirrors web).
- **src/screens/Login.jsx** – Login screen with “Continue with Google”.
- **src/screens/Dashboard.jsx** – Welcome and profile (email, name).
- **src/components/AppShell.jsx** – Header with logo, user name/photo, Sign out.
