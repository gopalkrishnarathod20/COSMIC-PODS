// utils.js

/**
 * Volume Calculations
 */
export function computeVolume(shape, params) {
  switch (shape) {
    case "cylinder": {
      const { radius, height } = params;
      return Math.PI * radius * radius * height;
    }
    case "dome": {
      const { radius } = params;
      return (2 / 3) * Math.PI * Math.pow(radius, 3); // hemisphere
    }
    case "toroid": {
      const { majorRadius, minorRadius } = params;
      return 2 * Math.PI * majorRadius * Math.PI * Math.pow(minorRadius, 2);
    }
    default:
      return 0;
  }
}

/**
 * Format Volume into readable string
 */
export function formatVolume(volume) {
  if (!volume || isNaN(volume)) return "0 m³";

  if (volume >= 1e9) {
    return (volume / 1e9).toFixed(2) + " km³";
  } else if (volume >= 1e6) {
    return (volume / 1e6).toFixed(2) + " Mm³";
  } else if (volume >= 1e3) {
    return (volume / 1e3).toFixed(2) + " km³ (small)";
  } else {
    return volume.toFixed(2) + " m³";
  }
}

/**
 * Habitat Scoring System
 */
export function evaluateHabitat(components, totalVolume) {
  let score = 100;
  let messages = [];

  const requiredModules = ["sleep", "medical", "lifeSupport"];
  requiredModules.forEach((mod) => {
    if (!components.some((c) => c.type === mod)) {
      score -= 20;
      messages.push(`Missing required module: ${mod}`);
    }
  });

  const usedVolume = components.reduce((sum, c) => sum + (c.volume || 0), 0);
  if (usedVolume > totalVolume) {
    score -= 30;
    messages.push("Habitat over capacity! Too many modules.");
  } else if (usedVolume < totalVolume * 0.3) {
    score -= 10;
    messages.push("Large unused space → inefficient design.");
  }

  const hasBadPlacement = components.some(
    (c) =>
      c.type === "sleep" &&
      components.some((other) => other.type === "exercise" && isNear(c, other))
  );
  if (hasBadPlacement) {
    score -= 15;
    messages.push("Sleeping quarters too close to exercise area (noise issue).");
  }

  const lifeSupport = components.find((c) => c.type === "lifeSupport");
  if (lifeSupport && lifeSupport.capacity < components.length) {
    score -= 25;
    messages.push("Life support under capacity for crew size.");
  }

  return { score: Math.max(0, score), messages };
}

function isNear(a, b, threshold = 2) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy) < threshold;
}

export function generateMission() {
  const durations = ["3-month", "6-month", "1-year"];
  const locations = ["Mars surface", "Lunar base", "Deep space"];
  const crewSizes = [2, 4, 6];

  const duration = durations[Math.floor(Math.random() * durations.length)];
  const location = locations[Math.floor(Math.random() * locations.length)];
  const crew = crewSizes[Math.floor(Math.random() * crewSizes.length)];

  return {
    mission: `Design a ${duration} habitat for ${crew} crew members on the ${location}.`,
    constraints: {
      crew,
      duration,
      powerLimit: Math.random() > 0.5 ? 100 : 200,
    },
  };
}
