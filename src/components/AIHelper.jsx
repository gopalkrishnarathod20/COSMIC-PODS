import React from "react";
const AIHelper = ({ layout, constraints, onSuggest }) => {
  const recommend = () => {
    // simple rules: if life missing, suggest add life support; if sleep near gym, suggest move sleep
    const lifePresent = layout.some(l => l.module.key === "life");
    const sleepNearGym = layout.some(s => {
      if (s.module.key !== "sleep") return false;
      return layout.some(g => g.module.key === "gym" && Math.abs(g.x - s.x) <= 1 && Math.abs(g.y - s.y) <= 1);
    });

    const recs = [];
    if (!lifePresent) recs.push("Add life support module(s) — required for crew survival.");
    if (sleepNearGym) recs.push("Move sleeping pods away from the Exercise module to reduce noise.");
    const totalPower = layout.reduce((s,i)=>s+(i.module.power||0),0);
    if (totalPower > (constraints.maxPower||400)) recs.push("Power usage exceeds budget — consider swapping heavy-power modules.");
    if (recs.length === 0) recs.push("Layout looks reasonable. Consider optimizing traffic flow near the galley and airlock.");

    onSuggest && onSuggest(recs);
  };

  return (
    <div className="p-3 bg-white rounded shadow">
      <h4 className="font-semibold">AI Assistant</h4>
      <p className="text-xs text-slate-500">Quick heuristic suggestions for improving your habitat layout.</p>
      <button onClick={recommend} className="mt-2 px-3 py-1 bg-amber-400 rounded">Get Suggestions</button>
    </div>
  );
};

export default AIHelper;
