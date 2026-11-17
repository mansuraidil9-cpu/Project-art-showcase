# Pemeriksaan Hari 9

Pemeriksaan berjalan pada 17 November 2026 WITA menggunakan Linux cloud, Node.js 24.22.1, PostgreSQL 18.6, Next.js 15.5.29, dan Chromium. Catatan ini mencakup backend dan pemulihan error; penyesuaian desain belum dinyatakan selesai.

## Temuan dan perbaikan

- JWT yang tidak memiliki exp atau iat sebelumnya masih dapat lolos. Verifikasi sekarang mewajibkan sub, jti, iat, dan exp. Tes issuer, audience, serta tanda tangan menggunakan klaim lain yang lengkap agar penyebab penolakan tetap terpisah.
- Sesi dapat kedaluwarsa ketika request menunggu kunci akun. Backend sekarang memverifikasi ulang JWT serta sesi setelah memperoleh kunci, dan SQL masa berlaku memakai clock_timestamp(). Dua pengujian menahan kunci sampai JWT atau sesi database kedaluwarsa; keduanya harus menghasilkan penolakan.
- Hapus akun Curator rejected sebelumnya memanggil pembatas percobaan melalui koneksi kedua dari dalam transaksi. Pembatas dipindahkan sebelum transaksi; penghapusan counter yang berhasil menggunakan client transaksi yang sama. Peran, status, sesi, dan password tetap diperiksa di backend.
- Tombol coba lagi pada error boundary sebelumnya belum meminta data server baru saat koneksi pulih. Komponen bersama sekarang memuat ulang halaman, menonaktifkan tombol selama proses, dan menampilkan status memuat ulang. Pesan error tidak menjanjikan bahwa operasi sebelumnya pasti dibatalkan.
- Sharp diperbarui ke 0.35.5 dan PostCSS diseragamkan ke 8.5.33 melalui overrides. npm audit fix tanpa force memperbarui dependency pengembangan yang kompatibel. Next.js tetap 15.5.29. Pada pemeriksaan tahap ini, npm audit dan npm audit --omit=dev sama-sama melaporkan nol advisory. Hasil audit mengikuti basis data advisory pada saat perintah dijalankan.

## Pengujian yang dapat diulang

Jalankan melalui PowerShell dari folder proyek, dengan database pengembangan yang sudah berisi schema dan seed:

```powershell
npm ci
npm test
npm run lint
npm run build
npm audit
```

npm test menjalankan sepuluh rangkaian berurutan: token, keamanan sesi, constraint/transaksi, autentikasi, Admin, karya, interaksi/profil, moderasi, challenge, dan pemenang. Seluruhnya lulus. Lint dan build produksi juga lulus. Data pengujian sementara dibersihkan oleh masing-masing skrip.

Pengujian ulang browser memakai build produksi dengan dependency yang telah diperbarui:

| Alur | Hasil |
| --- | --- |
| Register/login/logout dan dashboard seluruh peran | Lulus; cookie dan data sesi diperiksa |
| Penyisipan role Admin, pemanggilan action langsung, dan Origin berbeda | Ditolak backend |
| Upload, edit metadata, tags, kepemilikan, serta penghapusan karya dan berkas | Lulus |
| File palsu/berlebihan dan path traversal | Ditolak |
| Like, favorit, komentar, laporan unik, profil/avatar, perubahan email/password | Lulus |
| Pencabutan sesi perangkat lain setelah perubahan akun | Lulus |
| Halaman karya, profil, dan akun pada 320/390/768/1366 px | Tanpa overflow atau teks biru |
| Error JavaScript pada alur tersebut | Tidak ditemukan |

Pengujian browser tambahan memakai data sementara pada database cloud. Pengujian antrean penghapusan menahan kunci akun sambil mengirim sepuluh request. Setelah satu percobaan awal, enam request dibatasi tanpa menunggu kunci dan empat transaksi mengantre; password salah tidak menghapus akun. Penghapusan dengan password benar tetap berhasil setelah hitungan fixture direset.

Pengujian pemulihan menunda pembacaan akun untuk memeriksa state loading, lalu memutus koneksi database aplikasi uji. Halaman menampilkan error dan API sesi mengembalikan 503 dengan no-store tanpa kredensial. Setelah koneksi dipulihkan, tombol coba lagi menampilkan dashboard serta respons API 200. Skrip browser menggunakan lingkungan cloud dan tidak menjadi perintah instalasi Windows.

Pemeriksaan ini belum menutup Hari 9. Penyesuaian tema dan gambar serta pemeriksaan ulang tampilan sesudahnya masih perlu diselesaikan.

## Mengecek hasil lokal

1. Perbarui proyek dengan git pull --ff-only, jalankan npm ci, kemudian npm test dan npm run build. Tidak ada perubahan skema atau migrasi baru.
2. Jalankan npm run dev. Masuk, buka dashboard sesuai peran, lalu keluar. Salinan sesi yang dicabut harus ditolak oleh backend.
3. Daftarkan Curator percobaan, tolak melalui Admin, lalu coba konfirmasi penghapusan dengan password salah. Akun tetap ada; password benar dan konfirmasi HAPUS diperlukan untuk menghapusnya.
4. Untuk memeriksa error, gunakan database pengembangan tersendiri. Ketika koneksi tidak tersedia, halaman harus menampilkan pesan yang rapi. Pulihkan koneksi, kemudian gunakan tombol coba lagi.
5. Di pgAdmin: pilih art_showcase > Query Tool > ikon folder > buka database/check-auth.sql > F5. Hasil menampilkan status akun dan sesi aktif. Jangan mengetik nama file sebagai perintah SQL.

## Hal yang perlu dipahami

1. Middleware memeriksa JWT tanpa pg; backend tetap menentukan izin akhir melalui sesi dan role/status terbaru.
2. now() memakai waktu awal transaksi, sedangkan clock_timestamp() membaca waktu aktual setelah menunggu kunci.
3. Semua query dalam satu transaksi harus memakai client yang sama agar operasi tetap satu kesatuan dan tidak meminjam koneksi tambahan sambil memegang kunci.
4. Error setelah operasi bukan bukti bahwa perubahan dibatalkan. Muat ulang membaca keadaan terbaru dari server.
5. Keberhasilan build dan audit dependency tidak menggantikan pengujian aturan bisnis, kepemilikan data, dan percobaan akses langsung ke server action.
