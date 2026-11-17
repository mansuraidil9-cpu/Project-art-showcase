"use client";

import { useState } from "react";

export default function RetryButton({ className = "", children = "Coba kembali" }) {
  const [loading, setLoading] = useState(false);
  function retry() { setLoading(true);window.location.reload(); }
  return <button type="button" onClick={retry} disabled={loading} aria-busy={loading} className={className + " disabled:cursor-wait disabled:opacity-60"}>{loading ? "Memuat ulang..." : children}</button>;
}
