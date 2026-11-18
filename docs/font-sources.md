# Font Atelier

Font judul diperbarui pada 18 November 2026 WITA untuk memperjelas perbedaan antara huruf tegak dan aksen miring pada bagian pembuka. Kedua keluarga font disimpan lokal dalam format WOFF2, sehingga tampilan dan build tidak memerlukan koneksi ke Google Fonts.

## Bodoni Moda

- Pemakaian: huruf serif tegak dengan kontras batang tebal/tipis yang jelas.
- Berkas: public/fonts/bodoni-moda.woff2, 74.592 byte.
- Varian: normal, bobot variabel 400–900, ukuran optis 6–96.
- Sumber: https://github.com/google/fonts/blob/main/ofl/bodonimoda/BodoniModa%5Bopsz%2Cwght%5D.ttf.
- SHA blob sumber GitHub: c5d582f8003ae692761dd8e9ce69de23cb9fea53.
- Pembuat yang tercantum dalam lisensi: The Bodoni Moda Project Authors, 2020.
- Lisensi: SIL Open Font License 1.1, salinan lengkap di public/fonts/bodoni-moda-OFL.txt.
- Sumber lisensi: https://github.com/google/fonts/blob/main/ofl/bodonimoda/OFL.txt.

## Cormorant Garamond Italic

- Pemakaian: kata pilihan dengan bentuk miring yang lebih mengalir dan berbeda dari huruf tegak Bodoni Moda.
- Berkas: public/fonts/cormorant-garamond-italic.woff2, 143.748 byte.
- Varian: italic asli, bobot variabel 300–700. Bentuk miring berasal dari berkas font tersendiri.
- Sumber: https://github.com/google/fonts/blob/main/ofl/cormorantgaramond/CormorantGaramond-Italic%5Bwght%5D.ttf.
- SHA blob sumber GitHub: 0d914e7663b7a1429d06ec60a5c5bb026031a2ef.
- Pembuat yang tercantum dalam lisensi: the Cormorant Project Authors, 2015.
- Lisensi: SIL Open Font License 1.1, salinan lengkap di public/fonts/cormorant-garamond-italic-OFL.txt.
- Sumber lisensi: https://github.com/google/fonts/blob/main/ofl/cormorantgaramond/OFL.txt.

## Pengolahan dan penggunaan

Berkas TTF asli diperoleh dari repository Google Fonts, lalu dikonversi ke WOFF2 menggunakan fontTools dan Brotli. Konversi hanya mengubah kemasan/kompresi; kontur huruf, karakter, serta sumbu variabel dipertahankan. Kedua berkas hasil dapat dibaca ulang dan memiliki seluruh karakter ASCII cetak. Total ukuran font adalah 218.340 byte, sekitar 213 KiB.

Integrasi menggunakan next/font/local. Atur style normal untuk Bodoni Moda dan italic untuk Cormorant Garamond, lalu gunakan variabel font terpisah. Bobot 400 untuk judul tegak dan 500 untuk kata aksen menjaga kontras serta keterbacaan. Font sans serif antarmuka tetap dapat memakai keluarga sistem.

Font dapat digunakan dan didistribusikan bersama proyek sesuai ketentuan SIL OFL 1.1. Salinan lisensi tetap disertakan ketika membagikan font bersama kode proyek. Tidak ada font yang diambil dari gambar referensi.
