import type { Scenario } from "../types/scenario";

function validateScenario(value: unknown, line: number): Scenario {
  if (!value || typeof value !== "object") throw new Error(`Line ${line}: expected a JSON object.`);
  const item = value as Partial<Scenario>;
  if (item.schemaVersion !== 1) throw new Error(`Line ${line}: unsupported schemaVersion.`);
  if (!item.id || !item.title) throw new Error(`Line ${line}: id and title are required.`);
  if (!item.estate || !Number.isFinite(item.estate.assets) || !Number.isFinite(item.estate.liabilities)) {
    throw new Error(`Line ${line}: estate.assets and estate.liabilities must be numbers.`);
  }
  if (!Array.isArray(item.persons) || !Array.isArray(item.relationships) || !Array.isArray(item.computations)) {
    throw new Error(`Line ${line}: persons, relationships, and computations must be arrays.`);
  }
  if (item.story) {
    if (typeof item.story !== "object" || (item.story.keyFacts && !Array.isArray(item.story.keyFacts))) {
      throw new Error(`Line ${line}: story must be an object and story.keyFacts must be an array.`);
    }
    const storyText = [item.story.narrative, item.story.deathDate, item.story.deathPlace, item.story.willDate, item.story.circumstances];
    if (storyText.some((value) => value != null && typeof value !== "string") || item.story.keyFacts?.some((fact) => typeof fact !== "string")) {
      throw new Error(`Line ${line}: story fields must contain text.`);
    }
  }
  if (item.caseDetails) {
    if (typeof item.caseDetails !== "object") throw new Error(`Line ${line}: caseDetails must be an object.`);
    const lists = [item.caseDetails.proceduralHistory, item.caseDetails.issues, item.caseDetails.rulings, item.caseDetails.doctrines, item.caseDetails.provisions, item.caseDetails.recordLimitations, item.caseDetails.citationCorrections];
    if (lists.some((list) => list != null && (!Array.isArray(list) || list.some((entry) => typeof entry !== "string")))) {
      throw new Error(`Line ${line}: caseDetails list fields must contain text.`);
    }
  }
  const personIds = new Set(item.persons.map((person) => person.id));
  if (personIds.size !== item.persons.length || item.persons.some((person) => !person.id)) {
    throw new Error(`Line ${line}: every person must have a unique id.`);
  }
  item.relationships.forEach((relationship) => {
    if (!personIds.has(relationship.from) || !personIds.has(relationship.to)) {
      throw new Error(`Line ${line}: relationship references an unknown person.`);
    }
  });
  const properties = item.estate.properties ?? [];
  const propertyIds = new Set(properties.map((property) => property.id));
  if (propertyIds.size !== properties.length) throw new Error(`Line ${line}: every property must have a unique id.`);
  properties.forEach((property) => {
    if (!property.id || !property.name || !Number.isFinite(property.grossValue) || property.grossValue < 0) {
      throw new Error(`Line ${line}: each property requires id, name, and a non-negative grossValue.`);
    }
    property.encumbrances?.forEach((encumbrance) => {
      if (!encumbrance.id || !Number.isFinite(encumbrance.amount) || encumbrance.amount < 0) {
        throw new Error(`Line ${line}: property encumbrances require an id and non-negative amount.`);
      }
    });
  });
  const conditions = item.conditions ?? [];
  const conditionIds = new Set(conditions.map((condition) => condition.id));
  if (conditionIds.size !== conditions.length || conditions.some((condition) => !condition.id || !condition.text)) {
    throw new Error(`Line ${line}: each condition requires a unique id and text.`);
  }
  const substitutionTypes = new Set(["simple", "compendious", "compedious", "reciprocal", "brief", "fideicommissary", "feidicommissary", "none"]);
  conditions.forEach((condition) => {
    if (condition.substitutionType && !substitutionTypes.has(condition.substitutionType)) {
      throw new Error(`Line ${line}: unsupported substitutionType.`);
    }
  });
  const dispositions = item.dispositions ?? [];
  const dispositionIds = new Set(dispositions.map((disposition) => disposition.id));
  if (dispositionIds.size !== dispositions.length) throw new Error(`Line ${line}: every disposition must have a unique id.`);
  dispositions.forEach((disposition) => {
    if (!disposition.id || !personIds.has(disposition.beneficiaryId)) {
      throw new Error(`Line ${line}: each disposition must reference a known beneficiary.`);
    }
    if (disposition.source === "specific_property" && (!disposition.propertyId || !propertyIds.has(disposition.propertyId))) {
      throw new Error(`Line ${line}: a specific-property disposition must reference a known property.`);
    }
    if (disposition.conditionId && !conditionIds.has(disposition.conditionId)) {
      throw new Error(`Line ${line}: disposition references an unknown condition.`);
    }
    disposition.substitutionIds?.forEach((id) => {
      if (!personIds.has(id)) throw new Error(`Line ${line}: disposition references an unknown substitute.`);
    });
  });
  item.expectedDistribution?.forEach((allocation) => {
    if (!personIds.has(allocation.personId)) throw new Error(`Line ${line}: expected distribution references an unknown person.`);
    if (!Number.isFinite(allocation.amount) || allocation.amount < 0) throw new Error(`Line ${line}: expected distribution amounts must be non-negative numbers.`);
    allocation.propertyIds?.forEach((id) => {
      if (!propertyIds.has(id)) throw new Error(`Line ${line}: expected distribution references an unknown property.`);
    });
  });
  item.computationGuide?.forEach((step) => {
    if (!step || typeof step.title !== "string" || !step.title || typeof step.explanation !== "string" || !step.explanation) {
      throw new Error(`Line ${line}: every computation guide step requires a title and explanation.`);
    }
    if (step.expression != null && typeof step.expression !== "string") {
      throw new Error(`Line ${line}: computation guide expressions must contain text.`);
    }
    if (step.result != null && (!Number.isFinite(step.result) || step.result < 0)) {
      throw new Error(`Line ${line}: computation guide results must be non-negative numbers.`);
    }
  });
  return item as Scenario;
}

export function parseJsonl(source: string): Scenario[] {
  const lines = source.split(/\r?\n/);
  const scenarios: Scenario[] = [];
  lines.forEach((raw, index) => {
    const text = raw.trim();
    if (!text) return;
    try {
      scenarios.push(validateScenario(JSON.parse(text), index + 1));
    } catch (error) {
      if (error instanceof SyntaxError) throw new Error(`Line ${index + 1}: invalid JSON.`);
      throw error;
    }
  });
  if (!scenarios.length) throw new Error("No scenario objects were found.");
  return scenarios;
}
