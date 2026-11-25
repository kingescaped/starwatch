import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Text, View } from 'react-native';
import { AppIcon } from '../../design-system/icons/AppIcon';
import { useTheme } from '../../design-system/theme/ThemeContext';
import { FONT_FAMILIES } from '../../design-system/tokens/typography';
import { useAppState } from '../../state/AppStateContext';
import { buildSkySceneGroup, type ProjectedAnchor } from './sky3d/skyThreeBuilder';

interface SkyThreeCanvasProps {
  mode: 'ground3d' | 'sphere3d';
  height: number;
}

export function SkyThreeCanvas({ mode, height }: SkyThreeCanvasProps) {
  const { mode: themeMode, colors } = useTheme();
  const { skyScene, skyZoom, skyAutoRotate, skyDragTool, skyRotationOffset, selectedTarget, currentForecast } = useAppState();
  const mountRef = useRef<HTMLDivElement | null>(null);
  const labelElsRef = useRef<Record<string, HTMLDivElement | null>>({});
  const [anchors, setAnchors] = useState<ProjectedAnchor[]>([]);
  const [webglError, setWebglError] = useState(false);

  const dragRef = useRef<{ active: boolean; x: number; y: number }>({ active: false, x: 0, y: 0 });
  const rotRef = useRef({ yaw: 0.08, pitch: mode === 'ground3d' ? 0.24 : 0.16 });
  const panRef = useRef({ x: 0, y: 0 });
  const zoomRef = useRef(skyZoom);
  const autoRotateRef = useRef(skyAutoRotate);
  const dragToolRef = useRef(skyDragTool);

  useEffect(() => { zoomRef.current = skyZoom; }, [skyZoom]);
  useEffect(() => { autoRotateRef.current = skyAutoRotate; }, [skyAutoRotate]);
  useEffect(() => { dragToolRef.current = skyDragTool; }, [skyDragTool]);
  useEffect(() => {
    if (skyRotationOffset === 0) {
      rotRef.current = { yaw: 0.08, pitch: mode === 'ground3d' ? 0.24 : 0.16 };
      panRef.current = { x: 0, y: 0 };
    }
  }, [skyRotationOffset, mode]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      setWebglError(true);
      return;
    }

    const width = container.clientWidth || 520;
    const h = container.clientHeight || height;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, h);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(mode === 'ground3d' ? 54 : 46, width / h, 0.1, 100);
    const { group, starMat, anchors: builtAnchors } = buildSkySceneGroup(
      mode,
      skyScene,
      selectedTarget.shortName,
      themeMode === 'red'
    );
    scene.add(group);
    setAnchors(builtAnchors);

    const resizeObs = new ResizeObserver(() => {
      const nw = container.clientWidth || width;
      const nh = container.clientHeight || height;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    });
    resizeObs.observe(container);

    let rafId = 0;
    const clock = new THREE.Clock();
    const tempVec = new THREE.Vector3();

    const renderLoop = () => {
      rafId = requestAnimationFrame(renderLoop);
      starMat.uniforms.uTime.value = clock.getElapsedTime();
      starMat.uniforms.uZoom.value = zoomRef.current;

      if (autoRotateRef.current && !dragRef.current.active) {
        rotRef.current.yaw += 0.004;
      }

      if (mode === 'ground3d') {
        camera.fov = Math.max(22, Math.min(76, 56 / zoomRef.current));
        camera.updateProjectionMatrix();
        camera.position.set(panRef.current.x, 1.35 + panRef.current.y * 0.4, 3.9);
        camera.lookAt(panRef.current.x, 0.72 + panRef.current.y * 0.2, -0.5);
        group.rotation.y = rotRef.current.yaw;
        group.rotation.x = Math.max(-0.2, Math.min(0.42, rotRef.current.pitch - 0.24));
      } else {
        camera.position.set(panRef.current.x, panRef.current.y, 4.9 / Math.max(0.6, zoomRef.current));
        camera.lookAt(panRef.current.x, panRef.current.y, 0);
        group.rotation.y = rotRef.current.yaw;
        group.rotation.x = Math.max(-0.85, Math.min(0.85, rotRef.current.pitch));
      }

      group.updateMatrixWorld();
      renderer.render(scene, camera);

      const cw = container.clientWidth || width;
      const ch = container.clientHeight || h;
      for (const anchor of builtAnchors) {
        const el = labelElsRef.current[anchor.id];
        if (!el) continue;
        tempVec.copy(anchor.worldPos).applyMatrix4(group.matrixWorld).project(camera);
        if (tempVec.z > 1 || tempVec.z < -1) {
          el.style.opacity = '0';
        } else {
          const sx = (tempVec.x * 0.5 + 0.5) * cw;
          const sy = (-tempVec.y * 0.5 + 0.5) * ch;
          el.style.opacity = '1';
          el.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, 0) translate(-50%, -50%)`;
        }
      }
    };
    renderLoop();

    return () => {
      cancelAnimationFrame(rafId);
      resizeObs.disconnect();
      renderer.dispose();
    };
  }, [mode, height, skyScene, selectedTarget.shortName, themeMode]);

  const bg = themeMode === 'red' ? '#090101' : themeMode === 'light' ? '#0C1428' : '#050A17';
  const badgeText = mode === 'ground3d' ? '3D MẶT ĐẤT · FOV 68°' : 'QUẢ CẦU 360° · ORBITAL';

  if (webglError) return null;

  return (
    <View
      style={{
        height,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.borderSubtle,
        backgroundColor: bg,
      }}
    >
      <div
        ref={mountRef}
        onPointerDown={(e) => {
          dragRef.current = { active: true, x: e.clientX, y: e.clientY };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!dragRef.current.active) return;
          const dx = e.clientX - dragRef.current.x;
          const dy = e.clientY - dragRef.current.y;
          dragRef.current.x = e.clientX;
          dragRef.current.y = e.clientY;
          if (dragToolRef.current === 'pan' || e.shiftKey || e.buttons === 2) {
            panRef.current.x = Math.max(-1.6, Math.min(1.6, panRef.current.x - dx * 0.005));
            panRef.current.y = Math.max(-1.0, Math.min(1.0, panRef.current.y + dy * 0.005));
          } else {
            rotRef.current.yaw += dx * 0.007;
            rotRef.current.pitch = Math.max(-0.85, Math.min(0.85, rotRef.current.pitch + dy * 0.005));
          }
        }}
        onPointerUp={() => { dragRef.current.active = false; }}
        onPointerCancel={() => { dragRef.current.active = false; }}
        style={{ width: '100%', height: '100%', cursor: skyDragTool === 'pan' ? 'move' : 'grab', touchAction: 'none' }}
      />

      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {anchors.map((a) => (
          <div
            key={a.id}
            ref={(el) => { labelElsRef.current[a.id] = el; }}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              color: a.color,
              fontSize: 10,
              fontWeight: 600,
              fontFamily: 'JetBrains Mono, monospace',
              textShadow: '0 1px 6px rgba(0,0,0,0.9)',
              whiteSpace: 'nowrap',
            }}
          >
            {a.label}
          </div>
        ))}
      </div>

      <View pointerEvents="none" style={{ position: 'absolute', left: 12, right: 12, top: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 999,
            backgroundColor: 'rgba(6, 12, 26, 0.84)',
            borderWidth: 1,
            borderColor: mode === 'ground3d' ? colors.accentEmeraldBorder : colors.accentCyanBorder,
          }}
        >
          <View style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: mode === 'ground3d' ? colors.accentEmerald : colors.accentCyan }} />
          <Text style={{ fontSize: 10, fontFamily: FONT_FAMILIES.monoBold, color: mode === 'ground3d' ? colors.accentEmerald : colors.accentCyan }}>
            {badgeText}
          </Text>
        </View>

        {mode === 'ground3d' ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 999,
              backgroundColor: 'rgba(42, 28, 6, 0.85)',
              borderWidth: 1,
              borderColor: colors.accentAmberBorder,
            }}
          >
            <AppIcon name="crown" size={11} color={colors.accentAmber} />
            <Text style={{ fontSize: 10, fontFamily: FONT_FAMILIES.monoBold, color: colors.accentAmber }}>
              PRO 3D · {currentForecast.hour}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}
