import { useState } from 'react';
import { useDocumentStore } from './hooks/useDocumentStore';
import { useChat } from './hooks/useChat';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import InputArea from './components/InputArea';

export default function App() {
  const [rawText, setRawText] = useState('');
  const [openSource, setOpenSource] = useState(null);
  const doc = useDocumentStore();
  const chat = useChat(doc.chunks, doc.index);

  const handleFileLoad = async (file) => {
    const text = await doc.loadFile(file);
    setRawText(text || '');
  };

  const handleReset = () => {
    setRawText('');
    chat.clearChat();
    setOpenSource(null);
  };

  const handleProcess = async () => {
    if (!rawText) return;
    await doc.processText(rawText, doc.fileName);
    chat.setMessages([{
      role: 'assistant',
      text: `📄 **"${doc.fileName}"** is ready.\n\nBuilt a **BM25 retrieval index** over **${doc.chunks?.length ?? 0} chunks** from **${doc.pageCount} pages** — with stemming, stopword removal, query expansion, and context stitching for accurate answers on any question.\n\nAsk me **anything** about this document.`,
      sources: [],
    }]);
  };

  return (
    <div className="app">
      <Header
        loading={chat.loading}
        stage={chat.loadingStage}
        processed={doc.processed}
        chunkCount={doc.chunks?.length ?? 0}
      />
      <Sidebar
        doc={doc}
        onFileLoad={handleFileLoad}
        onProcess={handleProcess}
        onReset={handleReset}
        canProcess={!!rawText}
      />
      <main className="mn">
        <ChatArea
          messages={chat.messages}
          loading={chat.loading}
          loadingStage={chat.loadingStage}
          processed={doc.processed}
          onSend={chat.sendMessage}
          openSource={openSource}
          onOpenSource={setOpenSource}
        />
        <InputArea
          processed={doc.processed}
          loading={chat.loading}
          onSend={chat.sendMessage}
        />
      </main>
    </div>
  );
}
