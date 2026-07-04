import { useState } from 'react'
import { useRouter } from 'next/router'

export default function NewProduct() {
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [price, setPrice] = useState('')
  const [mrp, setMrp] = useState('')
  const [stock, setStock] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const apiBase = process.env.NEXT_PUBLIC_API_URL || ''

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const payload = { title, slug, price: Number(price), mrp: Number(mrp), stockQty: Number(stock), description }
    try {
      const token = typeof window !== 'undefined' && localStorage.getItem('admin_token')
      const headers = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = 'Bearer ' + token
      const res = await fetch(apiBase + '/api/products', { method: 'POST', headers, body: JSON.stringify(payload) })
      if (!res.ok) {
        const body = await res.json()
        throw new Error(body && body.error ? body.error : 'Failed')
      }
      const data = await res.json()
      router.push('/admin')
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div style={{padding:20}}>
      <h1>Create Product</h1>
      <form onSubmit={submit} style={{maxWidth:600}}>
        <div style={{marginBottom:8}}>
          <label>Title<br/><input value={title} onChange={e=>setTitle(e.target.value)} required style={{width:'100%'}}/></label>
        </div>
        <div style={{marginBottom:8}}>
          <label>Slug<br/><input value={slug} onChange={e=>setSlug(e.target.value)} required style={{width:'100%'}}/></label>
        </div>
        <div style={{display:'flex',gap:8}}>
          <div style={{flex:1}}>
            <label>Price<br/><input type="number" value={price} onChange={e=>setPrice(e.target.value)} required style={{width:'100%'}}/></label>
          </div>
          <div style={{flex:1}}>
            <label>MRP<br/><input type="number" value={mrp} onChange={e=>setMrp(e.target.value)} required style={{width:'100%'}}/></label>
          </div>
          <div style={{flex:1}}>
            <label>Stock<br/><input type="number" value={stock} onChange={e=>setStock(e.target.value)} required style={{width:'100%'}}/></label>
          </div>
        </div>
        <div style={{marginTop:8}}>
          <label>Description<br/><textarea value={description} onChange={e=>setDescription(e.target.value)} style={{width:'100%'}}/></label>
        </div>
        {error && <div style={{color:'red',marginTop:8}}>Error: {error}</div>}
        <div style={{marginTop:12}}>
          <button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create'}</button>
        </div>
      </form>
      <hr />
      <p>If you don't have Firebase auth here for dev, you can run the API with <code>DISABLE_AUTH=true</code> or set a Firebase ID token in localStorage under key <code>admin_token</code>.</p>
      <p>To set token manually: open browser console and run <code>localStorage.setItem('admin_token','&lt;ID_TOKEN&gt;')</code></p>
    </div>
  )
}
