export default function PageSelector({ currentPage, numPages, onPageChange }) {
  if (!numPages || numPages <= 0) return null;

  return (
    <div className="inline-flex items-center gap-2.5 bg-surface/40 backdrop-blur-xl border border-white/[0.06] rounded-xl px-3 py-1.5 text-sm">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="text-txt-muted hover:text-txt transition-colors disabled:opacity-20 disabled:cursor-not-allowed px-1 cursor-pointer"
        aria-label="Previous page"
      >
        &larr;
      </button>

      <span className="text-txt-muted text-xs select-none">
        <span className="text-txt font-medium">{currentPage}</span>
        {" / "}
        <span className="text-txt font-medium">{numPages}</span>
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= numPages}
        className="text-txt-muted hover:text-txt transition-colors disabled:opacity-20 disabled:cursor-not-allowed px-1 cursor-pointer"
        aria-label="Next page"
      >
        &rarr;
      </button>
    </div>
  );
}
