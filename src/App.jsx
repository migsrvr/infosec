import { Link, Route, Routes, useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import AdminPanel from './pages/AdminPanel.jsx'

// VULNERABLE: ProtectedRoute only checks "logged in", never role/expiry/token.
function ProtectedRoute({ children }) {
  const { currentUser } = useAuth()
  if (!currentUser) return <Navigate to="/login" replace />
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
        <h1>SecureLogin <span className="badge">Phase 3 — VULNERABLE</span></h1>
        <nav>
          {currentUser ? (
            <>
              <span>{currentUser.username}</span>{' '}
              <Link to="/dashboard">Dashboard</Link>{' '}
              <Link to="/admin">Admin</Link>{' '}
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
          {/* VULNERABLE: /admin uses same weak guard — no admin check */}
          <Route
            path="/admin"
            element={<ProtectedRoute><AdminPanel /></ProtectedRoute>}
          />
        </Routes>
      </main>
      <footer>
        <p>ITC C303 — Lopez / Rivera / Santos — Phase 3 intentionally insecure: plaintext passwords, no validation.</p>
      </footer>
    </div>
  )
}
