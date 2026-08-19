import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import AviaCard from './AviaCard';
import BusCard from './BusCard';
import EtrainCard from './EtrainCard';
import HotelCard from './HotelCard';
import MultitransportCard from './MultitransportCard';
import { MOCK_AVIA, MOCK_BUS, MOCK_ETRAIN, MOCK_HOTEL, MOCK_MULTITRANSPORT } from '../mocks/cards';

describe('AviaCard', () => {
  it('renders route, price and calls onChange', async () => {
    const onChange = vi.fn();
    render(<AviaCard offer={MOCK_AVIA} onChange={onChange} />);
    expect(screen.getByText(MOCK_AVIA.fromCode)).toBeInTheDocument();
    expect(screen.getByText(MOCK_AVIA.toCode)).toBeInTheDocument();
    expect(
      screen.getByText((_, el) => el?.textContent === `${MOCK_AVIA.price.toLocaleString('ru-RU')} ${MOCK_AVIA.currency}`),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Изменить' }));
    expect(onChange).toHaveBeenCalled();
  });
});

describe('BusCard', () => {
  it('renders carrier and route', () => {
    render(<BusCard offer={MOCK_BUS} />);
    expect(screen.getByText(MOCK_BUS.carrier)).toBeInTheDocument();
    expect(screen.getByText(`${MOCK_BUS.fromStation} → ${MOCK_BUS.toStation}`)).toBeInTheDocument();
  });
});

describe('EtrainCard', () => {
  it('renders train type and calls onSelect', async () => {
    const onSelect = vi.fn();
    render(<EtrainCard offer={MOCK_ETRAIN} onSelect={onSelect} />);
    expect(screen.getByText(MOCK_ETRAIN.trainType)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Изменить' }));
    expect(onSelect).toHaveBeenCalled();
  });
});

describe('HotelCard', () => {
  it('renders hotel name and rating', () => {
    render(<HotelCard offer={MOCK_HOTEL} />);
    expect(screen.getByText(MOCK_HOTEL.name)).toBeInTheDocument();
    expect(screen.getByText(MOCK_HOTEL.roomName, { exact: false })).toBeInTheDocument();
  });
});

describe('MultitransportCard', () => {
  it('renders every option with its time range', () => {
    render(<MultitransportCard options={MOCK_MULTITRANSPORT} minPrice={990} currency="₽" />);
    for (const option of MOCK_MULTITRANSPORT) {
      expect(screen.getByText(`${option.departure} → ${option.arrival}`)).toBeInTheDocument();
    }
    expect(screen.getByText((_, el) => el?.textContent === 'от 990 ₽')).toBeInTheDocument();
  });
});
