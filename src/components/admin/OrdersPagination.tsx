"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const PAGE_SIZES = [50, 100, 200] as const;

export function OrdersPagination({
  page,
  perPage,
  total,
  totalPages,
}: {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  function hrefFor(next: { page?: number; perPage?: number }) {
    const params = new URLSearchParams(searchParams.toString());
    const p = next.page ?? page;
    const pp = next.perPage ?? perPage;
    params.set("page", String(p));
    params.set("perPage", String(pp));
    return `${pathname}?${params.toString()}`;
  }

  function setPerPage(value: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("perPage", String(value));
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#1f1f1f] px-5 py-3.5">
      <div className="flex flex-wrap items-center gap-3 text-[12.5px] text-[#8b8b8b]">
        <span>
          Showing {from}–{to} of {total}
        </span>
        <span className="text-[#333]">|</span>
        <label className="flex items-center gap-2">
          <span>Per page</span>
          <div className="flex gap-1">
            {PAGE_SIZES.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setPerPage(size)}
                className={`rounded-md px-2.5 py-1 text-[12px] font-medium transition ${
                  perPage === size
                    ? "bg-[#3b82f6] text-white"
                    : "bg-[#1a1a1a] text-[#9a9a9a] hover:bg-[#222] hover:text-white"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </label>
      </div>

      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Link href={hrefFor({ page: page - 1 })} className="admin-btn admin-btn-soft">
            Previous
          </Link>
        ) : (
          <span className="admin-btn admin-btn-soft opacity-40">Previous</span>
        )}
        <span className="min-w-[4.5rem] text-center text-[12.5px] text-[#8b8b8b]">
          {page} / {totalPages}
        </span>
        {page < totalPages ? (
          <Link href={hrefFor({ page: page + 1 })} className="admin-btn admin-btn-soft">
            Next
          </Link>
        ) : (
          <span className="admin-btn admin-btn-soft opacity-40">Next</span>
        )}
      </div>
    </div>
  );
}
