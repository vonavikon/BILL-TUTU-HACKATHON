import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ChatPanel from './ChatPanel';
import type { ChatMessage } from '../mocks/types';

const messages: ChatMessage[] = [
  { id: '1', role: 'agent', text: 'Привет! Куда едете?' },
  { id: '2', role: 'user', text: 'Сочи' },
];

describe('ChatPanel', () => {
  it('renders visible messages', () => {
    render(<ChatPanel messages={messages} status={null} onSend={() => {}} />);
    expect(screen.getByText('Привет! Куда едете?')).toBeInTheDocument();
    expect(screen.getByText('Сочи')).toBeInTheDocument();
  });

  it('hides messages with empty text', () => {
    const withEmpty: ChatMessage[] = [...messages, { id: '3', role: 'agent', text: '' }];
    const { container } = render(<ChatPanel messages={withEmpty} status={null} onSend={() => {}} />);
    const bubbles = container.querySelectorAll('div[style*="max-width"]');
    expect(bubbles.length).toBe(2);
    expect(screen.getByText('Привет! Куда едете?')).toBeInTheDocument();
    expect(screen.getByText('Сочи')).toBeInTheDocument();
  });

  it('calls onSend with typed text and clears the input', async () => {
    const onSend = vi.fn();
    render(<ChatPanel messages={messages} status={null} onSend={onSend} />);
    const user = userEvent.setup();
    const input = screen.getByLabelText('Сообщение агенту') as HTMLInputElement;

    await user.type(input, 'Через месяц');
    await user.click(screen.getByRole('button', { name: 'Отправить сообщение' }));

    expect(onSend).toHaveBeenCalledWith('Через месяц');
    expect(input.value).toBe('');
  });

  it('does not call onSend for empty input', async () => {
    const onSend = vi.fn();
    render(<ChatPanel messages={messages} status={null} onSend={onSend} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Отправить сообщение' }));
    expect(onSend).not.toHaveBeenCalled();
  });

  it('renders suggestion chips from the last agent message and sends the chip text on click', async () => {
    const withSuggestions: ChatMessage[] = [
      ...messages,
      { id: '3', role: 'agent', text: 'Откуда планируете выезжать?', suggestions: ['Москва', 'Санкт-Петербург'] },
    ];
    const onSend = vi.fn();
    render(<ChatPanel messages={withSuggestions} status={null} onSend={onSend} />);
    const user = userEvent.setup();

    expect(screen.getByRole('button', { name: 'Москва' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Санкт-Петербург' }));

    expect(onSend).toHaveBeenCalledWith('Санкт-Петербург');
  });

  it('renders a thinking bubble with animated dots while the agent is working', () => {
    const { container } = render(
      <ChatPanel messages={messages} status="Ищу билеты…" onSend={() => {}} />,
    );
    expect(screen.getByText('Ищу билеты…')).toBeInTheDocument();
    expect(container.querySelector('.thinking-dots')).toBeInTheDocument();
  });

  it('does not render suggestion chips once the last message is from the user', () => {
    const answered: ChatMessage[] = [
      ...messages,
      { id: '3', role: 'agent', text: 'Откуда планируете выезжать?', suggestions: ['Москва'] },
      { id: '4', role: 'user', text: 'Москва' },
    ];
    render(<ChatPanel messages={answered} status={null} onSend={() => {}} />);
    expect(screen.queryByRole('button', { name: 'Москва' })).not.toBeInTheDocument();
  });
});
