import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ChecklistCard from './ChecklistCard';
import { EMPTY_CHECKLIST } from '../lib/checklist';
import { EMPTY_FIELD_VALUES } from '../mocks/types';

describe('ChecklistCard', () => {
  it('disables the submit button when canSubmit is false', () => {
    render(
      <ChecklistCard
        checklistState={EMPTY_CHECKLIST}
        fieldValues={EMPTY_FIELD_VALUES}
        progress={0}
        canSubmit={false}
        onFieldChange={() => {}}
        onSubmit={() => {}}
      />,
    );
    expect(screen.getByRole('button', { name: 'Спланировать путешествие' })).toBeDisabled();
  });

  it('enables the submit button when canSubmit is true and calls onSubmit', async () => {
    const onSubmit = vi.fn();
    render(
      <ChecklistCard
        checklistState={{ ...EMPTY_CHECKLIST, destination: true }}
        fieldValues={EMPTY_FIELD_VALUES}
        progress={1}
        canSubmit
        onFieldChange={() => {}}
        onSubmit={onSubmit}
      />,
    );
    const button = screen.getByRole('button', { name: 'Спланировать путешествие' });
    expect(button).toBeEnabled();
    await userEvent.click(button);
    expect(onSubmit).toHaveBeenCalled();
  });

  it('expands the destination field and calls onFieldChange with the entered value', async () => {
    const onFieldChange = vi.fn();
    render(
      <ChecklistCard
        checklistState={EMPTY_CHECKLIST}
        fieldValues={EMPTY_FIELD_VALUES}
        progress={0}
        canSubmit={false}
        onFieldChange={onFieldChange}
        onSubmit={() => {}}
      />,
    );
    const user = userEvent.setup();

    await user.click(screen.getByText('Куда'));
    await user.type(screen.getByPlaceholderText('Город или направление'), 'Сочи');
    await user.click(screen.getByRole('button', { name: 'Сохранить' }));

    expect(onFieldChange).toHaveBeenCalledWith('destination', { city: 'Сочи' });
  });

  it('restores a previously saved destination value when the item is reopened', async () => {
    render(
      <ChecklistCard
        checklistState={{ ...EMPTY_CHECKLIST, destination: true }}
        fieldValues={{ ...EMPTY_FIELD_VALUES, destination: { city: 'Сочи' } }}
        progress={1}
        canSubmit={false}
        onFieldChange={() => {}}
        onSubmit={() => {}}
      />,
    );
    const user = userEvent.setup();

    await user.click(screen.getByText('Куда'));

    expect(screen.getByPlaceholderText('Город или направление')).toHaveValue('Сочи');
  });

  it('shows progress count', () => {
    render(
      <ChecklistCard
        checklistState={{ destination: true, origin: true, travelers: false, dates: false, preferences: false }}
        fieldValues={EMPTY_FIELD_VALUES}
        progress={2}
        canSubmit
        onFieldChange={() => {}}
        onSubmit={() => {}}
      />,
    );
    expect(screen.getByText('2/5')).toBeInTheDocument();
  });
});
