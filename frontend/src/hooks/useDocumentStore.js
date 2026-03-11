import { useState, useCallback } from 'react';
import { extractTextFromPdf } from '../lib/pdfLoader';
import { chunkText } from '../lib/chunker';
import { buildIndex } from '../lib/bm25';

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

export function useDocumentStore() {
  const [state, setState] = useState({
    fileName: '',
    fileSize: 0,
    pageCount: 0,
    chunks: [],
    index: null,
    processing: false,
    processed: false,
    progress: 0,
    progressLabel: '',
    error: null,
  });

  const loadFile = useCallback(async (file) => {
    if (!file || file.type !== 'application/pdf') return null;
    setState(s => ({
      ...s,
      fileName: file.name,
      fileSize: file.size,
      pageCount: 0,
      chunks: [],
      index: null,
      processed: false,
      error: null,
    }));
    try {
      const { text, pageCount } = await extractTextFromPdf(file);
      setState(s => ({ ...s, pageCount }));
      return text;
    } catch (err) {
      setState(s => ({ ...s, error: err.message }));
      return null;
    }
  }, []);

  const processText = useCallback(async (text, fileName) => {
    if (!text) return null;
    setState(s => ({ ...s, processing: true, progress: 10, progressLabel: 'Chunking...', error: null }));
    await delay(200);
    const chunks = chunkText(text, 600, 100);
    setState(s => ({ ...s, progress: 50, progressLabel: `${chunks.length} chunks created` }));
    await delay(200);
    const index = buildIndex(chunks);
    setState(s => ({ ...s, progress: 90, progressLabel: 'Building BM25 index...' }));
    await delay(200);
    setState(s => ({
      ...s,
      chunks,
      index,
      processing: false,
      processed: true,
      progress: 100,
      progressLabel: 'Ready!',
    }));
    return { chunks, index };
  }, []);

  const reset = useCallback(() => {
    setState({
      fileName: '',
      fileSize: 0,
      pageCount: 0,
      chunks: [],
      index: null,
      processing: false,
      processed: false,
      progress: 0,
      progressLabel: '',
      error: null,
    });
  }, []);

  return { ...state, loadFile, processText, reset };
}
