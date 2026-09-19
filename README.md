# SecureLogin — Simple User Authentication System

**ITC C303-302I — Information Technology 1**  
**Team:** Lopez, Kenji A. · Rivera, Miggy G. · Santos, Joshua Cyron S.  
**Lecturer:** Mr. Sherwin Gil Garcia — Jose Rizal University, CSE — Sept 5, 2026  
**Repo:** `migsrvr/infosec` — `phase3` = vulnerable prototype, `phase5` = secured redesign  
**Stack:** React (Vite + `react-router-dom`) · `localStorage` as simulated DB · `bcryptjs` on `phase5` only · System mono, monotone brutalist UI (offline-safe)

> Both branches share the **same shell** (paper `#f4f3ee` / ink `#131311`, 2–3px borders, stamp: `PHASE 3 — VULNERABLE` vs `PHASE 5 — SECURE`). The difference is **behavior**, not layout.

---

## Branches

```powershell
git clone https://github.com/migsrvr/infosec.git
cd infosec
git checkout phase3   # vulnerable — for threat modeling
# or
git checkout phase5   # secured — for re-design
npm install
npm run dev           # http://localhost:5173
```

Seeded admin on **both**: `admin` / `admin123`

| Branch | Commit (HEAD) | Purpose |
|---|---|---|
| `phase3` | `c49d000` | Phase 3: working prototype, intentionally insecure |
| `phase5` | `15b618e` | Phase 5: same flows, hardened |

> They share `localStorage` keys (`securelogin_users`, `securelogin_session`). After switching branches click **Reset demo data** on Login (or use incognito) for a clean seed.

---

## Phase 3 — Vulnerable Prototype

**Intent:** satisfy Phase 1 features with the weakest possible controls so Phase 4 STRIDE is easy to demonstrate. Freezes flaws on purpose.

**Own features (all client-side):**

* **Register** — `src/pages/Register.jsx:13` — accepts any username/email/password, no checks, allows duplicates and `123`.
* **Login** — `src/pages/Login.jsx:14` — exact `username === input && password === input` match (`src/context/AuthContext.jsx:40`), unlimited attempts, generic errors.
* **Session** — `src/context/AuthContext.jsx:12` + `src/lib/store.js:30` — `{ userId }` only, stored in `localStorage`, predictable `Date.now()` ID, no token, no expiry.
* **Dashboard (Profile)** — `src/pages/Dashboard.jsx` — protected by `ProtectedRoute` login-only check (`src/App.jsx:8`), shows `username / email / role` **and echoes your plaintext password** (intentional leak).
* **Admin Panel** — `src/pages/AdminPanel.jsx` — lists all users with **plaintext `password` column**, buttons Disable/Delete, **no role guard** (same `ProtectedRoute` as Dashboard, comment in `src/App.jsx:53`), link visible to every logged-in user.
* **Storage** — `src/lib/store.js:41` — seeded `admin@jru.edu / admin123` in plaintext.

**Flaws left in (for the report):** plaintext credentials, no validation, weak passwords, no RBAC, predictable session, no lockout, passwords displayed, no audit log, disabled sessions stay valid.

---

## Phase 5 — Secured Redesign

**Intent:** fix every Phase 3 flaw with one concrete control each, same routes and UX, no UI logic drift.

**Own features (hardened):**

* **Register** — `src/pages/Register.jsx` (+ `src/lib/auth.js`) — `sanitize()` strips `<>\"'&`, `validateUsername` (3–20, `a-z0-9_.-`), `validateEmail`, `validatePassword` (8+ with upper/lower/number), uniqueness on username + email, hashes with `bcrypt.hashSync(...,10)` into `passwordHash`, never stores plaintext, auto-generates `newSessionToken()` (48-hex) + `30-min expiry`.
* **Login** — `src/context/AuthContext.jsx:30` — case-insensitive lookup, `verifyPassword()` (bcrypt or legacy plaintext for migration), `5 fails → 60s lockout` (`MAX_LOGIN_ATTEMPTS`, `LOCK_MS`), generic `"Invalid credentials"` to avoid enumeration, on success migrates legacy `password → passwordHash`, rotates token, logs event.
* **Session** — `src/lib/store.js:6` + `src/context/AuthContext.jsx:15` — `{ userId, token, expiresAt }`, validated on restore (`token === user.sessionToken && now < expiresAt && !disabled`), cleared on expiry/logout/disable.
* **Dashboard** — `src/pages/Dashboard.jsx` — spec sheet `USERNAME / EMAIL / ROLE` only, success bar `"Session secured: random token + 30-min expiry. No password shown."`, Admin link **hidden** unless `role === 'admin'`.
* **Admin Panel** — `src/pages/AdminPanel.jsx` + `src/App.jsx:16` — `AdminRoute` (router) + in-page deny (`"Access denied. Admins only."`), table shows `bcrypt:<hash…>` never plaintext, status shows `locked` when `lockUntil` active, Disable clears `sessionToken`, cannot disable/delete self, **Audit ledger** (`src/lib/audit.js`) — `register / login / login-fail / lockout / logout / disable / enable / delete` with timestamp.
* **Storage** — `src/lib/store.js:42` — seeded admin as `bcrypt.hashSync("admin123",10)`, adds `failedAttempts`, `lockUntil`, `sessionToken`.

New libs on `phase5` only: `src/lib/auth.js`, `src/lib/audit.js`.

---

## Similarities (same on both)

* Same **stack** — Vite React + `react-router-dom`, no backend, `localStorage` DB, `Context` session manager.
* Same **routes** — `/login`, `/register`, `/dashboard` (ProtectedRoute), `/admin` (same path, different guard).
* Same **user model shape** — `id, username, email, role, disabled` + password field (plaintext vs hash variant).
* Same **pages & flows** — register → auto-login → dashboard; login → role-based redirect; logout clears session; admin lists/disable/delete.
* Same **design system** — Concrete Poster monotone brutalist: paper/ink, 2–3px ink borders, hard `6px` shadows, radius `0`, system `ui-monospace`, numbered kickers `01/ACCESS`–`05/LEDGER`, inverted table headers, spec-strip footer.
* Same **seed identities** — `admin` exists on both, same email `admin@jru.edu`.
* Same **RBAC surface** — every user has a profile (Dashboard), admin has the separate control panel — only enforcement differs.

---

## Differences

| Area | `phase3` (vulnerable) | `phase5` (secure) |
|---|---|---|
| **Password storage** | `password: "admin123"` plaintext in `securelogin_users` (`store.js:46`) | `passwordHash: "$2b$10$..."` bcrypt + salt, legacy plaintext auto-migrated on next login |
| **Input handling** | No validation, no sanitization, duplicates allowed | `sanitize()` + `validate*()` + uniqueness checks |
| **Password rules** | Any string, even `123` | `8+` + upper + lower + number |
| **User ID** | `Date.now()` predictable | `crypto.randomUUID()` random |
| **Session** | `{ userId }` only, never expires | `{ userId, token(48-hex), expiresAt }`, 30-min, validated on every restore |
| **Admin guard** | `ProtectedRoute` (login-only), link always visible | `AdminRoute` + in-page deny + link hidden for non-admins |
| **Priv. escalation** | Edit `localStorage role:"admin"` → admin | Token/role re-checked against stored `sessionToken`; edited role still denied |
| **Login brute force** | Unlimited attempts | `5 fails → 60s lock` + countdown + `lockout` audit event |
| **Error messages** | Direct | Generic, no user enumeration |
| **Password visibility** | Shown on Dashboard + Admin table | Never shown; admin sees `bcrypt:abc…` prefix only |
| **Disable behavior** | Flips flag only, session stays valid | Clears `sessionToken` (kills session), guards re-check `disabled` |
| **Audit** | None | `securelogin_audit` ledger (last 200 events), viewed on Admin, "Reset demo data" clears it |
| **Reset** | Login → Reset demo data (added `151e890` to fix cross-branch stale hash) | Admin → Reset demo data + Login parity |

---

## Quick demo (if presenting)

* **On `phase3`:** register `alice / alice@test.com / 123` → DevTools → `securelogin_users` shows plaintext → `/dashboard` echoes password → `/admin` as user succeeds → edit `role` to `admin` → stays admin.
* **Switch:** `git checkout phase5` → **Reset demo data** → same steps: `bob / 123` rejected → `Bob12345` ok → storage shows `passwordHash` → `/dashboard` hides password → `/admin` as user denied → 5 wrong logins → lockout + ledger.

---

## Credentials

* Admin: `admin` / `admin123` (plaintext on `phase3`, hash on `phase5`)
* User: create at `/register` — `phase3` any password, `phase5` e.g. `Miggy1234`

If `admin/admin123` fails on `phase3` after touching `phase5`, click **Reset demo data** on Login — both branches share the same browser storage.

---

## Assumptions

* React-only simulation. Production would move hashing, session, and audit server-side with HTTPS + HttpOnly cookies + DB encryption at rest.
* Out of scope: MFA, email verification, mobile app (per Phase 1).

---

## Repo map

```
src/
  App.jsx                # routes; phase3 ProtectedRoute / phase5 AdminRoute
  context/AuthContext.jsx# phase3 plaintext logic / phase5 lockout+token
  lib/store.js           # phase3 plaintext seed / phase5 hash seed
  lib/auth.js            # phase5 only — validation, bcrypt, token
  lib/audit.js           # phase5 only — audit log
  pages/Login.jsx, Register.jsx, Dashboard.jsx, AdminPanel.jsx
  index.css              # Concrete Poster tokens (shared)
```
