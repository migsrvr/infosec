import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const { login } = useAuth()
  const nav = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function onSubmit(e) {
    e.preventDefault()
    const res = login(username, password)
    if (!res.ok) {
      setError(res.error)
      return
    }
    nav(res.user.role === 'admin' ? '/admin' : '/dashboard')
  }

  return (
    <div className="card">
      <h2>Login (Phase 5 — secured)</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={onSubmit}>
        <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Login</button>
      </form>
      <p><Link to="/register">No account? Register</Link></p>
      <p className="hint">Seeded admin: admin / admin123 (hash in storage). 5 wrong tries = 60s lockout.</p>
    </div>
  )
}
