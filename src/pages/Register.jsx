import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Register() {
  const { register } = useAuth()
  const nav = useNavigate()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function onSubmit(e) {
    e.preventDefault()
    // VULNERABLE: no validation at all — empty, weak, duplicate all allowed
    const u = register(username, email, password)
    if (u.role === 'admin') nav('/admin')
    else nav('/dashboard')
  }

  return (
    <div className="card">
      <p className="kicker">02 / Enroll</p>
      <h2>Register (Phase 3 — insecure)</h2>
      <form onSubmit={onSubmit}>
        <label className="field">Username
          <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        </label>
        <label className="field">Email
          <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="field">Password
          <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <button type="submit">Create account</button>
      </form>
      <p><Link to="/login">Already have an account? Login</Link></p>
    </div>
  )
}
