export interface AviaOffer {
  carrier: string;
  fromCode: string;
  toCode: string;
  departure: string;
  arrival: string;
  durationLabel: string;
  stopsLabel: string;
  fareClass: string;
  refundable: boolean;
  price: number;
  currency: string;
}

export interface BusOffer {
  carrier: string;
  rating: number;
  fromStation: string;
  toStation: string;
  departure: string;
  arrival: string;
  durationLabel: string;
  price: number;
  currency: string;
}

export interface EtrainOffer {
  trainType: string;
  departure: string;
  arrival: string;
  durationLabel: string;
  price: number;
  currency: string;
}

export interface HotelOffer {
  name: string;
  stars: number;
  rating: number;
  reviewCount: number;
  roomName: string;
  breakfastIncluded: boolean;
  freeCancellation: boolean;
  price: number;
  currency: string;
}

export interface MultitransportOption {
  mode: 'avia' | 'rail' | 'bus' | 'etrain';
  modeLabel: string;
  badge: string;
  departure: string;
  arrival: string;
  durationLabel: string;
}

export const MOCK_AVIA: AviaOffer = {
  carrier: 'Lufthansa',
  fromCode: 'BEG',
  toCode: 'EWR',
  departure: '06:20',
  arrival: '14:55',
  durationLabel: '14ч 35м',
  stopsLabel: '2 пересадки',
  fareClass: 'Economy',
  refundable: true,
  price: 78490,
  currency: '₽',
};

export const MOCK_BUS: BusOffer = {
  carrier: 'Ecolines',
  rating: 4.6,
  fromStation: 'Москва Щёлковская',
  toStation: 'Санкт-Петербург Обводный канал',
  departure: '08:10',
  arrival: '18:45',
  durationLabel: 'в пути 10 ч 35 мин',
  price: 1890,
  currency: '₽',
};

export const MOCK_ETRAIN: EtrainOffer = {
  trainType: 'Ласточка',
  departure: '09:12',
  arrival: '12:47',
  durationLabel: 'в пути 3 ч 35 мин',
  price: 990,
  currency: '₽',
};

export const MOCK_HOTEL: HotelOffer = {
  name: 'Library Hotel by Library Hotel Collection',
  stars: 4,
  rating: 9.6,
  reviewCount: 1000,
  roomName: 'Petite Room, 1 Full Size Bed',
  breakfastIncluded: true,
  freeCancellation: true,
  price: 225910,
  currency: '₽',
};

export const MOCK_MULTITRANSPORT: MultitransportOption[] = [
  { mode: 'avia', modeLabel: 'Авиа', badge: 'быстрее всего', departure: '06:20', arrival: '14:55', durationLabel: '14 ч 35 м · 2 пересадки' },
  { mode: 'rail', modeLabel: 'Ж/д', badge: 'дешевле', departure: '23:40', arrival: '07:32', durationLabel: '7 ч 52 м · без пересадок' },
  { mode: 'bus', modeLabel: 'Автобус', badge: '', departure: '08:10', arrival: '18:45', durationLabel: '10 ч 35 м · без пересадок' },
];
