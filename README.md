# Take-Home Test: Voucher Belanja

Halo, terima kasih sudah meluangkan waktu untuk mengerjakan test ini. Harap baca terlebih dulu dokumen ini sebelum mengerjakan tugasnya.

## Waktu

**Maksimal 3 hari kerja**.

## Tugas

Buatkan halaman **keranjang belanja**, dimana pelanggan bisa mengubah jumlah barang, memasukkan kode voucher, lalu melihat total bayar.

### Aturan singkat:

- Ada tiga jenis voucher: voucher persen (dengan batas max diskon), voucher nominal tetap, dan voucher gratis ongkir.
- Voucher punya minimal belanja dan masa berlaku.
- Satu voucher per transaksi.
- Ongkir Rp20.000, gratis untuk belanja Rp450.000 ke atas.
- Barang yang stoknya habis tidak ikut dibeli.

Data keranjang dan voucher ada di mock API.

## Stack

- Vue 3.5+, `<script setup>`, TypeScript strict, Vite, Node 20+
- Vitest untuk unit test
- TailwindCSS
- Pilihan lain (Pinia, TanStack Query, UI library, VueUse, dll.) bebas, tapi tulis alasannya

## Menjalankan mock API

```bash
cd mock-api
node server.mjs  # http://localhost:3001/api
curl -X POST localhost:3001/api/__reset # kembalikan data awal
```

Endpoint:

- `GET /api/cart` - ambil data keranjang
- `PATCH /api/cart/items/:sku` dengan body `{ "qty": 3 }` - Ubah jumlah barang
- `GET /api/vouchers`
- `POST /api/vouchers/validate` dengan body `{ "code": "...", "subtotal": 123000 }`

## Deliverable

1. Repo Git dengan **commit history asli** (bukan satu commit final).
2. `RESULT.md`: berisi cara menjalankan project, daftar **apa yang selsai** dan **apa yang tidak sempat dikerjakan**.
3. `DECISIONS.md` (template disediakan).
4. `AI_USAGE.md` (template disediakan).

## Penggunaan AI

**Pamakaian AI diperbolehkan.** Yang dinilai adalah penilaianmu atas output AI, bukan pemakainya. Yang tidak diterima adalah menyembunyikannya.
