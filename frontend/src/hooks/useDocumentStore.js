import { useState, useCallback } from 'react';
import { extractTextFromPdf } from '../lib/pdfLoader';
import { chunkText } from '../lib/chunker';
import { buildIndex } from '../lib/bm25';

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

export function useDocumentStore() {
  const [state, setState] = useState({
    docs: [],
    chunks: [],
    index: null,
    processing: false,
    processed: false,
    progress: 0,
    progressLabel: '',
    error: null,
  });

  const loadFile = useCallback(async (file, append = false) => {
    if (!file || file.type !== 'application/pdf') return null;
    setState(s => ({ ...s, error: null }));
    try {
      const { text, pageCount } = await extractTextFromPdf(file);
      const doc = { name: file.name, docName: file.name, size: file.size, pages: pageCount, text };
      setState(s => ({
        ...s,
        docs: append ? [...s.docs, doc] : [doc],
        chunks: [],
        index: null,
        processed: false,
      }));
      return text;
    } catch (err) {
      setState(s => ({ ...s, error: err.message }));
      return null;
    }
  }, []);

  const loadFiles = useCallback(async (files, append = false) => {
    const results = [];
    for (const file of Array.from(files || [])) {
      if (file?.type === 'application/pdf') {
        const text = await loadFile(file, append || results.length > 0);
        if (text) results.push({ file, text });
      }
    }
    return results;
  }, [loadFile]);

  const removeDoc = useCallback((docName) => {
    setState(s => {
      const docs = s.docs.filter(d => d.docName !== docName);
      return {
        ...s,
        docs,
        chunks: [],
        index: null,
        processed: false,
      };
    });
  }, []);

  const processDocs = useCallback(async (chunkSize = 600) => {
    let docs = [];
    setState(s => {
      docs = s.docs;
      return { ...s, processing: true, progress: 10, progressLabel: 'Chunking...', error: null };
    });
    if (!docs.length) return null;

    await delay(200);

    const allChunks = [];
    for (const doc of docs) {
      const docChunks = chunkText(doc.text, chunkSize, 100, doc.docName);
      allChunks.push(...docChunks);
    }

    setState(s => ({ ...s, progress: 50, progressLabel: `${allChunks.length} chunks created` }));
    await delay(200);

    const index = buildIndex(allChunks);
    setState(s => ({ ...s, progress: 90, progressLabel: 'Building BM25 index...' }));
    await delay(200);

    setState(s => ({
      ...s,
      chunks: allChunks,
      index,
      processing: false,
      processed: true,
      progress: 100,
      progressLabel: 'Ready!',
    }));
    return { chunks: allChunks, index };
  }, []);

  const reset = useCallback(() => {
    setState({
      docs: [],
      chunks: [],
      index: null,
      processing: false,
      processed: false,
      progress: 0,
      progressLabel: '',
      error: null,
    });
  }, []);

  const pageCount = state.docs.reduce((s, d) => s + (d.pages || 0), 0);
  const fileName = state.docs.length === 1 ? state.docs[0]?.name : `${state.docs.length} documents`;
  const fileSize = state.docs.reduce((s, d) => s + (d.size || 0), 0);

  return {
    ...state,
    pageCount,
    fileName,
    fileSize,
    loadFile,
    loadFiles,
    removeDoc,
    processDocs,
    reset,
  };
}
