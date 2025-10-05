import React from "react";
import ModuleCard from "./ModuleCard";

const DEFAULT_MODULES = [
  { key: "sleep", name: "Sleep Pod", volume: 4, power: 5, w:1, h:1 },
  { key: "galley", name: "Galley", volume: 10, power: 40, w:2, h:1 },
  { key: "life", name: "Life Support", volume: 20, power: 120, w:2, h:1 },
  { key: "medical", name: "Med Bay", volume: 8, power: 15, w:1, h:1 },
  { key: "gym", name: "Exercise", volume: 12, power: 30, w:2, h:1 },
  { key: "storage", name: "Storage", volume: 6, power: 2, w:1, h:1 }
];

const Palette = ({ modules = DEFAULT_MODULES }) => {
  return (
    <div className="p-4 bg-white rounded shadow">
      <h4 className="font-semibold mb-2">Module Palette</h4>
      <div>
        {modules.map(m => <ModuleCard key={m.key} module={m} />)}
      </div>
    </div>
  );
};

export default Palette;
