import { useState } from 'react';
import { useDocumentStore } from './hooks/useDocumentStore';
import { useChat } from './hooks/useChat';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import InputArea from './components/InputArea';

export default function App() {
  const [rawText, setRawText] = useState('');
  const doc = useDocumentStore();
  const chat = useChat(doc.chunks, doc.index);

  const handleFileLoad = async (file) => {
    const text = await doc.loadFile(file);
    setRawText(text || '');
  };

  const handleReset = () => {
    setRawText('');
    chat.clearChat();
  };

  const handleProcess = async () => {
    if (!rawText) return;
    await doc.processText(rawText, doc.fileName);
    chat.setMessages([{
      role: 'assistant',
      text: `**"${doc.fileName}"** is indexed! Ask me anything about it.`,
      sources: [],
    }]);
  };

  return (
    <div className="app-grid min-h-screen bg-dark-bg">
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
      <main className="main-col flex flex-col pt-[58px]">
        <ChatArea
          messages={chat.messages}
          loading={chat.loading}
          loadingStage={chat.loadingStage}
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
