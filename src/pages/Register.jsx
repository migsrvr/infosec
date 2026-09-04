import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Register() {
  const { register } = useAuth()
  const nav = useNavigate()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function onSubmit(e) {
    e.preventDefault()
    const res = register(username, email, password)
    if (!res.ok) {
      setError(res.error)
      return
    }
    nav(res.user.role === 'admin' ? '/admin' : '/dashboard')
  }

  return (
    <div className="card">
      <p className="kicker">02 / Enroll</p>
      <h2>Register (Phase 5 — secured)</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={onSubmit}>
        <label className="field">Username
          <input placeholder="Username (3-20 chars)" value={username} onChange={(e) => setUsername(e.target.value)} maxLength={20} />
        </label>
        <label className="field">Email
          <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={100} />
        </label>
        <label className="field">Password
          <input placeholder="Password (8+ chars, Aa + 0-9)" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <button type="submit">Create account</button>
      </form>
      <p><Link to="/login">Already have an account? Login</Link></p>
      <p className="hint">Stored as bcrypt hash — check Local Storage, no plaintext.</p>
    </div>
  )
}
