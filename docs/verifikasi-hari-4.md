# Pemeriksaan Hari 4

Dijalankan 16 November 2026 WITA pada Linux cloud, Node.js 24.22.1, PostgreSQL 18.6, Next.js 15.5.29, dan Chromium. Pengguna tetap menjalankan pemeriksaan lokal Windows setelah git pull dan npm ci.

| Pemeriksaan | Hasil |
| --- | --- |
| npm run artwork:test | Lulus |
| Pengujian regresi database, autentikasi, dan Admin | Lulus |
| npm run lint | Lulus |
| npm run build | Lulus |
| JPEG, PNG, dan WebP valid diproses menjadi WebP | Lulus |
| MIME/ekstensi tidak sesuai, HTML menyamar PNG, SVG | Ditolak |
| File lebih dari 5 MB dan gambar lebih dari 20 megapiksel | Ditolak backend |
| Payload server action untuk file lebih dari 5 MB | Diterima parser 6 MB, lalu ditolak validator file |
| Tags kosong, duplikat, atau melebihi batas | Validasi dan normalisasi lulus |
| Kegagalan SQL saat create/edit | ROLLBACK; berkas baru dibersihkan dan metadata/tags lama tetap |
| Field salah diperbaiki tanpa memilih ulang file/kategori | Lulus browser |
| Upload setelah server produksi berjalan | File baru dapat dibaca handler uploads dan ditampilkan |
| Guest, Curator, dan Admin memanggil action upload | Tidak membuat karya |
| Member lain membuka edit/memanggil edit atau hapus | Ditolak |
| File disisipkan ke request edit | Ditolak |
| UPDATE file_path langsung di SQL | Ditolak trigger |
| Pencarian judul dan kreator, filter kategori | Lulus |
| Urutan populer/terbaru dan paginasi | Lulus pengujian SQL |
| Query yang berisi percobaan SQL injection | Tidak menjadi sintaks SQL |
| Detail dan profil kreator Guest | Tampil tanpa email privat atau kontrol pemilik |
| Hapus karya beserta file | Detail/file tidak ditemukan setelah penghapusan |
| Path traversal pada handler uploads | Ditolak |
| Beranda, detail, profil, portofolio, edit pada 320/390/768/1366 px | Tanpa overflow horizontal |
| Error JavaScript browser | Tidak ditemukan |

Pengujian backend membuat akun, kategori, tags, dan berkas sementara, lalu membersihkannya. Pengujian browser memakai Playwright dari skrip kerja; pengguna tidak perlu memasang Playwright untuk menjalankan aplikasi.

## Mengulang di Windows

1. Jalankan git pull --ff-only dan npm ci pada folder proyek.
2. Jalankan npm run artwork:test, npm run lint, dan npm run build.
3. Jalankan npm run dev dan masuk sebagai Member.
4. Unggah gambar dengan tags yang hanya berisi koma: server harus menolak. Perbaiki tags lalu kirim kembali tanpa memilih ulang gambar.
5. Edit karya yang berhasil dibuat. Periksa bahwa hanya judul, deskripsi, kategori, dan tags yang tersedia sebagai field edit.
6. Masuk sebagai Member lain lalu buka URL edit karya tersebut. Halaman harus tidak memberikan akses.
7. Cari karya melalui judul dan nama kreator, lalu ubah kategori atau urutan.
8. Hapus karya uji. Halaman detail dan file unggahan tidak lagi tersedia.
9. Buka database/check-artworks.sql melalui ikon folder pgAdmin, lalu cocokkan data.

Tidak ada perubahan schema atau seed pada Hari 4. Gunakan schema.sql lalu seed.sql untuk instalasi baru; database Hari 3 tidak memerlukan migrasi.

