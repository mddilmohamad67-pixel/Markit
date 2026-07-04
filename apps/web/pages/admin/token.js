// small helper page to set admin token (optional)
export default function AdminToken() {
  return (
    <div style={{padding:20}}>
      <h2>Admin Token Helper</h2>
      <p>Open browser console and run: <code>localStorage.setItem('admin_token', '&lt;ID_TOKEN&gt;')</code></p>
    </div>
  )
}
