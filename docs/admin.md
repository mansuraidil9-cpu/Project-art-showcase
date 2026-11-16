# Modul Admin Hari 3

## Halaman dan navigasi

Header bersama menyediakan Beranda, dashboard sesuai peran, nama akun, dan Keluar. Menu Admin berisi Ringkasan, Kategori, Pengguna, dan Verifikasi Curator. Menu Member/Curator hanya menampilkan halaman yang sudah tersedia. Tautan ke fitur berikutnya ditambahkan saat fiturnya dibuat.

| Alamat | Kegunaan |
| --- | --- |
| /dashboard/admin | Pintu masuk modul Admin |
| /dashboard/admin/categories | Daftar, tambah, dan hapus kategori |
| /dashboard/admin/categories/[id]/edit | Mengubah nama dan deskripsi kategori |
| /dashboard/admin/users | Daftar pengguna dengan filter peran dan paginasi |
| /dashboard/admin/curators | Meninjau Curator Pending |

Statistik platform dan moderasi laporan ditambahkan pada Hari 6. Penjelasan query, transaksi, serta alurnya tersedia di docs/moderasi-dashboard.md.

## Kategori

Nama wajib diisi, maksimal 60 karakter; deskripsi opsional maksimal 250 karakter. Backend merapikan spasi sebelum menyimpan. Indeks unik lower(name) mencegah nama yang hanya berbeda huruf besar/kecil.

Penghapusan memakai konfirmasi. Kategori yang dipakai karya tidak dapat dihapus karena foreign key RESTRICT. UI memberi penjelasan, sedangkan backend tetap menolak permintaan yang dikirim langsung.

Setelah berhasil menambah, mengubah, atau menghapus kategori, server action mengembalikan alamat daftar yang tetap berasal dari aplikasi. Browser meminta halaman baru untuk membaca ulang hasil SQL dan menampilkan pesan konfirmasi. Query Admin tidak memakai cache data Next.js. Input yang salah tetap ditampilkan bersama pesan per bidang tanpa berpindah halaman.

## Pengguna

Filter menerima semua peran, Admin, Member, atau Curator. Nilai filter dikirim sebagai parameter SQL dan daftar dibagi 12 akun per halaman. Email hanya ditampilkan di halaman Admin yang terlindungi.

Admin dapat menghapus Member dan Curator setelah mengetik ulang email akun tujuan. Akun Admin sendiri dan Admin lain tidak dapat dihapus. Pemeriksaan ini ada di layanan backend dan kondisi DELETE SQL, selain pada tampilan tombol.

Penghapusan akun memakai transaksi. Sebelum membaca target dan menghapusnya, backend memeriksa ulang sesi Admin, mengunci baris pengguna tujuan, serta memeriksa peran dan konfirmasi. Foreign key CASCADE membersihkan karya, challenge, interaksi, submisi, pemenang, dan sesi terkait sesuai relasinya. Karya peserta lain tetap ada ketika challenge milik Curator dihapus.

Setelah COMMIT, aplikasi membersihkan berkas milik akun di public/uploads. Hanya nama berkas unggahan yang sesuai pola aman yang dapat dihapus. Berkas seed di public/examples tetap dipertahankan. Sistem berkas tidak ikut transaksi PostgreSQL; kegagalan pembersihan dicatat dan ditampilkan sebagai informasi setelah akun berhasil dihapus.

## Verifikasi Curator

Antrean hanya memuat Curator Pending. Admin dapat menyetujui atau menolak; penolakan wajib mempunyai alasan 5–500 karakter. Alasan ditampilkan pada halaman status Curator.

SELECT ... FOR UPDATE mengunci akun tujuan selama pemeriksaan dan perubahan status. Jika dua Admin memproses pendaftaran yang sama bersamaan, hanya keputusan pertama yang berhasil; permintaan berikutnya mendapat pesan bahwa pendaftaran sudah diproses.

Status akun dibaca ulang melalui database pada halaman server dan action, sehingga perubahan berlaku pada sesi Curator yang masih aktif. Middleware tetap hanya memverifikasi JWT dari cookie, tanpa pg.

## Pembagian kode

- components/site-header.js dan dashboard-nav.js: navigasi bersama dan menu per peran.
- components/admin/forms.js: form serta status proses/validasi.
- app/actions/admin.js: membaca form, memeriksa Admin, memanggil layanan, dan mengembalikan tujuan setelah berhasil.
- lib/admin.js: validasi dan aturan bisnis yang dapat diuji tanpa UI.
- lib/uploads.js: pembersihan berkas unggahan setelah penghapusan akun.
- database/queries/admin/: seluruh SQL modul Admin.
- database/check-admin.sql: pemeriksaan manual di pgAdmin.
- scripts/test-admin.mjs: pengujian kategori, otorisasi, verifikasi, dan penghapusan berelasi.

Tidak ada perubahan skema pada Hari 3. schema.sql dan seed.sql tetap dapat dipakai untuk instalasi baru; pengguna database Hari 2 tidak perlu menjalankan migrasi tambahan.

## Lima hal untuk presentasi

1. **Validasi berlapis:** form membantu pengguna, server action memeriksa akses, layanan memeriksa ulang di transaksi, dan constraint menjaga konsistensi database.
2. **Nama kategori unik:** lower(name) pada indeks unik mencegah duplikasi kapitalisasi, termasuk ketika dua permintaan datang bersamaan.
3. **Transaksi dan lock:** pemeriksaan dan perubahan akun memakai koneksi yang sama. Lock mencegah dua Admin memberi keputusan yang saling menimpa.
4. **CASCADE dan RESTRICT:** CASCADE membersihkan relasi akun yang dihapus; RESTRICT mempertahankan kategori yang masih dipakai karya.
5. **Middleware tanpa database:** JWT hanya gerbang awal. Role dan status terkini tetap diperiksa di server sebelum data privat dibaca atau diubah.

