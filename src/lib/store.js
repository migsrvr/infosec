// Phase 3 VULNERABLE store — intentional flaws:
// - passwords stored in PLAINTEXT in localStorage
// - no input validation, no sanitization
// - predictable IDs, no lockout, no audit log

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

// Seed a default admin (plaintext!) so the admin panel can be demoed.
export function seedIfEmpty() {
  const users = getUsers()
  if (users.length === 0) {
    saveUsers([
      {
        id: 1,
        username: 'admin',
        email: 'admin@jru.edu',
        password: 'admin123', // VULNERABLE: plaintext + weak
        role: 'admin',
        disabled: false
      }
    ])
  }
}
