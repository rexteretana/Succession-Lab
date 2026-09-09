import { readFileSync, writeFileSync } from 'node:fs';

// Canonical, reproducible corrections to the classroom records. Run after generators.
const files = ['advanced-succession-mastery-15.jsonl', 'example-16-mercado-two-marriages.jsonl', 'examples-17-20-concurring-secondary-heirs.jsonl'];
const pesos = n => `PHP ${n.toLocaleString('en-PH')}`;
function advanced(s, index) {
  const people = s.persons, person = suffix => people.find(p => p.id.endsWith(suffix));
  const o = [1,2,3,4].map(i => person(`_outside_${i}`));
  const child = person('_child_2'), testator = person('_testator');
  const net = s.estate.assets - s.estate.liabilities, lines = people.filter(p => /_child_\d+$/.test(p.id)).length;
  const line = net / 2 / lines, free = net / 2 - line, amounts = [free*.5, free*.3, free*.2];
  const props = s.estate.properties, id = s.id;
  props.forEach(p => { p.ownershipClassification = 'exclusive'; });
  props[0].description = `The will expressly makes the recipient bear the identified mortgage. The benefit is net equity of ${pesos(amounts[0])}; the debt is deducted once, not twice (Article 934).`;
  props[3].description = 'Only the testator’s settled ownership interest is inventoried; all marital-property liquidation is completed before these figures. No spouse-owned half is included.';
  o.forEach((p,i) => { p.status = 'living'; p.role = ['Named devisee','Named monetary legatee','Named securities legatee','Named substitute'][i]; });
  let gifts = [
    {id:`${id}-land`,kind:'devise',beneficiaryId:o[0].id,source:'specific_property',propertyId:props[0].id,amount:amounts[0]},
    {id:`${id}-cash`,kind:'legacy',beneficiaryId:o[1].id,source:'general_estate',amount:amounts[1]},
    {id:`${id}-shares`,kind:'legacy',beneficiaryId:o[2].id,source:'specific_property',propertyId:props[2].id,amount:amounts[2]},
  ];
  let conditions = [], events = [], extra = [], clauseNumber = 0;
  let receivers = [[{personId:o[0].id,amount:amounts[0]}],[{personId:o[1].id,amount:amounts[1]}],[{personId:o[2].id,amount:amounts[2]}]];
  const clause = (giftIndexes, text, classification, substitutionType, note) => {
    const c = {id:`${id}-clause-${++clauseNumber}`,text,classification,substitutionType,substitutionNote:note}; conditions.push(c);
    for (const i of giftIndexes) { gifts[i].conditionIds ??= []; gifts[i].conditionIds.push(c.id); gifts[i].conditionId ??= c.id; }
    return c;
  };
  const substitutes = (i, type, ids) => { gifts[i].substitutionIds = ids; gifts[i].substitutionType = type; };
  const baseline = 'Accounting assumes all named takers accepted and are capable, except the expressly stated predecease or repudiation. No unstated vacancy is computed.';
  // Common operative conditions have express outcomes, not hypothetical allocations.
  clause([0], `${o[0].name} takes the commercial property only if the independent heritage board approves preservation within one year of death. Approval was issued within that year. Any named substitute is subject to the same nonpersonal requirement.`, ['positive','casual','suspensive'], 'none', 'Articles 862 and 877: the condition is fulfilled in the baseline.');
  clause([1], `${o[1].name} receives the monetary legacy on condition of not cutting the registered heritage tree on the legatee’s own land for one year. Sufficient security was furnished; the year has ended without a breach.`, ['negative','potestative','suspensive'], 'none', 'Article 879 permits delivery with security; fulfillment is established at this accounting date.');
  clause([2], `${o[2].name} receives the shares now, but the gift terminates if the holder sells them within three years with the independent trustee’s written approval. No such sale or approval has occurred.`, ['positive','mixed','resolutory'], 'none', 'Only this voluntary legacy is burdened. No return or second allocation is booked.');
  if ([0,6,9,14].includes(index)) {
    substitutes(0,'simple',[o[3].id]); o[0].status='predeceased';
    receivers[0]=[{personId:o[3].id,amount:amounts[0]}];
    const text = `${o[3].name} replaces ${o[0].name} upon predecease, repudiation or incapacity. ${o[0].name} predeceased the testator; ${o[3].name} survived and accepted. The heritage approval applies to the property and has been fulfilled.`;
    clause([0],text,undefined,'simple','Article 859: actual substitution, not an additional gift. A named effective substitute takes before considering accretion.'); events.push(text);
  }
  if (index===1) {
    s.title='02 — Villanueva Estate: Compendious Substitution for Two Beneficiaries';
    [0,1].forEach(i=>{substitutes(i,'compendious',[o[3].id]); receivers[i]=[{personId:o[3].id,amount:amounts[i]}];});
    const text=`${o[0].name} and ${o[1].name} both validly repudiated. ${o[3].name} alone is designated to replace either or both on predecease, repudiation or incapacity and accepted both gifts. The substitute met the property approval and furnished security for the no-cutting condition; its period elapsed without breach.`;
    clause([0,1],text,undefined,'compendious','Article 860: one substitute for several beneficiaries, not several gifts to a single primary beneficiary.'); events.push(text);
  }
  if (index===2) {
    s.title='03 — Aguilar Estate: Brief Substitution with Mixed Conditions';
    substitutes(0,'brief',[o[2].id,o[3].id]); receivers[0]=[o[2],o[3]].map(p=>({personId:p.id,amount:amounts[0]/2}));
    conditions[0].text=`${o[0].name}, or the named substitutes, takes only after submitting a conservation plan and obtaining the independent heritage board’s approval within one year. Both substitute applicants complied and approval was issued.`; conditions[0].classification=['positive','mixed','suspensive'];
    const text=`${o[0].name} validly repudiated. ${o[2].name} and ${o[3].name} are designated as equal substitutes for that one devise upon predecease, repudiation or incapacity. Both accepted; each takes ${pesos(amounts[0]/2)}. ${o[2].name} also retains the separately stated securities legacy.`;
    clause([0],text,undefined,'brief','Article 860: several substitutes for one beneficiary. Separate gifts are added only once.');events.push(text);
  }
  if(index===3) {
    gifts.forEach((g,i)=>substitutes(i,'reciprocal',o.slice(0,3).filter((_,j)=>i!==j).map(p=>p.id)));
    receivers[0]=[{personId:o[1].id,amount:amounts[0]*3/5},{personId:o[2].id,amount:amounts[0]*2/5}];
    const text=`The three original beneficiaries reciprocally substitute for one another. ${o[0].name} repudiated; the other two accepted and fulfilled all applicable nonpersonal conditions. The vacant ${pesos(amounts[0])} is divided in the surviving original proportions 30:20, giving ${pesos(amounts[0]*3/5)} to ${o[1].name} and ${pesos(amounts[0]*2/5)} to ${o[2].name}, in addition to their own gifts.`;
    clause([0,1,2],text,undefined,'reciprocal','Article 861. No share goes to the unused alternate person.');events.push(text);
  }
  if([4,5,14].includes(index)) {
    const first=index===5?child:o[2]; gifts[2].beneficiaryId=first.id;receivers[2]=[{personId:first.id,amount:amounts[2]}];
    // The fiduciary legacy replaces, rather than contradicts, the sale condition.
    gifts[2].conditionIds=[];delete gifts[2].conditionId; conditions=conditions.filter(c=>c.id!==`${id}-clause-3`);
    o[3].role=`Child of ${first.name}; fideicommissary second heir${index===14?' and simple substitute':''}`;
    s.relationships.push({from:first.id,to:o[3].id,type:'parent'});
    substitutes(2,'fideicommissary',[o[3].id]);
    const text=`${first.name} holds the securities legacy of ${pesos(amounts[2])} as fiduciary, expressly bound to preserve and transmit it to ${o[3].name}, the fiduciary’s child, at the fiduciary’s death. Both were alive and capable at the testator’s death. The fiduciary remains alive at accounting. This burden applies only to the additional securities legacy, never to a legitime.`;
    clause([2],text,undefined,'fideicommissary','Articles 863–866: the second heir has a vested right to future delivery, not a second present allocation.'); events.push(text);
  }
  if(index===7) {
    const reps=people.filter(p=>/_rep_\d+$/.test(p.id));
    const text=`The will totally omits ${reps.map(p=>p.name).join(' and ')} without disinheritance or any lifetime advance, and institutes ${child.name} to the residue. Article 854 annuls the institution, not merely the omitted legitime. The three severable devises/legacies survive within the free portion. The remaining ${pesos(net-free)} passes intestate: spouse and two child-lines each receive one-third (${pesos(line)}); the represented line splits equally. These particular figures equal the protected-share amounts, but the residue passes by intestacy.`;
    events.push(text);extra.push({id:`${id}-annulled`,kind:'institution',beneficiaryId:child.id,source:'general_estate',amount:net-free,description:'Residuary institution annulled by preterition; not a second distributable gift.'});
    s.expectedDistribution.filter(a=>a.mechanisms.includes('legitime')).forEach(a=>{a.mechanisms.push('intestate_residue');a.rationale=text;});
  }
  if(index===8) events.push(`The will attempts to disinherit ${child.name} but states no statutory cause. Under Article 918 that disinheritance is ineffective; ${child.name} receives the full ${pesos(line)} legitime. The grandchildren separately represent the genuinely predeceased first child, not the living disinherited child. All voluntary gifts fit within the free portion after restoration.`);
  if(index===10) {conditions[0].text=`The commercial gift to ${o[0].name} is subject to an absolute prohibition on ever marrying. This beneficiary is neither the testator’s spouse nor a person covered by the statutory exception. The restraint is treated as not written; the gift remains effective.`;delete conditions[0].classification;conditions[0].substitutionNote='Article 874: disregard the restraint, not the whole devise.';events.push(conditions[0].text);}
  if(index===11) {
    conditions[0].text=`${o[0].name} acquires the commercial gift at death, but possession is postponed for two years. This is a certain term, not an uncertain condition. The accounting records vested entitlement, not immediate delivery.`;delete conditions[0].classification;conditions[0].substitutionNote='Article 878: acquisition and possession must not be confused.';
    conditions[1].text=`${o[1].name} receives the cash with a charge to maintain a free reading room for one year. The will expressly makes this a mode, not a condition of acquisition. Security was furnished and the charge fulfilled.`;delete conditions[1].classification;conditions[1].substitutionNote='Article 882: a mode does not suspend acquisition.';
    conditions[2].text=`${o[2].name} acquires the shares only after submitting a reading-room proposal and obtaining independent municipal approval within one year. Both occurred before this accounting.`;conditions[2].classification=['positive','mixed','suspensive'];conditions[2].substitutionNote='Article 877: genuine mixed condition, fulfilled.';events.push(...conditions.map(c=>c.text));
  }
  if(index===12) {
    conditions[0].text=`The devise to ${o[0].name} is conditional on making a will benefiting ${testator.name}. This captatory condition makes the entire devise void under Article 875, not merely the condition.`;delete conditions[0].classification;conditions[0].substitutionNote='Article 875: the devise fails in full.';
    receivers[0]=[{personId:child.id,amount:amounts[0]}];extra.push({id:`${id}-residue`,kind:'institution',beneficiaryId:child.id,source:'general_estate',amount:amounts[0],description:'Express independent residuary institution receives the failed captatory devise; additional to legitime.'});events.push(`${conditions[0].text} An independent residuary institution gives the resulting ${pesos(amounts[0])} to ${child.name}; the other legacies remain intact.`);
  }
  if(index===13) {
    // Fixed-value legacies permit exact proportional reduction without assuming sale of a building.
    gifts=gifts.map((g,i)=>({...g,kind:'legacy',source:'general_estate',propertyId:undefined,amount:amounts[i]*2}));
    events.push(`The will orders monetary legacies of ${gifts.map(g=>pesos(g.amount)).join(', ')} with no priority. Total ${pesos(free*2)} exceeds the ${pesos(free)} available. Under Article 911 each is multiplied by ${free}/${free*2} = 1/2. Final legacies are ${amounts.map(pesos).join(', ')}; no compulsory share is reduced.`);
  }
  // Keep only clauses actually connected to a gift, and replace stale illustrative modules.
  const linked=new Set(gifts.flatMap(g=>g.conditionIds??[]));conditions=conditions.filter(c=>linked.has(c.id));
  gifts.forEach((g,i)=>{g.description=`${g.kind==='legacy'?'Legacy':'Devise'} charged only to the free portion. ${receivers[i].map(a=>`${people.find(p=>p.id===a.personId).name}: ${pesos(a.amount)}`).join('; ')} in this accounting. ${index===12&&i===0?'The named devise is void; this value instead passes under the independent residuary institution.':''}`;});
  const protectedRows=s.expectedDistribution.filter(a=>a.mechanisms.includes('legitime'));
  const allocations=new Map(protectedRows.map(a=>[a.personId,{...a}]));
  receivers.forEach((rs,i)=>rs.forEach(a=>{
    const old=allocations.get(a.personId);const mechanism=index===12&&i===0?'institution':gifts[i].kind;
    const mechanisms=[...new Set([...(old?.mechanisms??[]),'free_portion',mechanism,...(a.personId!==gifts[i].beneficiaryId&&!(index===12&&i===0)?['substitution']:[])])];
    allocations.set(a.personId,{personId:a.personId,amount:(old?.amount??0)+a.amount,mechanisms,rationale:`${old?.rationale??''} Additional ${pesos(a.amount)} from ${gifts[i].id}; see the operative clause and accounting explanation.`});
  }));
  s.expectedDistribution=[...allocations.values()];s.dispositions=[...gifts,...extra];s.conditions=conditions;
  s.relationships=s.relationships.filter(r=>r.type!=='substitution');
  s.story.narrative=`${testator.name} died testate, survived by the stated spouse and ${lines} legitimate-child lines, one represented by two grandchildren. ${events.join(' ')} ${baseline}`;
  s.story.circumstances=`All property values are solely the testator’s liquidated estate; no omitted debts or collation donations. ${baseline}`;
  s.story.keyFacts=[`Net estate ${pesos(net)}. Children’s collective legitime ${pesos(net/2)}; each line ${pesos(line)}; spouse ${pesos(line)}; remaining free portion ${pesos(free)}.`,...events];
  const guide=s.computationGuide.slice(0,7);
  guide.push(...events.map(text=>({title:'Apply the operative will and established event',explanation:text})),...receivers.map((rs,i)=>({title:`Account for voluntary gift ${i+1}`,explanation:gifts[i].description,expression:rs.map(a=>a.amount).join(' + '),result:amounts[i]})),{title:'Reconcile current entitlements',explanation:'Add current allocations only. Contingent substitutes and deferred second delivery are not extra estate shares.',expression:s.expectedDistribution.map(a=>a.amount).join(' + '),result:net});
  s.computationGuide=guide;s.explanation=`Fictional educational case. ${events.join(' ')} ${baseline}`;
  s.computations=s.computations.slice(0,3);
  s.computations.push({module:'formula',title:'Actual voluntary allocations',total:free,steps:receivers.flatMap((rs,i)=>rs.map(a=>({label:`Gift ${i+1}: ${people.find(p=>p.id===a.personId).name}`,expression:String(a.amount),value:a.amount}))) });
}

for(const file of files){
 const cases=readFileSync(`public/cases/${file}`,'utf8').trim().split('\n').map(JSON.parse);
 for(const [index,s] of cases.entries()){
  if (s.libraryRevision >= 5) continue; // Preserve the separately reviewed ascendant replacement.
  if(s.libraryRevision===3) continue;
  if(file===files[0] && !s.dispositions.some(d=>d.id===`${s.id}-land`)) advanced(s,index);
  if(file===files[2] && !s.computationGuide.some(g=>g.title==='Resolve every operative clause')){
   const c=s.conditions,d=s.dispositions;
   if(index===0){
    s.conditions=c.slice(0,2);
    c[0].text+=' The will expressly carries the nonpersonal program requirement to Nico. Accreditation was renewed and Nico established the program within eighteen months; he accepted. Celia has no gift or substitution under this will.';
    c[1].text='The Foundation receives the bond portfolio immediately. Its gift terminates if it diverts the principal to administrative salaries during the first five years. No diversion has occurred.';
    c[1].classification=['positive','potestative','resolutory'];
   }
   if(index===1){
    s.conditions=c.slice(0,3);
    c[0].text='Tomas is left the deposit legacy. Ursula and Victor replace him on predecease, repudiation or incapacity in expressly fixed shares 2:1. Tomas validly repudiated; both substitutes accepted. There is no separate acceptance condition.';delete c[0].classification;
    c[1].text+=' Both are alive and capable at Celestino’s death. Wilma remains alive at accounting; the express duty applies solely to this free-portion movable archive legacy.';delete c[1].classification;
    c[2].text='Ursula and Victor reciprocally substitute for each other in the deposit legacy upon predecease, repudiation or incapacity. If only one remains, that survivor takes the entire vacant share, not 2/3 or 1/3 of it. Both accepted in the baseline, so this fallback does not activate.';delete c[2].classification;
    d[0].conditionIds=[c[0].id,c[2].id];
    s.relationships=s.relationships.filter(r=>r.type!=='substitution');
    // Record the additional reciprocal arrangement without fictitious extra gifts.
    s.substitutionRelationships=[{from:'v18_ursula',to:'v18_victor',type:'substitution',substitutionType:'reciprocal',dispositionId:d[0].id},{from:'v18_victor',to:'v18_ursula',type:'substitution',substitutionType:'reciprocal',dispositionId:d[0].id}];
   }
   if(index===2){
    s.conditions=c.slice(0,2);
    c[0].text='Helena is given the resort business interest and a separate PHP 2,000,000 monetary legacy, subject to Helena and Julia jointly restoring the mangrove reserve. Ismael alone substitutes for Helena on predecease, repudiation or incapacity in both gifts. This is simple substitution for ONE beneficiary, not compendious substitution. The baseline free portion is zero, so both gifts are fully reduced regardless of fulfillment.';
    c[0].substitutionType='simple';c[0].substitutionNote='Articles 895 and 911: the protected shares exhaust the estate; neither a condition nor substitution creates a disposable balance.';
    c[1].substitutionType='none';c[1].text='The resort business-interest legacy would terminate if its holder converted protected mangrove land into private villas within ten years. The gift has already been reduced to zero; this later clause therefore has no economic operation in the baseline.';
    d[3].substitutionIds=['v19_ismael'];d[3].conditionIds=[c[0].id,c[1].id];
    d[4].description='Separate cash legacy to the same primary beneficiary with the same simple substitute; fully reduced to zero.';
   }
   if(index===3){
    s.conditions=c.slice(0,3);delete c[1].classification;
    c[0].text+=' Ines accepted and promptly established the program on learning of the death, before accounting. The will expressly charges the identified property debt to the recipient, so only net equity is credited.';
    c[2].text+=' Ines has kept the program open at accounting; no return is due.';
    d[2].conditionIds=[c[0].id,c[2].id];
   }
   // The guide must describe the actual present result, not unused generic fallbacks.
   s.computationGuide=s.computationGuide.filter(g=>!(/reciprocal|fallback/i.test(g.title)&&index===0));
   s.computationGuide.push({title:'Resolve every operative clause',explanation:s.conditions.map(c=>c.text).join(' ')});
  }
  // Stock, movable archive and business-interest gifts are legacies, not devises (Art. 782).
  for(const d of s.dispositions??[]){
   const p=s.estate.properties?.find(p=>p.id===d.propertyId);
   if(['devise','legacy'].includes(d.kind)&&p&&p.propertyType!=='real_property'){
    d.kind='legacy';d.description=d.description?.replace(/devise/gi,'legacy');
    for(const a of s.expectedDistribution??[])if(a.propertyIds?.includes(p.id)){a.mechanisms=a.mechanisms.map(m=>m==='devise'?'legacy':m);a.rationale=a.rationale?.replace(/devise/gi,'legacy');}
   }
  }
  if(file===files[1]){s.dispositions.find(d=>d.id==='clara-extra').conditionIds=['mixed','diversion'];}
  if(file===files[2]){
   // These records describe business interests or movable archives, not land/buildings.
   const replaceText=x=>typeof x==='string'?x.replace(/devisee/gi,'legatee').replace(/devises/gi,'legacies').replace(/devised/gi,'bequeathed').replace(/devise/gi,'legacy'):Array.isArray(x)?x.map(replaceText):x&&typeof x==='object'?Object.fromEntries(Object.entries(x).map(([k,v])=>[k,replaceText(v)])):x;
   s.story=replaceText(s.story);s.computationGuide=replaceText(s.computationGuide);s.computations=replaceText(s.computations);s.conditions=replaceText(s.conditions);
   if(index===0){s.story.narrative=s.story.narrative.replace('negative condition','resolutory diversion condition');if(!s.story.circumstances.includes('expressly directs'))s.story.circumstances+=' The will expressly directs the clinic recipient to discharge its identified debt from that interest. The net equity alone is charged against the free portion.';}
   if(index===2){s.story.narrative=s.story.narrative.replace('a compendious substitution','a simple substitution');if(!s.story.narrative.includes('cash legacy'))s.story.narrative=s.story.narrative.replace('a PHP 8,000,000 resort interest','a PHP 8,000,000 resort interest and a PHP 2,000,000 cash legacy');if(!s.computations.at(-1).steps.some(x=>x.label==='Payable outside monetary legacy'))s.computations.at(-1).steps.push({label:'Payable outside monetary legacy',expression:'2000000 × 0',value:0});}
  }
  // Connect every substitution edge to its actual disposition, never an unrelated condition.
  const edges=[];
  for(const d of s.dispositions??[])for(const to of d.substitutionIds??[]){
    const type=d.substitutionType??s.conditions?.find(c=>c.id===d.conditionId)?.substitutionType;
    if(type&&type!=='none')edges.push({from:d.beneficiaryId,to,type:'substitution',substitutionType:type,dispositionId:d.id});
  }
  s.relationships=[...s.relationships.filter(r=>r.type!=='substitution'),...edges,...(s.substitutionRelationships??[])];delete s.substitutionRelationships;
  if(file===files[2]&&index===1)s.relationships.push(...[['v18_ursula','v18_victor'],['v18_victor','v18_ursula']].map(([from,to])=>({from,to,type:'substitution',substitutionType:'reciprocal',dispositionId:'v18_d1'})));
  if(file===files[0]&&index===13){
    s.conditions[0].text='The first monetary legacy is conditional on the independent heritage board approving preservation within one year. Approval was issued. This is a cash gift, not a gift of the commercial property.';
    s.conditions[2].text='The third monetary legacy is acquired immediately but terminates if the legatee sells the legatee’s separately owned voting shares within three years with the independent trustee’s written approval. Neither event has occurred. The securities themselves are not the object of this monetary legacy.';
    s.persons.filter(p=>/_outside_[123]$/.test(p.id)).forEach(p=>p.role='Named monetary legatee');
  }
  for(const step of s.computationGuide??[])if(step.result>0&&step.result<1)step.resultUnit='ratio';
  if(file===files[1]&&!s.relationships.some(r=>r.type==='parent'&&r.from==='f'&&r.to==='f2'))s.relationships.push({from:'f',to:'f2',type:'parent'});
  s.libraryRevision=3;
 }
 writeFileSync(`public/cases/${file}`,cases.map(s=>JSON.stringify(s)).join('\n')+'\n');
}
