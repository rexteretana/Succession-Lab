import type { TestamentaryCondition } from "../types/scenario";

export type ConditionAxes = {
  conduct: "positive" | "negative" | "unspecified";
  control: "potestative" | "casual" | "mixed" | "unspecified";
  effect: "suspensive" | "resolutory" | "unspecified";
};

/** Normalize the author-supplied classification labels for the Conditions view. */
export function classify_condition(condition: TestamentaryCondition): ConditionAxes {
  const labels = (condition.classification ?? []).map((label) => label.toLowerCase());
  const pick = (options: string[]) => options.find((option) => labels.some((label) => label.includes(option)));
  return {
    conduct: pick(["positive", "negative"]) as ConditionAxes["conduct"] ?? "unspecified",
    control: pick(["potestative", "casual", "mixed"]) as ConditionAxes["control"] ?? "unspecified",
    effect: pick(["suspensive", "resolutory"]) as ConditionAxes["effect"] ?? "unspecified",
  };
}
