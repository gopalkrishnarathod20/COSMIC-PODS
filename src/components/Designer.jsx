import React, { useEffect, useMemo, useState } from "react";
import ModuleCard from "./ModuleCard";
import GridCanvas from "./GridCanvas";
import Preview3D from "./Preview3D";
import ModuleInspector from "./ModuleInspector";
import HelpModal from "./HelpModal";
import { evaluateLayout } from "../utils/scoringDetailed";
import { attemptOptimize } from "../utils/optimizer";
import ScoreReportButton from "./ScoreReportButton";   // ✅ add import

const DEFAULT_MODULES = [
  { key: "sleep", name: "Sleep Pod", volume: 4, power: 5, w: 1, h: 1 },
  { key: "galley", name: "Galley", volume: 10, power: 40, w: 2, h: 1 },
  { key: "life", name: "Life Support", volume: 12, power: 50, w: 2, h: 1 },
  { key: "medical", name: "Med Bay", volume: 8, power: 20, w: 1, h: 1 },
  { key: "gym", name: "Exercise", volume: 12, power: 30, w: 1, h: 1 },
  { key: "storage", name: "Cargo Room", volume: 6, power: 2, w: 1, h: 1 },
  { key: "cabin ", name: "Crew Cabin ", volume:10, power:15, w:2, h:1 },
  { key: "kitchen ", name: "Kitchen ", volume:12, power:20, w:2, h:1 },
  { key: "Bedroom", name: "Bedroom", volume:8, power:45, w:2, h:1 },
  { key: "Lab", name: "Reaseach Area", volume:16, power:35, w:2, h:1 },
  { key: "GreeenHouse ", name: "Hydroponics Module", volume:10, power:45, w:2, h:1 },
  { key: "Exercise", name: "Wellness Space", volume:10, power:15, w:2, h:1 },
  { key: "Command", name: "Control Room ", volume:10, power:35, w:2, h:1 },
  { key: "Airlock", name: "Enterance Module", volume:10, power:25, w:2, h:1 },
  { key: "Solar Pannels", name: "Energy Module", volume:10, power:15, w:2, h:1 },
  { key: "Waste Recycling", name: "Green Disposal", volume:10, power:25, w:2, h:1 },
  { key: "Observation Desk", name: "Observatory", volume:10, power:10, w:2, h:1 },
];

let idCounter = 1;

export default function Designer() {
  const [layout, setLayout] = useState([]);
  const [cols] = useState(16);
  const [rows] = useState(12);
  const [cellSize] = useState(48);
  const [selectedId, setSelectedId] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  useEffect(() => { pushHistory(layout); /* eslint-disable-next-line */ }, []);

  const pushHistory = (newLayout) => {
    const copy = JSON.parse(JSON.stringify(newLayout));
    const next = history.slice(0, historyIndex + 1);
    next.push(copy);
    setHistory(next);
    setHistoryIndex(next.length - 1);
  };

  const canPlace = (x, y, module, rotation = 0, excludeId = null) => {
    const w = rotation % 2 === 1 ? (module.h || 1) : (module.w || 1);
    const h = rotation % 2 === 1 ? (module.w || 1) : (module.h || 1);
    if (x < 0 || y < 0 || x + w > cols || y + h > rows) return false;
    for (let p of layout) {
      if (p.id === excludeId) continue;
      const pw = p.rotation % 2 === 1 ? (p.module.h || 1) : (p.module.w || 1);
      const ph = p.rotation % 2 === 1 ? (p.module.w || 1) : (p.module.h || 1);
      if (x < p.x + pw && p.x < x + w && y < p.y + ph && p.y < y + h) return false;
    }
    return true;
  };

  const handleDropModule = ({ module, x, y }) => {
    if (!canPlace(x, y, module, 0)) return;
    const newLayout = [...layout, { id: idCounter++, module, x, y, rotation: 0 }];
    setLayout(newLayout);
    pushHistory(newLayout);
  };

  const handleUpdatePlacement = ({ id, x, y }) => {
    const newLayout = layout.map((p) => (p.id === id ? { ...p, x, y } : p));
    setLayout(newLayout);
    pushHistory(newLayout);
    setSelectedId(id);
  };

  const rotateSelected = (direction = 1) => {
    if (!selectedId) return;
    const newLayout = layout.map((p) => {
      if (p.id !== selectedId) return p;
      const newRot = ((p.rotation || 0) + direction + 4) % 4;
      if (!canPlace(p.x, p.y, p.module, newRot, p.id)) return p;
      return { ...p, rotation: newRot };
    });
    setLayout(newLayout);
    pushHistory(newLayout);
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    const newLayout = layout.filter((p) => p.id !== selectedId);
    setLayout(newLayout);
    pushHistory(newLayout);
    setSelectedId(null);
  };

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "r" || e.key === "R") rotateSelected(1);
      else if (e.key === "Delete") deleteSelected();
      else if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        if (historyIndex > 0) {
          const ni = historyIndex - 1;
          setHistoryIndex(ni);
          setLayout(JSON.parse(JSON.stringify(history[ni])));
        }
      } else if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.shiftKey && e.key === "Z"))) {
        if (historyIndex < history.length - 1) {
          const ni = historyIndex + 1;
          setHistoryIndex(ni);
          setLayout(JSON.parse(JSON.stringify(history[ni])));
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [history, historyIndex, layout, selectedId]);

  const runOptimize = () => {
    const { bestLayout, bestScore } = attemptOptimize(layout, { cols, rows, iterations: 700 });
    setLayout(bestLayout);
    pushHistory(bestLayout);
    alert(`Optimization finished — new score ${bestScore}`);
  };

  const exportPNG = async () => {
    try {
      let canvas = document.querySelector('canvas[data-canvas="preview3d"]');
      if (!canvas) {
        const all = Array.from(document.getElementsByTagName("canvas"));
        canvas = all.find((c) => c.offsetParent !== null) || all[0] || null;
      }
      if (!canvas) { alert("3D canvas not found."); return; }
      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `habitat-snapshot-${Date.now()}.png`;
      a.click();
    } catch (err) {
      console.error("exportPNG error:", err);
      alert("Failed to export PNG.");
    }
  };

  const exportJSON = () => {
    const data = { layout, cols, rows, cellSize };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "habitat-layout.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const evaluation = useMemo(
    () => evaluateLayout(layout, { cols, rows, maxVolume: 600, maxPower: 300 }),
    [layout]
  );
  const score = evaluation.score;
  const breakdown = evaluation.breakdown;

  return (
    <div style={{ padding: 30 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
        <h2 style={{ margin: 0, color: "#000" }}>Space Habitat Designer</h2>
        <div style={{ marginLeft: "auto", color: "#000" }}>
          Score: <strong>{score}</strong>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr 260px", gap: 12 }}>
        {/* Palette */}
        <aside style={{ background: "#fff", padding: 12, borderRadius: 8 }}>
          <div style={{ fontWeight: 700, marginBottom: 8, color: "#000" }}>Palette</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {DEFAULT_MODULES.map((m) => <ModuleCard key={m.key} module={m} />)}
          </div>
        </aside>

        {/* Center area */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ background: "#f8fafc", padding: 10, borderRadius: 8 }}>
            <GridCanvas
              layout={layout}
              cols={cols}
              rows={rows}
              cellSize={cellSize}
              onDropModule={handleDropModule}
              onSelect={(id) => setSelectedId(id)}
              selectedId={selectedId}
            />
          </div>

          <div style={{ background: "#071127", borderRadius: 8, padding: 8 }}>
            <div style={{ height: 420 }}>
              <Preview3D
                layout={layout}
                cols={cols}
                rows={rows}
                cellSize={1}
                selectedId={selectedId}
                setSelectedId={setSelectedId}
                onUpdatePlacement={handleUpdatePlacement}
                sceneRotationY={0}
                enableCameraControls={false}
              />
            </div>

            {/* ✅ Toolbar with Snapshot / Export / Optimize / Report */}
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginTop: 12, color: "#fff" }}>
              <button onClick={exportPNG}>📷 Snapshot</button>
              <button onClick={exportJSON}>Export JSON</button>
              <button onClick={runOptimize}>Optimize</button>

              <ScoreReportButton
                layout={layout}
                evaluation={evaluation}
                cols={cols}
                rows={rows}
                maxVolume={600}
                maxPower={300}
              />
            </div>
          </div>
        </div>

        {/* Inspector */}
        <aside style={{ background: "#cccacaff", padding: 12, borderRadius: 8, color: "black" }}>
          <ModuleInspector
            selected={layout.find((l) => l.id === selectedId) || null}
            onUpdate={(updated) => {
              const newLayout = layout.map((p) => (p.id === updated.id ? { ...updated } : p));
              setLayout(newLayout);
              pushHistory(newLayout);
            }}
            onRotate={(d) => rotateSelected(d)}
            onDelete={() => deleteSelected()}
          />
          <div style={{ marginTop: 8 }}>
            <div><strong>Total volume:</strong> {Math.round(breakdown.totalVolume || 0)}</div>
            <div><strong>Total power:</strong> {Math.round(breakdown.totalPower || 0)}</div>
          </div>
        </aside>
      </div>

      <HelpModal />
    </div>
  );
}
