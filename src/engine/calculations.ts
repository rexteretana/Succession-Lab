export interface CalculationStep {
  label: string;
  expression: string;
  value: number;
}

export interface CalculationResult {
  module: string;
  title?: string;
  total: number;
  allocations?: Record<string, number>;
  steps: CalculationStep[];
}

export function calculate_formula(
  title: string,
  total: number,
  steps: CalculationStep[],
  allocations?: Record<string, number>,
): CalculationResult {
  assertPositive(total, "Formula total");
  if (!title.trim() || !steps.length) throw new Error("A formula calculation requires a title and at least one step.");
  steps.forEach((step) => assertPositive(step.value, step.label));
  return { module: "formula", title, total, steps, allocations };
}

const assertPositive = (value: number, label: string) => {
  if (!Number.isFinite(value) || value < 0) throw new Error(`${label} must be a non-negative number.`);
};

const assertCount = (value: number, label: string) => {
  if (!Number.isInteger(value) || value < 1) throw new Error(`${label} must be a positive integer.`);
};

export function calculate_legitimate_child_legitime(
  netEstate: number,
  legitimateChildLines: number,
  collectiveFraction = 0.5,
): CalculationResult {
  assertPositive(netEstate, "Net estate");
  assertCount(legitimateChildLines, "Legitimate child lines");
  if (collectiveFraction <= 0 || collectiveFraction > 1) throw new Error("Collective fraction must be greater than 0 and at most 1.");
  const collective = netEstate * collectiveFraction;
  const perLine = collective / legitimateChildLines;
  return {
    module: "legitimate_child_legitime",
    total: collective,
    allocations: { perLine },
    steps: [
      { label: "Collective legitime", expression: `${netEstate} × ${collectiveFraction}`, value: collective },
      { label: "Legitime per line", expression: `${collective} ÷ ${legitimateChildLines}`, value: perLine },
    ],
  };
}

export function calculate_spouse_concurrence(netEstate: number, legitimateChildLines: number): CalculationResult {
  assertPositive(netEstate, "Net estate");
  assertCount(legitimateChildLines, "Legitimate child lines");
  const children = calculate_legitimate_child_legitime(netEstate, legitimateChildLines);
  const spouse = legitimateChildLines === 1 ? netEstate * 0.25 : children.allocations!.perLine;
  const freeAfterLegitimes = netEstate - children.total - spouse;
  return {
    module: "spouse_concurrence",
    total: spouse,
    allocations: { spouse, childrenCollective: children.total, freeAfterLegitimes },
    steps: [
      { label: "Children's collective legitime", expression: `${netEstate} × 0.5`, value: children.total },
      {
        label: "Surviving spouse's legitime",
        expression: legitimateChildLines === 1 ? `${netEstate} × 0.25` : `${children.total} ÷ ${legitimateChildLines}`,
        value: spouse,
      },
      { label: "Remaining free portion", expression: `${netEstate} - ${children.total} - ${spouse}`, value: freeAfterLegitimes },
    ],
  };
}

export function calculate_representation(branchShare: number, representativeIds: string[]): CalculationResult {
  assertPositive(branchShare, "Branch share");
  assertCount(representativeIds.length, "Representatives");
  const perRepresentative = branchShare / representativeIds.length;
  return {
    module: "representation",
    total: branchShare,
    allocations: Object.fromEntries(representativeIds.map((id) => [id, perRepresentative])),
    steps: [{ label: "Share per representative", expression: `${branchShare} ÷ ${representativeIds.length}`, value: perRepresentative }],
  };
}

export function calculate_reciprocal_substitution(
  vacantShare: number,
  substitutes: Array<{ personId: string; weight: number }>,
): CalculationResult {
  assertPositive(vacantShare, "Vacant share");
  assertCount(substitutes.length, "Substitutes");
  substitutes.forEach(({ weight }) => {
    if (!Number.isFinite(weight) || weight <= 0) throw new Error("Substitute weights must be positive numbers.");
  });
  const totalWeight = substitutes.reduce((sum, item) => sum + item.weight, 0);
  const allocations = Object.fromEntries(
    substitutes.map(({ personId, weight }) => [personId, vacantShare * (weight / totalWeight)]),
  );
  return {
    module: "reciprocal_substitution",
    total: vacantShare,
    allocations,
    steps: substitutes.map(({ personId, weight }) => ({
      label: `Allocation to ${personId}`,
      expression: `${vacantShare} × (${weight} ÷ ${totalWeight})`,
      value: allocations[personId],
    })),
  };
}
