import "./globals.css";
import localFont from "next/font/local";

const displayFont = localFont({
  src: "../public/fonts/bodoni-moda.woff2",
  variable: "--font-display",
  weight: "400 900",
  style: "normal",
  display: "swap",
});
const accentFont = localFont({
  src: "../public/fonts/cormorant-garamond-italic.woff2",
  variable: "--font-accent",
  weight: "300 700",
  style: "italic",
  display: "swap",
});

export const metadata = {
  title: "Atelier | Galeri Karya dan Cerita",
  description: "Galeri karya, cerita para kreator, dan pertemuan sudut pandang melalui challenge seni.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={displayFont.variable + " " + accentFont.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}

