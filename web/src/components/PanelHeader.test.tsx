import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import PanelHeader from './PanelHeader';

describe('PanelHeader', () => {
  it('renders the title and calls onClose when the back button is clicked', async () => {
    const onClose = vi.fn();
    render(<PanelHeader title="Test title" onClose={onClose} />);
    expect(screen.getByText('Test title')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Назад' }));
    expect(onClose).toHaveBeenCalled();
  });
});
