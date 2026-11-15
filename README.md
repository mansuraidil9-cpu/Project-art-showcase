# Ruang Karya

Proyek final Praktikum Pemrograman Web 2026, Sistem Informasi Universitas Hasanuddin. Tema: Art Showcase Platform.

Tahap saat ini: **Hari 1 — fondasi dan database**. Halaman awal menampilkan status koneksi serta tiga contoh karya. Login, dashboard, unggah, dan interaksi belum dibuat.

## Teknologi

Next.js 15 (App Router), JavaScript/JSX, Tailwind CSS 4, PostgreSQL, dan pg dengan Raw SQL. bcryptjs dan jose sudah dipasang untuk autentikasi Hari 2. Next.js 15 dipilih agar proteksi tetap memakai middleware.js sesuai rencana.

Lingkungan pengguna: Node.js 24.21.0, klien psql 18.6, Windows, PowerShell. Versi server diperiksa melalui npm run db:check, bukan hanya versi psql.

## Menjalankan di Windows

Ekstrak proyek ke folder milikmu, misalnya Documents\\art-showcase. Buka folder tersebut di VS Code, lalu terminal PowerShell. Jangan bekerja di C:\\Windows\\System32.

```powershell
Set-Location "$env:USERPROFILE\\Documents\\art-showcase"
npm ci
Copy-Item .env.example .env.local
code .env.local
```

Isi PGPASSWORD dengan password PostgreSQL lokalmu. Biarkan PGHOST=localhost, PGPORT=5432, PGDATABASE=art_showcase, dan PGUSER=postgres. Password koneksi terpisah dari password akun aplikasi. SESSION_SECRET baru digunakan Hari 2. Jangan unggah .env.local.

## Database di pgAdmin

1. Buka server PostgreSQL lokal dan login.
2. Klik kanan Databases > Create > Database. Nama: art_showcase.
3. Buka Query Tool pada database **art_showcase**.
4. Buka dan jalankan database/schema.sql, lalu database/seed.sql.
5. Jalankan database/queries/platform.sql untuk melihat ringkasan.
6. Lihat docs/erd.md untuk hubungan tabel.

SQL tidak membuat atau menghapus database. schema.sql bisa dijalankan ulang pada skema Hari 1 tanpa menghapus data. seed.sql tidak menimpa baris lama. Untuk benar-benar menguji dari nol, buat database kosong baru, jalankan schema dan seed, lalu arahkan PGDATABASE ke database tersebut. Perubahan skema berikutnya akan disertai SQL migrasi.

Alternatif PowerShell, setelah database dibuat:

```powershell
& "C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -h localhost -p 5432 -U postgres -d art_showcase -v ON_ERROR_STOP=1 -f .\\database\\schema.sql
& "C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -h localhost -p 5432 -U postgres -d art_showcase -v ON_ERROR_STOP=1 -f .\\database\\seed.sql
npm run db:check
npm run db:test
npm run dev
```

Buka http://localhost:3000. Jika koneksi benar, terlihat 3 kreator, 6 karya, 3 kurator, dan 1 challenge aktif saat seed pertama dijalankan. Nilai challenge berubah mengikuti waktu. Jika koneksi belum siap, halaman menampilkan petunjuk tanpa membocorkan kredensial.

## Akun contoh

Semua akun demo memakai password **RuangKarya2026!**, disimpan sebagai hash bcrypt biaya 12. Akun ini baru bisa dipakai login setelah Hari 2.

| Peran/status | Email |
| --- | --- |
| Admin | admin@ruangkarya.test |
| Member | nadia@ruangkarya.test |
| Member | fajar@ruangkarya.test |
| Member | ayu@ruangkarya.test |
| Curator approved | kurator@ruangkarya.test |
| Curator pending | pending@ruangkarya.test |
| Curator rejected | rejected@ruangkarya.test |

Data dan identitas contoh bersifat fiktif. Enam SVG merupakan ilustrasi abstrak lokal untuk pengujian, bukan karya portofolio sungguhan. SVG contoh berada di public/examples; ini bukan izin menerima SVG dari unggahan pengguna. Validasi unggahan dibuat Hari 4.

## Struktur

- app/: halaman, layout, loading, error, dan 404.
- lib/db.js: pool koneksi, pemuatan SQL, dan helper transaksi.
- database/schema.sql: 12 tabel, indeks, constraint, dan trigger.
- database/seed.sql: akun dan data contoh.
- database/queries/: semua query yang dipakai aplikasi.
- database/tests/: SQL pengujian yang tidak menyimpan perubahan.
- scripts/check-db.mjs: pemeriksaan koneksi.
- public/examples/: ilustrasi seed.
- public/uploads/: lokasi unggahan mendatang; isinya tidak masuk Git.
- docs/: ERD, catatan pemahaman, dan hasil pemeriksaan.

## Query dan transaksi

query("preview", [3]) membaca preview.sql dan mengirim 3 sebagai parameter $1. Nama file query berasal dari daftar internal, bukan input pengguna. Jangan merangkai input pengguna ke SQL.

withTransaction(callback) meminjam **satu koneksi** untuk BEGIN, seluruh query callback, lalu COMMIT atau ROLLBACK. Callback harus meneruskan client, misalnya query(nama, values, client). finally selalu mengembalikan koneksi ke pool. Isi operasi transaksi beberapa tabel dibuat pada tahap fiturnya.

## Pemeriksaan

```powershell
npm run lint
npm run build
npm start
```

Build tidak memerlukan database aktif karena halaman dirender saat permintaan (force-dynamic). Keberhasilan build tidak membuktikan koneksi; gunakan db:check dan browser juga.

Pengujian constraint di pgAdmin: jalankan database/tests/constraints.sql setelah seed. Skrip membatalkan perubahan pada akhir tes. Jika gagal, jalankan ROLLBACK sebelum mengulang. npm run db:test menguji constraint dan helper transaksi pada dua tabel dengan data uji sementara. Jalankan pada database pengembangan yang sudah di-seed. Hasil verifikasi lingkungan pengembangan dicatat di docs/verifikasi-hari-1.md.

## Git dan akun GitHub berbeda

Identitas penulis commit dan akun yang dipakai login GitHub adalah dua hal berbeda. Tetapkan identitas hanya untuk repository ini setelah data akun dipastikan:

```powershell
git config --local user.name "mansuraidil9-cpu"
git config --local user.email "230917730+mansuraidil9-cpu@users.noreply.github.com"
git status
```

Jika memakai paket ZIP tanpa folder .git:

```powershell
git init -b main
git add .
git commit -m "Siapkan fondasi Next.js dan database Ruang Karya"
```

Buat repository kosong pada akun GitHub untuk tugasmu. Jangan tambahkan README, lisensi, atau gitignore dari GitHub saat membuatnya. Setelah URL tersedia:

```powershell
git remote add origin https://github.com/USERNAME/NAMA_REPOSITORY.git
git push -u origin main
```

Ganti USERNAME dan NAMA_REPOSITORY dengan milik akun tugas. Jika Git Credential Manager meminta login, pilih akun tugas tersebut. Jangan masukkan password atau token ke URL. Repo ini belum dihubungkan ke akun GitHub mana pun.

Jika menerima paket Git bundle, kloning untuk mempertahankan commit:

```powershell
git clone .\\ruang-karya-hari-1.bundle art-showcase
Set-Location .\\art-showcase
git remote remove origin
npm ci
```

Setelah itu isi konfigurasi lokal dan tambahkan remote GitHub seperti di atas.

## Jadwal

15 November: fondasi; 16: autentikasi; 17: Admin; 18: karya; 19: interaksi/profil; 20: moderasi/statistik; 21–22: challenge; 23: pengujian; 24: finalisasi. Tanggal 25 hanya cadangan. Tahap berikutnya dimulai setelah instruksi “lanjut”.

