import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import type { ChatMessage } from '../mocks/types';
import * as api from '../lib/api';
import type { BackendState, ChatResponse } from '../lib/api';

interface TripState {
  messages: ChatMessage[];
  backendState: BackendState | null;
  loading: boolean;
  status: string | null;
  sendMessage: (text: string) => void;
  selectSeat: (carNumber: string, seatNumbers: string[]) => void;
}

const TripContext = createContext<TripState | null>(null);

let messageId = 0;
function nextId(): string {
  messageId += 1;
  return `msg-${messageId}`;
}

const WELCOME: ChatMessage = {
  id: 'welcome',
  role: 'agent',
  text: 'Расскажите, куда хотите поехать — подберу билеты и объясню выбор.',
};

export function TripProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [backendState, setBackendState] = useState<BackendState | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const sessionRef = useRef<string | null>(null);

  async function ensureSession(): Promise<string> {
    if (sessionRef.current) return sessionRef.current;
    const { session_id } = await api.createSession();
    sessionRef.current = session_id;
    return session_id;
  }

  const applyResponse = useCallback((resp: ChatResponse) => {
    setBackendState(resp.state);
    if (resp.reply) {
      setMessages((prev) => [...prev, { id: nextId(), role: 'agent', text: resp.reply }]);
    }
  }, []);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((prev) => [...prev, { id: nextId(), role: 'user', text: trimmed }]);
    setLoading(true);
    try {
      const sid = await ensureSession();
      let resp: ChatResponse;
      try {
        resp = await api.sendChatStream(sid, trimmed, (t) => setStatus(t));
      } catch {
        resp = await api.sendChat(sid, trimmed); // стрим не сработал — обычный JSON
      }
      applyResponse(resp);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: 'agent', text: 'Не удалось связаться с сервером. Попробуйте ещё раз.' },
      ]);
    } finally {
      setStatus(null);
      setLoading(false);
    }
  }

  async function selectSeat(carNumber: string, seatNumbers: string[]) {
    if (!sessionRef.current) return;
    setLoading(true);
    try {
      let resp: ChatResponse;
      try {
        resp = await api.selectSeatStream(sessionRef.current, carNumber, seatNumbers, (t) => setStatus(t));
      } catch {
        resp = await api.selectSeat(sessionRef.current, carNumber, seatNumbers);
      }
      applyResponse(resp);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: 'agent', text: 'Не удалось выбрать место. Попробуйте ещё раз.' },
      ]);
    } finally {
      setStatus(null);
      setLoading(false);
    }
  }

  const value: TripState = { messages, backendState, loading, status, sendMessage, selectSeat };
  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

export function useTripState() {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error('useTripState must be used within a TripProvider');
  return ctx;
}
