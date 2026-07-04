# Markit — Firebase Auth

I added Firebase Authentication to the frontend and a /api/users/me endpoint on the API to return the currently authenticated user.

Frontend
- pages added:
  - /auth/login — email/password + Google sign-in
  - /auth/phone — phone OTP sign-in
- firebaseClient.js initializes the Firebase client using NEXT_PUBLIC_* env vars
- On successful sign-in the client stores the ID token in localStorage under keys id_token and admin_token (admin_token is used by the admin UI to call protected API endpoints)

Backend
- /api/users/me endpoint accepts either local JWT (admin) or Firebase ID token and returns the user record from DB if present.
- authorizeRole middleware still accepts Firebase tokens and checks role by firebaseUid.

How to test locally
1) Set Firebase env vars in your environment (.env or hosting platform). For local dev you can use a Firebase project (create one) and obtain the client SDK config and a service account JSON for admin verification.
2) Start services: docker-compose up --build
3) Visit http://localhost:3000/auth/login to sign in via email or Google
4) After signing in your ID token will be in localStorage; call GET /api/users/me to confirm the backend recognizes the token.

Notes
- Phone OTP requires Firebase to be configured with a valid auth domain and proper reCAPTCHA handling. For local dev, Firebase allows testing phone numbers configured in the console without real SMS.
- Storing tokens in localStorage is simple for this scaffold; for production consider secure httpOnly cookies and proper CSRF protections.
