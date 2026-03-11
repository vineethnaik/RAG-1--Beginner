# RAG PDF Chatbot

A production-quality Retrieval Augmented Generation (RAG) application where users upload a PDF and ask questions about it. The AI retrieves relevant text passages and generates precise, cited answers.

## Features

- **PDF Upload**: Drag-and-drop or browse to upload PDF files
- **In-browser Processing**: PDF.js extracts text locally — no server upload required
- **BM25 Indexing**: Sentence-aware chunking with overlap for accurate retrieval
- **Claude Query Expansion**: User questions expanded into 8-12 search terms
- **Cited Answers**: [Source N] inline citations with clickable source chips
- **Conversation History**: Follow-up questions with full context

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS
- **PDF**: PDF.js 3.11.174
- **Retrieval**: Custom BM25 implementation
- **LLM**: Groq API (llama-3.1-70b-versatile)

## Quick Start

```bash
cd rag-pdf-chatbot/frontend
npm install
```

Create a `.env` file in the frontend directory:

```
VITE_GROQ_API_KEY=your_groq_api_key_here
```

Run the development server:

```bash
npm run dev
```

Open http://localhost:5173

## Usage

1. Upload a PDF via drag-and-drop or file picker
2. Click **Process & Index** to chunk and index the document
3. Ask questions in natural language
4. Click source chips to view the raw retrieved text

## Project Structure

```
rag-pdf-chatbot/
├── frontend/
│   ├── src/
│   │   ├── components/   # React UI components
│   │   ├── lib/         # pdfLoader, chunker, bm25, claudeApi
│   │   └── hooks/       # useDocumentStore, useChat
│   └── ...
└── README.md
```

## Deployment

### Vercel
- Push to GitHub
- Import in Vercel
- Add `VITE_ANTHROPIC_API_KEY` as environment variable
- Deploy

### Netlify
```bash
npm run build
# Drag dist/ to app.netlify.com/drop
```

## Troubleshooting

- **401 Unauthorized**: Ensure `.env` has `VITE_GROQ_API_KEY` and restart dev server
- **Empty PDF**: Scanned PDFs require OCR — the app detects image-based PDFs
- **CORS/Worker**: PDF.js worker is loaded from CDN; ensure versions match (3.11.174)
