const STOPWORDS = new Set(['a', 'an', 'the', 'is', 'are', 'was', 'were', 'be',
  'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'and',
  'but', 'or', 'not', 'this', 'that', 'it', 'its', 'they', 'their', 'i', 'you']);

export function tokenize(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/).filter(t => t.length > 1 && !STOPWORDS.has(t));
}

export function stem(token) {
  return token
    .replace(/ies$/, 'y')
    .replace(/(ing|tion|ness|ment|ful|less|ive|ated|ates)$/, '')
    .replace(/([^aeiou])s$/, '$1');
}

export function buildIndex(chunks) {
  const tokenizedChunks = chunks.map(c =>
    tokenize(c.text).map(stem).filter(t => t.length > 1));
  const N = chunks.length;
  const avgLen = tokenizedChunks.reduce((s, t) => s + t.length, 0) / (N || 1);
  const df = {};
  for (const tokens of tokenizedChunks)
    for (const t of new Set(tokens)) df[t] = (df[t] || 0) + 1;
  const idf = {};
  for (const t in df)
    idf[t] = Math.log((N - df[t] + 0.5) / (df[t] + 0.5) + 1);
  return { tokenizedChunks, idf, avgLen, N };
}

export function search(queryTerms, chunks, index, k = 6) {
  const K1 = 1.5, B = 0.75;
  const { tokenizedChunks, idf, avgLen } = index;
  const qTokens = [...new Set(queryTerms.flatMap(t => tokenize(String(t))).map(stem).filter(t => t.length > 1))];
  const scored = chunks.map((chunk, idx) => {
    const docTokens = tokenizedChunks[idx] || [];
    const tf = {};
    for (const t of docTokens) tf[t] = (tf[t] || 0) + 1;
    let score = 0;
    for (const qt of qTokens) {
      const freq = tf[qt] || 0;
      if (!freq) continue;
      const idfScore = idf[qt] || 0;
      score += idfScore * (freq * (K1 + 1)) /
        (freq + K1 * (1 - B + B * (docTokens.length / (avgLen || 1))));
    }
    return { idx, score, chunk };
  });
  const ranked = scored.filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score);
  if (!ranked.length) return chunks.slice(0, k).map((c, i) => ({ idx: i, score: 0, chunk: c }));
  // Add neighboring chunks for context stitching
  const selected = new Set(ranked.slice(0, k).map(r => r.idx));
  for (const r of ranked.slice(0, 3)) {
    if (r.idx > 0) selected.add(r.idx - 1);
    if (r.idx < chunks.length - 1) selected.add(r.idx + 1);
  }
  return [...selected].map(i => scored[i])
    .sort((a, b) => b.score - a.score).slice(0, k);
}
