import { User } from 'lucide-react';
import SourceChip from './SourceChip';

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
  const lines = text.split(/\n/);
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === '') {
      i++;
      continue;
    }

    if (trimmed.startsWith('### ')) {
      blocks.push(`<div class="md-h3">${formatInline(trimmed.slice(4))}</div>`);
      i++;
      continue;
    }
    if (trimmed.startsWith('## ')) {
      blocks.push(`<div class="md-h2">${formatInline(trimmed.slice(3))}</div>`);
      i++;
      continue;
    }
    if (trimmed.startsWith('# ')) {
      blocks.push(`<div class="md-h1">${formatInline(trimmed.slice(2))}</div>`);
      i++;
      continue;
    }

    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      const numItems = [];
      while (i < lines.length) {
        const l = lines[i];
        const t = l.trim();
        const m = t.match(/^(\d+)\.\s+(.*)$/);
        if (m) {
          numItems.push({ num: m[1], content: m[2] });
          i++;
        } else if (l.match(/^\s{2,}/) && t) {
          const subContent = t.replace(/^[-*•]\s*/, '');
          if (numItems.length) {
            numItems[numItems.length - 1].subItems = numItems[numItems.length - 1].subItems || [];
            numItems[numItems.length - 1].subItems.push(subContent);
          }
          i++;
        } else if (t === '') {
          break;
        } else {
          break;
        }
      }
      blocks.push('<div class="md-num-list">' + numItems.map((item) =>
        '<div class="md-num-item">' +
        '<span class="md-num">' + item.num + '</span>' +
        '<span class="md-num-content">' + formatInline(item.content) +
        (item.subItems?.length ? '<div class="md-sub-list">' + item.subItems.map(s =>
          '<div class="md-sub-item"><span class="md-dot-sm"></span>' + formatInline(s) + '</div>'
        ).join('') + '</div>' : '') +
        '</span></div>'
      ).join('') + '</div>');
      continue;
    }

    if (/^[-*•]\s/.test(trimmed)) {
      const bulletItems = [];
      while (i < lines.length) {
        const l = lines[i];
        const t = l.trim();
        const indent = (l.match(/^(\s*)/) || [''])[1].length;
        const bulletMatch = t.match(/^[-*•]\s+(.*)$/);
        if (bulletMatch && indent < 2) {
          bulletItems.push({ content: bulletMatch[1], sub: false });
          i++;
        } else if (indent >= 2 && t && bulletItems.length > 0) {
          const subContent = t.replace(/^[-*•]\s*/, '');
          if (bulletItems.length) {
            bulletItems[bulletItems.length - 1].subItems = bulletItems[bulletItems.length - 1].subItems || [];
            bulletItems[bulletItems.length - 1].subItems.push(subContent);
          }
          i++;
        } else if (t === '') {
          break;
        } else {
          break;
        }
      }
      blocks.push('<div class="md-bullet-list">' + bulletItems.map((item) =>
        '<div class="md-bullet-item">' +
        '<span class="md-dot"></span>' +
        '<span class="md-bullet-content">' + formatInline(item.content) +
        (item.subItems?.length ? '<div class="md-sub-list">' + item.subItems.map(s =>
          '<div class="md-sub-item"><span class="md-dot-sm"></span>' + formatInline(s) + '</div>'
        ).join('') + '</div>' : '') +
        '</span></div>'
      ).join('') + '</div>');
      continue;
    }

    blocks.push('<p class="md-para">' + formatInline(trimmed) + '</p>');
    i++;
  }

  return blocks.join('');
}

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${isUser ? 'bg-gradient-to-br from-accent-gold to-accent-orange' : 'bg-dark-surface2'}`}>
        {isUser ? <User className="w-4 h-4 text-dark-bg" /> : (
          <span className="text-sm font-serif text-accent-gold">DQ</span>
        )}
      </div>
      <div className={`flex-1 min-w-0 max-w-[85%] ${isUser ? 'text-right' : ''}`}>
        <div className={`
          inline-block px-4 py-3 rounded-2xl
          ${isUser ? 'bg-gradient-to-br from-accent-gold/20 to-accent-orange/20 border border-accent-gold/30' : 'bg-dark-surface2 border border-dark-border'}
        `}>
          {message.error ? (
            <p className="text-status-error text-sm">{message.error}</p>
          ) : message.text ? (
            <div
              className="md-content text-text-primary text-sm leading-relaxed max-w-none"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(message.text) }}
            />
          ) : null}
        </div>
        {!isUser && message.sources?.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-xs text-text-muted mb-2">Sources:</p>
            <div className="flex flex-wrap gap-2">
              {message.sources.map((s, i) => (
                <SourceChip key={i} source={s} index={i} />
              ))}
            </div>
          </div>
        )}
        {!isUser && message.expandedTerms?.length > 0 && (
          <p className="mt-2 text-xs text-text-muted">
            Query terms: {message.expandedTerms.join(', ')}
          </p>
        )}
      </div>
    </div>
  );
}
