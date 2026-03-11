function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatInline(text) {
  return escapeHtml(text)
    .replace(/\[Source (\d+)\]/g, '<span class="src-badge">[S$1]</span>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
}

function renderMarkdown(text) {
  if (!text) return '';
  const lines = text.split('\n');
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const t = line.trim();
    if (!t) { i++; continue; }

    if (t.startsWith('### ')) {
      out.push(`<div class="md-h3">${formatInline(t.slice(4))}</div>`);
      i++;
      continue;
    }
    if (t.startsWith('## ')) {
      out.push(`<div class="md-h2">${formatInline(t.slice(3))}</div>`);
      i++;
      continue;
    }
    if (t.startsWith('# ')) {
      out.push(`<div class="md-h1">${formatInline(t.slice(2))}</div>`);
      i++;
      continue;
    }

    if (/^\d+\.\s/.test(t)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        const content = lines[i].trim().replace(/^\d+\.\s+/, '');
        const subs = [];
        let j = i + 1;
        while (j < lines.length && /^[\s\t]+[-*•]\s/.test(lines[j])) {
          subs.push(lines[j].trim().replace(/^[-*•]\s+/, ''));
          j++;
        }
        items.push({ content, subs });
        i = j;
      }
      out.push(`<div class="md-num-list">${items.map((it, n) => {
        const colonIdx = it.content.indexOf(': ');
        const hasTitle = colonIdx > 0 && colonIdx < 60;
        const titlePart = hasTitle ? it.content.slice(0, colonIdx) : '';
        const bodyPart = hasTitle ? it.content.slice(colonIdx + 2) : it.content;
        const innerHtml = hasTitle
          ? `<span class="md-num-title">${formatInline(titlePart)}</span><span class="md-num-body"> — ${formatInline(bodyPart)}</span>`
          : formatInline(it.content);
        const subHtml = it.subs?.length
          ? `<div class="md-sub-list">${it.subs.map(s => `<div class="md-sub-item"><span class="md-dot-sm">◦</span><span>${formatInline(s)}</span></div>`).join('')}</div>`
          : '';
        return `<div class="md-num-item"><span class="md-num">${n + 1}</span><span class="md-num-content">${innerHtml}${subHtml}</span></div>`;
      }).join('')}</div>`);
      continue;
    }

    if (/^[-*•]\s/.test(t)) {
      const items = [];
      while (i < lines.length && /^[-*•]\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*•]\s+/, ''));
        i++;
      }
      out.push(`<div class="md-bullet-list">${items.map(it => {
        const ci = it.indexOf(': ');
        const hasT = ci > 0 && ci < 60;
        const inner = hasT
          ? `<strong>${formatInline(it.slice(0, ci))}</strong>: ${formatInline(it.slice(ci + 2))}`
          : formatInline(it);
        return `<div class="md-bullet-item"><span class="md-dot">▸</span><span>${inner}</span></div>`;
      }).join('')}</div>`);
      continue;
    }

    const paras = [];
    while (i < lines.length && lines[i].trim() &&
      !/^#{1,3}\s/.test(lines[i].trim()) &&
      !/^\d+\.\s/.test(lines[i].trim()) &&
      !/^[-*•]\s/.test(lines[i].trim())) {
      paras.push(lines[i].trim());
      i++;
    }
    if (paras.length) out.push(`<p class="md-para">${formatInline(paras.join(' '))}</p>`);
  }

  return out.join('');
}

export default function MessageBubble({ message, msgIndex, openSource, onOpenSource }) {
  const isUser = message.role === 'user';
  const keyBase = `${msgIndex}`;

  return (
    <div className={`msg msg-${isUser ? 'u' : 'a'}`}>
      <div className="msg-lbl">{isUser ? 'YOU' : 'DOCQUERY'}</div>
      {message.error ? (
        <div className="err">⚠️ {message.error}</div>
      ) : (
        <div
          className={`bubble ${isUser ? 'b-u' : 'b-a'}`}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(message.text || '') }}
        />
      )}
      {!isUser && message.sources?.length > 0 && (
        <div className="srcs">
          <div className="srcs-title">📎 Sources referenced</div>
          <div className="src-chips">
            {message.sources.map((s, si) => {
              const key = `${keyBase}-${si}`;
              const isOpen = openSource === key;
              return (
                <div
                  key={si}
                  className={`src-chip ${isOpen ? 'open' : ''}`}
                  onClick={() => onOpenSource?.(isOpen ? null : key)}
                >
                  <span className="src-n">S{si + 1}</span>
                  Source {si + 1}
                </div>
              );
            })}
          </div>
          {message.sources.map((s, si) => {
            if (openSource !== `${keyBase}-${si}`) return null;
            return (
              <div className="src-drawer" key={si}>
                <div className="sd-hd">
                  <div className="sd-title">Source {si + 1} — Retrieved Passage</div>
                  <div className="sd-close" onClick={() => onOpenSource?.(null)}>✕</div>
                </div>
                <div className="sd-text">{s.chunk?.text}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
