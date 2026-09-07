import source from '../../public/cases/example-16-mercado-two-marriages.jsonl?raw';
import { describe, expect, it } from 'vitest';
import { parseJsonl } from './parseJsonl';
import { calculate_spouse_concurrence } from './calculations';
import { runScenario } from './runScenario';
import { resolvePersonReferences } from './presentation';
import { conditionCoordinate } from './conditionPlot';
const [s] = parseJsonl(source);
describe('Example 16 two successive marriages', () => {
  it('has three children in the first marriage and five in the second', () => {
    expect(s.relationships.filter(r=>r.type==='parent' && r.from==='m1')).toHaveLength(3);
    expect(s.relationships.filter(r=>r.type==='parent' && r.from==='m2')).toHaveLength(5);
    expect(s.relationships.filter(r=>r.type==='parent' && r.from==='t')).toHaveLength(8);
  });
  it('reconciles inventory and actual baseline distributions', () => {
    expect(s.estate.properties!.reduce((a,p)=>a+p.grossValue,0)).toBe(68000000);
    const debts = s.estate.properties!.flatMap(p=>p.encumbrances??[]).reduce((a,e)=>a+e.amount,0)+s.estate.generalLiabilities!.reduce((a,e)=>a+e.amount,0);
    expect(debts).toBe(4000000);
    expect(s.expectedDistribution!.reduce((a,d)=>a+d.amount,0)).toBe(64000000);
    expect(calculate_spouse_concurrence(64000000,8).allocations?.freeAfterLegitimes).toBe(28000000);
  });
  it('does not double count predeceased people or the future second heir', () => {
    for(const id of ['m1','a','p','f2']) expect(s.expectedDistribution!.some(d=>d.personId===id)).toBe(false);
    expect(s.computationGuide!.length).toBe(22);
  });
  it('renders computation labels without replacing letters inside words', () => {
    const representation = runScenario(s).find(result => result.module === 'representation')!;
    const reciprocal = runScenario(s).find(result => result.module === 'reciprocal_substitution')!;

    expect(resolvePersonReferences(representation.steps[0].label, s.persons)).toBe('Share per representative');
    expect(resolvePersonReferences(reciprocal.steps[0].label, s.persons)).toBe('Allocation to Xenia Tan');
    expect(resolvePersonReferences(reciprocal.steps[1].label, s.persons)).toBe('Allocation to Yasmin Tan');
  });
  it('plots only the five clauses with complete condition classifications', () => {
    const plotted = s.conditions!.map((condition, index) => conditionCoordinate(condition) ? index + 1 : null).filter(Boolean);
    expect(plotted).toEqual([1, 3, 6, 7, 8]);
  });
});
