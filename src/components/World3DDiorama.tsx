import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type {
  SceneBlueprint,
  ObservationPinSpec,
  NpcResident,
  NpcPolicyOutcome,
} from '../types';
import { CharacterAvatar } from './CharacterAvatar';
import { useI18n, NPC_KO_INFO } from '../i18n';
import {
  Camera,
  RotateCw,
  Sun,
  Sunset,
  Moon,
  Eye,
  EyeOff,
  Users,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';

interface World3DDioramaProps {
  blueprint: SceneBlueprint;
  activePinId: string | null;
  onSelectPin: (pin: ObservationPinSpec | null) => void;
  npcs: NpcResident[];
  npcOutcomes: NpcPolicyOutcome[];
  selectedNpcId: string | null;
  onSelectNpc: (npcId: string | null) => void;
  approvedPolicyTitle: string;
}

interface ProjectedPin extends ObservationPinSpec {
  screenX: number;
  screenY: number;
  visible: boolean;
}

interface ProjectedNpc {
  npc: NpcResident;
  outcome?: NpcPolicyOutcome;
  screenX: number;
  screenY: number;
  visible: boolean;
}

export const World3DDiorama: React.FC<World3DDioramaProps> = ({
  blueprint,
  activePinId,
  onSelectPin,
  npcs,
  npcOutcomes,
  selectedNpcId,
  onSelectNpc,
  approvedPolicyTitle,
}) => {
  const { lang, t } = useI18n();
  const mountRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const playerPosRef = useRef<{ x: number; z: number; rotY: number }>({
    x: 0,
    z: 0.85,
    rotY: 0,
  });
  const keysPressedRef = useRef<Record<string, boolean>>({});

  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'golden_hour' | 'twilight'>(
    blueprint.timeOfDay || 'golden_hour'
  );
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [showPins, setShowPins] = useState<boolean>(true);
  const [showNpcs, setShowNpcs] = useState<boolean>(true);
  const [projectedPins, setProjectedPins] = useState<ProjectedPin[]>([]);
  const [projectedNpcs, setProjectedNpcs] = useState<ProjectedNpc[]>([]);
  const [snapshotToast, setSnapshotToast] = useState<string | null>(null);
  const [nearbyNpcName, setNearbyNpcName] = useState<string | null>(null);

  const getTerrainHeightAt = (x: number, z: number, slopeDeg: number): number => {
    const slopeRad = THREE.MathUtils.degToRad(Math.min(26, Math.max(0, slopeDeg)));
    if (z < 0.5) {
      const distNorth = Math.max(0, 0.5 - z);
      return Math.tan(slopeRad) * distNorth * 0.55;
    }
    return 0;
  };

  const setMoveKey = (key: string, pressed: boolean) => {
    keysPressedRef.current[key] = pressed;
  };

  // Keyboard listener for WASD / Arrow Keys player movement
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      const k = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) {
        keysPressedRef.current[k] = true;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      keysPressedRef.current[k] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 720;
    const height = container.clientHeight || 480;

    const scene = new THREE.Scene();

    const skyColors = {
      morning: 0xe8f4fd,
      golden_hour: 0xfef3e2,
      twilight: 0x1e293b,
    };
    scene.background = new THREE.Color(skyColors[timeOfDay]);
    scene.fog = new THREE.FogExp2(skyColors[timeOfDay], 0.025);

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(6.8, 5.9, 7.8);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = timeOfDay === 'twilight' ? 1.12 : 1.18;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2.08;
    controls.minDistance = 4.0;
    controls.maxDistance = 15;
    controls.target.set(0, 0.65, 0);
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 0.65;
    controlsRef.current = controls;

    // Lighting setup
    const hemiLight = new THREE.HemisphereLight(
      timeOfDay === 'twilight' ? 0x8ecae6 : 0xffffff,
      timeOfDay === 'twilight' ? 0x1d3557 : 0xd4a373,
      timeOfDay === 'twilight' ? 0.78 : 1.2
    );
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(
      timeOfDay === 'golden_hour' ? 0xffb703 : timeOfDay === 'twilight' ? 0x90e0ef : 0xffffff,
      timeOfDay === 'twilight' ? 0.92 : 1.65
    );
    dirLight.position.set(8, 12, 7);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 30;
    const d = 6.5;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);

    const islandGroup = new THREE.Group();
    scene.add(islandGroup);

    const slopeDeg = blueprint.terrain.slopeDegrees;

    // 1. Floating Island Base
    const soilGeo = new THREE.CylinderGeometry(3.85, 3.25, 0.95, 36);
    const soilMat = new THREE.MeshStandardMaterial({
      color: blueprint.islandPalette.earthColor || '#DDA15E',
      roughness: 0.85,
    });
    const soilMesh = new THREE.Mesh(soilGeo, soilMat);
    soilMesh.position.y = -0.52;
    soilMesh.scale.set(1.08, 1, 1.08);
    soilMesh.receiveShadow = true;
    islandGroup.add(soilMesh);

    const grassGeo = new THREE.CylinderGeometry(3.95, 3.85, 0.26, 36);
    const grassMat = new THREE.MeshStandardMaterial({
      color: blueprint.islandPalette.grassColor || '#95D5B2',
      roughness: 0.75,
    });
    const grassMesh = new THREE.Mesh(grassGeo, grassMat);
    grassMesh.position.y = -0.05;
    grassMesh.scale.set(1.08, 1, 1.08);
    grassMesh.receiveShadow = true;
    islandGroup.add(grassMesh);

    // 2. Sloped Upper Hillside Wedge
    if (slopeDeg > 2) {
      const tierCount = 6;
      for (let t = 0; t < tierCount; t++) {
        const zPos = 0.25 - t * 0.45;
        const h = getTerrainHeightAt(0, zPos, slopeDeg);
        if (h > 0.02) {
          const tierGeo = new THREE.BoxGeometry(5.6 - t * 0.22, h, 0.52);
          const tierMat = new THREE.MeshStandardMaterial({
            color: t % 2 === 0 ? '#88CCA8' : '#7BC29D',
            roughness: 0.78,
          });
          const tierMesh = new THREE.Mesh(tierGeo, tierMat);
          tierMesh.position.set(0, h / 2, zPos);
          tierMesh.castShadow = true;
          tierMesh.receiveShadow = true;
          islandGroup.add(tierMesh);
        }
      }
    }

    // 3. Hillside Stairway
    if (blueprint.terrain.hasHillsideStairs || slopeDeg >= 10) {
      const steps = 8;
      const stairX = 1.05;
      for (let s = 0; s < steps; s++) {
        const zStep = 0.35 - s * 0.26;
        const yStep = getTerrainHeightAt(stairX, zStep, Math.max(slopeDeg, 12));
        const stepGeo = new THREE.BoxGeometry(0.55, 0.1, 0.26);
        const stepMat = new THREE.MeshStandardMaterial({
          color: '#FAEDCD',
          roughness: 0.6,
        });
        const stepMesh = new THREE.Mesh(stepGeo, stepMat);
        stepMesh.position.set(stairX, yStep + 0.04, zStep);
        stepMesh.castShadow = true;
        stepMesh.receiveShadow = true;
        islandGroup.add(stepMesh);
      }
    }

    // 4. Waterfront
    let waterMesh: THREE.Mesh | null = null;
    if (blueprint.terrain.hasRiverOrLake) {
      const waterGeo = new THREE.BoxGeometry(6.2, 0.14, 1.15);
      const waterMat = new THREE.MeshStandardMaterial({
        color: blueprint.islandPalette.waterColor || '#72EFDD',
        roughness: 0.2,
        metalness: 0.15,
        transparent: true,
        opacity: 0.88,
      });
      waterMesh = new THREE.Mesh(waterGeo, waterMat);
      waterMesh.position.set(0, 0.04, 2.55);
      waterMesh.receiveShadow = true;
      islandGroup.add(waterMesh);

      const pierGeo = new THREE.BoxGeometry(0.7, 0.08, 0.9);
      const pierMat = new THREE.MeshStandardMaterial({ color: '#BC6C25', roughness: 0.8 });
      const pier = new THREE.Mesh(pierGeo, pierMat);
      pier.position.set(-0.8, 0.13, 2.3);
      pier.castShadow = true;
      islandGroup.add(pier);
    }

    // 5. Main Avenue Road & Crosswalk
    const roadGeo = new THREE.BoxGeometry(6.6, 0.06, 0.88);
    const roadMat = new THREE.MeshStandardMaterial({
      color: '#6C757D',
      roughness: 0.85,
    });
    const roadMesh = new THREE.Mesh(roadGeo, roadMat);
    roadMesh.position.set(0, 0.09, 1.45);
    roadMesh.receiveShadow = true;
    islandGroup.add(roadMesh);

    for (let c = 0; c < 5; c++) {
      const stripeGeo = new THREE.BoxGeometry(0.32, 0.07, 0.1);
      const stripeMat = new THREE.MeshStandardMaterial({ color: '#FFFFFF' });
      const stripe = new THREE.Mesh(stripeGeo, stripeMat);
      stripe.position.set(1.25, 0.095, 1.15 + c * 0.15);
      islandGroup.add(stripe);
    }

    // 6. Buildings
    const affordableCount = npcOutcomes.filter((o) => o.canBuyHome).length;
    blueprint.buildings.forEach((b) => {
      const baseH = getTerrainHeightAt(b.x, b.z, slopeDeg);
      const bHeight = Math.max(0.55, Math.min(2.35, b.floors * 0.22));
      const bGroup = new THREE.Group();
      bGroup.position.set(b.x, baseH + 0.08, b.z);

      const bodyGeo = new THREE.BoxGeometry(b.width, bHeight, b.depth);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: b.wallColor,
        roughness: 0.65,
      });
      const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
      bodyMesh.position.y = bHeight / 2;
      bodyMesh.castShadow = true;
      bodyMesh.receiveShadow = true;
      bGroup.add(bodyMesh);

      if (b.roofStyle === 'pitched') {
        const roofGeo = new THREE.ConeGeometry(Math.max(b.width, b.depth) * 0.78, 0.48, 4);
        const roofMat = new THREE.MeshStandardMaterial({ color: b.roofColor, roughness: 0.6 });
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.y = bHeight + 0.24;
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        bGroup.add(roof);
      } else {
        const capGeo = new THREE.BoxGeometry(b.width + 0.08, 0.12, b.depth + 0.08);
        const capMat = new THREE.MeshStandardMaterial({ color: b.roofColor, roughness: 0.55 });
        const cap = new THREE.Mesh(capGeo, capMat);
        cap.position.y = bHeight + 0.06;
        cap.castShadow = true;
        bGroup.add(cap);
      }

      const windowRows = Math.min(6, Math.max(1, Math.floor(b.floors / 1.6)));
      const windowCols = b.width >= 1.0 ? 3 : 2;
      const winMat = new THREE.MeshStandardMaterial({
        color: timeOfDay === 'twilight' ? 0xffe066 : 0xd8f3dc,
        emissive: timeOfDay === 'twilight' ? 0xffb703 : affordableCount > 0 ? 0x52b788 : 0xffe5ae,
        emissiveIntensity: timeOfDay === 'twilight' ? 0.85 : affordableCount === 2 ? 0.45 : 0.25,
      });

      for (let r = 0; r < windowRows; r++) {
        for (let c = 0; c < windowCols; c++) {
          const winGeo = new THREE.BoxGeometry(0.16, 0.14, 0.03);
          const win = new THREE.Mesh(winGeo, winMat);
          const wx = (c - (windowCols - 1) / 2) * 0.28;
          const wy = 0.24 + r * ((bHeight - 0.3) / Math.max(1, windowRows));
          win.position.set(wx, wy, b.depth / 2 + 0.01);
          bGroup.add(win);
        }
      }

      if (b.kind === 'cafe') {
        const awningGeo = new THREE.BoxGeometry(b.width * 0.9, 0.08, 0.28);
        const awningMat = new THREE.MeshStandardMaterial({ color: '#FFE66D' });
        const awning = new THREE.Mesh(awningGeo, awningMat);
        awning.position.set(0, 0.32, b.depth / 2 + 0.12);
        bGroup.add(awning);
      }

      islandGroup.add(bGroup);
    });

    // 7. Subway Station Entrance Portal
    const stX = blueprint.transit.x;
    const stZ = blueprint.transit.z;
    const stGroup = new THREE.Group();
    stGroup.position.set(stX, 0.1, stZ);

    const canopyGeo = new THREE.BoxGeometry(0.85, 0.42, 0.62);
    const canopyMat = new THREE.MeshStandardMaterial({ color: '#2B2D42', roughness: 0.5 });
    const canopy = new THREE.Mesh(canopyGeo, canopyMat);
    canopy.position.y = 0.21;
    canopy.castShadow = true;
    stGroup.add(canopy);

    const lineBandGeo = new THREE.BoxGeometry(0.9, 0.12, 0.66);
    const lineBandMat = new THREE.MeshStandardMaterial({
      color: blueprint.transit.lineColor || '#3CB371',
      emissive: blueprint.transit.lineColor || '#3CB371',
      emissiveIntensity: 0.25,
    });
    const lineBand = new THREE.Mesh(lineBandGeo, lineBandMat);
    lineBand.position.y = 0.44;
    stGroup.add(lineBand);
    islandGroup.add(stGroup);

    // 8. Stylized Puffy Trees
    const treeMeshes: THREE.Group[] = [];
    blueprint.trees.forEach((t) => {
      const tGroup = new THREE.Group();
      const baseH = getTerrainHeightAt(t.x, t.z, slopeDeg);
      tGroup.position.set(t.x, baseH + 0.08, t.z);
      tGroup.scale.setScalar(t.scale);

      const trunkGeo = new THREE.CylinderGeometry(0.06, 0.09, 0.36, 8);
      const trunkMat = new THREE.MeshStandardMaterial({ color: '#8D6E63', roughness: 0.85 });
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 0.18;
      trunk.castShadow = true;
      tGroup.add(trunk);

      const foliageMat = new THREE.MeshStandardMaterial({
        color: t.foliageColor,
        roughness: 0.65,
      });

      if (t.kind === 'pine') {
        const cone1 = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.45, 10), foliageMat);
        cone1.position.y = 0.42;
        cone1.castShadow = true;
        const cone2 = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.38, 10), foliageMat);
        cone2.position.y = 0.65;
        cone2.castShadow = true;
        tGroup.add(cone1, cone2);
      } else {
        const puffMain = new THREE.Mesh(new THREE.DodecahedronGeometry(0.26, 1), foliageMat);
        puffMain.position.set(0, 0.48, 0);
        puffMain.castShadow = true;
        const puffL = new THREE.Mesh(new THREE.DodecahedronGeometry(0.18, 1), foliageMat);
        puffL.position.set(-0.14, 0.4, 0.08);
        const puffR = new THREE.Mesh(new THREE.DodecahedronGeometry(0.18, 1), foliageMat);
        puffR.position.set(0.14, 0.42, -0.06);
        tGroup.add(puffMain, puffL, puffR);
      }

      islandGroup.add(tGroup);
      treeMeshes.push(tGroup);
    });

    // 9. Animated Miniature Cars
    const cars: Array<{ mesh: THREE.Group; speed: number; dir: 1 | -1 }> = [];
    const carColors = ['#FF6B6B', '#4ECDC4', '#FFD166', '#A0C4FF', '#FF9F1C', '#CDB4DB'];
    const carCount = Math.max(1, Math.min(6, blueprint.traffic.carCount));

    for (let i = 0; i < carCount; i++) {
      const carGroup = new THREE.Group();
      const cColor = carColors[i % carColors.length];
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.42, 0.14, 0.22),
        new THREE.MeshStandardMaterial({ color: cColor, roughness: 0.4 })
      );
      body.position.y = 0.09;
      body.castShadow = true;
      const cabin = new THREE.Mesh(
        new THREE.BoxGeometry(0.24, 0.12, 0.18),
        new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.3 })
      );
      cabin.position.set(-0.02, 0.2, 0);
      carGroup.add(body, cabin);

      const dir: 1 | -1 = i % 2 === 0 ? 1 : -1;
      carGroup.position.set((i - carCount / 2) * 1.4, 0.12, dir === 1 ? 1.32 : 1.58);
      islandGroup.add(carGroup);
      cars.push({
        mesh: carGroup,
        speed: (0.012 + (blueprint.traffic.noiseLevel / 100) * 0.02) * (0.85 + (i % 3) * 0.15),
        dir,
      });
    }

    // 10. Pulsing 3D Acoustic Traffic Noise Wave Rings
    const noiseRings: THREE.Mesh[] = [];
    if (blueprint.traffic.showNoiseWaves || blueprint.traffic.noiseLevel >= 40) {
      const ringColor = blueprint.traffic.noiseLevel >= 60 ? 0xff6b6b : 0xffb703;
      for (let r = 0; r < 3; r++) {
        const ringGeo = new THREE.RingGeometry(0.35, 0.44, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: ringColor,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.6,
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.set(0, 0.16, 1.45);
        islandGroup.add(ring);
        noiseRings.push(ring);
      }
    }

    // 11. PolicyQuest Bulletin Board
    const bulletinGroup = new THREE.Group();
    const bY = getTerrainHeightAt(-1.85, 0.75, slopeDeg);
    bulletinGroup.position.set(-1.85, bY + 0.08, 0.75);
    const postMat = new THREE.MeshStandardMaterial({ color: '#7F5539', roughness: 0.8 });
    const postL = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.48, 8), postMat);
    postL.position.set(-0.22, 0.24, 0);
    const postR = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.48, 8), postMat);
    postR.position.set(0.22, 0.24, 0);
    const boardColor =
      affordableCount === 2 ? '#52B788' : affordableCount === 1 ? '#FFD166' : '#E63946';
    const boardMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.58, 0.32, 0.08),
      new THREE.MeshStandardMaterial({
        color: boardColor,
        roughness: 0.4,
      })
    );
    boardMesh.position.set(0, 0.38, 0);
    boardMesh.castShadow = true;
    bulletinGroup.add(postL, postR, boardMesh);
    islandGroup.add(bulletinGroup);

    // 12. Authentic 3D Character Meshes for PINGU (핑구) & GYODONG (교동)
    const npcCrystals: THREE.Mesh[] = [];
    const npcCharacterGroups: THREE.Group[] = [];

    npcs.forEach((npc) => {
      const outcome = npcOutcomes.find((o) => o.npcId === npc.id);
      const canAfford = outcome ? outcome.canBuyHome : false;
      const isPingu = npc.id === 'npc-pingu' || npc.name.toLowerCase().includes('pingu');

      const npcGroup = new THREE.Group();
      const ny = getTerrainHeightAt(npc.x, npc.z, slopeDeg);
      npcGroup.position.set(npc.x, ny + 0.08, npc.z);

      const charModel = new THREE.Group();

      if (isPingu) {
        // === 3D CLAYMATION PINGU (핑구) ===
        const darkPenguinMat = new THREE.MeshStandardMaterial({
          color: '#1F242D',
          roughness: 0.5,
        });
        const whiteBellyMat = new THREE.MeshStandardMaterial({
          color: '#FFFFFF',
          roughness: 0.45,
        });
        const beakRedMat = new THREE.MeshStandardMaterial({
          color: '#FF4D2A',
          roughness: 0.35,
        });
        const scarfRedMat = new THREE.MeshStandardMaterial({
          color: '#E63946',
          roughness: 0.55,
        });
        const feetOrangeMat = new THREE.MeshStandardMaterial({
          color: '#FF9F1C',
          roughness: 0.45,
        });

        // Plump penguin torso
        const torso = new THREE.Mesh(new THREE.SphereGeometry(0.21, 18, 18), darkPenguinMat);
        torso.scale.set(0.95, 1.18, 0.88);
        torso.position.y = 0.24;
        torso.castShadow = true;
        charModel.add(torso);

        // Snow-white oval belly
        const belly = new THREE.Mesh(new THREE.SphereGeometry(0.165, 16, 16), whiteBellyMat);
        belly.scale.set(0.88, 1.08, 0.52);
        belly.position.set(0, 0.23, 0.11);
        charModel.add(belly);

        // Round claymation penguin head
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.165, 18, 18), darkPenguinMat);
        head.scale.set(1.04, 0.96, 0.98);
        head.position.y = 0.5;
        head.castShadow = true;
        charModel.add(head);

        // Cozy red knitted scarf
        const scarf = new THREE.Mesh(new THREE.TorusGeometry(0.145, 0.036, 10, 22), scarfRedMat);
        scarf.rotation.x = Math.PI / 2;
        scarf.position.y = 0.38;
        charModel.add(scarf);

        const scarfTail = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.13, 0.035), scarfRedMat);
        scarfTail.position.set(0.09, 0.31, 0.15);
        scarfTail.rotation.z = -0.2;
        charModel.add(scarfTail);

        // Iconic white round eyes + dark pupils
        const eyeGeo = new THREE.SphereGeometry(0.038, 12, 12);
        const pupilGeo = new THREE.SphereGeometry(0.019, 10, 10);
        const pupilMat = new THREE.MeshStandardMaterial({ color: '#0F172A' });

        const eyeL = new THREE.Mesh(eyeGeo, whiteBellyMat);
        eyeL.position.set(-0.058, 0.53, 0.135);
        const pupilL = new THREE.Mesh(pupilGeo, pupilMat);
        pupilL.position.set(-0.058, 0.53, 0.168);

        const eyeR = new THREE.Mesh(eyeGeo, whiteBellyMat);
        eyeR.position.set(0.058, 0.53, 0.135);
        const pupilR = new THREE.Mesh(pupilGeo, pupilMat);
        pupilR.position.set(0.058, 0.53, 0.168);
        charModel.add(eyeL, pupilL, eyeR, pupilR);

        // Signature red-orange trumpet beak ("Noot Noot!")
        const beak = new THREE.Mesh(
          new THREE.CylinderGeometry(0.048, 0.03, 0.12, 14),
          beakRedMat
        );
        beak.rotation.x = Math.PI / 2;
        beak.position.set(0, 0.48, 0.19);
        charModel.add(beak);

        // Side flippers
        const flipperGeo = new THREE.BoxGeometry(0.048, 0.22, 0.1);
        const flipperL = new THREE.Mesh(flipperGeo, darkPenguinMat);
        flipperL.position.set(-0.21, 0.25, 0);
        flipperL.rotation.z = 0.28;
        const flipperR = new THREE.Mesh(flipperGeo, darkPenguinMat);
        flipperR.position.set(0.21, 0.25, 0);
        flipperR.rotation.z = -0.28;
        charModel.add(flipperL, flipperR);

        // Webbed orange feet
        const footGeo = new THREE.BoxGeometry(0.085, 0.035, 0.14);
        const footL = new THREE.Mesh(footGeo, feetOrangeMat);
        footL.position.set(-0.08, 0.02, 0.05);
        const footR = new THREE.Mesh(footGeo, feetOrangeMat);
        footR.position.set(0.08, 0.02, 0.05);
        charModel.add(footL, footR);
      } else {
        // === 3D GOLDEN PUPPY GYODONG (교동) ===
        const furGoldMat = new THREE.MeshStandardMaterial({
          color: '#F59E0B',
          roughness: 0.55,
        });
        const earCaramelMat = new THREE.MeshStandardMaterial({
          color: '#D97706',
          roughness: 0.6,
        });
        const creamCheekMat = new THREE.MeshStandardMaterial({
          color: '#FFFBEB',
          roughness: 0.5,
        });
        const hoodieBlueMat = new THREE.MeshStandardMaterial({
          color: '#38BDF8',
          roughness: 0.5,
        });
        const darkMat = new THREE.MeshStandardMaterial({
          color: '#1E293B',
          roughness: 0.3,
        });
        const pinkTongueMat = new THREE.MeshStandardMaterial({
          color: '#FB7185',
          roughness: 0.4,
        });

        // Sky-blue cozy hoodie torso
        const hoodie = new THREE.Mesh(
          new THREE.CylinderGeometry(0.15, 0.195, 0.28, 16),
          hoodieBlueMat
        );
        hoodie.position.y = 0.16;
        hoodie.castShadow = true;
        charModel.add(hoodie);

        // Plump golden-apricot puppy head
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 18, 18), furGoldMat);
        head.scale.set(1.12, 0.96, 1.02);
        head.position.y = 0.44;
        head.castShadow = true;
        charModel.add(head);

        // Chubby cream cheeks & muzzle
        const cheekGeo = new THREE.SphereGeometry(0.095, 14, 14);
        const cheekL = new THREE.Mesh(cheekGeo, creamCheekMat);
        cheekL.position.set(-0.075, 0.4, 0.11);
        const cheekR = new THREE.Mesh(cheekGeo, creamCheekMat);
        cheekR.position.set(0.075, 0.4, 0.11);
        const snout = new THREE.Mesh(new THREE.SphereGeometry(0.08, 14, 14), creamCheekMat);
        snout.position.set(0, 0.41, 0.155);
        charModel.add(cheekL, cheekR, snout);

        // Shiny black puppy nose + pink tongue blep
        const nose = new THREE.Mesh(new THREE.SphereGeometry(0.028, 10, 10), darkMat);
        nose.position.set(0, 0.435, 0.228);
        const tongue = new THREE.Mesh(new THREE.BoxGeometry(0.042, 0.038, 0.02), pinkTongueMat);
        tongue.position.set(0, 0.372, 0.21);
        charModel.add(nose, tongue);

        // Expressive dark puppy eyes + white shiba eyebrows
        const eyeGeo = new THREE.SphereGeometry(0.026, 10, 10);
        const eyeL = new THREE.Mesh(eyeGeo, darkMat);
        eyeL.position.set(-0.07, 0.475, 0.165);
        const eyeR = new THREE.Mesh(eyeGeo, darkMat);
        eyeR.position.set(0.07, 0.475, 0.165);

        const browGeo = new THREE.BoxGeometry(0.042, 0.016, 0.015);
        const browL = new THREE.Mesh(browGeo, creamCheekMat);
        browL.position.set(-0.07, 0.52, 0.16);
        const browR = new THREE.Mesh(browGeo, creamCheekMat);
        browR.position.set(0.07, 0.52, 0.16);
        charModel.add(eyeL, eyeR, browL, browR);

        // Perky-floppy golden puppy ears
        const earGeo = new THREE.BoxGeometry(0.075, 0.145, 0.095);
        const earL = new THREE.Mesh(earGeo, earCaramelMat);
        earL.position.set(-0.175, 0.52, 0);
        earL.rotation.z = 0.35;
        const earR = new THREE.Mesh(earGeo, earCaramelMat);
        earR.position.set(0.175, 0.52, 0);
        earR.rotation.z = -0.35;
        charModel.add(earL, earR);

        // Wagging puppy tail
        const tail = new THREE.Mesh(
          new THREE.CylinderGeometry(0.025, 0.035, 0.15, 8),
          furGoldMat
        );
        tail.position.set(0, 0.18, -0.19);
        tail.rotation.x = -0.6;
        charModel.add(tail);

        // Cream paws
        const pawGeo = new THREE.BoxGeometry(0.075, 0.04, 0.11);
        const pawL = new THREE.Mesh(pawGeo, creamCheekMat);
        pawL.position.set(-0.08, 0.02, 0.05);
        const pawR = new THREE.Mesh(pawGeo, creamCheekMat);
        pawR.position.set(0.08, 0.02, 0.05);
        charModel.add(pawL, pawR);
      }

      npcGroup.add(charModel);
      npcCharacterGroups.push(charModel);

      // Affordability Ring around NPC feet
      const ringMesh = new THREE.Mesh(
        new THREE.RingGeometry(0.24, 0.31, 28),
        new THREE.MeshBasicMaterial({
          color: canAfford ? 0x52b788 : 0xe63946,
          side: THREE.DoubleSide,
        })
      );
      ringMesh.rotation.x = -Math.PI / 2;
      ringMesh.position.y = 0.02;
      npcGroup.add(ringMesh);

      // Floating Quest Crystal over NPC head
      const crystalMesh = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.09, 0),
        new THREE.MeshStandardMaterial({
          color: canAfford ? 0x52b788 : 0xe63946,
          emissive: canAfford ? 0x2d6a4f : 0x9d0208,
          emissiveIntensity: 0.55,
          roughness: 0.2,
        })
      );
      crystalMesh.position.y = 0.78;
      npcGroup.add(crystalMesh);
      npcCrystals.push(crystalMesh);

      islandGroup.add(npcGroup);
    });

    // 13. Controllable 3D Player Avatar
    const playerGroup = new THREE.Group();
    const initPy = getTerrainHeightAt(playerPosRef.current.x, playerPosRef.current.z, slopeDeg);
    playerGroup.position.set(playerPosRef.current.x, initPy + 0.08, playerPosRef.current.z);

    const pBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.16, 0.32, 14),
      new THREE.MeshStandardMaterial({ color: '#10B981', roughness: 0.45 })
    );
    pBody.position.y = 0.16;
    pBody.castShadow = true;

    const pHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 16, 16),
      new THREE.MeshStandardMaterial({ color: '#FFF1E6', roughness: 0.4 })
    );
    pHead.position.y = 0.41;
    pHead.castShadow = true;

    const pHat = new THREE.Mesh(
      new THREE.SphereGeometry(0.155, 14, 10),
      new THREE.MeshStandardMaterial({ color: '#FFD166', roughness: 0.4 })
    );
    pHat.scale.set(1.1, 0.45, 1.1);
    pHat.position.y = 0.52;

    const pRing = new THREE.Mesh(
      new THREE.RingGeometry(0.2, 0.26, 24),
      new THREE.MeshBasicMaterial({ color: 0xffd166, side: THREE.DoubleSide })
    );
    pRing.rotation.x = -Math.PI / 2;
    pRing.position.y = 0.02;

    playerGroup.add(pBody, pHead, pHat, pRing);
    islandGroup.add(playerGroup);

    // 14. Soft Floating Clouds
    const clouds: THREE.Group[] = [];
    for (let c = 0; c < 3; c++) {
      const cloudGroup = new THREE.Group();
      const cloudMat = new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.9 });
      const p1 = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 12), cloudMat);
      const p2 = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 12), cloudMat);
      p2.position.set(0.26, -0.05, 0.05);
      const p3 = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 12), cloudMat);
      p3.position.set(-0.24, -0.06, -0.04);
      cloudGroup.add(p1, p2, p3);
      cloudGroup.position.set(-2.5 + c * 2.5, 3.1 + (c % 2) * 0.35, -1.8 + c * 0.8);
      scene.add(cloudGroup);
      clouds.push(cloudGroup);
    }

    // Animation loop
    let frameId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      islandGroup.position.y = Math.sin(elapsed * 1.4) * 0.03;

      // Update WASD / Arrow Keys / Touch D-Pad player movement
      const keys = keysPressedRef.current;
      let dx = 0;
      let dz = 0;
      if (keys['w'] || keys['arrowup']) dz -= 1;
      if (keys['s'] || keys['arrowdown']) dz += 1;
      if (keys['a'] || keys['arrowleft']) dx -= 1;
      if (keys['d'] || keys['arrowright']) dx += 1;

      if (dx !== 0 || dz !== 0) {
        const len = Math.hypot(dx, dz);
        const speed = 0.045;
        const nextX = Math.max(-2.7, Math.min(2.7, playerPosRef.current.x + (dx / len) * speed));
        const nextZ = Math.max(-2.2, Math.min(2.2, playerPosRef.current.z + (dz / len) * speed));
        playerPosRef.current.x = nextX;
        playerPosRef.current.z = nextZ;
        playerPosRef.current.rotY = Math.atan2(dx, dz);

        const py = getTerrainHeightAt(nextX, nextZ, slopeDeg);
        const walkHop = Math.abs(Math.sin(elapsed * 12)) * 0.06;
        playerGroup.position.set(nextX, py + 0.08 + walkHop, nextZ);
        playerGroup.rotation.y = playerPosRef.current.rotY;

        let closestNpc: NpcResident | null = null;
        let minDist = 0.9;
        for (const npc of npcs) {
          const dist = Math.hypot(npc.x - nextX, npc.z - nextZ);
          if (dist < minDist) {
            minDist = dist;
            closestNpc = npc;
          }
        }
        setNearbyNpcName(closestNpc ? `${closestNpc.avatarEmoji} ${closestNpc.name}` : null);
      } else {
        const py = getTerrainHeightAt(playerPosRef.current.x, playerPosRef.current.z, slopeDeg);
        playerGroup.position.set(playerPosRef.current.x, py + 0.08, playerPosRef.current.z);
      }

      // Gentle idle animation for 3D Pingu & 3D Gyodong
      npcCharacterGroups.forEach((cg, idx) => {
        cg.position.y = Math.abs(Math.sin(elapsed * 2.6 + idx * 1.5)) * 0.035;
        cg.rotation.y = Math.sin(elapsed * 1.5 + idx * 2.0) * 0.22;
      });

      npcCrystals.forEach((cr, idx) => {
        cr.rotation.y = elapsed * 2.2 + idx;
        cr.position.y = 0.78 + Math.sin(elapsed * 3.0 + idx) * 0.04;
      });

      treeMeshes.forEach((tm, idx) => {
        tm.rotation.z = Math.sin(elapsed * 2.0 + idx) * 0.035;
      });

      cars.forEach((car) => {
        car.mesh.position.x += car.speed * car.dir;
        if (car.dir === 1 && car.mesh.position.x > 3.1) car.mesh.position.x = -3.1;
        if (car.dir === -1 && car.mesh.position.x < -3.1) car.mesh.position.x = 3.1;
      });

      noiseRings.forEach((ring, idx) => {
        const phase = (elapsed * 0.85 + idx * 0.33) % 1;
        const scale = 1 + phase * 3.8;
        ring.scale.set(scale, scale, 1);
        const mat = ring.material as THREE.MeshBasicMaterial;
        mat.opacity = Math.max(0, (1 - phase) * 0.65);
      });

      clouds.forEach((cl, idx) => {
        cl.position.x += 0.003 * (idx % 2 === 0 ? 1 : -1);
        if (cl.position.x > 4) cl.position.x = -4;
        if (cl.position.x < -4) cl.position.x = 4;
      });

      if (waterMesh) {
        waterMesh.position.y = 0.04 + Math.sin(elapsed * 2.5) * 0.015;
      }

      controls.update();
      renderer.render(scene, camera);

      // Project 3D pins & NPCs into 2D screen overlay coordinates
      const rect = renderer.domElement.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const nextPins: ProjectedPin[] = blueprint.pins.map((pin) => {
          const baseY = getTerrainHeightAt(pin.x, pin.z, slopeDeg);
          const worldVec = new THREE.Vector3(pin.x, baseY + 1.35, pin.z);
          worldVec.project(camera);
          const sx = (worldVec.x * 0.5 + 0.5) * rect.width;
          const sy = (-(worldVec.y * 0.5) + 0.5) * rect.height;
          return {
            ...pin,
            screenX: sx,
            screenY: sy,
            visible:
              worldVec.z < 1 &&
              sx > 24 &&
              sx < rect.width - 24 &&
              sy > 24 &&
              sy < rect.height - 24,
          };
        });
        setProjectedPins(nextPins);

        const nextNpcs: ProjectedNpc[] = npcs.map((npc) => {
          const baseY = getTerrainHeightAt(npc.x, npc.z, slopeDeg);
          const worldVec = new THREE.Vector3(npc.x, baseY + 1.0, pinOrNpcZ(npc.z));
          worldVec.project(camera);
          const sx = (worldVec.x * 0.5 + 0.5) * rect.width;
          const sy = (-(worldVec.y * 0.5) + 0.5) * rect.height;
          return {
            npc,
            outcome: npcOutcomes.find((o) => o.npcId === npc.id),
            screenX: sx,
            screenY: sy,
            visible:
              worldVec.z < 1 &&
              sx > 24 &&
              sx < rect.width - 24 &&
              sy > 24 &&
              sy < rect.height - 24,
          };
        });
        setProjectedNpcs(nextNpcs);
      }
    };

    function pinOrNpcZ(z: number) {
      return z;
    }

    animate();

    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
    };
  }, [blueprint, timeOfDay, npcs, npcOutcomes]);

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
    }
  }, [autoRotate]);

  const handleResetCamera = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(6.8, 5.9, 7.8);
      controlsRef.current.target.set(0, 0.65, 0);
      controlsRef.current.update();
    }
  };

  const handleSnapPostcard = () => {
    if (!rendererRef.current) return;
    const dataUrl = rendererRef.current.domElement.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${blueprint.worldTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-3d-memory.png`;
    link.href = dataUrl;
    link.click();
    setSnapshotToast(t('3D 엽서 PNG 저장 완료!', 'Saved 3D Postcard PNG!'));
    setTimeout(() => setSnapshotToast(null), 2600);
  };

  return (
    <div className="relative w-full h-full min-h-[340px] sm:min-h-[460px] rounded-3xl overflow-hidden border border-slate-200/90 bg-[#FEF9F2] shadow-sm select-none">
      {/* Three.js Canvas Mount */}
      <div
        ref={mountRef}
        className="w-full h-full min-h-[340px] sm:min-h-[460px] cursor-grab active:cursor-grabbing"
      />

      {/* Top-Left Clean Stitch Floating Badge */}
      <div className="absolute top-3 left-3 max-w-[230px] sm:max-w-xs bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl px-3 py-2 shadow-xs pointer-events-auto">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold shrink-0">
            🏝️
          </span>
          <div className="min-w-0">
            <h3 className="font-display font-bold text-slate-800 text-xs sm:text-sm truncate">
              {blueprint.worldTitle}
            </h3>
            <p className="text-[11px] text-slate-500 truncate">{blueprint.tagline}</p>
          </div>
        </div>
        <div className="mt-1.5 flex flex-wrap gap-1 text-[10px] font-semibold">
          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/60">
            ⛰️ {t('경사', 'Slope')} {blueprint.terrain.slopeDegrees}°
          </span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60">
            🚇 {t('도보', 'Walk')} {blueprint.transit.walkMinutes}{t('분', 'm')}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200/60">
            🔊 {t('소음', 'Noise')} {blueprint.traffic.noiseLevel}dB
          </span>
        </div>
      </div>

      {/* Top-Right Compact Stitch Control Pill */}
      <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl p-1 shadow-xs">
        <button
          type="button"
          onClick={() => setTimeOfDay('morning')}
          title={t('아침', 'Morning')}
          className={`p-1.5 rounded-xl text-xs transition cursor-pointer ${
            timeOfDay === 'morning'
              ? 'bg-sky-100 text-sky-900'
              : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          <Sun className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setTimeOfDay('golden_hour')}
          title={t('노을', 'Golden Hour')}
          className={`p-1.5 rounded-xl text-xs transition cursor-pointer ${
            timeOfDay === 'golden_hour'
              ? 'bg-amber-100 text-amber-900'
              : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          <Sunset className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setTimeOfDay('twilight')}
          title={t('밤', 'Night')}
          className={`p-1.5 rounded-xl text-xs transition cursor-pointer ${
            timeOfDay === 'twilight'
              ? 'bg-slate-800 text-white'
              : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          <Moon className="w-3.5 h-3.5" />
        </button>

        <div className="h-3.5 w-[1px] bg-slate-200 mx-0.5" />

        <button
          type="button"
          onClick={() => setAutoRotate((v) => !v)}
          title={t('자동 회전', 'Auto-Orbit')}
          className={`p-1.5 rounded-xl text-xs transition cursor-pointer ${
            autoRotate ? 'bg-emerald-100 text-emerald-800' : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setShowPins((v) => !v)}
          title={t('관측 핀 표시/숨김', 'Toggle Observation Pins')}
          className={`p-1.5 rounded-xl text-xs transition cursor-pointer ${
            showPins ? 'bg-orange-100 text-orange-800' : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          {showPins ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
        </button>
        <button
          type="button"
          onClick={() => setShowNpcs((v) => !v)}
          title={t('핑구 & 교동 표시/숨김', 'Toggle Pingu & Gyodong Badges')}
          className={`p-1.5 rounded-xl text-xs transition cursor-pointer ${
            showNpcs ? 'bg-emerald-100 text-emerald-800' : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={handleResetCamera}
          title={t('시점 초기화', 'Reset View')}
          className="p-1.5 rounded-xl text-xs text-slate-500 hover:bg-slate-100 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={handleSnapPostcard}
          title={t('3D 엽서 저장', 'Save 3D Postcard PNG')}
          className="px-2 py-1 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 flex items-center gap-1 cursor-pointer"
        >
          <Camera className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t('저장', 'Snap')}</span>
        </button>
      </div>

      {/* Projected 3D Observation Pins */}
      {showPins &&
        projectedPins.map((pin) =>
          pin.visible ? (
            <button
              key={pin.id}
              type="button"
              onClick={() => onSelectPin(activePinId === pin.id ? null : pin)}
              style={{
                left: `${pin.screenX}px`,
                top: `${pin.screenY}px`,
                transform: 'translate(-50%, -100%)',
              }}
              className={`absolute z-10 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-sm border transition-transform hover:scale-105 flex items-center gap-1 cursor-pointer ${
                activePinId === pin.id
                  ? 'bg-slate-900 text-white border-amber-300 scale-105'
                  : pin.sentiment === 'caution'
                  ? 'bg-rose-50/95 text-rose-800 border-rose-200'
                  : 'bg-white/95 text-slate-800 border-slate-200'
              }`}
            >
              <span>{pin.icon}</span>
              <span className="whitespace-nowrap">{pin.title}</span>
            </button>
          ) : null
        )}

      {/* Projected 3D Pingu & Gyodong Floating Character Badges */}
      {showNpcs &&
        projectedNpcs.map(({ npc, outcome, screenX, screenY, visible }) => {
          if (!visible) return null;
          const isPingu = npc.id === 'npc-pingu' || npc.name.toLowerCase().includes('pingu');
          return (
            <button
              key={npc.id}
              type="button"
              onClick={() => onSelectNpc(selectedNpcId === npc.id ? null : npc.id)}
              style={{
                left: `${screenX}px`,
                top: `${screenY}px`,
                transform: 'translate(-50%, -100%)',
              }}
              className={`absolute z-20 pl-1.5 pr-2.5 py-1 rounded-full text-[11px] font-extrabold shadow-md border-2 transition-transform hover:scale-105 flex items-center gap-1.5 cursor-pointer ${
                selectedNpcId === npc.id
                  ? 'bg-slate-900 text-amber-300 border-amber-300 scale-105'
                  : outcome?.canBuyHome
                  ? 'bg-white/95 text-emerald-900 border-emerald-400'
                  : 'bg-white/95 text-rose-900 border-rose-300'
              }`}
            >
              <CharacterAvatar
                character={isPingu ? 'pingu' : 'gyodong'}
                size={24}
                mood={outcome?.canBuyHome ? 'happy' : 'worried'}
                className="rounded-full bg-slate-100"
              />
              <span className="whitespace-nowrap">
                {lang === 'ko'
                  ? isPingu
                    ? '핑구 (Pingu)'
                    : '교동 (Gyodong)'
                  : isPingu
                  ? 'Pingu (핑구)'
                  : 'Gyodong (교동)'}
              </span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                  outcome?.canBuyHome
                    ? 'bg-emerald-600 text-white'
                    : 'bg-rose-600 text-white'
                }`}
              >
                {outcome?.canBuyHome
                  ? t('🏡 매수가능', '🏡 OK')
                  : t(`💔 -₩${outcome?.shortfallMillionKRW ?? 0}M 부족`, `💔 -₩${outcome?.shortfallMillionKRW ?? 0}M`)}
              </span>
            </button>
          );
        })}

      {/* Mobile & Desktop On-Screen Touch D-Pad (Bottom-Left) */}
      <div
        className="absolute bottom-3 left-3 z-20 bg-white/85 backdrop-blur-md border border-slate-200/80 rounded-2xl p-1.5 shadow-sm flex flex-col items-center gap-0.5 select-none"
        title={t('3D 캐릭터 이동 (WASD / 방향키 가능)', 'Walk 3D Explorer Avatar (or use WASD / Arrow Keys)')}
      >
        <button
          type="button"
          onPointerDown={() => setMoveKey('arrowup', true)}
          onPointerUp={() => setMoveKey('arrowup', false)}
          onPointerLeave={() => setMoveKey('arrowup', false)}
          className="w-7 h-6 rounded-lg bg-slate-100 hover:bg-emerald-100 active:bg-emerald-500 active:text-white flex items-center justify-center text-slate-700 cursor-pointer"
          aria-label="Walk North"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onPointerDown={() => setMoveKey('arrowleft', true)}
            onPointerUp={() => setMoveKey('arrowleft', false)}
            onPointerLeave={() => setMoveKey('arrowleft', false)}
            className="w-7 h-6 rounded-lg bg-slate-100 hover:bg-emerald-100 active:bg-emerald-500 active:text-white flex items-center justify-center text-slate-700 cursor-pointer"
            aria-label="Walk West"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="w-6 h-6 rounded-lg bg-emerald-50 text-[9px] font-extrabold text-emerald-800 flex items-center justify-center">
            {t('이동', 'GO')}
          </span>
          <button
            type="button"
            onPointerDown={() => setMoveKey('arrowright', true)}
            onPointerUp={() => setMoveKey('arrowright', false)}
            onPointerLeave={() => setMoveKey('arrowright', false)}
            className="w-7 h-6 rounded-lg bg-slate-100 hover:bg-emerald-100 active:bg-emerald-500 active:text-white flex items-center justify-center text-slate-700 cursor-pointer"
            aria-label="Walk East"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <button
          type="button"
          onPointerDown={() => setMoveKey('arrowdown', true)}
          onPointerUp={() => setMoveKey('arrowdown', false)}
          onPointerLeave={() => setMoveKey('arrowdown', false)}
          className="w-7 h-6 rounded-lg bg-slate-100 hover:bg-emerald-100 active:bg-emerald-500 active:text-white flex items-center justify-center text-slate-700 cursor-pointer"
          aria-label="Walk South"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom-Right Quick Character Switcher Pills (Pingu & Gyodong) */}
      <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl px-2.5 py-1.5 shadow-sm">
        {nearbyNpcName ? (
          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-extrabold">
            👋 {nearbyNpcName}
          </span>
        ) : (
          <span className="hidden sm:inline text-[11px] font-semibold text-slate-500">
            {t('대화하기:', 'Talk to:')}
          </span>
        )}
        {npcs.map((npc) => {
          const isPingu = npc.id === 'npc-pingu' || npc.name.toLowerCase().includes('pingu');
          const active = selectedNpcId === npc.id;
          return (
            <button
              key={npc.id}
              type="button"
              onClick={() => onSelectNpc(active ? null : npc.id)}
              className={`px-2 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer ${
                active
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <CharacterAvatar character={isPingu ? 'pingu' : 'gyodong'} size={18} />
              <span>{lang === 'ko' ? (isPingu ? '핑구' : '교동') : isPingu ? 'Pingu' : 'Gyodong'}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Pin Detail Popover Card */}
      {activePinId && (
        <div className="absolute bottom-24 left-3 right-3 sm:right-auto sm:max-w-xs bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-3 shadow-lg z-30">
          {blueprint.pins
            .filter((p) => p.id === activePinId)
            .map((p) => (
              <div key={p.id} className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 font-display font-bold text-xs sm:text-sm text-slate-800">
                    <span>{p.icon}</span>
                    <span>{p.title}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{p.detail}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectPin(null)}
                  className="text-xs font-bold text-slate-400 hover:text-slate-700 px-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            ))}
        </div>
      )}

      {/* Selected NPC (Pingu / Gyodong) Dialogue & Policy Popover Card */}
      {selectedNpcId && (
        <div className="absolute bottom-20 right-3 left-3 sm:left-auto sm:max-w-sm bg-white/95 backdrop-blur-md border-2 border-slate-800 rounded-2xl p-3.5 shadow-xl z-30">
          {npcs
            .filter((n) => n.id === selectedNpcId)
            .map((npc) => {
              const out = npcOutcomes.find((o) => o.npcId === npc.id);
              const isPingu = npc.id === 'npc-pingu' || npc.name.toLowerCase().includes('pingu');
              const koNpc = NPC_KO_INFO[npc.id];
              return (
                <div key={npc.id} className="flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-11 h-11 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                        <CharacterAvatar
                          character={isPingu ? 'pingu' : 'gyodong'}
                          size={38}
                          mood={out?.canBuyHome ? 'happy' : 'worried'}
                        />
                      </div>
                      <div>
                        <div className="font-display font-extrabold text-sm text-slate-900">
                          {lang === 'ko' ? `${npc.nameKo} (${npc.name})` : `${npc.name} (${npc.nameKo})`}
                        </div>
                        <div className="text-[11px] font-semibold text-slate-500">
                          {lang === 'ko' && koNpc ? koNpc.roleTitle : npc.roleTitle} ·{' '}
                          {t('목표 주택가', 'Target')} ₩{out?.targetHomePriceMillionKRW ?? 920}M
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onSelectNpc(null)}
                      className="text-xs font-bold text-slate-400 hover:text-slate-700 px-1.5 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  {out && (
                    <>
                      <p className="text-xs text-slate-700 bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 italic leading-relaxed">
                        "
                        {lang === 'ko'
                          ? out.npcReactionDialogueKo || out.npcReactionDialogueEn
                          : out.npcReactionDialogueEn}
                        "
                      </p>
                      <div className="grid grid-cols-3 gap-1.5 text-[11px] text-center font-bold">
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-1.5">
                          <div className="text-[10px] text-slate-500">
                            {t('LTV 한도', 'LTV Cap')}
                          </div>
                          <div className="text-slate-800">₩{out.maxLtvLoanMillionKRW}M</div>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-1.5">
                          <div className="text-[10px] text-slate-500">
                            {t('DSR 한도', 'DSR Cap')}
                          </div>
                          <div className="text-amber-700">₩{out.maxDsrLoanMillionKRW}M</div>
                        </div>
                        <div
                          className={`rounded-xl p-1.5 border ${
                            out.canBuyHome
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                              : 'bg-rose-50 border-rose-300 text-rose-900'
                          }`}
                        >
                          <div className="text-[10px]">{t('총 매수력', 'Total Power')}</div>
                          <div>₩{out.totalPurchasingPowerMillionKRW}M</div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
        </div>
      )}

      {/* Snapshot Toast */}
      {snapshotToast && (
        <div className="absolute top-14 right-3 bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg">
          📸 {snapshotToast}
        </div>
      )}
    </div>
  );
};
