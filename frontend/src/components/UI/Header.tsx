import React from 'react';
import { Box, RotateCcw, HelpCircle, Layers, UploadCloud, MapPin, Plus } from 'lucide-react';
import type { LoadedModelInfo } from '../../types';

interface HeaderProps {
  modelInfo: LoadedModelInfo | null;
  onOpenModelSelector: () => void;
  onResetCamera: () => void;
  onToggleHelp: () => void;
  showReferenceRoom: boolean;
  onToggleReferenceRoom: () => void;
  poiCount: number;
  isPoiListOpen: boolean;
  onTogglePoiList: () => void;
  onOpenAddPoi: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  modelInfo,
  onOpenModelSelector,
  onResetCamera,
  onToggleHelp,
  showReferenceRoom,
  onToggleReferenceRoom,
  poiCount,
  isPoiListOpen,
  onTogglePoiList,
  onOpenAddPoi,
}) => {
  return (
    <header className="viewer-header">
      <div className="header-left">
        <div className="brand-logo">
          <div className="brand-badge">3D</div>
          <div className="brand-text">
            <span className="brand-title">NAMMA SPACE</span>
            <span className="brand-tagline">Campus Digital Twin Engine</span>
          </div>
        </div>
        <div className="phase-indicator">
          <span className="phase-dot" />
          <span>ROUND 2: Spatial Annotations & POIs</span>
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
            <span>Campus Innovation Hub (Spatial Reference)</span>
          </div>
        )}
      </div>

      <div className="header-right">
        {/* POI List Button */}
        <button
          className={`nav-action-btn ${isPoiListOpen ? 'active' : ''}`}
          onClick={onTogglePoiList}
          title="Open POI & Annotations Drawer"
        >
          <MapPin size={16} />
          <span>Pins ({poiCount})</span>
        </button>

        {/* Add POI Button */}
        <button
          className="nav-action-btn"
          onClick={onOpenAddPoi}
          title="Tag new Point of Interest"
        >
          <Plus size={16} />
          <span>Add Pin</span>
        </button>

        {/* Reference Room Toggle */}
        <button
          className={`nav-action-btn ${showReferenceRoom ? 'active' : ''}`}
          onClick={onToggleReferenceRoom}
          title="Toggle reference room boundaries"
        >
          <Layers size={16} />
          <span>Ref Room</span>
        </button>

        {/* Reset Camera */}
        <button
          className="nav-action-btn"
          onClick={onResetCamera}
          title="Reset camera to origin"
        >
          <RotateCcw size={16} />
          <span>Reset Cam</span>
        </button>

        {/* Load 3D Model */}
        <button
          className="nav-action-btn primary"
          onClick={onOpenModelSelector}
          title="Load 3D Model"
        >
          <UploadCloud size={16} />
          <span>Load 3D</span>
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
