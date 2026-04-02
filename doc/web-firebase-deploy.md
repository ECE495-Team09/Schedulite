# Web Deployment to Firebase Hosting (GitHub Actions)

This setup deploys the web frontend in clients/web to Firebase Hosting.
It does not change existing CI in .github/workflows/ci.yml and does not change backend Cloud Run deployment files.

## Files added

- firebase.json
- .github/workflows/web-firebase-hosting.yml
- doc/web-firebase-deploy.md

## Frontend build/runtime details inferred from code

- Package manager and lockfile: npm with clients/web/package-lock.json
- Build command: npm run build --prefix clients/web
- Build output directory: clients/web/dist
- Frontend env vars used by web code:
  - VITE_API_URL (defaults to /api)
  - VITE_GOOGLE_CLIENT_ID
  - VITE_DEV_MOCK_AUTH (dev-only behavior)

## Hosting behavior used in this setup

firebase.json config does the following:

1. Serves static files from clients/web/dist
2. Rewrites /api/** to Cloud Run service schedulite-backend in us-central1
3. Rewrites /uploads/** to the same backend service
4. Rewrites all other routes to /index.html for SPA routing (React Router)

This keeps current frontend behavior intact because the app already defaults to VITE_API_URL=/api.

## GitHub Actions behavior

Workflow file: .github/workflows/web-firebase-hosting.yml

- Push to main:
  - Builds clients/web
  - Deploys to Firebase Hosting live channel
- Pull request to main (same repository PRs):
  - Builds clients/web
  - Deploys a Firebase Hosting preview channel (pr-<number>) that expires in 7 days

Note: PRs from forks do not run preview deploy because repository secrets are not exposed there.

## Manual setup steps (Firebase / Google Cloud / GitHub)

1. Firebase project setup
   - Open Firebase Console
   - Create or select a Firebase project
   - Enable Hosting for that project (default site is fine)

2. Project alignment
   - Use the same Google Cloud project that contains Cloud Run service schedulite-backend, or update firebase.json rewrites if your backend is in a different project/region/service name

3. Service account for GitHub deployment
   - In Firebase Console: Project settings > Service accounts
   - Generate a new private key for the Firebase Admin SDK service account
   - Save the JSON; you will paste this into a GitHub secret

4. GitHub repository secrets
   - Add these repository-level secrets:
     - FIREBASE_SERVICE_ACCOUNT
       - Value: full JSON content of the service account key
     - FIREBASE_PROJECT_ID
       - Value: Firebase project ID (for example: your-project-id)
     - VITE_GOOGLE_CLIENT_ID
       - Value: same Google OAuth Web client ID used by your web app/backend

5. Verify first deployment
   - Push a commit to main
   - Open GitHub Actions and check workflow Web Firebase Hosting
   - After success, open Firebase Console > Hosting and verify latest live release
   - Open the deployed site URL and test:
     - client-side route refresh (for example /login)
     - API-backed page load
     - GET /api/health through hosting domain (should hit backend)

## Local development impact

No local development behavior was changed. Vite dev server proxy in clients/web/vite.config.js still handles /api and /uploads locally.