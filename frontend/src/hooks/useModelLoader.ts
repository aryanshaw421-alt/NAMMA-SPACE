import { useState, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import type { LoadedModelInfo } from '../types';

interface LoadModelResult {
  object: THREE.Object3D;
  info: LoadedModelInfo;
}

export function useModelLoader() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [currentModelInfo, setCurrentModelInfo] = useState<LoadedModelInfo | null>(null);

  const calculateModelStats = (object: THREE.Object3D, name: string, format: 'glb' | 'gltf' | 'obj'): LoadedModelInfo => {
    let vertexCount = 0;
    let triangleCount = 0;

    object.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const geometry = mesh.geometry;
        if (geometry) {
          if (geometry.index) {
            triangleCount += geometry.index.count / 3;
          } else if (geometry.attributes.position) {
            triangleCount += geometry.attributes.position.count / 3;
          }

          if (geometry.attributes.position) {
            vertexCount += geometry.attributes.position.count;
          }
        }
      }
    });

    const box = new THREE.Box3().setFromObject(object);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    return {
      name,
      format,
      vertexCount,
      triangleCount,
      boundingBox: {
        size: { x: size.x, y: size.y, z: size.z },
        center: { x: center.x, y: center.y, z: center.z },
      },
    };
  };

  const loadFromUrl = useCallback(
    (url: string, name: string): Promise<LoadModelResult> => {
      return new Promise((resolve, reject) => {
        setLoading(true);
        setProgress(0);
        setError(null);

        const lowerUrl = url.toLowerCase();
        const isObj = lowerUrl.endsWith('.obj');
        const format: 'glb' | 'gltf' | 'obj' = isObj ? 'obj' : lowerUrl.endsWith('.gltf') ? 'gltf' : 'glb';

        if (isObj) {
          const loader = new OBJLoader();
          loader.load(
            url,
            (obj) => {
              const info = calculateModelStats(obj, name, format);
              setCurrentModelInfo(info);
              setLoading(false);
              resolve({ object: obj, info });
            },
            (xhr) => {
              if (xhr.total > 0) {
                setProgress(Math.round((xhr.loaded / xhr.total) * 100));
              }
            },
            (err) => {
              const msg = err instanceof Error ? err.message : 'Network error or model file could not be read';
              setError(`Failed to load OBJ model: ${msg}`);
              setLoading(false);
              reject(err);
            }
          );
        } else {
          const loader = new GLTFLoader();
          loader.load(
            url,
            (gltf) => {
              const info = calculateModelStats(gltf.scene, name, format);
              setCurrentModelInfo(info);
              setLoading(false);
              resolve({ object: gltf.scene, info });
            },
            (xhr) => {
              if (xhr.total > 0) {
                setProgress(Math.round((xhr.loaded / xhr.total) * 100));
              }
            },
            (err) => {
              const msg = err instanceof Error ? err.message : 'Network error or model file not found';
              setError(`Failed to load GLTF/GLB model: ${msg}`);
              setLoading(false);
              reject(err);
            }
          );
        }
      });
    },
    []
  );

  const loadFromFile = useCallback(
    (file: File): Promise<LoadModelResult> => {
      return new Promise((resolve, reject) => {
        const fileUrl = URL.createObjectURL(file);
        loadFromUrl(fileUrl, file.name)
          .then((res) => {
            resolve(res);
          })
          .catch((err) => {
            reject(err);
          });
      });
    },
    [loadFromUrl]
  );

  return {
    loading,
    progress,
    error,
    currentModelInfo,
    loadFromUrl,
    loadFromFile,
  };
}
