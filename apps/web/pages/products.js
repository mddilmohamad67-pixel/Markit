import useSWR from 'swr'

const fetcher = (url) => fetch(url).then(r => r.json())

export default function Products() {
  const { data, error } = useSWR('/api/products', fetcher)
  if (error) return <div>Failed to load</div>
  if (!data) return <div>Loading...</div>
  return (
    <div style={{padding:20}}>
      <h1>Products</h1>
      <ul>
        {data.map(p => (
          <li key={p._id}>{p.title} — ₹{p.price}</li>
        ))}
      </ul>
    </div>
  )
}
