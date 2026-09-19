# SecureLogin — Presentation Guide

**Lecturer:** Mr. Sherwin Gil Garcia — ITC C303-302I  
**Team:** Lopez, Kenji A. · Rivera, Miggy G. · Santos, Joshua Cyron S.  
**Course:** Computer Science and Engineering, Jose Rizal University  
**Date:** September 5, 2026  
**Repo:** `migsrvr/infosec` — branches `phase3` (vulnerable) + `phase5` (secure)

> Use this file as your **spoken script + click path** for the live laptop demo. No slides needed — the app + DevTools is the demo.

---

## 0. One-sentence pitch (say this first)

> SecureLogin lets a user register, log in to a protected dashboard/profile, and lets an admin list/disable users — built once insecurely to expose threats, then hardened. Both versions run from the same React codebase, same brutalist UI, only the stamp changes.

---

## 1. What you built (Phase 1 recap, 30s)

* **Purpose:** demonstrate auth mechanics + give a controlled target for STRIDE threat modeling.
* **Users:** End User (register / login / logout / profile) and Admin (list / disable / delete users).
* **Scope In:** local registration + login/logout + protected dashboard + admin panel. **Out:** MFA, email verification, mobile app.
* **CIA:** Confidentiality High, Integrity High, Availability Medium (student prototype).
* **Assumption to state out loud:** *React-only simulation* — `localStorage` stands in for DB, `bcryptjs` + token + audit run in-browser for demo. Production would move all of that server-side with HTTPS, HttpOnly cookies, and DB encryption.

---

## 2. System design (point at while you talk, 1 min)

**Trust boundary:** Browser is untrusted. Everything inside the app container (React App + AuthContext + localStorage "DB") is trusted *in the simulation*. In production that boundary moves to the server.

**Data flows to name-drop:**
1. Register: `Browser -> App -> store (users)` — password enters here.
2. Login: `Browser -> App -> session {userId/token/expiresAt}` — session leaves here.
3. Dashboard: `session -> guard -> profile data`
4. Admin: `session + role check -> user table + audit log`

Keep it monotone brutalist on both branches — paper `#f4f3ee`, ink `#131311`, 2–3px borders, system mono. `phase3` stamp = `PHASE 3 — VULNERABLE`, `phase5` stamp = `PHASE 5 — SECURE`. Same shell, contrast is in behavior.

---

## 3. Branches at a glance

| Branch | Intent | Password storage | Admin guard | Try this |
|---|---|---|---|---|
| `phase3` | Intentionally insecure (for Phase 4 STRIDE) | plaintext in `securelogin_users` | login-only, no role check | `alice / 123` succeeds |
| `phase5` | Hardened (Phase 5 re-design) | `bcrypt` hash, never shown | `AdminRoute` + in-page check | `bob / 123` rejected, `Bob12345` succeeds |

Both branches are already pushed. Switch live with git — no reinstall.

---

## 4. Setup (do before the prof arrives, 1 min)

```powershell
git clone https://github.com/migsrvr/infosec.git
cd infosec

# pick a branch
git checkout phase3   # or phase5
npm install
npm run dev
# open http://localhost:5173
```

**Seeded account on both branches:** `admin` / `admin123`  
**User account:** create at `/register` — on `phase3` any password works, on `phase5` use `Miggy1234` style (`8+ chars, upper + lower + number`).

> **If `admin/admin123` says "Invalid credentials" on `phase3`:** both branches share browser storage. On the Login page click **Reset demo data** (phase3) or use incognito / DevTools → Application → Local Storage → Delete `securelogin_users` + `securelogin_session` → reload.

---

## 5. Live demo script (8–10 min total)

### Part A — `phase3` vulnerable (4 min) — `git checkout phase3`

1. **Register weak** — `/register` → `alice / alice@test.com / 123` → succeeds. Say: *"No validation, duplicates allowed — that's flaw #1."*
2. **Show plaintext** — DevTools → Application → Local Storage → `securelogin_users` → point at `"password":"123"` + `"password":"admin123"`. Say: *"Confidentiality fail — anyone with DevTools reads credentials."*
3. **Dashboard leak** — go to `/dashboard` → "Your password (stored insecurely): 123". Say: *"Info disclosure in UI."*
4. **Broken access control** — as `alice` (role user), visit `/admin` → table of all users with plaintext passwords loads. Say: *"No RBAC — any logged-in user is admin."*
5. **Privilege escalation** — still as `alice`, edit Local Storage entry for `alice` → set `"role":"admin"` → reload → still on admin. Say: *"Client-side role trusted."*
6. **Brute force** — Logout → try login with wrong password 10× → no lockout. Say: *"No rate limiting."*

> Close with: *"All of these map 1:1 to STRIDE — we'll fix them on phase5."*

### Switch (30s) — do this live

```powershell
# in terminal, keep dev server running or restart
git checkout phase5
npm run dev
# if you see stale data: Admin → Reset demo data, or Login → Reset demo data
```

Say while it reloads: *"Same UI, same routes — only the security controls changed."*

### Part B — `phase5` secure (4 min) — `git checkout phase5`

1. **Validation** — try `bob / bob@test.com / 123` → error *"Password must be at least 8 chars..."* → retry `Bob12345` → succeeds. Say: *"Input validation + strength + uniqueness."*
2. **Hashed storage** — DevTools → `securelogin_users` → now `passwordHash:"$2b$10$..."`, no plaintext. Say: *"bcrypt cost 10 with salt."*
3. **No leak** — `/dashboard` → spec sheet shows username/email/role only + *"Session secured..."* — no password echoed. Say: *"Fixed info disclosure."*
4. **RBAC enforced** — as `bob` (user), click Dashboard → Admin link is hidden; manually visit `/admin` → redirected to dashboard / "Access denied". Edit Local Storage role to `admin` → refresh → still denied. Say: *"Route guard + in-page check + token re-validated."*
5. **Lockout** — Logout → login wrong 5× → *"Locked after too many attempts. Try again in 60s."* → show Audit log in `/admin` as admin. Say: *"Rate limit + audit trail."*
6. **Disable kills session** — as `admin` on `/admin` → Disable `bob` → his session token cleared. Say: *"Admin action invalidates session."*

### Part C — Wrap & STRIDE (1–2 min)

* Flip to the Before→After table below. Point: *"Every Phase 4 threat got one concrete control."*
* State the React-only caveat again (auditor will ask).
* Offer to show `git log --oneline` — commits prove `phase3` was frozen before `phase5`.

---

## 6. Before → After (read this table on screen)

| # | Phase 3 flaw | Phase 5 control | File |
|---|---|---|---|
| 1 | Plaintext `password` | `bcrypt.hashSync` cost 10, auto-migrates legacy accounts on login | `src/lib/auth.js`, `store.js`, `AuthContext.jsx` |
| 2 | No validation | `validateUsername/Email/Password` + `sanitize` + uniqueness | `src/lib/auth.js` |
| 3 | `123` allowed | `8+` + upper + lower + number | `validatePassword()` |
| 4 | Session `{userId}` predictable | `48-hex token` + `30-min expiry`, validated + rotated + cleared on logout | `newSessionToken()` |
| 5 | `/admin` = login-only | `AdminRoute` + hidden link + in-page role deny | `src/App.jsx`, `AdminPanel.jsx` |
| 6 | Unlimited logins | `5 fails -> 60s lock`, generic errors | `AuthContext.jsx` |
| 7 | No logs (repudiation) | `audit.js` — register/login-fail/lockout/logout/disable/delete | `src/lib/audit.js` |
| 8 | Passwords shown | Removed; admin sees `bcrypt:…` prefix only | `Dashboard.jsx`, `AdminPanel.jsx` |
| 9 | Disabled session lives | Disable clears `sessionToken`; guards re-check `disabled` | `AdminPanel.jsx` |

---

## 7. Mini STRIDE table (for your report / Q&A)

| Category | Example on phase3 | Risk | Fix on phase5 |
|---|---|---|---|
| **S**poofing | Brute-force login, no lockout | High | Lockout + generic errors |
| **T**ampering | Edit `localStorage role` to `admin` | High | Token + server-side role re-check |
| **R**epudiation | No record who disabled whom | Medium | Audit ledger |
| **I**nfo Disclosure | Plaintext in storage + UI | High | Hash + never display |
| **D**oS | Unlimited attempts ties up UI | Low | Lockout + expiry |
| **E**levation | Regular user loads `/admin` | High | `AdminRoute` + hide link |

---

## 8. Troubleshooting (say this if the demo glitches)

* **Stale storage after switching:** Login → **Reset demo data** → reload. Or incognito.
* **Port busy:** `npm run dev -- --port 5174`
* **Build check:** `npm run build` + `npm run preview` should serve `200`.
* **Verify branches:** `git branch` shows `* phase3` / `* phase5`, `git log --oneline -3` proves history.

---

## 9. What to say if asked

* **"Why not a real backend?"** — Requirement was `React JS only` + fastest laptop demo. We flagged the simulation and described the production move (HTTPS + HttpOnly + server bcrypt).
* **"Is bcrypt in-browser safe?"** — For this class demo yes; production must hash server-side so the hash never transits the client.
* **"Can phase3 be fixed by accident?"** — No, `phase3` is frozen at `595d2f2` (pre-fix). `phase5` diverged at `352bee4`.

---

## 10. Repo map

```
src/
  App.jsx              # routes + ProtectedRoute / AdminRoute
  context/AuthContext.jsx # login/register/logout + lockout + token
  lib/store.js         # localStorage "DB" + seed (plaintext vs hash)
  lib/auth.js          # phase5 only: validation, bcrypt, token
  lib/audit.js         # phase5 only: audit log
  pages/Login.jsx, Register.jsx, Dashboard.jsx, AdminPanel.jsx
  index.css            # Concrete Poster brutalist system (paper/ink, mono)
```

Good luck — switch branches live, keep DevTools open, and let the storage tell the story.
