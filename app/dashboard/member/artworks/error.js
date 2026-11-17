"use client";
import RetryButton from "@/components/retry-button";
export default function ArtworkErrorPage() {
  return <section role="alert" className="max-w-xl border border-stone-300 p-7"><h1 className="font-serif text-3xl">Karya belum dapat dimuat.</h1><p className="mt-4 leading-7 text-stone-600">Coba muat ulang portofoliomu beberapa saat lagi.</p><RetryButton className="mt-6 bg-stone-800 px-5 py-3 font-semibold text-white">Coba lagi</RetryButton></section>;
}

