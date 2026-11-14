# DECISIONS.md

## 1. Pertanyaan mengenai tugas ini (jika ada)

Daftar hal yang ambigu atau bertentangan di spec/data, dan **asumsi yang saya pakai sementara**.

| #   | Pertanyaan / temuan | Asumsi yang saya ambil | Dampak jika asumsi salah |
| --- | ------------------- | ---------------------- | ------------------------ |
| 1   | Karena semua ada di cart, apakah saya bisa membatasi dengan cara memilih saja itemnya? | saya embuatkan checkbox sehingga dari pengguna bisa memilih barang yang akan di checkout, dengan syarat barang yang 0 tidak dapat di pilih | hanya berbeda dari yang diinginkan dari spec nya saja |
| 2   | data yang tersedia ternyata ada typo, serta format yang disediakan ternyata berbeda | saya boleh mengubah nama fieldnya dan mengubah valuenya | maka untuk beberapa perhitungan harus diubah kembali serta pengmabil variabelnya |
| 3   |                     |                        |                          |

## 2. Rumus perhitungan
Tulis **urutan** perhitungan yang kamu pakai, dari subtotal sampai total, termasuk aturan
pembulatan. Contoh format: `subtotal → diskon → ... → total`.

## 3. Temuan tentang data dan API

Apa saja yang tidak konsisten atau mencurigakan yang kamu temukan, dan bagaimana kamu menanganinya (normalisasi, validasi, penandaan ke pengguna, dsb.).

- Temuan:
  - Penanganan:

## 4. Validasi

Server memvalidasi voucher, tapi perhitungan diskon dan total ada di client. Apa batas & tanggung jawab masing-masing, dan apa yang terjadi jika hasilnya berbeda ?

## 5. Kebutuhan tersirat yang saya tangkap (di luar spec)

Apa yang kamu tambahkan yang tidak diminta eksplisit?

## 6. Yang sengaja tidak saya kerjakan

Dan kenapa. Menyebut ini dengan jujur adalah nilai plus.

## 7. Jika ada 1 hari lagi

Urutan prioritas pekerjaan berikutnya.
