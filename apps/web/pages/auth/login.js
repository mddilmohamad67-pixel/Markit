import { useState } from 'react'
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import app, { auth } from '../../firebaseClient'
import { useRouter } from 'next/router'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const router = useRouter()

  const handleEmailLogin = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      const res = await signInWithEmailAndPassword(auth, email, password)
      const idToken = await res.user.getIdToken()
      localStorage.setItem('id_token', idToken)
      // also set admin_token for admin flows when user is admin
      localStorage.setItem('admin_token', idToken)
      router.push('/')
    } catch (err) {
      setError(err.message)
    }
  }

  const handleGoogle = async () => {
    setError(null)
    try {
      const provider = new GoogleAuthProvider()
      const res = await signInWithPopup(auth, provider)
      const idToken = await res.user.getIdToken()
      localStorage.setItem('id_token', idToken)
      localStorage.setItem('admin_token', idToken)
      router.push('/')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div style={{padding:20}}>
      <h1>Sign in</h1>
      <form onSubmit={handleEmailLogin} style={{maxWidth:420}}>
        <div style={{marginBottom:8}}>
          <label>Email<br/><input value={email} onChange={e=>setEmail(e.target.value)} required style={{width:'100%'}}/></label>
        </div>
        <div style={{marginBottom:8}}>
          <label>Password<br/><input type="password" value={password} onChange={e=>setPassword(e.target.value)} required style={{width:'100%'}}/></label>
        </div>
        {error && <div style={{color:'red',marginTop:8}}>Error: {error}</div>}
        <div style={{marginTop:12}}>
          <button type="submit">Sign in</button>
        </div>
      </form>
      <hr />
      <button onClick={handleGoogle}>Sign in with Google</button>
      <p>Or <a href="/auth/phone">Sign in with phone (OTP)</a></p>
    </div>
  )
}
