import { describe, expect, it } from "vitest";
import { parseJsonl } from "./parseJsonl";

const base = {
  schemaVersion: 1,
  id: "schema-test",
  title: "Schema test",
  estate: { assets: 0, liabilities: 0, properties: [] },
  persons: [{ id: "person-a", name: "Person A", role: "Beneficiary" }],
  relationships: [],
  computations: [],
};

describe("JSONL cross-reference validation", () => {
  it("accepts a structurally valid scenario", () => {
    expect(parseJsonl(JSON.stringify(base))).toHaveLength(1);
  });

  it("preserves a user-supplied problem story", () => {
    const scenario = { ...base, story: { narrative: "A supplied classroom narrative.", deathDate: "2026-01-15", keyFacts: ["A supplied material fact."] } };
    expect(parseJsonl(JSON.stringify(scenario))[0].story?.narrative).toBe("A supplied classroom narrative.");
  });

  it("rejects a disposition that references a missing property", () => {
    const invalid = {
      ...base,
      dispositions: [{ id: "disposition-a", kind: "devise", beneficiaryId: "person-a", source: "specific_property", propertyId: "missing" }],
    };
    expect(() => parseJsonl(JSON.stringify(invalid))).toThrow("known property");
  });
});
