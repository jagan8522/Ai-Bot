import React, { useRef, useEffect } from 'react';
import { MessageSquare, RefreshCw, Send } from 'lucide-react';
import { styles } from '../styles';

export default function ChatWindow({
  pdfFile,
  chatMessages,
  isGenerating,
  groqKey,
  chunksCount,
  inputValue,
  onInputChange,
  onSend
}) {
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isGenerating]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <main style={styles.chatContainer}>
      {/* Chat Header */}
      <header style={styles.chatHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageSquare size={18} color="#6366f1" />
          <h2 style={{ fontSize: '15px', fontWeight: '600' }}>Conversation Stream</h2>
        </div>
        {pdfFile && (
          <div style={styles.currentFileIndicator}>
            <div style={styles.greenPulseDot} />
            <span style={{ fontSize: '12px', fontWeight: '500', color: '#10b981' }}>
              Connected to: {pdfFile.name}
            </span>
          </div>
        )}
      </header>

      {/* Message Feed */}
      <div style={styles.messagesBox}>
        {chatMessages.map((msg) => (
          <div 
            key={msg.id} 
            style={{
              ...styles.messageRow,
              justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <div 
              style={{
                ...styles.messageBubble,
                ...(msg.sender === 'user' ? styles.userBubble : 
                    msg.sender === 'system' ? styles.systemBubble : 
                    styles.botBubble),
                maxWidth: msg.sender === 'system' ? '90%' : '75%',
                borderRadius: '16px',
                borderTopLeftRadius: msg.sender === 'bot' ? '4px' : '16px',
                borderTopRightRadius: msg.sender === 'user' ? '4px' : '16px',
              }}
            >
              <div style={{ fontSize: '13px', lineHeight: '1.65', whiteSpace: 'pre-wrap', fontWeight: '400' }}>
                {msg.text}
              </div>
              
              {/* Time Indicator */}
              <div style={{ 
                textAlign: 'right', 
                fontSize: '9px', 
                color: msg.sender === 'user' ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.5)', 
                marginTop: '6px',
                fontWeight: '500'
              }}>
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isGenerating && (
          <div style={{ ...styles.messageRow, justifyContent: 'flex-start' }}>
            <div 
              style={{ 
                ...styles.messageBubble, 
                ...styles.botBubble,
                borderRadius: '16px',
                borderTopLeftRadius: '4px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RefreshCw size={14} className="spin-icon" color="#14b8a6" />
                <span className="pulse-text" style={{ fontSize: '12.5px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: '500' }}>
                  Thinking, streaming answers from Groq (Llama 3.1)...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Input Area */}
      <div style={styles.inputArea}>
        {/* Sample Questions when document is loaded but empty chat */}
        {chunksCount > 0 && chatMessages.length <= 2 && (
          <div style={styles.sampleQuestionsContainer}>
            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Try asking a question:
            </span>
            <div style={styles.sampleQuestionsRow}>
              <button 
                onClick={() => onInputChange("Summarize the key findings in this document.")}
                style={styles.sampleBtn}
              >
                "Summarize key findings"
              </button>
              <button 
                onClick={() => onInputChange("What is the primary methodology or main subject?")}
                style={styles.sampleBtn}
              >
                "What is the primary subject?"
              </button>
              <button 
                onClick={() => onInputChange("List the important definitions or key terms discussed.")}
                style={styles.sampleBtn}
              >
                "List key terms"
              </button>
            </div>
          </div>
        )}

        <div style={styles.inputRow}>
          <textarea
            placeholder={
              !groqKey ? "← Configure your Groq API Key first" :
              chunksCount === 0 ? "← Upload and index a PDF first" :
              "Ask a question based on the document semantics..."
            }
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={chunksCount === 0 || !groqKey || isGenerating}
            style={styles.textField}
            rows={1}
          />
          <button
            onClick={onSend}
            disabled={!inputValue.trim() || chunksCount === 0 || !groqKey || isGenerating}
            className="interactive-btn"
            style={{
              ...styles.sendBtn,
              backgroundColor: (inputValue.trim() && chunksCount > 0 && groqKey && !isGenerating) ? '#14b8a6' : 'rgba(20, 184, 166, 0.15)',
              color: (inputValue.trim() && chunksCount > 0 && groqKey && !isGenerating) ? '#ffffff' : '#64748b',
              cursor: (inputValue.trim() && chunksCount > 0 && groqKey && !isGenerating) ? 'pointer' : 'not-allowed',
            }}
          >
            <Send size={16} />
          </button>
        </div>
        <div style={styles.infoFooter}>
          Level 2 RAG • 384-Dim Local Embeddings via WebAssembly • Streamed Answers via Llama 3.1
        </div>
      </div>
    </main>
  );
}
