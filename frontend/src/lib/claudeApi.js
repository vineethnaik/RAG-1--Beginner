// src/lib/claudeApi.js
// Updated to use Groq API with Mixtral-8x7B

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

// ── Core API caller ──────────────────────────────────────────────────
async function callGroq(messages, systemPrompt, maxTokens = 1000) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) throw new Error('VITE_GROQ_API_KEY is missing. Add it to your .env file.');
  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
    }),
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data.choices[0].message.content;
}

// ── Query Expansion ──────────────────────────────────────────────────
export async function expandQuery(question) {
  try {
    const result = await callGroq(
      [{
        role: 'user',
        content: `Question: "${question}"\nExtract 8-12 key search terms, synonyms, and related concepts that would help find this answer in a document.\nReturn ONLY a JSON array: ["term1","term2","term3"]`
      }],
      'You extract search keywords. Return only valid JSON arrays, no extra text.',
      200
    );
    const clean = result.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    return Array.isArray(parsed) ? parsed : question.split(' ');
  } catch {
    return question.split(' ');
  }
}

// ── Answer Generation ────────────────────────────────────────────────
export async function generateAnswer(question, contextChunks, history = []) {
  const context = contextChunks
    .map((c, i) => `[Source ${i + 1} - Chunk #${c.idx + 1}]:\n${c.chunk.text}`)
    .join('\n\n---\n\n');

  const systemPrompt = `You are DocQuery, a precise document analyst.
RULES:
1. Answer ONLY from the document context below - never use outside knowledge
2. Always cite sources inline: [Source 1], [Source 2], etc.
3. If the answer is not in the context, say:
'This information is not covered in the uploaded document.'
4. Be thorough - extract ALL relevant information from the context
5. Use numbered lists and clear formatting where helpful

DOCUMENT CONTEXT:

${context}`;

  const msgs = [
    ...history
      .slice(-6)
      .map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.text || '',
      }))
      .filter(m => m.content),
    { role: 'user', content: question },
  ];

  return callGroq(msgs, systemPrompt, 1200);
}
