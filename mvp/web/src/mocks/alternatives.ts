import type { TariffInfo, TrainInfo } from './trip';
import type { AviaOffer, BusOffer, EtrainOffer, HotelOffer } from './cards';

export interface AlternativeOption<T> {
  id: string;
  title: string;
  meta: string;
  price: number;
  currency: string;
  data: T;
}

export const TRAIN_ALTERNATIVES: AlternativeOption<TrainInfo>[] = [
  {
    id: 'train-sapsan-018a',
    title: 'Сапсан 018А · 20:30 → 00:10',
    meta: 'В пути 3 ч 40 мин · без пересадок',
    price: 4200,
    currency: '₽',
    data: {
      trainNumber: 'Сапсан 018А',
      carrier: 'РЖД',
      fromStation: 'Москва, Ленинградский вокзал',
      toStation: 'Санкт-Петербург, Московский вокзал',
      departure: '20 авг, 20:30',
      arrival: '21 авг, 00:10',
      durationLabel: 'В пути 3 ч 40 мин',
    },
  },
  {
    id: 'train-sapsan-006a',
    title: 'Сапсан 006А · 07:00 → 10:33',
    meta: 'В пути 3 ч 33 мин · без пересадок',
    price: 3900,
    currency: '₽',
    data: {
      trainNumber: 'Сапсан 006А',
      carrier: 'РЖД',
      fromStation: 'Москва, Ленинградский вокзал',
      toStation: 'Санкт-Петербург, Московский вокзал',
      departure: '20 авг, 07:00',
      arrival: '20 авг, 10:33',
      durationLabel: 'В пути 3 ч 33 мин',
    },
  },
  {
    id: 'train-lastochka-802a',
    title: 'Ласточка 802А · 13:45 → 19:58',
    meta: 'В пути 6 ч 13 мин · дешевле',
    price: 2600,
    currency: '₽',
    data: {
      trainNumber: 'Ласточка 802А',
      carrier: 'РЖД',
      fromStation: 'Москва, Ленинградский вокзал',
      toStation: 'Санкт-Петербург, Московский вокзал',
      departure: '20 авг, 13:45',
      arrival: '20 авг, 19:58',
      durationLabel: 'В пути 6 ч 13 мин',
    },
  },
];

export const TARIFF_ALTERNATIVES: AlternativeOption<TariffInfo>[] = [
  {
    id: 'tariff-econom',
    title: 'Эконом',
    meta: 'Невозвратный тариф',
    price: 2100,
    currency: '₽',
    data: { tariffClass: 'Эконом', price: 2100, currency: '₽', refundable: false, conditions: 'Возврат невозможен' },
  },
  {
    id: 'tariff-kupe',
    title: 'Купе',
    meta: 'Возврат без штрафа за 24 часа до отправления',
    price: 4200,
    currency: '₽',
    data: {
      tariffClass: 'Купе',
      price: 4200,
      currency: '₽',
      refundable: true,
      conditions: 'Возврат без штрафа за 24 часа до отправления',
    },
  },
  {
    id: 'tariff-sv',
    title: 'СВ',
    meta: 'Возврат без штрафа в любое время',
    price: 7900,
    currency: '₽',
    data: {
      tariffClass: 'СВ',
      price: 7900,
      currency: '₽',
      refundable: true,
      conditions: 'Возврат без штрафа в любое время',
    },
  },
];

export const AVIA_ALTERNATIVES: AlternativeOption<AviaOffer>[] = [
  {
    id: 'avia-lufthansa',
    title: 'Lufthansa · BEG → EWR',
    meta: '06:20–14:55 · 14ч 35м · 2 пересадки',
    price: 78490,
    currency: '₽',
    data: {
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
    },
  },
  {
    id: 'avia-air-serbia',
    title: 'Air Serbia · BEG → EWR',
    meta: '09:10–19:40 · 13ч 30м · 1 пересадка',
    price: 71200,
    currency: '₽',
    data: {
      carrier: 'Air Serbia',
      fromCode: 'BEG',
      toCode: 'EWR',
      departure: '09:10',
      arrival: '19:40',
      durationLabel: '13ч 30м',
      stopsLabel: '1 пересадка',
      fareClass: 'Economy',
      refundable: false,
      price: 71200,
      currency: '₽',
    },
  },
  {
    id: 'avia-united',
    title: 'United · BEG → EWR',
    meta: '12:00–02:15 · 17ч 15м · 2 пересадки',
    price: 64990,
    currency: '₽',
    data: {
      carrier: 'United',
      fromCode: 'BEG',
      toCode: 'EWR',
      departure: '12:00',
      arrival: '02:15',
      durationLabel: '17ч 15м',
      stopsLabel: '2 пересадки',
      fareClass: 'Economy Basic',
      refundable: false,
      price: 64990,
      currency: '₽',
    },
  },
];

export const BUS_ALTERNATIVES: AlternativeOption<BusOffer>[] = [
  {
    id: 'bus-ecolines',
    title: 'Ecolines · 08:10 → 18:45',
    meta: 'Москва Щёлковская → СПб Обводный канал',
    price: 1890,
    currency: '₽',
    data: {
      carrier: 'Ecolines',
      rating: 4.6,
      fromStation: 'Москва Щёлковская',
      toStation: 'Санкт-Петербург Обводный канал',
      departure: '08:10',
      arrival: '18:45',
      durationLabel: 'в пути 10 ч 35 мин',
      price: 1890,
      currency: '₽',
    },
  },
  {
    id: 'bus-lux-express',
    title: 'Lux Express · 22:00 → 08:20',
    meta: 'Москва Ленинградский → СПб Балтийский',
    price: 2290,
    currency: '₽',
    data: {
      carrier: 'Lux Express',
      rating: 4.8,
      fromStation: 'Москва Ленинградский вокзал',
      toStation: 'Санкт-Петербург Балтийский вокзал',
      departure: '22:00',
      arrival: '08:20',
      durationLabel: 'в пути 10 ч 20 мин',
      price: 2290,
      currency: '₽',
    },
  },
];

export const ETRAIN_ALTERNATIVES: AlternativeOption<EtrainOffer>[] = [
  {
    id: 'etrain-lastochka',
    title: 'Ласточка · 09:12 → 12:47',
    meta: 'в пути 3 ч 35 мин',
    price: 990,
    currency: '₽',
    data: { trainType: 'Ласточка', departure: '09:12', arrival: '12:47', durationLabel: 'в пути 3 ч 35 мин', price: 990, currency: '₽' },
  },
  {
    id: 'etrain-strizh',
    title: 'Стриж · 14:05 → 17:20',
    meta: 'в пути 3 ч 15 мин',
    price: 1450,
    currency: '₽',
    data: { trainType: 'Стриж', departure: '14:05', arrival: '17:20', durationLabel: 'в пути 3 ч 15 мин', price: 1450, currency: '₽' },
  },
];

export const HOTEL_ALTERNATIVES: AlternativeOption<HotelOffer>[] = [
  {
    id: 'hotel-library',
    title: 'Library Hotel by Library Hotel Collection',
    meta: '4★ · 9.6 Отлично · 1 000 отзывов',
    price: 225910,
    currency: '₽',
    data: {
      name: 'Library Hotel by Library Hotel Collection',
      stars: 4,
      rating: 9.6,
      reviewCount: 1000,
      roomName: 'Petite Room, 1 Full Size Bed',
      breakfastIncluded: true,
      freeCancellation: true,
      price: 225910,
      currency: '₽',
    },
  },
  {
    id: 'hotel-sokos',
    title: 'Sokos Hotel Palace Bridge',
    meta: '4★ · 9.1 Отлично · 640 отзывов',
    price: 189000,
    currency: '₽',
    data: {
      name: 'Sokos Hotel Palace Bridge',
      stars: 4,
      rating: 9.1,
      reviewCount: 640,
      roomName: 'Standard Room, 1 Queen Bed',
      breakfastIncluded: true,
      freeCancellation: false,
      price: 189000,
      currency: '₽',
    },
  },
  {
    id: 'hotel-domina',
    title: 'Domina Prestige',
    meta: '5★ · 9.4 Отлично · 320 отзывов',
    price: 268500,
    currency: '₽',
    data: {
      name: 'Domina Prestige',
      stars: 5,
      rating: 9.4,
      reviewCount: 320,
      roomName: 'Deluxe Room, City View',
      breakfastIncluded: true,
      freeCancellation: true,
      price: 268500,
      currency: '₽',
    },
  },
];
