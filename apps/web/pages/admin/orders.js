import useSWR from 'swr'
const fetcher = (url) => fetch(url, { headers: { Authorization: 'Bearer ' + (typeof window !== 'undefined' ? localStorage.getItem('admin_token') : '') } }).then(r=>r.json())

export default function AdminOrders() {
  const { data, error } = useSWR(process.env.NEXT_PUBLIC_API_URL + '/api/orders', fetcher)
  if (error) return <div>Failed</div>
  if (!data) return <div>Loading...</div>
  return (
    <div style={{padding:20}}>
      <h1>Admin Orders</h1>
      <ul>
        {data.map(o => (
          <li key={o._id} style={{marginBottom:10}}>
            <div><strong>{o._id}</strong> — {o.currentStatus} — {o.payment && o.payment.method}</div>
            <div><a href={'/admin/orders/' + o._id}>View</a></div>
          </li>
        ))}
      </ul>
    </div>
  )
}
