## Repository Structure

```
Schedulite/
├── backend/                   # Node.js/Express API
│   ├── src/
│   │   ├── server.tsx         # Entry point
│   │   ├── models/            # Database schemas
│   │   │   └── eventSchema.tsx
│   │   └── routes/            # API routes
│   │       └── eventRoutes.tsx
│   ├── package.json           # Dependencies
│   └── .env                   # Configuration (not in git)
│
├── wed-frontend/              # Client app
│   ├── html/
│   │   ├── main.html          # Event creation form
│   │   └── dashboard.html     # Availability view
│   └── css/
├── ios-frontend/              # iOS mobile app
├── android-frontend/          # Android mobile app
├── doc/
│   └── dev_process.md         # Development guidelines
│
└── readme.txt                 # Setup instructions
```

## Backend (`/backend`)

We will have a shared backend with 

## Frontend (`/frontend`)

HTML/CSS/JavaScript web app:
- `main.html` - Event creation form
- `dashboard.html` - Availability tracker

## Branching Conventions:

We will use a simple 3 level branching model:

- "main" : This is the production-ready branch. All code here should be stable and deployable.
- "dev" : This is an integration branch where features are merged after being tested in feature branches.
- Feature Branches: Temporary branches created from "dev" for developing new features or fixing bugs
    The feature branches follow the naming convention: 
        "feature_<feature-name>_<dev-name>"
    EX:
        `feature_database_aryan`
        `feature_dashboard_jacob`
        `feature_api-endpoints_luca`
    This helps in identifying the purpose of the branch and the developer working on it.

## Code Development & Review Policy:
    
Our team will use pull requests and code reviews for all changes that go into shared branches.

Pull Request Policy:
- `All merges into dev and main must go through a pull request (PR).`
- `No direct commits to main. Avoid direct commits to dev except for emergency fixes.`
- `Feature branches are synced with dev regularly to reduce merge conflicts.`

## Code Review Requirements
- `Each PR into dev must have at least one teammate approval (not the author).`
-  PR description should briefly state:
    1. What was *changed.*
    2. Any new *endpoints, models, or UI flows.*
    3. How it was *tested (e.g., “npm test”, “Postman check for /events route”).*

## Reviewers look for:
- `Correctness and basic testing.`
- `Clear, readable code and file structure.`
- `No obvious security or performance issues for this stage.`

## Merging Rules:

PR into dev:
- `CI checks should pass (linting/tests, once we set them up).`
- `At least one approval.`
- `Small, focused PRs are preferred over huge ones.`

PR from dev into main:
- `Created only when dev is stable (e.g., before a demo or release).`
- `All CI checks must pass.`
- `Whole team agrees it is ready.`