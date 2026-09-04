import bcrypt from 'bcryptjs'

// Phase 5 security controls (simulated client-side; real apps do this server-side).
export const MAX_LOGIN_ATTEMPTS = 5
export const LOCK_MS = 60 * 1000 // 1 minute lockout (demo-friendly)
export const SESSION_TTL_MS = 30 * 60 * 1000 // 30 minute session expiry

export function sanitize(str) {
  return String(str ?? '').trim().replace(/[<>"'&]/g, '')
}

export function validateUsername(username) {
  const u = sanitize(username)
  if (u.length < 3) return 'Username must be at least 3 characters.'
  if (u.length > 20) return 'Username must be at most 20 characters.'
  if (!/^[a-zA-Z0-9_.-]+$/.test(u)) return 'Username may only contain letters, numbers, _ . -'
  return null
}

export function validateEmail(email) {
  const e = sanitize(email)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)) return 'Enter a valid email address.'
  if (e.length > 100) return 'Email is too long.'
  return null
}

export function validatePassword(password) {
  const p = String(password ?? '')
  if (p.length < 8) return 'Password must be at least 8 characters.'
  if (!/[A-Z]/.test(p)) return 'Password needs an uppercase letter.'
  if (!/[a-z]/.test(p)) return 'Password needs a lowercase letter.'
  if (!/[0-9]/.test(p)) return 'Password needs a number.'
  return null
}

export function hashPassword(password) {
  return bcrypt.hashSync(password, 10) // bcrypt salt built in
}

// Handles both new hashes and legacy Phase 3 plaintext (for migration).
export function verifyPassword(input, user) {
  if (user.passwordHash) return bcrypt.compareSync(input, user.passwordHash)
  if (user.password) return input === user.password // legacy plaintext
  return false
}

export function newId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `${Date.now()}-${Math.floor(Math.random() * 1e9)}`
}

export function newSessionToken() {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = crypto.getRandomValues(new Uint8Array(24))
    return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}
