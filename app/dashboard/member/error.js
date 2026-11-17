"use client";
import RetryButton from "@/components/retry-button";
export default function ErrorPage() { return <div role="alert" className="max-w-2xl border border-stone-300 p-6"><h2 className="font-serif text-2xl">Halaman belum dapat dimuat.</h2><p className="mt-4 leading-7 text-stone-600">Periksa koneksi lalu coba kembali. Data terbaru akan tampil saat halaman berhasil dimuat.</p><RetryButton className="mt-5 bg-stone-800 px-5 py-3 text-sm font-semibold text-white">Coba kembali</RetryButton></div>; }
