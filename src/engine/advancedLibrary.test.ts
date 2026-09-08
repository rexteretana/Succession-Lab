import { describe, expect, it } from "vitest";
import library from "../../public/cases/advanced-succession-mastery-15.jsonl?raw";
import { summarizeEstateInventory } from "./estateInventory";
import { parseJsonl } from "./parseJsonl";
import { netEstateOf, runScenario } from "./runScenario";

const scenarios = parseJsonl(library);

describe("advanced succession mastery library", () => {
  it("contains fifteen complete, reconciling cases", () => {
    expect(scenarios).toHaveLength(15);
    scenarios.forEach((scenario) => {
      expect(summarizeEstateInventory(scenario).reconcilesWithDeclaredEstate).toBe(true);
      expect(scenario.expectedDistribution?.reduce((sum, item) => sum + item.amount, 0)).toBeCloseTo(netEstateOf(scenario), 5);
      expect(scenario.computationGuide!.length).toBeGreaterThanOrEqual(10);
      expect(runScenario(scenario)).toHaveLength(4);
      expect(scenario.conditions?.length).toBeGreaterThanOrEqual(3);
      expect(scenario.relationships.length).toBeGreaterThanOrEqual(7);
      expect(scenario.dispositions?.length).toBeGreaterThanOrEqual(3);
    });
  });

  it("covers every supported substitution label and all condition axes", () => {
    const labels = new Set<string>(scenarios.flatMap((scenario) => scenario.conditions?.map((condition) => condition.substitutionType).filter((label): label is NonNullable<typeof label> => Boolean(label)) ?? []));
    ["simple", "brief", "compendious", "reciprocal", "fideicommissary"].forEach((label) => expect(labels.has(label)).toBe(true));
    const classifications = new Set(scenarios.flatMap((scenario) => scenario.conditions?.flatMap((condition) => condition.classification ?? []) ?? []));
    ["positive", "negative", "potestative", "casual", "mixed", "suspensive", "resolutory"].forEach((axis) => expect(classifications.has(axis)).toBe(true));
  });
});
