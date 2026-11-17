"use client";
import RetryButton from "@/components/retry-button";
export default function ErrorPage() { return <section role="alert" className="max-w-2xl rounded-xl border border-stone-300 bg-white p-6"><h1 className="font-serif text-3xl">Challenge belum dapat dimuat.</h1><p className="mt-4 leading-7 text-stone-600">Periksa koneksi lalu coba kembali.</p><RetryButton className="mt-5 rounded-lg bg-stone-800 px-5 py-3 text-sm font-semibold text-white">Coba kembali</RetryButton></section>; }
