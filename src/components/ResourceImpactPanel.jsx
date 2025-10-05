
import React from "react";
import { motion } from "framer-motion";

function ResourceBar({ label, value, color }) {
  if (value === null) return null; 
  const isLow = value < 20;

  return (
    <div className="mb-4">
      {/* Label + Value in one row */}
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span className={isLow ? "text-red-400 font-bold" : ""}>{value}%</span>
      </div>

      {/* Bar */}
      <div className="w-full bg-gray-700 rounded h-3 overflow-hidden">
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.5 }}
          className={`h-3 bg-${color}-500`}
          style={{
            filter: isLow ? "drop-shadow(0 0 6px red)" : "none",
          }}
        />
      </div>
    </div>
  );
}

export default function ResourceImpactPanel({
  oxygen,
  power,
  shielding,
  timeLeft,
  evacuated,
  onEscape,
}) {
  return (
    <div className="p-6 bg-gray-800 rounded-lg shadow-lg text-white max-w-md mx-auto">
      <h2 className="text-lg mb-4 font-bold">Resource Status</h2>

      {/* Timer only after emergency starts */}
      {timeLeft !== null && (
        <div className="flex justify-between mb-6 text-yellow-400 font-semibold">
          <span>⏳ Time Left:</span>
          <span>{timeLeft}s</span>
        </div>
      )}

      {/* Bars */}
      <ResourceBar label="Oxygen" value={oxygen} color="blue" />
      <ResourceBar label="Power" value={power} color="yellow" />
      <ResourceBar label="Shielding" value={shielding} color="green" />

      {/* Evacuate button */}
      {!evacuated && timeLeft !== null && (
        <button
          onClick={onEscape}
          className="mt-6 w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg shadow-md"
        >
          🚀 Evacuate
        </button>
      )}

      {/* Show success when evacuated */}
      {evacuated && (
        <p className="mt-6 text-green-400 font-semibold text-center">
          ✅ Evacuated Safely
        </p>
      )}
    </div>
  );
}
