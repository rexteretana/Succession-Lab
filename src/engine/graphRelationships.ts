import type { Relationship, Scenario } from '../types/scenario';
export function graphRelationships(scenario:Scenario):Relationship[] {
  const edges=[...scenario.relationships];
  for(const d of scenario.dispositions??[])for(const to of d.substitutionIds??[]){
    if(edges.some(r=>r.type==='substitution'&&r.from===d.beneficiaryId&&r.to===to&&(!r.dispositionId||r.dispositionId===d.id)))continue;
    edges.push({type:'substitution',from:d.beneficiaryId,to,dispositionId:d.id,substitutionType:d.substitutionType??scenario.conditions?.find(c=>c.id===d.conditionId)?.substitutionType});
  }
  return edges;
}
