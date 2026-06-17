# POSKO Mobile

POSKO Mobile adalah aplikasi mobile berbasis Expo React Native untuk membantu pencatatan bantuan bencana. Aplikasi ini digunakan untuk mengelola data barang bantuan, kategori, donatur, penerima, bantuan masuk, distribusi bantuan, dan laporan riwayat transaksi.

## Fitur Utama

* Login pengguna
* Dashboard POSKO
* Data Barang
* Data Kategori
* Data Donatur
* Data Penerima
* Input Bantuan Masuk
* Input Distribusi Bantuan
* Laporan Bantuan Masuk dan Keluar
* Profile dan Logout

## Teknologi

* Expo React Native
* Expo Router
* TypeScript
* Supabase
* React Native Safe Area Context
* FontAwesome Icons

## Cara Menjalankan Project

Clone repository:

```bash
git clone https://github.com/kholifah075/agen_posko_apk-main.git
cd agen_posko_apk-main
```

Install dependency:

```bash
npm install
```

Jalankan project:

```bash
npx expo start -c
```

Scan QR Code menggunakan aplikasi Expo Go di HP.

## Konfigurasi Supabase

Pastikan project sudah terhubung dengan Supabase. File konfigurasi berada di:

```txt
lib/supabase.ts
```

Jika menggunakan `.env`, buat file `.env` dengan format berikut:

```env
EXPO_PUBLIC_SUPABASE_URL=isi_url_supabase
EXPO_PUBLIC_SUPABASE_ANON_KEY=isi_anon_key_supabase
```

## Tabel Supabase yang Dibutuhkan

Aplikasi ini membutuhkan tabel berikut:

* user
* kategori
* barang
* donatur
* penerima
* incoming
* incoming_detail
* outgoing
* outgoing_detail

Kolom tambahan yang diperlukan:

* `incoming.donatur_id`
* `incoming.keterangan`
* `outgoing.penerima_id`
* `outgoing.keterangan`

## Catatan Database

Saat ini stok masih mengikuti tabel `kategori`, bukan stok per barang. Jadi beberapa barang dalam kategori yang sama akan menampilkan stok kategori yang sama.

Jika ingin stok lebih akurat per barang, perlu menambahkan kolom `stok` pada tabel `barang`, lalu mengubah logic Bantuan Masuk dan Distribusi agar update stok barang, bukan stok kategori.

## Alur Aplikasi

1. User login.
2. User masuk ke Dashboard POSKO.
3. User dapat mengelola data master: Barang, Kategori, Donatur, dan Penerima.
4. User mencatat Bantuan Masuk dari Donatur.
5. User mencatat Distribusi Bantuan ke Penerima.
6. User melihat riwayat transaksi pada halaman Laporan.
7. User dapat logout melalui halaman Profile.

## Branch Utama

Project ini menggunakan branch utama:

```txt
main
```

Pastikan selalu menjalankan:

```bash
git pull origin main
```

sebelum mulai mengerjakan perubahan baru.
