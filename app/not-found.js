import Link from "next/link";
export default function NotFound() {
  return <main className="mx-auto max-w-xl px-5 py-20"><p className="text-sm text-stone-500">404</p><h1 className="mt-3 font-serif text-3xl">Ruang ini belum tersedia.</h1><Link href="/" className="mt-6 inline-block text-stone-800 underline">Kembali ke beranda</Link></main>;
}

