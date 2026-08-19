import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import TrainCard from './TrainCard';
import TariffCard from './TariffCard';
import SeatMap from './SeatMap';
import PriceFooter from './PriceFooter';
import { MOCK_TRAIN, MOCK_TARIFF, MOCK_SEAT, MOCK_SEATMAP } from '../mocks/trip';

describe('TrainCard', () => {
  it('renders departure and arrival stations', () => {
    render(<TrainCard train={MOCK_TRAIN} />);
    expect(screen.getByText(MOCK_TRAIN.fromStation)).toBeInTheDocument();
    expect(screen.getByText(MOCK_TRAIN.toStation)).toBeInTheDocument();
  });
});

describe('TariffCard', () => {
  it('renders price and refundable status', () => {
    render(<TariffCard tariff={MOCK_TARIFF} />);
    expect(screen.getByText(`${MOCK_TARIFF.price} ${MOCK_TARIFF.currency}`)).toBeInTheDocument();
    expect(screen.getByText('Возвратный тариф')).toBeInTheDocument();
  });
});

describe('SeatMap', () => {
  it('highlights the recommended seat and shows the explanation', () => {
    render(<SeatMap cells={MOCK_SEATMAP} seat={MOCK_SEAT} />);
    const recommendedCell = screen.getByTestId(`seat-${MOCK_SEAT.seatNumber}`);
    expect(recommendedCell).toHaveTextContent(String(MOCK_SEAT.seatNumber));
    expect(screen.getByText(MOCK_SEAT.explanation)).toBeInTheDocument();
  });
});

describe('SeatMap interactive mode', () => {
  it('calls onSelectSeat with the clicked seat number when provided', async () => {
    const onSelectSeat = vi.fn();
    render(<SeatMap cells={MOCK_SEATMAP} seat={MOCK_SEAT} onSelectSeat={onSelectSeat} />);
    await userEvent.click(screen.getByTestId('seat-22'));
    expect(onSelectSeat).toHaveBeenCalledWith(22);
  });

  it('disables occupied, non-recommended seats', () => {
    render(<SeatMap cells={MOCK_SEATMAP} seat={MOCK_SEAT} onSelectSeat={() => {}} />);
    expect(screen.getByTestId('seat-21')).toBeDisabled();
  });
});

describe('PriceFooter', () => {
  it('renders price and calls onCheckout when clicked', async () => {
    const onCheckout = vi.fn();
    render(<PriceFooter price={4200} currency="₽" onCheckout={onCheckout} />);
    expect(screen.getByText('4200 ₽')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Перейти в корзину' }));
    expect(onCheckout).toHaveBeenCalled();
  });
});
