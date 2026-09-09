import {expect,it} from 'vitest';
import {bundledCaseLibrary} from './bundledCaseLibrary';
import {buildDistributionBreakdown} from './distributionTreemap';
import {summarizeEstateInventory} from './estateInventory';
import {netEstateOf,runScenario} from './runScenario';
import {parseJsonl} from './parseJsonl';

const cases=bundledCaseLibrary.slice(19);
it('reconciles all six ascendant ledgers, arithmetic and chart components',()=>{
 expect(cases).toHaveLength(6);
 for(const s of cases){
  const net=netEstateOf(s),rows=s.expectedDistribution!;
  expect(rows.length).toBe(s.persons.length-1);
  expect(rows.reduce((n,a)=>n+a.amount,0),s.title).toBe(net);
  expect(summarizeEstateInventory(s).reconcilesWithDeclaredEstate).toBe(true);
  const final=runScenario(s).at(-1)!;
  for(const a of rows)expect(final.allocations?.[a.personId]).toBe(a.amount);
  const pie=buildDistributionBreakdown(s);
  expect(pie.total).toBe(net);
  for(const a of rows){
   expect(pie.legitime.find(x=>x.personId===a.personId)?.amount??0).toBe(a.protectedAmount);
   expect(pie.disposable.find(x=>x.personId===a.personId)?.amount??0).toBe(a.amount-a.protectedAmount!);
  }
  for(const step of s.computationGuide??[]){
   if(step.expression && /^[\d\s+*/().-]+$/.test(step.expression)){
    expect(Function(`return (${step.expression})`)(),`${s.title}: ${step.title}`).toBeCloseTo(step.result!,6);
   }
  }
  expect(s.relationships.some(r=>r.type==='representation')).toBe(false);
  expect(s.computations.some(c=>c.module==='representation')).toBe(false);
  for(const edge of s.relationships.filter(r=>r.type==='parent')){
   const from=s.persons.find(p=>p.id===edge.from)!,to=s.persons.find(p=>p.id===edge.to)!;
   expect(from.generation!+1,`${from.name} parent of ${to.name}`).toBe(to.generation);
  }
  for(const a of rows.filter(a=>a.amount>0)){
   const person=s.persons.find(p=>p.id===a.personId)!;
   expect(person.status).toBe('living');
   expect(person.generation).toBeLessThan(0);
  }
  expect(s.conditions!.length).toBeGreaterThan(0);
 }
});
it('matches independent statutory share expectations and actual substitution outcomes',()=>{
 const awards=cases.map(s=>s.expectedDistribution!.filter(a=>a.amount>0).map(a=>[a.personId.split('_')[1],a.amount/1e6,a.protectedAmount!/1e6]));
 expect(awards).toEqual([
  [['f',6,6],['m',6,6],['pf',6,0],['mm',6,0]],
  [['m',9,9],['pf',6,0],['mm',3,0]],
  [['pf',14,6],['mf',7,3],['mm',3,3]],
  [['f',5,5],['m',5,5],['pf',10,0]],
  [['pf',6,0],['mf',2,0],['mm',8,0]],
  [['af',5,5],['am',5,5],['bf',10,0]],
 ]);
});
it('rejects a protected component larger than its award',()=>{
 const s=structuredClone(cases[0]);s.expectedDistribution![0].protectedAmount=99_000_000;
 expect(()=>parseJsonl(JSON.stringify(s))).toThrow(/protectedAmount/);
});
