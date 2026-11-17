# Challenge Hari 7

Curator yang disetujui dapat membuat, membaca, mengubah, dan menghapus challenge miliknya. Member mengirim satu karya dari portofolionya ke challenge aktif dan dapat menarik submisi sebelum berakhir. Guest, Admin, dan Curator dapat membaca halaman publik tanpa tombol partisipasi Member.

## Halaman dan berkas

| Alamat | Fungsi |
| --- | --- |
| /dashboard/curator | Daftar challenge milik Curator dan tindakan hapus |
| /dashboard/curator/challenges/new | Form challenge baru |
| /dashboard/curator/challenges/[id]/edit | Edit challenge sendiri |
| /challenges | Pencarian, filter status, dan paginasi challenge publik |
| /challenges/[id] | Banner, deskripsi, aturan, hadiah, jadwal, galeri, submit/withdraw |
| /#challenge | Challenge aktif atau hasil pencarian challenge pada beranda |

lib/challenges.js menyimpan aturan dan transaksi. lib/challenge-rules.js berisi konversi waktu serta filter yang juga dipakai form. app/actions/challenges.js membaca form, memeriksa sesi/peran, memanggil service, dan mengembalikan tujuan navigasi internal. Query berada di database/queries/challenges. Tidak ada tabel atau kolom baru.

## Validasi dan kepemilikan

Semua field wajib: judul maksimal 150 karakter, deskripsi/aturan masing-masing 5.000 karakter, hadiah 1.000 karakter, tanggal mulai/selesai, dan banner. Teks dipangkas sebelum diperiksa. Waktu selesai harus setelah waktu mulai, baik di backend maupun CHECK database.

Banner memakai validasi gambar yang sama dengan karya: JPEG/PNG/WebP statis, maksimal 5 MB dan 20 megapiksel, pemeriksaan MIME/ekstensi/signature/decode, lalu disimpan sebagai WebP bernama UUID. Saat edit, banner lama dipertahankan jika tidak ada file baru. Banner baru dibersihkan jika SQL gagal; banner lama dibersihkan setelah commit jika diganti. public/examples tidak ikut dihapus.

Service Curator memeriksa ulang sesi, role, dan curator_status di dalam transaksi. Curator Pending/Rejected ditolak meskipun cookie masih valid. Query edit/hapus selalu menyertakan curator_id dari sesi; ID Curator yang disisipkan ke form tidak dipakai.

Challenge yang sudah memiliki pemenang boleh diperbarui metadata/banner-nya, tetapi jadwal dikunci agar tidak dibuka kembali setelah hasil ditetapkan. Form memakai ketelitian menit; timestamp lama tetap disimpan dengan presisi aslinya jika jadwal tidak diubah. Pemilihan dan penampilan pemenang Hari 8 dijelaskan di docs/pemenang-submisi.md.

## WITA dan batas waktu

datetime-local tidak menyimpan zona waktu. Form secara eksplisit meminta WITA (UTC+8), dan parseWitaDate menambahkan offset +08:00 sebelum membuat Date. Konversi tidak mengikuti zona waktu komputer/browser. Format dicek ulang untuk menolak tanggal seperti 30 Februari dan input yang menyisipkan zona waktu lain. PostgreSQL menyimpan tanggal dalam timestamptz, lalu tampilan diformat kembali memakai Asia/Makassar.

Submit mengharuskan starts_at <= waktu sekarang dan ends_at > waktu sekarang. Withdraw hanya mengharuskan ends_at > waktu sekarang. Karena itu, submisi yang sudah ada masih dapat ditarik jika Curator menggeser tanggal mulai ke masa depan, selama challenge belum berakhir.

Waktu keputusan berasal dari clock_timestamp() PostgreSQL. now() tetap memakai awal transaksi dan dapat kedaluwarsa ketika request menunggu kunci. Sesudah memperoleh kunci challenge, backend membaca ulang waktu aktual. INSERT/DELETE juga mengulang kondisi waktu sehingga deadline tetap diperiksa pada pernyataan yang mengubah data.

created_at submisi juga diisi clock_timestamp() agar mencatat saat karya diterima setelah antrean kunci selesai.

## Transaksi partisipasi

Submit menjalankan langkah berikut pada satu koneksi:

1. Periksa sesi Member dan kunci akun/sesi.
2. Cari serta kunci karya berdasarkan id dan member_id dari sesi.
3. Kunci challenge dan pastikan Curator penyelenggara masih approved.
4. Periksa waktu aktual dan pastikan Member belum memiliki submisi.
5. INSERT dengan kondisi waktu, lalu COMMIT. Kegagalan membatalkan transaksi.

UNIQUE(challenge_id, member_id) membatasi satu submisi per Member. Foreign key gabungan (artwork_id, member_id) menguatkan kepemilikan karya di database. Satu karya boleh dipakai pada beberapa challenge berbeda karena batasnya berlaku per challenge.

Withdraw mengambil Member dari sesi dan menghapus hanya WHERE challenge_id serta member_id cocok. Mengirim ID submisi atau ID Member lain tidak mengubah target. Karya asli tetap ada. Jika challenge dihapus, submisi dan pemenang terkait dibersihkan melalui CASCADE, sedangkan karya peserta tidak ikut terhapus.

Urutan kunci submit adalah karya lalu challenge agar tidak berlawanan dengan penghapusan karya melalui moderasi. Form yang dibuka sebelum deadline tetap ditolak jika waktu pengiriman/withdraw sudah terlewat.

## Pencarian dan tampilan

Pencarian memakai judul challenge atau nama Curator dengan ILIKE berparameter. Karakter %, _, dan backslash diperlakukan sebagai teks literal. Status hanya menerima all, active, upcoming, dan ended. List publik memuat enam challenge per halaman dan galeri submisi 12 karya per halaman.

Beranda awal menampilkan tiga challenge aktif. Jika kata kunci diisi pada pencarian beranda, section challenge mencari seluruh status. Filter kategori hanya berlaku untuk karya. Daftar pribadi Curator selalu memakai ID dari sesi.

Halaman publik tidak memilih email/hash Curator. Aturan serta deskripsi dirender sebagai teks JSX. Loading, kosong, error, validasi form, dan state portofolio Member kosong disediakan.

## Bahan presentasi

1. Apa beda datetime-local dan timestamptz? Input pertama tidak punya zona; backend menafsirkan WITA, lalu database menyimpan waktu absolut.
2. Mengapa clock_timestamp() dipakai? Request yang mengantre harus dinilai dengan waktu aktual setelah mendapat kunci, bukan waktu awal transaksi.
3. Mengapa butuh constraint unik? Dua request dapat dikirim hampir bersamaan; database tetap menjaga satu submisi per Member/challenge.
4. Bagaimana karya orang lain dicegah? Filter member_id dari sesi diperkuat foreign key gabungan pada submissions.
5. Apa yang dihapus saat challenge dihapus? Challenge, submisi, pemenang, dan banner unggahannya; karya asli peserta tetap ada.
