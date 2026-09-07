import { describe, expect, it } from "vitest";
import { dispositionValue, summarizeEstateInventory, valueProperty } from "./estateInventory";
import type { Scenario } from "../types/scenario";

const scenario: Scenario = {
  schemaVersion: 1,
  id: "structural-test",
  title: "Structural test",
  currency: "PHP",
  estate: {
    assets: 1_000_000,
    liabilities: 200_000,
    properties: [{
      id: "property-a",
      name: "Property A",
      propertyType: "real_property",
      ownershipClassification: "exclusive",
      grossValue: 1_000_000,
      encumbrances: [{ id: "enc-a", label: "Encumbrance", amount: 150_000 }],
    }],
    generalLiabilities: [{ id: "liability-a", label: "Liability", amount: 50_000 }],
  },
  persons: [{ id: "beneficiary-a", name: "Beneficiary A", role: "Beneficiary" }],
  relationships: [],
  dispositions: [{ id: "devise-a", kind: "devise", beneficiaryId: "beneficiary-a", source: "specific_property", propertyId: "property-a", fraction: 0.5 }],
  computations: [],
};

describe("estate inventory hooks", () => {
  it("derives a property's net value", () => expect(valueProperty(scenario.estate.properties![0]).netValue).toBe(850_000));
  it("reconciles property values with the declared estate", () => expect(summarizeEstateInventory(scenario).reconcilesWithDeclaredEstate).toBe(true));
  it("values a fractional specific-property disposition", () => expect(dispositionValue(scenario.dispositions![0], scenario)).toBe(425_000));
});

