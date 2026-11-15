# Autentikasi Hari 2

## Alur daftar dan masuk

1. Form Client Component memakai useActionState untuk memanggil server action.
2. Backend menormalisasi email dan memvalidasi nama, password, konfirmasi, serta peran. Daftar hanya menerima member atau curator; curator selalu pending.
3. bcryptjs membuat hash password dengan biaya 12. Batas password 72 byte mengikuti batas bcrypt, sehingga input multibyte diperiksa menggunakan TextEncoder.
4. Pendaftaran memasukkan users dan sessions dalam satu transaksi. Jika pembuatan sesi gagal, akun ikut dibatalkan.
5. jose menandatangani JWT HS256 dengan sub (ID akun), jti acak, issuer, audience, dan masa berlaku tujuh hari. JWT tidak berisi password atau peran.
6. Database hanya menyimpan SHA-256 dari jti acak. Browser menerima JWT dalam cookie httpOnly, SameSite=Lax, dan Secure saat production.
7. Setelah cookie tersimpan, pengguna diarahkan menurut peran dan status.

Login membandingkan password memakai bcrypt.compare. Untuk email tidak ditemukan, pemeriksaan hash pengganti tetap dilakukan. Pesan kegagalan tidak membedakan email salah dan password salah.

## Pemeriksaan akses

Middleware memakai runtime Node.js pada Next.js 15.5 agar bisa mengakses pg. Jalur login/register, dashboard, dan curator-status dicocokkan melalui matcher.

Setiap pemeriksaan memverifikasi tanda tangan dan kedaluwarsa JWT, mencari sesi aktif, lalu membaca akun beserta status terkini dari database. Middleware bukan satu-satunya pengaman: setiap halaman dashboard memanggil requireUser dengan peran yang tepat, action hapus memeriksa ulang status dalam transaksi, dan route handler sesi memeriksa pengguna sendiri.

JWT tidak menyimpan role/status, sehingga persetujuan atau penolakan langsung berlaku pada cookie yang masih aktif. Halaman status memiliki tombol Periksa status lagi untuk meminta halaman terbaru.

| Akun | Tujuan |
| --- | --- |
| Guest yang membuka dashboard | /login |
| Admin | /dashboard/admin |
| Member | /dashboard/member |
| Curator approved | /dashboard/curator |
| Curator pending/rejected | /curator-status |

Akses dashboard peran lain diarahkan ke halaman milik sendiri. Data privat tidak dirender terlebih dahulu. Dashboard Hari 2 hanya menampilkan konfirmasi akses; fitur pengelolaan mengikuti jadwal berikutnya.

## Logout dan penghapusan akun

Logout menghapus record sesi yang sesuai, lalu mengosongkan cookie. Salinan cookie lama ikut tidak berlaku meskipun JWT belum kedaluwarsa.

Hapus akun pada halaman status hanya menerima Curator rejected. ID akun diambil dari sesi, bukan input form. Pengguna harus memasukkan password dan mengetik HAPUS. Di dalam transaksi, baris akun dan sesi dikunci, status diperiksa lagi, password dibandingkan, lalu akun dihapus. Foreign key CASCADE menghapus seluruh sesi akun. Curator Pending, Member, Admin, dan Guest tidak dapat memakai action ini untuk menghapus akun.

## Pembatasan percobaan dan CSRF

auth_limits menghitung percobaan dengan UPSERT atomik. Maksimal 10 percobaan login, 5 pendaftaran, dan 5 konfirmasi password penghapusan dalam 15 menit per identitas/kegiatan. Kunci disamarkan dengan HMAC. Login yang berhasil membersihkan hitungan login. Data kedaluwarsa dibersihkan bersama sesi saat autentikasi berhasil.

Server Actions Next.js memeriksa Origin terhadap host. Jangan menonaktifkan pemeriksaan ini atau menambah allowedOrigins tanpa kebutuhan deployment yang jelas. GET /api/auth/session tidak mengubah data, mengirim Cache-Control: no-store, dan hanya mengembalikan informasi akun pemilik cookie.

## File yang perlu dipahami

- lib/validation.js: normalisasi dan validasi murni.
- lib/session.js: JWT, hashing ID sesi, pembacaan status, dan tujuan setelah login.
- lib/auth.js: akses cookie dan pemeriksaan pengguna/peran.
- app/actions/auth.js: daftar, masuk, keluar, dan hapus akun ditolak.
- middleware.js: pemeriksaan sebelum halaman dilayani.
- database/queries/auth/: SQL autentikasi.
- database/migrations/002-auth.sql: penambahan tabel pada database Hari 1.
- scripts/test-auth.mjs: pengujian sesi dan transaksi yang dapat diulang.

## Lima pertanyaan presentasi

1. **Mengapa JWT masih perlu tabel sesi?** Untuk mencabut sesi saat logout dan menghapus akun, tanpa menunggu JWT kedaluwarsa.
2. **Apa fungsi httpOnly?** JavaScript browser tidak dapat membaca cookie. Aplikasi tetap perlu perlindungan XSS dan CSRF; httpOnly hanya salah satu pengaman.
3. **Mengapa memeriksa role di server action lagi?** Pengguna dapat memanggil action tanpa memakai tombol UI, sehingga menyembunyikan tombol tidak cukup.
4. **Mengapa pendaftaran memakai transaksi?** Akun dan record sesi harus berhasil bersama. Kegagalan pembuatan sesi membatalkan akun.
5. **Mengapa role tidak dipercaya dari form atau JWT?** Form dapat dimanipulasi dan status dapat berubah. Backend membatasi pilihan saat daftar serta membaca role/status terbaru dari database.

