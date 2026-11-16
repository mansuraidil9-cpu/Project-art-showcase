# Interaksi dan profil Member

Fitur Hari 5 memakai tabel yang sudah ada. Tidak ada migrasi tambahan. Semua query baru tersimpan di database/queries/interactions, database/queries/profile, dan database/queries/auth.

## Alur interaksi

Detail karya memuat status like, favorit, dan laporan dari database hanya untuk Member yang sedang masuk. Tombol mengirim ID karya serta keadaan yang diinginkan: yes atau no. Server tidak membalik keadaan secara buta. Mengulang permintaan yes tetap menghasilkan satu like atau favorit karena primary key (member_id, artwork_id) dan ON CONFLICT DO NOTHING.

Server action memanggil requireUser, lalu service kembali memeriksa token dan sesi aktif di dalam transaksi. withMemberTransaction mengunci akun/sesi agar pencabutan akses tidak terlewat saat operasi berjalan. Nama query dipilih dari daftar tetap, sedangkan ID dan teks dikirim sebagai parameter pg.

Komentar harus 1–1.000 karakter setelah trim. Penghapusan mencari komentar berdasarkan ID komentar dan ID Member dari sesi. ID karya tujuan setelah penghapusan diambil dari baris database. Komentar dirender sebagai teks JSX, tanpa dangerouslySetInnerHTML, sehingga teks HTML tidak dijalankan.

Laporan membutuhkan alasan yang tersedia dan penjelasan 10–1.000 karakter. Member dilarang melaporkan karya sendiri. UNIQUE(member_id, artwork_id) mempertahankan aturan satu laporan, termasuk setelah laporan di-dismiss. Peninjauan laporan oleh Admin dibuat pada Hari 6.

Setelah perubahan berhasil, action mengembalikan alamat internal tetap dan komponen useActionForm membuka kembali halaman. Pembacaan database yang baru memperbarui jumlah/status tombol. Tidak ada ID pengguna yang dipercaya dari form.

## Profil publik

Halaman /dashboard/member/profile mengubah nama tampilan, foto, bio, website, Instagram, dan Behance. Nama wajib 2–80 karakter; bio opsional maksimal 500 karakter. Tautan boleh kosong. URL harus lengkap dengan http atau https, maksimal 2.048 karakter, dan tidak boleh memuat username/password. Tautan Instagram harus berasal dari instagram.com; Behance dari behance.net, termasuk subdomain keduanya.

Foto profil menerima JPEG, PNG, atau WebP statis, maksimal 2 MB dan 20 megapiksel. Server memeriksa ekstensi, MIME, signature, dan hasil decode sharp. Foto diorientasikan, metadata dibuang, lalu disimpan sebagai WebP dengan UUID, maksimal 1.024 piksel. File baru dibersihkan jika transaksi database gagal. Foto lama baru dihapus setelah COMMIT agar profil lama tetap valid ketika penyimpanan gagal. Hapus foto dan unggah foto baru tidak dapat dipilih bersamaan.

Form mempertahankan foto yang dipilih saat isian lain gagal validasi. Pemeriksaan browser membantu pengguna, tetapi server tetap melakukan semua validasi.

Query profil publik hanya memilih nama, foto, bio, dan tautan; email serta hash password tidak ikut dipilih. Email hanya ditampilkan dalam dashboard privat.

## Email dan password

Halaman /dashboard/member/account memisahkan dua form. Keduanya memerlukan password saat ini dan membatasi percobaan menjadi lima per 15 menit, per akun dan jenis perubahan. Counter disimpan sebelum transaksi sehingga kesalahan password yang memicu ROLLBACK tetap dihitung.

Email dinormalisasi menjadi huruf kecil, harus valid dan unik. Password baru minimal 10 karakter, maksimal 72 byte, harus sesuai konfirmasi, dan berbeda dari password saat ini. bcrypt.compare memeriksa password lama; bcrypt.hash dengan biaya 12 menyimpan password baru. Password tidak dikembalikan melalui state form.

Perubahan akun dan DELETE seluruh sesi pengguna berada dalam satu transaksi. Setelah COMMIT, cookie dibersihkan dan pengguna diarahkan ke login. Semua perangkat harus masuk lagi. JWT lama mungkin masih lolos pemeriksaan tanda tangan middleware, tetapi pemeriksaan sesi database pada halaman/action/handler menolaknya.

Login mengunci baris akun dengan FOR UPDATE sebelum bcrypt.compare dan membuat sesi dalam transaksi yang sama. Ini menyelaraskan login yang berjalan bersamaan dengan perubahan password: login yang lebih dahulu selesai akan dicabut sesinya; login yang menunggu akan membaca hash terbaru. Middleware tetap hanya memverifikasi JWT tanpa pg.

## Bahan tanya jawab

1. Mengapa perlu constraint selain validasi? Dua request dapat lolos pemeriksaan pada waktu yang sama; constraint menjaga keunikan pada database.
2. Mengapa penghapusan komentar menyertakan member_id? ID komentar bisa dipalsukan. Pembatasan berdasarkan sesi menjaga kepemilikan di backend.
3. Mengapa perubahan password memakai transaksi? Hash baru dan pencabutan semua sesi harus berhasil bersama atau dibatalkan bersama.
4. Mengapa foto lama dihapus setelah commit? Sistem file tidak mengikuti ROLLBACK PostgreSQL; urutan dan pembersihan harus ditangani aplikasi.
5. Mengapa JWT tetap diperiksa ke database? Sesi harus bisa dicabut sebelum tanggal kedaluwarsa token.
