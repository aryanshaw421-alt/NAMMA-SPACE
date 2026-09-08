import React, { useState } from 'react';
import { X, Plus, MapPin } from 'lucide-react';
import type { CameraPosition, PointOfInterest } from '../../types';

interface AddPoiModalProps {
  isOpen: boolean;
  onClose: () => void;
  userPosition: CameraPosition;
  onSave: (poi: Omit<PointOfInterest, 'id' | 'createdAt'>) => void;
}

export const AddPoiModal: React.FC<AddPoiModalProps> = ({
  isOpen,
  onClose,
  userPosition,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Laboratory');
  const [description, setDescription] = useState('');
  const [tagsString, setTagsString] = useState('');
  const [useCurrentPos, setUseCurrentPos] = useState(true);
  const [customX, setCustomX] = useState(userPosition.x.toFixed(2));
  const [customY, setCustomY] = useState(userPosition.y.toFixed(2));
  const [customZ, setCustomZ] = useState(userPosition.z.toFixed(2));

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const posX = useCurrentPos ? userPosition.x : parseFloat(customX) || 0;
    const posY = useCurrentPos ? Math.max(0.5, userPosition.y - 0.4) : parseFloat(customY) || 1.0;
    const posZ = useCurrentPos ? userPosition.z : parseFloat(customZ) || 0;

    const tags = tagsString
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    onSave({
      title: title.trim(),
      category,
      position: { x: posX, y: posY, z: posZ },
      description: description.trim(),
      tags,
    });

    setTitle('');
    setDescription('');
    setTagsString('');
    onClose();
  };

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose}>
      <div className="modal-window add-poi-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-row">
            <MapPin size={20} className="modal-header-icon" />
            <div>
              <h3>Add 3D Point of Interest</h3>
              <p className="modal-subtitle">Tag and annotate spatial twin coordinate</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="poi-form">
          <div className="form-group">
            <label>POI Title *</label>
            <input
              type="text"
              placeholder="e.g. Autonomous Mobile Robot Dock"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="form-input"
              autoFocus
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="form-select"
              >
                <option value="Laboratory">Laboratory</option>
                <option value="Equipment">Equipment</option>
                <option value="Safety">Safety & Emergency</option>
                <option value="Classroom">Classroom & Amphitheater</option>
                <option value="Amenity">Amenity / Facility</option>
              </select>
            </div>

            <div className="form-group">
              <label>Tags (comma separated)</label>
              <input
                type="text"
                placeholder="robot, ros2, battery"
                value={tagsString}
                onChange={(e) => setTagsString(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description & Operational Details</label>
            <textarea
              placeholder="Specify equipment specifications, safety protocols, or maintenance schedules..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="form-textarea"
            />
          </div>

          <div className="form-position-box">
            <div className="position-header">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={useCurrentPos}
                  onChange={(e) => setUseCurrentPos(e.target.checked)}
                />
                <span>Anchor at Current Vantage Coordinate</span>
              </label>
              <span className="pos-preview mono">
                [{userPosition.x.toFixed(1)}, {userPosition.y.toFixed(1)}, {userPosition.z.toFixed(1)}]
              </span>
            </div>

            {!useCurrentPos && (
              <div className="coord-inputs-row">
                <input
                  type="number"
                  step="0.1"
                  placeholder="X"
                  value={customX}
                  onChange={(e) => setCustomX(e.target.value)}
                  className="form-input mono"
                />
                <input
                  type="number"
                  step="0.1"
                  placeholder="Y"
                  value={customY}
                  onChange={(e) => setCustomY(e.target.value)}
                  className="form-input mono"
                />
                <input
                  type="number"
                  step="0.1"
                  placeholder="Z"
                  value={customZ}
                  onChange={(e) => setCustomZ(e.target.value)}
                  className="form-input mono"
                />
              </div>
            )}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <Plus size={16} />
              <span>Register POI</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
