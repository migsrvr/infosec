// Phase 5: audit trail (repudiation control). Stored in localStorage for demo;
// real apps append to a server-side, tamper-evident log.
const AUDIT_KEY = 'securelogin_audit'

export function logEvent(type, username, detail) {
  try {
    const events = getEvents()
    events.push({ at: new Date().toISOString(), type, username: username || '-', detail: detail || '' })
    localStorage.setItem(AUDIT_KEY, JSON.stringify(events.slice(-200)))
  } catch { /* storage full/blocked — demo only */ }
}

export function getEvents() {
  try {
    return JSON.parse(localStorage.getItem(AUDIT_KEY)) || []
  } catch {
    return []
  }
}

export function clearEvents() {
  localStorage.removeItem(AUDIT_KEY)
}
