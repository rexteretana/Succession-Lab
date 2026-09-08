import { useEffect, useRef, useState } from 'react';
import { ArrowCounterClockwise, CornersOut, CornersIn } from '@phosphor-icons/react';
import { classify_condition } from '../engine/conditions';
import { conditionCoordinate, groupConditionPoints } from '../engine/conditionPlot';
import type { TestamentaryCondition } from '../types/scenario';
import './conditionExplorer.css';

type Point = [number, number, number];
export function ConditionExplorer({ conditions }: { conditions: TestamentaryCondition[] }) {
  const [selected, setSelected] = useState(0);
  const [angle, setAngle] = useState(28);
  const [expanded, setExpanded] = useState(false);
  const expandButton = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const groups = groupConditionPoints(conditions);
  const unplotted = conditions.map((condition, index) => ({ condition, index })).filter(({ condition }) => !conditionCoordinate(condition));
  const plottedCount = conditions.length - unplotted.length;
  const current = conditions[selected] ?? conditions[0];
  const axes = classify_condition(current);
  const coordinate = conditionCoordinate(current);
  const yaw = angle * Math.PI / 180;
  const project = ([x,y,z]: Point) => [310 + 245 * ((x-.5)*Math.cos(yaw)+(y-.5)*Math.sin(yaw)), 212 + 105*((x-.5)*Math.sin(yaw)-(y-.5)*Math.cos(yaw))-190*(z-.5)];
  const path = (points: Point[]) => points.map((p,i) => `${i ? 'L' : 'M'}${project(p).join(' ')}`).join(' ');
  const select = (index: number) => {
    setSelected(index);
    if (!expanded) document.getElementById(`condition-${conditions[index].id}`)?.scrollIntoView({block:'start',behavior:'smooth'});
  };
  const close = () => { setExpanded(false); requestAnimationFrame(() => expandButton.current?.focus()); };
  useEffect(() => {
    if (!expanded) return;
    closeButton.current?.focus();
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { setExpanded(false); requestAnimationFrame(() => expandButton.current?.focus()); } };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, [expanded]);
  const labels: { p: Point; text: string; dx?: number; dy?: number; anchor?: 'start' | 'end' | 'middle' }[] = [
    {p:[0,0,0],text:'Negative',dx:-12,dy:24,anchor:'end'}, {p:[1,0,0],text:'Positive',dy:26},
    {p:[0,1,0],text:'Casual',dx:14,dy:20}, {p:[0,.5,0],text:'Mixed',dx:-14,dy:5,anchor:'end'},
    {p:[0,0,1],text:'Resolutory',dx:-12,anchor:'end'},
  ];
  return <section className={`axes-explorer ${expanded ? 'axes-expanded' : ''}`} aria-label="Condition space">
    <header className="axes-heading"><div><span>Three-axis classification</span><h2>Condition space</h2></div><div className="axes-tools"><button aria-label="Reset graph rotation" title="Reset rotation" onClick={() => setAngle(28)}><ArrowCounterClockwise size={18}/></button>{expanded ? <button ref={closeButton} aria-label="Exit full-screen conditions" title="Exit fullscreen (Escape)" onClick={close}><CornersIn size={18}/></button> : <button ref={expandButton} aria-label="Open full-screen conditions" title="Fullscreen" onClick={() => setExpanded(true)}><CornersOut size={18}/></button>}</div></header>
    <div className="axes-meta"><strong>{plottedCount} plotted conditions</strong><span>{unplotted.length} non-plotted {unplotted.length === 1 ? 'clause' : 'clauses'}</span><span>{groups.length} distinct positions</span></div>
    <div className="axes-scene">
      <svg viewBox="0 0 620 420" role="group" aria-label="Selectable condition points. Coordinates represent conduct, control, and effect.">
        <path className="axes-floor" d={`${path([[0,0,0],[1,0,0],[1,1,0],[0,1,0]])}Z`}/>
        <path className="axes-wall" d={`${path([[0,1,0],[1,1,0],[1,1,1],[0,1,1]])}Z`}/>
        {[0,.5,1].map(t => <g key={t} className="axes-grid"><path d={path([[0,t,0],[1,t,0],[1,t,1],[0,t,1],[0,t,0]])}/><path d={path([[t,0,0],[t,1,0],[t,1,1]])}/><path d={path([[0,0,t],[0,1,t],[1,1,t]])}/></g>)}
        <g className="axes-spines"><path d={path([[1,0,0],[0,0,0],[0,1,0]])}/><path d={path([[0,0,0],[0,0,1]])}/></g>
        {coordinate && <path className="axes-projection" d={path([coordinate,[coordinate[0],coordinate[1],0],[coordinate[0],0,0]])}/>}
        {labels.map(label => { const p = project(label.p); return <text className="axes-label" key={label.text} x={p[0]+(label.dx ?? 0)} y={p[1]+(label.dy ?? 0)} textAnchor={label.anchor ?? 'middle'}>{label.text}</text>; })}
        <text className="axes-label" x="35" y="391">Base: suspensive · Front: potestative</text>
        {groups.map(group => {
          const p = project(group.coordinate);
          const active = group.indices.includes(selected);
          const index = active ? selected : group.indices[0];
          return <g key={group.coordinate.join(',')} className={`axes-point ${active ? 'is-selected' : ''}`} transform={`translate(${p[0]} ${p[1]})`} role="button" tabIndex={0} aria-pressed={active} aria-label={`Select condition ${index+1}${group.indices.length > 1 ? `; ${group.indices.length} conditions share this position. Activate to cycle.` : ''}`} onClick={() => select(group.indices[(group.indices.indexOf(index)+Number(active))%group.indices.length])} onKeyDown={event => { if(event.key === 'Enter' || event.key === ' ') { event.preventDefault(); select(group.indices[(group.indices.indexOf(index)+Number(active))%group.indices.length]); } }}>
            <circle className="axes-halo" r="26"/><circle className="axes-dot" r="17"/><text dy="5" textAnchor="middle">{index+1}</text>{group.indices.length > 1 && <text className="axes-count" x="21" y="-19">×{group.indices.length}</text>}
          </g>;
        })}
      </svg>
    </div>
    {unplotted.length > 0 && <div className="axes-outside" aria-label="Clauses outside the three-axis condition space"><div><strong>Outside the axes</strong><span>Substitution rules, terms, modes, and invalid restraints are kept outside the condition axes.</span></div><div>{unplotted.map(({ condition, index }) => <button key={condition.id} aria-pressed={index === selected} onClick={() => select(index)} title={condition.text}><b>{index + 1}</b><span>{condition.substitutionType?.replaceAll('_', ' ') ?? 'Unclassified clause'}</span></button>)}</div></div>}
    <label className="axes-rotation">Rotate view<input aria-label="Rotate condition graph" type="range" min="-55" max="55" value={angle} onChange={e => setAngle(Number(e.target.value))}/><output>{angle}°</output></label>
    <div className="axes-key"><span><b>X</b> Conduct</span><span><b>Y</b> Control</span><span><b>Z</b> Effect</span></div>
    <div className="axes-selector" aria-label="Choose a clause">{conditions.map((c,i) => { const plotted = Boolean(conditionCoordinate(c)); return <button className={plotted ? 'is-plotted' : 'is-outside'} key={c.id} aria-label={`${plotted ? 'Condition' : 'Will clause'} ${i+1}`} aria-pressed={i===selected} onClick={() => select(i)} title={c.text}>{i+1}</button>; })}</div>
    <div className="axes-selection" aria-live="polite"><strong>{coordinate ? 'Condition' : 'Will clause'} {selected+1}</strong>{coordinate ? <div className="axes-tags"><span>{axes.conduct}</span><span>{axes.control}</span><span>{axes.effect}</span></div> : <div className="axes-tags axes-tags-na"><span>Not applicable to the three-axis test</span></div>}<p>{current.text}</p>{!coordinate && <p className="axes-warning"><strong>Correctly outside the cube.</strong> This clause has no applicable complete three-axis classification. Read its specific legal effect; absence from the cube does not mean absence from the will.</p>}<button onClick={() => { if(expanded) close(); document.getElementById(`condition-${current.id}`)?.scrollIntoView({block:'start',behavior:'smooth'}); }}>Read linked dispositions →</button></div>
    <details className="axes-help"><summary>How are plotted and unplotted clauses handled?</summary><p>Only clauses with all three supplied labels—conduct, control, and effect—receive a point. A substitution without an additional condition belongs outside the cube. Identical complete classifications share one coordinate and can be cycled. The map visualizes supplied classifications; it does not decide legal validity.</p></details>
  </section>;
}
