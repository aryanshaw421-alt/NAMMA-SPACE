import React from 'react';
import type { CameraPosition, LoadedModelInfo } from '../../types';
import { Compass, MousePointer } from 'lucide-react';

interface ControlsOverlayProps {
  isLocked: boolean;
  onLockRequest: () => void;
  cameraPosition: CameraPosition;
  modelInfo: LoadedModelInfo | null;
}

export const ControlsOverlay: React.FC<ControlsOverlayProps> = ({
  isLocked,
  onLockRequest,
  cameraPosition,
  modelInfo,
}) => {
  return (
    <div className="controls-overlay-container">
      {/* Center Reticle / Crosshair when locked */}
      {isLocked && (
        <div className="crosshair">
          <div className="crosshair-dot" />
        </div>
      )}

      {/* Click to Start / Lock Banner */}
      {!isLocked && (
        <div className="lock-prompt-backdrop" onClick={onLockRequest}>
          <div className="lock-prompt-card">
            <div className="lock-prompt-icon">
              <MousePointer size={32} />
            </div>
            <h2>Click to Enter First-Person View</h2>
            <p className="lock-prompt-subtitle">
              Interactive 3D Indoor Roaming (WASD + Mouse Look)
            </p>

            <div className="key-guide-grid">
              <div className="key-guide-item">
                <span className="key-cap">W</span>
                <span className="key-cap">A</span>
                <span className="key-cap">S</span>
                <span className="key-cap">D</span>
                <span className="key-desc">Walk & Strafe</span>
              </div>
              <div className="key-guide-item">
                <span className="key-cap">MOUSE</span>
                <span className="key-desc">Look Around</span>
              </div>
              <div className="key-guide-item">
                <span className="key-cap">SHIFT</span>
                <span className="key-desc">Sprint (2x Speed)</span>
              </div>
              <div className="key-guide-item">
                <span className="key-cap">SPACE</span>
                <span className="key-cap">Q</span>
                <span className="key-desc">Elevate / Descend</span>
              </div>
              <div className="key-guide-item">
                <span className="key-cap">ESC</span>
                <span className="key-desc">Release Mouse</span>
              </div>
            </div>

            <button className="primary-cta-btn" onClick={onLockRequest}>
              Start Exploration
            </button>
          </div>
        </div>
      )}

      {/* Floating Spatial HUD Status (Always visible in corner) */}
      <div className="spatial-hud-panel">
        <div className="hud-header">
          <Compass size={14} className="hud-icon" />
          <span>Spatial Telemetry</span>
          <span className={`status-pill ${isLocked ? 'active' : 'idle'}`}>
            {isLocked ? 'ACTIVE LOOK' : 'MOUSE FREE'}
          </span>
        </div>

        <div className="hud-metric-row">
          <span className="metric-label">X:</span>
          <span className="metric-value">{cameraPosition.x.toFixed(2)}m</span>
          <span className="metric-label">Y:</span>
          <span className="metric-value">{cameraPosition.y.toFixed(2)}m</span>
          <span className="metric-label">Z:</span>
          <span className="metric-value">{cameraPosition.z.toFixed(2)}m</span>
        </div>

        {modelInfo && (
          <div className="model-telemetry">
            <div className="telemetry-divider" />
            <div className="telemetry-row">
              <span className="metric-label">Digital Twin:</span>
              <span className="metric-name" title={modelInfo.name}>
                {modelInfo.name}
              </span>
            </div>
            <div className="telemetry-row">
              <span className="metric-label">Mesh:</span>
              <span className="metric-value">
                {modelInfo.triangleCount.toLocaleString()} triangles
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Roaming Controls Mini Legend (Bottom Left when locked) */}
      {isLocked && (
        <div className="roaming-mini-legend">
          <div className="legend-row">
            <span className="legend-keys">WASD</span>
            <span>Move</span>
          </div>
          <div className="legend-row">
            <span className="legend-keys">SHIFT</span>
            <span>Sprint</span>
          </div>
          <div className="legend-row">
            <span className="legend-keys">ESC</span>
            <span>Exit Controls</span>
          </div>
        </div>
      )}
    </div>
  );
};
