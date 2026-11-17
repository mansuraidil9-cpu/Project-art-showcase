"use client";
import RetryButton from "@/components/retry-button";
export default function ErrorPage() {
  return <main role="alert" className="mx-auto max-w-xl px-5 py-20"><h1 className="font-serif text-3xl">Halaman belum dapat dimuat.</h1><p className="mt-4 text-stone-600">Coba lagi beberapa saat lagi.</p><RetryButton className="mt-6 rounded-lg bg-stone-800 px-5 py-3 text-white">Coba lagi</RetryButton></main>;
}

