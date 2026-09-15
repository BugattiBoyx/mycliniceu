export type RangeKey =
  | "today"
  | "yesterday"
  | "7d"
  | "30d"
  | "month"
  | "last_month"
  | "year"
  | "last_year"
  | "all";

export const RANGE_OPTIONS: { key: RangeKey; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "month", label: "This month" },
  { key: "last_month", label: "Last month" },
  { key: "year", label: "This year" },
  { key: "last_year", label: "Last year" },
  { key: "all", label: "All time" },
];

export function parseRangeKey(value?: string | null): RangeKey {
  const keys = RANGE_OPTIONS.map((o) => o.key);
  if (value && keys.includes(value as RangeKey)) return value as RangeKey;
  return "30d";
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

export function getRangeBounds(range: RangeKey, now = new Date()) {
  const today = startOfDay(now);

  switch (range) {
    case "today":
      return { from: today, to: endOfDay(now), previousFrom: new Date(today.getTime() - 86400000), previousTo: new Date(today.getTime() - 1) };
    case "yesterday": {
      const y = new Date(today.getTime() - 86400000);
      return { from: y, to: endOfDay(y), previousFrom: new Date(y.getTime() - 86400000), previousTo: new Date(y.getTime() - 1) };
    }
    case "7d": {
      const from = new Date(today.getTime() - 6 * 86400000);
      const previousTo = new Date(from.getTime() - 1);
      const previousFrom = new Date(previousTo.getTime() - 6 * 86400000);
      previousFrom.setHours(0, 0, 0, 0);
      return { from, to: endOfDay(now), previousFrom, previousTo };
    }
    case "30d": {
      const from = new Date(today.getTime() - 29 * 86400000);
      const previousTo = new Date(from.getTime() - 1);
      const previousFrom = new Date(previousTo.getTime() - 29 * 86400000);
      previousFrom.setHours(0, 0, 0, 0);
      return { from, to: endOfDay(now), previousFrom, previousTo };
    }
    case "month": {
      const from = new Date(today.getFullYear(), today.getMonth(), 1);
      const previousFrom = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const previousTo = new Date(from.getTime() - 1);
      return { from, to: endOfDay(now), previousFrom, previousTo };
    }
    case "last_month": {
      const from = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const to = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);
      const previousFrom = new Date(today.getFullYear(), today.getMonth() - 2, 1);
      const previousTo = new Date(from.getTime() - 1);
      return { from, to, previousFrom, previousTo };
    }
    case "year": {
      const from = new Date(today.getFullYear(), 0, 1);
      const previousFrom = new Date(today.getFullYear() - 1, 0, 1);
      const previousTo = new Date(from.getTime() - 1);
      return { from, to: endOfDay(now), previousFrom, previousTo };
    }
    case "last_year": {
      const from = new Date(today.getFullYear() - 1, 0, 1);
      const to = new Date(today.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
      const previousFrom = new Date(today.getFullYear() - 2, 0, 1);
      const previousTo = new Date(from.getTime() - 1);
      return { from, to, previousFrom, previousTo };
    }
    case "all":
    default:
      return {
        from: new Date(0),
        to: endOfDay(now),
        previousFrom: new Date(0),
        previousTo: new Date(0),
      };
  }
}

/** Estimated COGS margin for gross profit when no cost data exists */
export const EST_MARGIN = 0.62;

export function pctChange(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / previous) * 100;
}

export function buildTimeline(
  orders: { createdAt: Date; total: number; status: string }[],
  from: Date,
  to: Date,
  range: RangeKey,
) {
  const paid = orders.filter((o) => o.status === "paid" || o.status === "fulfilled");
  const spanMs = to.getTime() - from.getTime();
  const useMonths = range === "year" || range === "last_year" || spanMs > 90 * 86400000;
  const buckets: { label: string; key: string; revenue: number; orders: number }[] = [];

  if (useMonths) {
    const cursor = new Date(from.getFullYear(), from.getMonth(), 1);
    const end = new Date(to.getFullYear(), to.getMonth(), 1);
    while (cursor <= end) {
      const key = `${cursor.getFullYear()}-${cursor.getMonth()}`;
      buckets.push({
        key,
        label: cursor.toLocaleDateString("en-GB", { month: "short" }),
        revenue: 0,
        orders: 0,
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }
    for (const o of paid) {
      const key = `${o.createdAt.getFullYear()}-${o.createdAt.getMonth()}`;
      const b = buckets.find((x) => x.key === key);
      if (b) {
        b.revenue += o.total;
        b.orders += 1;
      }
    }
  } else {
    const cursor = startOfDay(from);
    const end = startOfDay(to);
    while (cursor <= end) {
      const key = cursor.toISOString().slice(0, 10);
      buckets.push({
        key,
        label: cursor.toLocaleDateString("en-GB", {
          day: "numeric",
          month: spanMs > 14 * 86400000 ? "short" : undefined,
        }),
        revenue: 0,
        orders: 0,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    for (const o of paid) {
      const key = startOfDay(o.createdAt).toISOString().slice(0, 10);
      const b = buckets.find((x) => x.key === key);
      if (b) {
        b.revenue += o.total;
        b.orders += 1;
      }
    }
  }

  return buckets;
}
