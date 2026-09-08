import React from 'react';
import { X, Trash2, Compass, Tag, Calendar } from 'lucide-react';
import type { PointOfInterest, CameraPosition } from '../../types';

interface PoiDetailsModalProps {
  poi: PointOfInterest | null;
  userPosition: CameraPosition;
  onClose: () => void;
  onDelete: (id: string) => void;
  onTeleportToPoi?: (position: { x: number; y: number; z: number }) => void;
}

export const PoiDetailsModal: React.FC<PoiDetailsModalProps> = ({
  poi,
  userPosition,
  onClose,
  onDelete,
  onTeleportToPoi,
}) => {
  if (!poi) return null;

  // Calculate Euclidean distance in meters
  const dx = poi.position.x - userPosition.x;
  const dy = poi.position.y - userPosition.y;
  const dz = poi.position.z - userPosition.z;
  const distance = Math.sqrt(dx * dx + dy * dy + dz * dz).toFixed(1);

  const getCategoryColor = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'laboratory':
        return '#00e5ff';
      case 'equipment':
        return '#ffb300';
      case 'safety':
        return '#ff3d71';
      case 'classroom':
        return '#a855f7';
      default:
        return '#00f0ff';
    }
  };

  const categoryColor = getCategoryColor(poi.category);

  return (
    <div className="poi-details-card animate-slide-in">
      <div className="poi-card-header">
        <div className="poi-title-section">
          <div
            className="poi-category-badge"
            style={{ borderColor: `${categoryColor}40`, backgroundColor: `${categoryColor}15` }}
          >
            <span className="category-dot" style={{ backgroundColor: categoryColor }} />
            <span style={{ color: categoryColor }}>{poi.category}</span>
          </div>
          <h3 className="poi-title">{poi.title}</h3>
        </div>
        <button className="poi-close-btn" onClick={onClose} title="Close card">
          <X size={18} />
        </button>
      </div>

      <div className="poi-card-body">
        {/* Metric Telemetry Row */}
        <div className="poi-telemetry-grid">
          <div className="poi-metric-box">
            <span className="metric-label">Proximity</span>
            <span className="metric-val">{distance} m</span>
          </div>
          <div className="poi-metric-box">
            <span className="metric-label">Coordinates (X, Y, Z)</span>
            <span className="metric-val mono">
              [{poi.position.x.toFixed(1)}, {poi.position.y.toFixed(1)}, {poi.position.z.toFixed(1)}]
            </span>
          </div>
        </div>

        {/* Description */}
        {poi.description && (
          <div className="poi-desc-section">
            <p className="poi-desc">{poi.description}</p>
          </div>
        )}

        {/* Tags */}
        {poi.tags && poi.tags.length > 0 && (
          <div className="poi-tags-list">
            {poi.tags.map((tag, idx) => (
              <span key={idx} className="poi-tag-pill">
                <Tag size={11} />
                <span>{tag}</span>
              </span>
            ))}
          </div>
        )}

        {poi.createdAt && (
          <div className="poi-timestamp">
            <Calendar size={12} />
            <span>Logged: {new Date(poi.createdAt).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      <div className="poi-card-footer">
        {onTeleportToPoi && (
          <button
            className="poi-action-btn primary"
            onClick={() => onTeleportToPoi(poi.position)}
          >
            <Compass size={15} />
            <span>Teleport Near</span>
          </button>
        )}
        <button
          className="poi-action-btn danger"
          onClick={() => onDelete(poi.id)}
          title="Delete this point of interest"
        >
          <Trash2 size={15} />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
};
