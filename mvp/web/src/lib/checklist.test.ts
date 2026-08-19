import { describe, it, expect } from 'vitest';
import type { ChatMessage } from '../mocks/types';
import { getChecklistState, checklistProgress, canProceed, EMPTY_CHECKLIST } from './checklist';

describe('getChecklistState', () => {
  it('returns all-false state for empty message list', () => {
    expect(getChecklistState([])).toEqual(EMPTY_CHECKLIST);
  });

  it('merges fills from messages in order', () => {
    const messages: ChatMessage[] = [
      { id: '1', role: 'agent', text: 'привет' },
      { id: '2', role: 'user', text: 'Сочи', fills: { destination: true } },
      { id: '3', role: 'user', text: 'Москва', fills: { origin: true } },
    ];
    expect(getChecklistState(messages)).toEqual({
      destination: true,
      origin: true,
      travelers: false,
      dates: false,
      preferences: false,
    });
  });
});

describe('checklistProgress', () => {
  it('counts completed items', () => {
    expect(checklistProgress(EMPTY_CHECKLIST)).toBe(0);
    expect(
      checklistProgress({ destination: true, origin: true, travelers: false, dates: false, preferences: false }),
    ).toBe(2);
  });
});

describe('canProceed', () => {
  it('is false until destination is filled', () => {
    expect(canProceed(EMPTY_CHECKLIST)).toBe(false);
  });

  it('is true once destination is filled, regardless of other fields', () => {
    expect(
      canProceed({ destination: true, origin: false, travelers: false, dates: false, preferences: false }),
    ).toBe(true);
  });
});
