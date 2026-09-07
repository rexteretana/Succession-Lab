import { describe, expect, it } from "vitest";
import examples from "../../public/cases/examples-17-20-concurring-secondary-heirs.jsonl?raw";
import { buildDistributionBreakdown } from "./distributionTreemap";
import { summarizeEstateInventory } from "./estateInventory";
import { parseJsonl } from "./parseJsonl";
import { netEstateOf, runScenario } from "./runScenario";

const scenarios = parseJsonl(examples);

describe("concurring and secondary heir examples", () => {
  it("contains four complete and reconciling scenarios", () => {
    expect(scenarios.map((scenario) => scenario.title.slice(0, 2))).toEqual(["17", "18", "19", "20"]);
    scenarios.forEach((scenario) => {
      expect(summarizeEstateInventory(scenario).reconcilesWithDeclaredEstate).toBe(true);
      expect(scenario.expectedDistribution?.reduce((sum, item) => sum + item.amount, 0)).toBeCloseTo(netEstateOf(scenario), 5);
      expect(scenario.computationGuide?.length).toBeGreaterThanOrEqual(12);
      expect(runScenario(scenario)).toHaveLength(4);
      expect(scenario.conditions?.length).toBeGreaterThanOrEqual(4);
      expect(scenario.relationships.length).toBeGreaterThanOrEqual(9);
    });
  });

  it("plots the expected protected and disposable totals", () => {
    const totals = scenarios.map((scenario) => {
      const map = buildDistributionBreakdown(scenario);
      return [
        map.legitime.reduce((sum, item) => sum + item.amount, 0),
        map.disposable.reduce((sum, item) => sum + item.amount, 0),
      ];
    });
    expect(totals).toEqual([
      [18_000_000, 6_000_000],
      [35_000_000, 5_000_000],
      [48_000_000, 0],
      [31_500_000, 4_500_000],
    ]);
  });
});
