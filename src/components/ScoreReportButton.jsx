import React, { useState } from "react";
import { jsPDF } from "jspdf";



function humanDate(ts = Date.now()) {
  return new Date(ts).toLocaleString();
}

async function getPreviewCanvasDataUrl() {
  // find the canvas
  let canvas = document.querySelector('canvas[data-canvas="preview3d"]');
  if (!canvas) {
    const all = Array.from(document.getElementsByTagName("canvas"));
    canvas = all.find((c) => c.offsetParent !== null) || all[0];
  }
  if (!canvas) throw new Error("Preview canvas not found");


  if (canvas.width === 0 || canvas.height === 0) throw new Error("Preview canvas is empty");


  try {
    const dataUrl = canvas.toDataURL("image/png");
    if (dataUrl && dataUrl.length > 200) return dataUrl;
  } catch (e) {
    // continue to fallback
    console.warn("canvas.toDataURL failed:", e);
  }

  
  const gl = canvas.getContext("webgl2") || canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
  if (!gl) throw new Error("WebGL context not available for fallback");

  try {
    const w = canvas.width;
    const h = canvas.height;
    const pixels = new Uint8Array(w * h * 4);
    gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

    // create temp 2D canvas and flip Y
    const out = document.createElement("canvas");
    out.width = w;
    out.height = h;
    const ctx = out.getContext("2d");
    const imageData = ctx.createImageData(w, h);

    for (let y = 0; y < h; y++) {
      const srcRow = h - 1 - y;
      const srcStart = srcRow * w * 4;
      const dstStart = y * w * 4;
      for (let i = 0; i < w * 4; i++) {
        imageData.data[dstStart + i] = pixels[srcStart + i];
      }
    }
    ctx.putImageData(imageData, 0, 0);
    return out.toDataURL("image/png");
  } catch (err) {
    console.error("readPixels fallback failed:", err);
    throw new Error("Cannot read WebGL pixels (canvas likely tainted by cross-origin resources).");
  }
}

export default function ScoreReportButton({
  layout = [],
  evaluation = null,
  cols = 16,
  rows = 12,
  maxVolume = 600,
  maxPower = 300,
}) {
  const [busy, setBusy] = useState(false);

  const generateReport = async () => {
    setBusy(true);
    try {
      // If evaluation not supplied, compute a minimal summary
      const evalProvided = evaluation && typeof evaluation === "object";
      const score = evalProvided ? evaluation.score : 0;
      const breakdown = evalProvided ? (evaluation.breakdown || {}) : { totalVolume: 0, totalPower: 0, resourceScore: 0, accessibilityScore: 0 };

      // Build jsPDF
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 40;
      let y = margin;

      // Header
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("Space Habitat — Score Report", margin, y);
      y += 22;

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`Generated: ${humanDate()}`, margin, y);
      doc.text(`Grid: ${cols} x ${rows}`, pageWidth - margin - 160, y);
      y += 16;

      // Main score and quick stats
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`Overall score: ${score}`, margin, y);
      y += 18;

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`Total volume: ${Math.round(breakdown.totalVolume || 0)} m³`, margin, y);
      doc.text(`Total power: ${Math.round(breakdown.totalPower || 0)} W`, margin + 220, y);
      y += 16;
      doc.text(`Resource score: ${Math.round(breakdown.resourceScore || 0)} / 100`, margin, y);
      doc.text(`Accessibility: ${Math.round(breakdown.accessibilityScore || 0)} / 100`, margin + 220, y);
      y += 18;

      // Short separator
      doc.setDrawColor(220);
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageWidth - margin, y);
      y += 12;

      // Try to add preview snapshot
      let imgAdded = false;
      try {
        const dataUrl = await getPreviewCanvasDataUrl();
        if (dataUrl) {
          // Add image scaled to fit width
          const imgProps = doc.getImageProperties(dataUrl);
          const imgW = pageWidth - margin * 2;
          const imgH = (imgProps.height * imgW) / imgProps.width;
          // if not enough vertical room, create new page
          if (y + imgH > pageHeight - margin) {
            doc.addPage();
            y = margin;
          }
          doc.addImage(dataUrl, "PNG", margin, y, imgW, imgH);
          y += imgH + 12;
          imgAdded = true;
        }
      } catch (err) {
        // Image failed (taint or other issues). Continue with text-only report and notify.
        console.warn("Preview image not added to PDF:", err);
        doc.setFontSize(10);
        doc.setTextColor("#ff0000");
        doc.text("Preview image unavailable: canvas could not be read (possible cross-origin textures).", margin, y);
        doc.setTextColor("#000000");
        y += 16;
      }

      // If image used a lot of space and we are near bottom, add page
      if (y > pageHeight - margin - 160) {
        doc.addPage();
        y = margin;
      }

      // Per-module table header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Per-module summary", margin, y);
      y += 14;

      doc.setFont("helvetica", "normal");
      const tableCols = [
        { title: "Name", width: 160 },
        { title: "Key", width: 60 },
        { title: "Pos", width: 60 },
        { title: "Volume", width: 60 },
        { title: "Power", width: 60 },
        { title: "Contribution", width: 80 },
      ];

      // header row
      let x = margin;
      doc.setFontSize(10);
      doc.setDrawColor(200);
      tableCols.forEach((c) => {
        doc.text(c.title, x + 2, y);
        x += c.width;
      });
      y += 12;
      doc.setLineWidth(0.4);
      doc.line(margin, y - 8, pageWidth - margin, y - 8);

      // rows
      const rowHeight = 12;
      doc.setFontSize(10);
      for (let i = 0; i < layout.length; i++) {
        const p = layout[i];
        if (!p) continue;
        const name = p.module?.name || "N/A";
        const key = p.module?.key || "-";
        const pos = `${p.x},${p.y}`;
        const vol = p.module?.volume || 0;
        const power = p.module?.power || 0;

        // compute contribution heuristic (simple)
        const contribution = (() => {
          // optimism: higher volume/power penalize, adjacency slightly rewards
          const resourcePenalty = Math.round((vol / Math.max(1, maxVolume)) * 100 * 0.6 + (power / Math.max(1, maxPower)) * 100 * 0.4);
          let adjBonus = 0;
          // reward if adjacent to storage for galley
          if (p.module?.key === "galley") {
            const nearStorage = layout.some((q) => q !== p && q.module?.key === "storage" && Math.abs(q.x - p.x) + Math.abs(q.y - p.y) <= 1);
            if (nearStorage) adjBonus += 18;
          }
          const cscore = Math.max(0, 100 - resourcePenalty + adjBonus);
          return Math.round(cscore);
        })();

        // break to new page if necessary
        if (y + rowHeight > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }

        x = margin;
        doc.text(name, x + 2, y);
        x += tableCols[0].width;
        doc.text(String(key), x + 2, y);
        x += tableCols[1].width;
        doc.text(pos, x + 2, y);
        x += tableCols[2].width;
        doc.text(String(vol), x + 2, y);
        x += tableCols[3].width;
        doc.text(String(power), x + 2, y);
        x += tableCols[4].width;
        doc.text(String(contribution), x + 2, y);

        y += rowHeight;
      }

      // Footer notes / summary page
      if (y + 60 > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      y += 12;
      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      doc.text("Notes:", margin, y);
      y += 12;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text("This report contains a snapshot of the 3D preview (if available), a numeric score and a per-module summary.", margin, y);
      y += 12;
      doc.text("If the preview image is missing, it may be due to cross-origin textures or browser restrictions. Use local assets in /public/ to ensure snapshot availability.", margin, y);

      // Save
      const filename = `habitat-report-${Date.now()}.pdf`;
      doc.save(filename);
    } catch (err) {
      console.error("Failed to generate PDF report:", err);
      alert("Failed to generate report: " + (err && err.message ? err.message : "see console"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <button onClick={generateReport} disabled={busy} title="Download PDF report">
      {busy ? "Generating PDF…" : "Download Score Report (PDF)"}
    </button>
  );
}