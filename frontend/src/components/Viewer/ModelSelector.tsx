import React, { useState, useEffect, useRef } from 'react';
import type { RemoteModelItem } from '../../types';
import { Upload, FolderOpen, Box, X, RefreshCw, Layers } from 'lucide-react';

interface ModelSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocalFile: (file: File) => void;
  onSelectRemoteUrl: (url: string, name: string) => void;
  onToggleReferenceRoom: () => void;
  showReferenceRoom: boolean;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  isOpen,
  onClose,
  onSelectLocalFile,
  onSelectRemoteUrl,
  onToggleReferenceRoom,
  showReferenceRoom,
}) => {
  const [remoteModels, setRemoteModels] = useState<RemoteModelItem[]>([]);
  const [loadingRemote, setLoadingRemote] = useState(false);
  const [backendOffline, setBackendOffline] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch models available on backend
  const fetchBackendModels = async () => {
    setLoadingRemote(true);
    setBackendOffline(false);
    try {
      const res = await fetch('http://localhost:5001/api/models');
      if (res.ok) {
        const data = await res.json();
        setRemoteModels(data.data?.models || data.models || []);
      } else {
        setRemoteModels([]);
        setBackendOffline(true);
      }
    } catch {
      // Backend offline or connection refused
      setRemoteModels([]);
      setBackendOffline(true);
    } finally {
      setLoadingRemote(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchBackendModels();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      onSelectLocalFile(file);
      onClose();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      onSelectLocalFile(file);
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Box size={20} className="modal-title-icon" />
            <h3>Load 3D Digital Twin Model</h3>
          </div>
          <button className="icon-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Drag and Drop Zone */}
          <div
            className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={36} className="drop-icon" />
            <div className="drop-text">
              <strong>Drag & drop 3D model file</strong> or <span>browse local files</span>
            </div>
            <div className="drop-formats">Supported formats: .glb, .gltf, .obj</div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".glb,.gltf,.obj"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>

          {/* Reference Environment Option */}
          <div className="option-section">
            <div className="section-title">
              <Layers size={16} />
              <span>Architectural Reference Environment</span>
            </div>
            <div className="reference-toggle-row">
              <div className="reference-desc">
                Display 1-meter spatial grid and indoor boundary room (zero fake scans, scale reference only).
              </div>
              <button
                className={`toggle-btn ${showReferenceRoom ? 'active' : ''}`}
                onClick={onToggleReferenceRoom}
              >
                {showReferenceRoom ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </div>

          {/* Processed Models from Backend */}
          <div className="option-section">
            <div className="section-title-between">
              <div className="section-title">
                <FolderOpen size={16} />
                <span>Backend Processed Models (<code>data/processed/</code>)</span>
              </div>
              <button className="icon-btn-small" onClick={fetchBackendModels} title="Refresh backend models">
                <RefreshCw size={13} className={loadingRemote ? 'spinning' : ''} />
              </button>
            </div>

            {backendOffline ? (
              <div className="empty-remote-notice">
                Backend API unreachable at <code>http://localhost:5001</code>.
                <div className="empty-remote-sub">
                  Start the backend server (<code>npm run dev</code> in <code>backend/</code>) to load models from <code>data/processed/</code>.
                </div>
              </div>
            ) : remoteModels.length === 0 ? (
              <div className="empty-remote-notice">
                No reconstructed models found in <code>data/processed/</code> yet.
                <div className="empty-remote-sub">
                  Run the Python reconstruction pipeline or upload a model above to explore.
                </div>
              </div>
            ) : (
              <div className="model-list">
                {remoteModels.map((item) => (
                  <div
                    key={item.id}
                    className="model-list-item"
                    onClick={() => {
                      onSelectRemoteUrl(`http://localhost:5001${item.path}`, item.name);
                      onClose();
                    }}
                  >
                    <Box size={16} />
                    <div className="model-item-details">
                      <div className="model-item-name">{item.name}</div>
                      <div className="model-item-format">.{item.format} format</div>
                    </div>
                    <button className="load-item-btn">Load</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
