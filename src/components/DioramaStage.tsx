import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Lang, NeighborhoodData, SensoryLayerType } from '../types/index.ts';
import { CharacterAvatar } from './CharacterAvatar.tsx';

interface DioramaStageProps {
  neighborhood: NeighborhoodData;
  activeLayer: SensoryLayerType;
  onSelectLayer: (layer: SensoryLayerType) => void;
  lang?: Lang;
}

/**
 * Helper to build a detailed 3D Pingu model matching the claymation penguin reference image
 */
function create3DPingu(): THREE.Group {
  const pingu = new THREE.Group();

  const blackMat = new THREE.MeshStandardMaterial({ color: 0x1e242b, roughness: 0.65 });
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
  const yellowMat = new THREE.MeshStandardMaterial({ color: 0xf59f00, roughness: 0.5 });
  const redMat = new THREE.MeshStandardMaterial({ color: 0xff3b4e, roughness: 0.45 });
  const orangeMat = new THREE.MeshStandardMaterial({ color: 0xff7a1a, roughness: 0.55 });

  // Torso
  const torso = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 16), blackMat);
  torso.scale.set(0.95, 1.25, 0.85);
  torso.position.y = 0.34;
  torso.castShadow = true;
  pingu.add(torso);

  // Yellow Belly Ring
  const yellowBelly = new THREE.Mesh(new THREE.SphereGeometry(0.235, 16, 16), yellowMat);
  yellowBelly.scale.set(0.85, 1.12, 0.55);
  yellowBelly.position.set(0, 0.32, 0.12);
  pingu.add(yellowBelly);

  // White Belly
  const whiteBelly = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), whiteMat);
  whiteBelly.scale.set(0.8, 1.06, 0.55);
  whiteBelly.position.set(0, 0.32, 0.14);
  pingu.add(whiteBelly);

  // Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.21, 16, 16), blackMat);
  head.scale.set(1.05, 0.88, 0.95);
  head.position.y = 0.72;
  head.castShadow = true;
  pingu.add(head);

  // Eyes
  [-0.08, 0.08].forEach((ex) => {
    const eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.042, 10, 10), whiteMat);
    eyeWhite.position.set(ex, 0.75, 0.17);
    pingu.add(eyeWhite);

    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.024, 8, 8), blackMat);
    pupil.position.set(ex, 0.75, 0.2);
    pingu.add(pupil);
  });

  // Red Round Beak
  const beak = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 12), redMat);
  beak.scale.set(1.2, 0.75, 1.1);
  beak.position.set(0, 0.69, 0.21);
  pingu.add(beak);

  // Waving Right Wing (Viewer's left)
  const waveWing = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.24, 8, 8), blackMat);
  waveWing.position.set(-0.28, 0.56, 0.04);
  waveWing.rotation.z = 0.55;
  pingu.add(waveWing);

  // Resting Left Wing
  const restWing = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.24, 8, 8), blackMat);
  restWing.position.set(0.27, 0.36, 0);
  restWing.rotation.z = -0.35;
  pingu.add(restWing);

  // Flat Orange Feet
  [-0.11, 0.11].forEach((fx) => {
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.05, 0.22), orangeMat);
    foot.position.set(fx, 0.03, 0.06);
    pingu.add(foot);
  });

  return pingu;
}

/**
 * Helper to build a detailed 3D Gyodong (Hangyodon / 한교동) model matching the mint-aqua fish character reference image
 */
function create3DGyodong(): THREE.Group {
  const gyodong = new THREE.Group();

  const mintMat = new THREE.MeshStandardMaterial({ color: 0x8ce0e8, roughness: 0.55 });
  const finBlueMat = new THREE.MeshStandardMaterial({ color: 0x63b3ed, roughness: 0.55 });
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.45 });
  const blackMat = new THREE.MeshStandardMaterial({ color: 0x111315, roughness: 0.5 });
  const pinkLipsMat = new THREE.MeshStandardMaterial({ color: 0xf4a9c7, roughness: 0.5 });

  // Mint-Aqua Body + Head
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.24, 0.26, 14, 16), mintMat);
  body.position.y = 0.42;
  body.castShadow = true;
  gyodong.add(body);

  // Top Sky-Blue Fin
  const topFin = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 10), finBlueMat);
  topFin.scale.set(1.3, 1.1, 0.5);
  topFin.position.set(0, 0.81, 0);
  gyodong.add(topFin);

  // Left & Right Ear Fins
  [-0.26, 0.26].forEach((ex) => {
    const earFin = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 10), finBlueMat);
    earFin.scale.set(0.8, 1.1, 0.4);
    earFin.position.set(ex, 0.54, 0);
    gyodong.add(earFin);
  });

  // Big Twin White Googly Eyes
  [-0.095, 0.095].forEach((ex) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.092, 12, 12), whiteMat);
    eye.scale.set(1, 1, 0.65);
    eye.position.set(ex, 0.55, 0.19);
    gyodong.add(eye);

    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.032, 8, 8), blackMat);
    pupil.position.set(ex * 0.85, 0.55, 0.25);
    gyodong.add(pupil);
  });

  // Wide Chubby Pink Lips
  const lips = new THREE.Mesh(new THREE.CapsuleGeometry(0.052, 0.24, 8, 12), pinkLipsMat);
  lips.rotation.z = Math.PI / 2;
  lips.position.set(0, 0.39, 0.21);
  gyodong.add(lips);

  // Waving Hand ("넵!")
  const waveArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.16, 8, 8), mintMat);
  waveArm.position.set(0.27, 0.46, 0.08);
  waveArm.rotation.z = -0.65;
  gyodong.add(waveArm);

  return gyodong;
}

export const DioramaStage: React.FC<DioramaStageProps> = ({
  neighborhood,
  activeLayer,
  onSelectLayer,
  lang = 'ko',
}) => {
  const [rotationY, setRotationY] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(1);
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneStateRef = useRef<{
    targetRotY: number;
    targetZoom: number;
  }>({
    targetRotY: 0,
    targetZoom: 1,
  });

  const handleRotateLeft = () => setRotationY((prev) => prev - 45);
  const handleRotateRight = () => setRotationY((prev) => prev + 45);
  const handleResetView = () => {
    setRotationY(0);
    setZoom(1);
  };
  const handleZoomIn = () => setZoom((prev) => Math.min(1.35, +(prev + 0.15).toFixed(2)));
  const handleZoomOut = () => setZoom((prev) => Math.max(0.85, +(prev - 0.15).toFixed(2)));

  useEffect(() => {
    sceneStateRef.current.targetRotY = (rotationY * Math.PI) / 180;
    sceneStateRef.current.targetZoom = zoom;
  }, [rotationY, zoom]);

  // Build interactive Three.js Isometric Miniature Diorama inside the Stitch stage
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 380;
    const height = container.clientHeight || 330;

    const scene = new THREE.Scene();

    // Mood-aware pastel sky background
    const isGolden = neighborhood.cozinessPercent >= 88;
    scene.background = new THREE.Color(isGolden ? 0xfff5eb : 0xeef2f6);

    const aspect = width / height;
    const d = 5.2;
    const camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 0.1, 100);
    camera.position.set(8, 7.5, 8);
    camera.lookAt(0, 0.4, 0);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      container.innerHTML = '';
      container.appendChild(renderer.domElement);
    } catch {
      return;
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(
      isGolden ? 0xffe4c4 : 0xdbeafe,
      activeLayer === 'mood' ? 1.0 : 1.35
    );
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(isGolden ? 0xffa94d : 0xffffff, 1.5);
    sunLight.position.set(7, 11, 6);
    sunLight.castShadow = true;
    scene.add(sunLight);

    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    // Base Diorama Plinth (Wooden/Stone Isometric Block)
    const plinthGeo = new THREE.BoxGeometry(6.8, 0.7, 5.6);
    const plinthMat = new THREE.MeshStandardMaterial({
      color: 0xe6dfd5,
      roughness: 0.85,
    });
    const plinth = new THREE.Mesh(plinthGeo, plinthMat);
    plinth.position.y = -0.6;
    plinth.receiveShadow = true;
    worldGroup.add(plinth);

    // Sloped Hill Group based on neighborhood.inclineAngleDeg
    const slopeGroup = new THREE.Group();
    const rad = Math.min(22, Math.max(4, neighborhood.inclineAngleDeg)) * (Math.PI / 180);
    slopeGroup.rotation.z = rad * 0.85;
    worldGroup.add(slopeGroup);

    // Terraced Hill Ground
    const hillGeo = new THREE.BoxGeometry(6.4, 0.55, 5.2);
    const hillMat = new THREE.MeshStandardMaterial({
      color: activeLayer === 'incline' ? 0xfee2e2 : 0xf1f5f9,
      roughness: 0.8,
    });
    const hillMesh = new THREE.Mesh(hillGeo, hillMat);
    hillMesh.receiveShadow = true;
    slopeGroup.add(hillMesh);

    // Warm Alley Road running up the slope
    const roadGeo = new THREE.BoxGeometry(6.45, 0.08, 1.45);
    const roadMat = new THREE.MeshStandardMaterial({
      color: activeLayer === 'incline' ? 0xe03e52 : 0xcbd5e1,
      roughness: 0.75,
    });
    const roadMesh = new THREE.Mesh(roadGeo, roadMat);
    roadMesh.position.set(0, 0.29, 0.4);
    slopeGroup.add(roadMesh);

    // Cute Miniature Houses stepping up the hill
    const houseConfigs = [
      { x: -2.1, z: -1.1, w: 1.15, h: 1.25, d: 1.1, wall: 0xfffbeb, roof: 0xe88d67 },
      { x: -0.6, z: -1.2, w: 1.2, h: 1.6, d: 1.15, wall: 0xfef3c7, roof: 0xd97757 },
      { x: 1.0, z: -1.0, w: 1.25, h: 1.9, d: 1.2, wall: 0xf8fafc, roof: 0x64748b },
      { x: 2.3, z: -0.9, w: 1.1, h: 1.45, d: 1.1, wall: 0xffedd5, roof: 0xe07a5f },
      { x: -1.4, z: 1.65, w: 1.1, h: 1.15, d: 1.0, wall: 0xf1f5f9, roof: 0x94a3b8 },
      { x: 0.4, z: 1.7, w: 1.15, h: 1.3, d: 1.05, wall: 0xfef9c3, roof: 0xd97706 },
    ];

    houseConfigs.forEach((hc) => {
      const hGroup = new THREE.Group();
      const bodyGeo = new THREE.BoxGeometry(hc.w, hc.h, hc.d);
      const bodyMat = new THREE.MeshStandardMaterial({ color: hc.wall, roughness: 0.65 });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = hc.h / 2 + 0.28;
      body.castShadow = true;
      body.receiveShadow = true;
      hGroup.add(body);

      const roofGeo = new THREE.ConeGeometry(hc.w * 0.82, 0.55, 4);
      const roofMat = new THREE.MeshStandardMaterial({ color: hc.roof, roughness: 0.6 });
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.position.y = hc.h + 0.55;
      roof.rotation.y = Math.PI / 4;
      roof.castShadow = true;
      hGroup.add(roof);

      // Glowing Warm Window
      const winGeo = new THREE.BoxGeometry(0.28, 0.28, 0.05);
      const winMat = new THREE.MeshStandardMaterial({
        color: 0xffd43b,
        emissive: 0xf59f00,
        emissiveIntensity: activeLayer === 'mood' ? 1.4 : 0.75,
      });
      const win = new THREE.Mesh(winGeo, winMat);
      win.position.set(0, hc.h * 0.55 + 0.25, hc.d / 2 + 0.02);
      hGroup.add(win);

      hGroup.position.set(hc.x, 0, hc.z);
      slopeGroup.add(hGroup);
    });

    // Greenery / Forest Park Trees (scaled by greenWalkMinutes)
    const treesGroup = new THREE.Group();
    const treePositions = [
      { x: 2.1, z: 1.4, s: 1.15 },
      { x: 2.6, z: 0.8, s: 0.95 },
      { x: 1.6, z: 1.8, s: 1.0 },
      { x: -2.5, z: 1.4, s: 0.9 },
      { x: -0.2, z: -2.0, s: 1.05 },
      { x: 1.9, z: -2.0, s: 1.1 },
    ];
    treePositions.forEach((tp) => {
      const tGroup = new THREE.Group();
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.11, 0.45, 8),
        new THREE.MeshStandardMaterial({ color: 0x8d6e63 })
      );
      trunk.position.y = 0.5;
      tGroup.add(trunk);

      const foliageColor = activeLayer === 'greenery' ? 0x10b981 : 0x2f9e44;
      const crown = new THREE.Mesh(
        new THREE.SphereGeometry(0.42 * tp.s, 12, 12),
        new THREE.MeshStandardMaterial({
          color: foliageColor,
          emissive: activeLayer === 'greenery' ? 0x059669 : 0x000000,
          emissiveIntensity: activeLayer === 'greenery' ? 0.35 : 0,
          roughness: 0.7,
        })
      );
      crown.position.y = 0.95;
      crown.castShadow = true;
      tGroup.add(crown);

      tGroup.position.set(tp.x, 0, tp.z);
      treesGroup.add(tGroup);
    });
    slopeGroup.add(treesGroup);

    // Golden-Hour Streetlamps along the alley
    const lampsGroup = new THREE.Group();
    [-1.8, 0, 1.8].forEach((lx) => {
      const lGroup = new THREE.Group();
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.035, 0.045, 0.95, 8),
        new THREE.MeshStandardMaterial({ color: 0x334155 })
      );
      pole.position.y = 0.75;
      lGroup.add(pole);

      const bulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.13, 10, 10),
        new THREE.MeshStandardMaterial({
          color: 0xffe066,
          emissive: 0xf59f00,
          emissiveIntensity: activeLayer === 'mood' ? 1.8 : 1.1,
        })
      );
      bulb.position.y = 1.25;
      lGroup.add(bulb);

      lGroup.position.set(lx, 0, 0.95);
      lampsGroup.add(lGroup);
    });
    slopeGroup.add(lampsGroup);

    // Detailed 3D Pingu (핑구) & Gyodong (교동 / 한교동) exploring the sloped alley!
    const charGroup = new THREE.Group();

    const pinguModel = create3DPingu();
    pinguModel.scale.set(1.15, 1.15, 1.15);
    pinguModel.position.set(-0.55, 0.31, 0.42);
    pinguModel.rotation.y = 0.35;
    charGroup.add(pinguModel);

    const gyodongModel = create3DGyodong();
    gyodongModel.scale.set(1.15, 1.15, 1.15);
    gyodongModel.position.set(0.35, 0.31, 0.48);
    gyodongModel.rotation.y = -0.25;
    charGroup.add(gyodongModel);

    slopeGroup.add(charGroup);

    let frameId: number;
    let clock = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      clock += 0.03;

      // Smoothly interpolate rotation & zoom from React controls
      const targetRot = sceneStateRef.current.targetRotY;
      worldGroup.rotation.y += (targetRot + Math.sin(clock * 0.35) * 0.04 - worldGroup.rotation.y) * 0.1;

      const targetZ = sceneStateRef.current.targetZoom;
      camera.zoom += (targetZ - camera.zoom) * 0.12;
      camera.updateProjectionMatrix();

      // Cute waddle animation for Pingu & Gyodong
      pinguModel.position.y = 0.31 + Math.abs(Math.sin(clock * 2.2)) * 0.06;
      pinguModel.rotation.z = Math.sin(clock * 2.2) * 0.06;

      gyodongModel.position.y = 0.31 + Math.abs(Math.cos(clock * 2.2)) * 0.06;
      gyodongModel.rotation.z = Math.cos(clock * 2.2) * 0.05;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      renderer.dispose();
    };
  }, [
    neighborhood.id,
    neighborhood.inclineAngleDeg,
    neighborhood.cozinessPercent,
    neighborhood.greenWalkMinutes,
    activeLayer,
  ]);

  const layers: { id: SensoryLayerType; label: string; emoji?: string }[] = [
    { id: 'all', label: lang === 'ko' ? '전체' : 'All' },
    { id: 'incline', label: lang === 'ko' ? '경사도' : 'Slope', emoji: '⛰️' },
    { id: 'greenery', label: lang === 'ko' ? '녹지' : 'Greenery', emoji: '🌿' },
    { id: 'noise', label: lang === 'ko' ? '소음' : 'Noise', emoji: '🔊' },
    { id: 'mood', label: lang === 'ko' ? '무드' : 'Mood', emoji: '💡' },
  ];

  return (
    <section className="relative w-full">
      <div className="relative w-full h-[330px] rounded-3xl overflow-hidden bg-[#eef2f6] border border-[#e5e8eb] shadow-[0_8px_24px_rgba(25,31,40,0.05)]">
        {/* Live Three.js 3D Isometric Neighborhood Stage */}
        <div
          ref={mountRef}
          className="w-full h-full transition-transform duration-300 ease-out"
          aria-label={`${neighborhood.name} 3D 감각 디오라마`}
        />

        {/* Layer Visual Overlays depending on activeLayer */}
        {activeLayer === 'incline' && (
          <div className="absolute inset-0 bg-gradient-to-tr from-[#e03e52]/20 via-transparent to-transparent pointer-events-none flex items-center justify-center">
            <div className="px-3.5 py-2 rounded-2xl bg-black/75 backdrop-blur-md text-white text-xs font-bold flex items-center gap-2 shadow-lg animate-bounce">
              <span>⛰️</span>
              <span>
                {lang === 'ko'
                  ? `평균 경사각 ${neighborhood.inclineAngleDeg}° · 체감 경사 ${neighborhood.inclinePercent}%`
                  : `Avg Slope ${neighborhood.inclineAngleDeg}° · Perceived ${neighborhood.inclinePercent}%`}
              </span>
            </div>
          </div>
        )}

        {activeLayer === 'greenery' && (
          <div className="absolute inset-0 bg-gradient-to-t from-[#0ca678]/20 via-transparent to-transparent pointer-events-none flex items-center justify-center">
            <div className="px-3.5 py-2 rounded-2xl bg-[#0ca678]/90 backdrop-blur-md text-white text-xs font-bold flex items-center gap-2 shadow-lg">
              <span>🌿</span>
              <span>
                {lang === 'ko'
                  ? `산책로 및 숲세권 도보 ${neighborhood.greenWalkMinutes}분 연결`
                  : `${neighborhood.greenWalkMinutes} min walk to forest trail`}
              </span>
            </div>
          </div>
        )}

        {activeLayer === 'noise' && (
          <div className="absolute inset-0 bg-gradient-to-b from-[#3182f6]/20 via-transparent to-transparent pointer-events-none flex items-center justify-center">
            <div className="px-3.5 py-2 rounded-2xl bg-[#3182f6]/90 backdrop-blur-md text-white text-xs font-bold flex items-center gap-2 shadow-lg">
              <span>🔊</span>
              <span>
                {lang === 'ko'
                  ? `실측 생활 소음 ${neighborhood.noiseDb}dB · 정온 구역`
                  : `Measured Noise ${neighborhood.noiseDb}dB · Quiet Zone`}
              </span>
            </div>
          </div>
        )}

        {activeLayer === 'mood' && (
          <div className="absolute inset-0 bg-amber-500/20 mix-blend-Multiply pointer-events-none flex items-center justify-center">
            <div className="px-3.5 py-2 rounded-2xl bg-amber-600/90 backdrop-blur-md text-white text-xs font-bold flex items-center gap-2 shadow-lg">
              <span>💡</span>
              <span>
                {lang === 'ko'
                  ? `${neighborhood.timeContext} 골목 아늑함 지수 ${neighborhood.cozinessPercent}%`
                  : `${neighborhood.timeContext} Alley Coziness ${neighborhood.cozinessPercent}%`}
              </span>
            </div>
          </div>
        )}

        {/* Subtle Top/Bottom Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/30 pointer-events-none" />

        {/* Top Left Live Status Badge + Pingu & Gyodong Duo Pill */}
        <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3182f6] animate-pulse" />
            <span className="text-[11px] font-bold text-[#191f28] tracking-tight">
              3D DIORAMA
            </span>
          </div>
          <div className="flex items-center gap-1 pl-1 pr-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-md shadow-xs border border-[#edf0f3]">
            <CharacterAvatar character="pingu" size={20} />
            <CharacterAvatar character="gyodong" size={20} />
            <span className="text-[10px] font-extrabold text-[#191f28]">
              {lang === 'ko' ? '핑구 & 교동' : 'Pingu & Gyodong'}
            </span>
          </div>
        </div>

        {/* Top Right Zoom Controls */}
        <div className="absolute top-3.5 right-3.5 flex items-center gap-1 bg-white/90 backdrop-blur-md p-1 rounded-full shadow-xs">
          <button
            type="button"
            aria-label={lang === 'ko' ? '축소' : 'Zoom out'}
            onClick={handleZoomOut}
            className="w-6 h-6 rounded-full flex items-center justify-center text-[#191f28] hover:bg-black/5 active:scale-90 transition-all text-xs font-bold"
          >
            -
          </button>
          <button
            type="button"
            aria-label={lang === 'ko' ? '확대' : 'Zoom in'}
            onClick={handleZoomIn}
            className="w-6 h-6 rounded-full flex items-center justify-center text-[#191f28] hover:bg-black/5 active:scale-90 transition-all text-xs font-bold"
          >
            +
          </button>
        </div>

        {/* SVG Sensory Layer Markers */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 330">
          {(activeLayer === 'all' || activeLayer === 'incline') && (
            <>
              <path
                d="M 55 245 Q 190 195 325 110"
                fill="none"
                stroke="#e03e52"
                strokeDasharray="5 4"
                strokeLinecap="round"
                strokeWidth="2.5"
              />
              <circle cx="55" cy="245" fill="#e03e52" r="4" />
              <circle cx="325" cy="110" fill="#e03e52" r="5" stroke="white" strokeWidth="1.5" />
            </>
          )}

          {(activeLayer === 'all' || activeLayer === 'greenery') && (
            <g transform="translate(270, 95)">
              <circle cx="0" cy="0" r="12" fill="#0ca678" fillOpacity="0.25" />
              <circle cx="0" cy="0" r="5" fill="#0ca678" stroke="white" strokeWidth="1.5" />
            </g>
          )}

          {(activeLayer === 'all' || activeLayer === 'noise') && (
            <g transform="translate(150, 200)">
              <circle cx="0" cy="0" r="14" fill="#3182f6" fillOpacity="0.2" />
              <circle cx="0" cy="0" r="5" fill="#3182f6" stroke="white" strokeWidth="1.5" />
            </g>
          )}
        </svg>

        {/* Bottom Overlay Controls inside Stage */}
        <div className="absolute bottom-3.5 inset-x-3.5 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleRotateLeft}
              className="px-2.5 py-1.5 rounded-full bg-black/55 backdrop-blur-md text-white text-[11px] font-medium flex items-center gap-1 hover:bg-black/70 active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">rotate_left</span>
              <span>-45°</span>
            </button>
            <button
              type="button"
              onClick={handleResetView}
              className="px-2.5 py-1.5 rounded-full bg-black/55 backdrop-blur-md text-white text-[11px] font-medium flex items-center gap-1 hover:bg-black/70 active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">360</span>
              <span>
                {rotationY === 0 && zoom === 1
                  ? '360°'
                  : lang === 'ko'
                    ? '초기화'
                    : 'Reset'}
              </span>
            </button>
            <button
              type="button"
              onClick={handleRotateRight}
              className="px-2.5 py-1.5 rounded-full bg-black/55 backdrop-blur-md text-white text-[11px] font-medium flex items-center gap-1 hover:bg-black/70 active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">rotate_right</span>
              <span>+45°</span>
            </button>
          </div>

          <div className="px-2.5 py-1 rounded-full bg-[#e03e52]/90 backdrop-blur-md text-white text-[11px] font-bold shadow-xs">
            {lang === 'ko'
              ? `경사 ${neighborhood.inclineAngleDeg}°`
              : `Slope ${neighborhood.inclineAngleDeg}°`}
          </div>
        </div>
      </div>

      {/* Sensory Layer Filter Pills */}
      <div
        className="flex items-center gap-1.5 mt-3 overflow-x-auto no-scrollbar pb-0.5"
        role="tablist"
        aria-label={lang === 'ko' ? '감각 레이어 필터' : 'Sensory layer filter'}
      >
        {layers.map((layer) => {
          const isActive = activeLayer === layer.id;
          return (
            <button
              key={layer.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelectLayer(layer.id)}
              className={`px-3 py-1.5 rounded-full text-[12px] font-semibold flex items-center gap-1 whitespace-nowrap active:scale-95 transition-all cursor-pointer focus:outline-none ${
                isActive
                  ? 'bg-[#191f28] text-white font-bold shadow-xs'
                  : 'bg-white text-[#4e5968] border border-[#edf0f3] hover:bg-[#f2f4f6]'
              }`}
            >
              {layer.emoji && <span>{layer.emoji}</span>}
              <span>{layer.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
