import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { useFirstPersonControls } from '../../hooks/useFirstPersonControls';
import type { CameraPosition, LoadedModelInfo, ViewerSettings, PointOfInterest } from '../../types';
import { ControlsOverlay } from './ControlsOverlay';

interface ViewerCanvasProps {
  modelObject: THREE.Object3D | null;
  modelInfo: LoadedModelInfo | null;
  showReferenceRoom: boolean;
  settings: ViewerSettings;
  onResetTrigger?: number;
  pois?: PointOfInterest[];
  selectedPoiId?: string;
  onSelectPoi?: (poi: PointOfInterest) => void;
  teleportTarget?: { x: number; y: number; z: number } | null;
}

export const ViewerCanvas: React.FC<ViewerCanvasProps> = ({
  modelObject,
  modelInfo,
  showReferenceRoom,
  settings,
  onResetTrigger,
  pois = [],
  selectedPoiId,
  onSelectPoi,
  teleportTarget,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Scene instances kept in refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const referenceRoomRef = useRef<THREE.Group | null>(null);
  const poiGroupRef = useRef<THREE.Group | null>(null);
  const animatedBeaconsRef = useRef<{ diamond: THREE.Mesh; ring: THREE.Mesh; baseY: number; offset: number }[]>([]);

  const [cameraPosition, setCameraPosition] = useState<CameraPosition>({ x: 0, y: 1.65, z: 4 });

  // First-person controls hook
  const { isLocked, lock, update, teleport } = useFirstPersonControls({
    camera: cameraRef.current,
    domElement: containerRef.current,
    settings,
    onPositionChange: setCameraPosition,
  });

  // Handle camera reset
  useEffect(() => {
    if (onResetTrigger && onResetTrigger > 0) {
      teleport(0, settings.eyeHeight, 4);
    }
  }, [onResetTrigger, teleport, settings.eyeHeight]);

  // Handle Teleport Target
  useEffect(() => {
    if (teleportTarget) {
      // Teleport slightly offset from target so user faces it
      const targetZ = teleportTarget.z > 0 ? teleportTarget.z - 2.0 : teleportTarget.z + 2.0;
      teleport(teleportTarget.x, settings.eyeHeight, targetZ);
    }
  }, [teleportTarget, teleport, settings.eyeHeight]);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0c10);
    scene.fog = new THREE.FogExp2(0x0a0c10, 0.015);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(settings.fov, width / height, 0.1, 1000);
    camera.position.set(0, settings.eyeHeight, 4);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(10, 20, 15);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 100;
    dirLight.shadow.camera.left = -20;
    dirLight.shadow.camera.right = 20;
    dirLight.shadow.camera.top = 20;
    dirLight.shadow.camera.bottom = -20;
    scene.add(dirLight);

    const hemiLight = new THREE.HemisphereLight(0x384d6b, 0x11161d, 0.6);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);

    // 5. Grid Helper & Base Floor
    const gridHelper = new THREE.GridHelper(60, 60, 0x00f0ff, 0x1a2636);
    gridHelper.position.y = 0.001;
    scene.add(gridHelper);

    const floorGeo = new THREE.PlaneGeometry(100, 100);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0e131b,
      roughness: 0.85,
      metalness: 0.1,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // 6. Model Group
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);
    modelGroupRef.current = modelGroup;

    // 7. POI Beacon Group
    const poiGroup = new THREE.Group();
    scene.add(poiGroup);
    poiGroupRef.current = poiGroup;

    // 8. Reference Architectural Room
    const refRoomGroup = new THREE.Group();
    buildReferenceRoom(refRoomGroup);
    scene.add(refRoomGroup);
    referenceRoomRef.current = refRoomGroup;

    // 9. Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsedTime = clock.getElapsedTime();

      update(delta);

      // Animate 3D POI Beacons
      for (const beacon of animatedBeaconsRef.current) {
        beacon.diamond.rotation.y += delta * 1.5;
        beacon.diamond.position.y = beacon.baseY + Math.sin(elapsedTime * 2.5 + beacon.offset) * 0.08;

        const pulse = 1.0 + Math.sin(elapsedTime * 3.0 + beacon.offset) * 0.25;
        beacon.ring.scale.set(pulse, pulse, 1);
      }

      renderer.render(scene, camera);
    };
    animate();

    // 10. Resize Handling
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [settings.fov, settings.eyeHeight, update]);

  // Update Reference Room visibility
  useEffect(() => {
    if (referenceRoomRef.current) {
      referenceRoomRef.current.visible = showReferenceRoom;
    }
  }, [showReferenceRoom]);

  // Build / Update POI 3D Beacons
  useEffect(() => {
    if (!poiGroupRef.current) return;

    // Clear previous beacons
    while (poiGroupRef.current.children.length > 0) {
      poiGroupRef.current.remove(poiGroupRef.current.children[0]);
    }
    animatedBeaconsRef.current = [];

    const getPoiHexColor = (category: string): number => {
      switch (category.toLowerCase()) {
        case 'laboratory':
          return 0x00e5ff; // Cyan
        case 'equipment':
          return 0xffb300; // Amber
        case 'safety':
          return 0xff3d71; // Crimson
        case 'classroom':
          return 0xa855f7; // Purple
        default:
          return 0x00f0ff;
      }
    };

    pois.forEach((poi, index) => {
      const isSelected = poi.id === selectedPoiId;
      const colorHex = getPoiHexColor(poi.category);
      const beaconGroup = new THREE.Group();
      beaconGroup.position.set(poi.position.x, 0, poi.position.z);
      beaconGroup.userData = { poiId: poi.id };

      const beaconY = Math.max(0.9, poi.position.y);

      // 1. Vertical Glowing Stem
      const stemGeo = new THREE.CylinderGeometry(0.015, 0.015, beaconY, 8);
      const stemMat = new THREE.MeshBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity: isSelected ? 0.95 : 0.6,
      });
      const stem = new THREE.Mesh(stemGeo, stemMat);
      stem.position.y = beaconY / 2;
      stem.userData = { poiId: poi.id };
      beaconGroup.add(stem);

      // 2. Floating Diamond (Octahedron)
      const diamondGeo = new THREE.OctahedronGeometry(isSelected ? 0.32 : 0.22);
      const diamondMat = new THREE.MeshStandardMaterial({
        color: colorHex,
        emissive: colorHex,
        emissiveIntensity: isSelected ? 1.0 : 0.65,
        roughness: 0.2,
        metalness: 0.8,
      });
      const diamond = new THREE.Mesh(diamondGeo, diamondMat);
      diamond.position.y = beaconY;
      diamond.castShadow = true;
      diamond.userData = { poiId: poi.id };
      beaconGroup.add(diamond);

      // 3. Ground Pulse Ring
      const ringGeo = new THREE.RingGeometry(0.18, 0.28, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity: isSelected ? 0.9 : 0.5,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.015;
      ring.userData = { poiId: poi.id };
      beaconGroup.add(ring);

      poiGroupRef.current!.add(beaconGroup);

      animatedBeaconsRef.current.push({
        diamond,
        ring,
        baseY: beaconY,
        offset: index * 0.7,
      });
    });
  }, [pois, selectedPoiId]);

  // Raycast Click Handler to Select POIs
  const handleCanvasPointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      // If camera is currently locked in first-person, don't intercept pointer raycasts
      if (isLocked) return;

      const canvas = canvasRef.current;
      const camera = cameraRef.current;
      const poiGroup = poiGroupRef.current;
      if (!canvas || !camera || !poiGroup) return;

      const rect = canvas.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(poiGroup.children, true);
      if (intersects.length > 0) {
        let current: THREE.Object3D | null = intersects[0].object;
        while (current && !current.userData.poiId && current.parent) {
          current = current.parent;
        }

        if (current && current.userData.poiId && onSelectPoi) {
          const matchedPoi = pois.find((p) => p.id === current!.userData.poiId);
          if (matchedPoi) {
            e.stopPropagation();
            onSelectPoi(matchedPoi);
          }
        }
      }
    },
    [isLocked, onSelectPoi, pois]
  );

  // Mount/Unmount Loaded Model Object
  useEffect(() => {
    if (!modelGroupRef.current) return;

    // Clear previous model children
    while (modelGroupRef.current.children.length > 0) {
      modelGroupRef.current.remove(modelGroupRef.current.children[0]);
    }

    if (modelObject) {
      // Auto-normalize scale and center if bounding box is known
      const box = new THREE.Box3().setFromObject(modelObject);
      const center = box.getCenter(new THREE.Vector3());

      // Center model at ground level
      modelObject.position.x = -center.x;
      modelObject.position.y = -box.min.y; // Sit on ground
      modelObject.position.z = -center.z;

      modelObject.traverse((node) => {
        if ((node as THREE.Mesh).isMesh) {
          const mesh = node as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;
        }
      });

      modelGroupRef.current.add(modelObject);

      // Teleport camera to view the model
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.z, 2);
      teleport(0, settings.eyeHeight, maxDim * 0.8 + 1);
    }
  }, [modelObject, settings.eyeHeight, teleport]);

  return (
    <div className="viewer-viewport-container" ref={containerRef}>
      <canvas
        ref={canvasRef}
        className="three-canvas"
        onPointerDown={handleCanvasPointerDown}
      />

      <ControlsOverlay
        isLocked={isLocked}
        onLockRequest={lock}
        cameraPosition={cameraPosition}
        modelInfo={modelInfo}
      />
    </div>
  );
};

/**
 * Builds a clean architectural spatial bounding room (12m x 8m x 3.2m).
 * Provides spatial context and collision bounds for free roaming.
 */
function buildReferenceRoom(group: THREE.Group) {
  const roomWidth = 12;
  const roomDepth = 10;
  const roomHeight = 3.2;

  // Material for architectural reference walls (subtle semi-transparent glassmorphism)
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x182232,
    roughness: 0.5,
    metalness: 0.1,
    transparent: true,
    opacity: 0.65,
    side: THREE.DoubleSide,
  });

  const wireframeMat = new THREE.LineBasicMaterial({
    color: 0x00f0ff,
    transparent: true,
    opacity: 0.3,
  });

  // Ceiling
  const ceilingGeo = new THREE.PlaneGeometry(roomWidth, roomDepth);
  const ceiling = new THREE.Mesh(ceilingGeo, wallMat);
  ceiling.position.y = roomHeight;
  ceiling.rotation.x = Math.PI / 2;
  group.add(ceiling);

  // Back Wall
  const backWallGeo = new THREE.PlaneGeometry(roomWidth, roomHeight);
  const backWall = new THREE.Mesh(backWallGeo, wallMat);
  backWall.position.set(0, roomHeight / 2, -roomDepth / 2);
  group.add(backWall);

  // Front Wall (with door opening)
  const frontWallLeft = new THREE.Mesh(
    new THREE.PlaneGeometry((roomWidth - 2) / 2, roomHeight),
    wallMat
  );
  frontWallLeft.position.set(-(roomWidth / 4 + 0.5), roomHeight / 2, roomDepth / 2);
  group.add(frontWallLeft);

  const frontWallRight = new THREE.Mesh(
    new THREE.PlaneGeometry((roomWidth - 2) / 2, roomHeight),
    wallMat
  );
  frontWallRight.position.set(roomWidth / 4 + 0.5, roomHeight / 2, roomDepth / 2);
  group.add(frontWallRight);

  // Left Wall
  const leftWallGeo = new THREE.PlaneGeometry(roomDepth, roomHeight);
  const leftWall = new THREE.Mesh(leftWallGeo, wallMat);
  leftWall.position.set(-roomWidth / 2, roomHeight / 2, 0);
  leftWall.rotation.y = Math.PI / 2;
  group.add(leftWall);

  // Right Wall
  const rightWall = new THREE.Mesh(leftWallGeo, wallMat);
  rightWall.position.set(roomWidth / 2, roomHeight / 2, 0);
  rightWall.rotation.y = -Math.PI / 2;
  group.add(rightWall);

  // Bounding Edges Helper for modern wireframe look
  const boxGeo = new THREE.BoxGeometry(roomWidth, roomHeight, roomDepth);
  const edges = new THREE.EdgesGeometry(boxGeo);
  const line = new THREE.LineSegments(edges, wireframeMat);
  line.position.y = roomHeight / 2;
  group.add(line);
}
