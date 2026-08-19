import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { TripProvider, useTripState } from './TripContext';

function wrapper({ children }: { children: ReactNode }) {
  return <TripProvider>{children}</TripProvider>;
}

function fakeResponse(body: unknown): Response {
  return { ok: true, json: async () => body } as unknown as Response;
}

function mockFetch(chatReply = 'Поезд найден', chatState: unknown = { stage: 'results' }) {
  return vi.fn(async (url: string): Promise<Response> => {
    if (url === '/api/session') return fakeResponse({ session_id: 's1' });
    if (url === '/api/chat') return fakeResponse({ reply: chatReply, state: chatState });
    return { ok: false, status: 404, json: async () => ({}) } as unknown as Response;
  });
}

describe('useTripState', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('starts with a welcome message and no backend state', () => {
    const { result } = renderHook(() => useTripState(), { wrapper });
    expect(result.current.backendState).toBeNull();
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].role).toBe('agent');
  });

  it('sendMessage creates a session, posts to /api/chat and applies the reply', async () => {
    const fetchMock = mockFetch('Поезд найден', { stage: 'results', offers: [] });
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useTripState(), { wrapper });
    await act(async () => {
      result.current.sendMessage('Москва в Питер');
    });

    expect(fetchMock).toHaveBeenCalledWith('/api/session', expect.anything());
    expect(fetchMock).toHaveBeenCalledWith('/api/chat', expect.anything());
    expect(result.current.backendState?.stage).toBe('results');
    expect(result.current.messages.map((m) => m.text)).toContain('Поезд найден');
  });

  it('ignores empty messages and does not hit the API', async () => {
    const fetchMock = mockFetch();
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useTripState(), { wrapper });
    const before = result.current.messages.length;
    await act(async () => {
      result.current.sendMessage('   ');
    });

    expect(result.current.messages.length).toBe(before);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
