import { useState, useEffect } from 'react'

export default function AdminSettings() {
  const [upiId, setUpiId] = useState('')
  const [qr, setQr] = useState(null)
  const [preview, setPreview] = useState(null)

  useEffect(() => {
    fetch(process.env.NEXT_PUBLIC_API_URL + '/api/settings/payment/public').then(r=>r.json()).then(s=>{ setUpiId(s.upiId||''); setPreview(s.qrImageUrl||null) })
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    const form = new FormData()
    form.append('upiId', upiId)
    if (qr) form.append('qrImage', qr)
    const token = localStorage.getItem('admin_token')
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/settings/payment', { method: 'POST', headers: { Authorization: 'Bearer ' + token }, body: form })
    const body = await res.json()
    if (!res.ok) return alert('Error: ' + (body.error||''))
    alert('Settings saved')
    setPreview(body.upiId ? body.qrImageUrl : null)
  }

  return (
    <div style={{padding:20}}>
      <h1>Payment Settings</h1>
      <form onSubmit={submit} style={{maxWidth:600}}>
        <div style={{marginBottom:8}}>
          <label>UPI ID<br/><input value={upiId} onChange={e=>setUpiId(e.target.value)} style={{width:'100%'}}/></label>
        </div>
        <div style={{marginBottom:8}}>
          <label>Upload QR Code<br/><input type="file" accept="image/*" onChange={e=>setQr(e.target.files[0])} /></label>
        </div>
        {preview && <div style={{marginBottom:8}}>Current QR:<br/><img src={preview} style={{width:200}} /></div>}
        <div><button type="submit">Save</button></div>
      </form>
    </div>
  )
}
