import React, { useState, useRef } from 'react';
import { 
  Cpu, 
  Key, 
  ExternalLink, 
  Eye, 
  EyeOff, 
  FileText, 
  UploadCloud, 
  Trash2, 
  AlertCircle, 
  BookOpen 
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
  onReset
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
    <aside style={styles.sidebar}>
      {/* Header */}
      <div style={styles.sidebarHeader}>
        <div style={styles.logoBadge}>
          <BookOpen size={20} color="#06b6d4" />
        </div>
        <div>
          <h1 style={styles.sidebarTitle}>Semantic Doc Q&A</h1>
          <span style={styles.sidebarSubtitle}>Level 2 RAG System</span>
        </div>
      </div>

      {/* Section: Embedding Model Status */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>
          <Cpu size={14} style={{ marginRight: '6px' }} />
          Embeddings Model
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
            <span style={styles.statusLabel}>
              {modelState === 'ready' ? 'Ready (all-MiniLM-L6-v2)' : 
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
            Groq Credentials
          </h2>
          <a 
            href="https://console.groq.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            style={styles.externalLink}
          >
            Get Key <ExternalLink size={10} style={{ marginLeft: '2px' }} />
          </a>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
            <span style={styles.secureText}>✓ Key saved locally</span>
            <button 
              onClick={onClearKey} 
              style={styles.clearKeyBtn}
              title="Clear key from local storage"
            >
              Clear Key
            </button>
          </div>
        )}
      </div>

      {/* Section: Document Parsing & Indexing */}
      <div style={{ ...styles.card, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h2 style={styles.cardTitle}>
          <FileText size={14} style={{ marginRight: '6px' }} />
          PDF Ingestion
        </h2>

        {!pdfFile ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current.click()}
            className={isDragOver ? 'drag-over' : ''}
            style={styles.dropZone}
          >
            <UploadCloud size={32} color={isDragOver ? '#6366f1' : '#4b5563'} style={{ marginBottom: '10px' }} />
            <p style={{ fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>
              Drag & Drop PDF Here
            </p>
            <p style={{ fontSize: '11px', color: '#6b7280' }}>
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
        ) : (
          <div style={styles.fileDetailsCard}>
            <div style={styles.fileInfoRow}>
              <FileText size={18} color="#06b6d4" style={{ flexShrink: 0 }} />
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

            {/* Progress Tracker */}
            <div style={{ marginTop: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>
                <span>
                  {indexingState === 'parsing' && 'Extracting text from pages...'}
                  {indexingState === 'embedding' && 'Embedding chunks...'}
                  {indexingState === 'done' && 'Ready for Q&A'}
                  {indexingState === 'error' && 'Failed to index'}
                </span>
                <span>{indexingProgress}%</span>
              </div>
              
              <div style={styles.indexingProgressBarContainer}>
                <div style={{ 
                  ...styles.indexingProgressBar, 
                  width: `${indexingProgress}%`,
                  backgroundColor: indexingState === 'done' ? '#10b981' : '#6366f1'
                }} />
              </div>

              {chunksCount > 0 && (
                <div style={styles.chunkBadgeContainer}>
                  <span style={styles.chunkBadge}>
                    {chunksCount} Semantic Chunks (300 words)
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick FAQ / Helper note */}
        <div style={styles.helperNote}>
          <AlertCircle size={12} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>
            All text chunk vectors are computed locally inside your browser cache. Zero documents are uploaded to a external vector database.
          </span>
        </div>
      </div>
    </aside>
  );
}
