import React, { useState, useEffect, useRef } from 'react';
import { pipeline, env } from '@xenova/transformers';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import { styles, globalStyles } from './styles';
import {
  extractTextFromPDF,
  chunkText,
  retrieveRelevantChunks
} from './utils/rag';



// Force Transformers.js to fetch models from CDN and bypass local Vite SPA route fallback
env.allowLocalModels = false;

// Global singleton loader state to prevent concurrent loading issues (e.g. in React Strict Mode)
let modelPromise = null;
let activeProgressCallback = null;
let fileProgress = {};

const globalProgressCallback = (data) => {
  if (activeProgressCallback) {
    activeProgressCallback(data);
  }
};



function App() {
  const [modelState, setModelState] = useState('idle'); // 'idle', 'loading', 'ready', 'error'
  const [modelProgress, setModelProgress] = useState('Initializing embedder...');
  const [modelPercent, setModelPercent] = useState(0); // -1 for indeterminate/shimmer, 0-100 for percent
  const [groqKey, setGroqKey] = useState(() => localStorage.getItem('groq_api_key') || '');
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfText, setPdfText] = useState('');
  const [chunks, setChunks] = useState([]);
  const [indexingState, setIndexingState] = useState('idle'); // 'idle', 'parsing', 'embedding', 'done', 'error'
  const [indexingProgress, setIndexingProgress] = useState(0);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Hello! I am your Semantic Q&A Assistant. Paste your Groq API key, load a PDF document, and ask me anything! I will find matches based on the semantic meaning of your questions rather than just key words.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const embedderRef = useRef(null);

  // Dynamically load Google Fonts & inject global custom stylesheet
  useEffect(() => {
    // 1. Google Font
    const linkFont = document.createElement('link');
    linkFont.rel = 'stylesheet';
    linkFont.href = 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap';
    document.head.appendChild(linkFont);

    // 2. Custom global styles
    const styleSheet = document.createElement('style');
    styleSheet.id = 'embedded-app-styles';
    styleSheet.textContent = globalStyles;
    document.head.appendChild(styleSheet);

    // 3. Load embedding model
    loadEmbeddingModel();

    return () => {
      document.head.removeChild(linkFont);
      const injectedStyles = document.getElementById('embedded-app-styles');
      if (injectedStyles) document.head.removeChild(injectedStyles);
    };
  }, []);

  // Load Transformers.js Embedding pipeline
  const loadEmbeddingModel = async () => {
    try {
      setModelState('loading');
      setModelProgress('Downloading all-MiniLM-L6-v2 (~25MB)...');
      setModelPercent(0);

      // Define the progress callback for this active component instance
      activeProgressCallback = (data) => {
        if (data.status === 'initiate') {
          fileProgress[data.file] = { status: 'initiate', progress: 0, loaded: 0, total: 0 };
        } else if (data.status === 'progress') {
          fileProgress[data.file] = {
            status: 'progress',
            progress: data.progress || 0,
            loaded: data.loaded || 0,
            total: data.total || 0
          };
        } else if (data.status === 'done') {
          fileProgress[data.file] = {
            ...fileProgress[data.file],
            status: 'done',
            progress: 100
          };
        }

        // Calculate overall stats across all downloading files
        const files = Object.keys(fileProgress);
        if (files.length > 0) {
          let totalBytes = 0;
          let loadedBytes = 0;
          let filesCompleted = 0;
          let hasMissingTotal = false;

          files.forEach(f => {
            const fileObj = fileProgress[f];
            loadedBytes += fileObj.loaded;
            if (fileObj.total) {
              totalBytes += fileObj.total;
            } else if (fileObj.loaded > 0) {
              hasMissingTotal = true;
            }
            if (fileObj.status === 'done') {
              filesCompleted += 1;
            }
          });

          const loadedMB = (loadedBytes / (1024 * 1024)).toFixed(1);
          const isDone = files.every(f => fileProgress[f].status === 'done');

          if (isDone) {
            setModelProgress('Finalizing model load...');
            setModelPercent(100);
          } else if (hasMissingTotal) {
            const currentFile = files.find(f => fileProgress[f].status !== 'done') || '';
            const displayFile = currentFile.split('/').pop() || '';
            setModelProgress(`Downloading: ${loadedMB} MB (${filesCompleted}/${files.length} files done)${displayFile ? ` - ${displayFile}` : ''}`);
            setModelPercent(-1); // Indeterminate shimmer
          } else {
            const totalMB = (totalBytes / (1024 * 1024)).toFixed(1);
            const overallPercent = totalBytes > 0 ? Math.round((loadedBytes / totalBytes) * 100) : 0;
            const currentFile = files.find(f => fileProgress[f].status !== 'done') || '';
            const displayFile = currentFile.split('/').pop() || '';
            setModelProgress(`Downloading: ${overallPercent}% (${loadedMB}/${totalMB} MB)${displayFile ? ` - ${displayFile}` : ''}`);
            setModelPercent(overallPercent);
          }
        }
      };

      if (!modelPromise) {
        modelPromise = pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
          progress_callback: globalProgressCallback
        });
      }

      const pipelineInstance = await modelPromise;
      embedderRef.current = pipelineInstance;
      setModelState('ready');
      setModelProgress('all-MiniLM-L6-v2 loaded');
      setModelPercent(100);
    } catch (error) {
      console.error('Error loading embedding model:', error);
      modelPromise = null; // Clear promise on error to allow retries
      setModelState('error');
      setModelProgress('Failed to load AI model. Please check console or reload.');
      setModelPercent(0);
    }
  };

  const handleClearCacheAndRetry = async () => {
    if ('caches' in window) {
      try {
        const keys = await caches.keys();
        for (const key of keys) {
          if (key.includes('transformers') || key.includes('xenova')) {
            await caches.delete(key);
          }
        }
        console.log('Model cache cleared.');
      } catch (e) {
        console.error('Failed to clear cache:', e);
      }
    }
    // Reset globals and retry
    fileProgress = {};
    modelPromise = null;
    loadEmbeddingModel();
  };

  // Persists Groq key
  const handleSaveKey = (key) => {
    setGroqKey(key);
    localStorage.setItem('groq_api_key', key);
  };

  const handleClearKey = () => {
    setGroqKey('');
    localStorage.removeItem('groq_api_key');
  };

  // Orchestrate PDF Text parsing & Chunking
  const handleFileSelected = async (file) => {
    setPdfFile(file);
    setIndexingState('parsing');
    setChunks([]);

    try {
      // 1. Extract text using pdf.js utility
      const fullText = await extractTextFromPDF(file);

      if (!fullText.trim()) {
        throw new Error("This PDF seems to have no extractable text. Scanned PDFs are not supported.");
      }

      setPdfText(fullText);

      // 2. Perform word-based chunking with overlap utility
      const generatedChunks = chunkText(fullText, 300, 50);

      if (generatedChunks.length === 0) {
        throw new Error("No text chunks could be extracted from this document.");
      }

      // 3. Start local embedding generation
      embedAndIndexChunks(generatedChunks, file.name);
    } catch (err) {
      console.error(err);
      alert(`Error reading PDF: ${err.message}`);
      setIndexingState('error');
    }
  };

  // Generate Embeddings using local Xenova model
  const embedAndIndexChunks = async (rawChunks, filename) => {
    if (!embedderRef.current) {
      alert('AI Embedding Model is not ready yet. Please wait for it to load.');
      return;
    }

    setIndexingState('embedding');
    setIndexingProgress(0);
    const embeddedChunks = [];

    try {
      for (let i = 0; i < rawChunks.length; i++) {
        const progress = Math.round((i / rawChunks.length) * 100);
        setIndexingProgress(progress);

        const chunk = rawChunks[i];

        // Generate embedding via model
        const output = await embedderRef.current(chunk.text, {
          pooling: 'mean',
          normalize: true
        });

        embeddedChunks.push({
          id: chunk.id,
          text: chunk.text,
          vector: Array.from(output.data)
        });
      }

      setChunks(embeddedChunks);
      setIndexingProgress(100);
      setIndexingState('done');

      // Add system confirmation message to chat
      setChatMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          sender: 'system',
          text: `Successfully parsed and indexed "${filename}"! Created ${embeddedChunks.length} semantic chunks. You can now ask questions.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      console.error('Embedding error:', err);
      alert('An error occurred during local embedding generation.');
      setIndexingState('error');
    }
  };

  // Submit query to Groq
  const handleSend = async () => {
    const query = inputValue.trim();
    if (!query) return;
    if (!groqKey) {
      alert("Please configure your Groq API Key first.");
      return;
    }
    if (chunks.length === 0) {
      alert("Please upload and index a PDF first.");
      return;
    }

    // Add user prompt to conversation history
    const userMessageId = Date.now();
    setChatMessages(prev => [
      ...prev,
      {
        id: userMessageId,
        sender: 'user',
        text: query,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setInputValue('');
    setIsGenerating(true);

    // Initial bot message bubble for streaming
    const botMessageId = userMessageId + 1;
    setChatMessages(prev => [
      ...prev,
      {
        id: botMessageId,
        sender: 'bot',
        text: '',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    try {
      // 1. Retrieve the top matching document chunks
      const topMatches = await retrieveRelevantChunks(embedderRef.current, chunks, query, 3);

      // 2. Format context for prompt
      const contextText = topMatches
        .map((c) => c.text)
        .join('\n\n---\n\n');

      const systemPrompt = `You are a friendly Semantic Document Q&A Assistant. If the user's input is a greeting, small talk, or conversational pleasantry (like "hi", "hello", "hey", "nice to meet you", "how are you", etc.), respond with a warm, friendly, and natural conversational reply. Otherwise, answer the user's question using ONLY the provided document context. If the answer cannot be found in the context, say "Unfortunately I can't help with that, I can only provide answers from the document which you provided." Do not try to make up answers or use outside knowledge. Keep your answers concise and clear. Do NOT include any citations, source numbers, brackets, source references, or relevance scores (such as "[Source 1]", "Source 2", or match percentages) in your reply. Answer naturally using only the information from the context.`;

      // Build the message payload including previous conversation history for a true one-to-one conversational memory
      const messagesPayload = [
        { role: 'system', content: systemPrompt }
      ];

      // Extract and map previous user and assistant history (excluding the current user and bot empty streaming bubble)
      const conversationHistory = chatMessages
        .filter(msg => msg.id !== botMessageId && msg.id !== userMessageId && (msg.sender === 'user' || msg.sender === 'bot'))
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        }));

      messagesPayload.push(...conversationHistory);

      // Add document context as a system instruction before the user's latest query
      if (chunks.length > 0) {
        messagesPayload.push({
          role: 'system',
          content: `Here is the relevant document context extracted for the query:\n${contextText}`
        });
      }

      // Add the current user query
      messagesPayload.push({
        role: 'user',
        content: query
      });

      // 3. API Call to Groq (streaming)
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          stream: true,
          messages: messagesPayload
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Groq API Error: ${res.statusText}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let streamedText = '';

      // Stream handling loop
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunkStr = decoder.decode(value);
        const lines = chunkStr.split('\n');

        for (const line of lines) {
          const cleanedLine = line.trim();
          if (!cleanedLine) continue;
          if (cleanedLine === 'data: [DONE]') continue;

          if (cleanedLine.startsWith('data: ')) {
            try {
              const json = JSON.parse(cleanedLine.slice(6));
              const delta = json.choices?.[0]?.delta?.content;
              if (delta) {
                streamedText += delta;
                setChatMessages(prev => prev.map(msg =>
                  msg.id === botMessageId
                    ? { ...msg, text: streamedText }
                    : msg
                ));
              }
            } catch (e) {
              // Parse error on incomplete lines, safe to skip
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
      setChatMessages(prev => prev.map(msg =>
        msg.id === botMessageId
          ? {
            ...msg,
            text: `⚠️ **Error querying Groq API:** ${err.message}. Please verify your API Key and network connection.`
          }
          : msg
      ));
    } finally {
      setIsGenerating(false);
    }
  };

  const resetAll = () => {
    setPdfFile(null);
    setPdfText('');
    setChunks([]);
    setIndexingState('idle');
    setIndexingProgress(0);
    setChatMessages([
      {
        id: Date.now(),
        sender: 'bot',
        text: "Reset successful. Upload a new PDF document to begin searching!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div style={styles.appWrapper}>
      {/* Background blobs for room ambience */}
      <div className="bg-blob-1" />
      <div className="bg-blob-2" />
      <div className="bg-blob-3" />

      {/* Main app panel */}
      <div style={styles.appContainer}>
        {/* Configuration Sidebar */}
        <Sidebar
          modelState={modelState}
          modelProgress={modelProgress}
          modelPercent={modelPercent}
          onClearCacheAndRetry={handleClearCacheAndRetry}
          groqKey={groqKey}
          onSaveKey={handleSaveKey}
          onClearKey={handleClearKey}
          pdfFile={pdfFile}
          indexingState={indexingState}
          indexingProgress={indexingProgress}
          chunksCount={chunks.length}
          onFileSelected={handleFileSelected}
          onReset={resetAll}
        />

        {/* Chat Window Stream */}
        <ChatWindow
          pdfFile={pdfFile}
          chatMessages={chatMessages}
          isGenerating={isGenerating}
          groqKey={groqKey}
          chunksCount={chunks.length}
          inputValue={inputValue}
          onInputChange={setInputValue}
          onSend={handleSend}
        />
      </div>
    </div>
  );
}

export default App;
