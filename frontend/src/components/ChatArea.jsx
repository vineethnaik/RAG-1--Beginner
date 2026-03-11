import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';

const SAMPLE_Qs = ['What is the main topic?', 'Summarize the key points', 'What are the main conclusions?', 'List all important terms'];

export default function ChatArea({ messages, loading, loadingStage, processed, onSend, openSource, onOpenSource }) {
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, loading]);

  return (
    <div className="chat" ref={chatRef}>
      {messages.length === 0 && !loading ? (
        <div className="empty">
          <div className="empty-icon">🔍</div>
          <div className="empty-title">Ask your document anything</div>
          <div className="empty-body">Upload a PDF and I&apos;ll answer any question about it — facts, summaries, definitions, comparisons, and more.</div>
          <div className="empty-pills">
            {SAMPLE_Qs.map((q, i) => (
              <div key={i} className="pill" onClick={() => processed && onSend?.(q)}>
                {q}
              </div>
            ))}
          </div>
        </div>
      ) : (
        messages.map((msg, mi) => (
          <MessageBubble
            key={mi}
            message={msg}
            msgIndex={mi}
            openSource={openSource}
            onOpenSource={onOpenSource}
          />
        ))
      )}
      {loading && (
        <div className="msg msg-a">
          <div className="msg-lbl">DOCQUERY</div>
          <div className="thinking">
            <div className="dots"><span /><span /><span /></div>
            <div className="thinking-txt">{loadingStage || 'thinking…'}</div>
          </div>
        </div>
      )}
    </div>
  );
}
