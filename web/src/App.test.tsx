import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders the home route by default', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Куда едем в этот раз/i)).toBeInTheDocument();
  });
});
