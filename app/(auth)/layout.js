import Link from "next/link";

export default function AuthLayout({ children }) {
  return <div className="mx-auto max-w-6xl px-5 sm:px-9">
    <header className="border-b border-stone-300 py-7"><Link href="/" className="text-xl font-bold text-stone-800">ruang karya<span className="text-orange-800">.</span></Link></header>
    <main className="mx-auto max-w-md py-12 sm:py-16">{children}</main>
  </div>;
}

