"use client";
import RetryButton from "@/components/retry-button";
export default function AdminErrorPage() {
  return <section role="alert" className="max-w-xl rounded-xl border border-stone-300 bg-white p-7"><h1 className="font-serif text-3xl">Data belum dapat dimuat.</h1><p className="mt-4 leading-7 text-stone-600">Coba muat ulang data. Jika masalah berlanjut, periksa koneksi aplikasi.</p><RetryButton className="mt-6 rounded-lg bg-stone-800 px-5 py-3 text-sm font-semibold text-white">Coba lagi</RetryButton></section>;
}

