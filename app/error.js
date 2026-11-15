"use client";
export default function ErrorPage({ reset }) {
  return <main className="mx-auto max-w-xl px-5 py-20"><h1 className="font-serif text-3xl">Halaman belum dapat dimuat.</h1><p className="mt-4 text-stone-600">Coba lagi beberapa saat lagi.</p><button onClick={reset} className="mt-6 rounded-lg bg-stone-800 px-5 py-3 text-white">Coba lagi</button></main>;
}

