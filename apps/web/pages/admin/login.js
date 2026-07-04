import { useState } from 'react'
import { useRouter } from 'next/router'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const router = useRouter()
  const apiBase = process.env.NEXT_PUBLIC_API_URL || ''

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      const res = await fetch(apiBase + '/api/admin/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password })
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body && body.error ? body.error : 'Login failed')
      localStorage.setItem('admin_token', body.token)
      router.push('/admin')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div style={{padding:20}}>
      <h1>Admin Login</h1>
      <form onSubmit={submit} style={{maxWidth:420}}>
        <div style={{marginBottom:8}}>
          <label>Email<br/><input value={email} onChange={e=>setEmail(e.target.value)} required style={{width:'100%'}}/></label>
        </div>
        <div style={{marginBottom:8}}>
          <label>Password<br/><input type="password" value={password} onChange={e=>setPassword(e.target.value)} required style={{width:'100%'}}/></label>
        </div>
        {error && <div style={{color:'red',marginTop:8}}>Error: {error}</div>}
        <div style={{marginTop:12}}>
          <button type="submit">Login</button>
        </div>
      </form>
    </div>
  )
}
