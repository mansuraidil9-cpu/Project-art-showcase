# Tampilan Atelier

Desain diperbarui pada 18 November 2026 WITA berdasarkan referensi galeri editorial yang dipilih pengguna. Nama tampilan menjadi Atelier, sedangkan teks antarmuka tetap bahasa Indonesia.

## Keputusan desain

Latar krem, teks hitam, judul serif, garis tipis, dan bidang persegi memberi ruang bagi karya. Beranda memiliki foto ruang pamer, galeri populer/terbaru, sorotan pemenang, pengenalan kreator, pencarian, filter kategori, dan challenge aktif. Bagian kreator mengambil nama serta tautan dari karya yang benar-benar tersedia.

Galeri memakai empat kolom pada layar besar dan dua kolom pada layar kecil. Tinggi pratinjau dibuat bervariasi agar susunannya terasa seperti ruang pamer. Halaman detail tetap menampilkan gambar karya secara utuh. Pada HP, bagian pembuka beranda menjadi satu kolom dan pengantar samping login disembunyikan supaya form mudah ditemukan.

Navigasi utama menyediakan Galeri, Kreator, Challenge, dan Tentang. Logo Atelier selalu menuju beranda. Menu akun mengarah ke dashboard sesuai peran/status dan menyediakan tombol keluar. Dashboard, form, halaman detail, loading, error, dan 404 mengikuti gaya yang sama. Merah dipakai untuk pesan error atau tindakan penghapusan.

## File utama

| File | Kegunaan |
| --- | --- |
| app/globals.css | Warna, tipografi, kelas bersama, breakpoint, dan pengurangan animasi |
| app/layout.js dan app/icon.svg | Nama situs, deskripsi, bahasa, dan ikon Atelier |
| app/page.js | Susunan beranda dan data galeri/challenge/kreator |
| components/site-header.js dan auth-links.js | Navigasi publik serta akun sesuai sesi |
| components/artwork-card.js, challenge-card.js, winner-card.js | Penyajian karya, challenge, dan pemenang |
| components/dashboard-nav.js | Menu dashboard serta penanda halaman aktif |
| components/*form*.js dan components/admin/forms.js | Tampilan field, validasi, tombol, dan status pengiriman |
| app/(auth), app/dashboard, app/artworks, app/creators, app/challenges | Halaman yang menggunakan komponen bersama |
| public/images/atelier-gallery.webp | Foto pembuka lokal |
| docs/aset-visual.md | Sumber, lisensi, dan pengolahan foto |

## Mengganti tema dan gambar

Warna utama ada pada :root di app/globals.css: --paper untuk latar, --ink untuk teks utama, --muted untuk teks pendamping, dan --line untuk garis. Kelas seperti button-primary, field-input, dan panel membuat form di berbagai peran tetap konsisten. Tailwind dipakai untuk susunan, jarak, ukuran layar, serta variasi komponen. @theme menyelaraskan font dan warna stone dengan palet situs.

Font memakai keluarga sistem agar build dan tampilan tidak bergantung pada pengunduhan font. Link memiliki warna eksplisit. :focus-visible memberi penanda pengguna keyboard, dan prefers-reduced-motion mengurangi animasi bagi pengguna yang membutuhkannya.

Foto pembuka terpisah dari portofolio pengguna. Untuk menggantinya, sediakan gambar lokal yang boleh dipakai, optimalkan ke WebP, sesuaikan src serta alt di app/page.js, lalu catat sumbernya. File karya pengguna tetap dikelola melalui alur upload yang memvalidasi format, ukuran, dan isi gambar. Mengganti hero tidak mengubah file karya dalam database.

Nama repository, database art_showcase, cookie sesi, issuer JWT, serta email/password akun contoh dipertahankan. Perubahan nama antarmuka tidak perlu mencabut sesi yang sah atau membuat ulang data. Tidak ada perubahan skema maupun migrasi pada tahap tampilan ini.

## Mengecek di Windows

Hentikan server lama dengan Ctrl+C, kemudian jalankan di PowerShell dari folder proyek:

```powershell
git pull --ff-only
npm ci
npm run lint
npm run build
npm run dev
```

1. Buka http://localhost:3000. Periksa logo Atelier, foto galeri, karya populer/terbaru, sorotan, kreator, serta challenge.
2. Coba mencari judul karya atau kreator, memilih kategori, dan mengubah urutan. Buka detail karya, profil, serta challenge.
3. Masuk sebagai Member, Admin, dan Curator untuk memeriksa menu serta form masing-masing. Coba juga Curator Pending/Rejected.
4. Pada DevTools browser, periksa lebar 320, 390, 768, 1024, dan 1366 piksel. Navigasi harus dapat digunakan, tulisan terbaca, dan halaman tidak bergeser ke samping.
5. Di pgAdmin, buka database/queries/platform.sql serta database/check-auth.sql melalui ikon folder Query Tool. Perubahan desain tidak membutuhkan schema atau seed ulang.

## Empat hal untuk dipahami

1. Komponen bersama menghindari tampilan dan perilaku yang berbeda-beda pada halaman sejenis.
2. Breakpoint menyesuaikan kolom dan navigasi terhadap lebar layar; tampilan HP tidak sekadar mengecilkan desktop.
3. Nama dan foto tampilan terpisah dari identitas sesi serta data portofolio, sehingga perubahan UI tidak perlu memindahkan database.
4. Form tetap mengirim data ke server action yang sama. Validasi backend, pemeriksaan sesi/peran, kepemilikan, dan transaksi tetap menentukan apakah tindakan boleh dilakukan.
