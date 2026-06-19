import * as pdfjsLib from 'pdfjs-dist';
import PDFWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?worker';
import JSZip from 'jszip';

// Configure PDFJS worker once at module initialization
pdfjsLib.GlobalWorkerOptions.workerPort = new PDFWorker();

/**
 * Parses and extracts text content from a PPTX file.
 * PPTX files are ZIP archives containing slides XML under ppt/slides/slide*.xml.
 * @param {File} file 
 * @returns {Promise<string>}
 */
export async function extractTextFromPPTX(file) {
  const buffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(buffer);
  
  // Find all slide XML files
  const slideFiles = Object.keys(zip.files).filter(
    name => name.startsWith('ppt/slides/slide') && name.endsWith('.xml')
  );
  
  // Sort slides in natural numerical order
  slideFiles.sort((a, b) => {
    const numA = parseInt(a.match(/\d+/)[0], 10);
    const numB = parseInt(b.match(/\d+/)[0], 10);
    return numA - numB;
  });
  
  let fullText = '';
  const parser = new DOMParser();
  
  for (const slideFile of slideFiles) {
    const slideXmlText = await zip.file(slideFile).async('text');
    const xmlDoc = parser.parseFromString(slideXmlText, 'application/xml');
    
    // In PPTX XML, text runs are in <a:t> elements
    const textElements = xmlDoc.getElementsByTagName('a:t');
    let slideText = '';
    for (let i = 0; i < textElements.length; i++) {
      slideText += textElements[i].textContent + ' ';
    }
    
    if (slideText.trim()) {
      fullText += slideText.trim() + ' \n';
    }
  }
  
  return fullText;
}

/**
 * Parses and extracts text content from a DOCX file.
 * DOCX files are ZIP archives containing document XML under word/document.xml.
 * @param {File} file 
 * @returns {Promise<string>}
 */
export async function extractTextFromDOCX(file) {
  const buffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(buffer);
  
  const docXmlText = await zip.file('word/document.xml').async('text');
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(docXmlText, 'application/xml');
  
  // In DOCX XML, text runs are in <w:t> elements
  const textElements = xmlDoc.getElementsByTagName('w:t');
  let fullText = '';
  for (let i = 0; i < textElements.length; i++) {
    fullText += textElements[i].textContent + ' ';
  }
  
  return fullText;
}

/**
 * Reads text content from a plain TXT file.
 * @param {File} file 
 * @returns {Promise<string>}
 */
export async function extractTextFromTXT(file) {
  return await file.text();
}

/**
 * Fetches and extracts main text content from a website URL via CORS proxies.
 * Tries corsproxy.io first (fast raw text) and falls back to allorigins.win.
 * @param {string} url 
 * @returns {Promise<string>}
 */
export async function extractTextFromURL(url) {
  let htmlString = '';
  let fetched = false;

  // Try CorsProxy.io first (returns raw text)
  try {
    const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    if (response.ok) {
      const text = await response.text();
      if (text && text.trim()) {
        htmlString = text;
        fetched = true;
      }
    }
  } catch (err) {
    console.warn("CorsProxy.io failed, attempting fallback proxy...", err);
  }

  // Try AllOrigins as a fallback (returns JSON wrapper)
  if (!fetched) {
    try {
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      if (response.ok) {
        const data = await response.json();
        const text = data.contents;
        if (text && text.trim()) {
          htmlString = text;
          fetched = true;
        }
      }
    } catch (err) {
      console.error("AllOrigins fallback proxy also failed:", err);
    }
  }

  if (!fetched || !htmlString) {
    throw new Error("Failed to fetch webpage content through CORS proxy servers. The target website may be blocking requests, or proxy servers are unavailable.");
  }
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  
  // Get metadata before removing head elements
  const title = doc.querySelector('title')?.textContent || '';
  const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') || 
                      doc.querySelector('meta[property="og:description"]')?.getAttribute('content') || '';
  
  // Remove non-content elements to clean up text
  const elementsToRemove = doc.querySelectorAll('script, style, iframe, noscript, nav, footer, header, svg, path');
  elementsToRemove.forEach(el => el.remove());
  
  // Extract main content text using textContent (safer than innerText for parsed document fragments)
  const bodyText = doc.body ? (doc.body.textContent || doc.body.innerText || '') : '';
  
  // Combine title, description, and body content
  let combinedText = '';
  if (title.trim()) {
    combinedText += `Page Title: ${title.trim()}\n`;
  }
  if (description.trim()) {
    combinedText += `Description: ${description.trim()}\n`;
  }
  if (bodyText.trim()) {
    combinedText += bodyText.trim();
  }
  
  // Clean up excess whitespace
  return combinedText.replace(/\s+/g, ' ').trim();
}

/**
 * Parses and extracts text content from a raw PDF file array buffer.
 * @param {File} file 
 * @returns {Promise<string>} Full extracted text content of the PDF
 */
export async function extractTextFromPDF(file) {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(' ');
    fullText += pageText + ' \n';
  }
  return fullText;
}

/**
 * Chunks a long text body into smaller, overlapping windows of words.
 * @param {string} text 
 * @param {number} size 
 * @param {number} overlap 
 * @returns {Array<{ id: number, text: string }>} Chunks array
 */
export function chunkText(text, size = 300, overlap = 50) {
  const words = text.split(/\s+/).filter(Boolean);
  const chunksArray = [];

  for (let i = 0; i < words.length; i += (size - overlap)) {
    const chunkWords = words.slice(i, i + size);
    chunksArray.push({
      id: chunksArray.length,
      text: chunkWords.join(' ')
    });
    if (i + size >= words.length) break;
  }
  return chunksArray;
}

/**
 * Calculates cosine similarity between two normalized vectors (dot product).
 * @param {Array<number>} vecA 
 * @param {Array<number>} vecB 
 * @returns {number} similarity score (between -1 and 1)
 */
export function calculateCosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
  }
  return dotProduct;
}

/**
 * Embeds a query, scores it against all chunk vectors, and returns the top matches.
 * @param {Function} embedder Transformers.js pipeline 
 * @param {Array} chunks Chunks array with vectors
 * @param {string} question User prompt
 * @param {number} topK Number of chunks to retrieve
 * @returns {Promise<Array<{ text: string, score: number }>>} Relevant matching chunks sorted by relevance
 */
export async function retrieveRelevantChunks(embedder, chunks, question, topK = 3) {
  if (!embedder) throw new Error("Embedder not loaded");

  // 1. Embed the user's question
  const output = await embedder(question, {
    pooling: 'mean',
    normalize: true
  });
  const questionVector = Array.from(output.data);

  // 2. Score every chunk against the question vector
  const scoredChunks = chunks.map(chunk => ({
    text: chunk.text,
    score: calculateCosineSimilarity(questionVector, chunk.vector)
  }));

  // 3. Sort by highest score
  scoredChunks.sort((a, b) => b.score - a.score);

  return scoredChunks.slice(0, topK);
}
