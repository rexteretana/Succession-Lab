import { describe, expect, it } from "vitest";
import example16Source from "../../public/cases/example-16-mercado-two-marriages.jsonl?raw";
import { buildDistributionBreakdown, layoutTreemap } from "./distributionTreemap";
import { parseJsonl } from "./parseJsonl";

describe("layoutTreemap", () => {
  it("uses the full canvas and preserves proportional area", () => {
    const values = [{ value: 6 }, { value: 3 }, { value: 1 }];
    const rectangles = layoutTreemap(values, (item) => item.value);
    const area = rectangles.reduce((sum, rectangle) => sum + rectangle.width * rectangle.height, 0);
    expect(area).toBeCloseTo(10_000, 6);
    rectangles.forEach((rectangle) => {
      expect((rectangle.width * rectangle.height) / 10_000).toBeCloseTo(rectangle.item.value / 10, 6);
      expect(rectangle.x).toBeGreaterThanOrEqual(0);
      expect(rectangle.y).toBeGreaterThanOrEqual(0);
      expect(rectangle.x + rectangle.width).toBeLessThanOrEqual(100.000001);
      expect(rectangle.y + rectangle.height).toBeLessThanOrEqual(100.000001);
    });
  });

  it("separates mixed awards into protected and disposable shares", () => {
    const [scenario] = parseJsonl(example16Source);
    const breakdown = buildDistributionBreakdown(scenario);
    expect(breakdown.legitime.reduce((sum, slice) => sum + slice.amount, 0)).toBe(36_000_000);
    expect(breakdown.disposable.reduce((sum, slice) => sum + slice.amount, 0)).toBe(28_000_000);
    expect(breakdown.legitime.find((slice) => slice.personName === "Bruno Mercado")?.amount).toBe(4_000_000);
    expect(breakdown.disposable.find((slice) => slice.personName === "Bruno Mercado")?.amount).toBe(2_000_000);
  });
});
