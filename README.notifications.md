# Markit — Firebase Storage + Notifications + Audit Logs

Changes in this commit:
- Use Firebase Storage for uploads (orders/ and settings/ paths). Implemented server-side upload via firebase-admin storage bucket; requires FIREBASE_STORAGE_BUCKET env var or service account with storageBucket.
- Notifications: integrated FCM push via firebase-admin.messaging, SendGrid email (SENDGRID_API_KEY) and Twilio SMS (TWILIO_*) via apps/api/utils/notify.js. The notifyUser helper creates a DB Notification, sends FCM, email, and SMS when available.
- Admin audit logs: AuditLog model and writes when admin approves/rejects payments and when updating QR settings.
- User model updated to include phone and fcmTokens.

Environment variables required:
- FIREBASE_SERVICE_ACCOUNT_JSON (stringified JSON)
- FIREBASE_STORAGE_BUCKET (e.g., your-project.appspot.com)
- SENDGRID_API_KEY
- SENDGRID_FROM (optional)
- TWILIO_ACCOUNT_SID
- TWILIO_AUTH_TOKEN
- TWILIO_FROM

Notes:
- For production, ensure Firebase Storage rules and bucket permissions are configured appropriately. Consider generating signed URLs with limited expiry instead of making objects public.
- The current implementation uses getSignedUrl with long expiry for simplicity.
