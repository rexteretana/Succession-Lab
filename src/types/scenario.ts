export type PersonStatus = "living" | "deceased" | "predeceased";

export interface Person {
  id: string;
  name: string;
  role: string;
  status?: PersonStatus;
  note?: string;
  generation?: number;
}

export interface Relationship {
  from: string;
  to: string;
  type: "spouse" | "parent" | "representation" | "substitution";
  substitutionType?: TestamentaryCondition["substitutionType"];
  dispositionId?: string;
}

export type PropertyType =
  | "real_property"
  | "cash"
  | "vehicle"
  | "securities"
  | "business_interest"
  | "jewelry"
  | "intellectual_property"
  | "receivable"
  | "other_personal_property";

export type OwnershipClassification = "exclusive" | "conjugal" | "community" | "co_owned" | "disputed";

export interface PropertyEncumbrance {
  id: string;
  label: string;
  amount: number;
}

export interface EstateProperty {
  id: string;
  name: string;
  propertyType: PropertyType;
  ownershipClassification: OwnershipClassification;
  grossValue: number;
  encumbrances?: PropertyEncumbrance[];
  valuationDate?: string;
  description?: string;
}

export interface GeneralLiability {
  id: string;
  label: string;
  amount: number;
}

export type DispositionKind = "devise" | "legacy" | "institution";
export type DispositionSource = "specific_property" | "general_estate";

export interface TestamentaryDisposition {
  id: string;
  kind: DispositionKind;
  beneficiaryId: string;
  source: DispositionSource;
  propertyId?: string;
  amount?: number;
  fraction?: number;
  conditionId?: string;
  conditionIds?: string[];
  substitutionType?: TestamentaryCondition["substitutionType"];
  substitutionIds?: string[];
  description?: string;
}

export interface TestamentaryCondition {
  id: string;
  text: string;
  classification?: string[];
  /** Optional learning metadata used by the Conditions visualizer. */
  substitutionType?: "simple" | "compendious" | "compedious" | "reciprocal" | "brief" | "fideicommissary" | "feidicommissary" | "none";
  substitutionNote?: string;
}

export type ComputationDirective =
  | { module: "legitimate_child_legitime"; netEstate?: number; legitimateChildLines: number; collectiveFraction?: number }
  | { module: "spouse_concurrence"; netEstate?: number; legitimateChildLines: number }
  | { module: "representation"; branchShare: number; representativeIds: string[] }
  | { module: "reciprocal_substitution"; vacantShare: number; substitutes: Array<{ personId: string; weight: number }> }
  | { module: "formula"; title: string; total: number; steps: Array<{ label: string; expression: string; value: number }>; allocations?: Record<string, number> };

export interface ScenarioSource {
  type: string;
  title?: string;
  grNo?: string;
  date?: string;
  treatment?: "exact" | "case-inspired";
  url?: string;
}

export interface ScenarioStory {
  narrative?: string;
  deathDate?: string;
  deathPlace?: string;
  willDate?: string;
  circumstances?: string;
  keyFacts?: string[];
}

export interface ScenarioCaseDetails {
  officialTitle?: string;
  docketNumber?: string;
  decisionDate?: string;
  reporterCitation?: string;
  court?: string;
  division?: string;
  ponente?: string;
  nature?: string;
  proceduralHistory?: string[];
  issues?: string[];
  rulings?: string[];
  doctrines?: string[];
  provisions?: string[];
  recordLimitations?: string[];
  citationCorrections?: string[];
}

export interface ExpectedDistribution {
  personId: string;
  amount: number;
  mechanisms: Array<"legitime" | "free_portion" | "devise" | "legacy" | "representation" | "substitution">;
  propertyIds?: string[];
  rationale?: string;
}

export interface ComputationGuideStep {
  title: string;
  explanation: string;
  expression?: string;
  result?: number;
  resultUnit?: "ratio" | "count";
}

export interface Scenario {
  schemaVersion: 1;
  id: string;
  title: string;
  difficulty?: number;
  scenarioType?: "fictional" | "jurisprudence";
  currency?: string;
  estate: {
    assets: number;
    liabilities: number;
    properties?: EstateProperty[];
    generalLiabilities?: GeneralLiability[];
  };
  persons: Person[];
  relationships: Relationship[];
  dispositions?: TestamentaryDisposition[];
  conditions?: TestamentaryCondition[];
  computations: ComputationDirective[];
  story?: ScenarioStory;
  caseDetails?: ScenarioCaseDetails;
  explanation?: string;
  source?: ScenarioSource;
  expectedDistribution?: ExpectedDistribution[];
  computationGuide?: ComputationGuideStep[];
}
