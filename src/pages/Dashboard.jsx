import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Dashboard() {
  const { currentUser, logout } = useAuth()

  return (
    <div className="card">
      <p className="kicker">03 / Profile</p>
      <h2>Dashboard (protected)</h2>
      {currentUser ? (
        <>
          <p>Welcome, <b>{currentUser.username}</b>!</p>
          <dl className="spec">
            <div><dt>Username</dt><dd>{currentUser.username}</dd></div>
            <div><dt>Email</dt><dd>{currentUser.email}</dd></div>
            <div><dt>Role</dt><dd>{currentUser.role}</dd></div>
          </dl>
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
