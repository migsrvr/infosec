import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { resetDemoData } from '../lib/store.js'

export default function Login() {
  const { login } = useAuth()
  const nav = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function onSubmit(e) {
    e.preventDefault()
    // VULNERABLE: unlimited attempts, no lockout, no delay
    const res = login(username, password)
    if (!res.ok) {
      setError(res.error)
      return
    }
    if (res.user.role === 'admin') nav('/admin')
    else nav('/dashboard')
  }

  return (
    <div className="card">
      <p className="kicker">01 / Access</p>
      <h2>Login (Phase 3 — insecure)</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={onSubmit}>
        <label className="field">Username
          <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        </label>
        <label className="field">Password
          <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <button type="submit">Login</button>
      </form>
      <p><Link to="/register">No account? Register</Link></p>
      <p className="hint">Seeded admin: admin / admin123</p>
      <p>
        <button type="button" onClick={() => { resetDemoData(); window.location.reload() }}>Reset demo data</button>
      </p>
      <p className="hint">Switching from phase5? Reset first — both branches share browser storage.</p>
    </div>
  )
}
