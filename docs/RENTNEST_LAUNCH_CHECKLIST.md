# RentNest Launch Checklist

Last updated: 2026-11-10 · Frontend `raidislam/rentnest-front` · Backend `raidislam/rentnest`

Statuses: **PASS** · **FAIL** · **BLOCKED** · **NOT TESTED**

> No secrets appear in this document. Never paste passwords, tokens, connection strings or store passwords into it.

## Current verdict: **READY FOR PREVIEW QA** (not production)

Production is blocked by: an **active, publicly exposed admin credential** (rotation not authorized), and the **backend changes not yet deployed** (deployment requires explicit permission). Because of that, the deployed backend still answers SSLCommerz callbacks with JSON instead of sending the user back to the frontend. The **SSLCommerz Sandbox payment passed end to end on 2026-11-10** (Gate 2, see §5).

---

## 1. Work completed in this phase

### Backend (`D:\rentnest\rentnest`, uncommitted, not pushed, not deployed)

| Change | Files |
|---|---|
| Payment callbacks redirect the browser with **HTTP 303** to `{FRONTEND_URL}/payment/success?tran_id=…` (success; also when validation fails, so the frontend shows the real status) or `{FRONTEND_URL}/payment/cancel?tran_id=…` (fail/cancel; success page if the payment is already COMPLETED). Targets are built only from the server-side `FRONTEND_URL` origin; `tran_id` is included only if well-formed. **Without `FRONTEND_URL` the previous JSON responses are unchanged.** SSLCommerz validation (`confirmPayment`, `handlePaymentCallback`) is untouched. IPN unchanged. | `src/app/modules/payment/payment.controller.ts`, `src/config/frontend.ts` |
| **CORS** limited to `FRONTEND_URL` + optional `CORS_ORIGINS` when configured (other origins get no CORS headers; nothing is rejected, so SSLCommerz posts and server-to-server calls keep working). Not configured → previous open policy. | `src/app.ts`, `src/config/frontend.ts` |
| **Login rate limiting**: 10 failed logins per email per 15 minutes → `429` + `Retry-After`; success resets. Per email (the frontend logs in from its server, so per-IP would group all users). In-memory per instance. | `src/app/middlewares/loginRateLimit.ts`, `src/app/modules/auth/auth.route.ts` |
| **Credentials removed from tracked files**: `.env.example` rewritten with placeholders (new `FRONTEND_URL`, `CORS_ORIGINS`, `SEED_*_PASSWORD`); `prisma/seed.ts` reads seed passwords from env (min 12 chars) instead of hardcoding them. | `.env.example`, `prisma/seed.ts` |
| **Admin password rotation script** (prepared, **not executed**): updates one ADMIN user's password hash; reads the new password from env, never prints it. | `scripts/rotate-admin-password.ts`, `package.json` (`rotate:admin-password`) |
| **Automated tests** (Node test runner via existing `tsx`, no new dependencies): redirect builder, CORS origins, rate limiter, HTTP-level callbacks. DB forced to an unreachable local address. | `src/**/*.test.ts`, `package.json` (`test`), `tsconfig.json` (tests excluded from build) |
| Postman collection: callback descriptions (303 behavior) and login 429 note. **Re-publish the documenter page from Postman.** | `postman/RentNest.postman_collection.json` |

### Frontend (`D:\rentnest\RentNest_UI\rentnest`, uncommitted, not pushed, not deployed)

| Change | Files |
|---|---|
| Payment redirect guard is **sandbox-only by default**: only `https://sandbox.sslcommerz.com` unless `NEXT_PUBLIC_SSLCOMMERZ_MODE=live`, which allows only `https://securepay.sslcommerz.com`. | `lib/payments.ts`, `.env.example` |
| Unit tests for the guard (`npm test`). | `lib/payments.test.mjs`, `package.json` |
| This checklist and the full-flow QA guide. | `docs/` |
| Earlier, still uncommitted: Batch 4 (reviews, admin, categories) and the mock cleanup. | see `git status` |

---

## 2. Security findings

| # | Finding | Status | Owner / action |
|---|---|---|---|
| S1 | **Admin credential publicly exposed** in the backend repo (`.env.example`, `prisma/seed.ts`) and git history. **Verified ACTIVE** on the deployed backend (login succeeded with role ADMIN on 2026-11-10; token discarded). | **BLOCKED** – rotation awaiting approval | Backend dev / you. See §3. |
| S2 | Seeded LANDLORD and TENANT passwords were hardcoded in `prisma/seed.ts` (public). Not tested. | **BLOCKED** | Rotate or ban those seed accounts if they exist in production. |
| S3 | History scan (62 commits, all branches): **no real DATABASE_URL, JWT_SECRET or SSLCommerz store password ever committed**; `.env` never committed. Postgres URLs in `.agents/` skill docs are vendor examples. | **PASS** | — |
| S4 | Credentials removed from all tracked files (verified by scan). Git history still contains the admin password. | **PASS** (files) / **BLOCKED** (history) | Rotation makes the history value useless; optionally purge history (`git filter-repo`) and force-push — needs your approval. |
| S5 | JWT in HttpOnly, SameSite=Lax cookie (Secure in production); never readable by browser JS; not in the client bundle (bundle scan). | **PASS** | — |
| S6 | Backend URL server-only; pass-through allowlist (28 documented routes); login/register never pass through; cross-site writes rejected (Origin / Sec-Fetch-Site). | **PASS** | — |
| S7 | Role protection: proxy + `requireUser(role)` on every dashboard page; backend `authenticate` + `requireTenant/Landlord/Admin` on every protected route; live checks: tenant→landlord 403, landlord→tenant 403, tenant/landlord→admin 403, missing/invalid token 401. | **PASS** | — |
| S8 | Token revocation: `authenticate` re-reads the user on every request and rejects banned/deleted users, so bans take effect immediately. Logout clears the cookie; a stolen token stays valid until expiry (7 days). Judged acceptable; no architecture change. | **PASS** (accepted) | Optional later: shorter `JWT_EXPIRES_IN`. |
| S9 | CORS restriction and login rate limiting implemented (not yet deployed). | **PASS** (local tests) / **NOT TESTED** (deployed) | Deploy with approval. |
| S10 | Payment redirect host validation (sandbox-only default). | **PASS** | — |
| S11 | Your local frontend `.env.local` holds the admin credential as plaintext notes (gitignored, never committed). | **BLOCKED** | Move to a password manager. |
| S12 | Backend returns `error.message` in 500 responses when `NODE_ENV=development`. | **NOT TESTED** (deployed value unknown) | Ensure production `NODE_ENV` is not `development`. |

---

## 3. Admin password rotation (requires your confirmation)

**Exact operation** (writes to the production database in `DATABASE_URL`; changes only the `password` column of the one ADMIN user with that email):

```bash
cd D:\rentnest\rentnest
# Set these in the shell session only; do not commit or paste them anywhere.
ROTATE_ADMIN_EMAIL=<admin email> NEW_ADMIN_PASSWORD=<new strong password> npm run rotate:admin-password
```

- The new password should be generated and stored in a password manager by you; it is never printed by the script.
- Alternative: update the user's bcrypt hash in the Neon console.
- After rotation: confirm the old credential no longer logs in (a single read-only login attempt), then optionally rotate `JWT_SECRET` to end existing admin sessions (logs everyone out).

---

## 4. Environment configuration

### Frontend (Vercel project for `rentnest-front`)

| Variable | Development | Preview | Production | Notes |
|---|---|---|---|---|
| `API_BASE_URL` | `https://rentnest-sooty.vercel.app` | same | same | Server-only. No `/api` suffix. **Preview uses the live backend and database.** |
| `NEXT_PUBLIC_SSLCOMMERZ_MODE` | `sandbox` | `sandbox` | `sandbox` until live payments are approved, then `live` | Public, build-time. Redeploy after changing. |
| Node.js | ≥ 20.9 | ≥ 20.9 | ≥ 20.9 | Next.js 16.3.8 requirement. |

### Backend (Vercel project for `rentnest`)

| Variable | Development | Preview | Production | Notes |
|---|---|---|---|---|
| `DATABASE_URL` | Neon | Neon (ideally a separate branch) | Neon production | Secret. |
| `JWT_SECRET` | secret | secret | secret | Rotate if ever exposed. |
| `JWT_EXPIRES_IN` | `7d` | `7d` | `7d` | |
| `SSLCOMMERZ_STORE_ID` / `SSLCOMMERZ_STORE_PASSWORD` | sandbox | sandbox | **sandbox until live go-live** | Secret. |
| `SSLCOMMERZ_IS_LIVE` | `false` | `false` | `false` until approved | Must match the store credentials. |
| `SSLCOMMERZ_SUCCESS_URL` / `_FAIL_URL` / `_CANCEL_URL` / `_IPN_URL` | local or deployed | deployed | `https://rentnest-sooty.vercel.app/api/payments/{success,fail,cancel,ipn}` | Must be the backend; IPN must be publicly reachable. |
| `FRONTEND_URL` | `http://localhost:3000` | preview frontend URL | production frontend URL (e.g. `https://rentnest-frontend-chi.vercel.app`) | **New.** Enables the 303 redirect and the CORS allowlist. |
| `CORS_ORIGINS` | — | optional | optional | **New.** Extra browser origins, comma-separated. |
| `NODE_ENV` | `development` | `production` | `production` | Never `development` in production (error details). |
| `SEED_ADMIN_PASSWORD` etc. | only when seeding | — | — | **New.** Seeding never overwrites existing users. |

Local verification (2026-11-10, values not printed): local backend `.env` has `SSLCOMMERZ_IS_LIVE=false` and callback URLs on the deployed backend, and its `DATABASE_URL` points at hosted Neon (treat as production). The **deployed** backend's environment cannot be read from here.

---

## 5. SSLCommerz Sandbox status: **PASS** (Gate 2, 2026-11-10). Redirect to the frontend: **FAIL on the deployed backend**

The run used the existing QA tenant and QA landlord on the live backend, with the frontend running locally on `localhost:3100` against the deployed backend.

| Step | Result |
|---|---|
| QA landlord created "QA Test Property - Do Not Book" (৳100, Apartment, Gulshan, Dhaka) through the form | PASS (property `c393db3c…`) |
| QA tenant sent one rental request | PASS (request `a05e3dbf…`, PENDING) |
| QA landlord approved it | PASS (APPROVED) |
| Tenant clicked "Pay ৳100 with SSLCommerz" | PASS: PENDING payment `2fbe8b89…`; browser went to `https://sandbox.sslcommerz.com/EasyCheckOut/…` (sandbox host checked; live host was network-blocked during the test) |
| Paid with the official sandbox VISA test card and OTP from the SSLCommerz developer docs, then chose "Success" on the TESTBOX page | PASS |
| Backend validated with SSLCommerz: payment **COMPLETED**, rental **ACTIVE** (read back from the API) | PASS |
| Browser returned to the frontend | **FAIL**: the browser stayed on the backend JSON response at `https://rentnest-sooty.vercel.app/api/payments/success`. The 303 redirect exists only in the local, undeployed backend change. |
| Frontend `/payment/success?tran_id=…` (opened by hand), payment history, payment details, request page | PASS: "Payment confirmed", Paid, ৳100, correct transaction ID |
| Optional: "Mark as completed", then a 4★ review | PASS: COMPLETED; review saved and shown on the property page and in the landlord dashboard |
| Cleanup: QA property set unavailable | PASS: `availability:false`, hidden from the public list |

Not tested: a failed or cancelled sandbox payment, and the IPN.

---

## 6. Test results summary (2026-11-10)

| Type | Suite | Result |
|---|---|---|
| Automated (backend) | `npm test` — 19 tests (redirect builder, CORS, rate limiter, HTTP callbacks) | **PASS** 19/19 |
| Automated (backend) | `tsc -p .`, tests type-check, `npm run build` | **PASS** |
| Automated (frontend) | `npm test` — 5 tests (payment redirect guard) | **PASS** 5/5 |
| Automated (frontend) | ESLint, `tsc --noEmit`, `next build` | **PASS** |
| Local mock (browser) | auth 12/12, tenant 33/33, landlord 39/39, payment 25/25, reviews+admin 34/34 | **PASS** 143/143 |
| Live read-only API/pages | foundation 35/35, public pages 71/71, explorer 19/19, pass-through 35/35, navbar 6/6, tenant 11/11, landlord 9/9, payment 12/12, batch 4 9/9 | **PASS** 207/207 |
| Live read-only auth | 31/32 | **PASS** with 1 known: a forged-token dashboard request returns HTTP 200 with an in-page redirect (streaming); no data exposed |
| Actual Sandbox payment (Gate 2) | Full flow, QA accounts, live backend | **PASS**, but the redirect back to the frontend **FAILS** on the deployed backend (see §5) |
| Manual browser QA (human) | — | **NOT TESTED** |

---

## 7. Known limitations

- After payment the user returns to the backend's JSON page **until the backend changes are deployed** with `FRONTEND_URL`.
- No property images (placeholders); no bedrooms/bathrooms/size/featured/moderation; no forgot/change password; reviewer names not public.
- No single-record landlord endpoints (pages load the full list).
- Login rate limiting is in-memory per serverless instance.
- Frontend form rules stricter than backend (title ≥ 10, description ≥ 40, review ≥ 20 chars).
- Live-verified on 2026-11-10: rental detail with its embedded payment, the payment list, landlord requests with the tenant name, and reviews. Admin record shapes are verified only from backend source and mocks.

---

## 8. Deployment instructions (only after explicit permission)

1. Commit both repositories (frontend: Batch 4 + cleanup + this phase; backend: this phase).
2. Backend Vercel: add `FRONTEND_URL` (and optional `CORS_ORIGINS`), confirm sandbox SSLCommerz values and `NODE_ENV`, deploy. Smoke test: `GET /` 200; login works; a request with `Origin: <frontend>` gets `Access-Control-Allow-Origin`.
3. Frontend Vercel: `API_BASE_URL`, `NEXT_PUBLIC_SSLCOMMERZ_MODE=sandbox`; deploy a **Preview**; run the QA guide.
4. Run the Sandbox payment (with permission). Verify redirect to `/payment/success`.
5. Promote to Production only when every mandatory gate in §10 passes.

## 9. Rollback

- **Vercel instant rollback**: promote the previous deployment of either project.
- Backend changes are backward compatible: removing `FRONTEND_URL` restores the JSON callback responses and the open CORS policy; the rate limiter can be removed by reverting `auth.route.ts`.
- Frontend: `NEXT_PUBLIC_SSLCOMMERZ_MODE` controls the gateway host; rollback to the previous deployment restores the earlier guard.
- No database migrations were added; nothing to roll back in the schema. The admin password rotation is not reversible by design (set a new one if needed).

## 10. Production Go / No-Go

Mandatory (all must be PASS):

| Gate | Requirement | Status |
|---|---|---|
| G1 | Lint, type checks, builds, automated tests pass (both repos) | **PASS** |
| G2 | No mock data or undocumented endpoints in the frontend | **PASS** |
| G3 | Admin password rotated; old credential verified inactive; seed account passwords handled | **BLOCKED** |
| G4 | Credentials removed from tracked files | **PASS** |
| G5 | Changes committed in both repos | **NOT TESTED** (awaiting you) |
| G6 | Backend deployed with `FRONTEND_URL`; callback redirect verified on the deployed backend | **PASS at server level** (2026-11-10, deployment `dpl_9M5umRLM3CMdSCtoWY9AVpyjs4Ff`, local branch `deploy/payment-redirect` @ `6209c4b`; only `payment.controller.ts` and `config/frontend.ts` were deployed). Success, fail and cancel callbacks return 303 to `https://rentnest-frontend-chi.vercel.app/payment/{success,cancel}?tran_id=…`. **Browser-level: NOT TESTED.** It needs a new sandbox payment, and the production frontend is an older build that can't show the real payment yet (see G10). |
| G10 | Production frontend deployed with the integrated build (payment return pages read the real backend status) | **BLOCKED** (the production frontend is 17 days old; its `/payment/success` shows "We couldn't find this payment") |
| G7 | Successful SSLCommerz **Sandbox** payment end to end (COMPLETED + ACTIVE + frontend success page + history) | **PASS** (2026-11-10; the success page was opened by hand because of G6) |
| G8 | Manual QA guide executed on a Preview deployment with no FAIL | **NOT TESTED** |
| G9 | Production `NODE_ENV` not `development`; Vercel env per §4 | **NOT TESTED** |

Required before taking real payments (not before a launch without payments):

| Gate | Requirement | Status |
|---|---|---|
| P1 | Live SSLCommerz credentials set and `SSLCOMMERZ_IS_LIVE=true`, approved by you | **NOT TESTED** |
| P2 | Frontend rebuilt with `NEXT_PUBLIC_SSLCOMMERZ_MODE=live`; live `GatewayPageURL` host confirmed as `securepay.sslcommerz.com` | **NOT TESTED** |

Verdict rules: any mandatory gate not PASS → not Production Ready. All mandatory PASS → **PRODUCTION READY** (without live payments until P1–P2).
