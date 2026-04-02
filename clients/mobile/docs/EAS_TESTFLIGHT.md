# EAS Build + TestFlight (iPhone testing)

This path uploads a **production** iOS build to **App Store Connect**, then you distribute it through **TestFlight** (internal or external testers). It is different from **internal (ad hoc)** builds, which install directly from a link without TestFlight.

---

## Prerequisites

- **Apple Developer Program** membership (paid).
- **Expo account** and **EAS CLI** (`npm i -g eas-cli`).
- **Deployed backend** URL for `EXPO_PUBLIC_API_URL` (TestFlight builds cannot use `localhost`).
- **Google Sign-In:** iOS OAuth client in Google Cloud and `iosUrlScheme` set in `app.json` (see [IPHONE_DEMO_BUILD.md](./IPHONE_DEMO_BUILD.md)).

---

## 1. Register the app in Apple Developer

1. Go to [developer.apple.com](https://developer.apple.com) → **Certificates, Identifiers & Profiles** → **Identifiers** → **+**.
2. Choose **App IDs** → **App**.
3. Enter a **Description** and an explicit **Bundle ID** (e.g. `com.yourteam.schedulite`). You must use **the same** Bundle ID in `app.json` (`ios.bundleIdentifier`).

---

## 2. Create the app in App Store Connect

1. Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com) → **My Apps** → **+** → **New App**.
2. Choose **iOS**, give the app a name, select your **Bundle ID** (the one you created), **SKU** (any unique string, e.g. `schedulite-ios`), and **User Access** as needed.
3. You do **not** need to submit to the App Store for TestFlight; you only need the app record so builds can attach to it.

---

## 3. Configure `app.json` (this repo)

Ensure your Expo config includes:

- **`ios.bundleIdentifier`** — must match the App ID exactly (e.g. `com.yourteam.schedulite`).
- **`ios.buildNumber`** — string; **increment** for every upload to App Store Connect (e.g. `1`, `2`, `3`…). `version` is the user-facing version (e.g. `1.0.0`).

The repo template includes an `ios` block; replace the bundle identifier with yours.

---

## 4. EAS project and environment variables

```bash
cd clients/mobile
eas login
eas build:configure
```

Set **production** (or **preview** if you mirror vars there) variables in the [Expo dashboard](https://expo.dev) → your project → **Environment variables** (or `eas env:create`):

| Variable | Purpose |
|----------|---------|
| `EXPO_PUBLIC_API_URL` | Your deployed backend base URL (HTTPS). |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Google OAuth **Web** client ID (same as backend). |

---

## 5. Build for the App Store

Use the **production** profile (defaults to **store** distribution for iOS):

```bash
eas build --platform ios --profile production
```

EAS will prompt to create or reuse **distribution certificate** and **App Store provisioning profile** (or you can use `eas credentials` to manage them). First build may take 15–30+ minutes.

---

## 6. Submit the build to App Store Connect

**Option A — EAS Submit (recommended)**

```bash
eas submit --platform ios --latest
```

Follow prompts to sign in with Apple (app-specific password or API key if you set one). EAS uploads the `.ipa` to App Store Connect.

**Option B — Manual**

Download the `.ipa` from the EAS build page and upload with **Transporter** (Mac App Store) or Xcode’s Organizer.

---

## 7. Wait for processing

In **App Store Connect** → your app → **TestFlight**, the build appears as **Processing** for several minutes (sometimes longer). When it shows **Ready to Test**, you can add testers.

---

## 8. TestFlight testers

**Internal testing (up to ~100 people with App Store Connect roles)**

- **Users and Access** → invite users with **Developer**, **App Manager**, or **Admin** (or add them to the app’s team).
- In **TestFlight** → **Internal Testing**, create a group and add the build. Internal builds are usually available quickly after processing.

**External testing (up to 10,000 testers)**

- **TestFlight** → **External Testing** → add a group, add the build.
- Apple runs a short **Beta App Review** (often within 24–48 hours) for the first external build of a version; after approval, testers get the invite link.

Testers install the **TestFlight** app from the App Store, then accept your invite or use the public link.

---

## 9. Each new build

1. Bump **`ios.buildNumber`** in `app.json` (required for each new binary).
2. Optionally bump **`version`** for a new marketing release.
3. `eas build --platform ios --profile production` then `eas submit --platform ios --latest` (or submit from the EAS build page).

---

## Troubleshooting

| Issue | What to check |
|--------|----------------|
| “Invalid Bundle ID” | `ios.bundleIdentifier` matches App ID and App Store Connect app. |
| “Missing compliance” | In App Store Connect, answer **Export Compliance** / encryption questions for the build. |
| Google Sign-In fails | `iosUrlScheme` matches Google iOS client; `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` is set for the **production** EAS environment. |
| API errors | `EXPO_PUBLIC_API_URL` is HTTPS and backend **CORS** allows your web origin; mobile may need `CORS_ALLOW_ANY_ORIGIN` only for demos—prefer tightening CORS for production. |

---

## Summary

1. Create **Bundle ID** + **App** in App Store Connect.  
2. Set **`ios.bundleIdentifier`** + **`ios.buildNumber`** in `app.json`.  
3. Set EAS **env** for API + Google Web client.  
4. `eas build --platform ios --profile production` → `eas submit --platform ios --latest`.  
5. Wait for **processing**, then use **TestFlight** (internal or external).

For **ad hoc** installs without TestFlight, use `preview` / internal distribution and `eas device:create` instead (see [IPHONE_DEMO_BUILD.md](./IPHONE_DEMO_BUILD.md)).
