import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getUsers, saveUsers, resetDemoData } from '../lib/store.js'
import { getEvents, clearEvents, logEvent } from '../lib/audit.js'
import { useAuth } from '../context/AuthContext.jsx'

// SECURE: route is also guarded by AdminRoute in App.jsx; this is defense-in-depth.
export default function AdminPanel() {
  const { currentUser, refreshUser } = useAuth()
  const [users, setUsers] = useState(() => getUsers())
  const [events, setEvents] = useState(() => getEvents())

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="card">
        <h2>Admin Panel</h2>
        <p className="error">Access denied. Admins only.</p>
        <p><Link to="/dashboard">Back to Dashboard</Link></p>
      </div>
    )
  }

  function reload() {
    setUsers([...getUsers()])
    setEvents([...getEvents()])
    refreshUser()
  }

  function toggleDisable(id) {
    const list = getUsers()
    const u = list.find((x) => x.id === id)
    if (u) {
      if (u.id === currentUser.id) return // cannot disable self
      u.disabled = !u.disabled
      if (u.disabled) u.sessionToken = null // kill their session
      saveUsers(list)
      logEvent(u.disabled ? 'disable' : 'enable', currentUser.username, `target=${u.username}`)
    }
    reload()
  }

  function removeUser(id) {
    const list = getUsers()
    const u = list.find((x) => x.id === id)
    if (u && u.id === currentUser.id) return // cannot delete self
    saveUsers(list.filter((x) => x.id !== id))
    if (u) logEvent('delete', currentUser.username, `target=${u.username}`)
    reload()
  }

  function onReset() {
    resetDemoData()
    clearEvents()
    window.location.reload()
  }

  return (
    <div className="card wide">
      <h2>Admin Panel (Phase 5 — access controlled)</h2>
      <p className="hint">Viewing as: {currentUser.username} (admin). Passwords are hashes — never displayed.</p>
      <table>
        <thead>
          <tr><th>Username</th><th>Email</th><th>Credential</th><th>Role</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.username}</td>
              <td>{u.email}</td>
              <td className="hint">{u.passwordHash ? `bcrypt:${u.passwordHash.slice(0, 12)}…` : 'legacy!'}</td>
              <td>{u.role}</td>
              <td>{u.disabled ? 'disabled' : u.lockUntil && Date.now() < u.lockUntil ? 'locked' : 'active'}</td>
              <td>
                <button onClick={() => toggleDisable(u.id)}>{u.disabled ? 'Enable' : 'Disable'}</button>{' '}
                <button onClick={() => removeUser(u.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Audit log (repudiation control)</h3>
      <table>
        <thead>
          <tr><th>Time</th><th>Event</th><th>User</th><th>Detail</th></tr>
        </thead>
        <tbody>
          {events.slice().reverse().map((e, i) => (
            <tr key={i}>
              <td>{e.at}</td>
              <td>{e.type}</td>
              <td>{e.username}</td>
              <td>{e.detail}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        <button onClick={onReset}>Reset demo data</button>{' '}
        <Link to="/dashboard">Back to Dashboard</Link>
      </p>
    </div>
  )
}
