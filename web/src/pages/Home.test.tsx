import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Home from './Home';

function TripPagePlaceholder() {
  return <div>trip page</div>;
}

function renderHome() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/trip/:id" element={<TripPagePlaceholder />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('Home', () => {
  it('navigates to a trip page when submitting the input', async () => {
    renderHome();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('Куда хотите поехать?'), 'Сочи');
    await user.click(screen.getByRole('button', { name: 'Отправить запрос' }));

    expect(await screen.findByText('trip page')).toBeInTheDocument();
  });

  it('navigates when clicking an example chip', async () => {
    renderHome();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Сочи на майские' }));

    expect(await screen.findByText('trip page')).toBeInTheDocument();
  });
});
