# Pemeriksaan Hari 5

Dijalankan 17 November 2026 WITA (16 November UTC) pada Linux cloud, Node.js 24.22.1, PostgreSQL 18.6, Next.js 15.5.29, dan Chromium. Pemeriksaan Windows lokal dilakukan setelah memperbarui repository.

| Pemeriksaan | Hasil |
| --- | --- |
| npm run member:test | Lulus |
| Regresi artwork:test, admin:test, db:test, auth:test, auth:token-test | Lulus |
| npm run lint dan npm run build | Lulus |
| Like/favorit dikirim berulang dan bersamaan | Tetap satu baris, pembatalan berhasil |
| Status tombol setelah simpan | Sesuai database |
| Guest, Admin, Curator memanggil RPC interaksi/profil/akun | Ditolak |
| Komentar kosong/melebihi 1.000 karakter | Ditolak backend |
| HTML dan percobaan SQL injection dalam komentar | Tersimpan/ditampilkan sebagai teks, tidak dieksekusi |
| Hapus komentar sendiri/orang lain | Milik sendiri berhasil; milik orang lain ditolak |
| Laporan karya sendiri, alasan palsu, penjelasan terlalu pendek | Ditolak |
| Dua laporan bersamaan dari Member yang sama | Hanya satu berhasil |
| Laporan ulang setelah dismiss | Ditolak constraint unik |
| Profil dengan ID pengguna lain dalam payload | Target tetap ditentukan oleh sesi |
| URL javascript, kredensial dalam URL, domain Instagram/Behance palsu | Ditolak backend |
| Foto lebih dari 2 MB dan isi palsu | Ditolak |
| Foto profil valid | WebP, dimensi maksimal 1.024 piksel, tampil pada profil publik |
| Koreksi URL setelah memilih foto | Foto tidak perlu dipilih ulang |
| Kegagalan SQL setelah foto baru disimpan | ROLLBACK dan foto baru dibersihkan |
| Ganti/hapus foto profil | Foto lama dibersihkan setelah commit |
| Profil publik | Email dan hash tidak ada dalam hasil query/halaman |
| Perubahan email dengan password salah atau email terpakai | Ditolak tanpa mencabut sesi |
| Email/password berhasil diubah | Seluruh sesi dihapus, cookie dibersihkan, kembali ke login |
| Login dengan email/password baru | Berhasil |
| Login dengan password lama | Ditolak |
| Lima percobaan password salah | Percobaan berikutnya dibatasi 15 menit |
| Login lama mengantre bersamaan dengan perubahan password | Membaca hash terbaru dan gagal; tidak membuat sesi setelah pencabutan |
| Regresi browser autentikasi Hari 2 | 17 kelompok pemeriksaan lulus |
| Detail karya, profil publik, pengaturan profil/akun pada 320/390/768/1366 px | Tanpa overflow horizontal atau teks biru |
| Error JavaScript browser | Tidak ditemukan |
| database/check-member.sql | Empat query baca saja berhasil dijalankan |

Tes backend membuat akun, kategori, karya, komentar, laporan, dan berkas sementara kemudian membersihkannya. Tes browser memakai Playwright dari lingkungan kerja terpisah; aplikasi tidak memerlukan dependency browser tambahan. Pengujian konkurensi login memakai kunci baris PostgreSQL untuk mengatur antrean perubahan password dan login lama secara nyata.

## Mengulang di Windows

Hentikan server lama dengan Ctrl+C. Jalankan dari folder proyek di PowerShell:

```powershell
git pull --ff-only
npm ci
npm run member:test
npm run lint
npm run build
npm run dev
```

1. Buka http://localhost:3000, masuk sebagai Member, lalu buka karya kreator lain.
2. Uji like, favorit, komentar, dan laporan. Akun lain tidak boleh menghapus komentarmu.
3. Pada Dashboard Member > Profil Publik, simpan foto serta bio dan periksa profil melalui Lihat profil publik.
4. Gunakan akun percobaan untuk mengubah email/password melalui Akun Privat. Uji juga sesi akun yang sama pada browser lain: akses dashboard berikutnya harus kembali ke login.
5. Di pgAdmin, pilih database art_showcase > Query Tool > ikon folder. Buka database/check-member.sql lalu F5. Jangan mengetik nama file sebagai perintah SQL.

Schema dan seed tidak berubah; database Hari 4 tidak memerlukan migrasi atau seed ulang. Semua query fitur baru tersimpan sebagai file SQL di folder database. Daftar My Favorites, moderasi, dan statistik dilanjutkan pada Hari 6.
