# SecureLogin — Phase 5 (Secured Redesign)

ITC C303 - 302I | Lopez, Kenji A. / Rivera, Miggy G. / Santos, Joshua Cyron S.
Instructor: Mr. Sherwin Gil Garcia

Branch: `phase5` (hardened). Compare with `phase3` (vulnerable).

## Run (live demo)

```powershell
npm install
npm run dev
```

Open http://localhost:5173

Seeded admin: `admin` / `admin123` (now stored as bcrypt hash, not plaintext).

## What was fixed (Before → After)

| # | Phase 3 flaw | Phase 5 control | Where |
|---|---|---|---|
| 1 | Plaintext passwords in storage | bcrypt hash + salt (`bcryptjs`, cost 10), never store/display plaintext; legacy plaintext auto-migrated on login | `src/lib/auth.js`, `src/lib/store.js`, `AuthContext.jsx` |
| 2 | No input validation | Username/email/password rules, uniqueness checks, sanitization (strip `<>\"'&`) | `src/lib/auth.js` |
| 3 | Weak passwords allowed (`123`) | Min 8 chars + upper + lower + number | `validatePassword()` |
| 4 | Predictable session (`{userId}`) | Random 48-hex-char token + 30-min expiry, validated + invalidated on logout | `newSessionToken()`, session `{userId, token, expiresAt}` |
| 5 | `/admin` open to any logged-in user | `AdminRoute` (router) + in-page role check + admin link hidden for non-admins | `src/App.jsx`, `AdminPanel.jsx` |
| 6 | Unlimited login attempts | 5 fails → 60s lockout, generic error messages (no user enumeration) | `AuthContext.jsx` login |
| 7 | No audit trail (repudiation) | Audit log: register/login-fail/login/lockout/logout/disable/delete | `src/lib/audit.js`, Admin panel viewer |
| 8 | Passwords displayed in UI + admin table | Removed everywhere; admin sees only `bcrypt:…` prefix | `Dashboard.jsx`, `AdminPanel.jsx` |
| 9 | Disabled user session stays valid | Disable clears `sessionToken`; guards re-check `disabled` | `AdminPanel.jsx`, `AuthContext.jsx` |

## Demo flow (3 min, mirrors Phase 3 attacks)

1. Register `bob / bob@test.com / 123` → rejected (weak). Retry `Bob12345` → succeeds.
2. DevTools > Local Storage > `securelogin_users` → `passwordHash: $2b$10$…`, no plaintext.
3. Login wrong 5× → locked 60s (shows lockout + audit event).
4. As `bob`, visit `/admin` → redirected to dashboard + "Access denied".
5. Edit Local Storage role to `admin`, refresh → still denied (token/role re-checked from guarded context; route requires admin).
6. As admin: disable `bob` → his session dies; audit log shows all events.

## Assumptions (for report)

- React-only simulation: hashing/session/audit run client-side for demo. Production must move these server-side with HTTPS + HttpOnly cookies + DB at rest encryption.
- No MFA / email verification (out of scope per Phase 1).
