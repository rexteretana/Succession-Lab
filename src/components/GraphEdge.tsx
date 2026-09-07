import { useLayoutEffect, useRef, useState } from 'react';
/** Measure the rendered path so labels remain attached through layout and dragging. */
export function GraphEdge({ d, label, className, at = .5, fromEnd, tone = '' }: { d: string; label?: string; className: string; at?: number; fromEnd?: number; tone?: string }) {
  const pathRef = useRef<SVGPathElement>(null);
  const [anchor, setAnchor] = useState({x:0,y:0});
  useLayoutEffect(() => {
    const path = pathRef.current;
    if (!path || !label) return;
    const length = path.getTotalLength();
    const point = path.getPointAtLength(fromEnd == null ? length * at : Math.max(0,length-fromEnd));
    setAnchor({x:point.x,y:point.y});
  }, [d, at, fromEnd, label]);
  const width = Math.max(54, (label?.length ?? 0)*6.3+18);
  return <g className={`graph-connection ${tone}`}>
    <path ref={pathRef} className={`edge ${className}`} d={d}/>
    {label && <g className={`attached-edge-label ${className}`} transform={`translate(${anchor.x} ${anchor.y})`}>
      <rect x={-width/2} y={-11} width={width} height={22} rx={7}/>
      <text textAnchor="middle" dominantBaseline="central">{label}</text>
    </g>}
  </g>;
}
