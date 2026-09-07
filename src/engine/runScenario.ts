import type { ComputationDirective, Scenario } from "../types/scenario";
import {
  calculate_formula,
  calculate_legitimate_child_legitime,
  calculate_reciprocal_substitution,
  calculate_representation,
  calculate_spouse_concurrence,
  type CalculationResult,
} from "./calculations";

export function netEstateOf(scenario: Scenario) {
  return scenario.estate.assets - scenario.estate.liabilities;
}

export function runDirective(directive: ComputationDirective, scenario: Scenario): CalculationResult {
  const netEstate = netEstateOf(scenario);
  switch (directive.module) {
    case "formula":
      return calculate_formula(directive.title, directive.total, directive.steps, directive.allocations);
    case "legitimate_child_legitime":
      return calculate_legitimate_child_legitime(directive.netEstate ?? netEstate, directive.legitimateChildLines, directive.collectiveFraction);
    case "spouse_concurrence":
      return calculate_spouse_concurrence(directive.netEstate ?? netEstate, directive.legitimateChildLines);
    case "representation":
      return calculate_representation(directive.branchShare, directive.representativeIds);
    case "reciprocal_substitution":
      return calculate_reciprocal_substitution(directive.vacantShare, directive.substitutes);
  }
}

export function runScenario(scenario: Scenario) {
  return scenario.computations.map((directive) => runDirective(directive, scenario));
}
