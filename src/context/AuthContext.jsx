import { createContext, useContext, useEffect, useState } from 'react'
import { getUsers, saveUsers, getSession, saveSession, clearSession, seedIfEmpty } from '../lib/store.js'
import {
  sanitize, validateUsername, validateEmail, validatePassword,
  hashPassword, verifyPassword, newId, newSessionToken,
  MAX_LOGIN_ATTEMPTS, LOCK_MS, SESSION_TTL_MS
} from '../lib/auth.js'
import { logEvent } from '../lib/audit.js'

const AuthContext = createContext(null)

function toPublicUser(u) {
  if (!u) return null
  const { password, passwordHash, failedAttempts, lockUntil, ...pub } = u
  return pub
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    seedIfEmpty()
    // Restore only a valid, unexpired, matching-token session
    const s = getSession()
    if (s && s.userId && s.token && s.expiresAt && Date.now() < s.expiresAt) {
      const u = getUsers().find((x) => x.id === s.userId)
      if (u && !u.disabled && u.sessionToken === s.token) setCurrentUser(toPublicUser(u))
      else clearSession()
    } else if (s) {
      clearSession() // expired or malformed — fail closed
    }
  }, [])

  function register(username, email, password) {
    username = sanitize(username)
    email = sanitize(email)

    const err =
      validateUsername(username) || validateEmail(email) || validatePassword(password)
    if (err) return { ok: false, error: err }

    const users = getUsers()
    if (users.some((x) => x.username.toLowerCase() === username.toLowerCase()))
      return { ok: false, error: 'Username already taken.' }
    if (users.some((x) => x.email.toLowerCase() === email.toLowerCase()))
      return { ok: false, error: 'Email already registered.' }

    const token = newSessionToken()
    const newUser = {
      id: newId(), // random, not predictable
      username,
      email,
      passwordHash: hashPassword(password), // never store plaintext
      role: 'user',
      disabled: false,
      failedAttempts: 0,
      lockUntil: 0,
      sessionToken: token
    }
    users.push(newUser)
    saveUsers(users)
    saveSession({ userId: newUser.id, token, expiresAt: Date.now() + SESSION_TTL_MS })
    setCurrentUser(toPublicUser(newUser))
    logEvent('register', username, 'account created')
    return { ok: true, user: toPublicUser(newUser) }
  }

  function login(username, password) {
    username = sanitize(username)
    const users = getUsers()
    const u = users.find((x) => x.username.toLowerCase() === username.toLowerCase())
    if (!u) {
      logEvent('login-fail', username, 'unknown user')
      return { ok: false, error: 'Invalid credentials' } // generic — no user enumeration
    }
    if (u.disabled) {
      logEvent('login-fail', u.username, 'disabled account')
      return { ok: false, error: 'Account disabled' }
    }
    if (u.lockUntil && Date.now() < u.lockUntil) {
      const secs = Math.ceil((u.lockUntil - Date.now()) / 1000)
      return { ok: false, error: `Locked after too many attempts. Try again in ${secs}s.` }
    }

    if (!verifyPassword(password, u)) {
      u.failedAttempts = (u.failedAttempts || 0) + 1
      if (u.failedAttempts >= MAX_LOGIN_ATTEMPTS) {
        u.lockUntil = Date.now() + LOCK_MS
        u.failedAttempts = 0
        saveUsers(users)
        logEvent('lockout', u.username, `${MAX_LOGIN_ATTEMPTS} failed attempts`)
        return { ok: false, error: 'Locked after too many attempts. Try again in 60s.' }
      }
      saveUsers(users)
      logEvent('login-fail', u.username, `attempt ${u.failedAttempts}/${MAX_LOGIN_ATTEMPTS}`)
      return { ok: false, error: 'Invalid credentials' }
    }

    // Success — migrate legacy plaintext to hash if needed, reset lockout, rotate token
    if (!u.passwordHash && u.password) {
      u.passwordHash = hashPassword(password)
      delete u.password
      logEvent('migrate', u.username, 'plaintext password upgraded to bcrypt hash')
    }
    u.failedAttempts = 0
    u.lockUntil = 0
    const token = newSessionToken()
    u.sessionToken = token
    saveUsers(users)
    saveSession({ userId: u.id, token, expiresAt: Date.now() + SESSION_TTL_MS })
    setCurrentUser(toPublicUser(u))
    logEvent('login', u.username, 'success')
    return { ok: true, user: toPublicUser(u) }
  }

  function logout() {
    const s = getSession()
    if (s) {
      const users = getUsers()
      const u = users.find((x) => x.id === s.userId)
      if (u) {
        u.sessionToken = null // invalidate server-side copy
        saveUsers(users)
        logEvent('logout', u.username, 'session ended')
      }
    }
    clearSession()
    setCurrentUser(null)
  }

  function refreshUser() {
    const s = getSession()
    if (s && s.expiresAt && Date.now() < s.expiresAt) {
      const u = getUsers().find((x) => x.id === s.userId)
      if (u && !u.disabled && u.sessionToken === s.token) {
        setCurrentUser(toPublicUser(u))
        return
      }
    }
    clearSession()
    setCurrentUser(null)
  }

  return (
    <AuthContext.Provider value={{ currentUser, register, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
