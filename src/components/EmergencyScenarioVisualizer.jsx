import React, { useState, useEffect } from "react";
import ResourceImpactPanel from "./ResourceImpactPanel";

export default function EmergencyDashboard() {
  const [oxygen, setOxygen] = useState(null);
  const [power, setPower] = useState(null);
  const [shielding, setShielding] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [evacuated, setEvacuated] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [popupMessage, setPopupMessage] = useState("");

  const scenarios = {
    fire: {
      label: "🔥 Fire Outbreak",
      affected: "Kitchen",
      safe: "Exit → Safe Zone",
      effects: () => {
        setOxygen((prev) => Math.max(prev - 2, 0));
        setPower((prev) => Math.max(prev - 1, 0));
      },
    },
    hullBreach: {
      label: "🛠 Hull Breach",
      affected: "Crew Cabin",
      safe: "Exit → Safe Zone",
      effects: () => {
        setOxygen((prev) => Math.max(prev - 3, 0));
      },
    },
    powerFailure: {
      label: "⚡ Power Failure",
      affected: "Energy Module",
      safe: "Exit → Safe Zone",
      effects: () => {
        setPower((prev) => Math.max(prev - 2, 0));
        setOxygen((prev) => Math.max(prev - 1, 0));
      },
    },
    radiationStorm: {
      label: "☀️ Solar Radiation Storm",
      affected: "Energy Module",
      safe: "Exit → Shielded Zone",
      effects: () => {
        setShielding((prev) => Math.max(prev - 3, 0));
      },
    },
  };

  useEffect(() => {
    if (!selectedScenario || evacuated) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      scenarios[selectedScenario]?.effects();
    }, 1000);
    return () => clearInterval(interval);
  }, [selectedScenario, evacuated]);

  const startScenario = (key) => {
    setSelectedScenario(key);
    setTimeLeft(120);
    setOxygen(100);
    setPower(100);
    setShielding(100);
    setEvacuated(false);

    setPopupMessage(
      `🚨 ${scenarios[key].label}\n\n🔴 Affected Area: ${scenarios[key].affected}\n🟢 Evacuate via: ${scenarios[key].safe}`
    );
  };

  const handleEscape = () => {
    setEvacuated(true);
    setPopupMessage("✅ Evacuation Successful! All systems stabilized.");
  };

  return (
    <div className="relative w-full h-screen bg-gray-900 flex flex-col md:flex-row">
      {/* Scenario Buttons (Responsive Sidebar / Topbar) */}
      <div className="p-4 flex md:flex-col gap-2 bg-gray-800 w-full md:w-1/5 md:min-w-[180px]">
        <h2 className="text-white text-base font-semibold mb-2 md:mb-4">
          Emergency Scenarios
        </h2>
        {Object.keys(scenarios).map((key) => (
          <button
            key={key}
            onClick={() => startScenario(key)}
            className={`flex-1 px-3 py-2 rounded-lg shadow-md text-sm transition-colors ${
              selectedScenario === key
                ? "bg-red-600 text-white"
                : "bg-gray-700 hover:bg-gray-600 text-white"
            }`}
          >
            {scenarios[key].label}
          </button>
        ))}
      </div>

      {/* Right side: Resources + Popup */}
      <div className="flex-1 relative p-4 overflow-y-auto">
        <ResourceImpactPanel
          oxygen={oxygen}
          power={power}
          shielding={shielding}
          timeLeft={timeLeft}
          evacuated={evacuated}
          onEscape={handleEscape}
        />

        {/* Popup Modal */}
        {popupMessage && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-black/90 text-white border border-red-500 rounded-lg p-6 max-w-sm md:max-w-md shadow-lg">
            <p className="whitespace-pre-line">{popupMessage}</p>
            <button
              onClick={() => setPopupMessage("")}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded w-full"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}



