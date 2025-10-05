import React, { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Grid, Html } from "@react-three/drei";
import * as THREE from "three";

/** helpers **/
function gridToWorld(x, y, cols, rows, cellSize) {
  const worldX = (x - cols / 2 + 0.5) * cellSize;
  const worldZ = (y - rows / 2 + 0.5) * cellSize;
  const worldY = 0.45;
  return new THREE.Vector3(worldX, worldY, worldZ);
}
function worldToGrid(pos, cols, rows, cellSize) {
  const gx = Math.round(pos.x / cellSize + cols / 2 - 0.5);
  const gy = Math.round(pos.z / cellSize + rows / 2 - 0.5);
  return { x: Math.max(0, Math.min(cols - 1, gx)), y: Math.max(0, Math.min(rows - 1, gy)) };
}
function moduleSizeForRotation(module, rotation) {
  if (!rotation) return { w: module.w || 1, h: module.h || 1 };
  if (rotation % 2 === 1) return { w: module.h || 1, h: module.w || 1 };
  return { w: module.w || 1, h: module.h || 1 };
}
function isSpaceFree(layout, excludeId, x, y, w, h, cols, rows) {
  if (x < 0 || y < 0 || x + w > cols || y + h > rows) return false;
  for (let p of layout) {
    if (p.id === excludeId) continue;
    const pw = p.rotation % 2 === 1 ? (p.module.h || 1) : (p.module.w || 1);
    const ph = p.rotation % 2 === 1 ? (p.module.w || 1) : (p.module.h || 1);
    if (x < p.x + pw && p.x < x + w && y < p.y + ph && p.y < y + h) return false;
  }
  return true;
}

/** AnimatedBox: smooth movement + drag handling */
function AnimatedBox({ item, targetWorld, cols, rows, cellSize, isSelected, onSelect, onDragSnap, layout, sceneRotationY }) {
  const ref = useRef();
  const draggingRef = useRef(false);
  const ghostRef = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.position.set(targetWorld.x, targetWorld.y, targetWorld.z);
    ref.current.rotation.y = (item.rotation || 0) * (Math.PI / 2) + (sceneRotationY || 0);
  }, []); // init once

  useFrame((state, delta) => {
    if (!ref.current) return;
    const t = Math.min(1, 1 - Math.pow(0.001, delta));
    ref.current.position.lerp(new THREE.Vector3(targetWorld.x, targetWorld.y, targetWorld.z), t);
    const targetRot = (item.rotation || 0) * (Math.PI / 2) + (sceneRotationY || 0);
    ref.current.rotation.y += (targetRot - ref.current.rotation.y) * Math.min(1, t * 1.6);
  });

  const handlePointerDown = (e) => {
    e.stopPropagation();
    onSelect(item.id);
    draggingRef.current = true;
    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!draggingRef.current) return;
    const p = e.point;
    let px = p.x, pz = p.z;
    if (sceneRotationY) {
      const rot = -sceneRotationY;
      const cos = Math.cos(rot), sin = Math.sin(rot);
      px = p.x * cos - p.z * sin;
      pz = p.x * sin + p.z * cos;
    }
    const grid = worldToGrid(new THREE.Vector3(px, p.y, pz), cols, rows, cellSize);
    const { w, h } = moduleSizeForRotation(item.module, item.rotation || 0);
    const ok = isSpaceFree(layout, item.id, grid.x, grid.y, w, h, cols, rows);
    ghostRef.current = { x: grid.x, y: grid.y, ok };
    if (ref.current) ref.current.position.set(px, ref.current.position.y, pz);
  };

  const handlePointerUp = (e) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    try { e.target.releasePointerCapture(e.pointerId); } catch (err) {}
    const final = ref.current.position.clone();
    let fx = final.x, fz = final.z;
    if (sceneRotationY) {
      const rot = sceneRotationY;
      const cos = Math.cos(rot), sin = Math.sin(rot);
      const rx = fx * cos - fz * sin;
      const rz = fx * sin + fz * cos;
      fx = rx; fz = rz;
    }
    const { x, y } = worldToGrid(new THREE.Vector3(fx, final.y, fz), cols, rows, cellSize);
    const { w, h } = moduleSizeForRotation(item.module, item.rotation || 0);
    if (isSpaceFree(layout, item.id, x, y, w, h, cols, rows)) {
      onDragSnap(item.id, x, y);
    } else {
      const maxR = Math.max(cols, rows);
      let found = false;
      for (let r = 1; r <= maxR && !found; r++) {
        for (let dx = -r; dx <= r && !found; dx++) {
          for (let dy = -r; dy <= r && !found; dy++) {
            const nx = x + dx, ny = y + dy;
            if (isSpaceFree(layout, item.id, nx, ny, w, h, cols, rows)) {
              onDragSnap(item.id, nx, ny);
              found = true;
            }
          }
        }
      }
      if (!found) onDragSnap(item.id, item.x, item.y);
    }
    ghostRef.current = null;
  };

  const size = moduleSizeForRotation(item.module, item.rotation || 0);

  return (
    <>
      <mesh
        ref={ref}
        position={[targetWorld.x, targetWorld.y, targetWorld.z]}
        castShadow
        receiveShadow
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <boxGeometry args={[size.w, 0.9, size.h]} />
        <meshStandardMaterial color={isSelected ? "#ffd54d" : "#60a5fa"} />
        <Html center distanceFactor={6}>
          <div style={{ background: "rgba(255,255,255,0.95)", padding: 6, borderRadius: 6, fontSize: 12, color: "#000" }}>
            <div style={{ fontWeight: 700 }}>{item.module.name}</div>
            <div style={{ fontSize: 11 }}>{item.module.volume} m³ · {item.module.power} W</div>
          </div>
        </Html>
      </mesh>

      {ghostRef.current && (
        <mesh position={gridToWorld(ghostRef.current.x, ghostRef.current.y, cols, rows, cellSize).setY(0.45)}>
          <boxGeometry args={[size.w, 0.9, size.h]} />
          <meshStandardMaterial color={ghostRef.current.ok ? "rgba(34,197,94,0.35)" : "rgba(220,38,38,0.25)"} transparent />
        </mesh>
      )}
    </>
  );
}

/** Preview3D main component */
export default function Preview3D({
  layout = [],
  cols = 16,
  rows = 12,
  cellSize = 1,
  selectedId,
  setSelectedId,
  onUpdatePlacement,
  sceneRotationY = 0,
  panX = 0,
  panZ = 0,
  enableCameraControls = false,
}) {
  const targets = useMemo(() => {
    const map = {};
    layout.forEach((item) => {
      map[item.id] = gridToWorld(item.x, item.y, cols, rows, cellSize);
    });
    return map;
  }, [layout, cols, rows, cellSize]);

  const handleDragSnap = (id, x, y) => {
    onUpdatePlacement && onUpdatePlacement({ id, x, y });
    setSelectedId && setSelectedId(id);
  };

  const cameraPos = [cols / 2 + panX, Math.max(cols, rows), rows / 2 + panZ];

  return (
    <div style={{ width: "100%", height: "100%", minHeight: 360, borderRadius: 8, overflow: "hidden", position: "relative" }}>
      <Canvas
        shadows
        camera={{ position: cameraPos, fov: 50 }}
        gl={{ preserveDrawingBuffer: true, antialias: true, alpha: false }}
        onCreated={({ gl }) => {
          // mark canvas DOM element for selector
          try {
            const canvas = gl && gl.domElement ? gl.domElement : null;
            if (canvas && canvas.setAttribute) canvas.setAttribute("data-canvas", "preview3d");
          } catch (e) {
            // ignore
          }
        }}
      >
        <group rotation-y={sceneRotationY}>
          <ambientLight intensity={0.9} />
          <directionalLight position={[10, 20, 10]} intensity={0.6} castShadow />
          <mesh rotation-x={-Math.PI / 2} receiveShadow>
            <planeGeometry args={[cols * cellSize + 2, rows * cellSize + 2]} />
            <meshStandardMaterial color="#071127" />
          </mesh>

          <Grid args={[cols * cellSize, rows * cellSize]} cellSize={cellSize} sectionSize={1} infiniteGrid={false} position={[0, 0.01, 0]} />

          {layout.map((item) => (
            <AnimatedBox
              key={item.id}
              item={item}
              targetWorld={targets[item.id]}
              cols={cols}
              rows={rows}
              cellSize={cellSize}
              isSelected={selectedId === item.id}
              onSelect={(id) => setSelectedId && setSelectedId(id)}
              onDragSnap={handleDragSnap}
              layout={layout}
              sceneRotationY={sceneRotationY}
            />
          ))}
        </group>

        <OrbitControls makeDefault enablePan={enableCameraControls} enableRotate={enableCameraControls} enableZoom={enableCameraControls} />
      </Canvas>
    </div>
  );
}