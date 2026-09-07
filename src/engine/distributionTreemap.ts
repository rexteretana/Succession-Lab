import { runScenario } from "./runScenario";
import type { ExpectedDistribution, Scenario } from "../types/scenario";

export type DistributionSide = "legitime" | "disposable";

export interface DistributionSlice {
  id: string;
  personId: string;
  personName: string;
  amount: number;
  side: DistributionSide;
  mechanisms: ExpectedDistribution["mechanisms"];
}

export interface TreemapRect<T> {
  item: T;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DistributionBreakdown {
  legitime: DistributionSlice[];
  disposable: DistributionSlice[];
  total: number;
}

function protectedAmountFor(
  allocation: ExpectedDistribution,
  scenario: Scenario,
  perLine: number,
  spouseShare: number,
  representedShares: Record<string, number>,
) {
  if (!allocation.mechanisms.includes("legitime")) return 0;
  if (allocation.mechanisms.includes("representation")) {
    return Math.min(allocation.amount, representedShares[allocation.personId] ?? allocation.amount);
  }

  const person = scenario.persons.find((candidate) => candidate.id === allocation.personId);
  const isSurvivingSpouse = /surviving spouse/i.test(person?.role ?? "");
  return Math.min(allocation.amount, isSurvivingSpouse ? spouseShare || allocation.amount : perLine || allocation.amount);
}

/** Splits mixed awards so the chart never treats a testamentary excess as part of the legitime. */
export function buildDistributionBreakdown(scenario: Scenario): DistributionBreakdown {
  const results = runScenario(scenario);
  const perLine = results.find((result) => result.module === "legitimate_child_legitime")?.allocations?.perLine ?? 0;
  const spouseShare = results.find((result) => result.module === "spouse_concurrence")?.allocations?.spouse ?? 0;
  const representedShares = results
    .filter((result) => result.module === "representation")
    .reduce<Record<string, number>>((all, result) => ({ ...all, ...result.allocations }), {});

  const legitime: DistributionSlice[] = [];
  const disposable: DistributionSlice[] = [];
  for (const allocation of scenario.expectedDistribution ?? []) {
    const personName = scenario.persons.find((person) => person.id === allocation.personId)?.name ?? allocation.personId;
    const protectedAmount = protectedAmountFor(allocation, scenario, perLine, spouseShare, representedShares);
    const disposableAmount = Math.max(0, allocation.amount - protectedAmount);
    if (protectedAmount > 0) {
      legitime.push({ id: `${allocation.personId}-legitime`, personId: allocation.personId, personName, amount: protectedAmount, side: "legitime", mechanisms: allocation.mechanisms });
    }
    if (disposableAmount > 0) {
      disposable.push({ id: `${allocation.personId}-disposable`, personId: allocation.personId, personName, amount: disposableAmount, side: "disposable", mechanisms: allocation.mechanisms });
    }
  }

  return {
    legitime,
    disposable,
    total: [...legitime, ...disposable].reduce((sum, slice) => sum + slice.amount, 0),
  };
}

/** A stable binary treemap. Values determine area; ordering is deterministic. */
export function layoutTreemap<T>(items: T[], valueOf: (item: T) => number): TreemapRect<T>[] {
  const sorted = items.filter((item) => valueOf(item) > 0).sort((a, b) => valueOf(b) - valueOf(a));
  const layout = (group: T[], x: number, y: number, width: number, height: number): TreemapRect<T>[] => {
    if (group.length === 0) return [];
    if (group.length === 1) return [{ item: group[0], x, y, width, height }];

    const total = group.reduce((sum, item) => sum + valueOf(item), 0);
    let running = 0;
    let splitAt = 1;
    let smallestDifference = Number.POSITIVE_INFINITY;
    for (let index = 1; index < group.length; index += 1) {
      running += valueOf(group[index - 1]);
      const difference = Math.abs(total / 2 - running);
      if (difference < smallestDifference) {
        smallestDifference = difference;
        splitAt = index;
      }
    }

    const first = group.slice(0, splitAt);
    const second = group.slice(splitAt);
    const firstTotal = first.reduce((sum, item) => sum + valueOf(item), 0);
    const ratio = firstTotal / total;
    if (width >= height) {
      const firstWidth = width * ratio;
      return [...layout(first, x, y, firstWidth, height), ...layout(second, x + firstWidth, y, width - firstWidth, height)];
    }
    const firstHeight = height * ratio;
    return [...layout(first, x, y, width, firstHeight), ...layout(second, x, y + firstHeight, width, height - firstHeight)];
  };

  return layout(sorted, 0, 0, 100, 100);
}
