import { useEffect, useMemo, useRef, useState } from "react";
import { ConditionExplorer } from './components/ConditionExplorer';
import { DistributionTreemap } from './components/DistributionTreemap';
import { GraphEdge } from './components/GraphEdge';
import {
  Archive,
  ArrowRight,
  ArrowsOutSimple,
  ArrowCounterClockwise,
  BookOpenText,
  Buildings,
  CalendarBlank,
  Calculator,
  Car,
  CaretLeft,
  CaretRight,
  Coins,
  CornersIn,
  CornersOut,
  Diamond,
  Gift,
  List,
  MagnifyingGlass,
  MapPin,
  Minus,
  Mouse,
  Plus,
  Scales,
  Scroll,
  TreeStructure,
  User,
  UsersThree,
} from "@phosphor-icons/react";
import { netEstateOf, runScenario } from "./engine/runScenario";
import { dispositionValue, summarizeEstateInventory, valueProperty } from "./engine/estateInventory";
import { classify_condition } from "./engine/conditions";
import { conditionCoordinate } from "./engine/conditionPlot";
import { buildDistributionBreakdown } from "./engine/distributionTreemap";
import { resolvePersonReferences } from "./engine/presentation";
import { bundledCaseLibrary } from "./engine/bundledCaseLibrary";
import type { EstateProperty, Person, PropertyType, Scenario } from "./types/scenario";

const iconProps = { size: 20, weight: "regular" as const };
type WorkspaceView = "scenarios" | "family-tree" | "estate" | "computation" | "conditions";

function HeroEntrance({ onEnter }: { onEnter: () => void }) {
  return (
    <main className="hero-entrance">
      <div className="hero-backdrop" aria-hidden="true" />
      <div className="hero-vignette" aria-hidden="true" />
      <header className="hero-masthead">
        <span>Succession Lab</span>
      </header>
      <section className="hero-content" aria-labelledby="hero-title">
        <p className="hero-eyebrow">Interactive succession law studio</p>
        <h1 id="hero-title">Succession<br /><em>Lab</em></h1>
        <p className="hero-description">
          Explore difficult succession problems through case narratives, family trees,
          estate distributions, step-by-step computations, substitutions, and testamentary conditions.
          Succession Lab is designed solely for educational purposes and does not provide legal advice.
        </p>
        <button className="hero-enter" type="button" onClick={onEnter}>
          <span>Enter the Cases workspace</span>
          <ArrowRight size={20} weight="bold" />
        </button>
      </section>
      <footer className="hero-credit">
        <span>Conceptualized and designed by</span>
        <strong>Engr. Rexter Retana</strong>
      </footer>
    </main>
  );
}

function money(value: number, currency = "PHP") {
  return new Intl.NumberFormat("en-PH", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);
}

function readableArithmetic(expression: string) {
  return expression.replace(/\d+(?:\.\d+)?/g, (value) => Number(value) >= 1000 ? new Intl.NumberFormat("en-PH", { maximumFractionDigits: 2 }).format(Number(value)) : value);
}

function IconRail({ activeView, onView, sidebarCollapsed, onToggle }: { activeView: WorkspaceView; onView: (view: WorkspaceView) => void; sidebarCollapsed: boolean; onToggle: () => void }) {
  const tabs: Array<{ id: WorkspaceView; label: string; icon: typeof List }> = [
    { id: "scenarios", label: "Cases", icon: List },
    { id: "family-tree", label: "Family tree", icon: TreeStructure },
    { id: "estate", label: "Estate", icon: Scales },
    { id: "computation", label: "Computation", icon: Calculator },
    { id: "conditions", label: "Conditions", icon: Scroll },
  ];
  return (
    <aside className="icon-rail" aria-label="Primary tools">
      <button className="rail-toggle" onClick={onToggle} aria-label={sidebarCollapsed ? "Open My Workspace" : "Collapse My Workspace"} title={sidebarCollapsed ? "Open My Workspace" : "Collapse My Workspace"}>{sidebarCollapsed ? <CaretRight size={19} /> : <CaretLeft size={19} />}</button>
      <nav>
        {tabs.map(({ id, label, icon: Icon }) => <button key={id} className={`rail-button ${activeView === id ? "active" : ""}`} aria-label={label} aria-pressed={activeView === id} title={label} onClick={() => onView(id)}><Icon {...iconProps} /></button>)}
      </nav>
    </aside>
  );
}

function Sidebar({ scenarios, activeId, onSelect, collapsed, loading }: { scenarios: Scenario[]; activeId?: string; onSelect: (id: string) => void; collapsed: boolean; loading: boolean }) {
  const [query, setQuery] = useState("");
  const filtered = scenarios.filter((scenario) => scenario.title.toLowerCase().includes(query.toLowerCase()));
  return (
    <aside className={`scenario-sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-heading"><div><strong>My Workspace</strong></div></div>
      <label className="search-box"><MagnifyingGlass size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search cases" aria-label="Search cases" /></label>
      <div className="sidebar-label">Cases</div>
      <div className="scenario-list">
        {filtered.length ? filtered.map((scenario) => (
          <button key={scenario.id} className={`scenario-item ${scenario.id === activeId ? "active" : ""}`} onClick={() => onSelect(scenario.id)}>
            <span>{scenario.title}</span>{scenario.scenarioType === "jurisprudence" && <small>Jurisprudence</small>}
          </button>
        )) : (
          <div className="sidebar-empty"><Archive size={24} /><strong>{loading ? "Loading saved cases…" : "No cases yet"}</strong><span>{loading ? "Retrieving the permanent case library." : "Load a case JSONL file to begin."}</span></div>
        )}
      </div>
    </aside>
  );
}

function Topbar({ activeView, onView }: { activeView: WorkspaceView; onView: (view: WorkspaceView) => void }) {
  const tabs: Array<{ id: WorkspaceView; label: string; icon: typeof List }> = [
    { id: "scenarios", label: "Cases", icon: List },
    { id: "family-tree", label: "Family tree", icon: TreeStructure },
    { id: "estate", label: "Estate", icon: Scales },
    { id: "computation", label: "Computation", icon: Calculator },
    { id: "conditions", label: "Conditions", icon: Scroll },
  ];
  return (
    <header className="topbar">
      <div className="product-name">Succession Lab</div>
      <nav className="view-tabs" aria-label="Workspace views">
        {tabs.map(({ id, label, icon: Icon }) => <button key={id} className={activeView === id ? "active" : ""} aria-pressed={activeView === id} onClick={() => onView(id)}><Icon size={18} /> {label}</button>)}
      </nav>
    </header>
  );
}

function Summary({ scenario }: { scenario?: Scenario }) {
  const net = scenario ? netEstateOf(scenario) : 0;
  const results = scenario ? runScenario(scenario) : [];
  const children = results.find((item) => item.module === "legitimate_child_legitime")?.total ?? results.find((item) => item.module === "spouse_concurrence")?.allocations?.childrenCollective;
  const spouse = results.find((item) => item.module === "spouse_concurrence")?.total ?? 0;
  const mappedLegitime = scenario ? buildDistributionBreakdown(scenario).legitime.reduce((sum, item) => sum + item.amount, 0) : undefined;
  const legitime = children == null ? mappedLegitime : children + spouse;
  const free = typeof legitime === "number" ? Math.max(0, net - legitime) : undefined;
  const entries = [
    { label: "Net estate", value: scenario ? money(net, scenario.currency) : "Not loaded", meta: scenario ? `${money(scenario.estate.assets, scenario.currency)} assets` : "Awaiting JSONL", icon: Coins },
    { label: "Computed legitimes", value: legitime == null ? "Not computed" : money(legitime, scenario?.currency), meta: spouse ? "Children and surviving spouse" : "All compulsory heirs", icon: UsersThree },
    { label: "Remaining free portion", value: free == null ? "Not computed" : money(free, scenario?.currency), meta: "After computed legitimes", icon: Gift },
  ];
  return <section className="summary-strip">{entries.map((entry, index) => { const Icon = entry.icon; return <article className="summary-card" key={entry.label}><div><span>{entry.label}</span><strong>{entry.value}</strong><small>{entry.meta}</small></div><span className={`summary-icon tone-${index}`}><Icon size={18} /></span></article>; })}</section>;
}

const propertyIcons: Partial<Record<PropertyType, typeof Buildings>> = {
  real_property: Buildings,
  cash: Coins,
  vehicle: Car,
  jewelry: Diamond,
  securities: Coins,
  business_interest: Buildings,
};

function PropertyIcon({ property }: { property: EstateProperty }) {
  const Icon = propertyIcons[property.propertyType] ?? Gift;
  return <Icon size={20} />;
}

function EstateInventoryPanel({ scenario }: { scenario?: Scenario }) {
  const properties = scenario?.estate.properties ?? [];
  const summary = scenario ? summarizeEstateInventory(scenario) : undefined;
  return (
    <section className="inventory-card" id="estate-inventory-view">
      <div className="panel-title"><div><strong>Estate inventory</strong><span>Specific assets and attached obligations</span></div><Buildings size={20} /></div>
      {!properties.length ? <div className="compact-empty"><Buildings size={24} /><span>No itemized properties in this scenario.</span></div> : <>
        <div className="property-scroller">
          {properties.map((property) => {
            const valuation = valueProperty(property);
            return <article className="property-item" key={property.id}>
              <span className="property-symbol"><PropertyIcon property={property} /></span>
              <div className="property-copy"><strong>{property.name}</strong><span>{property.propertyType.replaceAll("_", " ")} / {property.ownershipClassification.replaceAll("_", " ")}</span></div>
              <div className="property-value"><strong>{money(valuation.netValue, scenario?.currency)}</strong><span>{valuation.encumbrances ? `${money(valuation.encumbrances, scenario?.currency)} encumbered` : "Unencumbered"}</span></div>
              <details className="record-details"><summary>Valuation details</summary><p>Gross value: {money(property.grossValue, scenario?.currency)}</p>{property.description && <p>{property.description}</p>}{property.encumbrances?.map((item) => <p key={item.id}>{item.label}: {money(item.amount, scenario?.currency)}</p>)}</details>
            </article>;
          })}
        </div>
        {!!scenario?.estate.generalLiabilities?.length && <div className="liability-footer">{scenario.estate.generalLiabilities.map((item) => <div key={item.id}><span>{item.label}</span><strong>{money(item.amount, scenario.currency)}</strong></div>)}</div>}
        {summary && !summary.reconcilesWithDeclaredEstate && <div className="reconcile-warning">Itemized net value {money(summary.inventoryNetValue, scenario?.currency)} does not match the declared net estate {money(summary.declaredNetEstate, scenario?.currency)}.</div>}
      </>}
    </section>
  );
}

function DispositionsPanel({ scenario }: { scenario?: Scenario }) {
  const dispositions = scenario?.dispositions ?? [];
  const people = new Map(scenario?.persons.map((person) => [person.id, person.name]) ?? []);
  const properties = new Map(scenario?.estate.properties?.map((property) => [property.id, property.name]) ?? []);
  return (
    <section className="dispositions-card">
      <div className="panel-title"><div><strong>Testamentary dispositions</strong><span>Devises, legacies, and institutions</span></div><Gift size={20} /></div>
      {!dispositions.length ? <div className="compact-empty"><Gift size={24} /><span>No dispositions supplied in this scenario.</span></div> : (
        <div className="disposition-list">{dispositions.map((disposition) => {
          const value = scenario ? dispositionValue(disposition, scenario) : undefined;
          return <article className="disposition-item" key={disposition.id}>
            <span className={`kind-mark kind-${disposition.kind}`}>{disposition.kind}</span>
            <div><strong>{people.get(disposition.beneficiaryId) ?? disposition.beneficiaryId}</strong><span>{disposition.propertyId ? properties.get(disposition.propertyId) ?? disposition.propertyId : "General estate"}</span></div>
            <strong className="disposition-value">{value == null ? "Value not supplied" : money(value, scenario?.currency)}</strong>
            <details className="record-details"><summary>Read disposition</summary>{disposition.description && <p>{disposition.description}</p>}{disposition.conditionId && <p><b>Condition: </b>{scenario?.conditions?.find((item) => item.id === disposition.conditionId)?.text}</p>}{!!disposition.substitutionIds?.length && <p><b>Named substitutes: </b>{disposition.substitutionIds.map((id) => people.get(id) ?? id).join(", ")}</p>}</details>
          </article>;
        })}</div>
      )}
    </section>
  );
}

function PersonNode({ person }: { person: Person }) {
  return <div className={`person-node ${person.status === "predeceased" ? "predeceased" : ""}`}><span className="person-icon"><User size={19} /></span><div><strong>{person.name}</strong><span>{person.role}</span>{person.note && <small>{person.note}</small>}</div></div>;
}

function FamilyGraph({ scenario, compact = false }: { scenario?: Scenario; compact?: boolean }) {
  if (!scenario) return (
    <section className="graph-card empty-graph" id="family-tree-view">
      <div className="panel-title"><div><strong>Family tree</strong><span>Relationships appear here after import</span></div><span className="zoom-control">100%</span></div>
      <div className="empty-canvas"><div className="ghost-tree"><span /><span /><span /></div><strong>Your scenario canvas is ready</strong><p>Load JSONL to map people, lines of descent, representation, and substitution.</p></div>
    </section>
  );
  return <RelationshipGraph scenario={scenario} compact={compact} />;
}

type Point = { x: number; y: number };
type GraphGesture =
  | { type: "pan"; startX: number; startY: number; origin: Point }
  | { type: "node"; id: string; startX: number; startY: number; origin: Point };

function RelationshipGraph({ scenario, compact }: { scenario: Scenario; compact: boolean }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const gestureRef = useRef<GraphGesture | undefined>(undefined);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
  const [nodeOffsets, setNodeOffsets] = useState<Record<string, Point>>({});
  const [fullscreen, setFullscreen] = useState(false);
  const [focusedPerson, setFocusedPerson] = useState<string>();
  const edgeTone = (from: string, to: string) => !focusedPerson ? '' : [from,to].includes(focusedPerson) ? 'connection-active' : 'connection-muted';
  const personById = new Map(scenario.persons.map((person) => [person.id, person]));
  const testator = scenario.persons.find((person) => person.role.toLowerCase().includes("testator")) ?? scenario.persons[0];
  const structural = scenario.relationships.filter((relationship) => relationship.type === "parent" || relationship.type === "spouse");
  const familyIds = new Set<string>(testator ? [testator.id] : []);
  // Traverse parentage in both directions so ascendants remain in the family tree.
  for (let pass = 0; pass < scenario.persons.length; pass++) {
    structural.forEach(r => {
      if (familyIds.has(r.from)) familyIds.add(r.to);
      if (familyIds.has(r.to)) familyIds.add(r.from);
    });
  }
  const family = scenario.persons.filter((person) => familyIds.has(person.id));
  const external = scenario.persons.filter((person) => !familyIds.has(person.id));
  const levels = new Map<number, Person[]>();
  family.forEach((person) => {
    const level = person.generation ?? 0;
    levels.set(level, [...(levels.get(level) ?? []), person]);
  });
  const positions = new Map<string, { x: number; y: number }>();
  const isIllegitimate = (person?: Person) => /illegitimate child/i.test(person?.role ?? "");
  const descendantIds = new Set<string>(testator ? [testator.id] : []);
  for (let pass = 0; pass < scenario.persons.length; pass++) {
    scenario.relationships.filter((relationship) => relationship.type === "parent").forEach((relationship) => {
      if (descendantIds.has(relationship.from)) descendantIds.add(relationship.to);
    });
  }
  const familyCenter = Math.max(535, ...[...levels.values()].map(people => 140+(people.length-1)*260/2));
  [...levels.entries()].sort(([a], [b]) => a - b).forEach(([level, people]) => {
    const spread = level === 0 ? 270 : 260;
    const ordered = [...people].sort((a, b) => Number(isIllegitimate(a)) - Number(isIllegitimate(b)));
    const groupGap = ordered.some(isIllegitimate) && ordered.some((person) => !isIllegitimate(person)) ? 90 : 0;
    const totalWidth = Math.max(0, (ordered.length - 1) * spread + groupGap);
    const start = familyCenter - totalWidth / 2;
    let illegitimateGapApplied = false;
    ordered.forEach((person, index) => {
      if (isIllegitimate(person) && !illegitimateGapApplied && index > 0) illegitimateGapApplied = true;
      positions.set(person.id, { x: start + index * spread + (illegitimateGapApplied ? groupGap : 0), y: 74 + level * 205 });
    });
  });
  const externalX = Math.max(1020, ...[...positions.values()].map((point) => point.x + 400));
  external.forEach((person, index) => positions.set(person.id, { x: externalX, y: 220 + index * 118 }));
  const representationPairs = new Set(scenario.relationships.filter((relationship) => relationship.type === "representation").map((relationship) => `${relationship.from}:${relationship.to}`));
  const spouseOfTestator = scenario.relationships.find((relationship) => relationship.type === "spouse" && (relationship.from === testator?.id || relationship.to === testator?.id));
  const spouseId = spouseOfTestator ? (spouseOfTestator.from === testator?.id ? spouseOfTestator.to : spouseOfTestator.from) : undefined;
  const ascendantIds = new Set<string>([testator?.id, spouseId].filter((id): id is string => Boolean(id)));
  for (let pass = 0; pass < scenario.persons.length; pass++) {
    scenario.relationships.filter((relationship) => relationship.type === "parent").forEach((relationship) => {
      if (ascendantIds.has(relationship.to)) ascendantIds.add(relationship.from);
    });
  }
  if (testator) ascendantIds.delete(testator.id);
  if (spouseId) ascendantIds.delete(spouseId);
  const canvasWidth = Math.max(1180, externalX + 240);
  const canvasHeight = Math.max(590, ...[...positions.values()].map((point) => point.y + 180));
  const nodeWidth = 210;
  const nodeHeight = 78;
  const positionOf = (id: string) => {
    const base = positions.get(id);
    const offset = nodeOffsets[id] ?? { x: 0, y: 0 };
    return base ? { x: base.x + offset.x, y: base.y + offset.y } : undefined;
  };
  const testatorPosition = testator ? positionOf(testator.id) : undefined;
  const spousePosition = spouseId ? positionOf(spouseId) : undefined;
  const fitView = () => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const padding = compact ? 18 : 34;
    const nextZoom = Math.max(.12, Math.min(1.1, (viewport.clientWidth - padding * 2) / canvasWidth, (viewport.clientHeight - padding * 2) / canvasHeight));
    setZoom(nextZoom);
    setPan({ x: (viewport.clientWidth - canvasWidth * nextZoom) / 2, y: (viewport.clientHeight - canvasHeight * nextZoom) / 2 });
  };
  useEffect(() => { setNodeOffsets({}); setFocusedPerson(undefined); }, [scenario.id]);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (compact && viewportRef.current) {
        setZoom(1);
        setPan({ x: (viewportRef.current.clientWidth - canvasWidth) / 2, y: -28 });
      } else {
        fitView();
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [scenario.id, compact, fullscreen]);
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const observer = new ResizeObserver(() => fitView());
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [scenario.id, compact, fullscreen]);
  useEffect(() => {
    if (!fullscreen) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setFullscreen(false); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [fullscreen]);
  const changeZoom = (requested: number) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const nextZoom = Math.max(.38, Math.min(1.8, requested));
    const center = { x: viewport.clientWidth / 2, y: viewport.clientHeight / 2 };
    setPan({ x: center.x - ((center.x - pan.x) / zoom) * nextZoom, y: center.y - ((center.y - pan.y) / zoom) * nextZoom });
    setZoom(nextZoom);
  };
  const onWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const viewport = viewportRef.current;
    if (!viewport) return;
    const rect = viewport.getBoundingClientRect();
    const cursor = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    const nextZoom = Math.max(.38, Math.min(1.8, zoom * (event.deltaY < 0 ? 1.1 : .9)));
    setPan({ x: cursor.x - ((cursor.x - pan.x) / zoom) * nextZoom, y: cursor.y - ((cursor.y - pan.y) / zoom) * nextZoom });
    setZoom(nextZoom);
  };
  const beginPan = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || (event.target as HTMLElement).closest(".positioned-node")) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    gestureRef.current = { type: "pan", startX: event.clientX, startY: event.clientY, origin: pan };
    event.currentTarget.classList.add("is-panning");
  };
  const beginNodeDrag = (event: React.PointerEvent<HTMLDivElement>, id: string) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    gestureRef.current = { type: "node", id, startX: event.clientX, startY: event.clientY, origin: nodeOffsets[id] ?? { x: 0, y: 0 } };
  };
  const moveGesture = (event: React.PointerEvent<HTMLDivElement>) => {
    const gesture = gestureRef.current;
    if (!gesture) return;
    if (gesture.type === "pan") {
      setPan({ x: gesture.origin.x + event.clientX - gesture.startX, y: gesture.origin.y + event.clientY - gesture.startY });
    } else {
      setNodeOffsets((current) => ({ ...current, [gesture.id]: { x: gesture.origin.x + (event.clientX - gesture.startX) / zoom, y: gesture.origin.y + (event.clientY - gesture.startY) / zoom } }));
    }
  };
  const endGesture = (event: React.PointerEvent<HTMLDivElement>) => {
    gestureRef.current = undefined;
    viewportRef.current?.classList.remove("is-panning");
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };
  const nudgeNode = (event: React.KeyboardEvent<HTMLDivElement>, id: string) => {
    const directions: Record<string, Point> = { ArrowLeft: { x: -10, y: 0 }, ArrowRight: { x: 10, y: 0 }, ArrowUp: { x: 0, y: -10 }, ArrowDown: { x: 0, y: 10 } };
    const direction = directions[event.key];
    if (!direction) return;
    event.preventDefault();
    setNodeOffsets((current) => ({ ...current, [id]: { x: (current[id]?.x ?? 0) + direction.x, y: (current[id]?.y ?? 0) + direction.y } }));
  };
  return (
    <section className={`graph-card focused-graph ${compact ? "compact-graph" : ""} ${fullscreen ? "graph-fullscreen" : ""}`} id="family-tree-view">
      <div className="panel-title graph-title"><div><strong>{compact ? "Family tree" : "Relationship map"}</strong><span>{family.length} family members · {external.length} outside {external.length === 1 ? "beneficiary" : "beneficiaries"} · {scenario.relationships.length} stated relationships</span></div>
        <div className="graph-toolbar" aria-label="Family tree view controls">
          <button onClick={() => changeZoom(zoom - .1)} aria-label={`Zoom out. Current zoom ${Math.round(zoom * 100)} percent`} title={`Zoom out · ${Math.round(zoom * 100)}%`}><Minus size={16} /></button>
          <button onClick={() => changeZoom(zoom + .1)} aria-label={`Zoom in. Current zoom ${Math.round(zoom * 100)} percent`} title={`Zoom in · ${Math.round(zoom * 100)}%`}><Plus size={16} /></button>
          <button onClick={fitView} aria-label="Fit family tree to view" title="Fit to view"><ArrowsOutSimple size={16} /></button>
          {!compact && <button onClick={() => { setNodeOffsets({}); requestAnimationFrame(fitView); }} aria-label="Reset family tree layout" title="Reset layout"><ArrowCounterClockwise size={16} /></button>}
          {!compact && <button onClick={() => setFullscreen((value) => !value)} aria-label={fullscreen ? "Exit full-screen family tree" : "Open full-screen family tree"} title={fullscreen ? "Exit full screen (Esc)" : "Full screen"}>{fullscreen ? <CornersIn size={16} /> : <CornersOut size={16} />}</button>}
        </div>
      </div>
      <div className="graph-scroll interactive-viewport" ref={viewportRef} onWheel={onWheel} onPointerDown={beginPan} onPointerMove={moveGesture} onPointerUp={endGesture} onPointerCancel={endGesture}>
        <div className="graph-canvas relationship-canvas" style={{ width: canvasWidth, height: canvasHeight, minHeight: canvasHeight, transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}>
          <svg className="relationship-lines" style={{ width: canvasWidth }} viewBox={`0 0 ${canvasWidth} ${canvasHeight}`} aria-hidden="true">
            {scenario.relationships.filter((relationship) => relationship.type === "substitution").map((relationship, index) => {
              const from = positionOf(relationship.from); const to = positionOf(relationship.to);
              if (!from || !to) return null;
              return <GraphEdge key={`substitution-${index}`} className="substitution-edge" tone={edgeTone(relationship.from,relationship.to)} d={`M ${from.x + nodeWidth / 2} ${from.y + 39} H ${Math.max(from.x,to.x) + 145 + index * 20} V ${to.y + 39} H ${to.x + nodeWidth / 2}`} />;
            })}
            {scenario.relationships.filter((relationship) => relationship.type === "spouse").map((relationship, index) => {
              const from = positionOf(relationship.from); const to = positionOf(relationship.to);
              if (!from || !to) return null;
              const direction = to.x >= from.x ? 1 : -1;
              return <GraphEdge key={`spouse-${index}`} className="spouse-edge" tone={edgeTone(relationship.from,relationship.to)} label="Spouse" d={`M ${from.x + direction*nodeWidth/2} ${from.y+nodeHeight/2} L ${to.x-direction*nodeWidth/2} ${to.y+nodeHeight/2}`} />;
            })}
            {scenario.relationships.filter((relationship) => relationship.type === "parent").map((relationship, index) => {
              const from = positionOf(relationship.from); const to = positionOf(relationship.to);
              if (!from || !to) return null;
              const singleMarriage = scenario.relationships.filter(r => r.type === 'spouse' && (r.from === testator?.id || r.to === testator?.id)).length === 1;
              const child = personById.get(relationship.to);
              const isRootParent = singleMarriage && relationship.from === testator?.id && !isIllegitimate(child) && spousePosition && testatorPosition;
              const startX = isRootParent ? (testatorPosition.x + spousePosition.x) / 2 : from.x;
              const startY = isRootParent ? (testatorPosition.y + spousePosition.y) / 2 + nodeHeight/2 : from.y + nodeHeight;
              const endY = to.y;
              const represented = representationPairs.has(`${relationship.from}:${relationship.to}`);
              const middleY = startY + (endY - startY) / 2 + (represented ? index%2*30 : 0);
              return <GraphEdge key={`parent-${index}`} className={`parent-edge ${represented ? "representation-edge" : ""}`} tone={edgeTone(relationship.from,relationship.to)} label={represented ? 'Representation' : undefined} d={`M ${startX} ${startY} V ${middleY} H ${to.x} V ${endY}`} />;
            })}
            {testator && external.flatMap((person) => scenario.dispositions?.filter((disposition) => disposition.beneficiaryId === person.id).slice(0, 1).map((disposition) => {
              const from = positionOf(testator.id); const to = positionOf(person.id);
              if (!from || !to) return null;
              const lane = to.x - 190 - external.indexOf(person)*22;
              const top = Math.min(from.y,to.y)-30-external.indexOf(person)*14;
              return <GraphEdge key={`disposition-${disposition.id}`} className={`disposition-edge disposition-${disposition.kind}`} tone={edgeTone(testator.id,person.id)} label={disposition.kind} fromEnd={48} d={`M ${from.x} ${from.y} V ${top} H ${lane} Q ${lane+12} ${top} ${lane+12} ${top+12} V ${to.y+27} Q ${lane+12} ${to.y+39} ${lane+24} ${to.y+39} H ${to.x-nodeWidth/2}`} />;
            }))}
          </svg>
          {[...positions.entries()].map(([id]) => {
            const person = personById.get(id);
            const position = positionOf(id);
            if (!person || !position) return null;
            const dispositionKinds = scenario.dispositions?.filter((item) => item.beneficiaryId === id).map((item) => item.kind) ?? [];
            const classes = [
              "positioned-node",
              id === testator?.id ? "testator-node" : "",
              external.some((item) => item.id === id) ? "external-node" : "family-node",
              descendantIds.has(id) && id !== spouseId ? "descendant-node" : "",
              id === spouseId ? "spouse-node" : "",
              ascendantIds.has(id) ? "ascendant-node" : "",
              isIllegitimate(person) ? "illegitimate-node" : "",
              dispositionKinds.includes("devise") ? "devisee-node" : "",
              dispositionKinds.includes("legacy") ? "legatee-node" : "",
            ].filter(Boolean).join(" ");
            return <div className={classes} style={{ left: position.x - nodeWidth / 2, top: position.y }} key={id} role="button" tabIndex={0} onPointerEnter={() => setFocusedPerson(id)} onPointerLeave={() => setFocusedPerson(undefined)} onFocus={() => setFocusedPerson(id)} onBlur={() => setFocusedPerson(undefined)} aria-label={`Move ${person.name}`} onPointerDown={(event) => beginNodeDrag(event, id)} onKeyDown={(event) => nudgeNode(event, id)}><PersonNode person={person} /></div>;
          })}
        </div>
        <div className="graph-legend" aria-label="Relationship line legend">
          <span><i className="spouse-key" /> Spouse</span>
          <span><i className="solid-line" /> Line of descent</span>
          <span><i className="dash-line" /> Representation</span>
          <span><i className="devise-key" /> Devise</span>
          <span><i className="legacy-key" /> Legacy</span>
          <span><i className="substitution-key-line" /> Substitution</span>
        </div>
        {!compact && <div className="graph-help"><span><Mouse size={17} /> Drag canvas to pan</span><i /> <span>Scroll to zoom</span><i /> <span>Drag people to rearrange</span></div>}
      </div>
    </section>
  );
}

function ViewHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div className="view-heading"><div><span>{eyebrow}</span><h1>{title}</h1><p>{description}</p></div></div>;
}

function readableDate(value?: string) {
  if (!value) return undefined;
  const date = new Date(`${value}T00:00:00+08:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en-PH", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Manila" }).format(date);
}

function StoryPanel({ scenario }: { scenario?: Scenario }) {
  if (!scenario) return <section className="story-card story-empty"><BookOpenText size={25} /><div><strong>Case story</strong><p>Load a JSONL case to see its decedent, material facts, parties, estate, and testamentary dispositions.</p></div></section>;
  const principal = scenario.persons.find((person) => /testator|testatrix|decedent/.test(person.role.toLowerCase())) ?? scenario.persons[0];
  const principalLabel = /testator|testatrix/.test(principal?.role.toLowerCase() ?? "") ? principal?.role : "Principal party";
  const parties = scenario.persons.filter((person) => person.id !== principal?.id);
  const people = new Map(scenario.persons.map((person) => [person.id, person]));
  const properties = new Map(scenario.estate.properties?.map((property) => [property.id, property]) ?? []);
  const deathDate = readableDate(scenario.story?.deathDate);
  const willDate = readableDate(scenario.story?.willDate);
  return <section className="story-card">
    <header className="story-header"><div><span className="story-kicker">{scenario.scenarioType === "jurisprudence" ? "Case facts" : "Problem story"}</span><h2>{scenario.title}</h2></div><span className="story-type">{scenario.scenarioType === "jurisprudence" ? "Jurisprudence" : "Fictitious exercise"}</span></header>
    <div className="story-layout">
      <article className="story-narrative">
        <div className="testator-line"><span className="testator-avatar"><User size={22} /></span><div><small>{principalLabel}</small><strong>{principal?.name ?? "Not supplied"}</strong></div></div>
        <p>{scenario.story?.narrative ?? "A narrative paragraph was not supplied in this JSONL. The structured facts below remain available for review."}</p>
        <div className="event-row">
          <span><CalendarBlank size={17} /><small>Died</small><strong>{deathDate ?? "Date not supplied"}</strong></span>
          <span><MapPin size={17} /><small>Place</small><strong>{scenario.story?.deathPlace ?? "Not supplied"}</strong></span>
          <span><Scroll size={17} /><small>Will</small><strong>{willDate ? `Executed ${willDate}` : "Date not supplied"}</strong></span>
        </div>
        {scenario.story?.circumstances && <div className="circumstances"><strong>Material circumstances</strong><p>{scenario.story.circumstances}</p></div>}
        {!!scenario.story?.keyFacts?.length && <div className="key-facts"><strong>Key facts</strong><ul>{scenario.story.keyFacts.map((fact, index) => <li key={`${index}-${fact}`}>{fact}</li>)}</ul></div>}
        {scenario.caseDetails && <div className="case-brief-sections">
          <section className="case-record"><strong>Case record</strong><dl>
            {scenario.caseDetails.docketNumber && <><dt>Docket</dt><dd>{scenario.caseDetails.docketNumber}</dd></>}
            {scenario.caseDetails.decisionDate && <><dt>Decision</dt><dd>{readableDate(scenario.caseDetails.decisionDate)}</dd></>}
            {scenario.caseDetails.reporterCitation && <><dt>Reporter</dt><dd>{scenario.caseDetails.reporterCitation}</dd></>}
            {scenario.caseDetails.court && <><dt>Court</dt><dd>{scenario.caseDetails.court}</dd></>}
            {scenario.caseDetails.division && <><dt>Division</dt><dd>{scenario.caseDetails.division}</dd></>}
            {scenario.caseDetails.ponente && <><dt>Ponente</dt><dd>{scenario.caseDetails.ponente}</dd></>}
            {scenario.caseDetails.nature && <><dt>Nature</dt><dd>{scenario.caseDetails.nature}</dd></>}
          </dl></section>
          {!!scenario.caseDetails.proceduralHistory?.length && <section><strong>Procedural history</strong><ul>{scenario.caseDetails.proceduralHistory.map((item, index) => <li key={`history-${index}`}>{item}</li>)}</ul></section>}
          {!!scenario.caseDetails.issues?.length && <section><strong>Issues</strong><ul>{scenario.caseDetails.issues.map((item, index) => <li key={`issue-${index}`}>{item}</li>)}</ul></section>}
          {!!scenario.caseDetails.rulings?.length && <section><strong>Ruling</strong><ul>{scenario.caseDetails.rulings.map((item, index) => <li key={`ruling-${index}`}>{item}</li>)}</ul></section>}
          {!!scenario.caseDetails.doctrines?.length && <section><strong>Doctrine</strong><ul>{scenario.caseDetails.doctrines.map((item, index) => <li key={`doctrine-${index}`}>{item}</li>)}</ul></section>}
          {!!scenario.caseDetails.provisions?.length && <section><strong>Provisions</strong><p>{scenario.caseDetails.provisions.join(" · ")}</p></section>}
          {!!scenario.caseDetails.citationCorrections?.length && <section className="citation-note"><strong>Citation correction</strong><p>{scenario.caseDetails.citationCorrections.join(" ")}</p></section>}
          {!!scenario.caseDetails.recordLimitations?.length && <section className="record-note"><strong>Record limitations</strong><p>{scenario.caseDetails.recordLimitations.join(" ")}</p></section>}
        </div>}
      </article>
      <aside className="story-facts">
        <section><div className="fact-heading"><UsersThree size={18} /><div><strong>People in the problem</strong><span>Heirs, devisees, legatees, and other parties</span></div></div><div className="party-list">{parties.map((person) => <div key={person.id}><span className="party-initial">{person.name.charAt(0)}</span><span><strong>{person.name}</strong><small>{person.role}</small></span></div>)}</div></section>
        <section><div className="fact-heading"><Gift size={18} /><div><strong>What the will gives</strong><span>Beneficiaries and designated property</span></div></div>{scenario.dispositions?.length ? <div className="story-dispositions">{scenario.dispositions.map((disposition) => {
          const beneficiary = people.get(disposition.beneficiaryId);
          const property = disposition.propertyId ? properties.get(disposition.propertyId) : undefined;
          const value = dispositionValue(disposition, scenario);
          return <div key={disposition.id}><span className={`kind-mark kind-${disposition.kind}`}>{disposition.kind}</span><p><strong>{beneficiary?.name ?? disposition.beneficiaryId}</strong><span>{property?.name ?? (value == null ? "General estate" : money(value, scenario.currency))}</span></p></div>;
        })}</div> : <p className="no-story-data">No testamentary dispositions exist in this case, or none were material to the decision.</p>}</section>
      </aside>
    </div>
  </section>;
}

function ScenariosView({ scenario }: { scenario?: Scenario }) {
  return <div className="workspace scenario-workspace" id="scenarios-view">
    <Summary scenario={scenario} />
    <div className="scenario-board">
      <StoryPanel scenario={scenario} />
      <div className="scenario-detail-grid"><EstateInventoryPanel scenario={scenario} /><DispositionsPanel scenario={scenario} /></div>
    </div>
  </div>;
}

function FamilyTreeView({ scenario }: { scenario?: Scenario }) {
  return <div className="workspace focused-workspace family-workspace"><ViewHeading eyebrow="Family structure" title="Family tree" description="Trace the testator's marriage, lines of descent, representation branches, substitutes, and beneficiaries outside the family." /><FamilyGraph scenario={scenario} /></div>;
}

function EstateView({ scenario }: { scenario?: Scenario }) {
  return <div className="workspace focused-workspace"><ViewHeading eyebrow="Hereditary estate" title="Estate and dispositions" description="Review gross property values, encumbrances and liabilities, then match each devise, legacy, or institution to its beneficiary." /><Summary scenario={scenario} /><div className="focused-asset-grid"><EstateInventoryPanel scenario={scenario} /><DispositionsPanel scenario={scenario} /></div></div>;
}

function ComputationView({ scenario }: { scenario?: Scenario }) {
  return <div className="workspace focused-workspace computation-workspace"><ViewHeading eyebrow="Rule engine" title="Computation" description="Compare the protected legitime and disposable portion visually, then follow each rule from the net estate to the final allocation." /><div className="computation-grid"><DistributionTreemap scenario={scenario} /><ComputationPanel scenario={scenario} /></div></div>;
}


function ConditionsView({ scenario }: { scenario?: Scenario }) {
  const conditions = scenario?.conditions ?? [];
  const typeLabels: Record<string, string> = { simple: "Simple", compendious: "Compendious", compedious: "Compendious", reciprocal: "Reciprocal", brief: "Brief", fideicommissary: "Fideicommissary", feidicommissary: "Fideicommissary" };
  return <div className="workspace focused-workspace conditions-workspace">
    <ViewHeading eyebrow="Conditional institutions" title="Conditions" description="Compare true testamentary conditions by conduct, control, and legal effect, while keeping unconditional substitution clauses clearly outside the three-axis space." />
    {!scenario ? <div className="condition-empty"><Scroll size={28} /><strong>Load a case to review conditions</strong><p>Conditions and their classifications are read from the imported JSONL.</p></div> : !conditions.length ? <div className="condition-empty"><Scroll size={28} /><strong>No conditions supplied</strong><p>This case does not state a testamentary condition in its source record.</p></div> : <div className="conditions-content">
      <ConditionExplorer key={scenario.id} conditions={conditions} />
      <div className="condition-list">{conditions.map((condition, index) => {
        const axes = classify_condition(condition);
        const plotted = Boolean(conditionCoordinate(condition));
        const relatedDispositions = scenario.dispositions?.filter((disposition) => disposition.conditionId === condition.id) ?? [];
        const substitutionType = condition.substitutionType && condition.substitutionType !== "none" ? condition.substitutionType : undefined;
        const substitutionLabel = substitutionType ? typeLabels[substitutionType] : "No substitution stated";
        return <article className="condition-card" id={`condition-${condition.id}`} key={condition.id}>
          <div className="condition-card-header"><span className="condition-index">{index + 1}</span><div className="condition-header-copy"><div className="condition-title-row"><strong>{plotted ? "Condition" : "Substitution-only clause"} {index + 1}</strong><span className="substitution-chip">{substitutionLabel}</span></div><p>{condition.text}</p></div></div>
          <div className="condition-card-body"><div className="condition-dna"><small>Three-axis classification</small>{plotted ? <div className="dna-strip"><span>{axes.conduct}</span><i>/</i><span>{axes.control}</span><i>/</i><span>{axes.effect}</span></div> : <div className="dna-strip"><span>Not applicable — no additional condition</span></div>}</div>
          {plotted ? <div className="condition-axes"><div><small>Conduct</small><strong>{axes.conduct}</strong><span>{axes.conduct === "positive" ? "An act must occur" : "An act must be avoided"}</span></div><div><small>Control</small><strong>{axes.control}</strong><span>{axes.control === "potestative" ? "Controlled by the beneficiary" : axes.control === "casual" ? "Chance or a third party" : "Beneficiary plus external factor"}</span></div><div><small>Effect</small><strong>{axes.effect}</strong><span>{axes.effect === "suspensive" ? "Right waits for fulfillment" : "Right may later end"}</span></div></div> : <div className="condition-not-applicable"><strong>Correctly not plotted</strong><span>This substitution operates on its stated trigger without a separate condition to classify.</span></div>}
          <div className="condition-links"><strong>Linked dispositions</strong>{relatedDispositions.length ? relatedDispositions.map((disposition) => <p key={disposition.id}>{disposition.kind}: {scenario.persons.find((person) => person.id === disposition.beneficiaryId)?.name}{disposition.description ? ` — ${disposition.description}` : ""}</p>) : <p>No disposition in this case references this condition.</p>}<small>Classification is supplied by the case file. Read the clause and its explanation for the applicable outcome.</small></div></div>
          {condition.substitutionNote && <div className="condition-note">{condition.substitutionNote}</div>}
        </article>;
      })}</div>
    </div>}
  </div>;
}

function ComputationPanel({ scenario }: { scenario?: Scenario }) {
  const results = useMemo(() => scenario ? runScenario(scenario) : [], [scenario]);
  const derivation = useMemo(() => {
    if (!scenario) return [];
    const currency = scenario.currency;
    if (scenario.computationGuide?.length) {
      return scenario.computationGuide.map((step) => ({
        title: step.title,
        detail: `${step.explanation}${step.expression ? ` ${readableArithmetic(step.expression)}${step.result != null ? ` = ${money(step.result, currency)}` : ""}.` : ""}`,
      }));
    }
    const items: Array<{ title: string; detail: string }> = [{
      title: "Establish the net hereditary estate",
      detail: `${money(scenario.estate.assets, currency)} gross assets minus ${money(scenario.estate.liabilities, currency)} liabilities leaves ${money(netEstateOf(scenario), currency)} available for succession.`,
    }];
    const moduleReason: Record<string, string> = {
      legitimate_child_legitime: "Reserve the collective share directed for the legitimate-child lines, then divide it by the number of lines.",
      spouse_concurrence: "Compute the surviving spouse's concurrent legitime and deduct all protected shares to identify the remaining free portion.",
      representation: "Give the predeceased child's branch one share, then divide that branch equally among the named representatives.",
      reciprocal_substitution: "Allocate the vacant share among the named substitutes according to their stated weights.",
    };
    const readableExpression = (expression: string) => expression.replace(/\d+(?:\.\d+)?/g, (raw) => {
      const value = Number(raw);
      return value >= 1000 ? new Intl.NumberFormat("en-PH", { maximumFractionDigits: 2 }).format(value) : raw;
    });
    results.forEach((result) => result.steps.forEach((step, stepIndex) => {
      items.push({
        title: step.label,
        detail: `${stepIndex === 0 ? `${moduleReason[result.module]} ` : ""}${readableExpression(step.expression)} = ${money(step.value, currency)}.`,
      });
    }));
    if (scenario.expectedDistribution?.length) {
      const distributed = scenario.expectedDistribution.reduce((sum, allocation) => sum + allocation.amount, 0);
      const netEstate = netEstateOf(scenario);
      items.push({
        title: "Check the final allocation",
        detail: `${money(distributed, currency)} is assigned in the expected distribution${distributed === netEstate ? `, matching the ${money(netEstate, currency)} net estate` : `; compare this with the ${money(netEstate, currency)} net estate and reconcile the difference`}.`,
      });
    }
    return items;
  }, [scenario, results]);
  return (
    <aside className="computation-card" id="computation-view">
      <div className="panel-title"><div><strong>Computation</strong><span>Deterministic rule modules</span></div><Calculator size={20} /></div>
      {!scenario ? <div className="computation-empty"><Calculator size={28} /><strong>No calculation yet</strong><p>Calculation steps will be shown exactly from the loaded directives.</p></div> : (
        <div className="calculation-list">
          <div className="estate-line"><span>Net estate</span><strong>{money(netEstateOf(scenario), scenario.currency)}</strong></div>
          {results.map((result, index) => (
            <section className="calculation-block" key={`${result.module}-${index}`}>
              <div className="calculation-name"><span>{index + 1}</span><strong>{result.title ?? result.module.replaceAll("_", " ")}</strong></div>
              {result.steps.map((step) => <div className="step" key={`${step.label}-${step.expression}`}><span>{resolvePersonReferences(step.label, scenario.persons)}<small>{readableArithmetic(step.expression)}</small></span><strong>{money(step.value, scenario.currency)}</strong></div>)}
            </section>
          ))}
          {scenario.expectedDistribution?.length ? <section className="distribution-block">
            <strong>Expected distribution</strong>
            {scenario.expectedDistribution.map((allocation) => {
              const person = scenario.persons.find((item) => item.id === allocation.personId);
              return <div className="distribution-row" key={allocation.personId}><span>{person?.name ?? allocation.personId}<small>{allocation.mechanisms.join(" + ").replaceAll("_", " ")}</small>{allocation.rationale && <small>{allocation.rationale}</small>}</span><strong>{money(allocation.amount, scenario.currency)}</strong></div>;
            })}
            <div className="distribution-total"><span>Total distributed</span><strong>{money(scenario.expectedDistribution.reduce((sum, item) => sum + item.amount, 0), scenario.currency)}</strong></div>
          </section> : null}
          {derivation.length > 0 && <div className="explanation"><strong>How the computation was derived</strong><ol className="derivation-list">{derivation.map((item, index) => <li key={`${item.title}-${index}`}><b>{item.title}</b><span>{item.detail}</span></li>)}</ol></div>}
        </div>
      )}
    </aside>
  );
}

export default function App() {
  const localCasesKey = "succession-scenario-lab.local-cases";
  const retiredCaseIds = new Set(["antonio-santos-conditional-estate"]);
  const activeCases = (items: Scenario[]) => items.filter((item) => !retiredCaseIds.has(item.id));
  const isLocalRuntime = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [activeId, setActiveId] = useState<string>();
  const [activeView, setActiveView] = useState<WorkspaceView>("scenarios");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => window.innerWidth <= 820);
  const [libraryLoading, setLibraryLoading] = useState(true);
  const [showHero, setShowHero] = useState(true);
  const active = scenarios.find((scenario) => scenario.id === activeId) ?? scenarios[0];
  useEffect(() => {
    let cancelled = false;
    fetch("/api/cases", { headers: { Accept: "application/json" } })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load the saved case library.");
        return response.json() as Promise<{ cases?: Scenario[] }>;
      })
      .then((data) => {
        const savedCases = Array.isArray(data.cases) ? activeCases(data.cases) : [];
        if (!savedCases.length) throw new Error("The saved case library is empty.");
        if (!cancelled) setScenarios(savedCases);
      })
      .catch((error) => {
        console.warn(error);
        let fallbackCases = bundledCaseLibrary;
        try {
          const localCases = JSON.parse(localStorage.getItem(localCasesKey) ?? "[]") as unknown;
          if (isLocalRuntime && Array.isArray(localCases) && localCases.length) {
            const filtered = activeCases(localCases as Scenario[]);
            localStorage.setItem(localCasesKey, JSON.stringify(filtered));
            fallbackCases = filtered;
          }
        } catch (localError) { console.warn(localError); }
        if (!cancelled) setScenarios(activeCases(fallbackCases));
      })
      .finally(() => { if (!cancelled) setLibraryLoading(false); });
    return () => { cancelled = true; };
  }, []);
  if (showHero) {
    return <HeroEntrance onEnter={() => { setActiveView("scenarios"); setShowHero(false); }} />;
  }
  return (
    <main className={`app-shell ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <IconRail activeView={activeView} onView={setActiveView} sidebarCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((value) => !value)} />
      <Sidebar scenarios={scenarios} activeId={active?.id} onSelect={(id) => { setActiveId(id); if (window.innerWidth <= 820) setSidebarCollapsed(true); }} collapsed={sidebarCollapsed} loading={libraryLoading} />
      <div className="main-column">
        <Topbar activeView={activeView} onView={setActiveView} />
        {activeView === "scenarios" && <ScenariosView scenario={active} />}
        {activeView === "family-tree" && <FamilyTreeView scenario={active} />}
        {activeView === "estate" && <EstateView scenario={active} />}
        {activeView === "computation" && <ComputationView scenario={active} />}
        {activeView === "conditions" && <ConditionsView scenario={active} />}
      </div>
    </main>
  );
}
