import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TripSummaryCard from './TripSummaryCard';

describe('TripSummaryCard', () => {
  it('renders the title and only the meta items that have data', () => {
    render(<TripSummaryCard title="Москва → Сочи" origin="Москва" dates="Через месяц" />);
    expect(screen.getByText('Москва → Сочи')).toBeInTheDocument();
    expect(screen.getByText('из Москва')).toBeInTheDocument();
    expect(screen.getByText('Через месяц')).toBeInTheDocument();
    expect(screen.queryByText(/·/)).not.toBeInTheDocument();
  });

  it('renders travelers and preferences when provided', () => {
    render(
      <TripSummaryCard
        title="Москва → Сочи"
        travelers="1 · один"
        preferences="Бюджетно"
      />,
    );
    expect(screen.getByText('1 · один')).toBeInTheDocument();
    expect(screen.getByText('Бюджетно')).toBeInTheDocument();
  });
});
