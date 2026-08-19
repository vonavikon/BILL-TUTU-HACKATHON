export type ChecklistKey = 'destination' | 'origin' | 'travelers' | 'dates' | 'preferences';

export interface ChecklistState {
  destination: boolean;
  origin: boolean;
  travelers: boolean;
  dates: boolean;
  preferences: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  text: string;
  fills?: Partial<Record<ChecklistKey, boolean>>;
  suggestions?: string[];
}

export interface DestinationFields {
  city: string;
}

export interface OriginFields {
  city: string;
}

export interface TravelersFields {
  count: number;
  composition: 'один' | 'с партнёром' | 'с семьёй' | 'компания друзей';
}

export interface DatesFields {
  value: string;
}

export interface PreferencesFields {
  value: string;
}

export interface ChecklistFieldValues {
  destination: DestinationFields | null;
  origin: OriginFields | null;
  travelers: TravelersFields | null;
  dates: DatesFields | null;
  preferences: PreferencesFields | null;
}

export const EMPTY_FIELD_VALUES: ChecklistFieldValues = {
  destination: null,
  origin: null,
  travelers: null,
  dates: null,
  preferences: null,
};
