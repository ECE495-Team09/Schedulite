# Schedulite Web

React frontend for Schedulite. Uses Vite, React Router, and Google OAuth via `@react-oauth/google`.

## Setup

1. Copy `.env.example` to `.env` and set:
   - `VITE_GOOGLE_CLIENT_ID` – same Google OAuth client ID as the backend (Web application type, with `http://localhost:5173` as authorized origin).

2. Install and run:

   ```bash
   npm install
   npm run dev
   ```

3. Ensure the backend is running on port 5000. The dev server proxies `/api` to `http://localhost:5000`.

## Scripts

- `npm run dev` – start dev server (port 5173)
- `npm run build` – production build
- `npm run preview` – preview production build
