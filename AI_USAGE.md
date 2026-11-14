# AI_USAGE.md

Jika kamu tidak memakai AI sama sekali, tulis dan jelaskan kenapa, sebaliknya, jika menggunkana AI harap diisi form dibawah.

## 1. Alat yang dipakai

| Alat / model | Dipakai untuk | Kira-kira porsi dari total kode |
| ------------ | ------------- | ------------------------------- |
| cursor 4.7   | Menambahkan error handler serta melakukan pengecekan dan mengecek logika | 8 - 10% |
| composer 2.5 | Melakukan debugging pada code yang telah dibuat, serta melakukan code suggestions | 4 - 6% |

## 2. Pembagian peran

- Yang saya putuskan sendiri (tanpa AI): Membuat tampilan, dan logika untuk cart list dan voucher
- Yang saya delegasikan ke AI:
 1. Membuatkan tampilan dasar pada ALERT
 2. Membuatkan tampilan untuk dialog pada promo
 3. melakukan perbaikan dari code yang error seperti type, dan penggunaan function
 4. Melakukan proses debugging serta memberikan solusi dari permasalahan yang ditemukan
 
- Yang saya minta AI untuk **mengkritik** (review, mencari edge case):
 1. Meminta AI untuk melakukan review pada code yang telah saya buat
 2. Meminta AI untuk mencari edge case atau titik buta pada code yang telah saya buat dengan hasil sebenarnya
 3. Meminta AI untuk membuatkan saya daftar pengerjaan, dan solusi dari hal yang saya bingunkan supaya lebih optimal di masa pengejrannya

## 3. Output AI yang saya perbaiki atau tolak (minimal 1, wajib spesifik)
 1. dari tipe data yang didefinisikan, karena yang AI berikan kepada saya ternyata tidak sesuai dengan kondisi data yang ada pada data.json
 2. AI terlalu sering memberikan suggestion yang belum ada dibuat, sehingga ketika saya tab dan dia bakal error, terpaksa saya hapus dan code ulang

### Kasus 1

- Prompt singkat:
 help me define the variable type? should I put on separate file or put it on the same file for item?
- Apa yang AI hasilkan:
 // src/types/cart.ts

/** As returned from GET /api/cart — intentionally messy */
export type CartItemApi = {
  sku: string
  name: string
  price: number | string
  qty?: number
  quantity?: number
  stock?: number
  stok?: number
}

export type ShippingApi = {
  fee: number
  free_above: number
}

export type CartApiResponse = {
  items: CartItemApi[]
  shipping: ShippingApi
}

/** What the UI and cart store should use after normalization */
export type CartItem = {
  sku: string
  name: string
  price: number
  qty: number
  stock: number
}

export type Cart = {
  items: CartItem[]
  shipping: ShippingApi
}
- Apa yang salah / kurang:
 1. ternyata dari data yang diberikan terdapat inkonsistensi dari field seperti stock dan stok, dan tipe datanya
 2. belum ada promo API nya
- Bagaimana saya menyadarinya (test, baca kode, jalankan, curiga pada data):
 1. saya menyadarinya ketika saya mencoba menampilkan data (kebetulan saya sudah membuatkan price format sebelum memunculkan data, hasilnya ada yang punya Rp dan tidak ada)
- Apa yang saya lakukan:
 1. melakukan perbaikan nama field pada data.json
 2. menambahkan definisi type data sendiri

### Kasus 2
- Prompt singkat:
 I want add debounce effect for update quantity, and what if the user is remove the dsiable manually and it clicked the minus below 1 or clicked plus more than the availbale stock
- apa yang AI hasilkan:
 Debounce (API, not the UI)
Update Pinia immediately on each +/- so the number feels instant.
Debounce PATCH (~400ms) per sku in the store so rapid clicks send one request with the final qty.
That's in cart.store.ts: setCartQty → scheduleQtyPatch → syncQtyToApi.

If someone bypasses disabled
disabled is only UI. DevTools can remove it or trigger clicks anyway, so use two layers:

Handlers (ItemCard): compute next with clampCartQty, bail if nothing changed (canIncrease / canDecrease + clamp).
Store (setCartQty): clamp again with current stock so nothing invalid gets into state or the debounced payload.
Rules in src/utils/cartQty.ts: min 1 while the row exists (if stock > 0), max stock, no increase when stock === 0.

API fallback: if the mock returns INSUFFICIENT_STOCK, qty (and stock) are corrected from available.
disabled:pointer-events-none cuts accidental double-clicks; clamp + early return is what actually blocks “minus below 1” / “plus above stock” when disabled is removed.
- apa yang salah / kurang:
 1. sebenarnya sudah bagus, cuman dari sisi penampilan error kepada pengguna saja yang masih perlu diperjelas
- bagaimana saya menyadarinya (test, baca kode, jalankan, curiga pada data):
 1. setelah saya menjalankan codenya
- apa yang saya lakukan:
 1. saya menambahkan alert supaya dari sisi pengguna dapat lebih jelas untuk mendapatkan infonya
 2. Mengubah response pada API handler ketika error code insufficient_stock, serta memastikan semua response dapat menggunakan error alert

### Kasus 3

- prompt singkat:
 help me review the code and the rules that has defined on @README.md 

and the data of server.mjs 

if you have anything that wrong, or it can manipulate by user manually, please tell me, define it with list
- apa yang AI hasilkan:
 ## Review vs `README.md` rules

| Rule (README) | Status | Notes |
|---------------|--------|--------|
| Cart page: change qty, voucher, see total | Partial | Works after user **checks** items; subtotal starts at **0** with nothing selected |
| 3 voucher kinds (%, fixed cap, free shipping) | Partial | Client supports `percentage` for messy data; **`PAYDAY75`** uses `maxDiscount` (camelCase), not read → no cap |
| Min spend & expiry | Partial | Server validates min spend on **client-sent** `subtotal`; expiry rules differ client vs server for date-only strings |
| **One voucher per transaction** | Mostly OK in UI | `isPromoApplicable` blocks a second code; **`applyPromo` / Pinia** do not hard-enforce it |
| Shipping Rp20.000, free ≥ Rp450.000 | OK | From `data.json` via `cart.shipping` |
| **Out-of-stock not bought** | Partial | Checkbox disabled; **SKU-005** still shows qty **1** with stock **0** (can't select, can't decrease to 0 in UI) |
| Mock API | OK | Wired via `VITE_API_URL` |
| Stack (Vue 3.5+, TS, Vite, Tailwind) | OK | Present |
| **Vitest unit tests** | Not met | `RESULT.md` admits none; leftover `App.spec.ts` still expects `"You did it!"` |
| Deliverables (`DECISIONS.md`, etc.) | Partial | `DECISIONS.md` mostly template; calculation / API findings sections empty |

---

## Spec / implementation mismatches (not user manipulation)

1. **Checkout selection (checkbox)** — README describes a shopping cart, not opt-in lines. You documented this in `DECISIONS.md`; a reviewer may still treat it as off-spec.
2. **Default subtotal 0** — Nothing is pre-selected, so totals and vouchers look broken until checkboxes are ticked.
3. **Uncontrolled checkbox** — No `:checked` tied to `selectedItems`; uses `includes(props.item)` (reference equality). After `setCartQty` clones cart rows, selection/UI can desync.
4. **`unselectItem` + `min_spend === 0`** — Filter uses `p?.min_spend && …`, so **`0` is falsy** and drops vouchers like `GRATISONGKIR` / `PROMO100K` when deselecting items.
5. **PATCH sync** — `handleCartQtyPatchResponse` updates `cart` but not **`selectedItems`**; totals can disagree with server qty.
6. **Duplicate `HEMAT10` in list** — `v-for :key="promo.code"` collides; server picks one record on validate, UI shows two.
7. **Stale unit test** — Would fail if you ran Vitest.

---

## `data.json` + `server.mjs` issues

**Data**

8. **Inconsistent voucher shape** — `percent` vs `percentage`, `max_discount` vs `maxDiscount`, date-only vs ISO (`DISKON50K`).
9. **Duplicate code `HEMAT10`** — Two active rows; server keeps “active + not expired” (see server logic).
10. **`PROMO100K`** — `min_spend: 0`, `value: 100000` — extreme for testing; easy to drive total to **0** on client.
11. **`PAYDAY75`** — `type: "percentage"`, `maxDiscount: null` — client never applies a max cap (wrong field name).
12. **`SKU-005`** — `stock: 0`, `qty: 1` — awkward for “habis tidak ikut dibeli”.

**Server behavior**

13. **`POST /api/vouchers/validate` trusts `subtotal` from the body** — No server-side cart; only validates code, active, expiry, `min_spend` against **submitted** subtotal.
14. **No “one voucher” rule on server** — Only eligibility per code.
15. **No discount/total on server** — All amounts are client-side.
16. **`PATCH` stock errors return HTTP 200** with `{ error: 'INSUFFICIENT_STOCK' }` — Fine for mock, easy to mishandle if code only checks `response.ok`.
17. **`POST /api/__reset`** — Open; anyone can reset mock DB.
18. **CORS `*`** — Any origin can call the mock API (local dev risk).
19. **`MOCK_NOW` env** — Time travel for expiry tests (good for tests, changes behavior if set).
20. **Code match** — Exact, case-sensitive, **no trim** (`server.mjs` comment).
21. **`qty` / `quantity` and `stock` / `stok`** — Server accepts both naming styles on PATCH.

---

## What a user can manipulate manually

**Browser / app (Pinia, UI, DevTools)**

22. Edit **`cartStore.subtotal`**, **`selectedPromo`**, **`discountPrice`**, **`total`** — Displayed checkout total can diverge from reality (no server checkout).
23. Call **`applyPromo(voucher)`** directly — Skip **`/vouchers/validate`** (e.g. inactive `NEWUSER` from a prior `GET /vouchers` if they still have the object).
24. Stack multiple promos via store if they bypass UI guards.
25. Change qty in UI up to **`clampCartQty`** before PATCH; server may still reject with `INSUFFICIENT_STOCK`.

**HTTP (curl, Postman, modified fetch)**

26. **`POST .../vouchers/validate`** with inflated **`subtotal`** — Pass `min_spend` on server while real selected subtotal is lower; client still applies discount on **real** `subtotal` (illogical but confusing; edge case if UI trust is “server said valid”).
27. Deflated **`subtotal`** — Fail validation when cart would qualify.
28. **`PATCH .../cart/items/:sku`** — Set `qty` within server rules regardless of checkboxes.
29. **`POST /api/__reset`** — Reset data for everyone on that mock instance.

**Not really tamperable for totals (mock design)**

30. Voucher **rules** (active, expiry, not found) for a given code + **submitted** subtotal — unless they forge responses or run their own API.

---

## Calculation order (client) vs README intent

Current flow: **selected lines → subtotal → discount (sum of all `selectedPromo`, floor %) → shipping (free-shipping voucher OR `subtotal < free_above` ? fee : 0) → total** (clamped ≥ 0).

Gaps vs a strict reading:

- Discount is **not** re-validated on server after qty changes.
- **No re-validation** when subtotal drops below `min_spend` (except partial cleanup in `unselectItem`).
- **`DECISIONS.md` §2** (formula / rounding) is still empty — README-style reviewers expect that written down.

---

## Quick severity summary

| Severity | Items |
|----------|--------|
| High (integrity / spec) | Client-only totals (#13–15, #22–24), fake `subtotal` on validate (#26), checkbox cart model vs README (#1–2) |
| Medium (bugs) | `min_spend === 0` promo drop (#4), selectedItems vs PATCH (#5), checkbox refs (#3), `PAYDAY75` max discount (#11) |
| Low / doc / test | Vitest missing (#README), stale `App.spec.ts`, empty `DECISIONS.md`, duplicate `HEMAT10` keys, responsive/animations per `RESULT.md` |

I can turn this into filled **`DECISIONS.md` §2–§4** or a short fix list (auto-select in-stock lines, enforce one voucher in `applyPromo`, server subtotal from cart) if you want that next.
- apa yang salah / kurang:
 1. Tidak ada yang salah, karena promtnya khusus untuk review
- bagaimana saya menyadarinya (test, baca kode, jalankan, curiga pada data): -
- apa yang saya lakukan:
 1. memperbaiki error pada tampilan serta pemilihan voucher


## 4. Hal yang AI lewatkan

Apakah AI menangkap ketidakjelasan spec dan keanehan data tanpa kamu arahkan? Sebutkan yang tidak:
1. tipe data yang diberikan dari data, ternyata ada yang string dan number
2. dari sisi promo API, pada date terdapat inkonsistensi value

## 5. Proses verifikasi
Test, manual check, bandingkan hitungan dengan tangan, dsb.

## 6. Bagian yang tidak saya yakini
Bagian kode yang menurutmu paling rawan salah atau paling kurang kamu pahami:
1. pemilihan voucher, kalau misalnya sudah lebih dari 450k, apakah voucher gratis ongkir masih dipertahankan atau tidak
2. Item yang tersedia di cart saya buat menjadi bisa dipilih dan tidak dipilih supaya mempermudah mengetahui yang mana stok habis atau tidak
3. Apakah hanya sampai menampilkan hasil total atau ada checkout
