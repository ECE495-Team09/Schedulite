# Schedulite Mobile

React Native (Expo) frontend for Schedulite, aligned with the web client: same auth flow, API, and screens (Login, Dashboard).

## Setup

1. **Install dependencies**

   ```bash
   cd clients/mobile
   npm install
   ```

2. **Configure environment**

   - Copy `.env.example` to `.env` or set `app.json` → `expo.extra`:
     - `apiUrl` – backend base URL (e.g. `http://localhost:5000`). On Android emulator use `http://10.0.2.2:5000` to reach host machine.
     - `googleWebClientId` – same Google OAuth **Web** client ID as the backend (required for Google Sign-In and idToken).

3. **Google Sign-In (native)**

   This app uses `@react-native-google-signin/google-signin`, so it needs a **development build** (it does not run in Expo Go). Create one with:

   ```bash
   npx expo prebuild
   npx expo run:android
   # or
   npx expo run:ios
   ```

   In Google Cloud Console use the same OAuth client as the backend; for Android you’ll also add the Android app (package name `com.schedulite.app`) and SHA-1.

## Scripts

- `npm start` – start Expo dev server
- `npm run android` – open on Android
- `npm run ios` – open on iOS

## Structure

- `App.js` – AuthProvider, Google Sign-In config, navigation (Login vs Main with AppShell + Dashboard).
- `src/api/client.js` – same API as web (token from AsyncStorage, `loginWithGoogle`, `getMe`).
- `src/context/AuthContext.jsx` – same contract as web (user, loading, setAuth, logout); uses AsyncStorage.
- `src/screens/Login.jsx` – Google Sign-In button, then `loginWithGoogle(idToken)` and navigate to Main.
- `src/screens/Dashboard.jsx` – welcome + user email/name.
- `src/components/AppShell.jsx` – header with logo, user name/photo, Sign out.

The backend is shared with the web client (`POST /auth/google` with `idToken`, `GET /users/me`).
