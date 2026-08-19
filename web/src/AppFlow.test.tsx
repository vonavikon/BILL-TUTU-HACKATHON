import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';

function ok(body: unknown): Response {
  return { ok: true, json: async () => body } as unknown as Response;
}

describe('App flow', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('navigates from Home to the trip chat and seeds the typed message', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string): Promise<Response> => {
        if (url === '/api/session') return ok({ session_id: 's1' });
        if (url === '/api/chat') {
          return ok({ reply: 'Нашёл поезда', state: { stage: 'results', offers: [] } });
        }
        return { ok: false, status: 404, json: async () => ({}) } as unknown as Response;
      }),
    );

    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    );

    const input = screen.getByPlaceholderText('Куда хотите поехать?');
    await user.type(input, 'Сочи');
    await user.keyboard('{Enter}');

    // Тот же текст попал в чат как первое сообщение пользователя.
    expect(await screen.findByText('Сочи')).toBeInTheDocument();
    // Бэкенд ответил — реплика агента отобразилась.
    expect(await screen.findByText('Нашёл поезда')).toBeInTheDocument();
  });
});
