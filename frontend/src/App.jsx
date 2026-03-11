import { useState, useCallback } from 'react';
import { useDocumentStore } from './hooks/useDocumentStore';
import { useChat } from './hooks/useChat';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import InputArea from './components/InputArea';
import Settings from './components/Settings';

const DEFAULT_SETTINGS = { model: 'llama-3.3-70b-versatile', chunkSize: 600, topK: 6, responseLength: 'normal' };

function exportChat(messages, docNames = []) {
  const date = new Date().toLocaleString();
  const docList = docNames.length ? docNames.join(', ') : 'Unknown';
  let md = `# DocQuery Chat Export\n\n**Date:** ${date}\n**Documents:** ${docList}\n\n---\n\n`;

  for (const m of messages) {
    if (m.role === 'user') {
      md += `## Q: ${(m.text || '').replace(/\n/g, ' ')}\n\n`;
    } else if (m.role === 'assistant' && (m.text || m.error)) {
      md += `**A:** ${(m.text || m.error || '').replace(/\n/g, '\n')}\n`;
      if (m.sources?.length) md += `\n*Sources: ${m.sources.length} referenced*\n`;
      md += '\n';
    }
  }
  return md;
}

export default function App() {
  const [openSource, setOpenSource] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  const doc = useDocumentStore();
  const chat = useChat(doc.chunks, doc.index, settings);

  const handleFileLoad = useCallback(async (file, append = false) => {
    await doc.loadFile(file, append);
  }, [doc]);

  const handleFilesLoad = useCallback(async (files, append = false) => {
    await doc.loadFiles(files, append);
  }, [doc]);

  const handleReset = useCallback(() => {
    doc.reset();
    chat.clearChat();
    setOpenSource(null);
  }, [doc, chat]);

  const handleProcess = useCallback(async () => {
    if (!doc.docs?.length) return;
    await doc.processDocs(settings.chunkSize);
    const chunkCount = doc.chunks?.length ?? 0;
    const docCount = doc.docs?.length ?? 0;
    const docNames = doc.docs?.map(d => d.docName || d.name).join(', ') || '';
    chat.setMessages([{
      role: 'assistant',
      text: `📄 **${docCount} document(s)** indexed.\n\nBuilt a **BM25 retrieval index** over **${chunkCount} chunks** — ask me anything.`,
      sources: [],
    }]);
  }, [doc, chat, settings.chunkSize]);

  const handleExport = useCallback(() => {
    const md = exportChat(chat.messages, doc.docs?.map(d => d.docName || d.name));
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'docquery-chat.md';
    a.click();
    URL.revokeObjectURL(url);
    setSettingsOpen(false);
  }, [chat.messages, doc.docs]);

  return (
    <div className="app">
      <Header
        loading={chat.loading}
        stage={chat.loadingStage}
        processed={doc.processed}
        chunkCount={doc.chunks?.length ?? 0}
        messageCount={chat.messages?.length ?? 0}
        onSettingsOpen={() => setSettingsOpen(true)}
        onExport={handleExport}
      />
      <Sidebar
        doc={doc}
        onFileLoad={handleFileLoad}
        onFilesLoad={handleFilesLoad}
        onProcess={handleProcess}
        onReset={handleReset}
        canProcess={doc.docs?.length > 0}
        loading={chat.loading}
        queryStage={chat.queryStage}
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
      <Settings
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onChange={setSettings}
        onExport={handleExport}
      />
    </div>
  );
}
