export default function ArrowIcon({ diagonal = false, className = "h-4 w-4" }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className={className}><g transform={diagonal ? "rotate(-45 12 12)" : undefined}><path d="M4 12h15M13 6l6 6-6 6" /></g></svg>;
}
