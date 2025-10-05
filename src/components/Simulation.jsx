import React, { useEffect, useRef, useState } from "react";

const Simulation = ({ layout = [], cols=16, rows=12, cellSize=48, running }) => {
  const [heat, setHeat] = useState({});
  const raf = useRef(null);
  const avatars = useRef([]);

  useEffect(() => {
    const navbar = document.querySelector(".navbar"); // or #navbar
    if (navbar) navbar.style.display = "none";
    return () => {
      if (navbar) navbar.style.display = "";
    };
  }, []);

  useEffect(() => {
    avatars.current = [];
    const spawnPoints = layout.length ? layout : [];
    const count = Math.min(6, Math.max(2, Math.floor((spawnPoints.length || 1))));
    for (let i=0;i<count;i++) {
      const start = spawnPoints.length ? spawnPoints[Math.floor(Math.random()*spawnPoints.length)] : {x:0,y:0};
      avatars.current.push({ id: i, x: start.x, y: start.y, tx: start.x, ty: start.y });
    }
    setHeat({});
  }, [layout]);

  useEffect(() => {
    if (!running) {
      if (raf.current) cancelAnimationFrame(raf.current);
      return;
    }
    let last = performance.now();
    const step = (t) => {
      const dt = (t - last) / 1000;
      last = t;
      avatars.current.forEach(av => {
        if (Math.random() < 0.01 && layout.length) {
          const next = layout[Math.floor(Math.random()*layout.length)];
          av.tx = next.x; av.ty = next.y;
        }
        av.x += Math.sign(av.tx - av.x) * Math.min(0.5, Math.abs(av.tx - av.x));
        av.y += Math.sign(av.ty - av.y) * Math.min(0.5, Math.abs(av.ty - av.y));
        const key = `${Math.round(av.x)}-${Math.round(av.y)}`;
        setHeat(prev => ({...prev, [key]: (prev[key]||0)+1}));
      });
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return ()=> { if (raf.current) cancelAnimationFrame(raf.current); }
  }, [running, layout]);

  return (
    <div className="relative w-full h-full pointer-events-none">
      {Object.entries(heat).map(([k,v])=>{
        const [cx,cy] = k.split("-").map(Number);
        const left = cx * cellSize;
        const top = cy * cellSize;
        const alpha = Math.min(0.85, Math.log(1+v)/Math.log(10));
        const size = cellSize - 6;
        return <div key={k} className="heat" style={{
          left, top, width: size, height: size, background: `rgba(244,63,94,${alpha})`
        }} />;
      })}
      {avatars.current.map((av, i) => {
        const left = av.x * cellSize + (cellSize/2) - 9;
        const top = av.y * cellSize + (cellSize/2) - 9;
        return <div key={i} className="avatar absolute" style={{ left, top }} />;
      })}
    </div>
  );
};

export default Simulation;
