import {expect,it} from 'vitest';
import {estateFraction,piePath,estatePieStart,orderProtectedSlices} from './estatePie';
import {buildDistributionBreakdown} from './distributionTreemap';
import {netEstateOf} from './runScenario';
import {graphRelationships} from './graphRelationships';
import {bundledCaseLibrary} from './bundledCaseLibrary';
it('anchors the primary half vertically on the left across the sample library',()=>{
 expect(estatePieStart()).toBe(Math.PI/2);
 for(const scenario of bundledCaseLibrary){
  const breakdown=buildDistributionBreakdown(scenario);
  const slices=orderProtectedSlices(breakdown.legitime,scenario.persons);
  if(!slices.length)continue;
  let amount=0;
  const half=netEstateOf(scenario)/2;
  for(const slice of slices){amount+=slice.amount;if(amount>=half-.01)break;}
  expect(amount,scenario.id).toBeCloseTo(half);
  expect(Math.cos(estatePieStart()+amount/netEstateOf(scenario)*2*Math.PI)).toBeCloseTo(0);
  expect(Math.cos(estatePieStart()+Math.PI/2)).toBeCloseTo(-1);
  expect(slices.reduce((n,s)=>n+s.amount,0)).toBe(breakdown.legitime.reduce((n,s)=>n+s.amount,0));
 }
});
it('computes fractions against the whole estate, including mixed shares',()=>{
 expect(estateFraction(3000000,18000000)).toBe('1/6');
 expect(estateFraction(2400000,64000000)).toBe('3/80');
 expect(estateFraction(0,64000000)).toBe('0/1');
 expect(estateFraction(64000000,64000000)).toBe('1/1');
 expect(estateFraction(1,0)).toBe('—');
 expect(piePath(0,Math.PI*2).match(/A /g)).toHaveLength(2);
});
it('recovers every declared substitute even without an explicit relationship',()=>{
 for(const original of bundledCaseLibrary){
  const s={...original,relationships:original.relationships.filter(r=>r.type!=='substitution')};
  const edges=graphRelationships(s);
  for(const d of s.dispositions??[])for(const id of d.substitutionIds??[])expect(edges.some(r=>r.type==='substitution'&&r.from===d.beneficiaryId&&r.to===id)).toBe(true);
  expect(graphRelationships({...s,relationships:edges})).toEqual(edges);
 }
});
