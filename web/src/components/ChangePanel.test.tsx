import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ChangePanel from './ChangePanel';
import type { AlternativeOption } from '../mocks/alternatives';

interface Dummy {
  label: string;
}

const options: AlternativeOption<Dummy>[] = [
  { id: 'a', title: 'Option A', meta: 'meta a', price: 500, currency: '₽', data: { label: 'a' } },
  { id: 'b', title: 'Option B', meta: 'meta b', price: 100, currency: '₽', data: { label: 'b' } },
];

describe('ChangePanel', () => {
  it('renders every option and marks the selected one', () => {
    render(<ChangePanel title="Test panel" options={options} selectedId="a" onSelect={() => {}} onClose={() => {}} />);
    expect(screen.getByText('Option A')).toBeInTheDocument();
    expect(screen.getByText('Option B')).toBeInTheDocument();
    expect(screen.getByText('Выбрано')).toBeInTheDocument();
  });

  it('calls onSelect with the chosen option', async () => {
    const onSelect = vi.fn();
    render(<ChangePanel title="Test panel" options={options} selectedId="a" onSelect={onSelect} onClose={() => {}} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Выбрать' }));

    expect(onSelect).toHaveBeenCalledWith(options[1]);
  });

  it('sorts by price when the cheapest filter is selected', async () => {
    render(<ChangePanel title="Test panel" options={options} selectedId="a" onSelect={() => {}} onClose={() => {}} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Сначала дешёвые' }));

    const titles = screen.getAllByText(/Option [AB]/).map((el) => el.textContent);
    expect(titles).toEqual(['Option B', 'Option A']);
  });

  it('calls onClose when the back button is clicked', async () => {
    const onClose = vi.fn();
    render(<ChangePanel title="Test panel" options={options} selectedId="a" onSelect={() => {}} onClose={onClose} />);
    await userEvent.click(screen.getByRole('button', { name: 'Назад' }));
    expect(onClose).toHaveBeenCalled();
  });
});
