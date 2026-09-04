import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Dashboard() {
  const { currentUser, logout } = useAuth()

  return (
    <div className="card">
      <h2>Dashboard (protected)</h2>
      {currentUser ? (
        <>
          <p>Welcome, <b>{currentUser.username}</b>!</p>
          <p>Email: {currentUser.email}</p>
          <p>Role: {currentUser.role}</p>
          <p className="hint">Your password (stored insecurely): {currentUser.password}</p>
          <button onClick={logout}>Logout</button>
          <p><Link to="/admin">Go to Admin Panel</Link> (VULNERABLE: link visible to all)</p>
        </>
      ) : (
        <p>Not logged in. <Link to="/login">Login</Link></p>
      )}
    </div>
  )
}
