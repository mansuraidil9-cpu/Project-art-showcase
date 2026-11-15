# Pemeriksaan Hari 2

Dijalankan 16 November 2026 WITA pada Linux cloud, Node.js 24.22.1, PostgreSQL 18.6, Next.js 15.5.29, dan Chromium. Pengguna tetap perlu menjalankan pemeriksaan lokal Windows setelah git pull.

| Pemeriksaan | Hasil |
| --- | --- |
| Migrasi 002-auth.sql dijalankan dua kali | Lulus |
| schema.sql dan seed.sql dari database kosong, lalu dijalankan ulang | Lulus, 14 tabel |
| npm run db:test | Lulus, pengujian Hari 1 tetap berjalan |
| npm run auth:test | Lulus |
| npm run auth:token-test tanpa konfigurasi PostgreSQL | Lulus |
| Build middleware Edge tanpa pg atau modul database | Lulus |
| npm run lint | Lulus |
| npm run build | Lulus |
| Register Member dan Curator | Lulus |
| Role Admin disisipkan ke form register | Ditolak backend |
| Email sama dengan kapitalisasi berbeda | Ditolak |
| Password multibyte melebihi 72 byte | Ditolak |
| Login password salah | Ditolak dengan pesan umum |
| Admin dan tiga status Curator dari seed | Login dan tujuan sesuai |
| Guest dan akses lintas peran | Dialihkan sesuai aturan |
| Cookie httpOnly, Secure production, SameSite=Lax | Terverifikasi |
| Cookie lama setelah logout | Ditolak |
| Cookie yang sudah dicabut membuka dashboard lalu login | Dialihkan ke login tanpa putaran redirect |
| JWT palsu, JWT kedaluwarsa, sesi database kedaluwarsa | Ditolak |
| Perubahan status Curator saat sesi masih aktif | Langsung berlaku |
| Curator Pending memanggil action hapus langsung | Ditolak |
| Guest/Member memanggil action hapus langsung | Ditolak |
| Request action dari Origin berbeda | Ditolak pemeriksaan Next.js |
| Password/konfirmasi penghapusan salah | Akun tetap ada |
| Hapus Curator rejected dengan konfirmasi benar | Akun dan sesinya dihapus |
| Pembatasan 10 percobaan login | Diberlakukan |
| Form pada 320, 390, 768, 1366 px | Tanpa overflow horizontal |
| Error JavaScript browser | Tidak ditemukan |

Pengujian otomatis sesi juga memeriksa rollback pendaftaran beserta sesi, bcrypt.compare, penghapusan sesi melalui CASCADE, dan UPSERT counter dengan 12 permintaan bersamaan. Akun uji dihapus setelah pemeriksaan; akun seed dipertahankan.

## Penyesuaian aturan koordinator lab

Middleware tidak lagi mengakses PostgreSQL, termasuk melalui impor tidak langsung. Middleware hanya memverifikasi JWT dari cookie dengan lib/session-token.js dan runtime Edge bawaan. Pemeriksaan sesi aktif, role, dan status Curator tetap dilakukan di halaman server, server action, serta route handler melalui lib/auth.js dan lib/session.js.

Pengujian middleware pada server produksi tanpa konfigurasi koneksi database juga lulus: token palsu atau kosong dialihkan ke login; JWT valid diteruskan ke route uji yang tidak ada dan menghasilkan 404 tanpa koneksi database. Tes ini hanya memeriksa lapisan middleware, bukan memberikan izin mengakses data privat.

Pengecekan akses browser setelah perubahan menguji tujuan navigasi yang benar. Redirect dari Server Component dapat dikirim sebagai instruksi navigasi saat respons streaming; tujuan akhir dan tidak terbukanya data privat menjadi patokan, bukan mengharuskan semua respons perantara berkode 307.

Tidak ada perubahan skema SQL, seed, format token, atau kunci sesi. Akun contoh sejak Hari 1 sudah memakai hash bcrypt, sehingga tetap dapat digunakan.

## Mengulang di Windows

1. Jalankan migrasi database/migrations/002-auth.sql di Query Tool database art_showcase.
   Setelah login atau logout, jalankan database/check-auth.sql untuk melihat jumlah sesi aktif tiap akun.
2. Jalankan npm run auth:secret, npm run db:test, dan npm run auth:test.
   Jalankan npm run auth:token-test untuk memeriksa JWT tanpa database.
3. Jalankan npm run lint dan npm run build.
4. Jalankan npm run dev. Ulangi login semua akun contoh dari README.
5. Masuk sebagai Member lalu ketik /dashboard/admin langsung di bilah alamat: halaman harus kembali ke dashboard Member.
6. Masuk sebagai pending@ruangkarya.test dan pastikan dashboard Curator tidak terbuka.
7. Gunakan akun Curator uji sendiri untuk penghapusan permanen agar akun contoh tetap tersedia.

Pengujian browser dilakukan dari skrip kerja dengan Playwright; langkah manual di atas tidak memerlukan pemasangan Playwright pada proyek.

