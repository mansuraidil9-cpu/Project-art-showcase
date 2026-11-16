"use client";
export default function ArtworkErrorPage({ reset }) {
  return <section role="alert" className="max-w-xl rounded-xl border border-stone-300 bg-white p-7"><h1 className="font-serif text-3xl">Karya belum dapat dimuat.</h1><p className="mt-4 leading-7 text-stone-600">Coba muat ulang portofoliomu beberapa saat lagi.</p><button onClick={reset} className="mt-6 rounded-lg bg-stone-800 px-5 py-3 font-semibold text-white">Coba lagi</button></section>;
}

