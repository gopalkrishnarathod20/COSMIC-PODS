function manhattan(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export function evaluateLayout(
  layout,
  {
    cols = 16,
    rows = 12,
    maxVolume = 600,
    maxPower = 300,
    moduleDefs = {},
    airlockKey = null,
    weights = {
      resource: 0.30,
      accessibility: 0.25,
      adjacency: 0.20,
      clustering: 0.15,
      safety: 0.10,
    },
  } = {}
) {
  // If nothing placed, score must be 0 (initial state).
  if (!layout || layout.length === 0) {
    const breakdownZero = {
      totalVolume: 0,
      totalPower: 0,
      resourceScore: 0,
      volumeRatio: 0,
      powerRatio: 0,
      adjacencyScore: 0,
      accessibilityScore: 0,
      clusteringScore: 0,
      safetyScore: 0,
      normalizedSoft: 0,
    };
    return { totalVolume: 0, totalPower: 0, hardViolations: [], breakdown: breakdownZero, score: 0 };
  }

  const totalVolume = layout.reduce((s, p) => s + (p.module.volume || 0), 0);
  const totalPower = layout.reduce((s, p) => s + (p.module.power || 0), 0);

  const hardViolations = [];
  if (totalPower > maxPower * 1.2) {
    hardViolations.push({ type: "power_excess", message: `Power exceeds safe limit (${Math.round(maxPower * 1.2)} W).`, value: totalPower });
  }
  if (totalVolume > maxVolume * 1.2) {
    hardViolations.push({ type: "volume_excess", message: `Volume exceeds safe limit (${Math.round(maxVolume * 1.2)} m³).`, value: totalVolume });
  }

  const volumeRatio = totalVolume / maxVolume;
  const powerRatio = totalPower / maxPower;
  function scoreFromRatio(r) {
    if (r <= 0.6) return 80 + 20 * (r / 0.6);
    if (r <= 1.0) return 100 - (r - 0.6) * (20 / 0.4);
    return Math.max(0, 100 - (r - 1) * 200);
  }
  const volumeScore = scoreFromRatio(volumeRatio);
  const powerScore = scoreFromRatio(powerRatio);
  const resourceScore = Math.round((volumeScore * 0.5 + powerScore * 0.5));

  let adjacencyScore = 100;
  if (moduleDefs && Object.keys(moduleDefs).length > 0) {
    const penaltyPerBad = 10;
    const bonusPerGood = 8;
    for (let i = 0; i < layout.length; i++) {
      for (let j = i + 1; j < layout.length; j++) {
        const a = layout[i], b = layout[j];
        const d = manhattan(a, b);
        if (d <= 1) {
          const aDef = moduleDefs[a.module.key] || {};
          const bDef = moduleDefs[b.module.key] || {};
          if ((aDef.likes || []).includes(b.module.key) || (bDef.likes || []).includes(a.module.key)) adjacencyScore = Math.min(100, adjacencyScore + bonusPerGood);
          if ((aDef.hates || []).includes(b.module.key) || (bDef.hates || []).includes(a.module.key)) adjacencyScore = Math.max(0, adjacencyScore - penaltyPerBad);
        }
      }
    }
  }

  const importantKeys = ["galley", "life", "medical"];
  const anchors = layout.filter((p) => importantKeys.includes(p.module.key));
  let accessibilityScore = 100;
  if (anchors.length === 0) accessibilityScore = 75;
  else {
    const center = { x: cols / 2, y: rows / 2 };
    const avgDist = anchors.reduce((s, a) => s + manhattan(a, center), 0) / anchors.length;
    const maxPossible = cols + rows;
    accessibilityScore = Math.round(Math.max(0, 100 - (avgDist / maxPossible) * 120));
  }

  const big = layout.filter((p) => (p.module.volume || 0) > 10);
  let clusteringScore = 100;
  if (big.length > 1) {
    const xs = big.map((b) => b.x);
    const ys = big.map((b) => b.y);
    const bboxArea = (Math.max(...xs) - Math.min(...xs) + 1) * (Math.max(...ys) - Math.min(...ys) + 1);
    const spread = bboxArea / (cols * rows);
    clusteringScore = Math.round(Math.max(0, 100 - (1 - spread) * 50));
  }

  let safetyScore = 100;
  if (airlockKey) {
    const airlock = layout.find((p) => p.module.key === airlockKey);
    if (!airlock) safetyScore = 0;
    else {
      const crewModules = layout.filter((p) => ["sleep", "galley", "life"].includes(p.module.key));
      if (crewModules.length === 0) safetyScore = 60;
      else {
        const avg = crewModules.reduce((s, c) => s + manhattan(c, airlock), 0) / crewModules.length;
        safetyScore = Math.round(Math.max(0, 100 - (avg * 5)));
      }
    }
  }

  const w = weights;
  const softScore = resourceScore * w.resource + accessibilityScore * w.accessibility + adjacencyScore * w.adjacency + clusteringScore * w.clustering + safetyScore * w.safety;
  const normalizedSoft = Math.round(softScore / (w.resource + w.accessibility + w.adjacency + w.clustering + w.safety));
  let finalScore = normalizedSoft;
  if (hardViolations.length > 0) finalScore = Math.round(normalizedSoft * 0.35);
  finalScore = Math.max(0, Math.min(100, finalScore));

  const breakdown = {
    totalVolume,
    totalPower,
    resourceScore: Math.round(resourceScore),
    volumeRatio,
    powerRatio,
    adjacencyScore: Math.round(adjacencyScore),
    accessibilityScore,
    clusteringScore,
    safetyScore,
    normalizedSoft,
  };

  return { totalVolume, totalPower, hardViolations, breakdown, score: finalScore };
}