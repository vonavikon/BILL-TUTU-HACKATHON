import type { ComponentProps } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TripPlan from './TripPlan';
import { TripProvider } from '../state/TripContext';
import type { BackendState, BackendOffer, BackendSeatmap } from '../lib/api';

const OFFER: BackendOffer = {
  offer_id: 'o1',
  transport: 'rail',
  carrier: 'РЖД',
  train_number: '018А',
  departure_at: '2026-08-20T20:30:00+03:00',
  arrival_at: '2026-08-21T00:10:00+03:00',
  duration_min: 220,
  price: 4200,
  currency: '₽',
  seat_categories: { COMPARTMENT: 4200 },
  review_rating: 4.7,
};

const SEATMAP: BackendSeatmap = {
  total_free: 1,
  cars: [
    {
      car_number: '7',
      car_type: 'Купе',
      seats: [
        {
          number: '25',
          type: 'LOWER',
          compartment_number: 7,
          deck: null,
          gender: 'MIXED',
          level: 'нижняя',
          distance_to_nearest_wc_px: 400,
        },
      ],
    },
  ],
};

function tripState(stage: string, overrides: Partial<BackendState> = {}): BackendState {
  return {
    stage,
    trip: {
      origin: 'Москва',
      destination: 'Санкт-Петербург',
      departure_date: '2026-08-20',
      passengers: 1,
      passengers_explicit: true,
      preferences: {},
    },
    offers: [],
    selected_offer: null,
    seatmap: null,
    checkout: null,
    explanation: null,
    hotels: [],
    videos: [],
    memory: {},
    ...overrides,
  };
}

function ok(body: unknown): Response {
  return { ok: true, json: async () => body } as unknown as Response;
}

function mockFetch(chatState: BackendState) {
  return vi.fn(async (url: string, _init?: RequestInit): Promise<Response> => {
    if (url === '/api/session') return ok({ session_id: 's1' });
    if (url === '/api/chat') return ok({ reply: 'Нашёл поезда', state: chatState });
    return { ok: false, status: 404, json: async () => ({}) } as unknown as Response;
  });
}

function seededEntries() {
  return [{ pathname: '/trip/abc', state: { firstMessage: 'Москва в Питер' } }];
}

function renderPage(entries: ComponentProps<typeof MemoryRouter>['initialEntries'] = seededEntries()) {
  return render(
    <MemoryRouter initialEntries={entries}>
      <TripProvider>
        <Routes>
          <Route path="/trip/:id" element={<TripPlan />} />
        </Routes>
      </TripProvider>
    </MemoryRouter>,
  );
}

describe('TripPlan', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows the hint when there is no backend state yet', () => {
    renderPage(['/trip/abc']);
    expect(screen.getByText(/Опишите поездку в чате/)).toBeInTheDocument();
  });

  it('renders offers after the backend returns a results state', async () => {
    vi.stubGlobal('fetch', mockFetch(tripState('results', { offers: [OFFER] })));
    renderPage();

    expect(await screen.findByText('Поезд 018А')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Выбрать' })).toBeInTheDocument();
  });

  it('sends the train selection when Выбрать is clicked', async () => {
    const fetchMock = mockFetch(tripState('results', { offers: [OFFER] }));
    vi.stubGlobal('fetch', fetchMock);
    renderPage();
    await screen.findByText('Поезд 018А');

    await userEvent.click(screen.getByRole('button', { name: 'Выбрать' }));

    const chatBodies = fetchMock.mock.calls
      .filter(([url]) => url === '/api/chat')
      .map(([, init]) => JSON.parse(init?.body as string));
    expect(chatBodies[chatBodies.length - 1].message).toBe('Поезд 018А');
  });

  it('renders the seat picker for a seatmap state', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetch(tripState('seatmap', { selected_offer: OFFER, seatmap: SEATMAP })),
    );
    renderPage();

    expect(await screen.findByText('Поезд 018А: выбор места')).toBeInTheDocument();
    expect(screen.getByText('Вагон 7')).toBeInTheDocument();
    expect(screen.getByTitle('нижнее')).toBeInTheDocument();
  });

  it('renders the checkout card with a purchase link', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetch(
        tripState('checkout', {
          checkout: { url: 'https://tutu.ru/x', kind: 'rail' },
          explanation: 'Этот поезд — самый быстрый и дешёвый.',
        }),
      ),
    );
    renderPage();

    expect(await screen.findByText('Этот поезд — самый быстрый и дешёвый.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Перейти к покупке' })).toHaveAttribute(
      'href',
      'https://tutu.ru/x',
    );
  });
});
