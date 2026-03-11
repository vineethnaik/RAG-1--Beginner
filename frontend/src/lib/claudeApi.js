// Groq API - supports streaming
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

function getApiKey() {
  const key = import.meta.env.VITE_GROQ_API_KEY;
  if (!key) throw new Error('VITE_GROQ_API_KEY is missing. Add it to your .env file.');
  return key;
}

async function callGroq(messages, systemPrompt, maxTokens = 1000, model = DEFAULT_MODEL) {
  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
    }),
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data.choices[0].message.content;
}

export async function groqStream(messages, systemPrompt, maxTokens, model, onChunk) {
  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify({
      model: model || DEFAULT_MODEL,
      max_tokens: maxTokens || 1200,
      stream: true,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
    }),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Stream request failed');
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ') && line !== 'data: [DONE]') {
        try {
          const json = JSON.parse(line.slice(6));
          const delta = json.choices?.[0]?.delta?.content;
          if (delta) {
            fullText += delta;
            onChunk(fullText);
          }
        } catch (_) {}
      }
    }
  }
  return fullText;
}

export async function expandQuery(question, model = DEFAULT_MODEL) {
  try {
    const result = await callGroq(
      [{
        role: 'user',
        content: `Question: "${question}"\n\nExtract 8-12 key search terms, synonyms, and related concepts. Return ONLY a JSON array: ["term1","term2"]`,
      }],
      'You extract search keywords. Return only valid JSON arrays, no other text.',
      200,
      model
    );
    const clean = result.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    return Array.isArray(parsed) ? parsed : question.split(' ');
  } catch {
    return question.split(' ');
  }
}

export function buildSystemPrompt(context, responseLength = 'normal') {
  const maxTokens = responseLength === 'concise' ? 600 : responseLength === 'detailed' ? 1800 : 1200;
  return `You are DocQuery, a clean and precise document analyst AI.
FORMATTING RULES:
1. For summaries: use ## Section Title headers then bullet lists
2. For list questions: use numbered list "Title: description [Source N]"
3. Cite sources inline as [Source 1], [Source 2]
4. Use **bold** for title/label before colon
5. No filler - start with content
6. If not in context: "This is not covered in the uploaded document."
7. Never invent information
${responseLength === 'concise' ? '8. Be brief - 2-4 bullet points or 1-2 sentences.' : ''}
${responseLength === 'detailed' ? '8. Be thorough - include all relevant details.' : ''}

DOCUMENT CONTEXT:
${context}`;
}

export async function generateAnswer(question, contextChunks, history = [], opts = {}) {
  const { model = DEFAULT_MODEL, maxTokens = 1200, stream = false, onChunk } = opts;

  const context = contextChunks
    .map((c, i) => `[Source ${i + 1} — Chunk #${c.idx + 1}${c.chunk.docName ? ` (${c.chunk.docName})` : ''}]:\n${c.chunk.text}`)
    .join('\n\n---\n\n');

  const systemPrompt = buildSystemPrompt(context, opts.responseLength);
  const msgs = [
    ...history.slice(-6).map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text || '' })).filter(m => m.content),
    { role: 'user', content: question },
  ];

  if (stream && onChunk) {
    return groqStream(msgs, systemPrompt, maxTokens, model, onChunk);
  }
  return callGroq(msgs, systemPrompt, maxTokens, model);
}
