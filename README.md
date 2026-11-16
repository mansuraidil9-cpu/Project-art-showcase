# Ruang Karya

Proyek final Praktikum Pemrograman Web 2026, Sistem Informasi Universitas Hasanuddin. Tema: Art Showcase Platform.

Tahap saat ini: **Hari 6 — moderasi dan dashboard**. Statistik Admin, antrean moderasi dengan dismiss/take down, daftar Favorit Saya, dan ringkasan dashboard Member sudah tersedia. Fitur challenge dilanjutkan pada Hari 7–8.

## Teknologi

Next.js 15.5 (App Router), JavaScript/JSX, Tailwind CSS 4, PostgreSQL, dan pg dengan Raw SQL. bcryptjs dipakai untuk password dan jose untuk JWT. Middleware memverifikasi JWT dari cookie tanpa koneksi database. Halaman server, server action, dan route handler memeriksa sesi aktif serta role/status terkini melalui pg.

Lingkungan pengguna: Node.js 24.21.0, klien psql 18.6, Windows, PowerShell. Versi server diperiksa melalui npm run db:check, bukan hanya versi psql.

## Menjalankan di Windows

Buka PowerShell, lalu ambil proyek dari repository akun tugas. Perintah berikut membuat folder Project-art-showcase di Documents. Jika folder tersebut sudah ada, gunakan folder baru atau buka proyek yang sudah dikloning.

```powershell
Set-Location "$env:USERPROFILE\Documents"
git clone https://github.com/mansuraidil9-cpu/Project-art-showcase.git
Set-Location .\Project-art-showcase
code .
npm ci
Copy-Item .env.example .env.local
code .env.local
npm run auth:secret
```

Isi PGPASSWORD dengan password PostgreSQL lokalmu. Biarkan PGHOST=localhost, PGPORT=5432, PGDATABASE=art_showcase, dan PGUSER=postgres. Password koneksi terpisah dari password akun aplikasi. auth:secret menyimpan kunci acak ke .env.local tanpa mencetak nilainya, serta mempertahankan kunci yang sudah valid. Jangan unggah .env.local. Mulai ulang server setelah konfigurasi berubah.

## Memperbarui dari Hari 1

Jika proyek sudah dikloning, jalankan dari folder proyek:

```powershell
git pull --ff-only
npm ci
npm run auth:secret
```

Pada Query Tool pgAdmin untuk art_showcase, jalankan **database/migrations/002-auth.sql**. Migrasi menambah sessions dan auth_limits tanpa menghapus data Hari 1, serta aman dijalankan ulang. Untuk instalasi dari nol, gunakan schema.sql dan seed.sql seperti di bawah.

## Database di pgAdmin

Hari 3–6 tidak menambah tabel atau mengubah skema. Jika database Hari 2 sudah berjalan, cukup perbarui kode; migrasi SQL tambahan tidak diperlukan.

1. Buka server PostgreSQL lokal dan login.
2. Klik kanan Databases > Create > Database. Nama: art_showcase.
3. Buka Query Tool pada database **art_showcase**.
4. Buka dan jalankan database/schema.sql, lalu database/seed.sql.
5. Jalankan database/queries/platform.sql untuk melihat ringkasan.
6. Lihat docs/erd.md untuk hubungan tabel.

SQL tidak membuat atau menghapus database. schema.sql bisa dijalankan ulang pada skema Hari 1 tanpa menghapus data. seed.sql tidak menimpa baris lama. Untuk benar-benar menguji dari nol, buat database kosong baru, jalankan schema dan seed, lalu arahkan PGDATABASE ke database tersebut. Perubahan skema berikutnya akan disertai SQL migrasi.

Alternatif PowerShell, setelah database dibuat:

```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -p 5432 -U postgres -d art_showcase -v ON_ERROR_STOP=1 -f .\database\schema.sql
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -p 5432 -U postgres -d art_showcase -v ON_ERROR_STOP=1 -f .\database\seed.sql
npm run db:check
npm run db:test
npm run auth:test
npm run dev
```

Buka http://localhost:3000. Jika koneksi benar, terlihat 3 kreator, 6 karya, 3 kurator, dan 1 challenge aktif saat seed pertama dijalankan. Nilai challenge berubah mengikuti waktu. Jika koneksi belum siap, halaman menampilkan petunjuk tanpa membocorkan kredensial.

## Akun contoh

Semua akun demo memakai password **RuangKarya2026!**, disimpan sebagai hash bcrypt biaya 12. Akun ini sudah bisa dipakai di /login.

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
- database/schema.sql: 14 tabel, indeks, constraint, dan trigger.
- database/migrations/: perubahan untuk database yang sudah berisi data.
- database/seed.sql: akun dan data contoh.
- database/queries/: semua query yang dipakai aplikasi.
- database/tests/: SQL pengujian yang tidak menyimpan perubahan.
- scripts/check-db.mjs: pemeriksaan koneksi.
- scripts/test-admin.mjs: pengujian aturan Admin dengan akun/data uji sementara.
- scripts/test-artworks.mjs: pengujian upload, kepemilikan, tags, dan galeri.
- scripts/test-member.mjs: pengujian interaksi, laporan unik, profil/foto, dan perubahan akun privat.
- scripts/test-moderation.mjs: pengujian statistik, keputusan moderasi, penghapusan relasi, dan favorit privat.
- public/examples/: ilustrasi seed.
- public/uploads/: lokasi karya dan foto profil unggahan; isinya tidak masuk Git.
- docs/: ERD, catatan pemahaman, dan hasil pemeriksaan.

Panduan autentikasi dan bahan tanya jawab tersedia di docs/autentikasi.md. Hasil pengujian tahap ini ada di docs/verifikasi-hari-2.md.

Panduan modul Admin tersedia di docs/admin.md dan hasil pengujiannya di docs/verifikasi-hari-3.md.

Panduan karya tersedia di docs/karya.md dan hasil pemeriksaannya di docs/verifikasi-hari-4.md.

Panduan interaksi dan pengaturan akun tersedia di docs/member.md, dengan hasil pemeriksaan di docs/verifikasi-hari-5.md.

Panduan moderasi dan dashboard tersedia di docs/moderasi-dashboard.md, dengan hasil pemeriksaan di docs/verifikasi-hari-6.md.

## Mencoba moderasi dan dashboard

Hentikan server lama dengan Ctrl+C, lalu jalankan dari folder proyek di PowerShell:

```powershell
git pull --ff-only
npm ci
npm run moderation:test
npm run build
npm run dev
```

Tidak ada migrasi tambahan. Akun dan data yang sudah ada tetap dipakai.

1. Masuk sebagai Member, buka karya kreator lain, lalu simpan ke favorit. Lihat hasilnya pada Dashboard Member > Favorit Saya.
2. Daftar favorit menyediakan tombol hapus dan paginasi. Penghapusan favorit tidak menghapus karya aslinya.
3. Laporkan karya uji milik akun Member lain, kemudian keluar dan masuk sebagai Admin.
4. Buka Ringkasan untuk melihat total akun per peran, karya, laporan menunggu, dan challenge aktif.
5. Buka Moderasi Konten > Tinjau laporan. Abaikan laporan untuk mempertahankan karya, atau buka Hapus karya dan centang konfirmasi untuk menghapusnya.
6. Uji penghapusan pada karya percobaan. Tindakan ini juga menghapus komentar, favorit, laporan, dan submisi/pemenang terkait.
7. Di pgAdmin: pilih art_showcase > Query Tool > ikon folder > buka database/check-moderation.sql > F5. File ini hanya membaca statistik, antrean, audit laporan, dan favorit.

moderation:test membuat akun/data sementara dan membersihkannya. Pengujian mencakup dua Admin bersamaan, rollback penghapusan berelasi, challenge aktif dibanding mendatang/berakhir, serta paginasi dan privasi favorit. Jalankan pada database pengembangan yang sudah berisi schema dan seed.

## Mencoba interaksi dan profil

Perbarui kode dari folder Project-art-showcase di PowerShell:

```powershell
git pull --ff-only
npm ci
npm run member:test
npm run build
npm run dev
```

Jika server lama berjalan, hentikan dahulu dengan Ctrl+C. Tidak perlu menyalin ulang .env.local, menjalankan seed, atau membuat ulang akunmu.

1. Masuk sebagai Member. Buka detail karya kreator lain dari beranda.
2. Coba Suka/Batalkan suka, Simpan ke favorit/Hapus dari favorit, dan kirim komentar. Hapus komentar milikmu sendiri.
3. Buka Laporkan karya, isi alasan serta penjelasan. Laporan kedua untuk karya yang sama ditolak; karya sendiri tidak dapat dilaporkan.
4. Buka dashboard > Profil Publik. Ubah nama, bio, tautan, dan foto JPEG/PNG/WebP maksimal 2 MB.
5. Buka Lihat profil publik untuk memeriksa hasilnya. Email tidak ditampilkan di sana.
6. Di Akun Privat, uji perubahan email/password dengan akun percobaan. Password saat ini wajib cocok dan perubahan berhasil akan mengakhiri semua sesi.
7. Di pgAdmin, pilih art_showcase > Query Tool > ikon folder, buka database/check-member.sql, lalu F5. File ini hanya membaca data dan tidak menampilkan hash password.

member:test membuat akun, karya, kategori, dan foto sementara lalu membersihkannya. Akun contoh dan data pengguna tetap dipertahankan. Jalankan pada database pengembangan yang sudah diisi schema dan seed.

Favorit dapat disimpan/dibatalkan pada detail karya atau dikelola melalui halaman Favorit Saya di dashboard Member.

## Mencoba karya dan galeri

Hari 4 menambah dependency sharp untuk memeriksa dan memproses gambar. Setelah git pull --ff-only, jalankan npm ci pada folder proyek lalu mulai ulang server. Tidak ada migrasi SQL tambahan; skema tetap 14 tabel.

1. Masuk sebagai Member, misalnya nadia@ruangkarya.test dengan password contoh.
2. Buka Karya Saya > Unggah Karya. Lengkapi judul, deskripsi, kategori, dan tags.
3. Pilih JPEG, PNG, atau WebP statis, maksimal 5 MB serta 20 megapiksel.
4. Setelah berhasil, buka detail dan coba edit metadata. File karya tetap.
5. Kunjungi beranda untuk mencoba pencarian berdasarkan judul/kreator, kategori, dan urutan populer.
6. Di pgAdmin, buka database/check-artworks.sql melalui ikon folder Query Tool untuk melihat metadata dan tags.

```powershell
npm run artwork:test
```

Pengujian ini memakai akun/data sementara, memeriksa gambar palsu dan batas ukuran, serta memastikan rollback membersihkan berkas baru. Jalankan pada database pengembangan yang sudah diisi schema dan seed.

File unggahan tersimpan di public/uploads pada komputer yang menjalankan server, dan tidak masuk Git. Untuk memindahkan data pribadi ke komputer lain, salin database dan folder uploads secara terpisah. Data seed memakai gambar public/examples yang sudah disertakan dalam repository.

## Mencoba modul Admin

Masuk di /login sebagai admin@ruangkarya.test, password RuangKarya2026!. Menu Admin menyediakan kategori, pengguna, dan verifikasi Curator.

- Kategori: tambah nama baru, coba nama yang hanya berbeda kapitalisasi, lalu edit atau hapus kategori yang belum dipakai karya.
- Pengguna: pilih filter peran dan coba hapus akun uji Member/Curator dengan mengetik ulang emailnya. Akun Admin dilindungi.
- Verifikasi: daftarkan akun Curator uji melalui /register, lalu setujui atau tolak dari akun Admin. Penolakan wajib disertai alasan.

Jalankan database/check-admin.sql melalui ikon folder Query Tool untuk memeriksa hasil perubahan. File tersebut berisi query baca saja.

```powershell
npm run admin:test
```

Pengujian ini membuat akun dan data sementara pada database pengembangan, lalu membersihkannya. Akun seed dan data pribadi yang sudah ada tetap dipertahankan. Pengujian mencakup akses non-Admin, perlindungan Admin, kategori terpakai, verifikasi bersamaan, penghapusan relasi, serta pembersihan berkas unggahan.

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

Tambahkan npm run auth:test untuk memeriksa validasi, JWT, pencabutan sesi, transaksi pendaftaran, perubahan status Curator, dan counter percobaan. Gunakan database pengembangan yang sudah dimigrasi. Login produksi memakai cookie Secure sehingga server yang diakses melalui jaringan harus menggunakan HTTPS; npm run dev cocok untuk pengujian HTTP lokal.

Jalankan npm run auth:token-test untuk menguji verifikasi JWT tanpa koneksi database. Middleware berada di root middleware.js karena proyek menggunakan app/ di root dan tidak memakai folder src/.

## Git dan GitHub

Repository: https://github.com/mansuraidil9-cpu/Project-art-showcase

Branch main sudah diunggah ke akun tugas. Identitas penulis commit dan akun yang dipakai login GitHub adalah dua hal berbeda. Setelah git clone di Windows, tetapkan identitas lokal repository:

```powershell
git config --local user.name "mansuraidil9-cpu"
git config --local user.email "230917730+mansuraidil9-cpu@users.noreply.github.com"
git remote -v
git status
```

git clone otomatis memasang origin; tidak perlu menjalankan git remote add lagi. Untuk perubahan selanjutnya, periksa dahulu file yang berubah, lalu commit dan push:

```powershell
git status
git add .
git diff --cached
git commit -m "Jelaskan perubahan yang sudah selesai"
git push
```

Jika Git Credential Manager membuka halaman login, pilih akun mansuraidil9-cpu. Jangan masukkan password atau token ke URL. .env.local dan file unggahan diabaikan Git. Pastikan keduanya tidak muncul dalam daftar perubahan sebelum commit.

## Jadwal

15 November: fondasi; 16: autentikasi; 17: Admin; 18: karya; 19: interaksi/profil; 20: moderasi/statistik; 21–22: challenge; 23: pengujian; 24: finalisasi. Tanggal 25 hanya cadangan. Tahap berikutnya dimulai setelah instruksi “lanjut”.

