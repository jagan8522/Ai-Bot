import * as pdfjsLib from 'pdfjs-dist';
import PDFWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?worker';

// Configure PDFJS worker once at module initialization
pdfjsLib.GlobalWorkerOptions.workerPort = new PDFWorker();

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
