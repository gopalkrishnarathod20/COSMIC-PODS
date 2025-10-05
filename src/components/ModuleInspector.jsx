// src/components/ModuleInspector.jsx
import React, { useState, useEffect } from "react";

/**
 * Props:
 * - selected (object) the selected layout item { id, module, x, y, rotation }
 * - onUpdate(updatedItem)
 * - onRotate(direction)
 * - onDelete()
 */
export default function ModuleInspector({ selected, onUpdate, onRotate, onDelete }) {
  const [local, setLocal] = useState(null);

  useEffect(() => {
    setLocal(selected ? { ...selected } : null);
  }, [selected]);

  if (!local) return (
    <aside style={{ width: 240, padding: 12 }}>
      <div style={{ color: "#000", fontWeight: 700 }}>Inspector</div>
      <div style={{ marginTop: 12, color: "#000" }}>Select a module to inspect / edit</div>
    </aside>
  );

  const handleApply = () => {
    onUpdate && onUpdate(local);
  };

  return (
    <aside style={{ width: 240, padding: 12, background: "white", borderRadius: 8, boxShadow: "0 6px 18px rgba(2,6,23,0.08)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontWeight: 700, color: "#000" }}>Inspector</div>
        <div style={{ fontSize: 12, color: "#666" }}>ID: {local.id}</div>
      </div>

      <div style={{ marginTop: 12 }}>
        <label style={{ fontSize: 12, color: "#000" }}>Name</label>
        <input value={local.module.name} onChange={(e) => setLocal({ ...local, module: { ...local.module, name: e.target.value } })} style={{ width: "100%", padding: 6, marginTop: 6 }} />
      </div>

      <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 12, color: "#000" }}>Volume</label>
          <input type="number" value={local.module.volume} onChange={(e) => setLocal({ ...local, module: { ...local.module, volume: Number(e.target.value) } })} style={{ width: "100%", padding: 6, marginTop: 6 }} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 12, color: "#000" }}>Power</label>
          <input type="number" value={local.module.power} onChange={(e) => setLocal({ ...local, module: { ...local.module, power: Number(e.target.value) } })} style={{ width: "100%", padding: 6, marginTop: 6 }} />
        </div>
      </div>

      <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
        <button onClick={() => onRotate && onRotate(-1)} style={{ padding: "6px 10px" }} title="Rotate -90°">⟲ Rotate</button>
        <button onClick={() => onRotate && onRotate(1)} style={{ padding: "6px 10px" }} title="Rotate +90°">⟳ Rotate</button>
        <button onClick={() => onDelete && onDelete()} style={{ padding: "6px 10px", background: "#fee2e2" }}>🗑 Delete</button>
      </div>

      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <button onClick={handleApply} style={{ padding: "8px 12px", background: "#0ea5a0", color: "#fff", borderRadius: 6 }}>Apply</button>
      </div>

      <div style={{ marginTop: 10, fontSize: 12, color: "#666" }}>
        Position: {local.x}, {local.y} · Rotation: {(local.rotation || 0) * 90}°
      </div>
    </aside>
  );
}
