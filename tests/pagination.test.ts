import { describe, it, expect } from "vitest";

// The dashboard slices ranked jobs by page. Verify the pagination math.
function paginate<T>(items: T[], page: number, perPage: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  const safe = Math.min(Math.max(1, page), totalPages);
  const start = (safe - 1) * perPage;
  return { slice: items.slice(start, start + perPage), totalPages, page: safe };
}

describe("paginate", () => {
  const items = Array.from({ length: 100 }, (_, i) => i + 1);
  it("yields 10 pages of 10", () => {
    expect(paginate(items, 1, 10).totalPages).toBe(10);
    expect(paginate(items, 1, 10).slice).toEqual(items.slice(0, 10));
    expect(paginate(items, 10, 10).slice).toEqual(items.slice(90, 100));
  });
  it("clamps out-of-range pages", () => {
    expect(paginate(items, 0, 10).page).toBe(1);
    expect(paginate(items, 99, 10).page).toBe(10);
  });
});