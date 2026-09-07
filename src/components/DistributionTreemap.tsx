import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { CornersIn, CornersOut, Scales, SquaresFour } from "@phosphor-icons/react";
import { buildDistributionBreakdown, layoutTreemap, type DistributionSide, type DistributionSlice } from "../engine/distributionTreemap";
import type { Scenario } from "../types/scenario";

function money(value: number, currency = "PHP") {
  return new Intl.NumberFormat("en-PH", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);
}

function AllocationMap({ side, slices, total, currency, onSelect }: { side: DistributionSide; slices: DistributionSlice[]; total: number; currency?: string; onSelect: (slice: DistributionSlice) => void }) {
  const rectangles = useMemo(() => layoutTreemap(slices, (slice) => slice.amount), [slices]);
  const label = side === "legitime" ? "Protected legitime" : "Disposable portion";
  return <section className={`treemap-half treemap-${side}`}>
    <header>
      <span className="treemap-side-icon"><Scales size={17} /></span>
      <div><strong>{label}</strong><small>{total ? `${Math.round((slices.reduce((sum, slice) => sum + slice.amount, 0) / total) * 100)}% of distributed estate` : "No allocation supplied"}</small></div>
      <b>{money(slices.reduce((sum, slice) => sum + slice.amount, 0), currency)}</b>
    </header>
    <div className="treemap-canvas" aria-label={`${label} allocation treemap`}>
      {rectangles.map(({ item, x, y, width, height }, index) => {
        const style = { "--x": `${x}%`, "--y": `${y}%`, "--w": `${width}%`, "--h": `${height}%`, "--shade": index % 6 } as CSSProperties;
        const compact = width < 24 || height < 20;
        return <button className={`treemap-tile ${compact ? "compact" : ""}`} style={style} key={item.id} onClick={() => onSelect(item)} title={`${item.personName}: ${money(item.amount, currency)}`} aria-label={`${item.personName}, ${money(item.amount, currency)}`}>
          <strong>{item.personName}</strong>
          {!compact && <span>{money(item.amount, currency)}</span>}
        </button>;
      })}
      {!rectangles.length && <div className="treemap-empty">No expected distribution is assigned to this side.</div>}
    </div>
  </section>;
}

export function DistributionTreemap({ scenario }: { scenario?: Scenario }) {
  const breakdown = useMemo(() => scenario ? buildDistributionBreakdown(scenario) : undefined, [scenario]);
  const [selectedId, setSelectedId] = useState<string>();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const selected = [...(breakdown?.legitime ?? []), ...(breakdown?.disposable ?? [])].find((slice) => slice.id === selectedId);

  useEffect(() => {
    if (!isFullscreen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsFullscreen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isFullscreen]);

  return <aside className={`distribution-treemap-card ${isFullscreen ? "treemap-fullscreen" : ""}`} aria-labelledby="distribution-map-title">
    <div className="panel-title"><div><strong id="distribution-map-title">Distribution treemap</strong><span>Expected allocation by protected and disposable shares</span></div><div className="treemap-card-actions"><SquaresFour size={20} aria-hidden="true" /><button className="treemap-fullscreen-button" type="button" onClick={() => setIsFullscreen((value) => !value)} aria-label={isFullscreen ? "Exit distribution treemap full screen" : "View distribution treemap full screen"} aria-pressed={isFullscreen} title={isFullscreen ? "Exit full screen (Esc)" : "View full screen"}>{isFullscreen ? <CornersIn size={18} /> : <CornersOut size={18} />}</button></div></div>
    {!scenario || !breakdown?.total ? <div className="treemap-card-empty"><SquaresFour size={28} /><strong>No distribution to map</strong><p>Load a case with an expected distribution to see its proportional breakdown.</p></div> : <div className="treemap-card-body">
      <div className="treemap-intro"><p>Each half has a fixed position for quick comparison. Tile area within that half is proportional to the beneficiary's share.</p><span>{money(breakdown.total, scenario.currency)} allocated</span></div>
      <div className="treemap-pair">
        <AllocationMap side="legitime" slices={breakdown.legitime} total={breakdown.total} currency={scenario.currency} onSelect={(slice) => setSelectedId(slice.id)} />
        <AllocationMap side="disposable" slices={breakdown.disposable} total={breakdown.total} currency={scenario.currency} onSelect={(slice) => setSelectedId(slice.id)} />
      </div>
      {selected ? <div className={`treemap-selection treemap-selection-${selected.side}`}><span>Selected allocation · {selected.side === "legitime" ? "protected legitime" : "disposable portion"}</span><strong>{selected.personName}</strong><b>{money(selected.amount, scenario.currency)}</b><small>{selected.mechanisms.join(" + ").replaceAll("_", " ")}</small></div> : <div className="treemap-selection treemap-selection-empty"><SquaresFour size={18} aria-hidden="true" /><div><strong>Select an allocation</strong><small>Click any tile to inspect its share and legal mechanism.</small></div></div>}
    </div>}
  </aside>;
}
