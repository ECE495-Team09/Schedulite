# Backend CD to Cloud Run (Cloud Build Trigger)

This setup deploys only the backend service from the GitHub main branch to Cloud Run.
Existing GitHub Actions CI in .github/workflows/ci.yml remains unchanged.

## Files added or changed

- Added: backend/Dockerfile
- Added: backend/.dockerignore
- Added: cloudbuild.yaml (repo root)
- Changed: backend/src/server.js (explicit host binding for Cloud Run)

## Backend runtime details (from code)

- Runtime: Node.js 20 (mongoose 9.1.3 in lockfile requires Node >= 20.19.0)
- Start command: npm start
- Entrypoint: backend/src/server.js
- Server port: process.env.PORT (Cloud Run sets this automatically)

## Google Cloud resources to create manually

1. Google Cloud project with billing enabled.
2. Enable APIs:
   - Cloud Build API
   - Cloud Run Admin API
   - Artifact Registry API
3. Artifact Registry Docker repository in us-central1:
   - Repository name used by this config: schedulite-backend
4. Choose the service account used by the Cloud Build trigger.
   - Grant it:
     - roles/artifactregistry.writer
     - roles/run.admin
     - roles/iam.serviceAccountUser (on the Cloud Run runtime service account)

## Environment variables used by backend code

Required:

- MONGO_URI
- JWT_SECRET
- GOOGLE_CLIENT_ID

Optional:

- CORS_ORIGINS
- CORS_ALLOW_ANY_ORIGIN
- BODY_LIMIT

Notes:

- PORT is read by the app but should not be manually set for Cloud Run.
- Cloud Run container filesystem is ephemeral. Avatar uploads under backend/uploads/avatars are not durable across instance restarts or replacements.

## Cloud Build trigger setup in Google Cloud Console

1. Open Google Cloud Console and select your project.
2. Go to Cloud Build > Triggers.
3. Click Create trigger.
4. Set trigger details:
   - Name: schedulite-backend-main
   - Event: Push to a branch
   - Source: Connect your GitHub repository (Schedulite) if not already connected
   - Branch (regex): ^main$
5. In Configuration:
   - Type: Cloud Build configuration file (yaml or json)
   - Location: Repository
   - Cloud Build config file location: cloudbuild.yaml
6. Under Included files (recommended for backend-only deploy trigger):
   - backend/**
   - cloudbuild.yaml
7. Select the trigger service account that has the required roles above.
8. Create the trigger.

## Configure Cloud Run service environment variables

After first deploy creates schedulite-backend, open Cloud Run > schedulite-backend > Edit and deploy new revision, then set:

- MONGO_URI
- JWT_SECRET
- GOOGLE_CLIENT_ID
- Optional CORS_ORIGINS, CORS_ALLOW_ANY_ORIGIN, BODY_LIMIT

If you prefer, you can set these in Cloud Run before traffic cutover on the initial revision.

## How deployment works

On each trigger run (main branch push), cloudbuild.yaml does:

1. docker build using backend/ as Docker context
2. docker push to Artifact Registry in us-central1
3. gcloud run deploy to service schedulite-backend in us-central1
4. deploy with --allow-unauthenticated

## First deployment test

1. Push a commit to main that changes backend/ (or run trigger manually).
2. Watch Cloud Build logs until success.
3. Open Cloud Run > schedulite-backend and copy service URL.
4. Verify health endpoint:
   - GET https://YOUR_CLOUD_RUN_URL/health
   - Expected: JSON with ok true.
5. Verify one authenticated backend endpoint from your client flow after setting env vars.

## Why cloudbuild.yaml is at repo root

The trigger references cloudbuild.yaml directly from repository root, which is the default and simplest Cloud Build trigger pattern. The build itself is still backend-only because Docker uses backend/ as the build context.