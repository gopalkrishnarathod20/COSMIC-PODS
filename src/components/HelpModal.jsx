import React, { useEffect, useState } from "react";

export default function HelpModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    window.helpModalShow = () => setOpen(true);
    window.helpModalHide = () => setOpen(false);
    return () => {
      window.helpModalShow = undefined;
      window.helpModalHide = undefined;
    };
  }, []);

  if (!open) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(2,6,23,0.6)", zIndex: 2000,
    }}>
      <div style={{ width: 760, maxWidth: "95%", background: "white", borderRadius: 12, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, color: "#000" }}>Designer Help</h3>
          <button onClick={() => setOpen(false)} style={{ padding: 6 }}>Close</button>
        </div>

        <div style={{ marginTop: 12, display: "grid", gap: 8, color: "#000" }}>
          <p>This Designer lets you build space habitats quickly. Quick tips:</p>
          <ul>
            <li>Drag modules from the left palette to the grid (2D).</li>
            <li>Click a module (2D or 3D) to select it. Selected is highlighted.</li>
            <li>Use the slider (bottom-right) to rotate the entire 3D scene for inspection.</li>
            <li>Drag a module in 3D to move it — a ghost preview shows if target cells are free (green) or blocked (red).</li>
            <li>Use the rotate buttons to rotate the selected module by 90° — rotation checks for fit and overlap.</li>
            <li>Use the camera snapshot (📷) to export a PNG of the 3D view.</li>
            <li>Use Optimize to auto-improve layout using a simple heuristic.</li>
            <li>Undo/Redo: Ctrl/Cmd+Z and Ctrl/Cmd+Y.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}