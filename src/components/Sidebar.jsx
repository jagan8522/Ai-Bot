import React, { useState, useRef } from 'react';
import {
  Eye,
  EyeOff,
  FileText,
  UploadCloud,
  Trash2,
  AlertCircle,
  Check,
  Cpu,
  Key,
  X
} from 'lucide-react';
import { styles } from '../styles';

export default function Sidebar({
  modelState,
  modelProgress,
  modelPercent = 0,
  onClearCacheAndRetry,
  groqKey,
  onSaveKey,
  onClearKey,
  pdfFile,
  indexingState,
  indexingProgress,
  chunksCount,
  onFileSelected,
  onReset,
  isOpen = false,
  onClose,
}) {
  const [showKey, setShowKey] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileSelected(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) onFileSelected(file);
  };

  return (
    <aside
      style={styles.sidebar}
      className={`dark-scroll app-sidebar${isOpen ? ' open' : ''}`}
    >
      {/* Header */}
      <div style={{ ...styles.sidebarHeader, justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={styles.logoBadge}>
            <FileText size={20} color="#ffd700" />
          </div>
          <div>
            <h1 style={styles.sidebarTitle}>Semantic Doc Q&A</h1>
            <span style={styles.sidebarSubtitle}>RAG SYSTEM</span>
          </div>
        </div>

        {/* Close button — only visible on mobile via CSS */}
        <button
          className="sidebar-close-btn"
          onClick={onClose}
          aria-label="Close sidebar"
          title="Close sidebar"
        >
          <X size={18} />
        </button>
      </div>

      {/* Section: Embedding Model Status */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>
          <Eye size={14} style={{ marginRight: '6px' }} />
          EMBEDDINGS MODEL
        </h2>
        <div style={styles.statusBox}>
          <div style={styles.statusIndicatorContainer}>
            <span style={{
              ...styles.statusIndicator,
              backgroundColor:
                modelState === 'ready' ? '#10b981' :
                  modelState === 'loading' ? '#f59e0b' :
                    modelState === 'error' ? '#ef4444' : '#9ca3af'
            }} />
            <span style={{
              ...styles.statusLabel,
              color: modelState === 'ready' ? '#10b981' : '#ffffff'
            }}>
              {modelState === 'ready' ? 'Ready (all-MiniLM-L6-v2) - loaded' :
                modelState === 'loading' ? 'Loading Model...' :
                  modelState === 'error' ? 'Model Error' : 'Model Idle'}
            </span>
          </div>
          {modelState === 'loading' && (
            <div style={styles.modelProgressBarContainer}>
              <div
                className={modelPercent === -1 ? 'shimmer-bar' : ''}
                style={{
                  ...styles.modelProgressBar,
                  width: modelPercent === -1 ? '100%' : `${modelPercent}%`
                }}
              />
            </div>
          )}
          <p style={styles.statusText}>{modelProgress}</p>
          {modelState === 'error' && onClearCacheAndRetry && (
            <button
              onClick={onClearCacheAndRetry}
              style={{
                marginTop: '10px',
                width: '100%',
                padding: '8px 12px',
                fontSize: '11px',
                fontWeight: '600',
                color: '#ffffff',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              className="interactive-btn"
            >
              Clear Cache & Retry
            </button>
          )}
        </div>
      </div>

      {/* Section: Groq API Key Setup */}
      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h2 style={styles.cardTitle}>
            <Key size={14} style={{ marginRight: '6px' }} />
            GROQ CREDENTIALS
          </h2>
          <button
            onClick={() => window.open("https://console.groq.com", "_blank")}
            style={styles.externalLink}
            className="interactive-btn"
          >
            Get Key*
          </button>
        </div>

        <div style={styles.inputWrapper}>
          <input
            type={showKey ? 'text' : 'password'}
            placeholder="Paste Groq API Key (gsk_...)"
            value={groqKey}
            onChange={(e) => onSaveKey(e.target.value)}
            style={styles.apiInput}
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            style={styles.visibilityBtn}
            title={showKey ? "Hide key" : "Show key"}
          >
            {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
        {groqKey && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
            <span style={{ fontSize: '11px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '500' }}>
              <Check size={12} strokeWidth={3} /> Key saved locally
            </span>
            <button
              onClick={onClearKey}
              style={{
                background: 'transparent',
                border: '1.5px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '12px',
                color: '#ef4444',
                fontSize: '10px',
                fontWeight: '600',
                padding: '2px 8px',
                cursor: 'pointer'
              }}
              className="interactive-btn"
              title="Clear key from local storage"
            >
              Clear Key
            </button>
          </div>
        )}
      </div>

      {/* Section: Document Parsing & Indexing */}
      {pdfFile && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>
            <FileText size={14} style={{ marginRight: '6px', color: '#10b981' }} />
            ACTIVE DOCUMENT
          </h2>
          <div style={styles.fileDetailsCard}>
            <div style={styles.fileInfoRow}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <FileText size={16} color="#10b981" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={styles.fileName}>{pdfFile.name}</p>
                <p style={styles.fileSize}>
                  {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                onClick={onReset}
                style={styles.trashBtn}
                title="Remove document"
                disabled={indexingState === 'embedding' || indexingState === 'parsing'}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Section: Vector Computation */}
      {(chunksCount > 0 || indexingState === 'embedding' || indexingState === 'parsing') && (
        <div style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h2 style={styles.cardTitle}>
              <Cpu size={14} style={{ marginRight: '6px' }} />
              VECTOR COMPUTATION
            </h2>
            <span style={styles.percentLabel}>
              {indexingState === 'done' ? '100%' : `${indexingProgress}%`}
            </span>
          </div>

          <div style={styles.modelProgressBarContainer}>
            <div
              style={{
                ...styles.greenProgressBar,
                width: indexingState === 'done' ? '100%' : `${indexingProgress}%`
              }}
            />
          </div>

          {chunksCount > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
              <div style={styles.vectorBadge}>
                {chunksCount} Semantic Chunks (30 words)
              </div>
              <div style={styles.vectorBadge}>
                <span style={styles.pulseGreenDot} /> All text chunk vectors are computed
              </div>
            </div>
          )}
        </div>
      )}

      {/* Fallback Ingestion Dropzone when no PDF is loaded */}
      {!pdfFile && (
        <div style={{ ...styles.card, flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h2 style={styles.cardTitle}>
            <FileText size={14} style={{ marginRight: '6px' }} />
            PDF Ingestion
          </h2>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current.click()}
            className={isDragOver ? 'drag-over' : ''}
            style={styles.dropZone}
          >
            <UploadCloud size={32} color={isDragOver ? '#38bdf8' : '#64748b'} style={{ marginBottom: '10px' }} />
            <p style={{ fontSize: '13px', fontWeight: '500', marginBottom: '4px', color: '#ffffff' }}>
              Drag & Drop PDF Here
            </p>
            <p style={{ fontSize: '11px', color: '#64748b' }}>
              or click to browse local files
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>
        </div>
      )}

      {/* Quick FAQ / Helper note */}
      <div style={styles.helperNote} className="sidebar-helper-note">
        <AlertCircle size={12} style={{ flexShrink: 0, marginTop: '2px' }} />
        <span>
          All text chunk vectors are computed locally inside your browser cache. Zero documents are uploaded to a external vector database.
        </span>
      </div>
    </aside>
  );
}
