const admin = require('firebase-admin')

// Initialize firebase-admin if not already initialized
if (!admin.apps.length) {
  try {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
      : null
    admin.initializeApp({
      credential: serviceAccount ? admin.credential.cert(serviceAccount) : admin.credential.applicationDefault(),
    })
  } catch (err) {
    console.warn('Firebase admin initialization skipped or failed:', err && err.message)
  }
}

module.exports = async function verifyFirebase(req, res, next) {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'No token' })
  try {
    const decoded = await admin.auth().verifyIdToken(token)
    req.user = { uid: decoded.uid, email: decoded.email, phone: decoded.phone_number }
    next()
  } catch (err) {
    console.error('Firebase token verification failed', err && err.message)
    return res.status(401).json({ error: 'Invalid token' })
  }
}
