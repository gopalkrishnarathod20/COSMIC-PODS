import React, { useMemo } from "react";

const GridCanvas = ({ layout = [], cols = 16, rows = 12, onDropModule, onSelect, selectedId }) => {
  // compute occupancy heatmap: simple count per cell
  const occupancy = useMemo(() => {
    const arr = Array.from({ length: cols * rows }).map(() => 0);
    for (const item of layout) {
      const rot = item.rotation || 0;
      const w = rot % 2 === 1 ? (item.module.h || 1) : (item.module.w || 1);
      const h = rot % 2 === 1 ? (item.module.w || 1) : (item.module.h || 1);
      for (let dx = 0; dx < w; dx++) {
        for (let dy = 0; dy < h; dy++) {
          const cx = item.x + dx;
          const cy = item.y + dy;
          if (cx >= 0 && cx < cols && cy >= 0 && cy < rows) {
            arr[cy * cols + cx] += 1;
          }
        }
      }
    }
    return arr;
  }, [layout, cols, rows]);

  const maxOccupancy = useMemo(() => Math.max(1, ...occupancy), [occupancy]);

  // drop handler: compute grid coords from client position relative to bounding rect
  const handleDrop = (e) => {
    e.preventDefault();
    const payload = e.dataTransfer.getData("application/module");
    if (!payload) return;
    let module;
    try { module = JSON.parse(payload); } catch (err) { return; }
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    // map to grid coords (snap to integer)
    const x = Math.floor((cx / rect.width) * cols);
    const y = Math.floor((cy / rect.height) * rows);
    onDropModule && onDropModule({ module, x, y });
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      style={{ width: "100%", height: "100%", minHeight: 220, position: "relative", userSelect: "none" }}
    >
      {/* SVG grid that scales with the container */}
      <svg viewBox={`0 0 ${cols} ${rows}`} preserveAspectRatio="xMidYMid meet" style={{ width: "100%", height: "100%", display: "block" }}>

        {/* heatmap rectangles (subtle) */}
        <g>
          {Array.from({ length: rows }).map((_, r) =>
            Array.from({ length: cols }).map((__, c) => {
              const idx = r * cols + c;
              const val = occupancy[idx] || 0;
              if (val === 0) return null;
              const intensity = val / maxOccupancy; // 0..1
              const alpha = 0.08 + 0.12 * intensity;
              const color = `rgba(255,92,92,${alpha})`;
              return <rect key={`heat-${c}-${r}`} x={c} y={r} width={1} height={1} fill={color} stroke="none" />;
            })
          )}
        </g>

        {/* grid lines */}
        <g stroke="#000" strokeWidth={0.02} opacity={0.14}>
          {Array.from({ length: cols + 1 }).map((_, i) => <line key={`v${i}`} x1={i} y1={0} x2={i} y2={rows} />)}
          {Array.from({ length: rows + 1 }).map((_, i) => <line key={`h${i}`} x1={0} y1={i} x2={cols} y2={i} />)}
        </g>

        {/* placed modules: use <foreignObject> to render HTML inside at exact grid coords, or render simple rects */}
        <g>
          {layout.map((item) => {
            const rot = item.rotation || 0;
            const w = rot % 2 === 1 ? (item.module.h || 1) : (item.module.w || 1);
            const h = rot % 2 === 1 ? (item.module.w || 1) : (item.module.h || 1);
            const x = item.x;
            const y = item.y;
            const isSelected = selectedId === item.id;
            // fill color for module body
            const fill = isSelected ? "#fffbeb" : "#ffffff";
            const stroke = "#0f172a";
            return (
              <g key={`item-${item.id}`} transform={`translate(${x}, ${y})`}>
                <rect x={0} y={0} width={w} height={h} fill={fill} stroke={stroke} strokeWidth={0.03} rx={0.08} />
                {/* text label centered */}
                <text x={w / 2} y={h / 2} dominantBaseline="middle" textAnchor="middle" fontSize={0.5} fill="#000" style={{ pointerEvents: "none" }}>
                  {item.module.name}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Overlay small HTML module blocks for click/select (keeps pointer events consistent) */}
      <div style={{ position: "absolute", left: 0, top: 0, right: 0, bottom: 0, pointerEvents: "none" }}>
        {layout.map((item) => {
          const rot = item.rotation || 0;
          const w = rot % 2 === 1 ? (item.module.h || 1) : (item.module.w || 1);
          const h = rot % 2 === 1 ? (item.module.w || 1) : (item.module.h || 1);
          const leftPct = (item.x / cols) * 100;
          const topPct = (item.y / rows) * 100;
          const widthPct = (w / cols) * 100;
          const heightPct = (h / rows) * 100;
          const isSelected = selectedId === item.id;
          return (
            <div
              key={`html-${item.id}`}
              onClick={(e) => { e.stopPropagation(); onSelect && onSelect(item.id); }}
              style={{
                position: "absolute",
                left: `${leftPct}%`,
                top: `${topPct}%`,
                width: `${widthPct}%`,
                height: `${heightPct}%`,
                transform: "translate(0px,0px)",
                padding: 6,
                boxSizing: "border-box",
                pointerEvents: "auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 700,
                color: "#000",
                background: isSelected ? "rgba(255,235,179,0.9)" : "rgba(255,255,255,0.9)",
                border: isSelected ? "2px solid #f59e0b" : "1px solid rgba(15,23,42,0.06)",
                borderRadius: 8,
              }}
              title={`${item.module.name} (${item.module.volume} m³)`}
            >
              {item.module.name}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(GridCanvas);
