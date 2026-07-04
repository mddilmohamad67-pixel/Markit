import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

export default function AdminOrderDetail() {
  const router = useRouter()
  const { id } = router.query
  const [order, setOrder] = useState(null)

  useEffect(() => {
    if (!id) return
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : ''
    fetch(process.env.NEXT_PUBLIC_API_URL + '/api/orders/' + id, { headers: { Authorization: 'Bearer ' + token } }).then(r=>r.json()).then(setOrder)
  }, [id])

  const act = async (action) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : ''
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/orders/' + id + '/verify', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify({ action }) })
    const body = await res.json()
    if (!res.ok) return alert('Error: ' + (body.error||''))
    alert('Action completed')
    setOrder(body.order)
  }

  if (!order) return <div style={{padding:20}}>Loading...</div>
  return (
    <div style={{padding:20}}>
      <h1>Order {order._id}</h1>
      <div>Status: {order.currentStatus}</div>
      {order.payment && (
        <div style={{marginTop:12}}>
          <div>Payment Method: {order.payment.method}</div>
          <div>Payment Status: {order.payment.paymentStatus}</div>
          {order.payment.proofImageUrl && <div style={{marginTop:8}}>Proof: <img src={order.payment.proofImageUrl} style={{width:200}} /></div>}
          <div style={{marginTop:12}}>
            {order.payment.paymentStatus === 'pending_verification' && (
              <>
                <button onClick={()=>act('approve')}>Approve</button>
                <button onClick={()=>act('reject')} style={{marginLeft:8}}>Reject</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
