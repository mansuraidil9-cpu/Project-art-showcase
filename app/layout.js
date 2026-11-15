import "./globals.css";

export const metadata = {
  title: "Ruang Karya | Art Showcase",
  description: "Ruang untuk karya, cerita, dan pertemuan kreatif.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="antialiased">{children}</body>
    </html>
  );
}

