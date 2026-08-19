import type { ReactNode } from 'react';

// Компактный рендер подмножества markdown, которое генерит бэкенд:
// заголовки «##», жирный «**...**», ссылки «[текст](url)», списки «-» и «1.».
// Без внешних зависимостей: весь вывод бэкенда укладывается в эти конструкции.

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const re = /(\[([^\]]+)\]\(([^)]+)\))|(\*\*([^*]+)\*\*)/g;
  let last = 0;
  let key = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    if (match[1]) {
      nodes.push(
        <a key={key++} href={match[3]} target="_blank" rel="noreferrer">
          {match[2]}
        </a>,
      );
    } else if (match[4]) {
      nodes.push(<strong key={key++}>{match[5]}</strong>);
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export default function Markdown({ text }: { text: string }) {
  const blocks: ReactNode[] = [];
  const listItems: ReactNode[] = [];
  let listType: 'ul' | 'ol' | null = null;
  let key = 0;

  const flushList = () => {
    if (listType === 'ul') {
      blocks.push(<ul key={key++}>{listItems.splice(0)}</ul>);
    } else if (listType === 'ol') {
      blocks.push(<ol key={key++}>{listItems.splice(0)}</ol>);
    }
    listType = null;
  };

  for (const line of text.split('\n')) {
    const heading = line.match(/^##\s+(.*)/);
    if (heading) {
      flushList();
      blocks.push(<h3 key={key++}>{renderInline(heading[1])}</h3>);
      continue;
    }

    const bullet = line.match(/^[-*]\s+(.*)/);
    if (bullet) {
      if (listType !== 'ul') {
        flushList();
        listType = 'ul';
      }
      listItems.push(<li key={key++}>{renderInline(bullet[1])}</li>);
      continue;
    }

    const ordered = line.match(/^\d+\.\s+(.*)/);
    if (ordered) {
      if (listType !== 'ol') {
        flushList();
        listType = 'ol';
      }
      listItems.push(<li key={key++}>{renderInline(ordered[1])}</li>);
      continue;
    }

    flushList();
    if (line.trim() === '') continue;
    blocks.push(<p key={key++}>{renderInline(line)}</p>);
  }
  flushList();

  return <div className="markdown">{blocks}</div>;
}
