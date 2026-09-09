import { describe, expect, it } from 'vitest';
import { bundledCaseLibrary, currentCaseLibrary } from './bundledCaseLibrary';

describe('cross-view case integrity', () => {
  it('links every clause and labels every actual substitution', () => {
    for (const s of bundledCaseLibrary) {
      for (const c of s.conditions ?? []) expect(s.dispositions?.some(d => d.conditionId === c.id || d.conditionIds?.includes(c.id)), `${s.title}: ${c.id}`).toBe(true);
      for (const r of s.relationships.filter(r=>r.type==='substitution')) {
        expect(r.substitutionType, `${s.id}: ${r.from} → ${r.to}`).toBeTruthy();
        expect(s.dispositions?.some(d=>d.id===r.dispositionId)).toBe(true);
      }
      for (const d of s.dispositions ?? []) {
        const p=s.estate.properties?.find(p=>p.id===d.propertyId);
        if(p && d.kind!=='institution') expect(d.kind).toBe(p.propertyType==='real_property'?'devise':'legacy');
      }
    }
  });
  it('accounts for actual substitute outcomes, not hypothetical extra gifts', () => {
    const share=(n:number,id:string)=>bundledCaseLibrary[n-1].expectedDistribution?.find(a=>a.personId.endsWith(id))?.amount??0;
    expect(share(1,'outside_1')).toBe(0);
    expect(share(1,'outside_4')).toBe(3_000_000);
    expect(share(2,'outside_4')).toBe(2_400_000);
    expect(share(3,'outside_3')).toBe(4_050_000);
    expect(share(4,'outside_2')).toBe(6_000_000);
    expect(share(4,'outside_3')).toBe(4_000_000);
    expect(share(13,'outside_1')).toBe(0);
    expect(share(13,'child_2')).toBe(15_000_000);
    expect(share(19,'helena')).toBe(0);
  });
  it('refreshes old built-ins while retaining separately identified custom cases', () => {
    const old={...bundledCaseLibrary[0],title:'Stale title'};
    const custom={...old,id:'custom-case'};
    const merged=currentCaseLibrary([old,custom]);
    expect(merged).toHaveLength(26);
    expect(merged[0].title).not.toBe('Stale title');
    expect(merged.at(-1)).toEqual(custom);
  });
});
