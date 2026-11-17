# Pemeriksaan Hari 8

Dijalankan 17 November 2026 WITA pada Linux cloud, Node.js 24.22.1, PostgreSQL 18.6, Next.js 15.5.29, dan Chromium. Pengguna memeriksa hasil Windows lokal setelah memperbarui repository.

| Pemeriksaan | Hasil |
| --- | --- |
| npm run winner:test | Lulus |
| Regresi challenge:test, moderation:test, member:test, artwork:test, admin:test, db:test, auth:test, auth:token-test | Lulus |
| npm run lint dan npm run build | Lulus |
| Galeri Curator hanya untuk challenge miliknya | Lulus |
| Guest, Admin, Member, Curator Pending/Rejected mengakses/memanggil pengelolaan pemenang | Ditolak |
| Sesi Curator dicabut atau status berubah | Pemeriksaan backend langsung menolak |
| Pemenang sebelum challenge berakhir | Ditolak backend, form belum tersedia |
| Jumlah nol/lebih dari tiga, peringkat di luar 1–3, dan peringkat ganda | Ditolak backend |
| Satu submisi mengisi dua peringkat | Ditolak browser dan backend |
| Kandidat dari challenge lain/tidak tersedia | Ditolak tanpa mengubah pengumuman |
| Tiga pemenang diumumkan | Peringkat 1, 2, 3 tampil pada publik dan riwayat Member |
| Waktu pengumuman | Sesudah ends_at dan memakai waktu aktual database |
| Menyimpan ulang pilihan yang sama | ID/waktu hasil lama tetap |
| Kesalahan SQL setelah hasil lama dihapus | ROLLBACK mempertahankan hasil lama secara utuh |
| Dua tab menyimpan dari versi yang sama | Satu perubahan berlaku; tab lama menerima konflik |
| Tombol Muat ulang pilihan setelah konflik | Membaca hasil terbaru dari server |
| Pemenang mentah pada challenge yang belum selesai | Disembunyikan query publik/featured |
| Kandidat di luar halaman galeri saat ini | Tetap dapat dipilih dari daftar seluruh peserta |
| Galeri Curator dan Submisi Saya | Paginasi 12 item dan data tidak berulang antarhalaman |
| Submisi Saya antar-Member | Terpisah berdasarkan ID sesi |
| Withdraw dari Submisi Saya | Kembali ke daftar; submisi Member lain tetap ada |
| Withdraw setelah berakhir | Tetap ditolak oleh aturan Hari 7 |
| Featured | Maksimal tiga karya, satu kemunculan per karya meskipun menang di beberapa challenge |
| Moderasi karya pemenang | Pengumuman, featured, kandidat, dan submisi peserta diperbarui tanpa tautan karya yang sudah dihapus |
| Pemilihan pemenang bersamaan dengan take down satu karya terkait | Tidak merusak relasi; permintaan usang ditolak |
| Pemilihan mengantre sampai challenge berakhir | Memakai waktu setelah kunci didapat; pengumuman tidak tercatat terlalu awal |
| Email/hash pada hasil publik | Tidak dipilih/ditampilkan |
| Regresi browser challenge Hari 7 serta dashboard/moderasi Hari 6 | Lulus |
| Pengelolaan submisi, pengumuman, Submisi Saya, dan featured pada 320/390/768/1366 px | Tanpa overflow horizontal atau teks biru |
| Error JavaScript browser | Tidak ditemukan |
| database/check-winners.sql | Lima query baca saja berhasil; pemeriksaan duplikat/relasi tidak sesuai kosong |

Tes backend membuat akun, kategori, karya, challenge, submisi, dan pemenang sementara lalu membersihkannya. Tes rollback menjalankan SQL penghapusan/penulisan hasil melalui withTransaction dan sengaja memicu peringkat duplikat sebelum COMMIT. Tes konkurensi menjalankan request yang benar-benar saling menunggu kunci.

Tes browser memakai Playwright dari lingkungan kerja terpisah. Aplikasi tidak memerlukan dependency browser tambahan.

## Mengulang di Windows

Hentikan server lama dengan Ctrl+C. Jalankan dari folder proyek di PowerShell:

```powershell
git pull --ff-only
npm ci
npm run winner:test
npm run lint
npm run build
npm run dev
```

1. Buka http://localhost:3000 dan masuk sebagai Curator approved.
2. Pilih Kelola submisi pada challenge yang sudah berakhir. Untuk data seed, gunakan Bentuk yang Bercerita.
3. Coba memilih karya yang sama pada dua peringkat. Form harus menolak. Perbaiki lalu simpan pengumuman.
4. Buka detail publik dan beranda untuk melihat pemenang serta sorotannya.
5. Buka dua tab pengelolaan sebelum menyimpan. Setelah tab pertama mengubah hasil, tab kedua harus menerima konflik dan dapat memakai Muat ulang pilihan.
6. Masuk sebagai Member lalu buka Submisi Saya untuk melihat riwayat, hasil, dan tombol tarik sebelum berakhir.
7. Di pgAdmin: pilih art_showcase > Query Tool > ikon folder > buka database/check-winners.sql > F5. Jangan mengetik nama file sebagai SQL.

Schema dan seed tidak berubah; database Hari 7 tidak memerlukan migrasi atau seed ulang. Tahap Hari 9 berfokus pada pengujian menyeluruh serta polesan, dan Hari 10 pada finalisasi dokumentasi/presentasi.
