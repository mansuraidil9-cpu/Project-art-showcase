# Aset visual Atelier

Diperbarui 18 November 2026 WITA. Foto dan reproduksi contoh disimpan lokal agar halaman tidak bergantung pada layanan gambar eksternal.

## Foto pembuka

Foto baru memperlihatkan ruang Tate Britain, dua lukisan berbingkai emas, dan kanvas Rothko berwarna oker. File public/images/atelier-gallery-hd.webp berukuran 2400 × 1600 piksel, berasal dari foto asli 4032 × 3024 piksel. Sumber dan lisensi foto CC0 tercatat di [hero-hd-source.md](hero-hd-source.md). Kredit foto: Jp1008 / Wikimedia Commons.

Foto dikompresi ke WebP kualitas 90 dan dipotong ke rasio 3:2 tanpa memperbesar sumber. Beranda memakai next/image dengan kualitas 90 dan ukuran responsif. Foto Sibisi yang dipakai versi sebelumnya tidak lagi menjadi pembuka.

## Enam karya contoh

| Judul pada aplikasi | Kategori | Pembuat asli/fotografer | Lisensi | Resolusi lokal | Asal |
| --- | --- | --- | --- | --- | --- |
| Keramaian Boulevard des Capucines | Seni Lukis | Claude Monet | [Public domain](https://creativecommons.org/publicdomain/mark/1.0/) | 1631 × 2200 | [Sumber](https://commons.wikimedia.org/wiki/File:Claude_Monet_-_Boulevard_des_Capucines_-_Google_Art_Project.jpg) |
| Senja di Pantai Losari | Fotografi | Khaerunnisa Atikah Syahidah | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | 2200 × 1467 | [Sumber](https://commons.wikimedia.org/wiki/File:Keindahan_sunset_di_pantai_losari.jpg) |
| Komposisi Suprematis | Seni Lukis | Kazimir Malevich | [Public domain](https://creativecommons.org/publicdomain/mark/1.0/) | 1761 × 2200 | [Sumber](https://commons.wikimedia.org/wiki/File:Suprematist_Composition_-_Kazimir_Malevich.jpg) |
| Jembatan di Atas Kolam Teratai | Seni Lukis | Claude Monet | [Public domain](https://creativecommons.org/publicdomain/mark/1.0/) | 1759 × 2200 | [Sumber](https://commons.wikimedia.org/wiki/File:The_Water-Lily_Pond_1899_Claude_Monet_Metropolitan.jpg) |
| Gelombang Besar di Kanagawa | Cetak Grafis | Katsushika Hokusai | [Public domain](https://creativecommons.org/publicdomain/mark/1.0/) | 2200 × 1505 | [Sumber](https://commons.wikimedia.org/wiki/File:Great_Wave_off_Kanagawa2.jpg) |
| Venus de Milo dalam Marmer | Seni Patung | Pemahat Yunani kuno tidak diketahui; foto Caeciliusinhorto | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | 1238 × 2200 | [Sumber](https://commons.wikimedia.org/wiki/File:Venus_de_Milo_front_2023.jpg) |

Gambar berasal dari sumber beresolusi asli antara 2296 × 2869 dan 8242 × 5640 piksel. Semuanya diperkecil ke panjang maksimal 2200 piksel dan dikompresi sebagai WebP kualitas 88. Komposisi sumber dipertahankan; detail gambar dapat dibuka melalui tautan ukuran penuh. Ukuran berkas berkisar 182 KB sampai 1,55 MB, menyesuaikan detail teksturnya. next/image mengirim pratinjau sesuai ukuran layar, sehingga kartu tidak perlu memuat berkas ukuran penuh.

Data contoh merupakan koleksi referensi seni yang dibagikan akun demonstrasi. Pembuat asli, sumber, lisensi, dan keterangan reproduksi tampil pada halaman detail. Dua foto berlisensi CC BY-SA 4.0 tetap mengikuti lisensi tersebut setelah perubahan ukuran/format; empat reproduksi lukisan/cetak merupakan domain publik. Rekaman metadata lengkap tersedia di public/examples/hd/credits.json.

Judul dan kategori mengikuti isi gambar: boulevard Paris menjadi Seni Lukis, foto Losari menjadi Fotografi, Venus menjadi Seni Patung, dan Hokusai menjadi Cetak Grafis. Tags ikut diperbarui. Banner Warna Kota Kita memakai lukisan kota; Bentuk yang Bercerita memakai komposisi geometris; Hijau di Sekitar Kita memakai taman teratai.

## Font

Huruf tegak memakai Bodoni Moda dan aksen miring memakai Cormorant Garamond Italic. Berkas WOFF2 dan lisensi SIL OFL 1.1 disertakan di public/fonts. Keduanya dimuat melalui next/font/local. Sumber dan varian dicatat di [font-sources.md](font-sources.md).

## Database yang sudah berisi data

Jalankan npm run db:demo dari PowerShell setelah git pull dan npm ci. Skrip menjalankan database/migrations/003-demo-gallery.sql sebagai satu transaksi. Alternatif pgAdmin: buka berkas migrasi melalui ikon folder Query Tool, lalu F5. Akun database harus memiliki hak pemilik tabel, seperti postgres pada konfigurasi praktikum.

Migrasi menargetkan enam baris contoh dengan kecocokan ID, email akun contoh, judul lama, jalur SVG lama, dan tipe media. Karya yang berada di public/uploads, judul yang sudah diganti, serta karya milik akun lain dilewati. Banner hanya diperbarui jika akun Curator, judul, dan jalur contohnya cocok. Akun, suka, komentar, favorit, laporan, submisi, dan pemenang dipertahankan.

Selama pembaruan, transaksi mengunci tabel karya dan menonaktifkan sementara trigger larangan mengganti file. Trigger diaktifkan kembali sebelum COMMIT. Jika ada kesalahan, ROLLBACK memulihkan data dan keadaan trigger. Aplikasi tetap memakai aturan file tidak dapat diganti pada edit karya biasa. Menjalankan migrasi kembali menghasilkan nol pembaruan untuk baris yang sudah diproses.

Untuk instalasi kosong, jalankan schema.sql lalu seed.sql terbaru. Tidak perlu membuat ulang database yang sudah berisi akunmu. Hasil dapat diperiksa dengan database/check-demo-gallery.sql; trigger harus berstatus O (enabled).

## Pengujian

npm run demo:test membuat database uji terpisah, menjalankan schema/seed dua kali, menguji migrasi lama, pengulangan, perlindungan data khusus, serta rollback dan trigger. Database uji dibersihkan setelah selesai. Pengujian ini memerlukan hak CREATEDB pada akun pengembangan.
