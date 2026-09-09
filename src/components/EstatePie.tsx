import {useEffect,useId,useMemo,useRef,useState} from 'react';
import {CornersIn,CornersOut,ChartPie} from '@phosphor-icons/react';
import {buildDistributionBreakdown} from '../engine/distributionTreemap';
import {estateFraction,piePath,estatePieStart,orderProtectedSlices} from '../engine/estatePie';
import {netEstateOf} from '../engine/runScenario';
import type {Scenario} from '../types/scenario';
const money=(n:number,currency='PHP')=>new Intl.NumberFormat('en-PH',{style:'currency',currency,maximumFractionDigits:2}).format(n);
function PieLabel({start,end,name,fraction}:{start:number;end:number;name:string;fraction:string}) {
 const angle=(start+end)/2,x=250+143*Math.cos(angle),y=250+143*Math.sin(angle);
 const label=`${name.trim().split(/\s+/)[0]} (${fraction})`;
 const rotation=angle*180/Math.PI+(Math.cos(angle)<0?180:0);
 return <text className="pie-fraction-label" x={x} y={y} transform={`rotate(${rotation} ${x} ${y})`} style={{fontSize:12}} textLength={label.length>19?126:undefined} lengthAdjust="spacingAndGlyphs">{label}</text>;
}
export function EstatePie({scenario}:{scenario?:Scenario}){
 const breakdown=useMemo(()=>scenario?buildDistributionBreakdown(scenario):undefined,[scenario]);
 const [selected,setSelected]=useState<string>();const [fullscreen,setFullscreen]=useState(false);
 const toggle=useRef<HTMLButtonElement>(null);const uid=useId().replaceAll(':','');
 const estate=scenario?netEstateOf(scenario):0,assigned=breakdown?.total??0;
 const slices=[...orderProtectedSlices(breakdown?.legitime??[],scenario?.persons??[]),...(breakdown?.disposable??[])];
 useEffect(()=>setSelected(undefined),[scenario?.id]);
 useEffect(()=>{if(!fullscreen)return;const escape=(e:KeyboardEvent)=>{if(e.key==='Escape'){setFullscreen(false);toggle.current?.focus();}};window.addEventListener('keydown',escape);return()=>window.removeEventListener('keydown',escape);},[fullscreen]);
 const initialAngle=estatePieStart();
 let angle=initialAngle;
 const segments=slices.map((s,i)=>{const fraction=estate>0?s.amount/estate:0,start=angle;angle+=fraction*Math.PI*2;
  const shade=i-(s.side==='disposable'?(breakdown?.legitime.length??0):0),count=s.side==='legitime'?breakdown!.legitime.length:breakdown!.disposable.length;
  const color=s.side==='legitime'?`hsl(260 56% ${42+shade/Math.max(1,count-1)*27}%)`:`hsl(155 48% ${28+shade/Math.max(1,count-1)*28}%)`;
  return {...s,start,end:angle,fraction,color};});
 const active=segments.find(s=>s.id===selected);
 return <aside className={`distribution-treemap-card estate-pie-card ${fullscreen?'treemap-fullscreen':''}`} aria-labelledby={`${uid}-title`}>
  <div className="panel-title"><div><strong id={`${uid}-title`}>Estate Pie Distribution</strong><span>Every slice is a fraction of the whole net estate</span></div><button ref={toggle} className="treemap-fullscreen-button" onClick={()=>setFullscreen(v=>!v)} aria-label={fullscreen?'Exit estate pie full screen':'View estate pie full screen'} title={fullscreen?'Exit full screen (Esc)':'View full screen'}>{fullscreen?<CornersIn size={20}/>:<CornersOut size={20}/>}</button></div>
  {!scenario||estate<=0||!slices.length?<div className="treemap-card-empty"><ChartPie size={32}/><strong>No estate distribution available</strong></div>:<div className="treemap-card-body">
   <div className="pie-summary"><span><i className="pie-purple"/>Protected legitime <b>{estateFraction(breakdown!.legitime.reduce((n,s)=>n+s.amount,0),estate)}</b></span><span><i className="pie-green"/>Disposable portion <b>{estateFraction(breakdown!.disposable.reduce((n,s)=>n+s.amount,0),estate)}</b></span><strong>{money(estate,scenario.currency)} net estate</strong></div>
   {assigned>estate+.01?<p role="alert">The supplied allocation exceeds the net estate. Correct the case amounts before plotting the pie.</p>:<div className="estate-pie-layout">
    <div className="estate-pie-visual"><svg viewBox="0 0 500 500" role="group" aria-label="Estate distribution pie chart">
     <defs>{segments.map((s,i)=><linearGradient key={s.id} id={`${uid}-shade-${i}`} x1="0" y1="0" x2="1" y2="1"><stop stopColor={s.color}/><stop offset="1" stopColor={s.color} stopOpacity=".78"/></linearGradient>)}</defs>
     {segments.map((s,i)=><g key={s.id}><path className={`estate-pie-slice ${selected===s.id?'selected':''}`} d={piePath(s.start,s.end)} fill={`url(#${uid}-shade-${i})`} role="button" tabIndex={0} aria-pressed={selected===s.id} aria-label={`${s.personName}, ${s.side==='legitime'?'protected legitime':'disposable portion'}, ${estateFraction(s.amount,estate)} of estate, ${money(s.amount,scenario.currency)}`} onClick={()=>setSelected(s.id)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setSelected(s.id);}}}><title>{s.personName}: {estateFraction(s.amount,estate)} · {money(s.amount,scenario.currency)}</title></path><PieLabel start={s.start} end={s.end} name={s.personName} fraction={estateFraction(s.amount,estate)}/></g>)}
     {assigned<estate-.01&&<path d={piePath(angle,initialAngle+Math.PI*2)} fill="#dfe2e8"><title>Unallocated: {estateFraction(estate-assigned,estate)}</title></path>}
    </svg><p>{active?<><b>{active.personName}</b><br/>{estateFraction(active.amount,estate)} of estate · {money(active.amount,scenario.currency)}</>:'Select a slice or beneficiary to inspect the allocation.'}</p></div>
    <div className="estate-pie-legend" aria-label="All estate allocations">{segments.map(s=><button key={s.id} className={selected===s.id?'selected':''} aria-pressed={selected===s.id} onClick={()=>setSelected(s.id)}><i style={{background:s.color}}/><span><strong>{s.personName}</strong><small>{s.side==='legitime'?'Protected legitime':'Disposable portion'}</small></span><span><b>{estateFraction(s.amount,estate)}</b><small>{money(s.amount,scenario.currency)}</small></span></button>)}{assigned<estate-.01&&<p>Unallocated: {estateFraction(estate-assigned,estate)} · {money(estate-assigned,scenario.currency)}</p>}</div>
   </div>}
  </div>}
 </aside>;
}
