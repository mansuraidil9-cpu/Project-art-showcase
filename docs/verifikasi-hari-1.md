# Pemeriksaan Hari 1

Pemeriksaan selesai 16 November 2026, WITA, pada lingkungan cloud Linux. Ini belum merupakan pengujian pada Windows pengguna.

| Pemeriksaan | Hasil |
| --- | --- |
| Next.js 15.5.29, Node.js 24.22.1 | Build produksi lulus |
| npm run lint | Lulus |
| npm run db:check | Terhubung ke PostgreSQL 18.6 |
| schema.sql dan seed.sql pada database kosong | Lulus |
| Jalankan ulang schema dan seed | Lulus, tidak menduplikasi data |
| Akun, kategori, karya contoh | 7 akun, 5 kategori, 6 karya |
| Ringkasan agregasi | 1 Admin, 3 Member, 3 Curator, 6 karya, 1 laporan pending, 1 challenge aktif |
| Verifikasi password bcrypt | Lulus untuk password demo |
| npm run db:test | Lulus: 16 constraint, COMMIT dan ROLLBACK dua tabel, parameter dan daftar query |
| Browser Chromium pada lebar 320, 390, 768, 1366 px | Lulus, tanpa overflow horizontal |
| Semua gambar contoh dimuat | Lulus |
| Link memakai warna stone | Lulus |
| Database tidak terhubung | Pesan pemulihan dan keadaan kosong tampil |
| Route tidak ditemukan | Halaman 404 tampil |
| Error JavaScript browser | Tidak ditemukan |

Constraint yang diuji mencakup duplikasi email, kategori beda kapitalisasi, like, favorite, report, submisi, asal challenge pemenang, peringkat ganda, submisi pemenang ganda, rank di luar 1–3, tanggal tidak valid, file karya yang diganti, kategori terpakai yang dihapus, status Curator kosong, serta penolakan tanpa alasan.

Pengujian SQL memakai kode 23001 untuk penghapusan kategori dengan RESTRICT pada PostgreSQL 18.6. Kode yang dilaporkan versi PostgreSQL lain dapat berbeda.

Kredensial database cloud khusus pengujian berada dalam .env.local yang diabaikan Git. Windows tetap menggunakan port 5432 dan password lokal milik pengguna.

Autentikasi, akses per role, validasi unggahan, serta aturan waktu dan kepemilikan pada operasi aplikasi belum dibuat. Pengujian bagian tersebut dilakukan pada tahap fiturnya.
