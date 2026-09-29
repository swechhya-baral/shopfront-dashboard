import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
}

const buttonClass =
  "flex h-8 w-8 items-center justify-center rounded-md border border-line hover:bg-bg disabled:cursor-not-allowed disabled:opacity-40";

const Pagination = ({ page, pageSize, total, onChange }: PaginationProps) => {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between border-t border-line px-4 py-3 text-sm">
      <p className="text-muted">
        {from}–{to} of {total}
      </p>
      <div className="flex items-center gap-2">
        <span className="text-muted">
          Page {page} of {pageCount}
        </span>
        <button
          className={buttonClass}
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          className={buttonClass}
          onClick={() => onChange(page + 1)}
          disabled={page >= pageCount}
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
