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

## Viewing pages without the backend

You can run only the frontend to check how pages look:

1. **Landing and Login** – Run `npm run dev` with no backend. Open `/` and `/login` to see those pages. Protected routes will redirect to login.

2. **Home and Settings (and other protected pages)** – In `clients/web/.env` add:
   ```env
   VITE_DEV_MOCK_AUTH=true
   ```
   Restart the dev server. A fake user is used so you can open `/home` and `/settings` and see the layout. API calls from those pages will still fail without the backend. Remove the variable or set it to `false` when you need real auth again.

## Design system

The app uses a single, consistent style so new pages and components stay on-brand:

- **Layout:** Light background (`--bg`), card-based content with rounded corners and subtle shadow (`app-card`).
- **Colors:** One accent for primary actions (Create/Send/Save) in `src/index.css` (`--accent`). Secondary actions use neutral grays (`app-btn-secondary`).
- **Typography:** One sans-serif family (Inter), with clear hierarchy: page title → section title → body. Variables: `--text-page-title`, `--text-section-title`, `--text-body`.
- **Structure:** Each page uses `PageHeader` (optional back link + context like “Group”/“Event” + title), then 1–2 primary content cards. Use `app-page`, `app-card`, `app-card-title`, `app-btn-primary`, `app-btn-secondary`, `app-label`, `app-input`, `app-textarea`, `app-select`, `app-form-group`, `app-empty`, `app-muted`, `app-back-link` from `src/index.css` for consistency.
- **Accessibility:** Focus and hover states use `--accent-focus-ring`; labels are left-aligned and inputs have visible focus.

Keep navigation minimal and predictable (same button placement, same empty/loading states), and reserve visual emphasis for the main action.

## Accessibility (ADA / WCAG)

The app is built for ADA compliance and screen reader users:

- **Skip link:** “Skip to main content” is the first focusable element (visible on keyboard focus) and targets `#main-content`.
- **Landmarks:** Every page has a main landmark (`<main id="main-content">`). Nav uses `aria-label="Main navigation"`. Sections use `aria-labelledby` pointing to their heading.
- **Document title:** Updates with the route (e.g. “Home | Schedulite”, “Sign in | Schedulite”) so users always know the page.
- **Forms:** Every form control has an associated visible label (`<label htmlFor="...">`). Required fields use `aria-required` where appropriate.
- **Loading:** The loading screen uses `role="status"`, `aria-live="polite"`, and `aria-busy="true"` so assistive tech can announce it.
- **Reduced motion:** `prefers-reduced-motion: reduce` is respected in global CSS (animations and transitions minimized).
- **Focus:** All interactive elements have a visible focus style (`:focus-visible`). Use the `.visually-hidden` class for screen-reader-only text when needed.

New pages and components should keep one main landmark per view, use `PageHeader` for the page title, and add `aria-labelledby` (and unique heading ids) for major sections.

## Scripts

- `npm run dev` – start dev server (port 5173)
- `npm run build` – production build
- `npm run preview` – preview production build
