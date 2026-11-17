import "./globals.css";

export const metadata = {
  title: "Atelier | Galeri Karya dan Cerita",
  description: "Galeri karya, cerita para kreator, dan pertemuan sudut pandang melalui challenge seni.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="antialiased">{children}</body>
    </html>
  );
}

