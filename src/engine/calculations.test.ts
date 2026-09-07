import { describe, expect, it } from "vitest";
import {
  calculate_formula,
  calculate_legitimate_child_legitime,
  calculate_reciprocal_substitution,
  calculate_representation,
  calculate_spouse_concurrence,
} from "./calculations";

describe("succession calculation modules", () => {
  it("calculates collective and per-line child legitime", () => {
    expect(calculate_legitimate_child_legitime(12_000_000, 3).allocations?.perLine).toBe(2_000_000);
  });

  it("calculates spouse concurrence with one legitimate child", () => {
    expect(calculate_spouse_concurrence(8_000_000, 1).allocations).toEqual({
      spouse: 2_000_000,
      childrenCollective: 4_000_000,
      freeAfterLegitimes: 2_000_000,
    });
  });

  it("divides representation per stirpes within the branch", () => {
    expect(calculate_representation(3_000_000, ["x", "y"]).allocations).toEqual({ x: 1_500_000, y: 1_500_000 });
  });

  it("uses substitute weights proportionally", () => {
    expect(calculate_reciprocal_substitution(60_000, [
      { personId: "b", weight: 40_000 },
      { personId: "c", weight: 20_000 },
    ]).allocations).toEqual({ b: 40_000, c: 20_000 });
  });

  it("renders supplied legal formulas without changing their values", () => {
    expect(calculate_formula("Ascendant legitime", 12_000_000, [
      { label: "Collective half", expression: "24000000 × 0.5", value: 12_000_000 },
    ])).toMatchObject({ title: "Ascendant legitime", total: 12_000_000 });
  });
});
