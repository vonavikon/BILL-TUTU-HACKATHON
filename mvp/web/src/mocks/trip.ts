export interface TrainInfo {
  trainNumber: string;
  carrier: string;
  fromStation: string;
  toStation: string;
  departure: string;
  arrival: string;
  durationLabel: string;
}

export interface TariffInfo {
  tariffClass: string;
  price: number;
  currency: string;
  refundable: boolean;
  conditions: string;
}

export interface SeatInfo {
  carNumber: number;
  seatNumber: number;
  tier: 'нижняя' | 'верхняя';
  distanceToToilet: 'близко' | 'средне' | 'далеко';
  compartmentGender: 'любой' | 'женское' | 'мужское';
  explanation: string;
}

export interface SeatMapCell {
  seatNumber: number;
  tier: 'нижняя' | 'верхняя';
  recommended: boolean;
  occupied: boolean;
}

export const MOCK_TRAIN: TrainInfo = {
  trainNumber: 'Сапсан 018А',
  carrier: 'РЖД',
  fromStation: 'Москва, Ленинградский вокзал',
  toStation: 'Санкт-Петербург, Московский вокзал',
  departure: '20 авг, 20:30',
  arrival: '21 авг, 00:10',
  durationLabel: 'В пути 3 ч 40 мин',
};

export const MOCK_TARIFF: TariffInfo = {
  tariffClass: 'Купе',
  price: 4200,
  currency: '₽',
  refundable: true,
  conditions: 'Возврат без штрафа за 24 часа до отправления',
};

export const MOCK_SEAT: SeatInfo = {
  carNumber: 7,
  seatNumber: 23,
  tier: 'нижняя',
  distanceToToilet: 'далеко',
  compartmentGender: 'любой',
  explanation:
    'Нижняя полка, дальний от туалета конец вагона — тише и меньше проходящих пассажиров ночью.',
};

export const MOCK_SEATMAP: SeatMapCell[] = [
  { seatNumber: 21, tier: 'нижняя', recommended: false, occupied: true },
  { seatNumber: 22, tier: 'верхняя', recommended: false, occupied: false },
  { seatNumber: 23, tier: 'нижняя', recommended: true, occupied: false },
  { seatNumber: 24, tier: 'верхняя', recommended: false, occupied: true },
  { seatNumber: 25, tier: 'нижняя', recommended: false, occupied: false },
  { seatNumber: 26, tier: 'верхняя', recommended: false, occupied: false },
];
