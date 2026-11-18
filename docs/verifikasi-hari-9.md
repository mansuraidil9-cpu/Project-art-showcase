# Pemeriksaan Hari 9

Pemeriksaan backend berjalan pada 17 November 2026 WITA dan dilanjutkan dengan desain Atelier pada 18 November 2026 WITA, menggunakan Linux cloud, Node.js 24.22.1, PostgreSQL 18.6, Next.js 15.5.29, dan Chromium.

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

## Desain Atelier

Nama tampilan menjadi Atelier dengan teks Indonesia, latar krem, tipografi serif, garis tipis, galeri empat kolom di desktop, dan dua kolom di HP. Pembaruan mencakup beranda, navigasi, detail/profil/challenge, autentikasi, semua dashboard/form, loading, error, dan 404. Foto pembuka berlisensi CC0 tersimpan lokal; sumbernya tercatat di docs/aset-visual.md. Karya portofolio dan konfigurasi sesi tetap dipakai.

Panduan file, tema, gambar, pemeriksaan lokal, dan bahan pemahaman tersedia di docs/tampilan-atelier.md. Skema, seed, dan migrasi tidak berubah pada pembaruan tampilan ini.

Sebanyak 124 pemeriksaan halaman/ukuran layar lulus pada build produksi: halaman publik diuji pada 320, 390, 768, 1024, dan 1366 piksel; dashboard serta status peran diuji pada 320, 390, 768, dan 1366 piksel. Pemeriksaan memastikan konten asli dari database tersedia, judul memakai Atelier, tidak ada overflow horizontal, teks biru, gambar rusak, maupun error JavaScript. Pratinjau ada di docs/images/atelier-desktop.png dan atelier-mobile.png. Lint dan build produksi lulus setelah penyesuaian jarak serta ikon SVG.

Pengujian ulang alur browser setelah perubahan desain:

| Modul | Hasil |
| --- | --- |
| Autentikasi | Lulus: register, login/logout, cookie, peran/status, pencabutan sesi, dan pembatasan percobaan |
| Admin | Lulus: kategori, filter/hapus pengguna, perlindungan Admin, dan verifikasi Curator |
| Karya | Lulus: unggah, koreksi form tanpa memilih ulang gambar, tags, metadata, kepemilikan, pencarian, serta hapus/404 |
| Interaksi/profil | Lulus: suka/favorit/komentar/laporan, foto, tautan aman, perubahan email/password, dan pencabutan sesi lain |
| Moderasi | Lulus: statistik, antrean, dismiss/take down, relasi/berkas, serta favorit privat |
| Challenge | Lulus: CRUD, zona waktu, role/status, submit/withdraw/deadline, banner, dan paginasi |
| Pemenang | Lulus: maksimal tiga, kandidat/rank unik, konflik dua tab, pengumuman, featured, submisi privat, dan dampak take down |

## Revisi tipografi dan gambar HD

Revisi lanjutan pada 18 November 2026 WITA memakai Bodoni Moda tegak dan Cormorant Garamond Italic pada baris judul yang sama. Font WOFF2 dilayani lokal dengan lisensi SIL OFL. Foto pembuka diganti versi 2400 × 1600 dari sumber asli 4032 × 3024 piksel. Enam karya referensi memakai WebP dengan panjang maksimal 2200 piksel; judul, kategori, tags, pembuat asli, serta banner mengikuti isi gambar.

npm run demo:test lulus pada database uji terpisah: schema/seed dapat dijalankan dua kali, enam contoh lama berpindah ke gambar baru, pengulangan migrasi tidak mengubah data lagi, serta kategori khusus, judul yang disunting, jalur uploads, pemilik lain, dan banner pribadi dipertahankan. Akun dan relasi interaksi/submisi/pemenang tidak berubah. Kesalahan SQL membatalkan semua perubahan; trigger larangan mengganti file tetap aktif setelah sukses dan rollback.

Pembaruan database pengembangan menghasilkan enam karya dan tiga banner yang diperbarui. Pengulangan menghasilkan nol perubahan. npm test lulus pada sepuluh rangkaian backend setelah data contoh diperbarui. Tes larangan menghapus kategori sekarang memilih kategori yang benar-benar sedang digunakan, sehingga tidak bergantung pada ID kategori lama.

Pada build akhir, 129 pemeriksaan halaman/ukuran layar lulus tanpa overflow horizontal, teks biru, gambar rusak yang terlihat, atau error JavaScript. Font tegak dan miring terverifikasi memakai keluarga berbeda. Tombol Cari membuka filter melalui form GET; pencarian Losari dengan kategori Fotografi menghasilkan foto yang sesuai dan detail menampilkan sumber/lisensi. Gambar moderasi juga diverifikasi pada viewport 390: respons optimizer WebP 200 dan foto berhasil tampil. Lint dan npm run build lulus. Pratinjau laptop/HP pada docs/images diperbarui mengikuti revisi ini.

Hari 9 selesai. Hari 10 untuk finalisasi dokumentasi dan latihan presentasi belum dimulai.

## Mengecek hasil lokal

1. Perbarui proyek dengan git pull --ff-only, jalankan npm ci dan npm run db:demo, kemudian npm test dan npm run build. Struktur tabel tetap; revisi HD memakai migrasi data 003-demo-gallery.sql.
2. Jalankan npm run dev. Masuk, buka dashboard sesuai peran, lalu keluar. Salinan sesi yang dicabut harus ditolak oleh backend.
3. Daftarkan Curator percobaan, tolak melalui Admin, lalu coba konfirmasi penghapusan dengan password salah. Akun tetap ada; password benar dan konfirmasi HAPUS diperlukan untuk menghapusnya.
4. Untuk memeriksa error, gunakan database pengembangan tersendiri. Ketika koneksi tidak tersedia, halaman harus menampilkan pesan yang rapi. Pulihkan koneksi, kemudian gunakan tombol coba lagi.
5. Di pgAdmin: pilih art_showcase > Query Tool > ikon folder > buka database/check-demo-gallery.sql > F5. Terlihat judul, kategori, tags, jalur gambar, banner, serta trigger yang aktif. database/check-auth.sql tetap dapat dipakai untuk sesi. Jangan mengetik nama file sebagai perintah SQL.

## Hal yang perlu dipahami

1. Middleware memeriksa JWT tanpa pg; backend tetap menentukan izin akhir melalui sesi dan role/status terbaru.
2. now() memakai waktu awal transaksi, sedangkan clock_timestamp() membaca waktu aktual setelah menunggu kunci.
3. Semua query dalam satu transaksi harus memakai client yang sama agar operasi tetap satu kesatuan dan tidak meminjam koneksi tambahan sambil memegang kunci.
4. Error setelah operasi bukan bukti bahwa perubahan dibatalkan. Muat ulang membaca keadaan terbaru dari server.
5. Keberhasilan build dan audit dependency tidak menggantikan pengujian aturan bisnis, kepemilikan data, dan percobaan akses langsung ke server action.
