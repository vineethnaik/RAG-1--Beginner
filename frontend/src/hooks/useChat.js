import { useState, useCallback } from 'react';
import { search } from '../lib/bm25';
import { expandQuery, generateAnswer } from '../lib/claudeApi';

export function useChat(chunks, index) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');

  const sendMessage = useCallback(async (question) => {
    if (!question.trim() || !index || loading) return;
    setLoading(true);
    const history = [...messages];
    setMessages(prev => [...prev, { role: 'user', text: question }]);

    try {
      setLoadingStage('Expanding query...');
      const terms = await expandQuery(question);
      setLoadingStage('Retrieving chunks...');
      const topChunks = search(terms, chunks, index, 6);
      setLoadingStage('Generating answer...');
      const answer = await generateAnswer(question, topChunks, history);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', text: answer, sources: topChunks, expandedTerms: terms },
      ]);
    } catch (e) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', text: null, error: e.message, sources: [] },
      ]);
    } finally {
      setLoading(false);
      setLoadingStage('');
    }
  }, [chunks, index, loading, messages]);

  const clearChat = useCallback(() => setMessages([]), []);

  return { messages, loading, loadingStage, sendMessage, clearChat, setMessages };
}
