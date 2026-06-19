// Visual style definitions for the Semantic Doc Q&A App matching the screenshot design

export const globalStyles = `
  body {
    background: #c8d5e0; /* Muted soft blue-gray background */
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
    padding: 0;
    box-sizing: border-box;
    position: relative;
    overflow: hidden;
    z-index: 1;
  }
  
  /* Decorative Background Blobs for cool blue-gray ambience */
  .bg-blob-1 {
    position: absolute;
    width: 700px;
    height: 700px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(186, 210, 229, 0.80) 0%, rgba(200, 213, 224, 0) 70%);
    filter: blur(80px);
    top: -150px;
    left: -150px;
    z-index: 0;
    pointer-events: none;
  }
  
  .bg-blob-2 {
    position: absolute;
    width: 600px;
    height: 600px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(162, 196, 218, 0.70) 0%, rgba(200, 213, 224, 0) 70%);
    filter: blur(90px);
    bottom: -100px;
    right: -100px;
    z-index: 0;
    pointer-events: none;
  }

  .bg-blob-3 {
    position: absolute;
    width: 500px;
    height: 500px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(144, 180, 206, 0.50) 0%, rgba(200, 213, 224, 0) 70%);
    filter: blur(80px);
    top: 30%;
    right: 15%;
    z-index: 0;
    pointer-events: none;
  }
  
  /* Webkit custom scrollbars - Blue-gray theme */
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  ::-webkit-scrollbar-track {
    background: transparent;
  }
  ::-webkit-scrollbar-thumb {
    background: rgba(98, 125, 152, 0.25);
    border-radius: 4px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: rgba(98, 125, 152, 0.45);
  }
  
  /* Dark sidebars custom scrollbar */
  .dark-scroll::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
  }
  .dark-scroll::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  /* Drag and drop overlay */
  .drag-over {
    border-color: #38bdf8 !important;
    background-color: rgba(255, 255, 255, 0.05) !important;
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
    background: linear-gradient(90deg, #10b981 25%, #34d399 50%, #10b981 75%) !important;
    background-size: 200% 100% !important;
    animation: shimmer 1.5s infinite linear !important;
  }

  /* Interactive Buttons hover */
  .interactive-btn {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .interactive-btn:hover:not(:disabled) {
    transform: scale(1.03);
    filter: brightness(1.15);
  }
  .interactive-btn:active:not(:disabled) {
    transform: scale(0.98);
  }

  /* Dark blue search bar placeholder */
  .dark-input-field::placeholder {
    color: rgba(200, 214, 233, 0.55);
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
    zIndex: 10,
  },
  appContainer: {
    display: 'flex',
    width: '100vw',
    height: '100vh',
    background: 'transparent',
    borderRadius: '0px',
    overflow: 'hidden',
    boxSizing: 'border-box',
    zIndex: 12,
  },

  // Left configuration sidebar (Sleek glassmorphism dark theme)
  sidebar: {
    width: '320px',
    backgroundColor: 'rgba(30, 41, 59, 0.88)', // Sleek dark slate
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    padding: '24px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
    height: '100%',
    overflowY: 'auto',
    flexShrink: 0,
    boxSizing: 'border-box',
    borderRight: '1px solid rgba(255, 255, 255, 0.04)',
  },
  sidebarHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    paddingBottom: '8px',
  },
  logoBadge: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    backgroundColor: '#3b2f23', // Gold-brown matching square
    border: '1px solid #ffd700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sidebarTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#eab308', // Gold text
    margin: 0,
    lineHeight: '1.2',
  },
  sidebarSubtitle: {
    fontSize: '9.5px',
    color: '#94a3b8',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },

  // Card elements inside config sidebar
  card: {
    backgroundColor: '#1e2530', // Dark card body
    border: '1px solid #2d3748',
    borderRadius: '12px',
    padding: '14px',
    boxSizing: 'border-box',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  cardTitle: {
    fontSize: '10.5px',
    fontWeight: '700',
    textTransform: 'uppercase',
    color: '#94a3b8', // Gray label
    letterSpacing: '0.06em',
    display: 'flex',
    alignItems: 'center',
    margin: '0 0 10px 0',
  },
  statusBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '8px',
    padding: '8px 10px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  statusIndicatorContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  statusIndicator: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    display: 'inline-block',
  },
  statusLabel: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#ffffff',
  },
  statusText: {
    fontSize: '10.5px',
    color: 'rgba(255, 255, 255, 0.55)',
    margin: 0,
    marginTop: '4px',
    wordBreak: 'break-all',
    lineHeight: '1.4',
  },
  modelProgressBarContainer: {
    height: '4px',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: '2px',
    overflow: 'hidden',
    marginTop: '6px',
  },
  modelProgressBar: {
    height: '100%',
    backgroundColor: '#10b981', // Green progress bar
    borderRadius: '2px',
    transition: 'width 0.3s ease',
  },
  externalLink: {
    fontSize: '10.5px',
    color: '#38bdf8',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    fontWeight: '600',
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    padding: '3px 8px',
    borderRadius: '4px',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  apiInput: {
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    border: '1px solid #2d3748',
    borderRadius: '8px',
    padding: '8px 32px 8px 10px',
    color: '#ffffff',
    fontSize: '12px',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'monospace',
  },
  visibilityBtn: {
    position: 'absolute',
    right: '8px',
    background: 'none',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.4)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px',
  },
  secureText: {
    fontSize: '10px',
    color: '#10b981',
    fontWeight: '600',
  },
  clearKeyBtn: {
    background: 'none',
    border: 'none',
    fontSize: '10px',
    color: '#ef4444',
    cursor: 'pointer',
    padding: 0,
    textDecoration: 'underline',
    fontWeight: '600',
  },
  dropZone: {
    border: '1.5px dashed rgba(255, 255, 255, 0.15)',
    borderRadius: '10px',
    padding: '20px 10px',
    textAlign: 'center',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
  },
  fileDetailsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '10px',
    padding: '10px',
  },
  fileInfoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  fileName: {
    fontSize: '11.5px',
    fontWeight: '600',
    color: '#ffffff',
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  fileSize: {
    fontSize: '10px',
    color: 'rgba(255, 255, 255, 0.5)',
    margin: 0,
    marginTop: '1px',
  },
  trashBtn: {
    background: 'none',
    border: 'none',
    color: '#ef4444',
    cursor: 'pointer',
    padding: '5px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.15)',
  },
  indexingProgressBarContainer: {
    height: '5px',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: '2.5px',
    overflow: 'hidden',
  },
  indexingProgressBar: {
    height: '100%',
    borderRadius: '2.5px',
    transition: 'width 0.2s ease',
  },

  // Vector computation card details
  greenProgressBar: {
    height: '100%',
    background: 'linear-gradient(90deg, #10b981, #22c55e)',
    borderRadius: '2.5px',
    transition: 'width 0.2s ease',
  },
  percentLabel: {
    color: '#10b981',
    fontWeight: '700',
    fontSize: '11px',
  },
  vectorBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '10px',
    backgroundColor: '#022c22',
    color: '#34d399',
    border: '1px solid #064e3b',
    padding: '5px 10px',
    borderRadius: '6px',
    fontWeight: '600',
    marginTop: '8px',
  },
  pulseGreenDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#10b981',
    boxShadow: '0 0 6px #10b981',
  },
  helperNote: {
    marginTop: 'auto',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '10px',
    padding: '8px 10px',
    fontSize: '9.5px',
    color: 'rgba(255, 255, 255, 0.4)',
    display: 'flex',
    gap: '6px',
    lineHeight: '1.4',
    fontWeight: '500',
  },

  // Right Chat Area (warm cream theme)
  chatContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: 'rgba(235, 241, 246, 0.94)', // Translucent soft pastel blue-gray
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    boxSizing: 'border-box',
  },
  chatHeader: {
    height: '56px',
    borderBottom: '1px solid #d9e2ec', // Muted blue-gray border
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px',
    flexShrink: 0,
    backgroundColor: 'transparent',
    boxSizing: 'border-box',
  },
  chatHeaderTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#334e68', // Muted steel blue
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  currentFileIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#d9e2ec', // Soft blue-gray badge
    border: '1px solid #bcccdc',
    padding: '4px 10px',
    borderRadius: '30px',
  },
  greenPulseDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#10b981',
    boxShadow: '0 0 6px #10b981',
  },
  messagesBox: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    boxSizing: 'border-box',
  },
  messageRow: {
    display: 'flex',
    width: '100%',
  },
  messageBubble: {
    padding: '12px 16px',
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
    boxSizing: 'border-box',
    maxWidth: '85%',
  },
  userBubble: {
    backgroundColor: '#486581', // Muted steel blue-gray
    color: '#ffffff',
    alignSelf: 'flex-end',
    borderBottomRightRadius: '4px',
    border: '1px solid #334e68',
  },
  botBubble: {
    backgroundColor: '#ffffff', // Clean white
    border: '1px solid #d9e2ec',
    color: '#102a43', // Dark slate-blue text
    alignSelf: 'flex-start',
    borderTopLeftRadius: '4px',
    boxShadow: '0 2px 8px rgba(98, 125, 152, 0.04)',
  },
  systemBubble: {
    backgroundColor: '#d9e2ec', // Soft blue-gray banner
    border: '1px solid #bcccdc',
    color: '#102a43',
    width: '100%',
    alignSelf: 'center',
    textAlign: 'left',
    borderRadius: '12px',
  },

  // Custom styled answers inside chat
  markdownHeading: {
    fontWeight: '700',
    margin: '12px 0 6px 0',
    color: '#102a43',
    fontSize: '13.5px',
  },
  markdownParagraph: {
    margin: '0 0 8px 0',
    lineHeight: '1.6',
    fontSize: '12.5px',
  },
  markdownList: {
    margin: '0 0 10px 0',
    paddingLeft: '18px',
    lineHeight: '1.5',
    fontSize: '12.5px',
  },
  markdownListItem: {
    margin: '4px 0',
  },

  inputArea: {
    padding: '16px 20px',
    borderTop: '1px solid #d9e2ec',
    backgroundColor: 'transparent',
    flexShrink: 0,
    boxSizing: 'border-box',
  },
  sampleQuestionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '10px',
  },
  sampleQuestionsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  sampleBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    border: '1px solid #d9e2ec',
    color: '#486581',
    borderRadius: '30px',
    padding: '5px 12px',
    fontSize: '10.5px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  inputRow: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    backgroundColor: '#1a3a5c', // Dark navy blue
    border: '2px solid #2a5080',
    borderRadius: '24px',
    padding: '5px 5px 5px 16px',
    boxShadow: '0 4px 20px rgba(10, 30, 70, 0.5), 0 1px 6px rgba(10, 30, 70, 0.35)',
  },
  textField: {
    flex: 1,
    background: 'none',
    border: 'none',
    color: '#e8f0fe',
    fontSize: '13px',
    outline: 'none',
    resize: 'none',
    padding: '6px 0',
    fontFamily: 'inherit',
    lineHeight: '1.4',
  },
  sendBtn: {
    border: 'none',
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'all 0.2s',
  },
  infoFooter: {
    textAlign: 'center',
    fontSize: '9.5px',
    color: '#627d98', // Muted steel blue-gray footer
    marginTop: '8px',
    fontWeight: '600',
    letterSpacing: '0.02em',
  }
};

export default styles;
