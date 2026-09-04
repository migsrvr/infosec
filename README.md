# SecureLogin — Phase 3 (Vulnerable Prototype)

ITC C303 - 302I | Lopez, Kenji A. / Rivera, Miggy G. / Santos, Joshua Cyron S.
Instructor: Mr. Sherwin Gil Garcia

> Intentionally INSECURE — for threat modeling (Phase 4). Do NOT use as real auth.

## Run (live demo)

```powershell
npm install
npm run dev
```

Open http://localhost:5173

Seeded admin: `admin` / `admin123`

## Demo flow (3 min)

1. Register `alice / alice@test.com / 123` — succeeds (no validation).
2. DevTools > Application > Local Storage > `securelogin_users` — passwords in PLAINTEXT.
3. Dashboard shows your own password back (info disclosure).
4. Visit `/admin` as regular user — allowed (broken access control).
5. In Local Storage, edit your user `role` to `admin`, refresh — privilege escalation.
6. Login has unlimited attempts — brute force possible.

## Vulnerabilities left in on purpose

- Plaintext passwords in localStorage
- No input validation / weak passwords allowed / duplicates allowed
- Session = `{ userId }` only, predictable ID, no token, no expiry
- `/admin` guarded only by "logged in", no role check
- No rate limit / lockout, no audit log

## Branches

- `main` = Phase 3 vulnerable (frozen)
- `phase5-secure` (next) = fixed version with hashing, validation, lockout, proper guards
