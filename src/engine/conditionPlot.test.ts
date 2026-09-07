import { describe, expect, it } from 'vitest';
import { conditionCoordinate, groupConditionPoints } from './conditionPlot';
const c = (classification: string[]) => ({id:'test',text:'Test fixture',classification});
describe('condition plot', () => {
  it('maps all twelve complete combinations to distinct positions', () => {
    const points = ['positive','negative'].flatMap(x => ['potestative','mixed','casual'].flatMap(y => ['suspensive','resolutory'].map(z => conditionCoordinate(c([x,y,z]))?.join(','))));
    expect(new Set(points).size).toBe(12);
  });
  it('does not guess missing coordinates', () => expect(conditionCoordinate(c(['positive']))).toBeNull());
  it('groups identical coordinates without hiding members', () => {
    expect(groupConditionPoints([c(['positive','mixed','resolutory']),c(['positive','mixed','resolutory'])])[0].indices).toEqual([0,1]);
  });
  it('uses classification instead of substitution type', () => {
    expect(conditionCoordinate({...c(['negative','casual','suspensive']),substitutionType:'brief'})).toEqual([0,1,0]);
  });
});
