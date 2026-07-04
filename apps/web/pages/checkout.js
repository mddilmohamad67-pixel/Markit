import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function Checkout() {
  const [paymentMethod, setPaymentMethod] = useState('manual_qr')
  const [settings, setSettings] = useState(null)
  const [items] = useState([{ title: 'Sample Item', price: 100, qty: 1 }])
  const [address, setAddress] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetch(process.env.NEXT_PUBLIC_API_URL + '/api/settings/payment/public').then(r=>r.json()).then(setSettings)
  }, [])

  const placeOrder = async () => {
    const total = items.reduce((s,i)=>s + i.price*i.qty,0)
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/orders', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ items, total, address, paymentMethod }) })
    const body = await res.json()
    if (!res.ok) return alert('Failed: ' + (body.error||''))
    // redirect to order page to upload proof if manual
    router.push('/orders/' + body._id)
  }

  return (
    <div style={{padding:20}}>
      <h1>Checkout</h1>
      <div>
        <label>Address<br/><textarea value={address} onChange={e=>setAddress(e.target.value)} style={{width:'100%'}}/></label>
      </div>
      <div style={{marginTop:12}}>
        <label><input type="radio" checked={paymentMethod==='manual_qr'} onChange={()=>setPaymentMethod('manual_qr')} /> Manual QR Payment</label>
        <label style={{marginLeft:12}}><input type="radio" checked={paymentMethod==='cod'} onChange={()=>setPaymentMethod('cod')} /> Cash on Delivery (COD)</label>
      </div>
      {paymentMethod === 'manual_qr' && settings && (
        <div style={{marginTop:12}}>
          <h3>Scan to Pay</h3>
          {settings.qrImageUrl ? <img src={settings.qrImageUrl} alt="QR" style={{width:200,height:200}} /> : <div>No QR configured</div>}
          <div style={{marginTop:8}}>UPI ID: <strong>{settings.upiId || 'Not configured'}</strong></div>
        </div>
      )}
      <div style={{marginTop:12}}>
        <button onClick={placeOrder}>Place Order</button>
      </div>
    </div>
  )
}
