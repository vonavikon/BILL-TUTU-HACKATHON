import type { ChecklistKey } from './types';

export interface ScriptStep {
  agentText: string;
  suggestions: string[];
  fills: Partial<Record<ChecklistKey, boolean>>;
}

export const CHAT_SCRIPT: ScriptStep[] = [
  {
    agentText: 'Откуда планируете выезжать?',
    suggestions: ['Москва', 'Санкт-Петербург', 'Другой город'],
    fills: { destination: true },
  },
  {
    agentText: 'Кто едет?',
    suggestions: ['Один', 'С партнёром', 'С семьёй'],
    fills: { origin: true },
  },
  {
    agentText: 'Когда хотите поехать?',
    suggestions: ['В ближайшие выходные', 'Через месяц', 'Ещё не решили'],
    fills: { travelers: true },
  },
  {
    agentText: 'Что для вас важно в поездке?',
    suggestions: ['Бюджетно', 'С комфортом', 'Быстро добраться'],
    fills: { dates: true },
  },
  {
    agentText: 'Отлично, собрал всё нужное — жмите «Спланировать путешествие».',
    suggestions: [],
    fills: { preferences: true },
  },
];

export const INITIAL_AGENT_MESSAGE =
  'Расскажите, куда хотите поехать — соберу маршрут, билеты и отель под вас.';

export const INITIAL_SUGGESTIONS = ['Сочи', 'Санкт-Петербург', 'Ещё не решили куда'];
