# Pemeriksaan Hari 6

Dijalankan 17 November 2026 WITA pada Linux cloud, Node.js 24.22.1, PostgreSQL 18.6, Next.js 15.5.29, dan Chromium. Pengguna tetap memeriksa hasil lokal Windows setelah memperbarui repository.

| Pemeriksaan | Hasil |
| --- | --- |
| npm run moderation:test | Lulus |
| Regresi member:test, artwork:test, admin:test, db:test, auth:test, auth:token-test | Lulus |
| npm run lint dan npm run build | Lulus |
| Total pengguna per peran, karya, dan laporan pending | Sesuai penambahan data uji |
| Challenge aktif dibanding belum mulai/sudah berakhir | Hanya yang sedang berjalan dihitung |
| Dua laporan dan beberapa likes pada karya yang sama | Jumlah laporan tetap dua, tidak berlipat akibat join |
| Antrean moderasi dan rincian laporan | Enam karya dan sepuluh laporan per halaman |
| Guest, Member, Curator membuka moderasi/memanggil action | Ditolak |
| Admin/Curator membuka daftar favorit Member | Ditolak |
| ID tidak valid dan konfirmasi penghapusan kosong | Ditolak backend |
| Take down karya tanpa laporan pending | Ditolak |
| Dismiss laporan | Status dismissed, reviewed_by dan reviewed_at tersimpan; karya tetap ada |
| Dismiss laporan yang sudah diproses | Ditolak sebagai konflik |
| Laporan ulang dari Member yang sama setelah dismiss | Tetap ditolak |
| Dismiss dan take down bersamaan dari dua Admin | Hanya satu keputusan berlaku untuk laporan terakhir |
| ROLLBACK penghapusan karya berelasi | Karya, tags terkait, likes, favorit, komentar, laporan, submisi, dan pemenang dipulihkan |
| Take down berhasil | Seluruh relasi di atas terhapus; karya lain tetap ada |
| File karya dihapus sesudah COMMIT | Lulus |
| File yang sudah ada saat server dimulai lalu dihapus | Sebelum hapus 200; sesudah hapus 404 melalui rewrite |
| Halaman Admin lama memproses laporan karya yang sudah dihapus | Ditolak tanpa membuat data baru |
| HTML/SQL injection dalam penjelasan laporan | Ditampilkan sebagai teks, tidak dieksekusi |
| Daftar favorit antar-Member | Terpisah berdasarkan sesi, tidak mengikuti ID pengguna dari form |
| Urutan favorit dan paginasi 12 karya | Lulus |
| Item terakhir halaman favorit dihapus | Halaman dibatasi kembali ke halaman yang masih tersedia |
| Take down memperbarui favorit dan statistik | Lulus browser |
| Dashboard Member | Hanya karya sendiri dan jumlah suka/favorit yang sesuai |
| Regresi browser karya Hari 4 dan Member Hari 5 | Lulus setelah perbaikan route gambar |
| Ringkasan Admin/Member, antrean/rincian moderasi, favorit pada 320/390/768/1366 px | Tanpa overflow horizontal atau teks biru |
| Error JavaScript browser | Tidak ditemukan |
| database/check-moderation.sql | Empat query baca saja berhasil dijalankan |

Tes backend membuat akun, kategori, challenge, karya, dan interaksi sementara lalu membersihkannya. Pengujian rollback menjalankan SQL penghapusan yang sama melalui withTransaction dan sengaja melempar error sebelum COMMIT. Tes keputusan bersamaan menjalankan dua service dengan akun Admin berbeda.

Tes browser memakai Playwright dari lingkungan kerja terpisah. Aplikasi tidak memerlukan dependency browser tambahan.

## Mengulang di Windows

Hentikan server lama dengan Ctrl+C, lalu jalankan dari folder proyek di PowerShell:

```powershell
git pull --ff-only
npm ci
npm run moderation:test
npm run lint
npm run build
npm run dev
```

1. Buka http://localhost:3000, masuk sebagai Member, dan simpan karya ke favorit.
2. Buka Dashboard Member > Favorit Saya; coba hapus dari daftar tanpa menghapus karya aslinya.
3. Laporkan karya percobaan milik akun Member lain. Keluar lalu masuk sebagai Admin.
4. Periksa angka pada Ringkasan, kemudian buka Moderasi Konten > Tinjau laporan.
5. Pilih Abaikan laporan. Karya harus tetap dapat dibuka; baris laporan berubah menjadi dismissed di pgAdmin.
6. Buat laporan lain yang valid pada karya uji, lalu pilih Hapus karya dan centang konfirmasi. Detail karya, file unggahan, dan relasinya harus tidak lagi tersedia.
7. Pada pgAdmin, pilih art_showcase > Query Tool > ikon folder > buka database/check-moderation.sql > F5. Jangan mengetik nama file sebagai perintah SQL.

Tidak ada perubahan tabel atau seed pada Hari 6. Database Hari 5 tidak perlu dimigrasi atau diisi ulang. CRUD challenge, submit/withdraw, pemenang, dan My Submissions diteruskan pada Hari 7–8.
