import Link from "next/link";
import { GuideCard } from "./GuideCard";
import type { GuideListing } from "@/lib/guides";

// 1,608 cards on one page made /guides a 4.7 MB document. Everything that lists
// guides now pages through this component instead.
export const PER_PAGE = 48;

export function pageCount(total: number) {
  return Math.max(1, Math.ceil(total / PER_PAGE));
}

export function pageSlice<T>(items: T[], page: number) {
  return items.slice((page - 1) * PER_PAGE, page * PER_PAGE);
}

// Page 1 keeps the bare URL so it never competes with /page/1.
function href(base: string, page: number) {
  return page === 1 ? base : `${base}/page/${page}`;
}

function Pager({ base, page, pages }: { base: string; page: number; pages: number }) {
  if (pages < 2) return null;
  // A window around the current page, always with the first and last.
  const nums = new Set<number>([1, pages, page - 1, page, page + 1]);
  const list = [...nums].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b);
  const link = "rounded-lg border border-line px-3 py-2 text-sm font-semibold hover:border-gold";
  return (
    <nav aria-label="Pagination" className="mt-10 flex flex-wrap items-center justify-center gap-2">
      {page > 1 && (
        <Link href={href(base, page - 1)} prefetch={false} rel="prev" className={`${link} text-pine`}>
          Previous
        </Link>
      )}
      {list.map((n, i) => (
        <span key={n} className="flex items-center gap-2">
          {i > 0 && n - list[i - 1] > 1 && <span className="px-1 text-ink-mute">...</span>}
          {n === page ? (
            <span aria-current="page" className="rounded-lg bg-pine px-3 py-2 text-sm font-semibold text-white">
              {n}
            </span>
          ) : (
            <Link href={href(base, n)} prefetch={false} className={`${link} text-pine`}>
              {n}
            </Link>
          )}
        </span>
      ))}
      {page < pages && (
        <Link href={href(base, page + 1)} prefetch={false} rel="next" className={`${link} text-pine`}>
          Next
        </Link>
      )}
    </nav>
  );
}

export function GuideGrid({ items, base, page, pages }: { items: GuideListing[]; base: string; page: number; pages: number }) {
  return (
    <>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((g) => <GuideCard key={g.slug} g={g} />)}
      </div>
      <Pager base={base} page={page} pages={pages} />
    </>
  );
}
