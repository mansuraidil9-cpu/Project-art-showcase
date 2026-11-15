# Bahan pemahaman Hari 1

1. **App Router:** folder app menentukan halaman dan layout. page.js adalah Server Component sehingga query database tidak dikirim ke browser. lib/db.js memakai server-only untuk mencegah impor ke Client Component.
2. **Raw SQL:** aplikasi membaca SQL dari database/queries. Nilai memakai parameter $1 dan array values; PostgreSQL memisahkan data dari sintaks SQL.
3. **Relasi:** tags memakai tabel penghubung. Submisi dan pemenang memakai foreign key gabungan agar kepemilikan karya serta asal challenge konsisten.
4. **Constraint dan backend:** UNIQUE mencegah duplikasi walau dua permintaan datang bersamaan. Backend tetap harus memeriksa sesi, role, kepemilikan, dan waktu; constraint tidak menggantikan otorisasi.
5. **Transaksi dan pool:** BEGIN/COMMIT/ROLLBACK harus pada koneksi yang sama. Pool menghemat koneksi; release di finally mencegah koneksi tertahan ketika gagal.

## Latihan menjelaskan

- Mengapa email dinormalisasi menjadi huruf kecil?
- Apa bedanya ON DELETE CASCADE dengan RESTRICT?
- Mengapa waktu challenge memakai timestamptz?
- Mengapa hash password tidak bisa dipakai sebagai password saat login?
- Mengapa npm run build bisa berhasil meskipun database belum terhubung?

Jawab dengan membuka SQL dan helper, lalu tunjukkan baris yang mendukung jawabanmu. Login baru diterapkan Hari 2.

