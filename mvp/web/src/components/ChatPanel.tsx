import { useState, type FormEvent } from 'react';
import { ArrowUp, Microphone, Paperclip } from '@phosphor-icons/react';
import type { ChatMessage } from '../mocks/types';
import Markdown from './Markdown';

interface ChatPanelProps {
  messages: ChatMessage[];
  status: string | null;
  onSend: (text: string) => void;
}

export default function ChatPanel({ messages, status, onSend }: ChatPanelProps) {
  const [draft, setDraft] = useState('');

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!draft.trim()) return;
    onSend(draft);
    setDraft('');
  }

  const visibleMessages = messages.filter((m) => m.text.length > 0);
  const lastMessageId = visibleMessages[visibleMessages.length - 1]?.id;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {visibleMessages.map((message) => {
          const showSuggestions =
            message.id === lastMessageId && message.role === 'agent' && (message.suggestions?.length ?? 0) > 0;
          return (
            <div key={message.id} style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: message.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div
                className="message-in"
                style={{
                  background: message.role === 'user' ? 'var(--color-primary-tint)' : 'var(--color-agent-bubble)',
                  color: 'var(--color-text)',
                  boxShadow: message.role === 'agent' ? '0 4px 10px rgba(24,28,45,0.06)' : 'none',
                  borderRadius: message.role === 'user' ? '24px 24px 6px 24px' : '6px 24px 24px 24px',
                  padding: '10px 14px',
                  maxWidth: '80%',
                }}
              >
                {message.role === 'agent' ? <Markdown text={message.text} /> : message.text}
              </div>
              {showSuggestions && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', maxWidth: '90%' }}>
                  {message.suggestions!.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => onSend(suggestion)}
                      style={{
                        background: 'var(--color-surface)',
                        color: 'var(--color-text)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '8px 14px',
                        fontSize: 13,
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {status && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div
              className="message-in"
              style={{
                background: 'var(--color-agent-bubble)',
                color: 'var(--color-text-secondary)',
                borderRadius: '6px 24px 24px 24px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                fontSize: 14,
              }}
            >
              {status}
              <span className="thinking-dots" aria-hidden>
                <i />
                <i />
                <i />
              </span>
            </div>
          </div>
        )}
      </div>
      <form
        onSubmit={handleSubmit}
        style={{
          margin: 16,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 4px 10px rgba(24,28,45,0.06)',
          padding: '10px 8px 8px 14px',
        }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Спросите что угодно..."
          aria-label="Сообщение агенту"
          style={{ width: '100%', border: 'none', outline: 'none', fontSize: 14, color: 'var(--color-text)', marginBottom: 6 }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            type="button"
            aria-label="Прикрепить файл"
            style={{ display: 'flex', background: 'none', border: 'none', color: 'var(--color-text-secondary)', padding: 6 }}
          >
            <Paperclip size={16} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button
              type="button"
              aria-label="Голосовой ввод"
              style={{ display: 'flex', background: 'none', border: 'none', color: 'var(--color-text-secondary)', padding: 6 }}
            >
              <Microphone size={16} />
            </button>
            <button
              type="submit"
              aria-label="Отправить сообщение"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--color-primary)',
                color: 'var(--color-on-primary)',
                border: 'none',
                borderRadius: '50%',
                width: 32,
                height: 32,
              }}
            >
              <ArrowUp size={16} weight="bold" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
