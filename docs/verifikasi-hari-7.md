# Pemeriksaan Hari 7

Dijalankan 17 November 2026 WITA pada Linux cloud, Node.js 24.22.1, PostgreSQL 18.6, Next.js 15.5.29, dan Chromium. Pemeriksaan Windows lokal dilakukan setelah memperbarui repository.

| Pemeriksaan | Hasil |
| --- | --- |
| npm run challenge:test | Lulus |
| Regresi moderation:test, member:test, artwork:test, admin:test, db:test, auth:test, auth:token-test | Lulus |
| npm run lint dan npm run build | Lulus |
| Konversi datetime-local WITA ke timestamptz | Sesuai UTC+8 |
| Browser Curator memakai zona New York | Waktu tersimpan tetap sesuai WITA |
| Tanggal seperti 30 Februari atau input dengan zona waktu tambahan | Ditolak backend |
| Field kosong dan tanggal selesai sebelum/sama dengan mulai | Ditolak |
| Banner kosong, lebih dari 5 MB, dan HTML menyamar PNG | Ditolak backend |
| Koreksi tanggal setelah memilih banner | Banner tidak perlu dipilih ulang |
| Kegagalan SQL setelah banner baru disimpan | ROLLBACK dan banner baru dibersihkan |
| Ganti banner | Banner lama dibersihkan setelah commit |
| Guest, Admin, Member membuka/memanggil CRUD challenge | Ditolak |
| Curator Pending/Rejected | Tidak dapat mengakses pengelolaan challenge |
| Status Curator diubah saat sesi masih aktif | Langsung berlaku pada pemeriksaan backend |
| Curator lain membuka edit atau memanggil action edit/hapus | Ditolak |
| Jadwal challenge yang sudah memiliki pemenang | Perubahan ditolak; metadata tetap dapat diperbarui |
| Jadwal tidak diubah saat edit | Presisi timestamp lama tetap dipertahankan |
| Detail/daftar challenge dan galeri submisi Guest | Tampil tanpa email/hash Curator |
| Guest, Admin, Curator memanggil action submit/withdraw | Ditolak |
| Member memilih karya orang lain | Ditolak service dan foreign key gabungan |
| Dua submisi hampir bersamaan dari Member yang sama | Hanya satu berhasil |
| Insert SQL duplikat langsung | Ditolak constraint unik |
| Submit pada challenge mendatang/sudah berakhir | Ditolak backend |
| Withdraw sebelum berakhir | Berhasil, karya asli tetap ada |
| Withdraw setelah tanggal mulai digeser ke masa depan | Tetap boleh selama belum berakhir |
| Withdraw milik Member lain | Tidak menghapus submisi Member lain |
| Form sudah dibuka, tetapi deadline terlewat saat dikirim | Ditolak |
| Submit/withdraw mengantre pada kunci hingga deadline terlewat | Ditolak setelah kunci didapat |
| Request mengantre hingga challenge mulai | Diterima dengan created_at waktu penerimaan aktual |
| Hapus challenge | Banner, submisi, dan pemenang terkait dibersihkan; karya asli tetap ada |
| Pencarian judul/Curator, filter status, dan paginasi | Lulus |
| Pencarian %, _, dan percobaan SQL injection | Diperlakukan sebagai teks parameter |
| Paginasi publik mempertahankan filter status | Lulus browser |
| Beranda awal | Menampilkan challenge aktif |
| Pencarian beranda | Juga menampilkan challenge yang cocok |
| Teks aturan berisi HTML | Dirender sebagai teks, tidak dieksekusi |
| Beranda, daftar/detail, dashboard serta form create/edit pada 320/390/768/1366 px | Tanpa overflow horizontal atau teks biru |
| Error JavaScript browser | Tidak ditemukan |
| database/check-challenges.sql | Empat query baca saja berhasil; dua pemeriksaan pelanggaran kosong |

Tes backend membuat akun, kategori, karya, challenge, dan banner sementara lalu membersihkannya. Pengujian antrean memakai kunci baris PostgreSQL yang benar-benar ditahan sampai waktu buka/tutup terlewat. Tes browser memakai Playwright dari lingkungan kerja terpisah; aplikasi tidak memerlukan dependency browser tambahan.

## Mengulang di Windows

Hentikan server lama dengan Ctrl+C. Jalankan dari folder proyek di PowerShell:

```powershell
git pull --ff-only
npm ci
npm run challenge:test
npm run lint
npm run build
npm run dev
```

1. Buka http://localhost:3000, masuk sebagai Curator approved, lalu pilih Buat Challenge.
2. Isi jadwal WITA dengan waktu mulai sebelum sekarang dan waktu selesai setelah sekarang agar challenge langsung aktif. Coba juga tanggal selesai yang lebih awal; backend harus menolak.
3. Pilih banner, perbaiki tanggal, dan kirim kembali tanpa memilih ulang file.
4. Keluar lalu masuk sebagai Member. Buka detail challenge dan kirim satu karya dari portofoliomu.
5. Tarik submisi sebelum berakhir, kemudian kirim karya lain. Member lain tidak boleh mengubah submisimu.
6. Uji challenge dengan jadwal mendatang atau sudah selesai. Form tidak menawarkan pengiriman, dan backend menolak request langsung.
7. Cari challenge melalui beranda dan menu Challenge; coba filter status serta halaman berikutnya.
8. Pada pgAdmin: art_showcase > Query Tool > ikon folder > buka database/check-challenges.sql > F5.

Schema dan seed tidak berubah; database Hari 6 tidak memerlukan migrasi atau seed ulang. Pengelolaan submisi oleh Curator, pemilihan/penampilan pemenang, My Submissions, dan featured dilanjutkan pada Hari 8.
