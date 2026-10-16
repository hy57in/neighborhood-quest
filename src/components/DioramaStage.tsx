import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Button } from '@comwit/ui';
import {
  RotateCcwIcon,
  SunIcon,
  MoonIcon,
  SparklesIcon,
  CompassIcon,
  ShieldCheckIcon,
} from '@comwit/ui/icons';
import { Lang, NeighborhoodData, SensoryLayerType } from '../types/index.ts';
import type { BuildingSpec, TreeSpec } from '../types.ts';
import { CharacterAvatar } from './CharacterAvatar.tsx';

interface DioramaStageProps {
  neighborhood: NeighborhoodData;
  activeLayer: SensoryLayerType;
  onSelectLayer: (layer: SensoryLayerType) => void;
  lang?: Lang;
}

/**
 * Detailed 3D Pingu model (claymation penguin)
 */
function create3DPingu(): THREE.Group {
  const pingu = new THREE.Group();

  const blackMat = new THREE.MeshStandardMaterial({ color: 0x1e242b, roughness: 0.65 });
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
  const yellowMat = new THREE.MeshStandardMaterial({ color: 0xf59f00, roughness: 0.5 });
  const redMat = new THREE.MeshStandardMaterial({ color: 0xff3b4e, roughness: 0.45 });
  const orangeMat = new THREE.MeshStandardMaterial({ color: 0xff7a1a, roughness: 0.55 });

  const torso = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 16), blackMat);
  torso.scale.set(0.95, 1.25, 0.85);
  torso.position.y = 0.34;
  torso.castShadow = true;
  pingu.add(torso);

  const yellowBelly = new THREE.Mesh(new THREE.SphereGeometry(0.235, 16, 16), yellowMat);
  yellowBelly.scale.set(0.85, 1.12, 0.55);
  yellowBelly.position.set(0, 0.32, 0.12);
  pingu.add(yellowBelly);

  const whiteBelly = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), whiteMat);
  whiteBelly.scale.set(0.8, 1.06, 0.55);
  whiteBelly.position.set(0, 0.32, 0.14);
  pingu.add(whiteBelly);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.21, 16, 16), blackMat);
  head.scale.set(1.05, 0.88, 0.95);
  head.position.y = 0.72;
  head.castShadow = true;
  pingu.add(head);

  [-0.08, 0.08].forEach((ex) => {
    const eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.042, 10, 10), whiteMat);
    eyeWhite.position.set(ex, 0.75, 0.17);
    pingu.add(eyeWhite);

    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.024, 8, 8), blackMat);
    pupil.position.set(ex, 0.75, 0.2);
    pingu.add(pupil);
  });

  const beak = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 12), redMat);
  beak.scale.set(1.2, 0.75, 1.1);
  beak.position.set(0, 0.69, 0.21);
  pingu.add(beak);

  const waveWing = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.24, 8, 8), blackMat);
  waveWing.position.set(-0.28, 0.56, 0.04);
  waveWing.rotation.z = 0.55;
  pingu.add(waveWing);

  const restWing = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.24, 8, 8), blackMat);
  restWing.position.set(0.27, 0.36, 0);
  restWing.rotation.z = -0.35;
  pingu.add(restWing);

  [-0.11, 0.11].forEach((fx) => {
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.05, 0.22), orangeMat);
    foot.position.set(fx, 0.03, 0.06);
    pingu.add(foot);
  });

  return pingu;
}

/**
 * Detailed 3D Gyodong (Hangyodon) model
 */
function create3DGyodong(): THREE.Group {
  const gyodong = new THREE.Group();

  const mintMat = new THREE.MeshStandardMaterial({ color: 0x8ce0e8, roughness: 0.55 });
  const finBlueMat = new THREE.MeshStandardMaterial({ color: 0x63b3ed, roughness: 0.55 });
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.45 });
  const blackMat = new THREE.MeshStandardMaterial({ color: 0x111315, roughness: 0.5 });
  const pinkLipsMat = new THREE.MeshStandardMaterial({ color: 0xf4a9c7, roughness: 0.5 });

  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.24, 0.26, 14, 16), mintMat);
  body.position.y = 0.42;
  body.castShadow = true;
  gyodong.add(body);

  const topFin = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 10), finBlueMat);
  topFin.scale.set(1.3, 1.1, 0.5);
  topFin.position.set(0, 0.81, 0);
  gyodong.add(topFin);

  [-0.26, 0.26].forEach((ex) => {
    const earFin = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 10), finBlueMat);
    earFin.scale.set(0.8, 1.1, 0.4);
    earFin.position.set(ex, 0.54, 0);
    gyodong.add(earFin);
  });

  [-0.085, 0.085].forEach((ex) => {
    const eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 12), whiteMat);
    eyeWhite.scale.set(0.95, 1.1, 0.65);
    eyeWhite.position.set(ex, 0.56, 0.2);
    gyodong.add(eyeWhite);

    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.032, 10, 10), blackMat);
    pupil.position.set(ex * 0.92, 0.56, 0.245);
    gyodong.add(pupil);
  });

  const lips = new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 12), pinkLipsMat);
  lips.scale.set(1.35, 0.72, 0.85);
  lips.position.set(0, 0.43, 0.21);
  gyodong.add(lips);

  [-0.23, 0.23].forEach((ax, idx) => {
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.14, 8, 8), mintMat);
    arm.position.set(ax, 0.36, 0.08);
    arm.rotation.z = idx === 0 ? 0.35 : -0.35;
    gyodong.add(arm);
  });

  [-0.095, 0.095].forEach((lx) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.065, 0.14, 10), mintMat);
    leg.position.set(lx, 0.07, 0.02);
    gyodong.add(leg);
  });

  return gyodong;
}

/**
 * Reconstructs a real 3D Photo-Depth Relief Mesh + 3D Textured Photo Frame
 * directly from the user's attached image (data URL or SVG URL).
 */
function buildImageTo3DReliefGroup(
  imageUrl: string,
  targetGroup: THREE.Group,
  onComplete: () => void
) {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    try {
      const cols = 56;
      const rows = 34;
      const canvas = document.createElement('canvas');
      canvas.width = cols;
      canvas.height = rows;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0, cols, rows);
      const imgData = ctx.getImageData(0, 0, cols, rows).data;

      // 1. Curved 3D Photo-Depth Relief Backdrop on North Edge of the Island
      const geo = new THREE.PlaneGeometry(9.2, 3.8, cols - 1, rows - 1);
      const posAttr = geo.attributes.position;
      const colors: number[] = [];

      for (let i = 0; i < posAttr.count; i++) {
        const ix = i % cols;
        const iy = Math.floor(i / cols);
        const pIdx = (iy * cols + ix) * 4;
        const r = imgData[pIdx] / 255;
        const g = imgData[pIdx + 1] / 255;
        const b = imgData[pIdx + 2] / 255;

        // Compute depth from luminance & vertical horizon position so buildings & hills pop out in 3D
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        const vRatio = iy / rows; // 0 = top sky, 1 = bottom foreground
        const structuralPop = vRatio > 0.25 && vRatio < 0.85 ? (1 - Math.abs(lum - 0.55)) * 0.65 : 0.12;
        const curveZ = -Math.pow((ix / cols - 0.5) * 2, 2) * 0.55;

        posAttr.setZ(i, structuralPop + curveZ);
        colors.push(r, g, b);
      }

      geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      geo.computeVertexNormals();

      const reliefMat = new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.45,
        metalness: 0.08,
        side: THREE.DoubleSide,
      });

      const reliefMesh = new THREE.Mesh(geo, reliefMat);
      reliefMesh.position.set(0, 2.35, -4.35);
      reliefMesh.castShadow = true;
      reliefMesh.receiveShadow = true;
      targetGroup.add(reliefMesh);

      // 2. 3D Voxelized Foreground Columns sampled from lower half of the attached image
      const voxelGroup = new THREE.Group();
      const boxGeo = new THREE.BoxGeometry(0.24, 1, 0.24);
      for (let vx = 4; vx < cols - 4; vx += 3) {
        const sampleY = Math.floor(rows * 0.52);
        const pIdx = (sampleY * cols + vx) * 4;
        const r = imgData[pIdx];
        const g = imgData[pIdx + 1];
        const b = imgData[pIdx + 2];
        const lum = (r + g + b) / (3 * 255);
        const h = 0.45 + lum * 1.45;

        const vMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(`rgb(${r},${g},${b})`),
          roughness: 0.5,
        });
        const colMesh = new THREE.Mesh(boxGeo, vMat);
        colMesh.scale.y = h;
        colMesh.position.set(((vx / cols) - 0.5) * 8.6, 0.45 + h / 2, -3.75);
        colMesh.castShadow = true;
        voxelGroup.add(colMesh);
      }
      targetGroup.add(voxelGroup);

      onComplete();
    } catch {
      // Ignore canvas taint if external CORS image
    }
  };
  img.src = imageUrl;
}

export const DioramaStage: React.FC<DioramaStageProps> = ({
  neighborhood,
  activeLayer,
  onSelectLayer,
  lang = 'ko',
}) => {
  const [timeMode, setTimeMode] = useState<'golden' | 'night'>('golden');
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [showPhotoRelief, setShowPhotoRelief] = useState<boolean>(true);
  const mountRef = useRef<HTMLDivElement | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  const blueprint = neighborhood.blueprint;
  const liq = neighborhood.liquidity;
  const slopeDeg = blueprint?.terrain.slopeDegrees ?? neighborhood.inclineAngleDeg ?? 8;
  const hasStairs =
    blueprint?.terrain.hasHillsideStairs ?? neighborhood.inclinePercent >= 50;
  const hasWater =
    blueprint?.terrain.hasRiverOrLake ??
    (neighborhood.tags.some((t) => t.includes('한강') || t.includes('강') || t.includes('호수')) ||
      neighborhood.name.includes('옥수') ||
      neighborhood.name.includes('한강') ||
      neighborhood.name.includes('잠실') ||
      neighborhood.name.includes('성수'));

  const primaryPhotoUrl =
    neighborhood.photos?.[0]?.url || neighborhood.dioramaImageUrl;

  useEffect(() => {
    if (blueprint?.timeOfDay === 'twilight') {
      setTimeMode('night');
    } else {
      setTimeMode('golden');
    }
  }, [blueprint?.timeOfDay, neighborhood.id]);

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
      controlsRef.current.autoRotateSpeed = 1.2;
    }
  }, [autoRotate]);

  const handleResetCamera = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(10.2, 7.8, 10.8);
      controlsRef.current.target.set(0, 1.1, 0);
      controlsRef.current.update();
    }
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 720;
    const height = container.clientHeight || 420;

    const scene = new THREE.Scene();
    const isNight = timeMode === 'night';

    const bgHex = isNight ? 0x0b1120 : 0x182238;
    scene.background = new THREE.Color(bgHex);
    scene.fog = new THREE.FogExp2(bgHex, 0.022);

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 120);
    camera.position.set(10.2, 7.8, 10.8);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.touchAction = 'none';
    renderer.domElement.style.cursor = 'grab';
    renderer.domElement.style.display = 'block';

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.minDistance = 6.0;
    controls.maxDistance = 24;
    controls.maxPolarAngle = Math.PI / 2.04;
    controls.target.set(0, 1.1, 0);
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 1.2;
    controls.update();
    controlsRef.current = controls;

    const onStartDrag = () => {
      renderer.domElement.style.cursor = 'grabbing';
    };
    const onEndDrag = () => {
      renderer.domElement.style.cursor = 'grab';
    };
    controls.addEventListener('start', onStartDrag);
    controls.addEventListener('end', onEndDrag);

    // Lighting
    const ambientLight = new THREE.AmbientLight(
      isNight ? 0x94a3b8 : 0xffedd5,
      isNight ? 0.95 : 1.35
    );
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(
      isNight ? 0x93c5fd : 0xfbbf24,
      isNight ? 1.4 : 2.4
    );
    dirLight.position.set(8, 14, 8);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const warmFill = new THREE.PointLight(0xf97316, isNight ? 1.9 : 1.2, 20);
    warmFill.position.set(-4, 4.5, 3);
    scene.add(warmFill);

    // Root Diorama Island Group
    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    const earthHex = blueprint?.islandPalette?.earthColor || '#8d6e53';
    const grassHex = blueprint?.islandPalette?.grassColor || '#68b660';
    const roadHex = blueprint?.islandPalette?.roadColor || '#334155';

    // Base Pedestal
    const pedestal = new THREE.Mesh(
      new THREE.BoxGeometry(10.0, 1.35, 10.0),
      new THREE.MeshStandardMaterial({ color: earthHex, roughness: 0.85 })
    );
    pedestal.position.y = -0.82;
    pedestal.receiveShadow = true;
    worldGroup.add(pedestal);

    // Optional River / Lake Waterfront on South Edge
    if (hasWater) {
      const waterColor = blueprint?.islandPalette?.waterColor || '#38bdf8';
      const waterMesh = new THREE.Mesh(
        new THREE.BoxGeometry(10.04, 0.48, 2.15),
        new THREE.MeshStandardMaterial({
          color: waterColor,
          roughness: 0.18,
          metalness: 0.2,
          transparent: true,
          opacity: 0.9,
        })
      );
      waterMesh.position.set(0, -0.14, 3.95);
      worldGroup.add(waterMesh);
    }

    // Sloped Terrain Group (Pillar 5: 평지 vs 언덕 경사도)
    const slopeGroup = new THREE.Group();
    const clampedSlopeDeg = Math.max(0, Math.min(22, slopeDeg));
    const slopeRad = THREE.MathUtils.degToRad(clampedSlopeDeg * 0.6);
    slopeGroup.rotation.z = slopeRad;
    worldGroup.add(slopeGroup);

    const terrainMat = new THREE.MeshStandardMaterial({
      color: activeLayer === 'incline' ? 0xfb7185 : grassHex,
      roughness: 0.75,
    });
    const terrainTop = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.65, 9.6), terrainMat);
    terrainTop.position.y = 0.12;
    terrainTop.receiveShadow = true;
    terrainTop.castShadow = true;
    slopeGroup.add(terrainTop);

    // Attached Photo-to-3D Relief Backdrop (reconstructed from neighborhood photo)
    const photoReliefGroup = new THREE.Group();
    slopeGroup.add(photoReliefGroup);
    if (showPhotoRelief && primaryPhotoUrl) {
      buildImageTo3DReliefGroup(primaryPhotoUrl, photoReliefGroup, () => {
        renderer.render(scene, camera);
      });
    }

    // Main Boulevard Road
    const roadMat = new THREE.MeshStandardMaterial({
      color: activeLayer === 'incline' ? 0xe11d48 : roadHex,
      roughness: 0.6,
    });
    const road = new THREE.Mesh(new THREE.BoxGeometry(9.2, 0.08, 2.0), roadMat);
    road.position.set(0, 0.46, 0.85);
    road.receiveShadow = true;
    slopeGroup.add(road);

    // Road Dashed Center Line
    const stripeMat = new THREE.MeshBasicMaterial({
      color: activeLayer === 'incline' ? 0xfef08a : 0xf8fafc,
    });
    for (let i = -3.8; i <= 3.8; i += 1.2) {
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.09, 0.1), stripeMat);
      stripe.position.set(i, 0.47, 0.85);
      slopeGroup.add(stripe);
    }

    // Pillar 1: 1군 브랜드 문주 (Grand Complex Gatehouse Archway)
    if ((liq?.brand.score ?? 90) >= 80) {
      const gateGroup = new THREE.Group();
      gateGroup.position.set(-1.6, 0.45, -0.35);
      const pillarMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.35, metalness: 0.3 });
      const crownGoldMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });

      const leftPillar = new THREE.Mesh(new THREE.BoxGeometry(0.22, 1.35, 0.22), pillarMat);
      leftPillar.position.set(-0.85, 0.67, 0);
      gateGroup.add(leftPillar);

      const rightPillar = new THREE.Mesh(new THREE.BoxGeometry(0.22, 1.35, 0.22), pillarMat);
      rightPillar.position.set(0.85, 0.67, 0);
      gateGroup.add(rightPillar);

      const archBeam = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.26, 0.36), pillarMat);
      archBeam.position.set(0, 1.35, 0);
      gateGroup.add(archBeam);

      const ledLine = new THREE.Mesh(new THREE.BoxGeometry(2.02, 0.05, 0.38), crownGoldMat);
      ledLine.position.set(0, 1.46, 0);
      gateGroup.add(ledLine);

      slopeGroup.add(gateGroup);
    }

    // Pillar 4: 학군 초품아 (Elementary School + Green Soccer Field)
    if ((liq?.school.score ?? 85) >= 78) {
      const schoolGroup = new THREE.Group();
      schoolGroup.position.set(2.9, 0.46, 2.35);

      const fieldMesh = new THREE.Mesh(
        new THREE.BoxGeometry(1.75, 0.05, 1.25),
        new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.6 })
      );
      fieldMesh.position.set(0, 0.02, 0);
      schoolGroup.add(fieldMesh);

      const schoolBldg = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 0.85, 0.55),
        new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.5 })
      );
      schoolBldg.position.set(0, 0.44, -0.45);
      schoolBldg.castShadow = true;
      schoolGroup.add(schoolBldg);

      const schoolRoof = new THREE.Mesh(
        new THREE.BoxGeometry(1.58, 0.1, 0.62),
        new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.5 })
      );
      schoolRoof.position.set(0, 0.91, -0.45);
      schoolGroup.add(schoolRoof);

      slopeGroup.add(schoolGroup);
    }

    // Hillside Stairs & Yellow Handrail (Pillar 5: 언덕/계단 지형 — placed on left flank so front plaza is 100% clear)
    if (hasStairs) {
      const stairMat = new THREE.MeshStandardMaterial({
        color: activeLayer === 'incline' ? 0xfda4af : 0xcbd5e1,
        roughness: 0.7,
      });
      const railMat = new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        roughness: 0.35,
      });
      for (let s = 0; s < 8; s++) {
        const step = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.12, 0.68), stairMat);
        step.position.set(-3.75 + s * 0.26, 0.48 + s * 0.02, 1.85);
        step.castShadow = true;
        slopeGroup.add(step);
      }
      const railBar = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.05, 0.05), railMat);
      railBar.position.set(-2.85, 0.85, 2.18);
      slopeGroup.add(railBar);
    }

    // Pillar 2 & 6: 신축 커튼월룩 & 세대수 규모에 따른 대단지 아파트 동 배치
    const isCurtainWallNewBuild = (liq?.newBuild.score ?? 80) >= 84;
    const defaultApartmentTowers: BuildingSpec[] = [
      {
        id: 'b-apt-1',
        kind: 'apartment',
        label: '101동',
        x: -6.5,
        z: -5.5,
        width: 3.2,
        depth: 2.6,
        floors: 14,
        wallColor: isCurtainWallNewBuild ? '#e0f2fe' : '#f8fafc',
        roofColor: '#334155',
        roofStyle: 'flat',
      },
      {
        id: 'b-apt-2',
        kind: 'apartment',
        label: '102동',
        x: -1.5,
        z: -6.2,
        width: 3.4,
        depth: 2.6,
        floors: 16,
        wallColor: isCurtainWallNewBuild ? '#dbeafe' : '#f1f5f9',
        roofColor: '#334155',
        roofStyle: 'flat',
      },
      {
        id: 'b-apt-3',
        kind: 'apartment',
        label: '103동',
        x: 3.8,
        z: -5.8,
        width: 3.3,
        depth: 2.6,
        floors: 15,
        wallColor: isCurtainWallNewBuild ? '#e0f2fe' : '#f8fafc',
        roofColor: '#334155',
        roofStyle: 'flat',
      },
      {
        id: 'b-apt-4',
        kind: 'apartment',
        label: '104동',
        x: 7.8,
        z: -4.5,
        width: 3.1,
        depth: 2.5,
        floors: 13,
        wallColor: '#f8fafc',
        roofColor: '#475569',
        roofStyle: 'flat',
      },
      {
        id: 'b-cafe',
        kind: 'cafe',
        label: '붉은벽돌 로스터리 카페',
        x: -7.5,
        z: -0.8,
        width: 2.8,
        depth: 2.4,
        floors: 2,
        wallColor: '#c2410c',
        roofColor: '#7c2d12',
        roofStyle: 'terrace',
      },
    ];

    const buildingsToRender: BuildingSpec[] =
      blueprint?.buildings && blueprint.buildings.length > 0
        ? blueprint.buildings
        : defaultApartmentTowers;

    const windowMat = new THREE.MeshBasicMaterial({
      color: activeLayer === 'mood' ? 0xfbbf24 : isNight ? 0xfde047 : 0xfef08a,
    });
    const glassCurtainMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.15,
      metalness: 0.55,
      transparent: true,
      opacity: 0.45,
    });

    buildingsToRender.forEach((b) => {
      const bx = (b.x / 12) * 3.8;
      let bz = (b.z / 12) * 3.4;
      // Keep the front-center promenade completely open so Pingu & Gyodong are never occluded by buildings
      if (Math.abs(bx) < 2.6 && bz > -0.75) {
        bz = -1.65;
      }
      const bw = Math.max(0.95, Math.min(1.65, b.width * 0.42));
      const bd = Math.max(0.85, Math.min(1.4, b.depth * 0.42));
      const bh =
        b.kind === 'apartment'
          ? Math.max(1.9, Math.min(3.5, b.floors * 0.21))
          : b.kind === 'cafe'
            ? 1.25
            : b.kind === 'convenience_store'
              ? 0.95
              : 1.35;

      const bGroup = new THREE.Group();
      bGroup.position.set(bx, 0.45, bz);

      const wallMat = new THREE.MeshStandardMaterial({
        color: b.wallColor || '#f8fafc',
        roughness: isCurtainWallNewBuild && b.kind === 'apartment' ? 0.28 : 0.55,
        metalness: isCurtainWallNewBuild && b.kind === 'apartment' ? 0.18 : 0.05,
      });
      const bodyMesh = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), wallMat);
      bodyMesh.position.y = bh / 2;
      bodyMesh.castShadow = true;
      bodyMesh.receiveShadow = true;
      bGroup.add(bodyMesh);

      // Curtain-wall vertical glass strips & rooftop LED bar for apartments
      if (b.kind === 'apartment') {
        const glassStrip = new THREE.Mesh(
          new THREE.BoxGeometry(bw * 0.28, bh * 0.92, bd + 0.03),
          glassCurtainMat
        );
        glassStrip.position.y = bh / 2;
        bGroup.add(glassStrip);

        const rooftopCrown = new THREE.Mesh(
          new THREE.BoxGeometry(bw + 0.06, 0.14, bd + 0.06),
          new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 })
        );
        rooftopCrown.position.y = bh + 0.07;
        bGroup.add(rooftopCrown);

        const crownLed = new THREE.Mesh(
          new THREE.BoxGeometry(bw * 0.85, 0.04, bd + 0.08),
          new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
        );
        crownLed.position.y = bh + 0.15;
        bGroup.add(crownLed);
      } else {
        const roofMat = new THREE.MeshStandardMaterial({
          color: b.roofColor || '#475569',
          roughness: 0.6,
        });
        const flatRoof = new THREE.Mesh(
          new THREE.BoxGeometry(bw + 0.08, 0.12, bd + 0.08),
          roofMat
        );
        flatRoof.position.y = bh + 0.06;
        bGroup.add(flatRoof);
      }

      if (b.kind === 'cafe') {
        const awning = new THREE.Mesh(
          new THREE.BoxGeometry(bw * 0.9, 0.08, 0.35),
          new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.4 })
        );
        awning.position.set(0, 0.62, bd / 2 + 0.14);
        awning.rotation.x = 0.25;
        bGroup.add(awning);
      }

      // Windows on Front & Back
      const rows = Math.max(1, Math.min(6, Math.floor(bh / 0.5)));
      for (let r = 0; r < rows; r++) {
        for (let c = -1; c <= 1; c += 2) {
          const win = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.22, 0.04), windowMat);
          win.position.set(c * (bw * 0.28), 0.36 + r * 0.48, bd / 2 + 0.02);
          bGroup.add(win);
        }
      }

      slopeGroup.add(bGroup);
    });

    // Pillar 3: 역세권 (Subway Station Entrance Portal)
    const transitGroup = new THREE.Group();
    const tx = blueprint?.transit ? (blueprint.transit.x / 12) * 3.6 : -3.5;
    const tz = blueprint?.transit ? (blueprint.transit.z / 12) * 3.6 : 2.1;
    transitGroup.position.set(tx, 0.45, tz);

    const canopy = new THREE.Mesh(
      new THREE.BoxGeometry(1.15, 0.58, 0.88),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 })
    );
    canopy.position.y = 0.29;
    canopy.castShadow = true;
    transitGroup.add(canopy);

    const lineStrip = new THREE.Mesh(
      new THREE.BoxGeometry(1.18, 0.12, 0.92),
      new THREE.MeshBasicMaterial({
        color: blueprint?.transit?.lineColor || '#10b981',
      })
    );
    lineStrip.position.y = 0.54;
    transitGroup.add(lineStrip);
    slopeGroup.add(transitGroup);

    // Park & Trees
    const treesToRender: TreeSpec[] =
      blueprint?.trees && blueprint.trees.length > 0
        ? blueprint.trees.slice(0, 14)
        : [
            { x: 6, z: 1, kind: 'cherry_blossom', scale: 1.15, foliageColor: '#f472b6' },
            { x: 2, z: -1, kind: 'cherry_blossom', scale: 1.05, foliageColor: '#f9a8d4' },
            { x: -3, z: -1, kind: 'oak', scale: 1.1, foliageColor: '#10b981' },
            { x: 8, z: -1, kind: 'pine', scale: 1.1, foliageColor: '#059669' },
            { x: -8, z: 5, kind: 'ginkgo', scale: 1.05, foliageColor: '#fbbf24' },
          ];

    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
    treesToRender.forEach((t) => {
      const treeGroup = new THREE.Group();
      const txPos = Math.max(-4.2, Math.min(4.2, (t.x / 12) * 3.8));
      const tzPos = Math.max(-3.2, Math.min(4.2, (t.z / 12) * 3.6));

      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.5, 8), trunkMat);
      trunk.position.y = 0.25;
      trunk.castShadow = true;
      treeGroup.add(trunk);

      const leafColor =
        activeLayer === 'greenery'
          ? '#34d399'
          : t.foliageColor ||
            (t.kind === 'cherry_blossom'
              ? '#f9a8d4'
              : t.kind === 'ginkgo'
                ? '#facc15'
                : '#10b981');

      const crownMat = new THREE.MeshStandardMaterial({ color: leafColor, roughness: 0.65 });
      const crown =
        t.kind === 'pine'
          ? new THREE.Mesh(new THREE.ConeGeometry(0.45, 1.05, 10), crownMat)
          : new THREE.Mesh(new THREE.DodecahedronGeometry(0.46, 1), crownMat);
      crown.position.y = 0.78;
      crown.castShadow = true;
      treeGroup.add(crown);

      const scaleVal = (t.scale || 1) * (activeLayer === 'greenery' ? 1.22 : 1.0);
      treeGroup.scale.setScalar(scaleVal);
      treeGroup.position.set(txPos, 0.45, tzPos);
      slopeGroup.add(treeGroup);
    });

    // Moving Cars & Pulsing Acoustic Wave Rings
    const carCount =
      blueprint?.traffic?.carCount ?? (neighborhood.noiseDb >= 40 ? 3 : 1);
    const cars: Array<{ mesh: THREE.Group; speed: number; dir: number }> = [];
    const carColors = [0xef4444, 0x3b82f6, 0xf59e0b, 0x10b981];

    for (let c = 0; c < Math.min(5, Math.max(1, carCount)); c++) {
      const carGroup = new THREE.Group();
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.58, 0.22, 0.34),
        new THREE.MeshStandardMaterial({ color: carColors[c % carColors.length], roughness: 0.4 })
      );
      body.position.y = 0.14;
      body.castShadow = true;
      carGroup.add(body);

      const cabin = new THREE.Mesh(
        new THREE.BoxGeometry(0.32, 0.16, 0.3),
        new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3 })
      );
      cabin.position.set(-0.04, 0.28, 0);
      carGroup.add(cabin);

      const dir = c % 2 === 0 ? 1 : -1;
      carGroup.position.set(-3.2 + c * 1.8, 0.5, 0.85 + (dir > 0 ? 0.32 : -0.32));
      slopeGroup.add(carGroup);
      cars.push({ mesh: carGroup, speed: 0.018 + c * 0.004, dir });
    }

    // Acoustic Sound Wave Rings
    const noiseGroup = new THREE.Group();
    const showWaves =
      activeLayer === 'noise' ||
      (blueprint?.traffic?.showNoiseWaves ?? neighborhood.noiseDb >= 42);
    const waveRingMat = new THREE.MeshBasicMaterial({
      color: neighborhood.noiseDb < 38 ? 0x38bdf8 : 0xf43f5e,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: activeLayer === 'noise' ? 0.8 : showWaves ? 0.42 : 0.0,
    });
    const rings: THREE.Mesh[] = [];
    for (let r = 0; r < 3; r++) {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.5 + r * 0.65, 0.6 + r * 0.65, 32),
        waveRingMat.clone()
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(0, 0.56, 0.85);
      noiseGroup.add(ring);
      rings.push(ring);
    }
    slopeGroup.add(noiseGroup);

    // 3D Pingu & 3D Gyodong Characters Exploring the Open Front Promenade (100% unobstructed in front of all buildings)
    const makeCharacterBadgeSprite = (text: string, bgColor: string, borderColor: string) => {
      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 76;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = bgColor;
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.roundRect(8, 8, 304, 60, 30);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 25px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 160, 39);
      }
      const tex = new THREE.CanvasTexture(canvas);
      const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
      const sprite = new THREE.Sprite(mat);
      sprite.scale.set(1.35, 0.32, 1);
      sprite.renderOrder = 999;
      return sprite;
    };

    // Dedicated character spotlight in the front plaza so Pingu & Gyodong are brightly illuminated
    const charSpotLight = new THREE.PointLight(0xfffbeb, 2.4, 7.5);
    charSpotLight.position.set(0, 2.4, 3.2);
    slopeGroup.add(charSpotLight);

    // Front Promenade Stage Deck at z = 2.65
    const promenadeDeck = new THREE.Mesh(
      new THREE.CylinderGeometry(1.95, 2.05, 0.06, 36),
      new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        roughness: 0.35,
        metalness: 0.1,
      })
    );
    promenadeDeck.scale.set(1.35, 1, 0.58);
    promenadeDeck.position.set(0, 0.47, 2.62);
    promenadeDeck.receiveShadow = true;
    slopeGroup.add(promenadeDeck);

    const pinguChar = create3DPingu();
    const isPinguFocus = neighborhood.perspective !== 'gyodong';
    pinguChar.scale.setScalar(isPinguFocus ? 1.65 : 1.42);
    pinguChar.position.set(-0.68, 0.52, 2.68);
    // Glowing blue pedestal ring under Pingu
    const pinguPedestal = new THREE.Mesh(
      new THREE.RingGeometry(0.26, 0.36, 28),
      new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: isPinguFocus ? 0.95 : 0.6,
      })
    );
    pinguPedestal.rotation.x = -Math.PI / 2;
    pinguPedestal.position.y = 0.02;
    pinguChar.add(pinguPedestal);
    const pinguBadge = makeCharacterBadgeSprite(
      lang === 'en' ? '🐧 Pingu (Commute)' : '🐧 핑구 (출퇴근·현실)',
      isPinguFocus ? 'rgba(0, 81, 255, 0.94)' : 'rgba(15, 23, 42, 0.86)',
      '#93c5fd'
    );
    pinguBadge.position.set(0, 0.96, 0);
    pinguChar.add(pinguBadge);
    slopeGroup.add(pinguChar);

    const gyodongChar = create3DGyodong();
    gyodongChar.scale.setScalar(!isPinguFocus ? 1.65 : 1.42);
    gyodongChar.position.set(0.68, 0.52, 2.68);
    // Glowing amber pedestal ring under Gyodong
    const gyodongPedestal = new THREE.Mesh(
      new THREE.RingGeometry(0.26, 0.36, 28),
      new THREE.MeshBasicMaterial({
        color: 0xfbbf24,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: !isPinguFocus ? 0.95 : 0.6,
      })
    );
    gyodongPedestal.rotation.x = -Math.PI / 2;
    gyodongPedestal.position.y = 0.02;
    gyodongChar.add(gyodongPedestal);
    const gyodongBadge = makeCharacterBadgeSprite(
      lang === 'en' ? '🐶 Gyodong (Vibe)' : '🐶 교동 (감성·산책)',
      !isPinguFocus ? 'rgba(217, 119, 6, 0.94)' : 'rgba(15, 23, 42, 0.86)',
      '#fde68a'
    );
    gyodongBadge.position.set(0, 0.96, 0);
    gyodongChar.add(gyodongBadge);
    slopeGroup.add(gyodongChar);

    // Animation Loop
    let frameId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      controls.update();

      // Gentle stroll in the open front promenade (z = 2.68), facing toward the viewer camera
      const sway = Math.sin(t * 0.9) * 0.45;
      pinguChar.position.x = -0.72 + sway;
      pinguChar.position.y = 0.52 + Math.abs(Math.sin(t * 4.2)) * 0.11;
      pinguChar.rotation.y = 0.25 + Math.sin(t * 1.4) * 0.32;

      gyodongChar.position.x = 0.72 + sway;
      gyodongChar.position.y = 0.52 + Math.abs(Math.cos(t * 4.2)) * 0.1;
      gyodongChar.rotation.y = -0.2 + Math.cos(t * 1.4) * 0.32;

      cars.forEach((c) => {
        c.mesh.position.x += c.speed * c.dir;
        if (c.dir > 0 && c.mesh.position.x > 4.2) c.mesh.position.x = -4.2;
        if (c.dir < 0 && c.mesh.position.x < -4.2) c.mesh.position.x = 4.2;
      });

      rings.forEach((ring, idx) => {
        const s = 1 + ((t * 0.8 + idx * 0.35) % 1.4);
        ring.scale.set(s, s, 1);
      });

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 720;
      const h = container.clientHeight || 420;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      controls.removeEventListener('start', onStartDrag);
      controls.removeEventListener('end', onEndDrag);
      controls.dispose();
      renderer.dispose();
    };
  }, [neighborhood, activeLayer, timeMode, showPhotoRelief, primaryPhotoUrl, lang]);

  const layerItems: { id: SensoryLayerType; label: string; value: string }[] = [
    {
      id: 'all',
      label: lang === 'en' ? 'All 3D' : '전체 3D',
      value: lang === 'en' ? 'Full' : '통합',
    },
    {
      id: 'incline',
      label: lang === 'en' ? '5. Flat/Slope' : '5. 평지/경사',
      value: `${slopeDeg}°`,
    },
    {
      id: 'greenery',
      label: lang === 'en' ? 'Park/School' : '숲/4.학군',
      value: `${blueprint?.trees?.length ?? 8}${lang === 'en' ? ' trees' : '그루'}`,
    },
    {
      id: 'noise',
      label: lang === 'en' ? 'Acoustics' : '저소음/도로',
      value: `${neighborhood.noiseDb}dB`,
    },
    {
      id: 'mood',
      label: lang === 'en' ? 'Sunset Vibe' : '노을/조도',
      value: `${neighborhood.cozinessPercent}%`,
    },
  ];

  const activeExplorer = neighborhood.perspective === 'gyodong' ? 'gyodong' : 'pingu';

  return (
    <section
      aria-label={lang === 'en' ? 'Interactive 3D Neighborhood Model' : '인터랙티브 3D 동네 모델'}
      className="relative w-full h-[400px] sm:h-[450px] rounded-3xl overflow-hidden bg-[#0b1120] border border-slate-200/80 shadow-md select-none"
    >
      {/* Interactive Three.js Canvas Container */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Top HUD Overlay — pointer-events-none so dragging works everywhere */}
      <div className="pointer-events-none absolute top-3 inset-x-3 flex items-start justify-between gap-2 z-10">
        {/* Left: Gemini 4 Argon Photo-to-3D Status & Explorer Badge */}
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="bg-slate-900/85 backdrop-blur-md text-white px-2.5 py-1.5 rounded-xl border border-white/15 flex items-center gap-2 shadow-sm">
            <CharacterAvatar character={activeExplorer} size={22} />
            <div className="text-[11px] leading-tight">
              <span className="font-bold text-amber-300">
                {activeExplorer === 'gyodong'
                  ? lang === 'en'
                    ? 'Gyodong (Vibe & Walk) 3D World'
                    : '교동(감성·산책)의 3D 월드'
                  : lang === 'en'
                    ? 'Pingu (Commute & Practical) 3D World'
                    : '핑구(출퇴근·현실)의 3D 월드'}
              </span>
              <span className="mx-1.5 text-white/30">|</span>
              <span className="text-white/90 font-bold">
                {lang === 'en' && neighborhood.nameEn ? neighborhood.nameEn : neighborhood.name}
              </span>
            </div>
          </div>

          <div className="bg-indigo-600/90 backdrop-blur-md text-white px-2.5 py-1 rounded-xl border border-indigo-300/30 flex items-center gap-1 text-[10px] font-bold shadow-sm">
            <SparklesIcon className="w-3.5 h-3.5 text-amber-300" />
            <span>
              {lang === 'ko'
                ? 'Gemini 4 Argon · 첨부 이미지 3D 복원'
                : 'Gemini 4 Argon · Photo-to-3D'}
            </span>
            {neighborhood.verification && (
              <span className="ml-1 px-1.5 py-0.5 rounded bg-white/20 text-[10px] flex items-center gap-0.5">
                <ShieldCheckIcon className="w-3 h-3 text-emerald-300" />
                {neighborhood.verification.overallFidelityScore}%
              </span>
            )}
          </div>
        </div>

        {/* Right: Interactive Camera & Photo-Relief Controls */}
        <div className="pointer-events-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setShowPhotoRelief((prev) => !prev)}
            className={`!rounded-xl !px-2 !py-1.5 !text-[10px] !font-bold !border ${
              showPhotoRelief
                ? '!bg-amber-500/90 !text-slate-950 !border-amber-300'
                : '!bg-slate-900/80 !text-white !border-white/15'
            }`}
          >
            <span>{lang === 'ko' ? '🖼️ 사진 3D 릴리프' : '🖼️ Photo Relief'}</span>
          </Button>

          <Button
            variant="ghost"
            size="xs"
            onClick={() => setTimeMode((prev) => (prev === 'golden' ? 'night' : 'golden'))}
            className="!bg-slate-900/80 hover:!bg-slate-800 !text-white !border !border-white/15 !rounded-xl !px-2 !py-1.5 !text-[10px]"
          >
            {timeMode === 'golden' ? (
              <>
                <SunIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === 'en' ? 'Sunset' : '노을'}</span>
              </>
            ) : (
              <>
                <MoonIcon className="w-3.5 h-3.5 text-sky-300" />
                <span>{lang === 'en' ? 'Night' : '야간'}</span>
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            size="xs"
            onClick={() => setAutoRotate((prev) => !prev)}
            className={`! border !border-white/15 !rounded-xl !px-2 !py-1.5 !text-[10px] ${
              autoRotate
                ? '!bg-blue-600 !text-white'
                : '!bg-slate-900/80 hover:!bg-slate-800 !text-white/80'
            }`}
          >
            <CompassIcon className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'Spin' : '회전'}</span>
          </Button>

          <Button
            variant="ghost"
            size="xs"
            onClick={handleResetCamera}
            aria-label="Reset 3D View"
            className="!bg-slate-900/80 hover:!bg-slate-800 !text-white/80 !border !border-white/15 !rounded-xl !px-2 !py-1.5 !text-[10px]"
          >
            <RotateCcwIcon className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Attached Source Photo Thumbnail Preview in Bottom-Right above Layer Dock */}
      {primaryPhotoUrl && (
        <div className="pointer-events-none absolute bottom-14 right-3 z-10 bg-slate-900/85 backdrop-blur-md p-1.5 rounded-xl border border-white/20 flex items-center gap-2 shadow-lg">
          <img
            src={primaryPhotoUrl}
            alt="Source for 3D"
            className="w-11 h-8 rounded-lg object-cover border border-white/20"
          />
          <div className="pr-1">
            <span className="text-[9px] font-extrabold text-amber-300 block">
              {lang === 'ko' ? '원본 첨부 이미지' : 'Source Image'}
            </span>
            <span className="text-[9px] text-white/80 block">
              {lang === 'ko' ? '→ 3D 지형·색채 동기화됨' : '→ Synced to 3D Mesh'}
            </span>
          </div>
        </div>
      )}

      {/* Drag Hint Pill */}
      <div className="pointer-events-none absolute bottom-14 left-3 z-10">
        <span className="px-2.5 py-1 rounded-full bg-slate-900/75 backdrop-blur-xs text-white/85 text-[10px] font-medium border border-white/10">
          {lang === 'en'
            ? '👆 Drag 360° · Scroll to Zoom'
            : '👆 마우스/터치 드래그로 360° 회전 · 휠 확대'}
        </span>
      </div>

      {/* Bottom Layer Selector Dock */}
      <div className="pointer-events-auto absolute bottom-3 inset-x-3 flex items-center justify-between gap-1.5 bg-slate-900/85 backdrop-blur-md p-1.5 rounded-xl border border-white/15 z-10 overflow-x-auto no-scrollbar">
        {layerItems.map((item) => {
          const isActive = activeLayer === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectLayer(item.id)}
              className={`flex-1 min-w-[66px] py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>{item.label}</span>
              <span
                className={`text-[10px] px-1 py-0.2 rounded ${
                  isActive ? 'bg-white/20 text-white' : 'text-slate-400'
                }`}
              >
                {item.value}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
