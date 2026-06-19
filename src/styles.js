// Visual style definitions for Apple Liquid Glass Theme (Absolute Transparent, No Background Colors)

export const globalStyles = `
  body {
    background: #0b0f19; /* Solid neutral dark slate background for text visibility */
    margin: 0;
    padding: 0;
    overflow: hidden;
    height: 100vh;
    width: 100vw;
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: 'Outfit', 'Inter', system-ui, sans-serif;
    position: relative;
  }
  
  #root {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    padding: 24px;
    box-sizing: border-box;
    position: relative;
    overflow: hidden;
    z-index: 1;
  }
  
  /* Webkit custom scrollbars */
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  ::-webkit-scrollbar-track {
    background: transparent;
  }
  ::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.08);
    border-radius: 4px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.18);
  }
  
  /* Drag and drop overlay */
  .drag-over {
    border-color: #38bdf8 !important;
    background-color: rgba(255, 255, 255, 0.08) !important;
    box-shadow: 0 0 25px rgba(255, 255, 255, 0.15) !important;
    transform: scale(1.01);
  }
  
  /* Animations */
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
  .pulse-text {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  .spin-icon {
    animation: spin 1.2s linear infinite;
  }
  
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  .shimmer-bar {
    background: linear-gradient(90deg, #38bdf8 25%, #818cf8 50%, #38bdf8 75%) !important;
    background-size: 200% 100% !important;
    animation: shimmer 1.5s infinite linear !important;
  }

  /* Interactive Buttons hover */
  .interactive-btn {
    transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .interactive-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 14px rgba(255, 255, 255, 0.15);
    filter: brightness(1.1);
  }
  .interactive-btn:active:not(:disabled) {
    transform: translateY(0);
  }
`;

export const styles = {
  appWrapper: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  appContainer: {
    display: 'flex',
    width: '100%',
    maxWidth: '1240px',
    height: '86vh',
    maxHeight: '820px',
    background: 'transparent', // Absolute transparent background
    backdropFilter: 'blur(30px) saturate(180%)',
    WebkitBackdropFilter: 'blur(30px) saturate(180%)',
    borderRadius: '28px', // Premium rounded corners
    border: '1.5px solid rgba(255, 255, 255, 0.45)', // Clean white reflective border highlight
    boxShadow: `
      0 30px 70px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.4)
    `,
    overflow: 'hidden',
    boxSizing: 'border-box',
    zIndex: 10,
    color: '#ffffff', // High contrast white text
  },
  sidebar: {
    width: '320px',
    borderRight: '1.5px solid rgba(255, 255, 255, 0.25)', // Bright reflective divider
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    height: '100%',
    overflowY: 'auto',
    flexShrink: 0,
    boxSizing: 'border-box',
    background: 'transparent',
  },
  sidebarHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 14px',
    background: 'transparent', // Translucent colorless header
    border: '1px solid rgba(255, 255, 255, 0.35)', // Bright reflective border highlight
    borderRadius: '16px',
    boxShadow: `
      0 4px 12px rgba(0,0,0,0.02),
      inset 0 1px 0 rgba(255,255,255,0.2)
    `,
  },
  logoBadge: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    backgroundColor: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sidebarTitle: {
    fontSize: '14.5px',
    fontWeight: '700',
    letterSpacing: '-0.015em',
    color: '#ffffff',
    margin: 0,
  },
  sidebarSubtitle: {
    fontSize: '10px',
    color: '#38bdf8', // Sky-blue indicators
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  card: {
    backgroundColor: 'transparent', // Transparent card base
    border: '1px solid rgba(255, 255, 255, 0.3)', // Thin glassy border
    borderRadius: '16px',
    padding: '14px',
    boxSizing: 'border-box',
    boxShadow: `
      0 4px 12px rgba(0,0,0,0.01),
      inset 0 1px 0 rgba(255,255,255,0.15)
    `,
  },
  cardTitle: {
    fontSize: '10.5px',
    fontWeight: '700',
    textTransform: 'uppercase',
    color: 'rgba(255, 255, 255, 0.75)',
    letterSpacing: '0.08em',
    display: 'flex',
    alignItems: 'center',
    margin: '0 0 10px 0',
  },
  statusBox: {
    backgroundColor: 'transparent', // Translucent clear backing
    borderRadius: '10px',
    padding: '10px',
    border: '1px solid rgba(255, 255, 255, 0.20)', // White rim
  },
  statusIndicatorContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '2px',
  },
  statusIndicator: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    display: 'inline-block',
  },
  statusLabel: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#ffffff',
  },
  statusText: {
    fontSize: '11px',
    color: 'rgba(255, 255, 255, 0.75)',
    margin: 0,
    marginTop: '4px',
    wordBreak: 'break-all',
  },
  modelProgressBarContainer: {
    height: '5px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '3px',
    overflow: 'hidden',
    marginTop: '6px',
    marginBottom: '2px',
  },
  modelProgressBar: {
    height: '100%',
    backgroundColor: '#38bdf8',
    borderRadius: '3px',
    transition: 'width 0.3s ease',
  },
  externalLink: {
    fontSize: '11px',
    color: '#38bdf8',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    fontWeight: '600',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  apiInput: {
    width: '100%',
    backgroundColor: 'transparent', // Transparent input
    border: '1px solid rgba(255, 255, 255, 0.35)', // Bright highlight border
    borderRadius: '10px',
    padding: '8px 32px 8px 10px',
    color: '#ffffff',
    fontSize: '12.5px',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'monospace',
  },
  visibilityBtn: {
    position: 'absolute',
    right: '8px',
    background: 'none',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.65)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px',
  },
  secureText: {
    fontSize: '11px',
    color: '#34d399',
    fontWeight: '600',
  },
  clearKeyBtn: {
    background: 'none',
    border: 'none',
    fontSize: '11px',
    color: '#ff4d6d',
    cursor: 'pointer',
    padding: 0,
    textDecoration: 'underline',
    fontWeight: '600',
  },
  dropZone: {
    border: '1.5px dashed rgba(255, 255, 255, 0.35)', // Reflective dashes
    borderRadius: '12px',
    padding: '24px 12px',
    textAlign: 'center',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    transition: 'all 0.2s ease',
    flex: 1,
    boxSizing: 'border-box',
  },
  fileDetailsCard: {
    backgroundColor: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    borderRadius: '12px',
    padding: '12px',
  },
  fileInfoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  fileName: {
    fontSize: '12.5px',
    fontWeight: '600',
    color: '#ffffff',
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  fileSize: {
    fontSize: '10.5px',
    color: 'rgba(255, 255, 255, 0.7)',
    margin: 0,
    marginTop: '2px',
  },
  trashBtn: {
    background: 'none',
    border: 'none',
    color: '#ff4d6d',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 77, 109, 0.08)',
    border: '1px solid rgba(255, 77, 109, 0.25)',
  },
  indexingProgressBarContainer: {
    height: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  indexingProgressBar: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.2s ease',
  },
  chunkBadgeContainer: {
    marginTop: '10px',
  },
  chunkBadge: {
    display: 'inline-block',
    fontSize: '10px',
    backgroundColor: 'transparent',
    color: '#38bdf8',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    padding: '3px 8px',
    borderRadius: '20px',
    fontWeight: '600',
  },
  helperNote: {
    marginTop: '12px',
    backgroundColor: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    borderRadius: '12px',
    padding: '10px 12px',
    fontSize: '10.5px',
    color: '#fbbf24',
    display: 'flex',
    gap: '8px',
    lineHeight: '1.45',
    fontWeight: '500',
  },
  chatContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: 'transparent', // Fully transparent
    boxSizing: 'border-box',
  },
  chatHeader: {
    height: '60px',
    borderBottom: '1.5px solid rgba(255, 255, 255, 0.25)', // Bright transparent line
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    flexShrink: 0,
    backgroundColor: 'transparent',
    boxSizing: 'border-box',
  },
  currentFileIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    padding: '4px 12px',
    borderRadius: '30px',
  },
  greenPulseDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#34d399',
    boxShadow: '0 0 8px #34d399',
  },
  messagesBox: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    boxSizing: 'border-box',
  },
  messageRow: {
    display: 'flex',
    width: '100%',
  },
  messageBubble: {
    padding: '12px 18px',
    borderRadius: '16px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
    boxSizing: 'border-box',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
  },
  userBubble: {
    backgroundColor: 'transparent', // Completely transparent
    border: '1.5px solid rgba(255, 255, 255, 0.45)', // Beveled reflection
    color: '#ffffff',
  },
  botBubble: {
    backgroundColor: 'transparent', // Completely transparent
    border: '1px solid rgba(255, 255, 255, 0.25)', // Soft reflect rim
    color: '#ffffff',
  },
  systemBubble: {
    backgroundColor: 'transparent', // Completely transparent
    border: '1.2px solid rgba(255, 255, 255, 0.35)', // Bright reflect border
    color: '#38bdf8',
  },
  inputArea: {
    padding: '18px 24px',
    borderTop: '1.5px solid rgba(255, 255, 255, 0.25)', // Bright transparent line
    backgroundColor: 'transparent',
    flexShrink: 0,
    boxSizing: 'border-box',
  },
  sampleQuestionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '12px',
  },
  sampleQuestionsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  sampleBtn: {
    backgroundColor: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    color: 'rgba(255, 255, 255, 0.85)',
    borderRadius: '30px',
    padding: '6px 14px',
    fontSize: '11px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontWeight: '500',
  },
  inputRow: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    backgroundColor: 'transparent', // Transparent input wrapper
    border: '1.5px solid rgba(255, 255, 255, 0.35)', // Beveled highlight border
    borderRadius: '30px',
    padding: '6px 8px 6px 18px',
    boxShadow: `
      0 4px 16px rgba(0, 0, 0, 0.05),
      inset 0 1px 0 rgba(255, 255, 255, 0.2)
    `,
  },
  textField: {
    flex: 1,
    background: 'none',
    border: 'none',
    color: '#ffffff',
    fontSize: '13.5px',
    outline: 'none',
    resize: 'none',
    padding: '6px 0',
    fontFamily: 'inherit',
    lineHeight: '1.4',
  },
  sendBtn: {
    border: 'none',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'all 0.2s',
    boxShadow: '0 2px 8px rgba(255, 255, 255, 0.1)',
  },
  infoFooter: {
    textAlign: 'center',
    fontSize: '10px',
    color: 'rgba(255, 255, 255, 0.45)',
    marginTop: '8px',
    fontWeight: '600',
    letterSpacing: '0.02em',
  }
};

export default styles;
