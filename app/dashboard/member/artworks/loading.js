export default function ArtworkLoading() {
  return <section aria-busy="true" aria-label="Memuat karya"><p className="text-sm text-stone-600">Menyiapkan portofoliomu...</p><div className="mt-6 grid gap-5 sm:grid-cols-3">{[1,2,3].map((value) => <div key={value} className="h-60 animate-pulse bg-stone-200" />)}</div></section>;
}

