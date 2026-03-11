// src/lib/claudeApi.js
// Groq API with Llama 3.3 70B

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

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

export async function expandQuery(question) {
  try {
    const result = await callGroq(
      [{
        role: 'user',
        content: `Question: "${question}"\n\nExtract 8-12 key search terms, synonyms, and related concepts that would help find relevant passages. Include nouns, verbs, technical terms. Return ONLY a JSON array of strings. Example: ["term1","term2"]`,
      }],
      'You extract search keywords. Return only valid JSON arrays, no other text.',
      200
    );
    const clean = result.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    return Array.isArray(parsed) ? parsed : question.split(' ');
  } catch {
    return question.split(' ');
  }
}

export async function generateAnswer(question, contextChunks, history = []) {
  const context = contextChunks
    .map((c, i) => `[Source ${i + 1} — Chunk #${c.idx + 1}]:\n${c.chunk.text}`)
    .join('\n\n---\n\n');

  const systemPrompt = `You are DocQuery, a clean and precise document analyst AI.

FORMATTING RULES — follow these exactly:
1. For summaries or "key points" questions: use ## Section Title headers then bullet lists under each
2. For "list" or "find" questions: use a numbered list where each item is: "Title: description [Source N]"
3. For factual questions: answer in 1-3 clear sentences with inline citations [Source N]
4. ALWAYS cite sources inline as [Source 1], [Source 2] — place citation at end of each point
5. Keep each numbered/bullet item to ONE LINE where possible — title then brief fact
6. Use **bold** only for the title/label part of each item (before the colon)
7. Do NOT write long paragraphs for list-type questions — use structured lists
8. Do NOT add filler like "Here are the key points:" — start directly with the content
9. If answer not in context: say exactly "This is not covered in the uploaded document."
10. Never invent information

OUTPUT FORMAT EXAMPLES:

For "summarize" questions:
## Overview
- **Main topic**: Brief description [Source 1]
- **Key fact**: Brief description [Source 2]

## Section Name
- **Item**: Description [Source 3]

For "list findings" questions:
1. **Title**: One line description [Source 1]
2. **Title**: One line description [Source 2]
3. **Title**: One line description with sub-details:
   - Sub point one
   - Sub point two [Source 3]

DOCUMENT CONTEXT:
${context}`;

  const msgs = [
    ...history
      .slice(-6)
      .map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text || '' }))
      .filter(m => m.content),
    { role: 'user', content: question },
  ];

  return callGroq(msgs, systemPrompt, 1200);
}
