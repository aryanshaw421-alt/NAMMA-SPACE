import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import type { CameraPosition, ViewerSettings } from '../types';

interface FirstPersonControlsProps {
  camera: THREE.PerspectiveCamera | null;
  domElement: HTMLElement | null;
  settings: ViewerSettings;
  onPositionChange?: (pos: CameraPosition) => void;
}

export function useFirstPersonControls({
  camera,
  domElement,
  settings,
  onPositionChange,
}: FirstPersonControlsProps) {
  const [isLocked, setIsLocked] = useState(false);

  // Movement keys state
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());

  // Euler rotation state for camera
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const minPolarAngle = 0; // Look up limit (radians)
  const maxPolarAngle = Math.PI; // Look down limit (radians)

  // Request pointer lock
  const lock = useCallback(() => {
    if (domElement && !isLocked) {
      domElement.requestPointerLock();
    }
  }, [domElement, isLocked]);

  // Release pointer lock
  const unlock = useCallback(() => {
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
  }, []);

  // Set up mouse look & keyboard listeners
  useEffect(() => {
    if (!domElement || !camera) return;

    // Initialize euler from camera rotation
    euler.current.setFromQuaternion(camera.quaternion);

    const onMouseMove = (event: MouseEvent) => {
      if (!isLocked) return;

      const movementX = event.movementX || 0;
      const movementY = event.movementY || 0;

      euler.current.y -= movementX * 0.002 * settings.mouseSensitivity;
      euler.current.x -= movementY * 0.002 * settings.mouseSensitivity;

      // Clamp vertical look (pitch) to avoid gimbal inversion
      euler.current.x = Math.max(
        Math.PI / 2 - maxPolarAngle + 0.05,
        Math.min(Math.PI / 2 - minPolarAngle - 0.05, euler.current.x)
      );

      camera.quaternion.setFromEuler(euler.current);
    };

    const onPointerLockChange = () => {
      const locked = document.pointerLockElement === domElement;
      setIsLocked(locked);
    };

    const onPointerLockError = (e: Event) => {
      console.warn('PointerLock Error:', e);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      keysPressed.current[event.code] = true;
    };

    const onKeyUp = (event: KeyboardEvent) => {
      keysPressed.current[event.code] = false;
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('pointerlockchange', onPointerLockChange);
    document.addEventListener('pointerlockerror', onPointerLockError);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      document.removeEventListener('pointerlockerror', onPointerLockError);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [domElement, camera, isLocked, settings.mouseSensitivity]);

  // Update physics / movement on each animation frame
  const update = useCallback(
    (delta: number) => {
      if (!camera || !isLocked) return;

      // Damping / deceleration
      velocity.current.x -= velocity.current.x * 10.0 * delta;
      velocity.current.z -= velocity.current.z * 10.0 * delta;
      velocity.current.y -= velocity.current.y * 10.0 * delta;

      direction.current.z = Number(keysPressed.current['KeyW'] || keysPressed.current['ArrowUp'] || 0) -
        Number(keysPressed.current['KeyS'] || keysPressed.current['ArrowDown'] || 0);
      direction.current.x = Number(keysPressed.current['KeyD'] || keysPressed.current['ArrowRight'] || 0) -
        Number(keysPressed.current['KeyA'] || keysPressed.current['ArrowLeft'] || 0);
      direction.current.y = Number(keysPressed.current['KeyE'] || keysPressed.current['Space'] || 0) -
        Number(keysPressed.current['KeyQ'] || keysPressed.current['ControlLeft'] || 0);

      direction.current.normalize(); // Ensure consistent speed in all directions

      const currentSpeed = (keysPressed.current['ShiftLeft'] || keysPressed.current['ShiftRight'])
        ? settings.moveSpeed * settings.sprintMultiplier
        : settings.moveSpeed;

      if (keysPressed.current['KeyW'] || keysPressed.current['ArrowUp'] || keysPressed.current['KeyS'] || keysPressed.current['ArrowDown']) {
        velocity.current.z -= direction.current.z * currentSpeed * delta;
      }
      if (keysPressed.current['KeyA'] || keysPressed.current['ArrowLeft'] || keysPressed.current['KeyD'] || keysPressed.current['ArrowRight']) {
        velocity.current.x -= direction.current.x * currentSpeed * delta;
      }
      if (keysPressed.current['Space'] || keysPressed.current['KeyE'] || keysPressed.current['KeyQ'] || keysPressed.current['ControlLeft']) {
        velocity.current.y += direction.current.y * currentSpeed * delta;
      }

      // Apply forward / strafe relative to camera orientation
      const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
      // Project forward on horizontal plane for walking feel
      forward.y = 0;
      forward.normalize();

      const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
      right.y = 0;
      right.normalize();

      camera.position.addScaledVector(forward, -velocity.current.z * delta * 20);
      camera.position.addScaledVector(right, -velocity.current.x * delta * 20);
      camera.position.y += velocity.current.y * delta * 20;

      // Keep minimum height if ground clamp is enabled
      if (camera.position.y < settings.eyeHeight) {
        camera.position.y = settings.eyeHeight;
        velocity.current.y = 0;
      }

      if (onPositionChange) {
        onPositionChange({
          x: camera.position.x,
          y: camera.position.y,
          z: camera.position.z,
        });
      }
    },
    [camera, isLocked, settings, onPositionChange]
  );

  const teleport = useCallback(
    (x: number, y: number, z: number) => {
      if (camera) {
        camera.position.set(x, y, z);
        velocity.current.set(0, 0, 0);
      }
    },
    [camera]
  );

  return {
    isLocked,
    lock,
    unlock,
    update,
    teleport,
  };
}
