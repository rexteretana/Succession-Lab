import type {Person} from '../types/scenario';
// Begin at six o'clock and sweep through the left semicircle first.
// Never rotate by the aggregate protected share: concurrent shares can exceed half.
export function estatePieStart():number {
  return Math.PI/2;
}
export function orderProtectedSlices<T extends {personId:string}>(slices:T[],people:Person[]):T[] {
  const concurrent=(id:string)=>{
    const role=people.find(p=>p.id===id)?.role??'';
    return /\bspouse\b|\b(?:illegitimate|nonmarital|non-marital)\s+(?:child|children|descendant)/i.test(role)?1:0;
  };
  return [...slices].sort((a,b)=>concurrent(a.personId)-concurrent(b.personId));
}
export function estateFraction(amount: number, estate: number): string {
  if (!(estate > 0)) return '—';
  const a=Math.round(amount*100), b=Math.round(estate*100);
  const gcd=(x:number,y:number):number=>y?gcd(y,x%y):x;
  const d=gcd(Math.abs(a),b);
  return `${a/d}/${b/d}`;
}
export function piePath(start:number,end:number):string {
  const point=(a:number)=>`${250+210*Math.cos(a)} ${250+210*Math.sin(a)}`;
  if(end-start>=Math.PI*2-1e-9)return 'M 250 40 A 210 210 0 1 1 250 460 A 210 210 0 1 1 250 40 Z';
  return `M 250 250 L ${point(start)} A 210 210 0 ${end-start>Math.PI?1:0} 1 ${point(end)} Z`;
}
