// Phase 5 SECURE store.
// Fixes vs Phase 3: bcrypt hashes (never plaintext for new accounts),
// random IDs, expiring random session tokens, lockout fields, audit support.
// Legacy Phase 3 plaintext accounts are migrated to hashes on next login.

import bcrypt from 'bcryptjs'

const USERS_KEY = 'securelogin_users'
const SESSION_KEY = 'securelogin_session'

export function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || []
  } catch {
    return []
  }
}

export function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY)) || null
  } catch {
    return null
  }
}

export function saveSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}

export function resetDemoData() {
  localStorage.removeItem(USERS_KEY)
  localStorage.removeItem(SESSION_KEY)
  localStorage.removeItem('securelogin_audit')
  seedIfEmpty()
}

// Seeded admin uses a bcrypt hash — no plaintext credential in storage.
export function seedIfEmpty() {
  const users = getUsers()
  if (users.length === 0) {
    saveUsers([
      {
        id: 'seed-admin-1',
        username: 'admin',
        email: 'admin@jru.edu',
        passwordHash: bcrypt.hashSync('admin123', 10),
        role: 'admin',
        disabled: false,
        failedAttempts: 0,
        lockUntil: 0
      }
    ])
  }
}
