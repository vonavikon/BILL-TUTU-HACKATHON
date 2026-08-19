import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import SeatSummaryCard from './SeatSummaryCard';
import { MOCK_SEAT } from '../mocks/trip';

describe('SeatSummaryCard', () => {
  it('renders the seat summary and explanation', () => {
    render(<SeatSummaryCard seat={MOCK_SEAT} />);
    expect(screen.getByText(`Вагон ${MOCK_SEAT.carNumber} · Место ${MOCK_SEAT.seatNumber}`)).toBeInTheDocument();
    expect(screen.getByText(MOCK_SEAT.explanation)).toBeInTheDocument();
  });

  it('calls onChange when the change button is clicked', async () => {
    const onChange = vi.fn();
    render(<SeatSummaryCard seat={MOCK_SEAT} onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Изменить' }));
    expect(onChange).toHaveBeenCalled();
  });
});
