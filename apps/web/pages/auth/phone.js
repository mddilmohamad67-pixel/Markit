import { useEffect, useState } from 'react'
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'
import app, { auth } from '../../firebaseClient'
import { useRouter } from 'next/router'

export default function PhoneAuth() {
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [verificationId, setVerificationId] = useState(null)
  const [error, setError] = useState(null)
  const [step, setStep] = useState(0)
  const router = useRouter()

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
        size: 'invisible'
      }, auth)
    }
  }, [])

  const sendOTP = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      const appVerifier = window.recaptchaVerifier
      const confirmation = await signInWithPhoneNumber(auth, phone, appVerifier)
      setVerificationId(confirmation.verificationId)
      setStep(1)
    } catch (err) {
      setError(err.message)
    }
  }

  const verifyCode = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      // confirmationResult not preserved across reloads; use signInWithPhoneNumber flow
      const credential = await auth.confirmationResult.confirm(code)
      const token = await credential.user.getIdToken()
      localStorage.setItem('id_token', token)
      localStorage.setItem('admin_token', token)
      router.push('/')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div style={{padding:20}}>
      <h1>Phone sign-in (OTP)</h1>
      <div id="recaptcha-container"></div>
      {step === 0 && (
        <form onSubmit={sendOTP} style={{maxWidth:420}}>
          <div style={{marginBottom:8}}>
            <label>Phone (E.164 format, e.g. +9199... )<br/><input value={phone} onChange={e=>setPhone(e.target.value)} required style={{width:'100%'}}/></label>
          </div>
          {error && <div style={{color:'red'}}>{error}</div>}
          <button type="submit">Send OTP</button>
        </form>
      )}
      {step === 1 && (
        <form onSubmit={verifyCode} style={{maxWidth:420}}>
          <div style={{marginBottom:8}}>
            <label>OTP code<br/><input value={code} onChange={e=>setCode(e.target.value)} required style={{width:'100%'}}/></label>
          </div>
          {error && <div style={{color:'red'}}>{error}</div>}
          <button type="submit">Verify</button>
        </form>
      )}
    </div>
  )
}
