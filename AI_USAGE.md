# AI_USAGE.md

Jika kamu tidak memakai AI sama sekali, tulis dan jelaskan kenapa, sebaliknya, jika menggunkana AI harap diisi form dibawah.

## 1. Alat yang dipakai

| Alat / model | Dipakai untuk | Kira-kira porsi dari total kode |
| ------------ | ------------- | ------------------------------- |
| cursor 4.7   | Menambahkan error handler serta melakukan pengecekan dan mengecek logika | 5 - 7% |
| composer 2.5 | Melakukan debugging pada code yang telah dibuat, serta melakukan code suggestions | 4 - 6% |

## 2. Pembagian peran

- Yang saya putuskan sendiri (tanpa AI): Membuat tampilan, dan logika untuk cart list serta 
- Yang saya delegasikan ke AI:
 1. Membuatkan tampilan dasar pada ALERT
 2. Membuatkan tampilan untuk dialog pada promo
- Yang saya minta AI untuk **mengkritik** (review, mencari edge case):
 1. review dari code
 2. cekkan error yang terjadi selama proses development seperti penggunaan function

## 3. Output AI yang saya perbaiki atau tolak (minimal 1, wajib spesifik)
 1. dari tipe data yang didefinisikan, karena yang AI berikan kepada saya ternyata tidak sesuai dengan kondisi data yang ada pada data.json
 2. AI terlalu sering memberikan suggestion yang belum ada dibuat, sehingga ketika saya tab dan dia bakal error, terpaksa saya hapus dan code ulang
 3. 

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

-

## 4. Hal yang AI lewatkan

Apakah AI menangkap ketidakjelasan spec dan keanehan data tanpa kamu arahkan? Sebutkan yang tidak:
1. tipe data yang diberikan dari data, ternyata ada yang string dan number
2. dari sisi promo API, pada date terdapat inkonsistensi value
3. 

## 5. Proses verifikasi
Test, manual check, bandingkan hitungan dengan tangan, dsb.

## 6. Bagian yang tidak saya yakini
Bagian kode yang menurutmu paling rawan salah atau paling kurang kamu pahami.
