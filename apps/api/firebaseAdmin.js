const admin = require('firebase-admin')

// Initialize firebase-admin with storage bucket if provided
if (!admin.apps.length) {
  try {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON) : null
    const opts = {}
    if (serviceAccount) {
      opts.credential = admin.credential.cert(serviceAccount)
    } else {
      opts.credential = admin.credential.applicationDefault()
    }
    if (process.env.FIREBASE_STORAGE_BUCKET) opts.storageBucket = process.env.FIREBASE_STORAGE_BUCKET
    admin.initializeApp(opts)
  } catch (err) {
    console.warn('Firebase admin initialization skipped or failed:', err && err.message)
  }
}

module.exports = admin
