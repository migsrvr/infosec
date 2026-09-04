import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getUsers, saveUsers } from '../lib/store.js'
import { useAuth } from '../context/AuthContext.jsx'

// VULNERABLE: no real access control — any logged-in (or manipulated) user sees this page.
export default function AdminPanel() {
  const { currentUser, refreshUser } = useAuth()
  const [users, setUsers] = useState(() => getUsers())

  function reload() {
    setUsers([...getUsers()])
    refreshUser()
  }

  function toggleDisable(id) {
    const list = getUsers()
    const u = list.find((x) => x.id === id)
    if (u) u.disabled = !u.disabled
    saveUsers(list)
    reload()
  }

  function removeUser(id) {
    saveUsers(getUsers().filter((x) => x.id !== id))
    reload()
  }

  return (
    <div className="card wide">
      <p className="kicker">04 / Control — User registry</p>
      <h2>Admin Panel (Phase 3 — no access control)</h2>
      <p className="hint">Viewing as: {currentUser ? `${currentUser.username} (${currentUser.role})` : 'guest'}</p>
      <table>
        <thead>
          <tr><th>ID</th><th>Username</th><th>Email</th><th>Password (plaintext!)</th><th>Role</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.username}</td>
              <td>{u.email}</td>
              <td>{u.password}</td>
              <td>{u.role}</td>
              <td>{u.disabled ? 'disabled' : 'active'}</td>
              <td>
                <button onClick={() => toggleDisable(u.id)}>{u.disabled ? 'Enable' : 'Disable'}</button>{' '}
                <button onClick={() => removeUser(u.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p><Link to="/dashboard">Back to Dashboard</Link></p>
    </div>
  )
}
