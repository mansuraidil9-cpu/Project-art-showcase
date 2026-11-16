# Pemeriksaan Hari 3

Dijalankan 16 November 2026 WITA pada Linux cloud, Node.js 24.22.1, PostgreSQL 18.6, Next.js 15.5.29, dan Chromium. Pengujian Windows dilakukan pengguna setelah mengambil kode terbaru.

| Pemeriksaan | Hasil |
| --- | --- |
| npm run admin:test | Lulus |
| npm run auth:test dan auth:token-test | Lulus |
| npm run db:test | Lulus |
| npm run lint | Lulus |
| npm run build | Lulus |
| Kategori: nama kosong, duplikat kapitalisasi, tambah/edit/hapus | Lulus |
| Kategori masih dipakai karya | Dihalangi constraint dan pesan backend |
| Filter peran dan paginasi | Lulus |
| Parameter filter yang berisi percobaan SQL injection | Tidak mengeksekusi SQL, ditolak sebagai filter |
| Guest/Member membuka tiga modul Admin | Dialihkan sesuai akses |
| Guest/Member memanggil action kategori/hapus pengguna langsung | Tidak mengubah data |
| Admin sendiri dan Admin lain | Dilindungi pada backend |
| Konfirmasi email penghapusan salah | Pengguna tetap ada |
| Penghapusan Member beserta karya/interaksi/submisi/sesi | CASCADE lulus |
| Penghapusan Curator beserta challenge | Relasi challenge terhapus; karya peserta lain tetap ada |
| Berkas unggahan milik pengguna dihapus setelah COMMIT | Lulus; berkas contoh dan path di luar unggahan dipertahankan |
| Approve/reject dari UI saat Curator masih login | Status baru langsung berlaku |
| Penolakan tanpa alasan yang valid | Ditolak backend |
| Dua Admin memproses pendaftaran bersamaan | Satu berhasil, satu menerima konflik |
| Admin menghapus Curator yang masih login | API sesi menjadi 401 |
| Empat halaman Admin pada 320, 390, 768, 1366 px | Tanpa overflow horizontal |
| Error JavaScript browser | Tidak ditemukan |

Pengujian browser mencakup pesan kesalahan per bidang serta perbaikan input setelah validasi gagal. Setelah aksi berhasil, browser meminta ulang halaman tujuan agar daftar dan pesan sukses berasal dari pembacaan SQL terbaru.

## Mengulang di Windows

1. Ambil kode terbaru dengan git pull --ff-only pada folder proyek.
2. Jalankan npm ci, npm run admin:test, npm run lint, dan npm run build.
3. Jalankan npm run dev, lalu masuk sebagai Admin dari akun seed.
4. Coba tambah kategori baru, ubah namanya, dan hapus kategori uji tersebut.
5. Buka Pengguna dan pilih masing-masing peran. Akun Admin tidak menyediakan form hapus.
6. Daftarkan Curator uji melalui browser lain atau setelah logout. Setujui atau tolak dari akun Admin; periksa kembali halaman status Curator.
7. Buka database/check-admin.sql melalui ikon folder pgAdmin, jalankan, lalu cocokkan kategori dan status pengguna.

Skema tetap 14 tabel dan tidak memerlukan migrasi baru pada Hari 3. Gunakan schema.sql lalu seed.sql untuk database baru. Akun dan kategori sementara pada pengujian backend dibersihkan setelah pemeriksaan.

