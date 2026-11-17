# Pemenang, submisi, dan featured

Hari 8 melengkapi galeri pengelolaan submisi, pemilihan/pengumuman pemenang, Submisi Saya, dan sorotan pemenang di beranda. Tidak ada perubahan tabel atau seed; query baru disimpan di database/queries/challenges dan database/queries/member.

## Alur Curator

Pada Dashboard Curator, setiap challenge memiliki tautan Kelola submisi. Halaman /dashboard/curator/challenges/[id]/submissions memeriksa sesi, role approved, dan kepemilikan challenge sebelum membaca peserta. Galeri memuat 12 karya per halaman, lengkap dengan kreator, waktu kirim WITA, dan peringkat jika sudah ada.

Sebelum challenge berakhir, Curator hanya dapat meninjau galeri. Setelah ends_at < clock_timestamp(), form Juara 1, 2, dan 3 tersedia. Daftar pilihannya memuat semua kandidat challenge, termasuk kandidat di halaman galeri lain. Pengumuman membutuhkan minimal satu dan maksimal tiga pemenang. Peringkat yang tidak dipakai dibiarkan kosong.

Satu karya tidak dapat mengisi dua peringkat. Peringkat harus 1, 2, atau 3 dan tidak boleh berulang. Submisi harus benar-benar milik challenge tersebut. Validasi ini diulang backend; form tidak menjadi satu-satunya perlindungan.

Pilihan yang disimpan langsung menjadi pengumuman publik. Curator dapat memperbarui pilihan sesudahnya. Jadwal challenge tetap dikunci setelah ada pemenang, sesuai aturan Hari 7.

## Transaksi pemilihan

selectWinners pada lib/challenges.js menjalankan langkah berikut dalam satu transaksi:

1. Periksa ulang sesi/role/status Curator dan kepemilikan challenge.
2. Validasi jumlah, peringkat, serta ID kandidat.
3. Kunci karya kandidat dan karya pemenang lama, dengan urutan ID yang tetap, lalu kunci challenge.
4. Periksa waktu aktual sesudah mendapat kunci.
5. Bandingkan pilihan lama yang dibuka di form dengan hasil terkini, lalu periksa ulang kandidat yang masih tersedia.
6. Hapus hasil lama dan masukkan semua pilihan baru. COMMIT hanya dilakukan jika seluruh langkah berhasil; kegagalan memicu ROLLBACK.

Karya dikunci sebelum challenge agar urutannya sejalan dengan submit dan penghapusan karya melalui moderasi. Kunci kandidat/submisi mencegah data yang sedang dipakai menghilang di tengah transaksi.

Setiap INSERT mengulang pemeriksaan waktu. created_at pemenang memakai clock_timestamp() agar menyimpan waktu keputusan aktual. Jika pilihan sama persis, service tidak menghapus/menulis ulang hasil sehingga waktu pengumuman tetap.

Constraint UNIQUE(challenge_id, rank), UNIQUE(submission_id), CHECK rank 1–3, dan foreign key gabungan (submission_id, challenge_id) menjadi perlindungan tambahan. Karena submissions membatasi satu Member per challenge dan artwork_id harus milik Member tersebut, satu karya pada challenge yang sama juga tidak bisa memiliki beberapa peringkat.

## Dua tab dan daftar yang berubah

Form menerima expectedVersion berupa susunan peringkat dan ID submisi yang sedang tersimpan, misalnya 1:12|2:15. Nilai ini bukan pengganti autentikasi; hak akses tetap diperiksa dari sesi dan database.

Jika tab lain sudah memperbarui hasil, nilai lama tidak cocok lagi dan backend menolak penyimpanan. Pesan meminta Curator memakai tombol Muat ulang pilihan, yang memuat ulang data server. Hal serupa berlaku jika moderasi menghapus kandidat. Pengumuman lama tidak dihapus hanya karena form lama dikirim.

## Pengumuman dan sorotan

Bagian Pemenang challenge di /challenges/[id] membaca hasil yang sudah tersimpan, diurutkan berdasarkan peringkat. Query publik hanya menampilkan hasil setelah challenge berakhir dan penyelenggara masih approved. Nama kreator dan karya bersifat publik; email/hash tidak ikut dipilih.

Beranda tanpa filter memiliki Sorotan para pemenang. Maksimal tiga karya ditampilkan, dengan peringkat dan tautan ke challenge asal. Query memakai max(created_at) per challenge untuk mengurutkan pengumuman terbaru, lalu row_number() per artwork untuk memilih satu kemunculan ketika karya yang sama menang di beberapa challenge. Section tidak mengganggu hasil pencarian karya.

Jika Admin melakukan take down karya pemenang, foreign key CASCADE menghapus submisi dan peringkat terkait. Pengumuman, kandidat, featured, dan Submisi Saya membaca data terbaru sehingga tidak menampilkan tautan ke karya yang sudah dihapus. Peringkat yang masih valid dipertahankan; Curator dapat mengisi kembali pilihan yang kosong.

## Submisi Saya

Halaman /dashboard/member/submissions membatasi query memakai member_id dari sesi. Daftar memuat challenge, karya yang dikirim, waktu kirim/deadline, status, serta hasil peringkat. Urutannya dari submisi terbaru, dengan 12 item per halaman.

Tombol Tarik submisi hanya tampil sebelum challenge berakhir. Action tetap memakai validasi backend Hari 7, dan hanya menghapus submisi Member dari sesi. Parameter returnTo hanya mengenali tujuan internal submissions; nilai lain kembali ke detail challenge. Halaman dibatasi kembali ke halaman yang masih tersedia setelah penghapusan.

Jika penyelenggara belum tersedia, riwayat Member tetap tampil tetapi tombol partisipasi ditutup. Karya asli tidak dihapus saat withdraw. Dashboard Member juga menampilkan jumlah submisi terkirim dan tautan ke daftar tersebut.

## Bahan presentasi

1. Mengapa hasil lama dihapus dan hasil baru dimasukkan dalam satu transaksi? Kegagalan salah satu peringkat harus mempertahankan pengumuman sebelumnya secara utuh.
2. Mengapa form memiliki expectedVersion? Dua tab bisa membaca hasil yang sama, lalu menyimpan keputusan berbeda. Perbandingan mencegah tab lama menimpa hasil terbaru.
3. Mengapa backend memeriksa ID submisi dan challenge bersama? ID dari form dapat diubah menjadi kandidat challenge lain.
4. Mengapa featured memakai row_number()? Satu karya dapat memenangkan beberapa challenge; beranda menampilkannya satu kali.
5. Apa yang terjadi jika karya pemenang diturunkan Admin? Relasi submisi/pemenangnya dibersihkan oleh database, sedangkan hasil lain tetap ada.
