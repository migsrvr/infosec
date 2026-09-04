import { Link, Route, Routes, useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import AdminPanel from './pages/AdminPanel.jsx'

// SECURE: login required for protected pages.
function ProtectedRoute({ children }) {
  const { currentUser } = useAuth()
  if (!currentUser) return <Navigate to="/login" replace />
  return children
}

// SECURE: admin role enforced at the router AND inside AdminPanel (defense in depth).
function AdminRoute({ children }) {
  const { currentUser } = useAuth()
  if (!currentUser) return <Navigate to="/login" replace />
  if (currentUser.role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  const { currentUser, logout } = useAuth()
  const nav = useNavigate()

  function onLogout() {
    logout()
    nav('/login')
  }

  return (
    <div className="app">
      <header>
        <h1>SecureLogin <span className="badge secure">Phase 5 — SECURE</span></h1>
        <nav>
          {currentUser ? (
            <>
              <span>{currentUser.username}</span>{' '}
              <Link to="/dashboard">Dashboard</Link>{' '}
              {currentUser.role === 'admin' && <Link to="/admin">Admin</Link>}{' '}
              <button onClick={onLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>{' '}
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
          />
          <Route
            path="/admin"
            element={<AdminRoute><AdminPanel /></AdminRoute>}
          />
        </Routes>
      </main>
      <footer>
        <p>ITC C303 — Lopez / Rivera / Santos — Phase 5: bcrypt hashing, validation, lockout, expiring tokens, audit log.</p>
      </footer>
    </div>
  )
}
