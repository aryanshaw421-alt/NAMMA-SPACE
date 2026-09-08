import React, { useState } from 'react';
import { MapPin, X, Plus, Compass, ChevronRight } from 'lucide-react';
import type { CameraPosition, PointOfInterest } from '../../types';

interface PoiListDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  pois: PointOfInterest[];
  selectedPoiId?: string;
  userPosition: CameraPosition;
  onSelectPoi: (poi: PointOfInterest) => void;
  onOpenAddPoi: () => void;
  onTeleportToPoi: (position: { x: number; y: number; z: number }) => void;
}

export const PoiListDrawer: React.FC<PoiListDrawerProps> = ({
  isOpen,
  onClose,
  pois,
  selectedPoiId,
  userPosition,
  onSelectPoi,
  onOpenAddPoi,
  onTeleportToPoi,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const categories = ['all', 'Laboratory', 'Equipment', 'Safety', 'Classroom'];

  const filteredPois = pois.filter((poi) => {
    const matchesCat =
      selectedCategory === 'all' ||
      poi.category.toLowerCase() === selectedCategory.toLowerCase();
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      poi.title.toLowerCase().includes(q) ||
      poi.category.toLowerCase().includes(q) ||
      (poi.description || '').toLowerCase().includes(q) ||
      (poi.tags || []).some((t) => t.toLowerCase().includes(q));
    return matchesCat && matchesQuery;
  });

  const getDistance = (pos: { x: number; y: number; z: number }) => {
    const dx = pos.x - userPosition.x;
    const dy = pos.y - userPosition.y;
    const dz = pos.z - userPosition.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz).toFixed(1);
  };

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

  return (
    <div className="poi-drawer-overlay animate-fade-in" onClick={onClose}>
      <aside className="poi-drawer animate-slide-left" onClick={(e) => e.stopPropagation()}>
        <div className="poi-drawer-header">
          <div className="drawer-title-row">
            <div className="drawer-icon-wrap">
              <MapPin size={18} />
            </div>
            <div>
              <h3>Campus Spatial POIs</h3>
              <span className="drawer-badge">{pois.length} Registered Nodes</span>
            </div>
          </div>
          <button className="drawer-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Quick Search & Add Bar */}
        <div className="drawer-search-row">
          <input
            type="text"
            placeholder="Filter pins by name, tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="drawer-search-input"
          />
          <button className="drawer-add-btn" onClick={onOpenAddPoi} title="Register new POI">
            <Plus size={16} />
            <span>Add</span>
          </button>
        </div>

        {/* Category Filter Chips */}
        <div className="drawer-category-chips">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`cat-chip ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === 'all' ? 'All Pins' : cat}
            </button>
          ))}
        </div>

        {/* POI List Items */}
        <div className="drawer-poi-list">
          {filteredPois.length === 0 ? (
            <div className="drawer-empty-state">
              <p>No spatial pins match your filter</p>
            </div>
          ) : (
            filteredPois.map((poi) => {
              const color = getCategoryColor(poi.category);
              const dist = getDistance(poi.position);
              const isSelected = selectedPoiId === poi.id;

              return (
                <div
                  key={poi.id}
                  className={`drawer-poi-card ${isSelected ? 'active' : ''}`}
                  onClick={() => onSelectPoi(poi)}
                >
                  <div className="card-top-row">
                    <span
                      className="card-category-dot"
                      style={{ backgroundColor: color }}
                    />
                    <span className="card-category-name" style={{ color }}>
                      {poi.category}
                    </span>
                    <span className="card-dist-pill">{dist} m</span>
                  </div>

                  <h4 className="card-poi-title">{poi.title}</h4>
                  {poi.description && (
                    <p className="card-poi-desc">{poi.description}</p>
                  )}

                  <div className="card-actions">
                    <button
                      className="card-teleport-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTeleportToPoi(poi.position);
                      }}
                      title="Fly camera to this node"
                    >
                      <Compass size={13} />
                      <span>Teleport</span>
                    </button>
                    <span className="card-view-hint">
                      View details <ChevronRight size={13} />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>
    </div>
  );
};
