
import React, { useState } from "react";

export default function ScenarioEditor({ onAddScenario }) {
  const [name, setName] = useState("");
  const [module, setModule] = useState("Kitchen");
  const [oxygenLoss, setOxygenLoss] = useState(0);
  const [powerLoss, setPowerLoss] = useState(0);
  const [shieldLoss, setShieldLoss] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim()) return;

    const newScenario = {
      label: `🛑 ${name}`,
      affected: module,
      safe: "Exit → Safe Zone",
      effects: (setOxygen, setPower, setShielding) => {
        if (oxygenLoss > 0) setOxygen((prev) => Math.max(prev - oxygenLoss, 0));
        if (powerLoss > 0) setPower((prev) => Math.max(prev - powerLoss, 0));
        if (shieldLoss > 0)
          setShielding((prev) => Math.max(prev - shieldLoss, 0));
      },
    };

    onAddScenario(newScenario);
    setName("");
    setModule("Kitchen");
    setOxygenLoss(0);
    setPowerLoss(0);
    setShieldLoss(0);
  };

  return (
    <div className="p-4 bg-gray-800 text-white rounded-lg shadow-lg max-w-md">
      <h2 className="text-lg font-bold mb-3">Scenario Editor</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Scenario Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="p-2 rounded bg-gray-700 text-white"
        />

        <select
          value={module}
          onChange={(e) => setModule(e.target.value)}
          className="p-2 rounded bg-gray-700"
        >
          <option>Kitchen</option>
          <option>Crew Cabin</option>
          <option>Energy Module</option>
          <option>Exit</option>
        </select>

        <label className="text-sm">Oxygen Loss per second</label>
        <input
          type="number"
          value={oxygenLoss}
          onChange={(e) => setOxygenLoss(Number(e.target.value))}
          className="p-2 rounded bg-gray-700"
        />

        <label className="text-sm">Power Loss per second</label>
        <input
          type="number"
          value={powerLoss}
          onChange={(e) => setPowerLoss(Number(e.target.value))}
          className="p-2 rounded bg-gray-700"
        />

        <label className="text-sm">Shielding Loss per second</label>
        <input
          type="number"
          value={shieldLoss}
          onChange={(e) => setShieldLoss(Number(e.target.value))}
          className="p-2 rounded bg-gray-700"
        />

        <button
          type="submit"
          className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
        >
          ➕ Add Scenario
        </button>
      </form>
    </div>
  );
}
