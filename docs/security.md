# Security hardening — P0

This document describes the security changes on the P0 branch. The project remains an academic, collaborative application. This is not a claim of production readiness or a full penetration test.

## Account and access policy

| Operation | Allowed access |
|---|---|
| `POST /api/auth/register` | Public; creates only a Driver with team 0 (unassigned). Role/team escalation is rejected. |
| `POST /api/users/accounts` | Existing authenticated Admin; can create Admin/Engineer/Driver accounts. Engineer requires a positive team ID. |
| Assign a user/driver team, create driver profiles, change driver skill | Admin only |
| Create/delete circuits, execute simulations, list eligible simulation cars | Admin only |
| Purchase inventory, inspect balances and inventory | Admin or Engineer; existing team ownership restrictions apply |
| Read car setups | Admin or Engineer belonging to the car's team, checked before any setup creation |
| Read simulation results and piece snapshots | Admin sees all; Engineer/Driver sees its team's participants only |
| List driver profiles | Admin sees all; Engineer sees its own team |

Existing account roles are not changed. The public registration screen no longer offers management roles. An existing Admin can use `POST /api/users/accounts` with `nombre`, `email`, `password`, `rol` and `id_equipo`. There is no public first-admin bypass. If a development database has no usable Admin, a trusted database administrator must provision one separately; fixing the complete bootstrap is outside this P0 block.

## User data, sessions and errors

User responses are built from an explicit field allowlist, including login, profile and user listings. Password hashes and future secret fields are excluded. Login errors do not distinguish unknown users from incorrect passwords.

Every protected request checks session format, expiration, current user activity and role against the database. Cookie and database session lifetimes share `SESSION_TIMEOUT`; cookies retain HttpOnly, SameSite=Lax and Secure in production.

Logs omit session identifiers, authentication bodies, request query strings and raw database error messages. Clients receive fixed messages for expected errors and generic messages for internal failures. Malformed JSON and oversized requests receive safe 400/413 responses.

## Local configuration changes

- Copy `backend/.env.example` to `backend/.env` and replace its placeholders. Missing credentials and unchanged placeholders prevent startup. The HTTP listener starts only after SQL connects successfully.
- SQL connections default to encryption and certificate validation. `DB_TRUST_SERVER_CERTIFICATE=true` is an explicit development-only exception for a local self-signed server; insecure settings are rejected in production.
- Configure exact frontend origins in `FRONTEND_ORIGINS`; there is no blanket allowance for private-network addresses. Production requires explicit HTTPS origins. The same CORS policy handles preflight and actual requests.
- Copy `grafana/.env.example` to `grafana/.env`. Supply separate Grafana administrator and read-only SQL credentials. Provisioning reads the SQL password from the environment. Grafana binds to loopback, and anonymous access/public sign-up are disabled.
- Historical credentials have been removed from the current files, but old Git commits still contain them. Their current activity is **not confirmed**. Do not reuse them; history rewriting requires a separate coordinated decision.
- Existing Grafana volumes retain their administrator credentials; environment defaults do not rotate those credentials.

## Verification

From `backend`, run `npm ci` then `npm test` (Node's built-in test runner). Tests exercise the real Express routes, authentication services and Argon2, with doubles at the SQL/model boundary. They cover privilege escalation, role/ownership checks, user-field filtering, session revocation checks, error/log redaction and exact-origin CORS.

These tests do not establish end-to-end SQL Server or Grafana behavior. Live database integration, deployment certificate configuration and the full database bootstrap remain to be validated separately.

## Remaining security work

- Compatible backend dependency patches reduce the initial production audit from 13 to 7 reported package vulnerabilities. The remaining report includes 1 critical and 1 high in the `tar` / `@mapbox/node-pre-gyp` installation chain, plus 5 moderate reports in the SQL driver/Azure dependency chain. These package advisories are not proof of an exploitable API route. Further fixes require reviewing upstream replacements rather than forcing untested transitive overrides.
- Rate limiting / brute-force defenses and account recovery are not implemented in this block.
- Concurrency and budget/stock invariants need database integration tests and a focused SQL review.
- Validate least-privilege database grants and Grafana datasource access in the actual installation; application role checks do not protect direct database access.
- Dependencies in the frontend build toolchain and the unpinned Grafana image/plugins require a separate dependency review.

Relevant advisories: [node-tar](https://github.com/advisories/GHSA-34x7-hfp2-rc4v), [Azure Identity](https://github.com/advisories/GHSA-m5vv-6r4h-3vj9), [uuid](https://github.com/advisories/GHSA-w5hq-g745-h8pq).
