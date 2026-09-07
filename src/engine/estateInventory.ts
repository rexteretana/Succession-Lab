import type { EstateProperty, Scenario, TestamentaryDisposition } from "../types/scenario";

export interface PropertyValuation {
  propertyId: string;
  grossValue: number;
  encumbrances: number;
  netValue: number;
}

export interface EstateInventorySummary {
  properties: PropertyValuation[];
  propertyGrossValue: number;
  propertyEncumbrances: number;
  generalLiabilities: number;
  inventoryNetValue: number;
  declaredNetEstate: number;
  reconcilesWithDeclaredEstate: boolean;
}

export function valueProperty(property: EstateProperty): PropertyValuation {
  const encumbrances = (property.encumbrances ?? []).reduce((sum, item) => sum + item.amount, 0);
  return {
    propertyId: property.id,
    grossValue: property.grossValue,
    encumbrances,
    netValue: property.grossValue - encumbrances,
  };
}

export function summarizeEstateInventory(scenario: Scenario): EstateInventorySummary {
  const properties = (scenario.estate.properties ?? []).map(valueProperty);
  const propertyGrossValue = properties.reduce((sum, item) => sum + item.grossValue, 0);
  const propertyEncumbrances = properties.reduce((sum, item) => sum + item.encumbrances, 0);
  const generalLiabilities = (scenario.estate.generalLiabilities ?? []).reduce((sum, item) => sum + item.amount, 0);
  const inventoryNetValue = propertyGrossValue - propertyEncumbrances - generalLiabilities;
  const declaredNetEstate = scenario.estate.assets - scenario.estate.liabilities;
  return {
    properties,
    propertyGrossValue,
    propertyEncumbrances,
    generalLiabilities,
    inventoryNetValue,
    declaredNetEstate,
    reconcilesWithDeclaredEstate: properties.length === 0 || Math.abs(inventoryNetValue - declaredNetEstate) < 0.01,
  };
}

export function dispositionValue(disposition: TestamentaryDisposition, scenario: Scenario): number | undefined {
  if (typeof disposition.amount === "number") return disposition.amount;
  if (!disposition.propertyId) return undefined;
  const property = scenario.estate.properties?.find((item) => item.id === disposition.propertyId);
  if (!property) return undefined;
  const netValue = valueProperty(property).netValue;
  return typeof disposition.fraction === "number" ? netValue * disposition.fraction : netValue;
}

