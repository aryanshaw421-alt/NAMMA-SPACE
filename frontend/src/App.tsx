import React, { useState } from 'react';
import * as THREE from 'three';
import { Header } from './components/UI/Header';
import { ViewerCanvas } from './components/Viewer/ViewerCanvas';
import { ModelSelector } from './components/Viewer/ModelSelector';
import { useModelLoader } from './hooks/useModelLoader';
import type { ViewerSettings } from './types';
import './styles/viewer.css';

export const App: React.FC = () => {
  const [modelObject, setModelObject] = useState<THREE.Object3D | null>(null);
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
  const [showReferenceRoom, setShowReferenceRoom] = useState(true);
  const [resetTrigger, setResetTrigger] = useState(0);

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

  return (
    <div className="app-root">
      <Header
        modelInfo={currentModelInfo}
        onOpenModelSelector={() => setIsModelSelectorOpen(true)}
        onResetCamera={handleResetCamera}
        onToggleHelp={() => {}}
        showReferenceRoom={showReferenceRoom}
        onToggleReferenceRoom={() => setShowReferenceRoom(!showReferenceRoom)}
      />

      <main className="viewer-main-content">
        <ViewerCanvas
          modelObject={modelObject}
          modelInfo={currentModelInfo}
          showReferenceRoom={showReferenceRoom}
          settings={settings}
          onResetTrigger={resetTrigger}
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
