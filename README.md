# Markit

Starter monorepo scaffold for the Markit Online Grocery + Marketing platform.

This update adds a minimal Admin Dashboard (product list + create product form) and a dev-mode authentication bypass to help local development.

Dev-mode admin access
- By default the API expects a Firebase ID token for protected endpoints.
- For quick local development, you can bypass auth by setting DISABLE_AUTH=true in the API environment. For example:

  DISABLE_AUTH=true MONGO_URI=mongodb://localhost:27017/markit node apps/api/index.js

This allows the admin UI to create products without requiring Firebase integration.

How to run (docker-compose)
1) docker-compose up --build
2) (optional) Seed sample data: MONGO_URI=mongodb://localhost:27017/markit node seed/seed.js
3) Visit http://localhost:3000/admin to access the admin dashboard (list/create)

Notes
- For production you should NOT use DISABLE_AUTH=true. Integrate Firebase auth and provide a valid Firebase ID token from the frontend.
- The admin UI is intentionally minimal and designed to be extended (add list pagination, edit/delete, RBAC).
