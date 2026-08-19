// API-клиент бэкенда. Контракт повторяет backend/README.md.
// Прод: nginx проксирует /api/ → 127.0.0.1:8000/. Dev: Vite-прокси (vite.config.ts).

export interface BackendTrip {
  origin: string | null;
  destination: string | null;
  departure_date: string | null;
  passengers: number;
  passengers_explicit: boolean;
  preferences: Record<string, unknown>;
}

export interface BackendOffer {
  offer_id: string;
  transport: string;
  carrier: string;
  train_number: string;
  departure_at: string;
  arrival_at: string;
  duration_min: number;
  price: number;
  currency: string;
  seat_categories: Record<string, number>;
  review_rating: number | null;
}

export interface BackendSeat {
  number: string;
  type: string;
  compartment_number: number | null;
  deck: string | null;
  gender: string;
  level: string | null;
  distance_to_nearest_wc_px: number | null;
}

export interface BackendCar {
  car_number: string;
  car_type: string;
  seats: BackendSeat[];
}

export interface BackendSeatmap {
  cars: BackendCar[];
  total_free: number;
}

export interface BackendCheckout {
  url: string;
  kind: string;
}

export interface BackendHotel {
  hotel_id: string;
  name: string;
  stars: number;
  rating: number | null;
  review_count: number;
  address: string;
  photo: string;
  room_name: string;
  price: number;
  currency: string;
  price_basis: string;
  free_cancellation: boolean;
  checkout_url: string;
}

export interface BackendVideo {
  video_id: string;
  title: string;
  channel: string;
  duration: string;
  thumbnail: string;
  url: string;
}

export interface BackendState {
  stage: string; // greeting|clarifying|results|seatmap|checkout|done|error
  trip: BackendTrip;
  offers: BackendOffer[];
  selected_offer: BackendOffer | null;
  seatmap: BackendSeatmap | null;
  checkout: BackendCheckout | null;
  explanation: string | null;
  hotels: BackendHotel[];
  videos: BackendVideo[];
  memory: Record<string, unknown>;
}

export interface ChatResponse {
  reply: string;
  state: BackendState;
}

const BASE = '/api';

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`API ${res.status} на ${path}`);
  }
  return res.json() as Promise<T>;
}

export function createSession(): Promise<{ session_id: string }> {
  return post('/session', {});
}

export function sendChat(sessionId: string, message: string): Promise<ChatResponse> {
  return post('/chat', { session_id: sessionId, message });
}

export function selectSeat(
  sessionId: string,
  carNumber: string,
  seatNumbers: string[],
): Promise<ChatResponse> {
  return post('/select-seat', { session_id: sessionId, car_number: carNumber, seat_numbers: seatNumbers });
}

// NDJSON-стриминг: события {"type":"status","text":...} и финальный
// {"type":"result","reply":...,"state":...}. onStatus вызывается на каждом этапе.
async function streamNDJSON<T extends ChatResponse>(
  path: string,
  body: unknown,
  onStatus: (text: string) => void,
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API ${res.status} на ${path}`);
  if (!res.body) throw new Error('Поток недоступен в этом браузере');

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let result: T | null = null;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      if (!line.trim()) continue;
      const event = JSON.parse(line) as {
        type: string;
        text?: string;
        reply?: string;
        state?: BackendState;
      };
      if (event.type === 'status' && event.text) {
        onStatus(event.text);
      } else if (event.type === 'result') {
        result = { reply: event.reply ?? '', state: event.state! } as T;
      } else if (event.type === 'error') {
        throw new Error(event.text ?? 'Ошибка сервера');
      }
    }
  }

  if (!result) throw new Error('Поток завершился без результата');
  return result;
}

export function sendChatStream(
  sessionId: string,
  message: string,
  onStatus: (text: string) => void,
): Promise<ChatResponse> {
  return streamNDJSON('/chat/stream', { session_id: sessionId, message }, onStatus);
}

export function selectSeatStream(
  sessionId: string,
  carNumber: string,
  seatNumbers: string[],
  onStatus: (text: string) => void,
): Promise<ChatResponse> {
  return streamNDJSON(
    '/select-seat/stream',
    { session_id: sessionId, car_number: carNumber, seat_numbers: seatNumbers },
    onStatus,
  );
}
