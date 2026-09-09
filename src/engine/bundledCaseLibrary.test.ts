import { describe, expect, it } from "vitest";
import { bundledCaseLibrary } from "./bundledCaseLibrary";

describe("bundled case library", () => {
  it("ships all twenty learning cases in the client build", () => {
    expect(bundledCaseLibrary).toHaveLength(25);
    expect(new Set(bundledCaseLibrary.map((scenario) => scenario.id)).size).toBe(25);
    expect(bundledCaseLibrary[0]?.title).toMatch(/^01 /);
    expect(bundledCaseLibrary.at(-1)?.title).toMatch(/^25 /);
  });
});
