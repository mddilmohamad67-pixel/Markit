const User = require('../models/User')
const Notification = require('../models/Notification')
const admin = require('../firebaseAdmin')

// Optional email (SendGrid) and SMS (Twilio) integration
const sendgridKey = process.env.SENDGRID_API_KEY
let sendgrid
if (sendgridKey) {
  sendgrid = require('@sendgrid/mail')
  sendgrid.setApiKey(sendgridKey)
}

let twilioClient
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  const Twilio = require('twilio')
  twilioClient = new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
}

async function sendFCM(userId, title, body, data = {}) {
  try {
    const user = await User.findById(userId).lean()
    if (!user) return
    const tokens = (user.fcmTokens || []).filter(Boolean)
    if (!tokens.length) return
    const message = {
      notification: { title, body },
      data: Object.fromEntries(Object.entries(data).map(([k,v])=>[k, String(v)])),
      tokens
    }
    const res = await admin.messaging().sendMulticast(message)
    return res
  } catch (err) {
    console.error('FCM send error', err && err.message)
  }
}

async function sendEmail(userId, subject, text, html) {
  try {
    if (!sendgrid) return
    const user = await User.findById(userId).lean()
    if (!user || !user.email) return
    const msg = {
      to: user.email,
      from: process.env.SENDGRID_FROM || 'no-reply@markit.local',
      subject,
      text,
      html: html || `<p>${text}</p>`
    }
    await sendgrid.send(msg)
  } catch (err) {
    console.error('sendgrid error', err && err.message)
  }
}

async function sendSMS(userId, text) {
  try {
    if (!twilioClient) return
    const user = await User.findById(userId).lean()
    if (!user || !user.phone) return
    await twilioClient.messages.create({ body: text, from: process.env.TWILIO_FROM, to: user.phone })
  } catch (err) {
    console.error('twilio error', err && err.message)
  }
}

async function notifyUser(userId, title, body, data = {}) {
  try {
    // create DB notification
    await Notification.create({ userId, title, body })
    // send push
    await sendFCM(userId, title, body, data)
    // send email
    await sendEmail(userId, title, body)
    // send sms
    await sendSMS(userId, `${title} - ${body}`)
  } catch (err) {
    console.error('notifyUser error', err && err.message)
  }
}

module.exports = { notifyUser }
