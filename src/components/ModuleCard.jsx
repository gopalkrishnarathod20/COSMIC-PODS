import React from "react";

const ICON_MAP = {
  sleep: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="6" width="20" height="12" rx="2" stroke="#0f172a" strokeWidth="1.2" fill="#fff"/>
      <path d="M6 10h8" stroke="#0f172a" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  ),
  galley: (
    <svg width="28" height="28" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="4" rx="1" fill="#fff" stroke="#0f172a"/><rect x="3" y="10" width="18" height="10" rx="1" fill="#fff" stroke="#0f172a"/></svg>
  ),
  life: (
    <svg width="28" height="28" viewBox="0 0 24 24"><circle cx="12" cy="8" r="3" fill="#fff" stroke="#0f172a"/><rect x="6" y="12" width="12" height="6" rx="1" fill="#fff" stroke="#0f172a"/></svg>
  ),
  medical: (
    <svg width="28" height="28" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2" fill="#fff" stroke="#0f172a"/><path d="M12 8v8M8 12h8" stroke="#0f172a" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ),
  gym: (
    <svg width="28" height="28" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="3" fill="#fff" stroke="#0f172a"/><rect x="6" y="4" width="3" height="16" fill="#fff" stroke="#0f172a"/><rect x="15" y="4" width="3" height="16" fill="#fff" stroke="#0f172a"/></svg>
  ),
  storage: (
    <svg width="28" height="28" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="1" fill="#fff" stroke="#0f172a"/><path d="M3 9h18" stroke="#0f172a"/></svg>
  ),
  default: (
    <svg width="28" height="28" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2" fill="#fff" stroke="#0f172a"/></svg>
  ),
};

const ModuleCard = ({ module }) => {
  const handleDragStart = (e) => {
    e.dataTransfer.setData("application/module", JSON.stringify(module));
  };

  const icon = ICON_MAP[module.key] || ICON_MAP.default;

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="p-3 mb-3 rounded-lg shadow-md bg-white cursor-grab"
      style={{ display: "flex", flexDirection: "row", gap: 10, alignItems: "center", padding: 8 }}
      title={`${module.name} — ${module.volume} m³, ${module.power} W`}
    >
      <div style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, color: "#000" }}>{module.name}</div>
        <div style={{ fontSize: 12, color: "#000" }}>{module.volume} m³ · {module.power} W</div>
      </div>
    </div>
  );
};

export default ModuleCard;