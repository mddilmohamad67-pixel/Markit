import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

export default function OrderPage() {
  const router = useRouter()
  const { id } = router.query
  const [order, setOrder] = useState(null)
  const [file, setFile] = useState(null)
  const [utr, setUtr] = useState('')

  useEffect(() => {
    if (!id) return
    fetch(process.env.NEXT_PUBLIC_API_URL + '/api/orders/' + id).then(r=>r.json()).then(setOrder)
  }, [id])

  const uploadProof = async (e) => {
    e.preventDefault()
    if (!file) return alert('Please choose screenshot')
    const form = new FormData()
    form.append('screenshot', file)
    form.append('utr', utr)
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/orders/' + id + '/proof', { method: 'POST', body: form })
    const body = await res.json()
    if (!res.ok) return alert('Error: ' + (body.error||''))
    alert('Proof uploaded — pending verification')
    setOrder(body.order)
  }

  if (!order) return <div style={{padding:20}}>Loading...</div>
  return (
    <div style={{padding:20}}>
      <h1>Order {order._id}</h1>
      <div>Current status: {order.currentStatus}</div>
      {order.payment && order.payment.method === 'manual_qr' && (
        <div style={{marginTop:12}}>
          <h3>Manual QR Payment</h3>
          {order.payment.qrImageUrl && <img src={order.payment.qrImageUrl} alt="qr" style={{width:200,height:200}} />}
          <div>UPI ID: <strong>{order.payment.upiId}</strong></div>
          <div style={{marginTop:12}}>
            <form onSubmit={uploadProof}>
              <div><label>Payment Screenshot<br/><input type="file" accept="image/*" onChange={e=>setFile(e.target.files[0])} required /></label></div>
              <div style={{marginTop:8}}><label>Transaction ID / UTR<br/><input value={utr} onChange={e=>setUtr(e.target.value)} required /></label></div>
              <div style={{marginTop:8}}><button type="submit">Upload Proof</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
