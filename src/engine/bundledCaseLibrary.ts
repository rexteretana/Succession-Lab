import advancedCases from "../../public/cases/advanced-succession-mastery-15.jsonl?raw";
import example16 from "../../public/cases/example-16-mercado-two-marriages.jsonl?raw";
import examples17To20 from "../../public/cases/examples-17-20-concurring-secondary-heirs.jsonl?raw";
import type { Scenario } from "../types/scenario";
import { parseJsonl } from "./parseJsonl";

const sources = [advancedCases, example16, examples17To20];

export const bundledCaseLibrary: Scenario[] = Array.from(
  new Map(sources.flatMap(parseJsonl).map((scenario) => [scenario.id, scenario])).values(),
);

/** Refresh shipped examples; preserve separately identified imported cases. */
export function currentCaseLibrary(saved: Scenario[]): Scenario[] {
  const shipped = new Set(bundledCaseLibrary.map(s => s.id));
  return [...bundledCaseLibrary, ...saved.filter(s => !shipped.has(s.id))];
}
