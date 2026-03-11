export function chunkText(text, chunkSize = 600, overlap = 100) {
  const chunks = [];
  // Split on sentence boundaries for cleaner chunks
  const sentences = text.replace(/\s+/g, ' ').trim()
    .split(/(?<=[.!?])\s+/);
  let current = '';
  for (const sentence of sentences) {
    if ((current + ' ' + sentence).length > chunkSize && current.length > 0) {
      chunks.push({ text: current.trim() });
      // Build overlap from end of current chunk
      const words = current.split(' ');
      let overlapText = '';
      for (let i = words.length - 1; i >= 0; i--) {
        if ((words[i] + ' ' + overlapText).length > overlap) break;
        overlapText = words[i] + ' ' + overlapText;
      }
      current = overlapText.trim() + ' ' + sentence;
    } else {
      current = current ? current + ' ' + sentence : sentence;
    }
  }
  if (current.trim()) chunks.push({ text: current.trim() });
  return chunks;
}
