import React, { useMemo } from "react";
import { formatVolume } from "../utils";

const GeometrySandbox = ({ shape, setShape, params, setParams }) => {
  // compute usable volume (simple formulas)
  const volume = useMemo(() => {
    if (shape === "cylinder") {
      const r = params.radius || 2;
      const h = params.height || 4;
      return Math.PI * r * r * h; 
    } else if (shape === "dome") {

      const r = params.radius || 3;
      return (2/3) * Math.PI * r * r * r;
    } else if (shape === "toroid") {
      
      const R = params.major || 6;
      const r = params.minor || 1.5;
      return 2 * Math.PI * Math.PI * R * r * r;
    }
    return 0;
  }, [shape, params]);

  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="text-lg font-semibold mb-2">Geometry Sandbox</h3>
      <div className="flex gap-2 mb-3">
        <button onClick={() => setShape("cylinder")} className={`px-3 py-1 rounded ${shape==='cylinder'?'bg-sky-500 text-white':'bg-slate-100'}`}>Cylinder</button>
        <button onClick={() => setShape("dome")} className={`px-3 py-1 rounded ${shape==='dome'?'bg-sky-500 text-white':'bg-slate-100'}`}>Dome</button>
        <button onClick={() => setShape("toroid")} className={`px-3 py-1 rounded ${shape==='toroid'?'bg-sky-500 text-white':'bg-slate-100'}`}>Toroid</button>
      </div>

      {shape === "cylinder" && (
        <div className="space-y-2">
          <label>Radius (m)</label>
          <input type="number" value={params.radius} onChange={e=>setParams({...params, radius: Number(e.target.value)})} className="w-full p-2 border rounded" />
          <label>Height (m)</label>
          <input type="number" value={params.height} onChange={e=>setParams({...params, height: Number(e.target.value)})} className="w-full p-2 border rounded" />
        </div>
      )}

      {shape === "dome" && (
        <div>
          <label>Radius (m)</label>
          <input type="number" value={params.radius} onChange={e=>setParams({...params, radius: Number(e.target.value)})} className="w-full p-2 border rounded" />
        </div>
      )}

      {shape === "toroid" && (
        <div>
          <label>Major radius R (m)</label>
          <input type="number" value={params.major} onChange={e=>setParams({...params, major: Number(e.target.value)})} className="w-full p-2 border rounded" />
          <label>Minor radius r (m)</label>
          <input type="number" value={params.minor} onChange={e=>setParams({...params, minor: Number(e.target.value)})} className="w-full p-2 border rounded" />
        </div>
      )}

      <div className="mt-3 text-sm text-slate-600">
        <div>Usable Volume (approx): <strong>{formatVolume(volume)}</strong></div>
        <div className="text-xs mt-1 text-slate-500">Note: volumes are approximate and use simple geometric formulas for rapid prototyping.</div>
      </div>
    </div>
  );
};

export default GeometrySandbox;
