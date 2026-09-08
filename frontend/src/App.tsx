import React, { useState, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { Header } from './components/UI/Header';
import { ViewerCanvas } from './components/Viewer/ViewerCanvas';
import { ModelSelector } from './components/Viewer/ModelSelector';
import { PoiDetailsModal } from './components/UI/PoiDetailsModal';
import { PoiListDrawer } from './components/UI/PoiListDrawer';
import { AddPoiModal } from './components/UI/AddPoiModal';
import { useModelLoader } from './hooks/useModelLoader';
import { poiService } from './services/poiService';
import type { ViewerSettings, PointOfInterest, CameraPosition } from './types';
import './styles/viewer.css';

export const App: React.FC = () => {
  const [modelObject, setModelObject] = useState<THREE.Object3D | null>(null);
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
  const [showReferenceRoom, setShowReferenceRoom] = useState(true);
  const [resetTrigger, setResetTrigger] = useState(0);

  // POI & Spatial Annotation State
  const [pois, setPois] = useState<PointOfInterest[]>([]);
  const [selectedPoi, setSelectedPoi] = useState<PointOfInterest | null>(null);
  const [isPoiListOpen, setIsPoiListOpen] = useState(false);
  const [isAddPoiOpen, setIsAddPoiOpen] = useState(false);
  const [teleportTarget, setTeleportTarget] = useState<{ x: number; y: number; z: number } | null>(null);
  const [userPosition, setUserPosition] = useState<CameraPosition>({ x: 0, y: 1.65, z: 4 });

  const [settings] = useState<ViewerSettings>({
    moveSpeed: 6.0,
    sprintMultiplier: 2.2,
    mouseSensitivity: 1.0,
    fov: 65,
    showGrid: true,
    showAxes: true,
    eyeHeight: 1.65, // 1.65 meters average eye-level
  });

  const {
    loading,
    progress,
    error,
    currentModelInfo,
    loadFromUrl,
    loadFromFile,
  } = useModelLoader();

  // Load POIs on mount
  useEffect(() => {
    poiService.getPOIs().then((loaded) => {
      setPois(loaded);
    });
  }, []);

  const handleSelectLocalFile = async (file: File) => {
    try {
      const result = await loadFromFile(file);
      setModelObject(result.object);
    } catch (err) {
      console.error('Failed to load local file:', err);
    }
  };

  const handleSelectRemoteUrl = async (url: string, name: string) => {
    try {
      const result = await loadFromUrl(url, name);
      setModelObject(result.object);
    } catch (err) {
      console.error('Failed to load remote model:', err);
    }
  };

  const handleResetCamera = () => {
    setResetTrigger((prev) => prev + 1);
  };

  const handleSelectPoi = useCallback((poi: PointOfInterest) => {
    setSelectedPoi(poi);
  }, []);

  const handleDeletePoi = async (id: string) => {
    await poiService.removePOI(id);
    setPois((prev) => prev.filter((p) => p.id !== id));
    if (selectedPoi?.id === id) {
      setSelectedPoi(null);
    }
  };

  const handleAddPoi = async (poiData: Omit<PointOfInterest, 'id' | 'createdAt'>) => {
    const created = await poiService.addPOI(poiData);
    setPois((prev) => [...prev, created]);
    setSelectedPoi(created);
  };

  const handleTeleportToPoi = (pos: { x: number; y: number; z: number }) => {
    setTeleportTarget({ ...pos });
    setUserPosition({ x: pos.x, y: settings.eyeHeight, z: pos.z });
    // Reset trigger after short timeout so repeated clicks work
    setTimeout(() => setTeleportTarget(null), 100);
  };

  return (
    <div className="app-root">
      <Header
        modelInfo={currentModelInfo}
        onOpenModelSelector={() => setIsModelSelectorOpen(true)}
        onResetCamera={handleResetCamera}
        onToggleHelp={() => {}}
        showReferenceRoom={showReferenceRoom}
        onToggleReferenceRoom={() => setShowReferenceRoom(!showReferenceRoom)}
        poiCount={pois.length}
        isPoiListOpen={isPoiListOpen}
        onTogglePoiList={() => setIsPoiListOpen(!isPoiListOpen)}
        onOpenAddPoi={() => setIsAddPoiOpen(true)}
      />

      <main className="viewer-main-content">
        <ViewerCanvas
          modelObject={modelObject}
          modelInfo={currentModelInfo}
          showReferenceRoom={showReferenceRoom}
          settings={settings}
          onResetTrigger={resetTrigger}
          pois={pois}
          selectedPoiId={selectedPoi?.id}
          onSelectPoi={handleSelectPoi}
          teleportTarget={teleportTarget}
        />

        {/* POI Details Floating Card */}
        {selectedPoi && (
          <PoiDetailsModal
            poi={selectedPoi}
            userPosition={userPosition}
            onClose={() => setSelectedPoi(null)}
            onDelete={handleDeletePoi}
            onTeleportToPoi={handleTeleportToPoi}
          />
        )}

        {/* POI List Drawer */}
        <PoiListDrawer
          isOpen={isPoiListOpen}
          onClose={() => setIsPoiListOpen(false)}
          pois={pois}
          selectedPoiId={selectedPoi?.id}
          userPosition={userPosition}
          onSelectPoi={(poi) => {
            setSelectedPoi(poi);
            setIsPoiListOpen(false);
          }}
          onOpenAddPoi={() => {
            setIsPoiListOpen(false);
            setIsAddPoiOpen(true);
          }}
          onTeleportToPoi={handleTeleportToPoi}
        />

        {/* Add POI Modal */}
        <AddPoiModal
          isOpen={isAddPoiOpen}
          onClose={() => setIsAddPoiOpen(false)}
          userPosition={userPosition}
          onSave={handleAddPoi}
        />

        {loading && (
          <div className="loading-screen">
            <div className="spinner" />
            <div className="loading-text">Loading 3D Digital Twin...</div>
            <div className="loading-progress-bar">
              <div
                className="loading-progress-fill"
                style={{ width: `${progress > 0 ? progress : 50}%` }}
              />
            </div>
          </div>
        )}

        {error && (
          <div className="error-toast">
            <span>{error}</span>
          </div>
        )}
      </main>

      <ModelSelector
        isOpen={isModelSelectorOpen}
        onClose={() => setIsModelSelectorOpen(false)}
        onSelectLocalFile={handleSelectLocalFile}
        onSelectRemoteUrl={handleSelectRemoteUrl}
        showReferenceRoom={showReferenceRoom}
        onToggleReferenceRoom={() => setShowReferenceRoom(!showReferenceRoom)}
      />
    </div>
  );
};

export default App;
