# RentNest — Manual Testing Guide (বাংলা)

শেষ আপডেট: 2026-11-10 · সাথে দেখুন: `docs/RENTNEST_FULL_FLOW_QA_GUIDE.md`, `docs/RENTNEST_LAUNCH_CHECKLIST.md`

> এই গাইডে কোনো password, token, cookie বা secret নেই। Testing-এর সময়ও এগুলো কোথাও লিখবেন না, screenshot-এ রাখবেন না, chat-এ পাঠাবেন না।

এই গাইড কাদের জন্য: যিনি RentNest website টা হাতে-কলমে test করবেন — শুরু থেকে শেষ পর্যন্ত, একটা একটা ধাপে। Programming জানা লাগবে না, তবে Chrome browser চালাতে জানতে হবে।

---

## সূচিপত্র

- A. Testing-এর প্রস্তুতি
- B. সম্পূর্ণ Business Workflow (২০টি ধাপ)
- C. SSLCommerz Sandbox — নতুনদের জন্য
- D. Role-based Testing
- E. Error Testing
- F. Chrome DevTools গাইড
- G. Testing Checklist (Table)
- H. Troubleshooting
- I. Final Result কীভাবে ঠিক করব

---

## A. Testing-এর প্রস্তুতি

### A1. কোন URL-এ test করবেন

| কী | URL | মন্তব্য |
|---|---|---|
| Frontend (deployed) | `https://rentnest-frontend-chi.vercel.app` | এখানে বর্তমানে **পুরোনো** frontend build চলছে। নতুন build deploy না হওয়া পর্যন্ত কিছু ফিচার না-ও মিলতে পারে। |
| Frontend (Preview) | Vercel Preview URL (deploy-এর পর পাবেন) | **নতুন build test করার সঠিক জায়গা এটাই।** |
| Frontend (local) | `http://localhost:3000` (`npm run dev`) | Developer-এর computer-এ। |
| Backend API | `https://rentnest-sooty.vercel.app` | সরাসরি browser-এ খোলার দরকার নেই; frontend নিজেই একে call করে। |
| SSLCommerz Sandbox | `https://sandbox.sslcommerz.com/...` | Payment-এর সময় এখানে যাবে। এটা **test gateway** — আসল টাকা কাটে না। |

**সাবধান:** Preview আর local — দুটোই **আসল (live) backend ও database** ব্যবহার করে। তাই আপনি যা তৈরি করবেন (property, request, payment, review) সেটা আসল database-এ থাকবে। শুধু QA account দিয়ে test করুন।

### A2. QA account (role অনুযায়ী)

| Role | Account | কোথায় পাবেন |
|---|---|---|
| Tenant | "RentNest QA Tenant" | Team lead-এর কাছ থেকে email ও password নিন (password manager-এ রাখা আছে) |
| Landlord | RentNest QA Landlord | একইভাবে team lead-এর কাছ থেকে |
| Admin | Admin account | **এখন Admin test করবেন না।** Admin password বদলানো (rotation) এখনো বাকি, অনুমতি না পাওয়া পর্যন্ত Admin login নিষেধ। |

চাইলে `/auth/register` থেকে নিজের নতুন test account বানাতে পারেন, তবে তাতে আসল database-এ নতুন user তৈরি হবে — আগে team lead-এর অনুমতি নিন। নতুন account-এর email-এ `@example.com` ব্যবহার করুন।

### A3. Log in ও Log out

**Log in:**
1. `/auth/login` খুলুন (উপরের navbar-এ "Log in")।
2. **Email** ও **Password** দিন।
3. "Remember me" টিক দিলে browser বন্ধ করলেও login থাকবে; টিক না দিলে browser বন্ধ করলেই logout।
4. **Log in** button চাপুন।
5. সফল হলে: "Welcome back, …" message আসবে, তারপর নিজের dashboard-এ চলে যাবে।

**Log out:**
- Dashboard-এর sidebar-এ বা উপরের navbar-এ profile menu থেকে **Log out** চাপুন।
- সফল হলে: home page-এ ফিরে যাবে; এরপর `/dashboard/...` খুললে login page আসবে।

**এক role থেকে আরেক role-এ যেতে:** আগে Log out, তারপর অন্য account দিয়ে Log in। দুই role একসাথে দেখতে চাইলে একটা normal window আর একটা **Incognito window** ব্যবহার করুন (দুটোর login আলাদা থাকে)।

### A4. এখন কোন role-এ আছি — কীভাবে বুঝব

| Role | Dashboard URL | কী দেখবেন |
|---|---|---|
| Tenant | `/dashboard/tenant` | "Total requests", "Active rentals", "Payment history" |
| Landlord | `/dashboard/landlord` | properties-এর হিসাব, "Recent requests", "Reviews" |
| Admin | `/dashboard/admin` | Users, Properties, Requests, Categories menu |

ভুল role-এর dashboard URL খুললে website নিজেই আপনাকে নিজের dashboard-এ পাঠিয়ে দেবে — এটা স্বাভাবিক।

### A5. DevTools Network খোলা (প্রতিটা test-এর আগে)

1. Chrome-এ **F12** চাপুন (Mac: `Cmd + Option + I`)।
2. উপরের tab থেকে **Network** বেছে নিন।
3. **Preserve log** টিক দিন (page বদলালেও আগের request মুছবে না — payment test-এর জন্য খুব জরুরি)।
4. Filter-এ **Fetch/XHR** বা **All** রাখুন।

বিস্তারিত section F-এ।

---

## B. সম্পূর্ণ Business Workflow (২০টি ধাপ)

প্রতিটা ধাপে আছে: **কোন URL/page → কোন button → কী তথ্য দেবেন → কী result আসবে → সফল হলে কী status → ব্যর্থ হলে কীভাবে বুঝবেন → কীভাবে সমস্যা খুঁজবেন।**

Status-এর নাম দুই জায়গায় আলাদা দেখায়:

| জিনিস | Website-এ (UI) | Backend-এ |
|---|---|---|
| Rental request | Pending → Approved / Rejected → Active → Completed | `PENDING` → `APPROVED` / `REJECTED` → `ACTIVE` → `COMPLETED` |
| Payment | Pending → Paid / Failed | `PENDING` → `COMPLETED` / `FAILED` |
| Property | Available / Unavailable | `availability: true / false` |

---

### ধাপ ১ — Website খোলা (কোনো login ছাড়া)

- **URL/page:** `/` (home page)
- **Button:** কিছু না; scroll করে দেখুন।
- **কী তথ্য:** —
- **Result:** "Latest properties", জনপ্রিয় এলাকা, property card দেখা যাবে। ছবির জায়গায় placeholder ছবি থাকবে (backend-এ এখনো ছবি নেই, এটা স্বাভাবিক)।
- **সফল হলে:** Page পুরো load হবে, কোনো error message নেই।
- **ব্যর্থ হলে:** সাদা page, "Something went wrong" বা property-র জায়গা খালি।
- **সমস্যা খুঁজতে:** Page reload করুন; DevTools **Console**-এ লাল error দেখুন; backend চালু আছে কিনা দেখতে `https://rentnest-sooty.vercel.app` খুলুন।

### ধাপ ২ — Property খোঁজা

- **URL/page:** `/properties`
- **Button:** filter-গুলো (location, type, min/max price, amenity), keyword box, sort।
- **কী তথ্য:** যেমন location-এ `Gulshan`, max price `50000`।
- **Result:** filter অনুযায়ী তালিকা বদলাবে, URL-এও filter যোগ হবে (link share করা যায়)।
- **সফল হলে:** মিলে যাওয়া property দেখাবে; কিছু না মিললে empty state ও "Reset search"।
- **ব্যর্থ হলে:** filter দিলেও তালিকা বদলায় না, বা ভুল property দেখায়।
- **সমস্যা খুঁজতে:** URL-এ filter বসেছে কিনা দেখুন; "Reset search" চেপে আবার চেষ্টা করুন। (এই page-এর data server থেকে আসে, তাই Network-এ সব request না-ও দেখা যেতে পারে — section F দেখুন।)

### ধাপ ৩ — নতুন account খোলা (Register) — *ঐচ্ছিক, অনুমতি লাগবে*

- **URL/page:** `/auth/register`
- **Button:** role বেছে নিন — "**I want to rent**" (Tenant) অথবা "**I'm a landlord**" (Landlord) → **Create account**
- **কী তথ্য:** Full name, Email (`...@example.com`), Password, Confirm password (Password requirements box-এর নিয়ম মেনে)।
- **Result:** সফলতার screen, তারপর নিজের dashboard।
- **সফল হলে:** নতুন role-এর dashboard খুলবে; Network-এ `POST /api/auth/register` → **201**।
- **ব্যর্থ হলে:** একই email আগে থাকলে backend-এর message ও "Log in" link দেখাবে; form-এর ভুলে field-এর নিচে লাল লেখা।
- **সমস্যা খুঁজতে:** Network-এ `register` request-এর **Response** tab-এ backend message পড়ুন।

### ধাপ ৪ — Landlord হিসেবে Log in

- **URL/page:** `/auth/login`
- **Button:** **Log in**
- **কী তথ্য:** QA Landlord-এর email ও password।
- **Result:** `/dashboard/landlord`-এ চলে যাবে।
- **সফল হলে:** "Welcome back, …"; Network-এ `POST /api/auth/login` → **200**।
- **ব্যর্থ হলে:** ভুল password হলে **401** ও error message; account ban থাকলে **403**।
- **সমস্যা খুঁজতে:** email-এ space আছে কিনা দেখুন; Caps Lock বন্ধ কিনা দেখুন। অনেকবার ভুল দিলে (backend নতুন version deploy হওয়ার পর) ১৫ মিনিটের জন্য **429** আসতে পারে।

### ধাপ ৫ — নতুন Property তৈরি

- **URL/page:** `/dashboard/landlord/properties/new` (অথবা "My properties" page-এ **Add property**)
- **Button:** **Create property**
- **কী তথ্য:**
  - **Property title** — কমপক্ষে ১০ অক্ষর, যেমন `QA Test Property - Do Not Book`
  - **Property type** — তালিকা থেকে (যেমন Apartment; তালিকা backend-এর categories থেকে আসে)
  - **Description** — কমপক্ষে ৪০ অক্ষর
  - **Area / neighbourhood** — যেমন `Gulshan`; **City** — যেমন `Dhaka`; **Street address (optional)**
  - **Monthly rent (৳)** — test-এর জন্য `100`
  - **Amenities** — যেমন WiFi
- **Result:** Property তৈরি হবে এবং "My properties" তালিকায় দেখাবে।
- **সফল হলে:** Network-এ `POST /api/backend/properties` → **201**; property **Available**।
- **ব্যর্থ হলে:** field-এর নিচে লাল লেখা (frontend validation) অথবা উপরে backend-এর error message (**400**)।
- **সমস্যা খুঁজতে:** Network-এ request-এর **Payload** (কী পাঠানো হলো) ও **Response** (backend কী বলল) দেখুন।

### ধাপ ৬ — Property তালিকা ও public page-এ দেখা

- **URL/page:** `/dashboard/landlord/properties`, তারপর `/properties`
- **Button:** search box, "All / Available / Unavailable" filter
- **কী তথ্য:** property-র নাম দিয়ে খুঁজুন।
- **Result:** নতুন property landlord-এর তালিকায় ও public search-এ দুই জায়গাতেই আছে।
- **সফল হলে:** দুই জায়গাতেই দেখা যায়, দাম ও এলাকা ঠিক।
- **ব্যর্থ হলে:** একটায় আছে, অন্যটায় নেই।
- **সমস্যা খুঁজতে:** Page reload করুন; property **Available** কিনা দেখুন (Unavailable property public search-এ লুকানো থাকে — এটা নিয়ম)।

### ধাপ ৭ — Property edit (ঐচ্ছিক)

- **URL/page:** `/dashboard/landlord/properties/[id]/edit` (card-এর Edit থেকে)
- **Button:** **Save changes**
- **কী তথ্য:** যেমন description-এ একটা লাইন যোগ করুন।
- **Result:** শুধু বদলানো field-গুলো backend-এ যাবে।
- **সফল হলে:** Network-এ `PUT /api/backend/properties/<id>` → **200**; তালিকায় নতুন তথ্য।
- **ব্যর্থ হলে:** কিছু না বদলে Save দিলে "No changes" — এটা ভুল নয়, কোনো request যাবে না।
- **সমস্যা খুঁজতে:** Payload-এ শুধু বদলানো field আছে কিনা দেখুন।

### ধাপ ৮ — Landlord Log out, Tenant Log in

- **URL/page:** **Log out** → `/auth/login`
- **Button:** **Log out**, তারপর **Log in**
- **কী তথ্য:** QA Tenant-এর email ও password।
- **Result:** `/dashboard/tenant`-এ চলে যাবে।
- **সফল হলে:** Tenant dashboard দেখা যায়।
- **ব্যর্থ হলে:** Landlord dashboard-ই থেকে যায় → logout ঠিকমতো হয়নি।
- **সমস্যা খুঁজতে:** Network-এ `POST /api/auth/logout` → **200** কিনা; না হলে browser বন্ধ করে আবার খুলুন।

### ধাপ ৯ — Property-র details page দেখা

- **URL/page:** `/properties` → property card-এ click → `/properties/[id]`
- **Button:** —
- **কী তথ্য:** —
- **Result:** ছবি (placeholder), category, landlord-এর নাম, ভাড়া, reviews, পাশে "Request to rent" panel।
- **সফল হলে:** সব তথ্য ঠিক আছে।
- **ব্যর্থ হলে:** "Not found" (ভুল ID অথবা property মুছে ফেলা হয়েছে)।
- **সমস্যা খুঁজতে:** URL-এর ID ঠিক আছে কিনা দেখুন। Login ছাড়া এই panel-এ "**Log in to request**" দেখাবে, আর landlord হিসেবে খুললে বলবে শুধু tenant request পাঠাতে পারে — দুটোই সঠিক আচরণ।

### ধাপ ১০ — Rental request পাঠানো

- **URL/page:** `/properties/[id]` → **Request to rent**
- **Button:** **Send request**
- **কী তথ্য:**
  - **Full name**, **Email** — নিজে থেকেই পূরণ থাকবে
  - **Mobile number** — বাংলাদেশি নম্বর, যেমন `01712-345678`
  - **Preferred move-in date** — আজ বা ভবিষ্যতের তারিখ
  - **Rental duration** — তালিকা থেকে
  - **Message to …** (landlord-এর নাম) — কমপক্ষে ২০ অক্ষর
- **Result:** "**Rental request sent**" message।
- **সফল হলে:** Network-এ `POST /api/backend/rentals` → **201**; request **Pending**।
- **ব্যর্থ হলে:** "**Request not sent**" ও backend-এর কারণ (যেমন একই property-তে আগেই request আছে), অথবা field-এর নিচে লাল লেখা।
- **সমস্যা খুঁজতে:** Network → `rentals` request → Response tab-এ `message` পড়ুন।

### ধাপ ১১ — Tenant নিজের request দেখা

- **URL/page:** `/dashboard/tenant/requests` → request-এ click → `/dashboard/tenant/requests/[id]`
- **Button:** status filter
- **কী তথ্য:** —
- **Result:** request-টা **Pending** অবস্থায়; ভেতরে message, ফোন নম্বর, move-in তারিখ দেখা যায়।
- **সফল হলে:** Status **Pending**, "Awaiting landlord"।
- **ব্যর্থ হলে:** তালিকায় request নেই।
- **সমস্যা খুঁজতে:** Page reload করুন; ধাপ ১০-এ সত্যিই 201 এসেছিল কিনা Network log-এ দেখুন।

### ধাপ ১২ — Landlord request দেখা

- **URL/page:** (Landlord হিসেবে login করে) `/dashboard/landlord/requests` → `/dashboard/landlord/requests/[id]`
- **Button:** —
- **কী তথ্য:** —
- **Result:** Tenant-এর নাম (যেমন "RentNest QA Tenant"), property, message ও applicant details।
- **সফল হলে:** request **Pending**, পাশে **Approve** ও **Reject** button।
- **ব্যর্থ হলে:** request দেখা যায় না → হয়তো অন্য landlord-এর property-তে request গেছে।
- **সমস্যা খুঁজতে:** সঠিক landlord account-এ login আছেন কিনা দেখুন।

### ধাপ ১৩ — Request Approve (বা Reject)

- **URL/page:** `/dashboard/landlord/requests` বা request details page
- **Button:** **Approve** (এক click-এই হয়ে যায়, কোনো confirmation নেই — তাই সাবধানে চাপুন)। Reject করতে **Reject** → "**Reject this request?**" → **Reject request**।
- **কী তথ্য:** —
- **Result:** "**Request approved**" message; backend নিশ্চিত করার পরই status বদলাবে।
- **সফল হলে:** Network-এ `PATCH /api/backend/landlord/requests/<id>` → **200**; status **Approved** (বা **Rejected**)।
- **ব্যর্থ হলে:** **409** — request আগেই অন্য অবস্থায় চলে গেছে; message দেখাবে।
- **সমস্যা খুঁজতে:** Page reload করে আসল status দেখুন। Payment test করতে চাইলে **Approve** করুন, Reject নয়।

### ধাপ ১৪ — Tenant Approved status দেখা

- **URL/page:** (Tenant হিসেবে) `/dashboard/tenant` ও `/dashboard/tenant/requests/[id]`
- **Button:** —
- **কী তথ্য:** —
- **Result:** "**Approved — ready for payment**" banner।
- **সফল হলে:** Status **Approved**, payment button দেখা যায়।
- **ব্যর্থ হলে:** এখনো Pending → landlord approve করেননি বা page পুরোনো।
- **সমস্যা খুঁজতে:** Page reload করুন।

### ধাপ ১৫ — Payment page খোলা

- **URL/page:** `/dashboard/tenant/requests/[id]/pay` (request page-এর payment button থেকে)
- **Button:** "**Pay ৳… with SSLCommerz**"
- **কী তথ্য:** কিছু লাগবে না। পরিমাণ ঠিক করে backend (property-র ভাড়া)।
- **Result:** Browser SSLCommerz Sandbox page-এ চলে যাবে।
- **সফল হলে:** Network-এ `POST /api/backend/payments` → **201** (একটা **Pending** payment তৈরি হয়); address bar-এ `https://sandbox.sslcommerz.com/...`।
- **ব্যর্থ হলে:** page-এ error; অথবা address bar-এ `sandbox.sslcommerz.com` ছাড়া অন্য কিছু → **সাথে সাথে থামুন** এবং team lead-কে জানান।
- **সমস্যা খুঁজতে:** Response-এ backend message পড়ুন। Button দুবার চাপলেও একটাই payment তৈরি হওয়ার কথা — দুটো `payments` request দেখলে সেটা bug।

### ধাপ ১৬ — SSLCommerz Sandbox-এ dummy payment

- **URL/page:** `https://sandbox.sslcommerz.com/EasyCheckOut/...`
- **Button:** Card বেছে নিন → card তথ্য দিন → Pay → OTP page → **Success**
- **কী তথ্য:** **শুধু SSLCommerz-এর official test card** (section C)। কখনো নিজের আসল card নয়।
- **Result:** SSLCommerz backend-কে জানায়, backend SSLCommerz-এর কাছ থেকে payment যাচাই করে।
- **সফল হলে:** Payment **Paid** (backend `COMPLETED`), request **Active**।
- **ব্যর্থ হলে:** card-এর তথ্যে ভুল থাকলে SSLCommerz নিজেই error দেখাবে; OTP page-এ **Failed** চাপলে payment **Failed** হবে।
- **সমস্যা খুঁজতে:** Section C ও H দেখুন।

### ধাপ ১৭ — Payment-এর পর ফেরত আসা (Return)

- **URL/page:** হওয়ার কথা `/payment/success?tran_id=...`
- **Button:** —
- **কী তথ্য:** —
- **Result (প্রত্যাশিত):** "**Payment confirmed** — RentNest has confirmed your payment with SSLCommerz. Your rental is now active." সাথে Status Paid, Amount, Transaction, Gateway।
- **⚠️ বর্তমান অবস্থা (2026-11-10):** Backend-এর redirect এখন deploy করা হয়েছে — payment-এর পর browser `https://rentnest-frontend-chi.vercel.app/payment/success?tran_id=...`-এ ফেরত যাবে (fail/cancel হলে `/payment/cancel?tran_id=...`)। কিন্তু ওই ঠিকানায় এখনো **পুরোনো frontend build** চলছে, তাই সেখানে "We couldn't find this payment" দেখাতে পারে। নতুন frontend deploy না হওয়া পর্যন্ত এটা জানা সমস্যা — আসল status দেখতে নিচের ধাপ ১৮-তে যান (নতুন build-এ)।
- **সফল হলে:** "Payment confirmed" শুধু তখনই দেখায় যখন backend বলে payment COMPLETED। (Frontend নিজে থেকে কখনো success দেখায় না।)
- **ব্যর্থ হলে:** "**Payment not confirmed yet**" (এখনো Pending) অথবা "**Payment not completed**" (`/payment/cancel`)।
- **সমস্যা খুঁজতে:** JSON page এলে সেটাকে FAIL না ধরে Notes-এ লিখুন "redirect missing (known)"; আসল status ধাপ ১৮-তে দেখুন।

### ধাপ ১৮ — Payment history ও details যাচাই

- **URL/page:** `/dashboard/tenant` (নিচে "Payment history") → payment-এ click → `/dashboard/tenant/payments/[id]`
- **Button:** —
- **কী তথ্য:** —
- **Result:** "Total paid ৳100", property-র নাম, তারিখ, SSLCommerz, transaction ID (`RENT-...`), **Paid**।
- **সফল হলে:** Details page-এ Amount, Transaction ID, Gateway, Started, Paid on — সব ঠিক।
- **ব্যর্থ হলে:** Payment **Pending** থেকে যায় → backend যাচাই শেষ করেনি বা callback পৌঁছায়নি।
- **সমস্যা খুঁজতে:** ২-৩ মিনিট পর reload করুন। Transaction ID লিখে রাখুন (এটা secret নয়), team lead-কে দিন।

### ধাপ ১৯ — Active rental যাচাই

- **URL/page:** `/dashboard/tenant/requests/[id]`
- **Button:** —
- **কী তথ্য:** —
- **Result:** "**Active rental** — Your payment is complete and this is your current home." Dashboard-এ "Active rentals 1", "Current rental"।
- **সফল হলে:** Status **Active**; Landlord-এর তালিকাতেও request Active, payment Paid।
- **ব্যর্থ হলে:** এখনো Approved → payment সম্পূর্ণ হয়নি।
- **সমস্যা খুঁজতে:** ধাপ ১৮-এর payment status দেখুন।

### ধাপ ২০ — Rental শেষ করা, Review দেওয়া ও Cleanup

**২০ক — Mark as completed (Tenant)**
- **URL/page:** `/dashboard/tenant/requests/[id]`
- **Button:** **Mark as completed** → "Mark this rental as completed?" → **Mark as completed**
- **Result:** "**Rental completed**"; Network-এ `PATCH /api/backend/rentals/<id>/complete` → **200**; status **Completed**।
- **ব্যর্থ হলে:** **409** (rental Active নয়)।

**২০খ — Review দেওয়া (Tenant)**
- **Button:** **Leave review** → "Leave a review" dialog → rating (১-৫ star) → **Your review** (কমপক্ষে ২০ অক্ষর) → **Submit review**
- **Result:** "Thanks for your review!" → **Done**; পরে page-এ "**You reviewed this home**"।
- **সফল হলে:** Network-এ `POST /api/backend/reviews` → **201**; property page-এ review দেখা যায় ("Former tenant" নামে), landlord dashboard-এ "Reviews" সংখ্যা বাড়ে।
- **ব্যর্থ হলে:** একই property-তে দ্বিতীয়বার review দিলে **409** message।

**২০গ — Cleanup (Landlord)**
- **URL/page:** `/dashboard/landlord/properties`
- **Button:** test property-র **Availability switch** বন্ধ করুন।
- **Result:** "Unavailable" সংখ্যা বাড়ে; public `/properties`-এ আর দেখা যায় না।
- **সফল হলে:** Network-এ `PUT /api/backend/properties/<id>` → **200**।
- **মনে রাখুন:** যে property-তে request আছে সেটা **Delete** করা যায় না (**409**) — তাই cleanup-এর জন্য Unavailable করাই নিয়ম। আসল কারো property বা data কখনো মুছবেন না।

---

## C. SSLCommerz Sandbox — নতুনদের জন্য

### C1. Sandbox কী?

SSLCommerz হলো বাংলাদেশের একটা payment gateway (card, bKash ইত্যাদি দিয়ে টাকা নেওয়ার ব্যবস্থা)। এর দুটো রূপ আছে:

| | Sandbox (test) | Live (আসল) |
|---|---|---|
| ঠিকানা | `sandbox.sslcommerz.com` | `securepay.sslcommerz.com` |
| টাকা কাটে? | **না** | হ্যাঁ |
| Card | শুধু SSLCommerz-এর দেওয়া test card | আসল card |
| RentNest-এ এখন | **চালু** | বন্ধ (অনুমতি ছাড়া চালু করা নিষেধ) |

RentNest frontend নিজে থেকেই শুধু `https://sandbox.sslcommerz.com`-এ যেতে দেয়। অন্য কোনো ঠিকানা এলে payment-এ যাবেই না।

### C2. Official test তথ্য কোথায় পাবেন

একমাত্র উৎস: SSLCommerz Developer Docs — `https://developer.sslcommerz.com/doc/v4/` → **"Test Credit Card Account Numbers"** অংশ।

2026-11-10 তারিখে ওই page-এ লেখা আছে (test-এর আগে আবার মিলিয়ে নিন, কারণ মেয়াদ বদলাতে পারে):

| তথ্য | মান |
|---|---|
| Card type | VISA |
| Card number | `4111111111111111` |
| Expiry | `12/26` |
| CVV | `111` |
| Mobile OTP | `111111` অথবা `123456` |

এগুলো সবার জন্য প্রকাশ্য test নম্বর, কোনো secret নয়। **নিজের আসল card, আসল OTP বা আসল bKash কখনো ব্যবহার করবেন না।** অন্য কোথাও থেকে পাওয়া বা আন্দাজ করা নম্বর ব্যবহার করবেন না।

### C3. ধাপে ধাপে Sandbox payment

1. ধাপ ১৫ অনুযায়ী "Pay ৳… with SSLCommerz" চাপুন।
2. Address bar দেখুন: `https://sandbox.sslcommerz.com/...` কিনা। **না হলে থামুন।**
3. Page-এ payment-এর পদ্ধতি থেকে **Card** (VISA) বেছে নিন।
4. Card number, Expiry, CVV, Card holder name (যেকোনো নাম, যেমন `QA Tester`) দিন।
5. Pay চাপুন।
6. "**SSLCOMMERZ TESTBOX GATEWAY**" নামের OTP page আসবে; পরিমাণ (যেমন 100.00) মিলিয়ে নিন।
7. OTP `111111` দিন।
8. তিনটা button থাকে: **Success**, **Success with risk**, **Failed**।
   - সফল payment test → **Success**
   - ব্যর্থ payment test → **Failed** (অনুমতি নিয়ে, আলাদা request-এ)
9. এরপর SSLCommerz backend-কে জানায়। Backend SSLCommerz-এর কাছ থেকে আবার যাচাই করে (status, transaction ID, পরিমাণ, BDT) — তারপরই payment COMPLETED করে।
10. ধাপ ১৭-১৯ অনুযায়ী ফলাফল যাচাই করুন।

### C4. যা কখনো করবেন না

- Live mode চালু করা, আসল card ব্যবহার করা।
- Payment বা request-এর status হাতে বদলানো (database-এ বা অন্য কোনো উপায়ে)।
- Backend-এর JSON page বা success URL নিজে বানিয়ে খুলে "success" দাবি করা — আসল প্রমাণ শুধু backend-এর status।

---

## D. Role-based Testing

### D1. Visitor (login ছাড়া)

| কী test | কোথায় | প্রত্যাশিত |
|---|---|---|
| Home, search, details দেখা | `/`, `/properties`, `/properties/[id]` | সব খোলে |
| Request পাঠাতে চেষ্টা | details page | "**Log in to request**" |
| Dashboard খোলার চেষ্টা | `/dashboard/tenant` | Login page-এ পাঠায় (login-এর পর আবার সেখানে ফেরে) |

### D2. Tenant

| কী পারবে | কী পারবে না |
|---|---|
| Request পাঠানো, নিজের request ও payment দেখা, payment করা, rental complete করা, review দেওয়া | Property তৈরি, অন্যের request দেখা, admin page |

পরীক্ষা: Tenant হিসেবে `/dashboard/landlord` বা `/dashboard/admin` খুলুন → নিজের dashboard-এ ফেরত যাবে। অন্য কারো request ID দিয়ে `/dashboard/tenant/requests/<অন্য ID>` খুললে → "Not found"।

### D3. Landlord

| কী পারবে | কী পারবে না |
|---|---|
| Property তৈরি/edit/available-unavailable/delete (request না থাকলে), নিজের property-র request approve/reject, review দেখা | Request পাঠানো, payment করা, admin page |

পরীক্ষা: Landlord হিসেবে property details page-এ request panel নিষ্ক্রিয় থাকবে; `/dashboard/tenant` খুললে নিজের dashboard-এ ফেরত।

### D4. Admin (**এখন test করবেন না** — অনুমতি লাগবে)

অনুমতি পেলে যা দেখবেন: `/dashboard/admin/users` (**Ban user** / **Unban user** — শুধু QA account-এ), `/dashboard/admin/properties` ও `/dashboard/admin/requests` (শুধু দেখা যায়, বদলানো যায় না), `/dashboard/admin/categories` (**Add category**, Edit, **Delete category**)। নিজের account-এ Ban button থাকবে না। Ban হওয়া user login করতে পারবে না (**403**)।

---

## E. Error Testing

ইচ্ছা করে ভুল করে দেখুন website ঠিকভাবে সামলায় কিনা।

| # | কী করবেন | প্রত্যাশিত |
|---|---|---|
| E1 | ভুল password দিয়ে Log in | **401**, error message; dashboard খোলে না |
| E2 | ফাঁকা form submit (login, register, property, request) | Field-এর নিচে লাল লেখা; কোনো request যায় না |
| E3 | Property title ১০ অক্ষরের কম, description ৪০-এর কম | Form আটকায় |
| E4 | ভুল mobile number (যেমন `12345`) | "Enter a valid Bangladeshi mobile number…" |
| E5 | অতীতের move-in তারিখ | "Move-in date can't be in the past." |
| E6 | `/properties/abc-123` (ভুল ID) | "Not found" page |
| E7 | Tenant হিসেবে admin/landlord URL | নিজের dashboard-এ redirect |
| E8 | Request আছে এমন property Delete | **409** message, property থাকে |
| E9 | একই property-তে দ্বিতীয় review | **409** message |
| E10 | Pay button দ্রুত দুবার চাপা | একটাই `payments` request |
| E11 | `/payment/success?tran_id=FAKE-123` | কখনো "Payment confirmed" নয় — "We couldn't confirm this payment" বা "Payment not confirmed" |
| E12 | Sandbox OTP page-এ **Failed** (অনুমতি নিয়ে) | Payment **Failed**; request Approved থাকে; `/payment/cancel`-এ "**Try payment again**" |
| E13 | Logout-এর পর browser-এর Back button | Protected data দেখায় না / login চায় |
| E14 | Internet বন্ধ করে form submit | Error message; ভুয়া success নয় |

---

## F. Chrome DevTools গাইড

### F1. Network tab পড়া

1. F12 → **Network** → **Preserve log** টিক।
2. কোনো button চাপুন; নতুন লাইন আসবে।
3. লাইনে click করলে:
   - **Headers** — কোন URL, কোন method (GET/POST/PUT/PATCH), **Status Code**
   - **Payload** — আমরা কী পাঠালাম
   - **Response** — backend কী উত্তর দিল (`success`, `message`, `data`)

**জরুরি কথা:** RentNest-এ অনেক page-এর data **server থেকেই** load হয়ে আসে, তাই dashboard খুললে Network-এ backend request না-ও দেখতে পারেন — এটা স্বাভাবিক। কিন্তু **button চাপলে** (create, approve, pay, review…) request দেখা যাবে, নাম হবে এমন:

| কাজ | Network-এ নাম |
|---|---|
| Login / Register / Logout | `/api/auth/login`, `/api/auth/register`, `/api/auth/logout` |
| বাকি সব কাজ | `/api/backend/...` (যেমন `/api/backend/rentals`, `/api/backend/payments`) |

**Security:** Headers-এ Cookie বা Authorization দেখলেও সেগুলো কপি করবেন না, screenshot-এ রাখবেন না, কাউকে পাঠাবেন না। Bug report-এ শুধু URL, method, status code আর response-এর `message` লিখুন।

### F2. Status code-এর মানে

| Code | মানে | সাধারণ কারণ | কার সমস্যা |
|---|---|---|---|
| **200** | OK — সফল | — | — |
| **201** | Created — নতুন কিছু তৈরি হয়েছে | property/request/payment/review তৈরি | — |
| **400** | Bad Request — পাঠানো তথ্যে ভুল | field বাদ, ভুল format | সাধারণত frontend validation বা ব্যবহারকারীর ইনপুট |
| **401** | Unauthorized — login নেই বা ভুল | ভুল password, session শেষ | ব্যবহারকারী; বারবার হলে session/cookie সমস্যা |
| **403** | Forbidden — অনুমতি নেই | ভুল role, account ban | নিয়ম অনুযায়ী ঠিক; ভুল জায়গায় এলে bug |
| **404** | Not Found | ভুল ID, মুছে ফেলা জিনিস, অন্যের data | URL/ID |
| **409** | Conflict — বর্তমান অবস্থার সাথে মেলে না | duplicate review, request আছে এমন property delete, আগেই approve হওয়া request | নিয়ম অনুযায়ী ঠিক; message পড়ুন |
| **429** | Too Many Requests | অনেকবার ভুল password (backend নতুন version-এর পর) | ১৫ মিনিট অপেক্ষা |
| **500** | Server Error | backend-এ সমস্যা | **Backend** — সাথে সাথে report করুন |

### F3. সমস্যাটা Frontend-এর না Backend-এর?

| লক্ষণ | সম্ভবত |
|---|---|
| Button চাপলে Network-এ কোনো request-ই নেই, আর লাল validation লেখাও নেই | **Frontend** |
| Request গেছে, Response ঠিক আছে (200/201), কিন্তু page-এ ভুল দেখায় | **Frontend** |
| Console-এ লাল JavaScript error | **Frontend** |
| Response **500** | **Backend** |
| Response-এ ভুল data (যেমন ভুল দাম, ভুল status) | **Backend** (অথবা data-ই ভুল) |
| Payment-এর পর JSON page | **Backend** (জানা সমস্যা — redirect deploy হয়নি) |
| 401/403/404/409 সঠিক message সহ | সাধারণত কোনো bug নয় — নিয়ম কাজ করছে |

---

## G. Testing Checklist

Status-এ লিখুন: **PASS** · **FAIL** · **BLOCKED** · **NOT TESTED**। ✎ = আসল database-এ কিছু তৈরি বা বদলায়।

| ID | Test | কী করতে হবে | Expected Result | Actual Result | Status | Notes |
|---|---|---|---|---|---|---|
| M01 | Home page | `/` খুলুন | Latest properties, কোনো error নেই | | NOT TESTED | |
| M02 | Search ও filter | `/properties`-এ location/price/type filter | মিলে যাওয়া তালিকা, URL-এ filter | | NOT TESTED | |
| M03 | কিছু না মেলা search | অসম্ভব filter দিন | Empty state + "Reset search" | | NOT TESTED | |
| M04 | Property details | একটা card-এ click | তথ্য, landlord নাম, reviews | | NOT TESTED | |
| M05 | ভুল property ID | `/properties/abc-123` | "Not found" | | NOT TESTED | |
| M06 | Register ✎ | `/auth/register` (অনুমতি নিয়ে) | 201, dashboard | | NOT TESTED | |
| M07 | Register একই email | পুরোনো email দিয়ে | Backend message + "Log in" link | | NOT TESTED | |
| M08 | Login সঠিক | QA account | 200, নিজের dashboard | | NOT TESTED | |
| M09 | Login ভুল password | ভুল password | 401 message | | NOT TESTED | |
| M10 | Logout | **Log out** | Home; dashboard খুললে login চায় | | NOT TESTED | |
| M11 | Role routing | Tenant হিসেবে `/dashboard/admin` | নিজের dashboard-এ redirect | | NOT TESTED | |
| M12 | Landlord dashboard | `/dashboard/landlord` | সঠিক সংখ্যা, requests, reviews | | NOT TESTED | |
| M13 | Property তৈরি ✎ | ধাপ ৫ | 201, তালিকায় Available | | NOT TESTED | Gate 2-এ automated PASS |
| M14 | Property validation | ছোট title/description | Form আটকায় | | NOT TESTED | |
| M15 | Property edit ✎ | ধাপ ৭ | 200, শুধু বদলানো field | | NOT TESTED | |
| M16 | Availability বন্ধ ✎ | Switch off | Unavailable, public search-এ নেই | | NOT TESTED | Gate 2-এ automated PASS |
| M17 | Request আছে এমন property delete ✎ | **Delete property** | 409, property থাকে | | NOT TESTED | |
| M18 | Rental request পাঠানো ✎ | ধাপ ১০ | 201, "Rental request sent", Pending | | NOT TESTED | Gate 2-এ automated PASS |
| M19 | Request form validation | ভুল ফোন/অতীত তারিখ/ছোট message | লাল লেখা, request যায় না | | NOT TESTED | |
| M20 | Tenant request তালিকা ও details | `/dashboard/tenant/requests` | Pending, সব তথ্য | | NOT TESTED | |
| M21 | অন্যের request ID | অন্য ID দিয়ে URL | Not found | | NOT TESTED | |
| M22 | Landlord request দেখা | `/dashboard/landlord/requests` | Tenant নাম, message | | NOT TESTED | |
| M23 | Approve ✎ | **Approve** | 200, Approved | | NOT TESTED | Gate 2-এ automated PASS |
| M24 | Reject ✎ | **Reject** → **Reject request** | 200, Rejected | | NOT TESTED | আলাদা request লাগবে |
| M25 | Approved banner | Tenant dashboard | "Approved — ready for payment" | | NOT TESTED | |
| M26 | Payment শুরু ✎ | "Pay ৳… with SSLCommerz" | 201, `sandbox.sslcommerz.com` | | NOT TESTED | Gate 2-এ automated PASS |
| M27 | Double-click Pay | দ্রুত দুবার চাপুন | একটাই payment request | | NOT TESTED | |
| M28 | Sandbox সফল payment ✎ | Section C3, **Success** | Payment Paid, request Active | | NOT TESTED | Gate 2-এ automated PASS |
| M29 | Payment-এর পর frontend-এ ফেরা | স্বয়ংক্রিয় | `/payment/success`-এ "Payment confirmed" | | NOT TESTED | Backend redirect deploy হয়েছে (2026-11-10); নতুন frontend deploy না হলে পুরোনো page দেখাবে |
| M30 | Success page হাতে খোলা | `/payment/success?tran_id=<আপনার ID>` | "Payment confirmed", Paid | | NOT TESTED | Gate 2-এ automated PASS |
| M31 | Payment history | `/dashboard/tenant` | Paid, ৳, transaction ID | | NOT TESTED | Gate 2-এ automated PASS |
| M32 | Payment details | `/dashboard/tenant/payments/[id]` | সব তথ্য সঠিক | | NOT TESTED | Gate 2-এ automated PASS |
| M33 | ভুয়া tran_id | `/payment/success?tran_id=FAKE-123` | কখনো success নয় | | NOT TESTED | |
| M34 | Sandbox ব্যর্থ payment ✎ | OTP page-এ **Failed** (অনুমতি নিয়ে) | Failed; "Try payment again" | | NOT TESTED | |
| M35 | Mark as completed ✎ | ধাপ ২০ক | Completed | | NOT TESTED | Gate 2-এ automated PASS |
| M36 | Review ✎ | ধাপ ২০খ | 201; property page ও landlord dashboard-এ দেখা যায় | | NOT TESTED | Gate 2-এ automated PASS |
| M37 | দ্বিতীয় review | আবার review | 409 message | | NOT TESTED | |
| M38 | Admin pages | — | — | | BLOCKED | Admin password rotation বাকি; অনুমতি ছাড়া নয় |

---

## H. Troubleshooting

| সমস্যা | কী করবেন |
|---|---|
| Login হচ্ছে না, বারবার login page | Password ঠিক কিনা দেখুন; browser-এর cookie block করা কিনা দেখুন; Incognito-তে চেষ্টা করুন |
| Login-এর পর ভুল dashboard | আগের account থেকে Log out হয়নি — Log out করে আবার login করুন |
| "Too many failed login attempts" (429) | ১৫ মিনিট অপেক্ষা করুন |
| নতুন property search-এ নেই | Available আছে কিনা দেখুন; page reload করুন |
| Category তালিকা খালি | Backend-এ category নেই — Admin-কে জানান |
| Request পাঠানো যায় না | Tenant হিসেবে login আছেন কিনা; সব field ঠিক কিনা; Response-এর message পড়ুন |
| Payment button নেই | Request **Approved** কিনা দেখুন — শুধু Approved request-এ payment হয় |
| Pay চাপার পর কিছু হয় না / error | Network-এ `payments` request-এর status ও message দেখুন; frontend sandbox ছাড়া অন্য gateway ঠিকানা আটকে দেয় — তাহলে error দেখাবে |
| SSLCommerz page-এ card নেয় না | Section C2-এর তথ্য official docs-এর সাথে আবার মিলিয়ে নিন (মেয়াদ বদলাতে পারে); কোনো নম্বর আন্দাজ করবেন না |
| Payment-এর পর JSON লেখা দেখায় | জানা সমস্যা (redirect deploy হয়নি)। `/dashboard/tenant`-এ গিয়ে payment status দেখুন |
| Payment Pending থেকে যায় | কয়েক মিনিট পর reload করুন; না বদলালে transaction ID সহ team lead-কে জানান। **নিজে status বদলানোর চেষ্টা করবেন না** |
| "Payment confirmed" দেখায় না, কিন্তু টাকা কাটা হয়েছে মনে হচ্ছে | Sandbox-এ আসল টাকা কাটে না। Live mode-এ এমন হলে সাথে সাথে report করুন |
| Delete property কাজ করে না (409) | Request থাকা property delete হয় না — Unavailable করুন |
| 500 error | Screenshot (secret ছাড়া), URL, সময় ও কী করছিলেন লিখে backend developer-কে দিন |

**Bug report-এ যা লিখবেন:** তারিখ ও সময় · কোন URL · কোন role · কী করেছিলেন (ধাপসহ) · কী আশা করেছিলেন · কী হলো · Network-এর URL, method, status code ও response `message` · screenshot (password/token/cookie ছাড়া)।

---

## I. Final Result কীভাবে ঠিক করব

| Level | কখন বলা যাবে |
|---|---|
| **Ready for Manual QA** | Build deploy হয়েছে (Preview), automated test pass, এই গাইড তৈরি। **← বর্তমান অবস্থা (2026-11-10)** |
| **QA Passed** | Section G-এর সব test PASS (Admin বাদে যদি অনুমতি না থাকে), কোনো FAIL নেই, প্রতিটা BLOCKED-এর কারণ লেখা আছে |
| **Ready for Production Review** | QA Passed + backend নতুন version deploy করা হয়েছে এবং M29 (payment-এর পর frontend-এ ফেরা) PASS + Admin password rotation সম্পন্ন + সব code commit করা |
| **Production Ready** | উপরের সব + `docs/RENTNEST_LAUNCH_CHECKLIST.md`-এর §10-এর সব mandatory gate PASS। আসল টাকা নেওয়ার আগে আলাদা অনুমতিতে Live SSLCommerz চালু ও যাচাই |

**বর্তমানে কী বাকি:** (১) নতুন frontend deploy (backend redirect deploy হয়ে গেছে) ও তারপর একটা নতুন sandbox payment দিয়ে browser-এ redirect যাচাই — দুটোতেই অনুমতি লাগবে, (২) Admin password rotation — অনুমতি লাগবে, (৩) মানুষের হাতে manual QA, (৪) code commit।
