export function calculateScore(layout, constraints = { maxVolume: 600, maxPower: 300 }) {
  const totalVolume = layout.reduce((s, l) => s + (l.module.volume || 0), 0);
  const totalPower = layout.reduce((s, l) => s + (l.module.power || 0), 0);

  let score = 100;
  if (totalVolume > constraints.maxVolume) {
    const ratio = totalVolume / constraints.maxVolume;
    score -= 30 * (ratio - 1);
  }
  if (totalPower > constraints.maxPower) {
    const ratio = totalPower / constraints.maxPower;
    score -= 30 * (ratio - 1);
  }

  const bigModules = layout.filter((l) => (l.module.volume || 0) > 10).length;
  if (bigModules > 3) score -= 10;

  if (score < 0) score = 0;
  return Math.round(score);
}