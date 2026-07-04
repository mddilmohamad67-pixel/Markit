import useSWR from 'swr'
import Link from 'next/link'

const fetcher = (url) => fetch(url).then(r => r.json())

export default function AdminIndex() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || ''
  const { data, error } = useSWR(apiBase + '/api/products', fetcher)
  if (error) return <div>Failed to load</div>
  if (!data) return <div>Loading...</div>
  return (
    <div style={{padding:20}}>
      <h1>Admin — Products</h1>
      <p><Link href="/admin/new-product">Create new product</Link></p>
      <ul>
        {data.map(p => (
          <li key={p._id} style={{marginBottom:8}}>
            <strong>{p.title}</strong> — ₹{p.price} — Stock: {p.stockQty}
          </li>
        ))}
      </ul>
      <hr />
      <p>Dev notes: If your API requires auth, set a Firebase ID token in localStorage key <code>admin_token</code> or run the API with <code>DISABLE_AUTH=true</code> to bypass auth in dev.</p>
    </div>
  )
}
