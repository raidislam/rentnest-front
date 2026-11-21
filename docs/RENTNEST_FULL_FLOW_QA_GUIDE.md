# RentNest Full-Flow QA Guide

Last updated: 2026-11-10 · Use with `docs/RENTNEST_LAUNCH_CHECKLIST.md`

Statuses: **PASS** · **FAIL** · **BLOCKED** · **NOT TESTED**

Columns:
- **Automated** — executed by the local mock-backend browser suites (headless Chrome, stateful mock of the documented API) and/or live read-only suites. Results from 2026-11-10.
- **Manual** — a person running the step on a deployed Preview. Fill in during QA.

Rules for manual QA:
- Run on a **Preview** deployment. Preview uses the **live backend and database**: steps marked ✎ create or change real records. Use only the QA accounts and get sign-off first.
- Never use real cards or the live gateway. The pay button only allows `sandbox.sslcommerz.com` unless the build sets `NEXT_PUBLIC_SSLCOMMERZ_MODE=live`.
- Record evidence (screenshot or note) for every FAIL.

---

## A. Public website

| # | Step | Expected | Automated | Manual |
|---|---|---|---|---|
| A1 | Open the home page | Real listings ("Latest properties"), popular areas, placeholder photos; no beds/baths/size | PASS (live) | NOT TESTED |
| A2 | /properties: filter by location, type, min/max price, one amenity; keyword; sort | Backend filters + client keyword/sort; shareable URL; types from categories | PASS (live + browser) | NOT TESTED |
| A3 | Filters with no match | Empty state, "Reset search" | PASS (live) | NOT TESTED |
| A4 | Property details | Gallery (placeholders), category, landlord name, reviews ("Former tenant"), similar homes | PASS (live) | NOT TESTED |
| A5 | Invalid / unknown property ID | "Not found" page | PASS (live) | NOT TESTED |
| A6 | Booking panel signed out / as landlord | "Log in to request" / disabled "Only tenant accounts…" | PASS (live + mock) | NOT TESTED |

## B. Authentication

| # | Step | Expected | Automated | Manual |
|---|---|---|---|---|
| B1 | Register tenant ✎ | Success screen → tenant dashboard; HttpOnly session | PASS (mock) | NOT TESTED |
| B2 | Register landlord ✎ | Success screen → landlord dashboard | PASS (mock) | NOT TESTED |
| B3 | Register with existing email | Backend message + "Log in" link | PASS (mock) | NOT TESTED |
| B4 | Login / wrong password / banned account | Dashboard / 401 message / 403 message | PASS (mock + live 401) | NOT TESTED |
| B5 | 11th wrong password for one email within 15 min | 429 "Too many failed login attempts" (after backend deploy) | PASS (backend unit test) | NOT TESTED |
| B6 | Logout from dashboard and from navbar | Cookies cleared; protected pages → login | PASS (live) | NOT TESTED |
| B7 | Role routing: tenant → /dashboard/admin, landlord → /dashboard/tenant | Redirected to own dashboard | PASS (live) | NOT TESTED |
| B8 | Expired / invalid session cookie | Login with `next`; no data shown | PASS (mock + live) | NOT TESTED |

## C. Landlord

| # | Step | Expected | Automated | Manual |
|---|---|---|---|---|
| C1 | Dashboard | Real totals, available, pending requests, reviews; no earnings | PASS (mock + live empty) | NOT TESTED |
| C2 | Create property ✎ | Categories from API; exactly 7 documented fields sent; appears in list and search | PASS (mock) | NOT TESTED |
| C3 | View properties | Real list, search, availability filter | PASS (mock + live empty) | NOT TESTED |
| C4 | Edit property ✎ | Only changed fields sent (PUT); free-text amenities kept; "No changes" sends nothing | PASS (mock) | NOT TESTED |
| C5 | Toggle availability ✎ | Switch changes after backend success; unavailable hidden from search | PASS (mock) | NOT TESTED |
| C6 | Delete property ✎ (with / without requests) | 409 message, kept / removed after confirmation | PASS (mock) | NOT TESTED |
| C7 | View rental requests + detail | Tenant (or "Tenant"), property, message with applicant details, payment | PASS (mock) | NOT TESTED |
| C8 | Approve ✎ / reject ✎ pending requests | Body exactly `{status}`; no note; status after confirmation; 409 handled | PASS (mock) | NOT TESTED |
| C9 | View reviews | Real reviews on dashboard; tenant name when provided | PASS (mock + live empty) | NOT TESTED |

## D. Tenant

| # | Step | Expected | Automated | Manual |
|---|---|---|---|---|
| D1 | Dashboard | Real counts, approved banners, active rental, payment history | PASS (mock + live empty) | NOT TESTED |
| D2 | Submit rental request ✎ | Prefilled name/email; body exactly `{propertyId, message}`; success after 201 | PASS (mock) | NOT TESTED |
| D3 | View requests and details; another tenant's ID | History with filters; foreign ID → not found | PASS (mock + live) | NOT TESTED |
| D4 | Payment history + payment details | Status, amount, transaction, gateway; foreign/unknown ID → not found | PASS (mock + live) | NOT TESTED |
| D5 | Mark active rental as completed ✎ | PATCH with no body; status after confirmation; review offered | PASS (mock) | **PASS** (Gate 2) |
| D6 | Submit review ✎ | Only on COMPLETED; body exactly `{propertyId, rating, comment}`; duplicate → 409 message | PASS (mock) | **PASS** (Gate 2: 4★ review; duplicate not tested) |

## E. Payment (SSLCommerz Sandbox)

| # | Step | Expected | Automated | Manual / Sandbox |
|---|---|---|---|---|
| E1 | Create payment from an APPROVED request | Body exactly `{rentalRequestId}`; one request despite double clicks | PASS (mock) | **PASS** (Gate 2, 2026-11-10) |
| E2 | Redirect | Only to `https://sandbox.sslcommerz.com/...` (live host refused in sandbox mode) | PASS (mock + unit) | **PASS** (`sandbox.sslcommerz.com`) |
| E3 | Successful dummy payment (official sandbox test card) | Backend validates `val_id` with SSLCommerz → payment COMPLETED, rental ACTIVE | — | **PASS** (COMPLETED + ACTIVE read back from the API) |
| E4 | Return to frontend | 303 → `/payment/success?tran_id=…` showing "Payment confirmed" (needs backend deploy with `FRONTEND_URL`) | PASS (backend HTTP test + mock) | Backend redirect **deployed 2026-11-10**: 303 to `/payment/success?tran_id=…` verified at server level (curl). **Browser-level NOT TESTED**: needs a new sandbox payment and the integrated frontend on production (the current production frontend is an older build). The success page itself PASSES locally when opened by hand. |
| E5 | Failed payment / cancelled payment | Payment FAILED; 303 → `/payment/cancel?tran_id=…`; retry offered | PASS (backend HTTP test + mock) | NOT TESTED |
| E6 | Invalid / unknown transaction on return pages | "Couldn't confirm" / "not confirmed"; never success | PASS (mock + live) | NOT TESTED |
| E7 | Payment history and rental activation after success | Paid in history and details; request Active | PASS (mock) | **PASS** |

### Sandbox test procedure (requires your explicit permission)

Records created/changed on the **live** backend (QA-only, no real users touched):
1. Reuse the two existing QA accounts (QA landlord, QA tenant) — no new accounts.
2. ✎ QA landlord creates **"QA Test Property – do not book"**, ৳100, category Apartment.
3. ✎ QA tenant sends one rental request for it.
4. ✎ QA landlord approves the request.
5. ✎ QA tenant starts payment → one PENDING payment + an SSLCommerz **sandbox** session. **Abort if the `paymentUrl` host is not `sandbox.sslcommerz.com`.**
6. Pay with the official SSLCommerz sandbox test card (developer docs, "Test Credit Card Account Numbers"). No real money.
7. Verify: payment COMPLETED, rental ACTIVE, frontend success page (after backend deploy), history and details.
8. Optional ✎: mark completed and review.
9. Cleanup ✎: set the QA property unavailable (it can't be deleted once it has requests); ban/remove QA accounts after QA.

## F. Admin

| # | Step | Expected | Automated | Manual |
|---|---|---|---|---|
| F1 | Dashboard | Counts from real lists; no moderation/approvals | PASS (mock) | NOT TESTED |
| F2 | User list | Role/status badges; search/filter | PASS (mock) | NOT TESTED |
| F3 | Ban ✎ / unban ✎ a QA account | Body `{status:false/true}`; badge after confirmation; self has no Ban button; banned user can't log in | PASS (mock) | NOT TESTED |
| F4 | Property list | Read-only, all properties incl. unavailable; details dialog | PASS (mock) | NOT TESTED |
| F5 | Rental list | Read-only, status filter, details dialog | PASS (mock) | NOT TESTED |
| F6 | Category list | From `GET /api/categories` (no admin GET exists) | PASS (mock + live) | NOT TESTED |
| F7 | Create ✎ / update ✎ / delete ✎ category | Body `{name, description}`; 409 duplicate / in use shown; list after confirmation | PASS (mock) | NOT TESTED |
| F8 | Non-admin on admin pages / APIs | Redirect / 403 "Admin access required" | PASS (live) | NOT TESTED |

There is no property moderation in the backend; the admin UI does not offer it.

---

## Results log (manual QA)

| Date | Tester | Build / Preview URL | Section | Result | Notes |
|---|---|---|---|---|---|
| 2026-11-10 | Claude (automated browser, QA accounts) | localhost:3100 → live backend | C2, C5, C8, D2, D4–D6, E1–E4, E7 | PASS except E4 (deployed redirect missing) | Gate 2 sandbox run; details in launch checklist §5. Bangla manual: `docs/RENTNEST_MANUAL_TESTING_BN.md` |
| | | | | | |
