# Karya dan galeri Hari 4

## Halaman

| Alamat | Fungsi |
| --- | --- |
| / | Galeri populer/terbaru, pencarian judul/kreator, filter kategori |
| /artworks/[id] | Gambar penuh, cerita, kategori, tags, kreator, tanggal, jumlah suka, dan komentar publik |
| /creators/[id] | Profil publik baca saja dan galeri kreator |
| /dashboard/member/artworks | Portofolio sendiri dan penghapusan karya |
| /dashboard/member/artworks/new | Unggah karya |
| /dashboard/member/artworks/[id]/edit | Edit metadata karya sendiri |
| /uploads/[filename] | URL WebP unggahan; rewrite ke /api/uploads/[filename] |

Dokumen ini menjelaskan fondasi karya Hari 4. Pengaturan profil dan interaksi yang ditambahkan pada Hari 5 dijelaskan di docs/member.md.

## Validasi metadata

Judul wajib, maksimal 150 karakter. Deskripsi wajib, maksimal 5.000 karakter. Kategori harus benar-benar tersedia di database. Tags wajib 1–10 nama unik, maksimal 40 karakter per tag, dipisahkan koma.

Backend memangkas spasi, merapikan nama tag, menormalkan tag menjadi huruf kecil, dan menggabungkan duplikat. Tag disimpan di tags dan artwork_tags, bukan sebagai daftar koma dalam satu kolom.

## Upload gambar

Gambar yang diterima: JPEG, PNG, dan WebP statis, maksimal 5 MB serta 20 megapiksel. Batas payload server action diatur 6 MB untuk menyediakan ruang bagi multipart dan metadata form.

Pemeriksaan backend meliputi ukuran, ekstensi, MIME, signature awal berkas, lalu decoding gambar dengan sharp. HTML atau SVG yang sekadar diberi nama PNG ditolak sebelum diproses sebagai gambar.

Gambar diputar mengikuti orientasi asal, metadata dibuang, dan hasil disimpan sebagai WebP kualitas 90. Nama berkas memakai randomUUID, sehingga nama asal tidak dipakai sebagai path. File berada di public/uploads dan diabaikan Git.

Route handler uploads hanya menerima pola nama UUID WebP, membatasi ukuran saat membaca, serta mengirim Content-Type image/webp dan nosniff. Handler ini bersifat publik karena karya memang dapat dilihat Guest. Route tersedia agar gambar yang dibuat setelah server produksi berjalan tetap bisa dimuat.

Sejak Hari 6, beforeFiles rewrite meneruskan /uploads/[filename] ke app/api/uploads/[filename]/route.js agar file yang sudah ada saat server mulai juga tetap dibaca langsung, termasuk ketika file tersebut dihapus. Lokasi penyimpanan tetap public/uploads.

Enam SVG seed berada di public/examples dan merupakan berkas lokal tepercaya. SVG tersebut tidak menjadi format yang boleh diunggah pengguna.

## Transaksi dan berkas

Create memakai satu koneksi untuk memeriksa sesi Member, mengunci akun, memeriksa kategori, membuat artwork, serta menyimpan tags dan relasinya. Jika SQL gagal, ROLLBACK membatalkan seluruh perubahan dan berkas baru dibersihkan.

Edit mengunci karya berdasarkan id dan member_id dari sesi, lalu memperbarui metadata beserta tags dalam transaksi. file_path dan media_type tidak ada dalam query edit. Trigger database juga menolak penggantian keduanya.

Hapus memeriksa pemilik dan konfirmasi, lalu menghapus artwork dalam transaksi. Relasi interaksi, laporan, submisi, dan pemenang dibersihkan melalui CASCADE. Penghapusan file dilakukan sesudah COMMIT.

Sistem berkas tidak ikut transaksi PostgreSQL. Jika pembersihan berkas gagal, aplikasi mencatatnya dan menampilkan informasi kepada pemilik. Berkas contoh tidak dihapus karena dapat dipakai data seed lain.

## Form dan akses

Pemilik karya selalu berasal dari sesi, bukan hidden input. Member lain mendapat penolakan saat mengedit/menghapus meskipun mengirim request langsung. Curator dan Admin tidak diberi akses upload Member.

Form upload menyimpan pilihan file pada state klien untuk pratinjau dan pengiriman ulang. Pengiriman dilakukan lewat handler form dan server action agar koreksi isian tidak mereset gambar atau kategori. File tetap diperiksa ulang di server.

Setelah berhasil, server mengembalikan alamat internal dan browser meminta halaman baru. Query pg tidak memakai cache data Next.js, sehingga halaman baru membaca hasil SQL terkini.

Middleware tetap hanya memeriksa JWT dari cookie tanpa mengimpor pg. Halaman privat dan action mengulang pemeriksaan sesi/peran melalui database.

## Galeri dan SQL

Query memakai parameter untuk kata kunci, kategori, kreator, urutan, limit, dan offset. Pencarian menggunakan ILIKE pada judul dan nama kreator. Karakter %, _, dan backslash di kata kunci diperlakukan sebagai teks yang dicari.

Urutan populer memakai jumlah likes, lalu tanggal terbaru dan id untuk pemecah seri. Urutan dipilih menggunakan CASE dalam SQL; input pengguna tidak ditempelkan sebagai potongan ORDER BY.

Jumlah likes dihitung terpisah dari tags/komentar agar JOIN tidak menggandakan hitungan. Galeri memiliki paginasi 12 karya per halaman; beranda awal menampilkan enam populer dan enam terbaru.

Profil publik hanya memilih nama, foto, bio, dan tautan publik. Email dan password tidak termasuk dalam query profil.

## Berkas proyek

- lib/artworks.js: validasi metadata, transaksi karya/tags, kepemilikan, dan pembacaan galeri.
- lib/uploads.js: validasi/decode gambar, penyimpanan, serta pembersihan file.
- lib/artwork-rules.js: batas file, filter galeri, dan pola pencarian.
- app/actions/artworks.js: membaca form dan memanggil layanan backend.
- components/artwork-form.js: form, pratinjau, dan konfirmasi hapus.
- components/artwork-card.js dan gallery-pagination.js: tampilan galeri bersama.
- database/queries/artworks/: seluruh query karya/galeri.
- database/check-artworks.sql: pemeriksaan manual di pgAdmin.
- scripts/test-artworks.mjs: pengujian validasi, kepemilikan, rollback, dan galeri.

Tidak ada tabel atau kolom baru pada Hari 4. Gunakan schema.sql dan seed.sql untuk database kosong; database Hari 3 tidak memerlukan migrasi tambahan.

## Lima pertanyaan presentasi

1. **Mengapa MIME saja belum cukup?** MIME dan nama bisa dipalsukan. Signature dan decoding memastikan isinya sesuai gambar yang diterima.
2. **Mengapa tags memakai transaksi?** Artwork, tags, dan relasinya harus berhasil bersama. Kegagalan satu langkah tidak boleh menyisakan karya setengah jadi.
3. **Bagaimana mencegah edit karya orang lain?** ID pengguna diambil dari sesi; query kepemilikan mencocokkan id karya dan member_id.
4. **Bagaimana file tetap saat edit?** Query edit hanya memuat metadata dan trigger database menolak perubahan file_path/media_type.
5. **Bagaimana pencarian aman?** Nilai dikirim lewat parameter pg, bukan dirangkai ke sintaks SQL; pilihan urutan juga dibatasi.

