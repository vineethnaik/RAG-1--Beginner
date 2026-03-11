import { useState, useCallback } from 'react';
import { search } from '../lib/bm25';
import { expandQuery, generateAnswer } from '../lib/claudeApi';

const DEFAULT_SETTINGS = { model: 'llama-3.3-70b-versatile', chunkSize: 600, topK: 6, responseLength: 'normal' };

export function useChat(chunks, index, settings = DEFAULT_SETTINGS) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');
  const [queryStage, setQueryStage] = useState(0);

  const sendMessage = useCallback(async (question) => {
    if (!question.trim() || !index || loading) return;

    setLoading(true);
    const history = [...messages];
    setMessages(prev => [...prev, { role: 'user', text: question }]);

    const s = settings || DEFAULT_SETTINGS;
    const topK = s.topK ?? 6;
    const placeholderIdx = messages.length + 1;

    try {
      setLoadingStage('Expanding query...');
      setQueryStage(1);
      const terms = await expandQuery(question, s.model);

      setLoadingStage('Retrieving chunks...');
      setQueryStage(2);
      const topChunks = search(terms, chunks, index, topK);

      setQueryStage(3);
      setMessages(prev => [...prev, { role: 'assistant', text: '', sources: topChunks, expandedTerms: terms, streaming: true }]);

      const answer = await generateAnswer(question, topChunks, history, {
        model: s.model,
        maxTokens: s.responseLength === 'concise' ? 600 : s.responseLength === 'detailed' ? 1800 : 1200,
        responseLength: s.responseLength,
        stream: true,
        onChunk: (fullText) => {
          setMessages(prev => {
            const next = [...prev];
            const idx = next.findIndex(m => m.streaming);
            if (idx >= 0) next[idx] = { ...next[idx], text: fullText };
            return next;
          });
        },
      });

      setMessages(prev => {
        const next = prev.map(m => m.streaming ? { ...m, text: answer, streaming: false } : m);
        return next;
      });
      setQueryStage(4);
    } catch (e) {
      setQueryStage(4);
      setMessages(prev => {
        const next = prev.filter(m => !m.streaming);
        next.push({ role: 'assistant', text: null, error: e.message, sources: [] });
        return next;
      });
    } finally {
      setLoading(false);
      setLoadingStage('');
    }
  }, [chunks, index, loading, messages, settings]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setQueryStage(0);
  }, []);

  return { messages, loading, loadingStage, queryStage, sendMessage, clearChat, setMessages };
}
