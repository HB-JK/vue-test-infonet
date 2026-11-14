# DECISIONS.md

## 1. Pertanyaan mengenai tugas ini (jika ada)

Daftar hal yang ambigu atau bertentangan di spec/data, dan **asumsi yang saya pakai sementara**.

| #   | Pertanyaan / temuan | Asumsi yang saya ambil | Dampak jika asumsi salah |
| --- | ------------------- | ---------------------- | ------------------------ |
| 1   | Karena semua ada di cart, apakah saya bisa membatasi dengan cara memilih saja itemnya? | saya embuatkan checkbox sehingga dari pengguna bisa memilih barang yang akan di checkout, dengan syarat barang yang 0 tidak dapat di pilih | hanya berbeda dari yang diinginkan dari spec nya saja |
| 2   | data yang tersedia ternyata ada typo, serta format yang disediakan ternyata berbeda | saya boleh mengubah nama fieldnya dan mengubah valuenya | maka untuk beberapa perhitungan harus diubah kembali serta pengambil variabelnya |
| 3   | Apakah pengguna tetap bisa menggunakan voucher gratis ongkir apabila diatas 450ribu? | saya tetap memperbolehkan pengguna memilih voucher gratis ongkir | voucher yang digunakan fungsinya jadi duplikat |
| 4   | Apakah perlu semua voucher dimunculkan atau tidak? yang tidak aktif maupun yang expired | saya tidak memunculkan voucher yang sudah expired atau tidak aktif | maka voucher yang seharusnya sudha expired bakal hilang dari pemilihan voucher |

## 2. Rumus perhitungan
Tulis **urutan** perhitungan yang kamu pakai, dari subtotal sampai total, termasuk aturan
pembulatan. Contoh format: `subtotal → diskon → ... → total`.
1. subtotal = harga total dari semua barang yang dipilih disertai quantitynya
2. diskon = subtotal - (harga diskon tergantung persentase atau fix)
3. delivery fee = fix 20000, namun apabila diatas 20000 maka akan jadi 0
4. total = subtotal - diskon + delivery fee

## 3. Temuan tentang data dan API

Apa saja yang tidak konsisten atau mencurigakan yang kamu temukan, dan bagaimana kamu menanganinya (normalisasi, validasi, penandaan ke pengguna, dsb.).

- Temuan: Inkosistensi data pada items (stok dan stock)
  - Penanganan: mengubah datanya secara langsung di data.json
- Temuan: inkonsistensi pada date
  - Penanganan: saya mengkonversi menjadi iso string supaya lebih mudah di cek expiration datenya
- Temuan: max_discount dan maxDiscount
  - Penanganan: saya menambahkan keduanya menjadi satu hal yang sama

## 4. Validasi

Server memvalidasi voucher, tapi perhitungan diskon dan total ada di client. Apa batas & tanggung jawab masing-masing, dan apa yang terjadi jika hasilnya berbeda ?
- batas dan tanggung jawab dari server ialah mengecek apakah data yang digunakan sudah sesuai apa belum, sehingga pengguna tidak bisa sembarangan mengubah lalu tinggal apply.
- dari sisi client digunakan untuk menampilkan proyeksi nilai atau angka supaya tidak salah kaprah dari jumlah total yang harus dibayar nantinya
- apa yang terjadi jika hasilnya berbeda? tentu saja bakal terjadi kekacauan dari sisi client sama server, yang dimana client melihat harganya ternyata berbeda dan akan susah mempercaya harga pada sistem. Sehingga untuk menghindari hal tersebut, ketika nanti melakukan checkout, tidak hanya mengirimkan nilai akhir, melainkan pada sisi server harus dilakukan pengecekan lagi satu per satu harga barang serta quantitynya dan voucher.

## 5. Kebutuhan tersirat yang saya tangkap (di luar spec)

Apa yang kamu tambahkan yang tidak diminta eksplisit?
1. membatasi penampilan voucher yang tidak aktif dan expired
2. pengguna dapat memilih item yang akan dicheckout atau tidak
3. membatasi penambahan apabila melebihi stock atau kurang dari 0 pada UI, dan memunculkan error alert
4. melakukan konversi harga menjadi RP supaya mudah dibaca oleh pengguna
5. saya memastikan menggunakan debounce supaya tidak menembak API setiap kali pengguna menekan tambah atau kurang.

## 6. Yang sengaja tidak saya kerjakan

Dan kenapa. Menyebut ini dengan jujur adalah nilai plus.
1. membuatkan unit testing, karena saya masih fokus terhadap pembuatan fitur utama dari spec yang telah diberikan. Terdapat beberapa kendala juga selama pengerjaan berupa mati lampu dan wifi bermasalah

## 7. Jika ada 1 hari lagi

Urutan prioritas pekerjaan berikutnya:
1. membuatkan unit testing
2. Melakukan debuggin lebih menyeluruh, cuman sejauh ini sudah work untuk dasarnya
3. membuatkan tampilan yang lebih menarik (cuman karena ini belum perlu, bakal menjadi proritas terakhir)
