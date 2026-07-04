# Markit — Admin & RBAC

I added secure admin login, RBAC middleware, and an admin seeding script.

Files added/updated:
- apps/api/models/User.js — User model with role and password hash
- apps/api/middleware/authorizeRole.js — middleware that accepts either local JWT or Firebase ID token and checks role in DB
- apps/api/routes/admin.js — POST /api/admin/login for local admin authentication
- apps/api/index.js — now mounts /api/admin and protects POST /api/products with authorizeRole('admin')
- seed/admin-seed.js — creates an admin user in MongoDB using ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD env vars
- apps/web/pages/admin/login.js — simple admin login page; stores token in localStorage under admin_token
- apps/api/package.json — added bcryptjs and jsonwebtoken dependencies

How to create an admin locally
1) Ensure Mongo is running (docker-compose or local)
2) Run the seed script (from repo root):
   MONGO_URI=mongodb://localhost:27017/markit ADMIN_SEED_EMAIL=admin@markit.local ADMIN_SEED_PASSWORD=admin123 node seed/admin-seed.js
3) Login from the frontend admin login page: http://localhost:3000/admin/login with the seeded email/password. The page stores the returned token in localStorage and redirects to /admin.

Notes on security
- For production, set a strong ADMIN_JWT_SECRET env var. The local admin JWT is signed with ADMIN_JWT_SECRET.
- Prefer using Firebase Authentication for end-users; the authorizeRole middleware will also accept valid Firebase ID tokens and check the user's role in the users collection (by firebaseUid).

Next steps (per your request)
- I will proceed to implement A: Full Admin Dashboard (edit/delete, image uploads, pagination, inventory views). After that I will continue with C, D, E, and F in sequence automatically.
