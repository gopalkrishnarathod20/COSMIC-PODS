
export const PRESETS = {
  "Mars - 6 months (4 crew)": { crew: 4, maxPower: 350, name: "Mars 6m - 4 crew", description: "6-month surface mission with limited power reserve" },
  "LEO - 30 days (3 crew)": { crew: 3, maxPower: 600, name: "LEO 30d - 3 crew", description: "Short LEO mission with liberal power" },
  "Lunar - 3 months (4 crew)": { crew: 4, maxPower: 400, name: "Lunar 3m - 4 crew", description: "Lunar surface habitat with medium power" }
};

export function randomMission() {
  const keys = Object.keys(PRESETS);
  const k = keys[Math.floor(Math.random() * keys.length)];
  // tweak constraints randomly
  const p = { ...PRESETS[k] };
  p.maxPower = Math.round(p.maxPower * (0.8 + Math.random() * 0.6));
  return p;
}
