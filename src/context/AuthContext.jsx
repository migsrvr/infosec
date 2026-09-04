import { createContext, useContext, useEffect, useState } from 'react'
import { getUsers, saveUsers, getSession, saveSession, clearSession, seedIfEmpty } from '../lib/store.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    seedIfEmpty()
    // VULNERABLE: session is just { userId } in localStorage, no token, no expiry
    const s = getSession()
    if (s && s.userId) {
      const u = getUsers().find((x) => x.id === s.userId)
      if (u && !u.disabled) setCurrentUser(u)
    }
  }, [])

  // VULNERABLE: no validation, allows duplicates, weak passwords, plaintext storage
  function register(username, email, password) {
    const users = getUsers()
    const newUser = {
      id: Date.now(), // VULNERABLE: predictable ID
      username,
      email,
      password, // VULNERABLE: plaintext
      role: 'user',
      disabled: false
    }
    users.push(newUser)
    saveUsers(users)
    saveSession({ userId: newUser.id })
    setCurrentUser(newUser)
    return newUser
  }

  // VULNERABLE: no rate limiting, no lockout, tells attacker nothing but still brute-forceable
  function login(username, password) {
    const users = getUsers()
    const u = users.find((x) => x.username === username && x.password === password)
    if (!u) return { ok: false, error: 'Invalid credentials' }
    if (u.disabled) return { ok: false, error: 'Account disabled' }
    saveSession({ userId: u.id }) // VULNERABLE: no random token, no expiry
    setCurrentUser(u)
    return { ok: true, user: u }
  }

  function logout() {
    clearSession()
    setCurrentUser(null)
  }

  function refreshUser() {
    const s = getSession()
    if (s) {
      const u = getUsers().find((x) => x.id === s.userId)
      setCurrentUser(u || null)
    }
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
