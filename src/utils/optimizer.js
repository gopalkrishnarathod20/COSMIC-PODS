import { evaluateLayout } from "./scoringDetailed";

export function attemptOptimize(initialLayout, { cols = 16, rows = 12, iterations = 800, evaluateOptions = {} } = {}) {
  let current = initialLayout.map((p) => ({ ...p }));
  let best = current.map((p) => ({ ...p }));
  let bestEval = evaluateLayout(best, { cols, rows, ...evaluateOptions });
  let bestScore = bestEval.score;

  const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  for (let i = 0; i < iterations; i++) {
    const newLayout = best.map((p) => ({ ...p }));
    if (newLayout.length === 0) break;
    if (Math.random() < 0.6) {
      const idx = randInt(0, newLayout.length - 1);
      let tries = 0;
      let placed = false;
      while (!placed && tries < 40) {
        const nx = randInt(0, cols - 1);
        const ny = randInt(0, rows - 1);
        const module = newLayout[idx].module;
        if (nx + (module.w ?? 1) > cols || ny + (module.h ?? 1) > rows) { tries++; continue; }
        const overlap = newLayout.some((p, j) => {
          if (j === idx) return false;
          const px1 = p.x, py1 = p.y, px2 = px1 + (p.module.w ?? 1), py2 = py1 + (p.module.h ?? 1);
          const nx1 = nx, ny1 = ny, nx2 = nx1 + (module.w ?? 1), ny2 = ny1 + (module.h ?? 1);
          return nx1 < px2 && px1 < nx2 && ny1 < py2 && py1 < ny2;
        });
        if (!overlap) {
          newLayout[idx].x = nx;
          newLayout[idx].y = ny;
          placed = true;
        } else tries++;
      }
    } else {
      if (newLayout.length >= 2) {
        const i1 = randInt(0, newLayout.length - 1);
        let i2 = randInt(0, newLayout.length - 1);
        let attempts = 0;
        while (i2 === i1 && attempts++ < 12) i2 = randInt(0, newLayout.length - 1);
        const a = newLayout[i1], b = newLayout[i2];
        const tmpx = a.x, tmpy = a.y;
        a.x = b.x; a.y = b.y;
        b.x = tmpx; b.y = tmpy;
      }
    }

    const evalNew = evaluateLayout(newLayout, { cols, rows, ...evaluateOptions });
    if (evalNew.score >= bestScore) {
      bestScore = evalNew.score;
      best = newLayout.map((p) => ({ ...p }));
    }
  }

  return { bestLayout: best, bestScore };
}