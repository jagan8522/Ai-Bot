import React, { useRef, useEffect } from 'react';
import { MessageSquare, RefreshCw, Send, Sparkles, Menu } from 'lucide-react';
import { styles } from '../styles';

// Lightweight, robust parsing utility to render bold headings and lists in chat answers
function formatMessageText(text) {
  if (!text) return '';

  const lines = text.split('\n');
  const formattedElements = [];
  let inList = false;
  let listItems = [];

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();

    // Match numbered list item with bold: "1. **Title:** description"
    const numberedMatch = trimmedLine.match(/^(\d+)\.\s+\*\*(.*?)\*\*:(.*)$/);
    // Match standard list item: "• text" or "* text" or "- text"
    const bulletMatch = trimmedLine.match(/^[\*\-•]\s+(.*)$/);
    // Match simple numbered list: "1. text"
    const simpleNumberedMatch = trimmedLine.match(/^(\d+)\.\s+(.*)$/);
    // Match bold heading line: "**Title:**" or "**Title**:"
    const boldHeadingMatch = trimmedLine.match(/^\*\*(.*?)\*\*:(.*)$/);
    // Match pure bold text line: "**Title**"
    const pureBoldMatch = trimmedLine.match(/^\*\*(.*?)\*\*$/);

    if (numberedMatch || bulletMatch || simpleNumberedMatch) {
      if (!inList) {
        inList = true;
        listItems = [];
      }

      if (numberedMatch) {
        listItems.push(
          <li key={`li-${index}`} style={styles.markdownListItem}>
            <strong>{numberedMatch[2]}:</strong>{numberedMatch[3]}
          </li>
        );
      } else if (simpleNumberedMatch) {
        // Clean inner bolding if any
        const cleanContent = simpleNumberedMatch[2].replace(/\*\*(.*?)\*\*/g, '$1');
        listItems.push(
          <li key={`li-${index}`} style={styles.markdownListItem}>
            {cleanContent}
          </li>
        );
      } else if (bulletMatch) {
        const cleanContent = bulletMatch[1].replace(/\*\*(.*?)\*\*/g, '$1');
        listItems.push(
          <li key={`li-${index}`} style={styles.markdownListItem}>
            {cleanContent}
          </li>
        );
      }
    } else {
      if (inList) {
        formattedElements.push(
          <ul key={`ul-${index}`} style={styles.markdownList}>
            {listItems}
          </ul>
        );
        inList = false;
        listItems = [];
      }

      if (trimmedLine) {
        if (boldHeadingMatch) {
          formattedElements.push(
            <div key={`h-${index}`} style={styles.markdownHeading}>
              {boldHeadingMatch[1]}:{boldHeadingMatch[2]}
            </div>
          );
        } else if (pureBoldMatch) {
          formattedElements.push(
            <div key={`h-${index}`} style={styles.markdownHeading}>
              {pureBoldMatch[1]}
            </div>
          );
        } else {
          // Normal line, parsing inline bold **bold**
          const parts = trimmedLine.split(/\*\*([^*]+)\*\*/g);
          const paragraphContent = parts.map((part, partIdx) => {
            return partIdx % 2 === 1 ? <strong key={partIdx}>{part}</strong> : part;
          });

          formattedElements.push(
            <p key={`p-${index}`} style={styles.markdownParagraph}>
              {paragraphContent}
            </p>
          );
        }
      }
    }
  });

  if (inList) {
    formattedElements.push(
      <ul key="ul-final" style={styles.markdownList}>
        {listItems}
      </ul>
    );
  }

  return formattedElements;
}

export default function ChatWindow({
  pdfFile,
  chatMessages,
  isGenerating,
  groqKey,
  chunksCount,
  inputValue,
  onInputChange,
  onSend,
  onOpenSidebar,
}) {
  const messagesBoxRef = useRef(null);
  const textareaRef = useRef(null);

  // Focus the input on first load
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  // Re-focus input after AI finishes generating
  useEffect(() => {
    if (!isGenerating && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isGenerating]);

  // Re-focus input after a new message arrives
  useEffect(() => {
    if (textareaRef.current && !isGenerating) {
      textareaRef.current.focus();
    }
  }, [chatMessages]);

  // Auto-scroll to bottom of chat container only (prevents window jumping)
  useEffect(() => {
    if (messagesBoxRef.current) {
      messagesBoxRef.current.scrollTop = messagesBoxRef.current.scrollHeight;
    }
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
      <header style={styles.chatHeader} className="chat-header-responsive">
        {/* Hamburger — only visible on mobile via CSS */}
        <button
          className="hamburger-btn"
          onClick={onOpenSidebar}
          aria-label="Open sidebar"
          title="Open sidebar"
        >
          <Menu size={18} />
        </button>

        <div style={styles.chatHeaderTitle}>
          <MessageSquare size={18} color="#5c544d" />
          <span className="chat-header-title-text">CONVERSATION STREAM</span>
        </div>
        {pdfFile && (
          <div style={styles.currentFileIndicator}>
            <div style={styles.greenPulseDot} />
            <span
              className="file-indicator-text"
              style={{ fontSize: '11px', fontWeight: '700', color: '#15803d' }}
            >
              Connected to {pdfFile.name}
            </span>
          </div>
        )}
      </header>

      {/* Message Feed */}
      <div ref={messagesBoxRef} style={styles.messagesBox} className="messages-box-responsive">
        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            style={{
              ...styles.messageRow,
              justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <div
              className="message-bubble-responsive"
              style={{
                ...styles.messageBubble,
                ...(msg.sender === 'user' ? styles.userBubble :
                  msg.sender === 'system' ? styles.systemBubble :
                    styles.botBubble),
              }}
            >
              <div style={{ fontSize: '12.5px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                {msg.sender === 'bot' || msg.sender === 'system' ? (
                  formatMessageText(msg.text)
                ) : (
                  msg.text
                )}
              </div>

              {/* Time Indicator */}
              <div style={{
                textAlign: 'right',
                fontSize: '9px',
                color: msg.sender === 'user' ? 'rgba(255,255,255,0.5)' : '#8c8276',
                marginTop: '6px',
                fontWeight: '600'
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
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RefreshCw size={14} className="spin-icon" color="#8b1d55" />
                <span className="pulse-text" style={{ fontSize: '12px', color: '#8c8276', fontWeight: '600' }}>
                  Streaming answer from Llama 3.1...
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Input Area */}
      <div style={styles.inputArea} className="input-area-responsive">
        {/* Sample Questions when document is loaded but empty chat */}
        {chunksCount > 0 && chatMessages.length <= 2 && (
          <div style={styles.sampleQuestionsContainer}>
            <span style={{ fontSize: '10px', color: '#8c8276', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Suggested prompts:
            </span>
            <div style={styles.sampleQuestionsRow} className="sample-questions-row">
              <button
                onClick={() => onInputChange("Summarize the key findings in this document.")}
                style={styles.sampleBtn}
                className="interactive-btn"
              >
                Summarize key findings
              </button>
              <button
                onClick={() => onInputChange("What is the primary methodology or main subject?")}
                style={styles.sampleBtn}
                className="interactive-btn"
              >
                What is the primary subject?
              </button>
              <button
                onClick={() => onInputChange("List the important definitions or key terms discussed.")}
                style={styles.sampleBtn}
                className="interactive-btn"
              >
                List key terms
              </button>
            </div>
          </div>
        )}

        {/* Input box pill capsule */}
        <div style={styles.inputRow} className="input-row-responsive">
          <textarea
            ref={textareaRef}
            placeholder={
              !groqKey ? "Configure your Groq API Key first..." :
                chunksCount === 0 ? "Upload and index a PDF first..." :
                  "Ask a question based on the document semantics..."
            }
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={chunksCount === 0 || !groqKey || isGenerating}
            style={styles.textField}
            className="dark-input-field text-field-responsive"
            rows={1}
          />

          {/* Sparkles icon decoration */}
          <Sparkles
            size={16}
            color="#8b1d55"
            style={{
              marginRight: '4px',
              opacity: inputValue.trim() ? 0.9 : 0.4,
              transition: 'opacity 0.2s ease'
            }}
          />

          <button
            onClick={onSend}
            disabled={!inputValue.trim() || chunksCount === 0 || !groqKey || isGenerating}
            className="interactive-btn send-btn-responsive"
            style={{
              ...styles.sendBtn,
              backgroundColor: (inputValue.trim() && chunksCount > 0 && groqKey && !isGenerating) ? '#8b1d55' : 'rgba(139, 29, 85, 0.12)',
              color: (inputValue.trim() && chunksCount > 0 && groqKey && !isGenerating) ? '#ffffff' : 'rgba(139, 29, 85, 0.4)',
              cursor: (inputValue.trim() && chunksCount > 0 && groqKey && !isGenerating) ? 'pointer' : 'not-allowed',
            }}
          >
            <Send size={15} style={{ marginLeft: '-1px' }} />
          </button>
        </div>
        <div style={styles.infoFooter} className="info-footer-responsive">
          Level 2 RAG • 384-Dim Local Embeddings via WebAssembly • Streamed Answers via Llama 3.1
        </div>
      </div>
    </main>
  );
}
