import React, { useState, useEffect, useRef } from 'react';
import { pipeline, env } from '@xenova/transformers';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import { styles, globalStyles } from './styles';
import {
  extractTextFromPDF,
  extractTextFromPPTX,
  extractTextFromDOCX,
  extractTextFromTXT,
  extractTextFromURL,
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
  const [filesList, setFilesList] = useState([]);
  const [chunks, setChunks] = useState([]);
  const [indexingState, setIndexingState] = useState('idle'); // 'idle', 'parsing', 'embedding', 'done', 'error'
  const [indexingProgress, setIndexingProgress] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile sidebar drawer state
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

  // Orchestrate file text parsing & Chunking
  const handleFileSelected = async (files) => {
    if (!files) return;
    
    // Support single file or file list
    const fileArray = files instanceof FileList ? Array.from(files) : Array.isArray(files) ? files : [files];
    if (fileArray.length === 0) return;
    
    setIndexingState('parsing');
    setIndexingProgress(0);

    for (let index = 0; index < fileArray.length; index++) {
      const file = fileArray[index];
      try {
        const fileName = file.name.toLowerCase();
        let fullText = '';

        if (fileName.endsWith('.pdf')) {
          fullText = await extractTextFromPDF(file);
        } else if (fileName.endsWith('.pptx')) {
          fullText = await extractTextFromPPTX(file);
        } else if (fileName.endsWith('.docx')) {
          fullText = await extractTextFromDOCX(file);
        } else if (fileName.endsWith('.txt')) {
          fullText = await extractTextFromTXT(file);
        } else {
          alert(`Unsupported file type: ${file.name}. Skipping...`);
          continue;
        }

        if (!fullText || !fullText.trim()) {
          alert(`No extractable text found in ${file.name}. Skipping...`);
          continue;
        }

        const generatedChunks = chunkText(fullText, 300, 50);
        if (generatedChunks.length === 0) {
          alert(`No text chunks could be extracted from ${file.name}. Skipping...`);
          continue;
        }

        // Await each sequentially so the progress bar updates properly
        await embedAndIndexChunks(generatedChunks, file.name, file);
      } catch (err) {
        console.error(err);
        alert(`Error reading document ${file.name}: ${err.message}`);
      }
    }
    
    setIndexingState('done');
  };

  // Orchestrate website text scraping & Chunking
  const handleLinkSubmitted = async (url) => {
    if (!url || !url.trim()) return;
    
    // Clean URL
    let cleanUrl = url.trim();
    if (!/^https?:\/\//i.test(cleanUrl)) {
      cleanUrl = 'https://' + cleanUrl;
    }
    
    // Create a mock file object representing the link
    const mockLinkFile = {
      name: cleanUrl,
      size: 0,
      isLink: true
    };
    
    setIndexingState('parsing');
    
    try {
      const fullText = await extractTextFromURL(cleanUrl);
      
      if (!fullText || !fullText.trim()) {
        throw new Error("Could not extract any readable text from this website.");
      }
      
      mockLinkFile.size = fullText.length; // character count
      
      const generatedChunks = chunkText(fullText, 300, 50);
      if (generatedChunks.length === 0) {
        throw new Error("No text chunks could be extracted from this website content.");
      }
      
      await embedAndIndexChunks(generatedChunks, cleanUrl, mockLinkFile);
    } catch (err) {
      console.error(err);
      alert(`Error indexing website: ${err.message}`);
      setIndexingState('error');
    }
  };

  // Generate Embeddings using local Xenova model
  const embedAndIndexChunks = async (rawChunks, filename, fileObj) => {
    if (!embedderRef.current) {
      alert('AI Embedding Model is not ready yet. Please wait for it to load.');
      return;
    }

    setIndexingState('embedding');
    setIndexingProgress(0);
    const embeddedChunks = [];
    const baseId = Date.now();

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
          id: `${baseId}-${i}`,
          text: chunk.text,
          vector: Array.from(output.data),
          source: filename
        });
      }

      setChunks(prev => [...prev, ...embeddedChunks]);
      setFilesList(prev => {
        const filtered = prev.filter(f => f.name !== filename);
        return [...filtered, fileObj];
      });
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

  // Remove a specific active file/link and its chunks
  const handleRemoveFile = (filename) => {
    setFilesList(prev => prev.filter(f => f.name !== filename));
    setChunks(prev => prev.filter(c => c.source !== filename));
    
    setChatMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        sender: 'system',
        text: `Removed "${filename}" and cleared all its associated vector chunks from the database.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
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
    setFilesList([]);
    setChunks([]);
    setIndexingState('idle');
    setIndexingProgress(0);
    setChatMessages([
      {
        id: Date.now(),
        sender: 'bot',
        text: "Reset successful. All indexed documents and links have been cleared. Upload new sources to begin!",
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
        {/* Mobile sidebar backdrop overlay — must be INSIDE appContainer to share stacking context with Sidebar */}
        <div
          className={`sidebar-overlay${sidebarOpen ? ' visible' : ''}`}
          onClick={() => setSidebarOpen(false)}
        />

        {/* Configuration Sidebar */}
        <Sidebar
          modelState={modelState}
          modelProgress={modelProgress}
          modelPercent={modelPercent}
          onClearCacheAndRetry={handleClearCacheAndRetry}
          groqKey={groqKey}
          onSaveKey={handleSaveKey}
          onClearKey={handleClearKey}
          filesList={filesList}
          indexingState={indexingState}
          indexingProgress={indexingProgress}
          chunksCount={chunks.length}
          onFileSelected={handleFileSelected}
          onLinkSubmitted={handleLinkSubmitted}
          onRemoveFile={handleRemoveFile}
          onReset={resetAll}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Chat Window Stream */}
        <ChatWindow
          filesList={filesList}
          chatMessages={chatMessages}
          isGenerating={isGenerating}
          groqKey={groqKey}
          chunksCount={chunks.length}
          inputValue={inputValue}
          onInputChange={setInputValue}
          onSend={handleSend}
          onOpenSidebar={() => setSidebarOpen(true)}
        />
      </div>
    </div>
  );
}

export default App;
