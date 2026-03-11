import { useState, useCallback } from 'react';
import { search } from '../lib/bm25';
import { expandQuery, generateAnswer } from '../lib/claudeApi';

export function useChat(chunks, index) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');
  const [queryStage, setQueryStage] = useState(0);
  // 0 = no query yet, 1 = expanding query, 2 = retrieving chunks, 3 = generating answer, 4 = fully done

  const sendMessage = useCallback(async (question) => {
    if (!question.trim() || !index || loading) return;
    setLoading(true);
    const history = [...messages];
    setMessages(prev => [...prev, { role: 'user', text: question }]);

    try {
      setLoadingStage('Expanding query...');
      setQueryStage(1);
      const terms = await expandQuery(question);
      setLoadingStage('Retrieving chunks...');
      setQueryStage(2);
      const topChunks = search(terms, chunks, index, 6);
      setLoadingStage('Generating answer...');
      setQueryStage(3);
      const answer = await generateAnswer(question, topChunks, history);
      setQueryStage(4);
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

  const clearChat = useCallback(() => {
    setMessages([]);
    setQueryStage(0);
  }, []);

  return { messages, loading, loadingStage, queryStage, sendMessage, clearChat, setMessages };
}
