import { classify_condition } from './conditions';
import type { TestamentaryCondition } from '../types/scenario';

/** Categorical coordinates, not legal conclusions. Missing axes are not imputed. */
export function conditionCoordinate(condition: TestamentaryCondition): [number, number, number] | null {
  const a = classify_condition(condition);
  if (Object.values(a).includes('unspecified')) return null;
  return [a.conduct === 'positive' ? 1 : 0, a.control === 'casual' ? 1 : a.control === 'mixed' ? .5 : 0, a.effect === 'resolutory' ? 1 : 0];
}

export function groupConditionPoints(conditions: TestamentaryCondition[]) {
  const groups = new Map<string, { coordinate: [number, number, number]; indices: number[] }>();
  conditions.forEach((condition, index) => {
    const coordinate = conditionCoordinate(condition);
    if (!coordinate) return;
    const key = coordinate.join(',');
    const group = groups.get(key) ?? { coordinate, indices: [] };
    group.indices.push(index);
    groups.set(key, group);
  });
  return [...groups.values()];
}
