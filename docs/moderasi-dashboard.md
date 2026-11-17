# Moderasi, statistik, dan favorit

Hari 6 memakai tabel yang sudah tersedia. Tidak ada perubahan schema atau seed. Query baru berada di database/queries/admin dan database/queries/member. Statistik Admin memakai database/queries/platform.sql.

## Antrean moderasi

Halaman /dashboard/admin/moderation menampilkan karya yang masih memiliki laporan pending. Subquery mengelompokkan reports berdasarkan artwork_id, menghitung jumlah laporan, dan menggabungkan alasan yang berbeda. Hasilnya baru di-join dengan karya, kreator, dan kategori. Cara ini mencegah jumlah laporan berlipat akibat join ke banyak komentar atau likes.

Antrean diurutkan dari laporan tertua, dengan enam karya per halaman. Rincian /dashboard/admin/moderation/[id] menampilkan gambar, deskripsi, pelapor, alasan, dan penjelasan laporan. Sepuluh laporan ditampilkan per halaman. Teks laporan dirender sebagai teks JSX, sehingga HTML tidak dieksekusi.

Admin dapat mengambil dua tindakan:

- Abaikan laporan: satu laporan berubah dari pending menjadi dismissed. reviewed_by diisi dari ID Admin dalam sesi, dan reviewed_at dari waktu database. Karya serta interaksinya tetap ada. Baris laporan dipertahankan agar Member yang sama tidak bisa melaporkannya ulang.
- Hapus karya: tersedia jika masih ada laporan pending dan konfirmasi dicentang. Karya dihapus beserta artwork_tags, likes, favorites, comments, reports, submissions, dan winners terkait melalui foreign key ON DELETE CASCADE. Master tags dan challenge tidak ikut dihapus.

Server action memeriksa role Admin, lalu service kembali memeriksa sesi/role dalam transaksi. ID pelapor atau Admin dari form tidak dipercaya. Semua ID menjadi parameter pg; pemilihan query berasal dari daftar internal.

## Transaksi dan keputusan bersamaan

Kedua tindakan mengunci baris karya dengan SELECT FOR UPDATE terlebih dahulu. Pengabaian laporan kemudian menjalankan UPDATE hanya jika status masih pending. Take down memeriksa ulang bahwa laporan pending masih ada sebelum DELETE.

Jika dua Admin mengambil keputusan bersamaan, operasi kedua menunggu kunci. Setelah menunggu, status/ketersediaan karya diperiksa kembali. Untuk satu laporan terakhir, hanya satu keputusan dapat berlaku: jika dismiss selesai dahulu, take down ditolak karena antrean kosong; jika take down selesai dahulu, dismiss tidak lagi menemukan karya/laporan.

Penghapusan karya dan seluruh relasinya berlangsung dalam satu transaksi PostgreSQL. File karya dihapus oleh action sesudah COMMIT. Jika database gagal, ROLLBACK mempertahankan karya dan file belum disentuh. File di public/examples dilindungi oleh removeUploads karena dipakai bersama oleh data seed. Apabila pembersihan file gagal, halaman menampilkan keterangan bahwa data sudah dihapus tetapi berkas belum dibersihkan.

Halaman yang dibuka lama bisa berisi data yang sudah diproses Admin lain. Permintaan seperti ini ditolak dengan pesan untuk memuat ulang; form tidak membuat ulang laporan atau karya.

URL gambar tetap /uploads/nama.webp, tetapi beforeFiles rewrite pada next.config.mjs meneruskannya ke app/api/uploads/[filename]/route.js. Handler membaca public/uploads langsung setiap permintaan. Jalur ini menghindari daftar file statis yang dipindai Next.js saat server mulai, sehingga unggahan baru dan penghapusan file lama sama-sama terbaca tanpa restart. Nama file tetap dibatasi ke UUID WebP, dan berkas yang tidak ada menghasilkan 404.

## Statistik

Dashboard Admin menampilkan jumlah Admin, Member, Curator, karya, laporan pending, dan challenge aktif. Seluruh angka berasal dari COUNT di PostgreSQL. Setiap hitungan memakai subquery terpisah agar relasi satu-ke-banyak tidak menggandakan jumlah.

Challenge aktif memenuhi starts_at <= now() dan ends_at > now(). Challenge yang belum mulai atau sudah berakhir tidak dihitung. Kolom timestamptz menyimpan waktu secara konsisten; tampilan tanggal memakai WITA.

Dashboard Member menampilkan jumlah karya miliknya, suka pada karyanya, favorit yang ia simpan, serta submisi terkirim. Tiga karya terbarunya ditampilkan bersama tautan pengelolaan. Fitur challenge Hari 7 dijelaskan di docs/challenge.md; Submisi Saya dan pemenang Hari 8 ada di docs/pemenang-submisi.md.

## Favorit privat

Halaman /dashboard/member/favorites membaca member_id dari sesi. SQL membatasi WHERE f.member_id=$1. Mengubah parameter URL atau menyisipkan ID Member lain dalam form tidak mengubah pengguna yang dibaca/dihapus datanya.

Daftar diurutkan berdasarkan waktu disimpan terbaru, dengan ID karya sebagai urutan tambahan jika waktunya sama. Maksimal 12 karya per halaman. Nomor halaman diperiksa dan dibatasi ke halaman terakhir yang tersedia. Setelah item terakhir pada halaman dihapus, daftar kembali ke halaman yang masih berisi data.

Menghapus favorit hanya menghapus baris favorites milik Member tersebut, tanpa menghapus karya. Jika karya dihapus oleh pemilik atau Admin, foreign key membersihkan favorit terkait sehingga tidak ada tautan ke karya yang sudah hilang.

## Bahan presentasi

1. Mengapa jumlah dihitung sebelum join? Relasi satu-ke-banyak dapat membuat satu laporan muncul berulang dan menghasilkan COUNT yang salah.
2. Apa beda dismiss dan take down? Dismiss mengubah status satu laporan; take down menghapus karya dan data terkait.
3. Mengapa perlu FOR UPDATE? Pemeriksaan status saja bisa lolos pada dua request bersamaan. Kunci membuat keputusan pada karya yang sama diproses bergantian.
4. Mengapa file dihapus setelah COMMIT? Sistem file tidak mengikuti ROLLBACK PostgreSQL. Urutan ini menjaga file tetap ada jika penghapusan database gagal.
5. Bagaimana menjaga privasi favorit? ID Member selalu berasal dari sesi server dan menjadi filter SQL, bukan input pengguna.
