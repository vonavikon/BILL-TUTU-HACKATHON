import type { ChatMessage, ChecklistKey, ChecklistState } from '../mocks/types';

export const EMPTY_CHECKLIST: ChecklistState = {
  destination: false,
  origin: false,
  travelers: false,
  dates: false,
  preferences: false,
};

export function getChecklistState(messages: ChatMessage[]): ChecklistState {
  return messages.reduce<ChecklistState>(
    (state, message) => (message.fills ? { ...state, ...message.fills } : state),
    EMPTY_CHECKLIST,
  );
}

export function checklistProgress(state: ChecklistState): number {
  return Object.values(state).filter(Boolean).length;
}

export function canProceed(state: ChecklistState): boolean {
  return state.destination;
}

export const CHECKLIST_ORDER: ChecklistKey[] = ['destination', 'origin', 'travelers', 'dates', 'preferences'];

export const CHECKLIST_LABELS: Record<ChecklistKey, { title: string; description: string }> = {
  destination: { title: 'Куда', description: 'Направление или город' },
  origin: { title: 'Откуда', description: 'Город вылета или отправления' },
  travelers: { title: 'Кто едет', description: 'Один, с партнёром, с семьёй' },
  dates: { title: 'Когда', description: 'Даты или период поездки' },
  preferences: { title: 'Что важно', description: 'Бюджет, комфорт, скорость' },
};
