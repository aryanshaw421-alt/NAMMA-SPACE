import React from 'react';
import { Box, RotateCcw, HelpCircle, Layers, UploadCloud } from 'lucide-react';
import type { LoadedModelInfo } from '../../types';

interface HeaderProps {
  modelInfo: LoadedModelInfo | null;
  onOpenModelSelector: () => void;
  onResetCamera: () => void;
  onToggleHelp: () => void;
  showReferenceRoom: boolean;
  onToggleReferenceRoom: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  modelInfo,
  onOpenModelSelector,
  onResetCamera,
  onToggleHelp,
  showReferenceRoom,
  onToggleReferenceRoom,
}) => {
  return (
    <header className="viewer-header">
      <div className="header-left">
        <div className="brand-logo">
          <div className="brand-badge">3D</div>
          <div className="brand-text">
            <span className="brand-title">NAMMA SPACE</span>
            <span className="brand-tagline">Indoor Spatial Engine</span>
          </div>
        </div>
        <div className="phase-indicator">
          <span className="phase-dot" />
          <span>ROUND 1: Digital Twin Viewer</span>
        </div>
      </div>

      <div className="header-center">
        {modelInfo ? (
          <div className="active-model-chip">
            <Box size={14} className="chip-icon" />
            <span className="chip-label">Active Twin:</span>
            <span className="chip-name">{modelInfo.name}</span>
          </div>
        ) : (
          <div className="active-model-chip empty">
            <Box size={14} className="chip-icon" />
            <span>Spatial Reference Grid (Ready for 3D Model)</span>
          </div>
        )}
      </div>

      <div className="header-right">
        <button
          className={`nav-action-btn ${showReferenceRoom ? 'active' : ''}`}
          onClick={onToggleReferenceRoom}
          title="Toggle reference room boundaries"
        >
          <Layers size={16} />
          <span>Ref Room</span>
        </button>

        <button
          className="nav-action-btn"
          onClick={onResetCamera}
          title="Reset camera to origin"
        >
          <RotateCcw size={16} />
          <span>Reset Cam</span>
        </button>

        <button
          className="nav-action-btn primary"
          onClick={onOpenModelSelector}
          title="Load 3D Model"
        >
          <UploadCloud size={16} />
          <span>Load 3D Model</span>
        </button>

        <button
          className="nav-action-btn icon-only"
          onClick={onToggleHelp}
          title="Controls & Navigation Guide"
        >
          <HelpCircle size={18} />
        </button>
      </div>
    </header>
  );
};
