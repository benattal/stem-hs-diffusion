import { useCallback, useRef } from 'react';

const PADDING = 30;
const DOT_R = 6;
const ACTIVE_R = 10;

export default function EmbeddingScatterPlot({
  pairs,
  activeId,
  onHover,
  width = 460,
  height = 400,
}) {
  const svgRef = useRef(null);

  const toSvgX = (x) => PADDING + x * (width - 2 * PADDING);
  const toSvgY = (y) => PADDING + y * (height - 2 * PADDING);
  const fromSvgX = (sx) => (sx - PADDING) / (width - 2 * PADDING);
  const fromSvgY = (sy) => (sy - PADDING) / (height - 2 * PADDING);

  const handlePointerMove = useCallback((e) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;
    const svgX = (e.clientX - rect.left) * scaleX;
    const svgY = (e.clientY - rect.top) * scaleY;
    const normX = Math.max(0, Math.min(1, fromSvgX(svgX)));
    const normY = Math.max(0, Math.min(1, fromSvgY(svgY)));
    onHover(normX, normY);
  }, [width, height, onHover]);

  // Crosshair position for the active point
  const activePair = pairs.find((p) => p.id === activeId);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${width} ${height}`}
      className="embedding-svg"
      onPointerMove={handlePointerMove}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Background grid */}
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect x={PADDING} y={PADDING} width={width - 2 * PADDING} height={height - 2 * PADDING} fill="url(#grid)" />

      {/* Axis lines */}
      <line
        x1={PADDING} y1={height - PADDING}
        x2={width - PADDING} y2={height - PADDING}
        stroke="rgba(255,255,255,0.2)" strokeWidth={1}
      />
      <line
        x1={PADDING} y1={PADDING}
        x2={PADDING} y2={height - PADDING}
        stroke="rgba(255,255,255,0.2)" strokeWidth={1}
      />

      {/* Crosshair on active point */}
      {activePair && (
        <>
          <line
            x1={toSvgX(activePair.x)}
            y1={PADDING}
            x2={toSvgX(activePair.x)}
            y2={height - PADDING}
            stroke="rgba(108, 99, 255, 0.25)"
            strokeWidth={1}
            strokeDasharray="4 4"
          />
          <line
            x1={PADDING}
            y1={toSvgY(activePair.y)}
            x2={width - PADDING}
            y2={toSvgY(activePair.y)}
            stroke="rgba(108, 99, 255, 0.25)"
            strokeWidth={1}
            strokeDasharray="4 4"
          />
        </>
      )}

      {/* Data points */}
      {pairs.map((pair) => {
        const cx = toSvgX(pair.x);
        const cy = toSvgY(pair.y);
        const isActive = pair.id === activeId;
        return (
          <circle
            key={pair.id}
            cx={cx}
            cy={cy}
            r={isActive ? ACTIVE_R : DOT_R}
            fill={isActive ? 'var(--accent)' : 'rgba(255,255,255,0.35)'}
            stroke={isActive ? 'white' : 'none'}
            strokeWidth={isActive ? 2 : 0}
            style={{ transition: 'r 0.15s ease, fill 0.15s ease' }}
          />
        );
      })}

      {/* Coordinate label on active point */}
      {activePair && (
        <text
          x={toSvgX(activePair.x)}
          y={toSvgY(activePair.y) - ACTIVE_R - 4}
          textAnchor="middle"
          fill="var(--accent-secondary)"
          fontSize={9}
          fontFamily="var(--font)"
          fontWeight="600"
        >
          ({activePair.x.toFixed(2)}, {activePair.y.toFixed(2)})
        </text>
      )}

      {/* Axis labels (KaTeX math italic) */}
      <text x={width / 2} y={height - 4} textAnchor="middle" fill="var(--text-muted)" fontSize={15} fontFamily="KaTeX_Math, 'Times New Roman', serif" fontStyle="italic">
        x
      </text>
      <text x={8} y={height / 2} textAnchor="middle" fill="var(--text-muted)" fontSize={15} fontFamily="KaTeX_Math, 'Times New Roman', serif" fontStyle="italic"
        transform={`rotate(-90, 8, ${height / 2})`}
      >
        y
      </text>
    </svg>
  );
}
