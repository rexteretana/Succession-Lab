import {expect,it} from 'vitest';
import {bundledCaseLibrary,currentCaseLibrary} from './bundledCaseLibrary';

it('ships 25 two-paragraph case questions with dates, place, estate figures and a final task',()=>{
  expect(bundledCaseLibrary).toHaveLength(25);
  for(const s of bundledCaseLibrary){
    const text=s.story!.narrative!;
    const testator=s.persons.find(p=>/testator/i.test(p.role))!;
    expect(text.split(/\n\s*\n/),s.id).toHaveLength(2);
    expect(text,s.id).toContain(testator.name);
    expect(text,s.id).toContain(s.story!.deathPlace);
    for(const value of [s.story!.deathDate!,s.story!.willDate!]){
      const date=new Date(/^\d{4}-/.test(value)?`${value}T12:00:00Z`:value);
      expect(text,s.id).toContain(date.toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}));
    }
    for(const amount of [s.estate.assets,s.estate.liabilities])expect(text,s.id).toContain(`PHP ${amount.toLocaleString('en-US')}`);
    expect(text.endsWith(`Compute the distribution of ${testator.name}'s estate.`),s.id).toBe(true);
    expect(text,s.id).not.toMatch(/problem statement|stated spouse|in this accounting|each takes PHP|annuls the institution/i);
  }
});

it('refreshes the revised narrative for saved built-ins without changing custom imports',()=>{
  const original=bundledCaseLibrary[0];
  const stale={...original,story:{...original.story,narrative:'Old introduction'}};
  const custom={...stale,id:'custom-user-example'};
  const refreshed=currentCaseLibrary([stale,custom]);
  expect(refreshed.find(s=>s.id===original.id)?.story?.narrative).toBe(original.story?.narrative);
  expect(refreshed.find(s=>s.id===custom.id)).toEqual(custom);
});
